import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getEmployeePermissionsMap } from '@/lib/permissions';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const userRole = (session.user as { role?: string }).role;

    if (userRole !== 'EMPLOYEE') {
      return NextResponse.json({
        isEmployee: false,
        role: userRole,
        permissions: {},
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            siteCategory: true,
            siteSubcategory: true,
          },
        },
      },
    });

    if (!employee || employee.status === 'INACTIVE') {
      return NextResponse.json({
        isEmployee: true,
        isActive: false,
        permissions: {},
      });
    }

    const permissions = await getEmployeePermissionsMap(employee.id);

    return NextResponse.json({
      isEmployee: true,
      isActive: employee.status === 'ACTIVE',
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        email: employee.email,
        username: employee.username,
        position: employee.position,
        department: employee.department,
        status: employee.status,
        organizationId: employee.organizationId,
        organization: employee.organization,
      },
      permissions,
    });
  } catch (error) {
    console.error('Get employee me error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

