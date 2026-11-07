import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        website: true,
        whatsappSettings: true,
        qrSettings: true,
      },
    });

    if (!org) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    return NextResponse.json({
      organization: { name: org.name, slug: org.slug },
      qrSettings: org.qrSettings,
      isPublished: org.website?.isPublished ?? false,
    });
  } catch (error) {
    console.error('Get QR error:', error);
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
    const { tableCount, designConfig } = body;

    const qrSettings = await prisma.qRSettings.upsert({
      where: { organizationId: orgId },
      update: {
        tableCount: tableCount ?? undefined,
        designConfig: designConfig ? JSON.stringify(designConfig) : undefined,
      },
      create: {
        organizationId: orgId,
        tableCount: tableCount ?? 10,
        designConfig: designConfig ? JSON.stringify(designConfig) : '{}',
      },
    });

    return NextResponse.json({ qrSettings });
  } catch (error) {
    console.error('Update QR error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
