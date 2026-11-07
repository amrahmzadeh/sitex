import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { whatsappSchema } from '@/lib/validations';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const settings = await prisma.whatsAppSettings.findUnique({
      where: { organizationId: orgId },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get whatsapp error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId, 'ADMIN');
    if (!access.ok) return tenantError(access);

    const body = await req.json();
    const result = whatsappSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const settings = await prisma.whatsAppSettings.upsert({
      where: { organizationId: orgId },
      update: result.data,
      create: {
        organizationId: orgId,
        ...result.data,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Update whatsapp error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
