import { prisma } from '@/lib/db';
import {
  getSiteSyncConfig,
  getSiteSyncRepository,
  isSiteSyncEnabled,
  SITE_SYNC_LIMITS,
} from './config';
import { GitHubSyncError, GitHubWriter } from './github-writer';
import { assertSafeSiteId, siteFilePath } from './paths';
import {
  composeSiteFiles,
  loadSiteSnapshot,
  parseChangelogLines,
  SiteSyncPayloadError,
} from './payload';
import { hashSyncFiles, sanitizeForSync } from './sanitizer';

/**
 * Sayt → GitHub sinxronizasiya növbəsi.
 *
 * Publish sorğusu heç vaxt GitHub cavabını gözləmir: əvvəlcə DB əməliyyatı
 * tamamlanır, sonra job növbəyə atılır (`after()` ilə fon rejimində emal
 * olunur). GitHub əlçatmaz olsa da publish uğurlu sayılır.
 */

export type SiteSyncTrigger = 'create' | 'publish' | 'manual' | 'backfill' | 'delete';

export type SyncJobOutcome = 'done' | 'failed' | 'retry' | 'skipped';

export interface EnqueueOutcome {
  status: 'queued' | 'deduped' | 'disabled';
  jobId?: string;
  message?: string;
}

export interface QueueResult {
  processed: number;
  done: number;
  failed: number;
  retried: number;
  skipped: number;
  disabled?: boolean;
}

export interface SiteSyncStatusView {
  enabled: boolean;
  configured: boolean;
  reason?: string;
  repository: string | null;
  branch: string;
  pending: number;
  latest: {
    id: string;
    status: string;
    trigger: string;
    attempts: number;
    commitSha: string | null;
    commitUrl: string | null;
    noChanges: boolean;
    lastError: string | null;
    createdAt: string;
    finishedAt: string | null;
  } | null;
  lastSuccess: {
    commitSha: string;
    finishedAt: string | null;
  } | null;
}

const RETRY_DELAY_MS = 15_000;
export const MANUAL_SYNC_COOLDOWN_MS = 60_000;
const REPOSITORY_CHECK_TTL_MS = 10 * 60_000;

let repositoryCheck: { key: string; privateRepo: boolean; checkedAt: number } | null = null;
let drainPromise: Promise<QueueResult> | null = null;

/** Testlər üçün keşləri sıfırlayır. */
export function resetSiteSyncCaches(): void {
  repositoryCheck = null;
  drainPromise = null;
}

function describeError(error: unknown): string {
  if (error instanceof GitHubSyncError || error instanceof SiteSyncPayloadError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return `Sinxronizasiya xətası: ${error.message}`;
  }
  return 'Sinxronizasiya zamanı naməlum xəta baş verdi.';
}

function isRetryable(error: unknown): boolean {
  if (error instanceof GitHubSyncError) return error.retryable;
  if (error instanceof SiteSyncPayloadError) return false;
  return true;
}

async function ensurePrivateRepository(writer: GitHubWriter, repository: string): Promise<void> {
  const now = Date.now();
  if (
    repositoryCheck &&
    repositoryCheck.key === repository &&
    now - repositoryCheck.checkedAt < REPOSITORY_CHECK_TTL_MS
  ) {
    if (!repositoryCheck.privateRepo) {
      throw new GitHubSyncError(
        'GITHUB_SITES_REPO publikdir. Sayt məlumatı yalnız private repository-yə yazıla bilər — sinxronizasiya dayandırıldı.',
        'PUBLIC_REPO'
      );
    }
    return;
  }

  const info = await writer.assertPrivateRepository();
  repositoryCheck = { key: repository, privateRepo: info.private, checkedAt: now };
}

/** Sayt üçün sync işi növbəyə atır. Eyni anda bir aktiv job saxlanılır. */
export async function enqueueSiteSync(input: {
  siteId: string;
  trigger: SiteSyncTrigger;
  requestedBy?: string | null;
}): Promise<EnqueueOutcome> {
  if (!isSiteSyncEnabled()) {
    return { status: 'disabled', message: 'Sinxronizasiya söndürülüb.' };
  }

  let siteId: string;
  try {
    siteId = assertSafeSiteId(input.siteId);
  } catch {
    return { status: 'disabled', message: 'Sayt identifikatoru etibarsızdır.' };
  }

  const existing = await prisma.siteSyncJob.findFirst({
    where: { siteId, status: { in: ['PENDING', 'RUNNING'] } },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (existing) {
    return { status: 'deduped', jobId: existing.id };
  }

  const job = await prisma.siteSyncJob.create({
    data: {
      siteId,
      trigger: input.trigger,
      requestedBy: input.requestedBy ?? null,
      status: 'PENDING',
    },
    select: { id: true },
  });

  return { status: 'queued', jobId: job.id };
}

/** Saytın GitHub-dakı son vəziyyətini oxuyur; fayl yoxdursa `null`. */
async function readDeletedSiteFiles(
  writer: GitHubWriter,
  siteId: string
): Promise<{ files: Map<string, string>; contentHash: string; alreadyDeleted: boolean }> {
  const path = siteFilePath(siteId, 'site.json');
  const existing = await writer.readFile(path);

  let data: Record<string, unknown> = { id: siteId, slug: siteId, name: siteId };
  let alreadyDeleted = false;

  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed && typeof parsed === 'object') {
        data = { ...(parsed as Record<string, unknown>) };
        alreadyDeleted = Boolean(data.deletedAt);
      }
    } catch {
      // Zədələnmiş fayl — minimal qeydlə davam edirik.
    }
  }

  data.deletedAt = alreadyDeleted ? data.deletedAt : new Date().toISOString();

  const files = new Map<string, string>([
    [path, `${JSON.stringify(sanitizeForSync(data), null, 2)}\n`],
  ]);

  return { files, contentHash: hashSyncFiles(files), alreadyDeleted };
}

async function finishJob(
  jobId: string,
  data: {
    status: 'DONE' | 'FAILED' | 'PENDING';
    commitSha?: string | null;
    contentHash?: string | null;
    noChanges?: boolean;
    lastError?: string | null;
  }
): Promise<void> {
  await prisma.siteSyncJob.update({
    where: { id: jobId },
    data: {
      ...data,
      finishedAt: data.status === 'PENDING' ? null : new Date(),
      startedAt: data.status === 'PENDING' ? null : undefined,
    },
  });
}

/** Bir sync işini icra edir. Job əvvəlcə atomik şəkildə "claim" olunur. */
export async function runSyncJob(jobId: string): Promise<SyncJobOutcome> {
  const claim = await prisma.siteSyncJob.updateMany({
    where: { id: jobId, status: 'PENDING' },
    data: { status: 'RUNNING', startedAt: new Date(), attempts: { increment: 1 }, lastError: null },
  });

  if (claim.count === 0) return 'skipped';

  const job = await prisma.siteSyncJob.findUnique({ where: { id: jobId } });
  if (!job) return 'skipped';

  const configResult = getSiteSyncConfig();
  if (!configResult.ok) {
    await finishJob(job.id, { status: 'FAILED', lastError: configResult.message });
    return 'failed';
  }

  const writer = GitHubWriter.fromConfig(configResult.config);

  try {
    await ensurePrivateRepository(writer, configResult.config.repository);

    const isDelete = job.trigger === 'delete';
    const snapshot = isDelete ? null : await loadSiteSnapshot(job.siteId);

    const previousDone = await prisma.siteSyncJob.findFirst({
      where: {
        siteId: job.siteId,
        status: 'DONE',
        commitSha: { not: null },
        id: { not: job.id },
      },
      orderBy: { finishedAt: 'desc' },
      select: { commitSha: true, contentHash: true },
    });

    const doneCount = await prisma.siteSyncJob.count({
      where: { siteId: job.siteId, status: 'DONE', commitSha: { not: null }, id: { not: job.id } },
    });
    const version = doneCount + 1;

    let files: Map<string, string>;
    let contentHash: string;

    if (!snapshot) {
      // Sayt DB-dən silinib (və ya heç tapılmadı) → GitHub-da soft-delete.
      const deleted = await readDeletedSiteFiles(writer, job.siteId);
      files = deleted.files;
      contentHash = deleted.contentHash;

      if (previousDone?.commitSha && previousDone.contentHash === contentHash) {
        await finishJob(job.id, {
          status: 'DONE',
          commitSha: previousDone.commitSha,
          contentHash,
          noChanges: true,
        });
        return 'done';
      }

      const commit = await writer.commitFiles(
        files,
        `site(${job.siteId}): soft-delete by ${job.requestedBy ?? 'system'}`
      );

      await finishJob(job.id, {
        status: 'DONE',
        commitSha: commit.sha,
        contentHash,
        noChanges: false,
      });
      return 'done';
    }

    const changelogPath = siteFilePath(job.siteId, 'CHANGELOG.md');
    const existingChangelog = await writer.readFile(changelogPath);
    const changelogLines = parseChangelogLines(existingChangelog);
    const entry = `- ${new Date().toISOString()} — v${version} (${job.trigger})${
      job.requestedBy ? ` · ${job.requestedBy}` : ''
    }`;

    const composed = composeSiteFiles(snapshot, {
      changelogLines: [entry, ...changelogLines],
      limits: {
        maxFileBytes: configResult.config.maxFileBytes,
        maxTotalBytes: configResult.config.maxTotalBytes,
        maxFiles: configResult.config.maxFiles,
        changelogLines: configResult.config.changelogLines,
      },
    });

    files = composed.files;
    contentHash = composed.contentHash;

    // Idempotentlik: məzmun dəyişməyibsə yeni commit yaradılmır.
    if (previousDone?.commitSha && previousDone.contentHash === contentHash) {
      await finishJob(job.id, {
        status: 'DONE',
        commitSha: previousDone.commitSha,
        contentHash,
        noChanges: true,
      });
      return 'done';
    }

    const commit = await writer.commitFiles(
      files,
      `site(${job.siteId}): publish v${version} by ${job.requestedBy ?? 'system'}`
    );

    await finishJob(job.id, {
      status: 'DONE',
      commitSha: commit.sha,
      contentHash,
      noChanges: false,
    });

    return 'done';
  } catch (error) {
    const message = describeError(error);
    console.error(`[site-sync] job ${job.id} (${job.siteId}) uğursuz:`, message);

    const maxAttempts = configResult.ok ? configResult.config.maxAttempts : SITE_SYNC_LIMITS.maxAttempts;

    if (isRetryable(error) && job.attempts < maxAttempts) {
      await finishJob(job.id, { status: 'PENDING', lastError: message });
      return 'retry';
    }

    await finishJob(job.id, { status: 'FAILED', lastError: message });
    return 'failed';
  }
}

async function drainQueue(limit: number): Promise<QueueResult> {
  const result: QueueResult = {
    processed: 0,
    done: 0,
    failed: 0,
    retried: 0,
    skipped: 0,
  };

  const concurrency = Math.max(1, SITE_SYNC_LIMITS.concurrency);
  const retryCutoff = new Date(Date.now() - RETRY_DELAY_MS);

  while (result.processed < limit) {
    const batchSize = Math.min(concurrency, limit - result.processed);

    const jobs = await prisma.siteSyncJob.findMany({
      where: {
        status: 'PENDING',
        OR: [{ attempts: 0 }, { updatedAt: { lte: retryCutoff } }],
      },
      orderBy: { createdAt: 'asc' },
      take: batchSize,
      select: { id: true },
    });

    if (jobs.length === 0) break;

    const outcomes = await Promise.all(
      jobs.map(async (job) => {
        try {
          return await runSyncJob(job.id);
        } catch (error) {
          console.error('[site-sync] gözlənilməz xəta:', error);
          return 'failed' as SyncJobOutcome;
        }
      })
    );

    result.processed += outcomes.length;
    for (const outcome of outcomes) {
      if (outcome === 'done') result.done += 1;
      else if (outcome === 'failed') result.failed += 1;
      else if (outcome === 'retry') result.retried += 1;
      else result.skipped += 1;
    }

    if (outcomes.every((outcome) => outcome === 'skipped')) break;
  }

  return result;
}

/**
 * Növbəni emal edir. Eyni prosesdə paralel drain işə düşməsin deyə
 * tək promise paylaşılır.
 */
export async function processSyncQueue(limit = 10): Promise<QueueResult> {
  if (!isSiteSyncEnabled()) {
    return { processed: 0, done: 0, failed: 0, retried: 0, skipped: 0, disabled: true };
  }

  if (drainPromise) return drainPromise;

  drainPromise = drainQueue(limit).finally(() => {
    drainPromise = null;
  });

  return drainPromise;
}

/** Manual sinxronlaşdırma üçün cooldown-un qalan millisaniyələri. */
export async function getManualSyncCooldown(siteId: string): Promise<number> {
  const last = await prisma.siteSyncJob.findFirst({
    where: { siteId, trigger: 'manual' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  if (!last) return 0;
  const elapsed = Date.now() - last.createdAt.getTime();
  return Math.max(0, MANUAL_SYNC_COOLDOWN_MS - elapsed);
}

export async function getSiteSyncStatus(
  siteId: string,
  options: { includeRepository?: boolean } = {}
): Promise<SiteSyncStatusView> {
  const configResult = getSiteSyncConfig();
  const repository = getSiteSyncRepository();

  const [latest, lastSuccess, pending] = await Promise.all([
    prisma.siteSyncJob.findFirst({
      where: { siteId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.siteSyncJob.findFirst({
      where: { siteId, status: 'DONE', commitSha: { not: null } },
      orderBy: { finishedAt: 'desc' },
      select: { commitSha: true, finishedAt: true },
    }),
    prisma.siteSyncJob.count({ where: { siteId, status: { in: ['PENDING', 'RUNNING'] } } }),
  ]);

  const commitSha = latest?.commitSha ?? null;
  const includeRepo = options.includeRepository === true && Boolean(repository);

  return {
    enabled: isSiteSyncEnabled(),
    configured: configResult.ok,
    reason: configResult.ok ? undefined : configResult.message,
    repository: includeRepo ? repository : null,
    branch: process.env.GITHUB_SITES_BRANCH?.trim() || 'main',
    pending,
    latest: latest
      ? {
          id: latest.id,
          status: latest.status,
          trigger: latest.trigger,
          attempts: latest.attempts,
          commitSha,
          commitUrl:
            includeRepo && commitSha && repository
              ? `https://github.com/${repository}/commit/${commitSha}`
              : null,
          noChanges: latest.noChanges,
          lastError: latest.lastError,
          createdAt: latest.createdAt.toISOString(),
          finishedAt: latest.finishedAt ? latest.finishedAt.toISOString() : null,
        }
      : null,
    lastSuccess: lastSuccess?.commitSha
      ? {
          commitSha: lastSuccess.commitSha,
          finishedAt: lastSuccess.finishedAt ? lastSuccess.finishedAt.toISOString() : null,
        }
      : null,
  };
}
