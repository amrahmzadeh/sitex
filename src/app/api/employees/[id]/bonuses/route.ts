import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

async function verifyOwner(employeeId: string, user: { id: string; role?: string }) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return null;
  if (user.role === 'SUPER_ADMIN') return employee;
  if (user.role === 'USER' && employee.adminId === user.id) return employee;
  return null;
}

// GET /api/employees/[id]/bonuses
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    const { id } = await params;
    const user = session.user as { id: string; role?: string };

    const employee = await verifyOwner(id, user);
    if (!employee) return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const bonuses = await prisma.employeeBonus.findMany({
      where: { employeeId: id },
      orderBy: { givenAt: 'desc' },
    });
    return NextResponse.json({ bonuses });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// POST /api/employees/[id]/bonuses
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

    const employee = await verifyOwner(id, user);
    if (!employee) return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: 'Mükafat adı tələb olunur' }, { status: 400 });

    const bonus = await prisma.employeeBonus.create({
      data: {
        employeeId: id,
        name: body.name,
        reason: body.reason || null,
        amount: Number(body.amount) || 0,
        bonusType: body.bonusType || 'CASH',
        givenAt: body.givenAt ? new Date(body.givenAt) : new Date(),
        description: body.description || null,
        approvedById: user.id,
      },
    });
    return NextResponse.json({ bonus }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// DELETE /api/employees/[id]/bonuses?bonusId=xxx
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

    const employee = await verifyOwner(id, user);
    if (!employee) return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const bonusId = searchParams.get('bonusId');
    if (!bonusId) return NextResponse.json({ error: 'bonusId tələb olunur' }, { status: 400 });

    await prisma.employeeBonus.delete({ where: { id: bonusId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

