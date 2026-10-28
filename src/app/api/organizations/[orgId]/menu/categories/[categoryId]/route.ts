import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { menuCategorySchema } from '@/lib/validations';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; categoryId: string }> }
) {
  try {
    const { orgId, categoryId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json();
    const result = menuCategorySchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const category = await prisma.menuCategory.update({
      where: { id: categoryId, organizationId: orgId },
      data: result.data,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; categoryId: string }> }
) {
  try {
    const { orgId, categoryId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership || membership.role === 'EDITOR') {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    await prisma.menuCategory.delete({
      where: { id: categoryId, organizationId: orgId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
