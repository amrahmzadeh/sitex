import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse } from '@/lib/admin';
import { prisma } from '@/lib/db';

// GET /api/admin/stats — dashboard overview stats
export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const now = new Date();

  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    expiredUsers,
    totalSites,
    publishedSites,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE', role: 'USER' } }),
    prisma.user.count({ where: { status: 'BANNED' } }),
    prisma.user.count({
      where: {
        status: 'ACTIVE',
        subscriptionExpiry: { lt: now },
      },
    }),
    prisma.organization.count(),
    prisma.website.count({ where: { isPublished: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    activeUsers,
    bannedUsers,
    expiredUsers,
    totalSites,
    publishedSites,
    unpublishedSites: totalSites - publishedSites,
  });
}

