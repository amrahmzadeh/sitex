import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; packageId: string }> }
) {
  try {
    const { orgId, packageId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const body = await req.json();
    const updated = await prisma.package.update({
      where: { id: packageId, organizationId: orgId },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.title !== undefined && { title: body.title?.trim() || null }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.fullDescription !== undefined && { fullDescription: body.fullDescription?.trim() || null }),
        ...(body.price !== undefined && {
          price: body.price !== null && body.price !== '' ? Number(body.price) : null,
        }),
        ...(body.discountPrice !== undefined && {
          discountPrice: body.discountPrice !== null && body.discountPrice !== '' ? Number(body.discountPrice) : null,
        }),
        ...(body.image !== undefined && { image: body.image?.trim() || null }),
        ...(body.features !== undefined && { features: Array.isArray(body.features) ? body.features : [] }),
        ...(body.tag !== undefined && { tag: body.tag?.trim() || null }),
        ...(body.badgeText !== undefined && { badgeText: body.badgeText?.trim() || null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      },
    });

    return NextResponse.json({ package: updated });
  } catch (e) {
    console.error('Package PATCH error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; packageId: string }> }
) {
  try {
    const { orgId, packageId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    await prisma.package.deleteMany({
      where: { id: packageId, organizationId: orgId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Package DELETE error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

