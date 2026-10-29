import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { getPlatformSetting } from '@/lib/admin';

export async function POST(req: Request) {
  try {
    // Check if registration is enabled
    const regEnabled = await getPlatformSetting('registration_enabled', 'true');
    if (regEnabled === 'false') {
      return NextResponse.json(
        { error: 'Yeni qeydiyyat müvəqqəti dayandırılıb. Zəhmət olmasa sonra yenidən cəhd edin.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bu e-poçt ünvanı ilə artıq hesab mövcuddur' },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Qeydiyyat zamanı xəta baş verdi' },
      { status: 500 }
    );
  }
}

