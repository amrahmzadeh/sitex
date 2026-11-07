import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

// Save draft theme — yalnız SUPER_ADMIN
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);
    if (access.userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 403 });
    }

    const body = await req.json();

    const website = await prisma.website.update({
      where: { organizationId: orgId },
      data: {
        draftTheme: body.theme || {},
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      },
    });

    return NextResponse.json({ website });
  } catch (error) {
    console.error('Update theme error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
