import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

// POST /api/admin/setup — create first super admin (only works if no super admin exists)
export async function POST(req: Request) {
  try {
    // Check if any super admin already exists
    const existing = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Super Admin artıq mövcuddur' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { email, password, name, setupKey } = body;

    // Require setup key from env
    const expectedKey = process.env.SUPER_ADMIN_SETUP_KEY;
    if (!expectedKey || setupKey !== expectedKey) {
      return NextResponse.json({ error: 'Quraşdırma açarı yanlışdır' }, { status: 403 });
    }

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'E-poçt, şifrə və ad tələb olunur' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Şifrə ən azı 8 simvoldan ibarət olmalıdır' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      // Promote existing user to super admin
      const updated = await prisma.user.update({
        where: { email: normalizedEmail },
        data: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
        select: { id: true, email: true, name: true, role: true },
      });
      return NextResponse.json({ user: updated, message: 'Mövcud istifadəçi Super Admin oldu' });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json({ user, message: 'Super Admin yaradıldı' }, { status: 201 });
  } catch (error) {
    console.error('Super admin setup error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

