import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { organizationSchema } from '@/lib/validations';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as { id: string }).id;
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });

  return membership;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        website: true,
        whatsappSettings: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        menuCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' },
            },
            _count: { select: { menuItems: true } },
          },
        },
        _count: { select: { menuItems: true, mediaAssets: true } },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({ organization, role: membership.role });
  } catch (error) {
    console.error('Get organization error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership || membership.role === 'EDITOR') {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json();
    const result = organizationSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: result.data,
    });

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error('Update organization error:', error);
    return NextResponse.json({ error: error?.message || 'Xəta baş verdi' }, { status: 500 });
  }
}
