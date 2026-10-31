import { createHash } from 'node:crypto';

/**
 * Sync edilən fayl yolları üçün validasiya.
 *
 * siteId, slug və səhifə ID-ləri istifadəçi məlumatından gələ bilər, ona görə
 * repository-də yol yaradan hər dəyər buradan keçir: `../`, mütləq yol, `~`,
 * boşluq və nəzarət simvolları rədd olunur.
 */

export class UnsafeSyncPathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeSyncPathError';
  }
}

const SITE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{5,63}$/;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
const BRANCH_PATTERN = /^[A-Za-z0-9._\/-]{1,120}$/;

export function isSafeSiteId(value: unknown): value is string {
  return typeof value === 'string' && SITE_ID_PATTERN.test(value);
}

export function isSafeSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

export function assertSafeSiteId(value: string): string {
  if (!isSafeSiteId(value)) {
    throw new UnsafeSyncPathError(
      'Sayt identifikatoru təhlükəsizlik yoxlamasından keçmədi (yalnız a-z, 0-9 və tire).'
    );
  }
  return value;
}

export function assertSafeSlug(value: string, label = 'slug'): string {
  if (!isSafeSlug(value)) {
    throw new UnsafeSyncPathError(
      `${label} təhlükəsizlik yoxlamasından keçmədi (yalnız a-z, 0-9 və tire).`
    );
  }
  return value;
}

export function assertSafeBranch(value: string): string {
  if (
    !BRANCH_PATTERN.test(value) ||
    value.startsWith('/') ||
    value.endsWith('/') ||
    value.includes('..') ||
    value.includes('//')
  ) {
    throw new UnsafeSyncPathError('GitHub branch adı təhlükəsizlik yoxlamasından keçmədi.');
  }
  return value;
}

/** Slug-u fayl adına uyğunlaşdırır; uyğun olmayan səhifə ID-si üçün sabit ad qaytarır. */
export function toSafeFileSegment(value: string, fallback: string): string {
  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return SLUG_PATTERN.test(normalized) ? normalized : fallback;
}

/** Repository daxilində təhlükəsiz yol qurur. */
export function buildRepoPath(...segments: string[]): string {
  const parts = segments.filter((segment) => segment.length > 0);
  if (parts.length === 0) {
    throw new UnsafeSyncPathError('Boş repository yolu qurula bilməz.');
  }

  for (const part of parts) {
    if (
      part.startsWith('/') ||
      part.includes('\\') ||
      part.includes('\0') ||
      part.split('/').some((piece) => piece === '' || piece === '.' || piece === '..')
    ) {
      throw new UnsafeSyncPathError('Repository yolu təhlükəsizlik yoxlamasından keçmədi.');
    }
  }

  return parts.join('/');
}

export function siteRootPath(siteId: string): string {
  return buildRepoPath('sites', assertSafeSiteId(siteId));
}

export function siteFilePath(siteId: string, ...rest: string[]): string {
  return buildRepoPath(siteRootPath(siteId), ...rest);
}

/** Məzmun üçün qısa, sabit fingerprint (ikili fayl saxlamadan). */
export function fingerprint(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 32);
}
