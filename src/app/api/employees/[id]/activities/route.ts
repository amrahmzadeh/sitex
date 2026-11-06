import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/permissions';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role?: string };
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (user.role === 'EMPLOYEE') {
      const allowed = await checkPermission(user.id, user.role, 'employees', 'view');
      if (!allowed) {
        return NextResponse.json({ error: 'Fəaliyyət tarixçəsinə baxmaq icazəniz yoxdur' }, { status: 403 });
      }
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Əməkdaş tapılmadı' }, { status: 404 });
    }

    if (!isSuperAdmin && user.role === 'USER' && employee.adminId !== user.id) {
      return NextResponse.json({ error: 'Bu əməkdaş sizin hesabınıza aid deyil' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '30', 10)));

    const activities = await prisma.employeeActivityLog.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

