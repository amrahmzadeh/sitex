/**
 * GitHub-dakı snapshotdan saytı verilənlər bazasına bərpa edir.
 *
 *   npx tsx scripts/restore-site-from-github.ts <siteId>              # dry-run
 *   npx tsx scripts/restore-site-from-github.ts <siteId> --apply
 *   npx tsx scripts/restore-site-from-github.ts <siteId> <commitSha> --apply
 *   npx tsx scripts/restore-site-from-github.ts <siteId> --apply --owner=<userId>
 *
 * Default olaraq heç nə yazmır — yalnız nəyin bərpa olunacağını göstərir.
 * GitHub-dan gələn məzmun etibarsız sayılır: tema allowlist-dən keçir,
 * səhifə və menyu slug-ları yoxlanılır.
 */

import './load-env';
import { prisma } from '@/lib/db';
import { getSiteSyncConfig } from '@/lib/site-sync/config';
import { GitHubWriter } from '@/lib/site-sync/github-writer';
import { assertSafeSlug, siteRootPath, toSafeFileSegment } from '@/lib/site-sync/paths';
import { sanitizeThemeOverrides } from '@/lib/templates/installer';
import { defaultThemes } from '@/lib/themes';

interface Options {
  siteId: string;
  ref?: string;
  apply: boolean;
  force: boolean;
  ownerId?: string;
}

interface RestoredPage {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface RestoredMenuItem {
  slug: string;
  name: string;
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
}

interface RestoredCategory {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isVisible: boolean;
  items: RestoredMenuItem[];
}

function parseArgs(argv: string[]): Options {
  const positional: string[] = [];
  let apply = false;
  let force = false;
  let ownerId: string | undefined;

  for (const arg of argv) {
    if (arg === '--apply') apply = true;
    else if (arg === '--force') force = true;
    else if (arg.startsWith('--owner=')) ownerId = arg.slice(8) || undefined;
    else if (arg === '--help' || arg === '-h') {
      console.log(
        'İstifadə: npx tsx scripts/restore-site-from-github.ts <siteId> [commitSha] [--apply] [--force] [--owner=<userId>]'
      );
      process.exit(0);
    } else if (!arg.startsWith('--')) positional.push(arg);
  }

  const [siteId, ref] = positional;
  if (!siteId) throw new Error('siteId verilməyib.');

  return { siteId, ref, apply, force, ownerId };
}

function asString(value: unknown, max = 500): string | null {
  return typeof value === 'string' && value.trim() ? value.slice(0, max) : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function parseJson(content: string | undefined): Record<string, unknown> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function readPages(entries: Array<[string, string]>): RestoredPage[] {
  return entries
    .map(([, content], index) => {
      const data = parseJson(content);
      if (!data) return null;
      const rawId = asString(data.id) ?? `page-${index}`;
      return {
        id: toSafeFileSegment(rawId, `page-${index}`),
        name: asString(data.name, 120) ?? rawId,
        enabled: asBoolean(data.enabled, true),
        order: asNumber(data.order) ?? index,
      } satisfies RestoredPage;
    })
    .filter((page): page is RestoredPage => page !== null);
}

function readMenu(data: Record<string, unknown> | null): RestoredCategory[] {
  const categories = Array.isArray(data?.categories) ? data?.categories : [];
  const output: RestoredCategory[] = [];

  categories.forEach((rawCategory, index) => {
    if (!rawCategory || typeof rawCategory !== 'object') return;
    const category = rawCategory as Record<string, unknown>;
    const rawSlug = asString(category.slug) ?? asString(category.name) ?? '';

    let slug: string;
    try {
      slug = assertSafeSlug(rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-'));
    } catch {
      return;
    }

    const items = Array.isArray(category.items) ? category.items : [];
    const parsedItems: RestoredMenuItem[] = [];

    items.forEach((rawItem, itemIndex) => {
      if (!rawItem || typeof rawItem !== 'object') return;
      const item = rawItem as Record<string, unknown>;
      const itemName = asString(item.name, 200) ?? `Məhsul ${itemIndex + 1}`;
      const rawItemSlug = asString(item.slug) ?? itemName;

      let itemSlug: string;
      try {
        itemSlug = assertSafeSlug(rawItemSlug.toLowerCase().replace(/[^a-z0-9-]+/g, '-'));
      } catch {
        return;
      }

      const images = Array.isArray(item.images) ? item.images : [];
      parsedItems.push({
        slug: itemSlug,
        name: itemName,
        description: asString(item.description, 1000),
        longDescription: asString(item.longDescription, 4000),
        price: asNumber(item.price) ?? 0,
        discountPrice: asNumber(item.discountPrice),
        image: asString(item.image, 500),
        video: asString(item.video, 500),
        ingredients: asString(item.ingredients, 1000),
        allergens: asString(item.allergens, 1000),
        portionSize: asString(item.portionSize, 100),
        prepTime: asString(item.prepTime, 100),
        isFeatured: asBoolean(item.isFeatured),
        isNew: asBoolean(item.isNew),
        isPopular: asBoolean(item.isPopular),
        isVisible: asBoolean(item.isVisible, true),
        sortOrder: asNumber(item.sortOrder) ?? itemIndex,
        seoTitle: asString(item.seoTitle, 200),
        seoDescription: asString(item.seoDescription, 500),
        images: images
          .map((rawImage, imageIndex) => {
            if (!rawImage || typeof rawImage !== 'object') return null;
            const image = rawImage as Record<string, unknown>;
            const url = asString(image.url, 500);
            if (!url) return null;
            return {
              url,
              alt: asString(image.alt, 200),
              sortOrder: asNumber(image.sortOrder) ?? imageIndex,
            };
          })
          .filter((image): image is { url: string; alt: string | null; sortOrder: number } => image !== null),
      });
    });

    output.push({
      name: asString(category.name, 200) ?? slug,
      slug,
      description: asString(category.description, 1000),
      image: asString(category.image, 500),
      sortOrder: asNumber(category.sortOrder) ?? index,
      isVisible: asBoolean(category.isVisible, true),
      items: parsedItems,
    });
  });

  return output;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const config = getSiteSyncConfig();
  if (!config.ok) {
    console.error(`✖ ${config.message}`);
    process.exitCode = 1;
    return;
  }

  const writer = GitHubWriter.fromConfig(config.config);
  const ref = options.ref ?? config.config.branch;
  const root = siteRootPath(options.siteId);

  console.log(`Sayt: ${options.siteId}`);
  console.log(`Mənbə: ${config.config.repository}@${ref}`);

  const files = await writer.listFilesAt(ref, root);
  if (files.size === 0) {
    console.error('✖ GitHub-da bu sayt üçün heç bir fayl tapılmadı.');
    process.exitCode = 1;
    return;
  }

  const relative = new Map<string, string>();
  for (const [path, content] of files) {
    relative.set(path.slice(root.length + 1), content);
  }

  const siteData = parseJson(relative.get('site.json'));
  if (!siteData) {
    console.error('✖ site.json oxunmadı və ya düzgün JSON deyil.');
    process.exitCode = 1;
    return;
  }

  const themeData = parseJson(relative.get('theme.json')) ?? {};
  const publishedThemeOverrides = sanitizeThemeOverrides(
    (themeData.published as Record<string, unknown>) ?? {}
  );
  const draftThemeOverrides = sanitizeThemeOverrides(
    (themeData.draft as Record<string, unknown>) ?? {}
  );

  const pageEntries = Array.from(relative.entries()).filter(([path]) =>
    path.startsWith('pages/')
  );
  const pages = readPages(pageEntries);
  const pagesJson = pages as unknown as object;

  const menuFromFile = parseJson(relative.get('content/menu.json'));
  const menuFromPage = pageEntries
    .map(([, content]) => parseJson(content))
    .find((page) => page?.kind === 'page' && page.content && typeof page.content === 'object');
  const menu = readMenu(
    menuFromFile ?? ((menuFromPage?.content as Record<string, unknown> | undefined) ?? null)
  );

  const deletedAt = asString(siteData.deletedAt, 40);
  const totalItems = menu.reduce((sum, category) => sum + category.items.length, 0);

  console.log('\nBərpa planı:');
  console.log(`  · ad: ${asString(siteData.name, 200) ?? '—'}`);
  console.log(`  · slug: ${asString(siteData.slug, 200) ?? '—'}`);
  console.log(`  · tema açarları: ${Object.keys(publishedThemeOverrides).length} (published)`);
  console.log(`  · səhifələr: ${pages.length}`);
  console.log(`  · menyu: ${menu.length} kateqoriya, ${totalItems} məhsul`);
  console.log(`  · fayl sayı: ${files.size}`);

  if (deletedAt) {
    console.log(`\n⚠ Bu sayt GitHub-da silinmiş kimi işarələnib (deletedAt=${deletedAt}).`);
    if (!options.force) {
      console.error('Bərpa üçün --force əlavə edin.');
      process.exitCode = 1;
      return;
    }
  }

  const existing = await prisma.organization.findUnique({
    where: { id: options.siteId },
    include: { website: true },
  });

  if (!existing && !options.ownerId) {
    console.error(
      '\n✖ Sayt DB-də yoxdur. Yenidən yaratmaq üçün sahibin userId-si lazımdır: --owner=<userId>'
    );
    process.exitCode = 1;
    return;
  }

  if (!options.apply) {
    console.log('\nDry-run — heç bir dəyişiklik yazılmadı. Tətbiq üçün --apply əlavə edin.');
    console.log('Qeyd: binary fayllar (şəkillər/videolar) GitHub-da saxlanmır, ona görə media bərpa olunmur.');
    return;
  }

  const publishedTheme = {
    ...((existing?.website?.publishedTheme as Record<string, unknown>) ?? defaultThemes.elegant),
    ...publishedThemeOverrides,
  };
  const draftTheme = {
    ...((existing?.website?.draftTheme as Record<string, unknown>) ?? defaultThemes.elegant),
    ...draftThemeOverrides,
  };

  const orgData = {
    name: asString(siteData.name, 200) ?? existing?.name ?? options.siteId,
    slug: asString(siteData.slug, 120) ?? existing?.slug ?? options.siteId,
    description: asString(siteData.description, 2000),
    email: asString(siteData.publicEmail, 320),
    phone: asString(siteData.publicPhone, 40),
    address: asString(siteData.address, 300),
    city: asString(siteData.city, 120),
    mapUrl: asString(siteData.mapUrl, 500),
    logo: asString(siteData.logo, 500),
    siteCategory: asString(siteData.siteCategory, 80),
    siteSubcategory: asString(siteData.siteSubcategory, 80),
    templateId: asString(siteData.templateId, 120),
    templateVersion: asString(siteData.templateVersion, 40),
  };

  const isPublished = asBoolean(siteData.isPublished);
  const publishedAtRaw = asString(siteData.publishedAt, 40);
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : null;

  await prisma.$transaction(async (tx) => {
    let orgId = options.siteId;

    if (!existing) {
      const created = await tx.organization.create({
        data: {
          id: options.siteId,
          ...orgData,
          memberships: {
            create: { userId: options.ownerId as string, role: 'OWNER' },
          },
        },
        select: { id: true },
      });
      orgId = created.id;
    } else {
      await tx.organization.update({ where: { id: options.siteId }, data: orgData });
    }

    await tx.website.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        publishedTheme,
        draftTheme,
        pagesConfig: pagesJson,
        publishedPages: pagesJson,
        isPublished,
        publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      },
      update: {
        publishedTheme,
        draftTheme,
        pagesConfig: pagesJson,
        publishedPages: pagesJson,
        isPublished,
        publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      },
    });

    for (const category of menu) {
      const savedCategory = await tx.menuCategory.upsert({
        where: { organizationId_slug: { organizationId: orgId, slug: category.slug } },
        create: {
          organizationId: orgId,
          slug: category.slug,
          name: category.name,
          description: category.description,
          image: category.image,
          sortOrder: category.sortOrder,
          isVisible: category.isVisible,
        },
        update: {
          name: category.name,
          description: category.description,
          image: category.image,
          sortOrder: category.sortOrder,
          isVisible: category.isVisible,
        },
      });

      for (const item of category.items) {
        const savedItem = await tx.menuItem.upsert({
          where: { organizationId_slug: { organizationId: orgId, slug: item.slug } },
          create: {
            organizationId: orgId,
            categoryId: savedCategory.id,
            slug: item.slug,
            name: item.name,
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
          },
          update: {
            categoryId: savedCategory.id,
            name: item.name,
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
          },
        });

        await tx.menuItemImage.deleteMany({ where: { menuItemId: savedItem.id } });
        if (item.images.length > 0) {
          await tx.menuItemImage.createMany({
            data: item.images.map((image, index) => ({
              menuItemId: savedItem.id,
              url: image.url,
              alt: image.alt,
              sortOrder: image.sortOrder ?? index,
            })),
          });
        }
      }
    }
  });

  console.log('\n✓ Bərpa tamamlandı.');
  console.log('Qeyd: media faylları bərpa olunmadı (binary fayllar GitHub-a yazılmır).');
}

main()
  .catch((error) => {
    console.error('✖ Bərpa xətası:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
