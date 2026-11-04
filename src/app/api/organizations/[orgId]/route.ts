import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { organizationSchema } from '@/lib/validations';
import { logAudit } from '@/lib/admin';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';

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
        galleryItems: { orderBy: { sortOrder: 'asc' } },
        packages: { orderBy: { sortOrder: 'asc' } },
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Verify user is OWNER of this organization
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Bu əməliyyat üçün icazəniz yoxdur' }, { status: 403 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });
    }

    // GitHub-da fayllar silinmir — sayt soft-delete kimi işarələnir (admin bərpa edə bilər).
    scheduleSiteSync(orgId, 'delete', userId);

    // Delete organization - all related data cascades via Prisma schema
    await prisma.organization.delete({ where: { id: orgId } });

    // Log audit
    await logAudit(userId, 'DELETE_SITE', 'SITE', orgId, { siteName: org.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json({ error: 'Silmə zamanı xəta baş verdi' }, { status: 500 });
  }
}

