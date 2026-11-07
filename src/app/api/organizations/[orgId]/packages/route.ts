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

    const packages = await prisma.package.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ packages });
  } catch (e) {
    console.error('Packages GET error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Paket adı tələb olunur' }, { status: 400 });
    }

    const maxSort = await prisma.package.aggregate({
      where: { organizationId: orgId },
      _max: { sortOrder: true },
    });
    const nextOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const newPkg = await prisma.package.create({
      data: {
        organizationId: orgId,
        name: body.name.trim(),
        title: body.title?.trim() || null,
        description: body.description?.trim() || null,
        fullDescription: body.fullDescription?.trim() || null,
        price: body.price !== undefined && body.price !== null && body.price !== '' ? Number(body.price) : null,
        discountPrice: body.discountPrice !== undefined && body.discountPrice !== null && body.discountPrice !== '' ? Number(body.discountPrice) : null,
        image: body.image?.trim() || null,
        features: Array.isArray(body.features) ? body.features : [],
        tag: body.tag?.trim() || null,
        badgeText: body.badgeText?.trim() || null,
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : nextOrder,
      },
    });

    return NextResponse.json({ package: newPkg }, { status: 201 });
  } catch (e) {
    console.error('Packages POST error:', e);
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
    if (!body.id) {
      return NextResponse.json({ error: 'ID tələb olunur' }, { status: 400 });
    }

    const updated = await prisma.package.update({
      where: { id: body.id },
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
    console.error('Packages PUT error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const url = new URL(req.url);
    const queryId = url.searchParams.get('id');
    let id = queryId;

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'ID tələb olunur' }, { status: 400 });
    }

    await prisma.package.deleteMany({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Packages DELETE error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

