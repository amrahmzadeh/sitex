/**
 * Saytların GitHub-a sinxronizasiyası üçün server tərəfli konfiqurasiya.
 *
 * Bu modul yalnız serverdə oxunur. Token heç vaxt frontend-ə, log-a və ya
 * API cavabına düşmür — burada yalnız "token varmı?" sualına cavab verilir.
 */

export type SiteSyncConfigErrorCode =
  | 'DISABLED'
  | 'NOT_CONFIGURED'
  | 'INVALID_REPOSITORY'
  | 'MISSING_TOKEN';

export interface SiteSyncConfig {
  repository: string;
  branch: string;
  token: string;
  apiBaseUrl: string;
  maxFileBytes: number;
  maxTotalBytes: number;
  maxFiles: number;
  concurrency: number;
  maxAttempts: number;
  changelogLines: number;
}

export type SiteSyncConfigResult =
  | { ok: true; config: SiteSyncConfig }
  | { ok: false; code: SiteSyncConfigErrorCode; message: string };

/** GitHub repository formatı: OWNER/REPO */
export const SITE_SYNC_REPO_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;

export const SITE_SYNC_LIMITS = {
  maxFileBytes: 1024 * 1024, // 1 MB — tək JSON faylı
  maxTotalBytes: 10 * 1024 * 1024, // 10 MB — bir sync-in toplam həcmi
  maxFiles: 500,
  concurrency: 2,
  maxAttempts: 3,
  changelogLines: 50,
} as const;

export function isSiteSyncEnabled(): boolean {
  return process.env.SITE_GITHUB_SYNC_ENABLED?.trim().toLowerCase() === 'true';
}

export function getSiteSyncRepository(): string | null {
  const repository = process.env.GITHUB_SITES_REPO?.trim();
  return repository || null;
}

/** UI üçün: funksiya açıqdır və konfiqurasiya tamdır. */
export function isSiteSyncConfigured(): boolean {
  return isSiteSyncEnabled() && getSiteSyncConfig().ok;
}

export function getSiteSyncConfig(): SiteSyncConfigResult {
  if (!isSiteSyncEnabled()) {
    return {
      ok: false,
      code: 'DISABLED',
      message: 'Saytların GitHub sinxronizasiyası söndürülüb (SITE_GITHUB_SYNC_ENABLED).',
    };
  }

  const repository = process.env.GITHUB_SITES_REPO?.trim();
  if (!repository) {
    return {
      ok: false,
      code: 'NOT_CONFIGURED',
      message: 'GITHUB_SITES_REPO dəyişəni təyin edilməyib.',
    };
  }
  if (!SITE_SYNC_REPO_PATTERN.test(repository)) {
    return {
      ok: false,
      code: 'INVALID_REPOSITORY',
      message: 'GITHUB_SITES_REPO dəyəri OWNER/REPO formatında deyil.',
    };
  }

  const branch = process.env.GITHUB_SITES_BRANCH?.trim() || 'main';

  // Private repository məcburidir; token olmadan yazmaq mümkün deyil.
  const token = process.env.GITHUB_SITES_TOKEN?.trim();
  if (!token) {
    return {
      ok: false,
      code: 'MISSING_TOKEN',
      message: 'GITHUB_SITES_TOKEN təyin edilməyib (Contents: Read and write icazəsi lazımdır).',
    };
  }

  return {
    ok: true,
    config: {
      repository,
      branch,
      token,
      apiBaseUrl: process.env.GITHUB_API_URL?.trim() || 'https://api.github.com',
      ...SITE_SYNC_LIMITS,
    },
  };
}

/** Tokenin dəyərini çap etmədən konfiqurasiya xülasəsi (admin UI / log üçün). */
export function getSiteSyncPublicInfo(): {
  enabled: boolean;
  configured: boolean;
  repository: string | null;
  branch: string;
  hasToken: boolean;
  reason?: string;
} {
  const result = getSiteSyncConfig();
  return {
    enabled: isSiteSyncEnabled(),
    configured: result.ok,
    repository: getSiteSyncRepository(),
    branch: process.env.GITHUB_SITES_BRANCH?.trim() || 'main',
    hasToken: Boolean(process.env.GITHUB_SITES_TOKEN?.trim()),
    reason: result.ok ? undefined : result.message,
  };
}
