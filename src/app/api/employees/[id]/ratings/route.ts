import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

async function getAdminId(user: { id: string; role?: string }) {
  if (user.role === 'SUPER_ADMIN') return null; // super admin: no restriction
  if (user.role === 'USER') return user.id;
  return null; // employees cannot manage ratings
}

// GET /api/employees/[id]/ratings
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    const { id } = await params;
    const user = session.user as { id: string; role?: string };

    // Verify employee belongs to this admin
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return NextResponse.json({ error: 'Əməkdaş tapılmadı' }, { status: 404 });
    if (user.role === 'USER' && employee.adminId !== user.id)
      return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const ratings = await prisma.employeeRating.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ratings });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// POST /api/employees/[id]/ratings
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    const { id } = await params;
    const user = session.user as { id: string; role?: string };

    if (user.role === 'EMPLOYEE') return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return NextResponse.json({ error: 'Əməkdaş tapılmadı' }, { status: 404 });
    if (user.role === 'USER' && employee.adminId !== user.id)
      return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const body = await req.json();
    const stars = Number(body.stars);
    if (!stars || stars < 1 || stars > 5)
      return NextResponse.json({ error: 'Ulduz 1–5 arasında olmalıdır' }, { status: 400 });

    const rating = await prisma.employeeRating.create({
      data: {
        employeeId: id,
        stars,
        note: body.note || null,
        ratedById: user.id,
      },
    });

    return NextResponse.json({ rating }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// DELETE /api/employees/[id]/ratings?ratingId=xxx
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    const { id } = await params;
    const user = session.user as { id: string; role?: string };
    if (user.role === 'EMPLOYEE') return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) return NextResponse.json({ error: 'Əməkdaş tapılmadı' }, { status: 404 });
    if (user.role === 'USER' && employee.adminId !== user.id)
      return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const ratingId = searchParams.get('ratingId');
    if (!ratingId) return NextResponse.json({ error: 'ratingId tələb olunur' }, { status: 400 });

    await prisma.employeeRating.delete({ where: { id: ratingId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

