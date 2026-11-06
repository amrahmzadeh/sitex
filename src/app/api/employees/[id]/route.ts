import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { employeeUpdateSchema } from '@/lib/validations';
import { checkPermission, logEmployeeActivity } from '@/lib/permissions';

export const runtime = 'nodejs';

async function getAuthorizedEmployee(id: string, user: { id: string; role?: string; employeeId?: string | null }) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      organization: true,
      permissions: true,
    },
  });

  if (!employee) return null;

  if (isSuperAdmin) return employee;

  // If user is normal USER (site owner): employee.adminId must match user.id
  if (user.role === 'USER') {
    if (employee.adminId !== user.id) return null;
  }

  // If user is EMPLOYEE: can only view/manage colleagues under the same admin
  if (user.role === 'EMPLOYEE') {
    const callerEmployee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });
    if (!callerEmployee || callerEmployee.adminId !== employee.adminId) return null;
  }

  return employee;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role?: string; employeeId?: string | null };

    if (user.role === 'EMPLOYEE') {
      const allowed = await checkPermission(user.id, user.role, 'employees', 'view');
      if (!allowed) {
        return NextResponse.json({ error: 'Bu modula baxmaq icazəniz yoxdur' }, { status: 403 });
      }
    }

    const employee = await getAuthorizedEmployee(id, user);
    if (!employee) {
      return NextResponse.json({ error: 'Əməkdaş tapılmadı və ya icazəniz yoxdur' }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    console.error('Get employee detail error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role?: string; employeeId?: string | null };

    if (user.role === 'EMPLOYEE') {
      const allowed = await checkPermission(user.id, user.role, 'employees', 'edit');
      if (!allowed) {
        return NextResponse.json({ error: 'Əməkdaş məlumatlarını redaktə etmək icazəniz yoxdur' }, { status: 403 });
      }
    }

    const targetEmployee = await getAuthorizedEmployee(id, user);
    if (!targetEmployee) {
      return NextResponse.json({ error: 'Əməkdaş tapılmadı və ya icazəniz yoxdur' }, { status: 404 });
    }

    const body = await req.json();
    const result = employeeUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;

    // Check email uniqueness if email changed
    if (data.email && data.email.toLowerCase() !== targetEmployee.email.toLowerCase()) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          NOT: { id: targetEmployee.userId },
        },
      });
      if (existingEmail) {
        return NextResponse.json({ error: 'Bu e-poçt ünvanı artıq başqa istifadəçi tərəfindən istifadə edilir' }, { status: 400 });
      }
    }

    // Check username uniqueness if username changed
    if (data.username && data.username !== targetEmployee.username) {
      const existingUsername = await prisma.employee.findFirst({
        where: {
          username: data.username,
          NOT: { id: targetEmployee.id },
        },
      });
      if (existingUsername) {
        return NextResponse.json({ error: 'Bu istifadəçi adı artıq istifadə edilir' }, { status: 400 });
      }
    }

    // Update in transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update User table
      const userUpdate: any = {};
      if (data.fullName) userUpdate.name = data.fullName;
      if (data.email) userUpdate.email = data.email.toLowerCase();
      if (data.status) {
        userUpdate.status = data.status === 'INACTIVE' ? 'BANNED' : 'ACTIVE';
      }

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: targetEmployee.userId },
          data: userUpdate,
        });
      }

      // 2. Update Employee fields
      const employeeUpdate: any = {};
      if (data.fullName !== undefined) employeeUpdate.fullName = data.fullName;
      if (data.email !== undefined) employeeUpdate.email = data.email.toLowerCase();
      if (data.username !== undefined) employeeUpdate.username = data.username || null;
      if (data.phone !== undefined) employeeUpdate.phone = data.phone?.trim() || null;
      if (data.birthDate !== undefined) employeeUpdate.birthDate = data.birthDate ? new Date(data.birthDate) : null;
      if (data.avatarUrl !== undefined) employeeUpdate.avatarUrl = data.avatarUrl?.trim() || null;
      if (data.address !== undefined) employeeUpdate.address = data.address?.trim() || null;
      if (data.notes !== undefined) employeeUpdate.notes = data.notes?.trim() || null;
      if (data.position !== undefined) employeeUpdate.position = data.position?.trim() || null;
      if (data.department !== undefined) employeeUpdate.department = data.department?.trim() || null;
      if (data.workSchedule !== undefined) employeeUpdate.workSchedule = data.workSchedule;
      if (data.startDate !== undefined) employeeUpdate.startDate = data.startDate ? new Date(data.startDate) : null;
      if (data.status !== undefined) employeeUpdate.status = data.status;
      if (data.baseSalary !== undefined) employeeUpdate.baseSalary = data.baseSalary !== null ? Number(data.baseSalary) : null;
      if (data.salaryType !== undefined) employeeUpdate.salaryType = data.salaryType || 'MONTHLY';

      // Handle organization change
      if (data.organizationId !== undefined) {
        employeeUpdate.organizationId = data.organizationId || null;

        // Sync Membership
        await tx.membership.deleteMany({
          where: { userId: targetEmployee.userId },
        });

        if (data.organizationId) {
          await tx.membership.create({
            data: {
              userId: targetEmployee.userId,
              organizationId: data.organizationId,
              role: 'EDITOR',
            },
          });
        }
      }

      const emp = await tx.employee.update({
        where: { id },
        data: employeeUpdate,
      });

      // 3. Update permissions if provided
      if (data.permissions) {
        await tx.employeePermission.deleteMany({
          where: { employeeId: id },
        });

        if (data.permissions.length > 0) {
          await tx.employeePermission.createMany({
            data: data.permissions.map((p) => ({
              employeeId: id,
              module: p.module,
              canView: p.canView,
              canCreate: p.canCreate,
              canEdit: p.canEdit,
              canDelete: p.canDelete,
              canManage: p.canManage,
            })),
          });
        }
      }

      // 4. Log activity
      await tx.employeeActivityLog.create({
        data: {
          employeeId: id,
          action: 'UPDATE',
          module: 'employees',
          description: `Məlumatlar və ya icazələr yeniləndi (${user.id})`,
        },
      });

      return emp;
    });

    const fullEmployee = await prisma.employee.findUnique({
      where: { id: updated.id },
      include: {
        organization: true,
        permissions: true,
      },
    });

    return NextResponse.json({ employee: fullEmployee });
  } catch (error: any) {
    console.error('Update employee error:', error);
    return NextResponse.json({ error: error?.message || 'Yenilənmə zamanı xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as { id: string; role?: string; employeeId?: string | null };

    if (user.role === 'EMPLOYEE') {
      const allowed = await checkPermission(user.id, user.role, 'employees', 'delete');
      if (!allowed) {
        return NextResponse.json({ error: 'Əməkdaşı silmək icazəniz yoxdur' }, { status: 403 });
      }
    }

    const targetEmployee = await getAuthorizedEmployee(id, user);
    if (!targetEmployee) {
      return NextResponse.json({ error: 'Əməkdaş tapılmadı və ya icazəniz yoxdur' }, { status: 404 });
    }

    // Delete User record which cascades to Employee, Permissions, ActivityLogs, Membership
    await prisma.user.delete({
      where: { id: targetEmployee.userId },
    });

    return NextResponse.json({ success: true, message: 'Əməkdaş uğurla silindi' });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ error: 'Silinmə zamanı xəta baş verdi' }, { status: 500 });
  }
}

