import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    // Splash screen yalnız SUPER_ADMIN tərəfindən idarə olunur
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);
    if (access.userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yalnız adminlər splash screen redaktə edə bilər' }, { status: 403 });
    }

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: {
        splashEnabled: true,
        splashConfig: true,
      },
    });

    return NextResponse.json({
      splashEnabled: website?.splashEnabled || false,
      splashConfig: website?.splashConfig || {},
    });
  } catch (error) {
    console.error('Get splash config error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const body = await req.json();
    const { splashEnabled, splashConfig } = body;

    const updated = await prisma.website.upsert({
      where: { organizationId: orgId },
      update: {
        splashEnabled: Boolean(splashEnabled),
        splashConfig: splashConfig || {},
      },
      create: {
        organizationId: orgId,
        splashEnabled: Boolean(splashEnabled),
        splashConfig: splashConfig || {},
      },
    });

    return NextResponse.json({
      splashEnabled: updated.splashEnabled,
      splashConfig: updated.splashConfig,
    });
  } catch (error) {
    console.error('Update splash config error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
