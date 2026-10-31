import { prisma } from '@/lib/db';
import { SITE_SYNC_LIMITS } from './config';
import {
  assertSafeSiteId,
  fingerprint,
  siteFilePath,
  toSafeFileSegment,
} from './paths';
import { hashSyncFiles, sanitizeForSync } from './sanitizer';

/**
 * Saytın GitHub-a yazılan "snapshot"u.
 *
 * Binary fayllar (şəkillər, videolar) buraya düşmür — MediaAsset.data sahəsi
 * heç vaxt oxunmur. Onların yerinə yalnız URL + metadata + fingerprint yazılır.
 */

export const SITE_SYNC_SCHEMA_VERSION = 1;

export type SiteSyncPayloadErrorCode = 'NOT_FOUND' | 'TOO_LARGE' | 'UNSAFE';

export class SiteSyncPayloadError extends Error {
  code: SiteSyncPayloadErrorCode;

  constructor(message: string, code: SiteSyncPayloadErrorCode) {
    super(message);
    this.name = 'SiteSyncPayloadError';
    this.code = code;
  }
}

export interface SiteSnapshotPage {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface SiteSnapshotMenu {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    sortOrder: number;
    isVisible: boolean;
    items: Array<Record<string, unknown>>;
  }>;
}

export interface SiteSnapshot {
  site: Record<string, unknown> & { id: string; slug: string };
  ownerId: string | null;
  theme: { published: unknown; draft: unknown };
  seo: { title: string | null; description: string | null; ogImage: string | null };
  pages: SiteSnapshotPage[];
  menu: SiteSnapshotMenu | null;
  assets: Array<Record<string, unknown>>;
  socialLinks: Array<Record<string, unknown>>;
  workingHours: Array<Record<string, unknown>>;
  whatsapp: Record<string, unknown> | null;
  deletedAt: string | null;
}

export interface SiteSyncFiles {
  files: Map<string, string>;
  contentHash: string;
  totalBytes: number;
  fileCount: number;
}

export interface ComposeOptions {
  changelogLines?: string[];
  limits?: {
    maxFileBytes: number;
    maxTotalBytes: number;
    maxFiles: number;
    changelogLines: number;
  };
}

function toIso(value: Date | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Səhifə konfiqurasiyasını oxuyur.
 *
 * Köhnə saytlarda `pagesConfig` sütunu JSON MƏTNİ kimi (bir və ya iki dəfə
 * kodlanmış) saxlana bilər — hər iki hal dəstəklənir.
 */
export function readPages(raw: unknown): SiteSnapshotPage[] {
  let value = raw;
  for (let depth = 0; depth < 3 && typeof value === 'string'; depth += 1) {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  const pages: SiteSnapshotPage[] = [];
  value.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const record = entry as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : `page-${index}`;

    pages.push({
      id: toSafeFileSegment(id, `page-${index}`),
      name: typeof record.name === 'string' ? record.name : id,
      enabled: record.enabled !== false,
      order: typeof record.order === 'number' && Number.isFinite(record.order) ? record.order : index,
    });
  });

  return pages;
}

function buildMenu(rawCategories: Array<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isVisible: boolean;
  menuItems: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    longDescription: string | null;
    price: number;
    discountPrice: number | null;
    image: string | null;
    video: string | null;
    ingredients: string | null;
    allergens: string | null;
    portionSize: string | null;
    prepTime: string | null;
    isFeatured: boolean;
    isNew: boolean;
    isPopular: boolean;
    isVisible: boolean;
    sortOrder: number;
    seoTitle: string | null;
    seoDescription: string | null;
    images: Array<{ url: string; alt: string | null; sortOrder: number }>;
  }>;
}>): SiteSnapshotMenu | null {
  if (rawCategories.length === 0) return null;

  return {
    categories: rawCategories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      isVisible: category.isVisible,
      items: category.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        longDescription: item.longDescription,
        price: item.price,
        discountPrice: item.discountPrice,
        image: item.image,
        video: item.video,
        ingredients: item.ingredients,
        allergens: item.allergens,
        portionSize: item.portionSize,
        prepTime: item.prepTime,
        isFeatured: item.isFeatured,
        isNew: item.isNew,
        isPopular: item.isPopular,
        isVisible: item.isVisible,
        sortOrder: item.sortOrder,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        images: item.images.map((image) => ({
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
        })),
      })),
    })),
  };
}

/** Verilənlər bazasından sayt snapshotunu oxuyur. Sayt yoxdursa `null`. */
export async function loadSiteSnapshot(
  siteId: string,
  options: { deletedAt?: Date | null } = {}
): Promise<SiteSnapshot | null> {
  assertSafeSiteId(siteId);

  const org = await prisma.organization.findUnique({
    where: { id: siteId },
    include: {
      website: true,
      whatsappSettings: true,
      socialLinks: { orderBy: { sortOrder: 'asc' } },
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      mediaAssets: {
        orderBy: { createdAt: 'asc' },
        select: {
          filename: true,
          url: true,
          mimeType: true,
          size: true,
          width: true,
          height: true,
          alt: true,
          createdAt: true,
        },
      },
      menuCategories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          menuItems: {
            orderBy: { sortOrder: 'asc' },
            include: { images: { orderBy: { sortOrder: 'asc' } } },
          },
        },
      },
      memberships: {
        where: { role: 'OWNER' },
        select: { userId: true },
        take: 1,
      },
    },
  });

  if (!org) return null;

  const website = org.website;
  const pages = readPages(website?.pagesConfig);

  return {
    site: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo: org.logo,
      currency: org.currency,
      siteCategory: org.siteCategory,
      siteSubcategory: org.siteSubcategory,
      templateId: org.templateId,
      templateVersion: org.templateVersion,
      templateSource: org.templateSource,
      templateAppliedAt: toIso(org.templateAppliedAt),
      // Saytın öz açıq əlaqə məlumatı (onsuz da dərc olunan saytda görünür).
      publicEmail: org.email,
      publicPhone: org.phone,
      address: org.address,
      city: org.city,
      mapUrl: org.mapUrl,
      isPublished: website?.isPublished ?? false,
      publishedAt: toIso(website?.publishedAt),
      createdAt: toIso(org.createdAt),
      updatedAt: toIso(org.updatedAt),
    },
    ownerId: org.memberships[0]?.userId ?? null,
    theme: {
      published: website?.publishedTheme ?? {},
      draft: website?.draftTheme ?? {},
    },
    seo: {
      title: website?.seoTitle ?? null,
      description: website?.seoDescription ?? null,
      ogImage: website?.ogImage ?? null,
    },
    pages,
    menu: buildMenu(org.menuCategories),
    assets: org.mediaAssets.map((asset) => ({
      filename: asset.filename,
      url: asset.url,
      mimeType: asset.mimeType,
      size: asset.size,
      width: asset.width,
      height: asset.height,
      alt: asset.alt,
      createdAt: toIso(asset.createdAt),
      fingerprint: fingerprint(`${asset.url}|${asset.size}|${asset.mimeType}`),
    })),
    socialLinks: org.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      sortOrder: link.sortOrder,
    })),
    workingHours: org.workingHours.map((entry) => ({
      dayOfWeek: entry.dayOfWeek,
      openTime: entry.openTime,
      closeTime: entry.closeTime,
      isClosed: entry.isClosed,
    })),
    whatsapp: org.whatsappSettings
      ? {
          countryCode: org.whatsappSettings.countryCode,
          orderMessage: org.whatsappSettings.orderMessage,
          buttonText: org.whatsappSettings.buttonText,
          isEnabled: org.whatsappSettings.isEnabled,
          // Nömrə saytda açıq göstərilir, ona görə ehtiyat nüsxədə saxlanılır.
          publicPhone: org.whatsappSettings.phoneNumber,
          publicContactPhone: org.whatsappSettings.contactNumber,
        }
      : null,
    deletedAt: toIso(options.deletedAt ?? null),
  };
}

function json(value: unknown): string {
  return `${JSON.stringify(sanitizeForSync(value), null, 2)}\n`;
}

function buildChangelog(lines: string[], limit: number): string {
  const header = [
    '# Changelog',
    '',
    'Bu fayl avtomatik yaradılır — hər GitHub sinxronizasiyası bir sətir əlavə edir.',
    '',
  ];
  const body = lines.slice(0, limit);
  return `${[...header, ...body].join('\n')}\n`;
}

/**
 * Snapshot-dan repository fayllarını qurur. DB-yə toxunmur — test üçün əlverişlidir.
 *
 * Struktur:
 *   sites/<siteId>/site.json
 *   sites/<siteId>/theme.json
 *   sites/<siteId>/pages/<slug>.json
 *   sites/<siteId>/content/menu.json   (menyu məlumatı varsa)
 *   sites/<siteId>/assets.json
 *   sites/<siteId>/CHANGELOG.md
 */
export function composeSiteFiles(
  snapshot: SiteSnapshot,
  options: ComposeOptions = {}
): SiteSyncFiles {
  const siteId = assertSafeSiteId(String(snapshot.site.id));
  const limits = options.limits ?? SITE_SYNC_LIMITS;
  const files = new Map<string, string>();

  files.set(
    siteFilePath(siteId, 'site.json'),
    json({
      schemaVersion: SITE_SYNC_SCHEMA_VERSION,
      kind: 'site',
      ...snapshot.site,
      ownerId: snapshot.ownerId,
      seo: snapshot.seo,
      socialLinks: snapshot.socialLinks,
      workingHours: snapshot.workingHours,
      whatsapp: snapshot.whatsapp,
      deletedAt: snapshot.deletedAt,
    })
  );

  files.set(
    siteFilePath(siteId, 'theme.json'),
    json({
      schemaVersion: SITE_SYNC_SCHEMA_VERSION,
      kind: 'theme',
      siteId,
      published: snapshot.theme.published,
      draft: snapshot.theme.draft,
    })
  );

  const usedNames = new Set<string>();
  const hasMenuPage = snapshot.pages.some((page) => page.id === 'menu');

  snapshot.pages.forEach((page, index) => {
    let segment = toSafeFileSegment(page.id, `page-${index}`);
    if (usedNames.has(segment)) segment = `${segment}-${index}`;
    usedNames.add(segment);

    const content = page.id === 'menu' && snapshot.menu ? snapshot.menu : null;

    files.set(
      siteFilePath(siteId, 'pages', `${segment}.json`),
      json({
        schemaVersion: SITE_SYNC_SCHEMA_VERSION,
        kind: 'page',
        siteId,
        ...page,
        content,
      })
    );
  });

  // Menyu məlumatı var, amma menyu səhifəsi tərifi yoxdursa — məlumat itməsin.
  if (snapshot.menu && !hasMenuPage) {
    files.set(
      siteFilePath(siteId, 'content', 'menu.json'),
      json({
        schemaVersion: SITE_SYNC_SCHEMA_VERSION,
        kind: 'menu',
        siteId,
        orphanedContent: true,
        ...snapshot.menu,
      })
    );
  }

  files.set(
    siteFilePath(siteId, 'assets.json'),
    json({
      schemaVersion: SITE_SYNC_SCHEMA_VERSION,
      kind: 'assets',
      siteId,
      note: 'Binary fayllar GitHub-a yazılmır; yalnız URL, metadata və fingerprint saxlanılır.',
      assets: snapshot.assets,
    })
  );

  files.set(
    siteFilePath(siteId, 'CHANGELOG.md'),
    buildChangelog(options.changelogLines ?? [], limits.changelogLines)
  );

  let totalBytes = 0;
  for (const [path, content] of files) {
    const bytes = Buffer.byteLength(content, 'utf8');
    if (bytes > limits.maxFileBytes) {
      throw new SiteSyncPayloadError(
        `Sync faylı icazə verilən ölçüdən böyükdür: ${path}`,
        'TOO_LARGE'
      );
    }
    totalBytes += bytes;
  }

  if (totalBytes > limits.maxTotalBytes) {
    throw new SiteSyncPayloadError('Saytın sync həcmi 10 MB limitini aşır.', 'TOO_LARGE');
  }
  if (files.size > limits.maxFiles) {
    throw new SiteSyncPayloadError('Saytda sync üçün icazə veriləndən çox fayl var.', 'TOO_LARGE');
  }

  return {
    files,
    contentHash: hashSyncFiles(files),
    totalBytes,
    fileCount: files.size,
  };
}

/** GitHub-da artıq olan CHANGELOG.md məzmunundan sətirləri çıxarır. */
export function parseChangelogLines(content: string | null): string[] {
  if (!content) return [];
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .slice(0, SITE_SYNC_LIMITS.changelogLines);
}
