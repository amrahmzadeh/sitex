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

// GET /api/employees/[id]/salary?year=2026&month=11
// Also handles listing all salary records for an employee
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
    if (year) where.periodYear = year;
    if (month) where.periodMonth = month;

    const salaryRecords = await prisma.employeeSalary.findMany({
      where,
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });

    return NextResponse.json({ salaryRecords });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// POST /api/employees/[id]/salary — Generate or update a salary record for a period
// Body: { year, month, note?, markPaid?, paidAmount? }
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
    const year = Number(body.year);
    const month = Number(body.month);
    if (!year || !month || month < 1 || month > 12)
      return NextResponse.json({ error: 'Düzgün il/ay daxil edin' }, { status: 400 });

    // Calculate period aggregates
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 1);

    const [bonusAgg, penaltyAgg, workLogAgg] = await Promise.all([
      prisma.employeeBonus.aggregate({
        where: { employeeId: id, givenAt: { gte: periodStart, lt: periodEnd } },
        _sum: { amount: true },
      }),
      prisma.employeePenalty.aggregate({
        where: { employeeId: id, incidentAt: { gte: periodStart, lt: periodEnd } },
        _sum: { amount: true },
      }),
      prisma.employeeWorkLog.aggregate({
        where: {
          employeeId: id,
          completedAt: { gte: periodStart, lt: periodEnd },
          status: { in: ['APPROVED', 'PAID'] },
        },
        _sum: { amount: true },
      }),
    ]);

    const baseSalary = employee.baseSalary || 0;
    const bonusTotal = bonusAgg._sum.amount || 0;
    const penaltyTotal = penaltyAgg._sum.amount || 0;
    const workLogTotal = workLogAgg._sum.amount || 0;
    const totalGross = baseSalary + workLogTotal + bonusTotal;
    const totalDeduction = penaltyTotal;
    const totalNet = totalGross - totalDeduction;

    // Upsert — prevent double-creation
    const existing = await prisma.employeeSalary.findUnique({
      where: { employeeId_periodYear_periodMonth: { employeeId: id, periodYear: year, periodMonth: month } },
    });

    const paidAmount = body.markPaid
      ? Number(body.paidAmount) || totalNet
      : (existing?.paidAmount || 0);
    const balance = totalNet - paidAmount;
    const status = body.markPaid ? 'PAID' : (existing?.status || 'PENDING');

    const salary = await prisma.employeeSalary.upsert({
      where: { employeeId_periodYear_periodMonth: { employeeId: id, periodYear: year, periodMonth: month } },
      create: {
        employeeId: id,
        periodYear: year,
        periodMonth: month,
        baseSalary,
        workLogTotal,
        bonusTotal,
        penaltyTotal,
        totalGross,
        totalDeduction,
        totalNet,
        paidAmount,
        balance,
        status: status as any,
        note: body.note || null,
        approvedById: user.id,
        paidAt: body.markPaid ? new Date() : null,
      },
      update: {
        baseSalary,
        workLogTotal,
        bonusTotal,
        penaltyTotal,
        totalGross,
        totalDeduction,
        totalNet,
        paidAmount,
        balance,
        status: status as any,
        note: body.note ?? undefined,
        approvedById: user.id,
        paidAt: body.markPaid ? new Date() : undefined,
      },
    });

    return NextResponse.json({ salary }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// PATCH /api/employees/[id]/salary?salaryId=xxx — update status/note/paidAmount
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
    const salaryId = searchParams.get('salaryId');
    if (!salaryId) return NextResponse.json({ error: 'salaryId tələb olunur' }, { status: 400 });

    const body = await req.json();
    const salary = await prisma.employeeSalary.update({
      where: { id: salaryId },
      data: {
        status: body.status,
        note: body.note,
        paidAmount: body.paidAmount !== undefined ? Number(body.paidAmount) : undefined,
        paidAt: body.status === 'PAID' ? new Date() : undefined,
      },
    });

    // Recalculate balance
    const updatedBalance = salary.totalNet - salary.paidAmount;
    const updated = await prisma.employeeSalary.update({
      where: { id: salaryId },
      data: { balance: updatedBalance },
    });

    return NextResponse.json({ salary: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

