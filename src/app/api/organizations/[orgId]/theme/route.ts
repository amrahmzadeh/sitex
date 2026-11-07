import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

// Get current theme for organization
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: {
        draftTheme: true,
        publishedTheme: true,
        isPublished: true,
      },
    });

    const activeTheme =
      (website?.draftTheme as any) || (website?.publishedTheme as any) || null;

    return NextResponse.json({
      success: true,
      theme: activeTheme,
      website,
    });
  } catch (error) {
    console.error('Get theme error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

// Save theme for organization (draft & published option)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId, 'ADMIN');
    if (!access.ok) return tenantError(access);

    const body = await req.json();
    const themeData = body.theme || {};
    const applyToPublished = Boolean(body.publishImmediately);

    const updateData: Record<string, any> = {
      draftTheme: themeData,
    };

    if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription;

    if (applyToPublished) {
      updateData.publishedTheme = themeData;
      updateData.isPublished = true;
      updateData.publishedAt = new Date();
    }

    const website = await prisma.website.update({
      where: { organizationId: orgId },
      data: updateData,
    });

    return NextResponse.json({ success: true, website, theme: themeData });
  } catch (error) {
    console.error('Update theme error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
