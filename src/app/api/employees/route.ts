import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hash } from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { employeeCreateSchema } from '@/lib/validations';
import { checkPermission, logEmployeeActivity, SYSTEM_MODULES } from '@/lib/permissions';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const user = session.user as { id: string; role?: string; employeeId?: string | null };
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // Employee permission check
    if (user.role === 'EMPLOYEE') {
      const allowed = await checkPermission(user.id, user.role, 'employees', 'view');
      if (!allowed) {
        return NextResponse.json({ error: 'Bu modula baxmaq icazəniz yoxdur' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status') || '';
    const position = searchParams.get('position') || '';
    const organizationId = searchParams.get('organizationId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    // Multi-tenant isolation: Determine adminId scope
    let adminScopeId = user.id;
    if (user.role === 'EMPLOYEE' && user.employeeId) {
      const selfEmployee = await prisma.employee.findUnique({
        where: { id: user.employeeId },
        select: { adminId: true },
      });
      if (selfEmployee?.adminId) {
        adminScopeId = selfEmployee.adminId;
      }
    }

    const where: any = {};
    if (!isSuperAdmin) {
      where.adminId = adminScopeId;
    }

    if (q) {
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { position: { contains: q } },
        { department: { contains: q } },
        { username: { contains: q } },
      ];
    }

    if (status && ['ACTIVE', 'INACTIVE', 'ON_LEAVE'].includes(status)) {
      where.status = status;
    }

    if (position) {
      where.position = position;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    const [total, employees, statsRaw] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        include: {
          organization: {
            select: { id: true, name: true, slug: true, logo: true },
          },
          permissions: true,
          _count: { select: { activityLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employee.groupBy({
        by: ['status'],
        where: isSuperAdmin ? {} : { adminId: adminScopeId },
        _count: { _all: true },
      }),
    ]);

    const stats = {
      total: statsRaw.reduce((acc, curr) => acc + curr._count._all, 0),
      active: statsRaw.find((s) => s.status === 'ACTIVE')?._count._all || 0,
      inactive: statsRaw.find((s) => s.status === 'INACTIVE')?._count._all || 0,
      onLeave: statsRaw.find((s) => s.status === 'ON_LEAVE')?._count._all || 0,
    };

    return NextResponse.json({
      employees,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      systemModules: SYSTEM_MODULES,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const user = session.user as { id: string; role?: string; employeeId?: string | null };
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // Employee permission check
    if (user.role === 'EMPLOYEE') {
      const allowed = await checkPermission(user.id, user.role, 'employees', 'create');
      if (!allowed) {
        return NextResponse.json({ error: 'Yeni əməkdaş yaratmaq icazəniz yoxdur' }, { status: 403 });
      }
    }

    const body = await req.json();
    const result = employeeCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;
    const emailLower = data.email.toLowerCase().trim();
    const username = data.username ? data.username.trim() : null;

    // Check if email already in use
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          ...(username ? [{ employeeProfile: { username } }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-poçt ünvanı və ya istifadəçi adı artıq qeydiyyatdan keçib' },
        { status: 400 }
      );
    }

    // Determine adminId
    let adminId = user.id;
    if (user.role === 'EMPLOYEE' && user.employeeId) {
      const selfEmployee = await prisma.employee.findUnique({
        where: { id: user.employeeId },
        select: { adminId: true },
      });
      if (selfEmployee?.adminId) {
        adminId = selfEmployee.adminId;
      }
    }

    // If organizationId is provided, verify organization belongs to admin
    if (data.organizationId) {
      if (!isSuperAdmin) {
        const membership = await prisma.membership.findUnique({
          where: {
            userId_organizationId: {
              userId: adminId,
              organizationId: data.organizationId,
            },
          },
        });
        if (!membership) {
          return NextResponse.json(
            { error: 'Seçilmiş sayt sizin hesabınıza aid deyil' },
            { status: 403 }
          );
        }
      }
    }

    const passwordHash = await hash(data.password, 10);

    const employee = await prisma.$transaction(async (tx) => {
      // 1. Create User account for employee
      const newUser = await tx.user.create({
        data: {
          email: emailLower,
          name: data.fullName,
          passwordHash,
          role: 'EMPLOYEE',
          status: data.status === 'INACTIVE' ? 'BANNED' : 'ACTIVE',
        },
      });

      // 2. Create Employee Profile
      const newEmployee = await tx.employee.create({
        data: {
          userId: newUser.id,
          adminId,
          organizationId: data.organizationId || null,
          fullName: data.fullName.trim(),
          email: emailLower,
          username: username || null,
          phone: data.phone?.trim() || null,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          avatarUrl: data.avatarUrl?.trim() || null,
          address: data.address?.trim() || null,
          notes: data.notes?.trim() || null,
          position: data.position?.trim() || null,
          department: data.department?.trim() || null,
          workSchedule: data.workSchedule || 'Tam iş günü',
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          status: data.status,
        },
      });

      // 3. Create Permissions
      if (data.permissions && data.permissions.length > 0) {
        await tx.employeePermission.createMany({
          data: data.permissions.map((p) => ({
            employeeId: newEmployee.id,
            module: p.module,
            canView: p.canView,
            canCreate: p.canCreate,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
            canManage: p.canManage,
          })),
        });
      }

      // 4. Create membership if organizationId is assigned
      if (data.organizationId) {
        await tx.membership.create({
          data: {
            userId: newUser.id,
            organizationId: data.organizationId,
            role: 'EDITOR',
          },
        });
      }

      // 5. Initial activity log
      await tx.employeeActivityLog.create({
        data: {
          employeeId: newEmployee.id,
          action: 'CREATE',
          module: 'employees',
          description: `Əməkdaş hesabı yaradıldı (${data.fullName})`,
        },
      });

      return newEmployee;
    });

    const fullEmployee = await prisma.employee.findUnique({
      where: { id: employee.id },
      include: {
        organization: true,
        permissions: true,
      },
    });

    return NextResponse.json({ employee: fullEmployee }, { status: 201 });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: error?.message || 'Əməkdaş yaradılarkən xəta baş verdi' },
      { status: 500 }
    );
  }
}

