import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { organizationSchema } from '@/lib/validations';
import { logAudit } from '@/lib/admin';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        website: true,
        whatsappSettings: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        galleryItems: { orderBy: { sortOrder: 'asc' } },
        packages: { orderBy: { sortOrder: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        siteContents: true,
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

    return NextResponse.json({ organization, role: access.membershipRole || access.userRole });
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
    const access = await verifyTenantAccess(orgId, 'ADMIN');
    if (!access.ok) return tenantError(access);

    const body = await req.json();
    const { footerTagline, ...orgFields } = body;
    const result = organizationSchema.partial().safeParse(orgFields);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: result.data,
      include: { website: true },
    });

    if (footerTagline !== undefined) {
      const website = organization.website;
      if (website) {
        const draft = ((website.draftTheme as any) || {});
        const published = ((website.publishedTheme as any) || {});
        const updatedTagline = typeof footerTagline === 'string' ? footerTagline.trim() : '';
        await prisma.website.update({
          where: { organizationId: orgId },
          data: {
            draftTheme: { ...draft, footerTagline: updatedTagline },
            publishedTheme: { ...published, footerTagline: updatedTagline },
          },
        });
      }
    }

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
    const access = await verifyTenantAccess(orgId, 'OWNER');
    if (!access.ok) return tenantError(access);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });
    }

    // GitHub-da fayllar silinmir — sayt soft-delete kimi işarələnir (admin bərpa edə bilər).
    scheduleSiteSync(orgId, 'delete', access.userId);

    // Delete organization - all related data cascades via Prisma schema
    await prisma.organization.delete({ where: { id: orgId } });

    // Log audit
    await logAudit(access.userId, 'DELETE_SITE', 'SITE', orgId, { siteName: org.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json({ error: 'Silmə zamanı xəta baş verdi' }, { status: 500 });
  }
}

