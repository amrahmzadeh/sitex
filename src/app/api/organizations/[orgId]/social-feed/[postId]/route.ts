import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

// DELETE - remove a single post
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; postId: string }> }
) {
  try {
    const { orgId, postId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    await prisma.socialFeedPost.deleteMany({
      where: { id: postId, organizationId: orgId },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// PATCH - toggle visibility or update fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; postId: string }> }
) {
  try {
    const { orgId, postId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const body = await req.json();

    const post = await prisma.socialFeedPost.updateMany({
      where: { id: postId, organizationId: orgId },
      data: body,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}
