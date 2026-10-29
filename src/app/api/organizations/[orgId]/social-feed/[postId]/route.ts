import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

// DELETE - remove a single post
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; postId: string }> }
) {
  try {
    const { orgId, postId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

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
    const membership = await verifyAccess(orgId);
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

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
