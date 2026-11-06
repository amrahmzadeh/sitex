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

// GET /api/employees/[id]/work-logs
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    const { id } = await params;
    const user = session.user as { id: string; role?: string };

    const employee = await verifyOwner(id, user);
    if (!employee) return NextResponse.json({ error: 'İcazəsiz' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined;

    const where: any = { employeeId: id };
    if (year && month) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      where.completedAt = { gte: start, lt: end };
    }

    const workLogs = await prisma.employeeWorkLog.findMany({
      where,
      orderBy: { completedAt: 'desc' },
    });
    return NextResponse.json({ workLogs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// POST /api/employees/[id]/work-logs
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
    if (!body.title) return NextResponse.json({ error: 'İş adı tələb olunur' }, { status: 400 });

    const workLog = await prisma.employeeWorkLog.create({
      data: {
        employeeId: id,
        title: body.title,
        description: body.description || null,
        amount: Number(body.amount) || 0,
        completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
        status: body.status || 'PENDING',
      },
    });
    return NextResponse.json({ workLog }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// PATCH /api/employees/[id]/work-logs?logId=xxx  (update status)
export async function PATCH(
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
    const logId = searchParams.get('logId');
    if (!logId) return NextResponse.json({ error: 'logId tələb olunur' }, { status: 400 });

    const body = await req.json();
    const workLog = await prisma.employeeWorkLog.update({
      where: { id: logId },
      data: {
        status: body.status,
        title: body.title,
        description: body.description,
        amount: body.amount !== undefined ? Number(body.amount) : undefined,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
      },
    });
    return NextResponse.json({ workLog });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// DELETE /api/employees/[id]/work-logs?logId=xxx
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
    const logId = searchParams.get('logId');
    if (!logId) return NextResponse.json({ error: 'logId tələb olunur' }, { status: 400 });

    await prisma.employeeWorkLog.delete({ where: { id: logId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

