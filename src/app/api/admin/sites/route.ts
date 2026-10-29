import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse, logAudit } from '@/lib/admin';
import { prisma } from '@/lib/db';

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

  return NextResponse.json({ sites, total, page, limit });
}

