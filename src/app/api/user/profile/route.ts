import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { compare, hash } from 'bcryptjs';

// GET /api/user/profile - get current authenticated user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        subscriptionExpiry: true,
        maxSites: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

// PATCH /api/user/profile - update name, email, or password
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Name update
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return NextResponse.json({ error: 'Ad boş ola bilməz' }, { status: 400 });
      }
      updateData.name = trimmedName;
    }

    // Email update
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return NextResponse.json({ error: 'Düzgün e-poçt ünvanı daxil edin' }, { status: 400 });
      }

      if (normalizedEmail !== user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existing) {
          return NextResponse.json(
            { error: 'Bu e-poçt ünvanı artıq başqa hesab tərəfindən istifadə olunur' },
            { status: 409 }
          );
        }
        updateData.email = normalizedEmail;
      }
    }

    // Password update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Şifrəni dəyişmək üçün cari şifrənizi daxil edin' },
          { status: 400 }
        );
      }

      const isValid = await compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Cari şifrə yanlışdır' }, { status: 400 });
      }

      if (String(newPassword).length < 6) {
        return NextResponse.json(
          { error: 'Yeni şifrə ən azı 6 simvoldan ibarət olmalıdır' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hash(newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Dəyişiklik yoxdur' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: 'Məlumatlar uğurla yeniləndi',
      user: updatedUser,
      emailChanged: updateData.email !== undefined,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Yenilənmə zamanı xəta baş verdi' }, { status: 500 });
  }
}

