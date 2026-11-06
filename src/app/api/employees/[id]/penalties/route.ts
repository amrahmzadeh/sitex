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

// GET /api/employees/[id]/penalties
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

    const penalties = await prisma.employeePenalty.findMany({
      where: { employeeId: id },
      orderBy: { incidentAt: 'desc' },
    });
    return NextResponse.json({ penalties });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// POST /api/employees/[id]/penalties
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
    if (!body.reason) return NextResponse.json({ error: 'Səbəb tələb olunur' }, { status: 400 });

    const penalty = await prisma.employeePenalty.create({
      data: {
        employeeId: id,
        reason: body.reason,
        amount: Number(body.amount) || 0,
        penaltyType: body.penaltyType || 'WARNING',
        incidentAt: body.incidentAt ? new Date(body.incidentAt) : new Date(),
        description: body.description || null,
        decidedById: user.id,
      },
    });
    return NextResponse.json({ penalty }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// DELETE /api/employees/[id]/penalties?penaltyId=xxx
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
    const penaltyId = searchParams.get('penaltyId');
    if (!penaltyId) return NextResponse.json({ error: 'penaltyId tələb olunur' }, { status: 400 });

    await prisma.employeePenalty.delete({ where: { id: penaltyId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

