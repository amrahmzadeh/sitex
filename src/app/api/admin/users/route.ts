import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse, logAudit } from '@/lib/admin';
import { prisma } from '@/lib/db';

// GET /api/admin/users — list all users
export async function GET(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status === 'ACTIVE' || status === 'BANNED') {
    where.status = status;
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
        role: true,
        subscriptionExpiry: true,
        maxSites: true,
        _count: { select: { memberships: true } },
      },
    }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

