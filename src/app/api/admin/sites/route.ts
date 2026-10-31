import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse, logAudit } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { isSiteSyncEnabled } from '@/lib/site-sync/config';

// GET /api/admin/sites — list all sites
export async function GET(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }

  const [total, sites] = await Promise.all([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        website: { select: { isPublished: true, publishedAt: true } },
        memberships: {
          where: { role: 'OWNER' },
          select: {
            user: { select: { id: true, name: true, email: true } },
          },
          take: 1,
        },
        _count: { select: { menuItems: true, menuCategories: true } },
      },
    }),
  ]);

  // Hər sayt üçün son GitHub sync job-u (yeganə əlavə sorğu).
  const siteIds = sites.map((site) => site.id);
  const jobs = siteIds.length
    ? await prisma.siteSyncJob.findMany({
        where: { siteId: { in: siteIds } },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          siteId: true,
          status: true,
          trigger: true,
          commitSha: true,
          lastError: true,
          noChanges: true,
          finishedAt: true,
          createdAt: true,
        },
      })
    : [];

  const latestBySite = new Map<string, (typeof jobs)[number]>();
  for (const job of jobs) {
    if (!latestBySite.has(job.siteId)) latestBySite.set(job.siteId, job);
  }

  const repository = process.env.GITHUB_SITES_REPO?.trim() || null;

  const enriched = sites.map((site) => {
    const job = latestBySite.get(site.id);
    return {
      ...site,
      sync: job
        ? {
            status: job.status,
            trigger: job.trigger,
            commitSha: job.commitSha,
            commitUrl:
              repository && job.commitSha
                ? `https://github.com/${repository}/commit/${job.commitSha}`
                : null,
            lastError: job.lastError,
            noChanges: job.noChanges,
            finishedAt: job.finishedAt,
            createdAt: job.createdAt,
          }
        : null,
    };
  });

  return NextResponse.json({
    sites: enriched,
    total,
    page,
    limit,
    syncEnabled: isSiteSyncEnabled(),
    repository,
  });
}

