import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

const DEFAULT_MODULES = {
  menu: true,
  packages: true,
  gallery: true,
  contact: true,
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: { moduleSettings: true },
    });

    const stored = (website?.moduleSettings as Record<string, boolean>) || {};
    const modules = {
      ...DEFAULT_MODULES,
      ...stored,
    };

    return NextResponse.json({ modules });
  } catch (e) {
    console.error('Modules GET error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const body = await req.json();

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: { id: true, moduleSettings: true },
    });

    if (!website) {
      return NextResponse.json({ error: 'Vebsayt tapılmadı' }, { status: 404 });
    }

    const current = (website.moduleSettings as Record<string, boolean>) || {};
    const updated = {
      ...DEFAULT_MODULES,
      ...current,
      ...body,
    };

    await prisma.website.update({
      where: { organizationId: orgId },
      data: {
        moduleSettings: updated,
      },
    });

    return NextResponse.json({ modules: updated });
  } catch (e) {
    console.error('Modules PATCH error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

