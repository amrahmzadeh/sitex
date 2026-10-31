/**
 * Mövcud saytların hamısını GitHub-a doldurur (backfill).
 *
 *   npx tsx scripts/resync-all-sites.ts --dry-run
 *   npx tsx scripts/resync-all-sites.ts --batch=50
 *   npx tsx scripts/resync-all-sites.ts --from=100 --batch=50   # davam et
 *
 * Skript resumable-dır: yarımçıq qalarsa, çap olunan `--from` dəyəri ilə
 * yenidən başladıla bilər. `enqueueSiteSync` dublikatları özü birləşdirir,
 * ona görə təkrar işə salmaq təhlükəsizdir.
 */

import './load-env';
import { prisma } from '@/lib/db';
import { getSiteSyncConfig } from '@/lib/site-sync/config';
import { enqueueSiteSync, processSyncQueue } from '@/lib/site-sync/sync-service';

interface Options {
  dryRun: boolean;
  batch: number;
  from: number;
  limit: number | null;
}

function parseArgs(argv: string[]): Options {
  const options: Options = { dryRun: false, batch: 50, from: 0, limit: null };

  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg.startsWith('--batch=')) options.batch = Math.max(1, Number(arg.slice(8)) || 50);
    else if (arg.startsWith('--from=')) options.from = Math.max(0, Number(arg.slice(7)) || 0);
    else if (arg.startsWith('--limit=')) {
      const value = Number(arg.slice(8));
      options.limit = Number.isFinite(value) && value > 0 ? value : null;
    } else if (arg === '--help' || arg === '-h') {
      console.log('İstifadə: npx tsx scripts/resync-all-sites.ts [--dry-run] [--batch=50] [--from=0] [--limit=N]');
      process.exit(0);
    }
  }

  return options;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function drainSites(siteIds: string[]): Promise<void> {
  const deadline = Date.now() + 120_000;
  let idleRounds = 0;

  while (Date.now() < deadline) {
    const pending = await prisma.siteSyncJob.count({
      where: { siteId: { in: siteIds }, status: { in: ['PENDING', 'RUNNING'] } },
    });

    if (pending === 0) return;

    const result = await processSyncQueue(Math.max(siteIds.length, 10));
    if (result.processed === 0) {
      idleRounds += 1;
      if (idleRounds >= 3) {
        console.warn(`⚠ ${pending} iş növbədə qaldı (retry gözləyir və ya başqa proses emal edir).`);
        return;
      }
    } else {
      idleRounds = 0;
    }

    await sleep(500);
  }

  console.warn('⚠ Bəzi işlər 120 saniyə ərzində bitmədi; növbə növbəti emalda davam edəcək.');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const config = getSiteSyncConfig();
  if (!config.ok) {
    console.error(`✖ ${config.message}`);
    process.exitCode = 1;
    return;
  }

  const total = await prisma.organization.count();
  const remaining = Math.max(0, total - options.from);
  const target = options.limit ? Math.min(options.limit, remaining) : remaining;

  console.log(`GitHub repository: ${config.config.repository}@${config.config.branch}`);
  console.log(`Sayt sayı: ${total} · başlanğıc: ${options.from} · hədəf: ${target}`);

  if (target === 0) {
    console.log('Sinxronlaşdırılacaq sayt yoxdur.');
    return;
  }

  const preview = await prisma.organization.findMany({
    orderBy: { createdAt: 'asc' },
    skip: options.from,
    take: Math.min(5, target),
    select: { id: true, name: true, slug: true },
  });

  if (options.dryRun) {
    console.log('\nDry-run — yazılacaq saytlar (ilk 5):');
    for (const site of preview) console.log(`  · ${site.slug} (${site.id})`);
    console.log('\nHeç bir dəyişiklik edilmədi. İcra üçün --dry-run olmadan işə salın.');
    return;
  }

  let index = options.from;
  let interrupted = false;
  process.on('SIGINT', () => {
    interrupted = true;
    console.log('\n⏹ Dayandırılır... Davam etmək üçün yuxarıdaki --from dəyərini istifadə edin.');
  });

  let queued = 0;
  let deduped = 0;
  let indexProcessed = 0;

  while (!interrupted && indexProcessed < target) {
    const batchSize = Math.min(options.batch, target - indexProcessed);
    const sites = await prisma.organization.findMany({
      orderBy: { createdAt: 'asc' },
      skip: index,
      take: batchSize,
      select: { id: true, name: true, slug: true },
    });

    if (sites.length === 0) break;

    console.log(`\n▶ Partiya ${index + 1}–${index + sites.length} / ${total}`);

    for (const site of sites) {
      const outcome = await enqueueSiteSync({ siteId: site.id, trigger: 'backfill' });
      if (outcome.status === 'queued') queued += 1;
      else if (outcome.status === 'deduped') deduped += 1;
    }

    await drainSites(sites.map((site) => site.id));

    const jobs = await prisma.siteSyncJob.findMany({
      where: { siteId: { in: sites.map((site) => site.id) }, trigger: 'backfill' },
      orderBy: { createdAt: 'desc' },
      select: { siteId: true, status: true, lastError: true, commitSha: true },
    });

    const latestBySite = new Map<string, (typeof jobs)[number]>();
    for (const job of jobs) {
      if (!latestBySite.has(job.siteId)) latestBySite.set(job.siteId, job);
    }
    const latestJobs = Array.from(latestBySite.values());

    const done = latestJobs.filter((job) => job.status === 'DONE').length;
    const failed = latestJobs.filter((job) => job.status === 'FAILED');
    console.log(`  ✓ ${done}/${sites.length} sinxronlaşdı`);

    for (const job of failed.slice(0, 5)) {
      console.log(`  ✖ ${job.siteId}: ${job.lastError ?? 'naməlum xəta'}`);
    }
    if (failed.length > 5) console.log(`  ✖ və daha ${failed.length - 5} xəta`);

    index += sites.length;
    indexProcessed += sites.length;
  }

  console.log(
    `\nYekun: ${indexProcessed} sayt emal olundu · növbəyə atıldı: ${queued} · artıq növbədə idi: ${deduped}`
  );

  if (interrupted || indexProcessed < remaining) {
    console.log(`Davam etmək üçün: npx tsx scripts/resync-all-sites.ts --from=${index}`);
  }
}

main()
  .catch((error) => {
    console.error('✖ Skript xətası:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
