import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hash } from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkPermission } from '@/lib/permissions';

export const runtime = 'nodejs';

export async function POST(
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
      const allowed = await checkPermission(user.id, user.role, 'employees', 'edit');
      if (!allowed) {
        return NextResponse.json({ error: 'Şifrəni yeniləmək icazəniz yoxdur' }, { status: 403 });
      }
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Əməkdaş tapılmadı' }, { status: 404 });
    }

    if (!isSuperAdmin && user.role === 'USER' && employee.adminId !== user.id) {
      return NextResponse.json({ error: 'Bu əməkdaş sizin hesabınıza aid deyil' }, { status: 403 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Yeni şifrə ən azı 6 simvol olmalıdır' }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employee.userId },
        data: { passwordHash },
      });

      await tx.employeeActivityLog.create({
        data: {
          employeeId: employee.id,
          action: 'PASSWORD_RESET',
          module: 'auth',
          description: `Şifrə admin tərəfindən yeniləndi (${user.id})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Şifrə uğurla yeniləndi' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Şifrə yenilənərkən xəta baş verdi' }, { status: 500 });
  }
}

