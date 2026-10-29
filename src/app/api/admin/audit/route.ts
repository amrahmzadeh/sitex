import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse } from '@/lib/admin';
import { prisma } from '@/lib/db';

// GET /api/admin/audit — audit log
export async function GET(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 50;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        meta: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}

