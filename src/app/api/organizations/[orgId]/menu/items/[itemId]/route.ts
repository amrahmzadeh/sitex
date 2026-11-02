import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { menuItemSchema } from '@/lib/validations';

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
  { params }: { params: Promise<{ orgId: string; itemId: string }> }
) {
  try {
    const { orgId, itemId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json();
    const result = menuItemSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    if (result.data.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: result.data.categoryId, organizationId: orgId },
      });
      if (!category) {
        return NextResponse.json({ error: 'Kateqoriya tapılmadı' }, { status: 404 });
      }
    }

    if (result.data.isFeatured === true) {
      await prisma.menuItem.updateMany({
        where: { organizationId: orgId, id: { not: itemId } },
        data: { isFeatured: false },
      });
    }

    const item = await prisma.menuItem.update({
      where: { id: itemId, organizationId: orgId },
      data: result.data,
      include: { category: true, images: true },
    });

    if (item.isFeatured) {
      const website = await prisma.website.findUnique({
        where: { organizationId: orgId },
      });
      if (website) {
        const draft = {
          ...(typeof website.draftTheme === 'object' && website.draftTheme ? (website.draftTheme as any) : {}),
          heroDishId: item.id,
          heroDishTitle: item.name,
          heroDishImage: item.image || '',
          heroDishSubtitle: item.description || '',
        };
        const published = {
          ...(typeof website.publishedTheme === 'object' && website.publishedTheme ? (website.publishedTheme as any) : {}),
          heroDishId: item.id,
          heroDishTitle: item.name,
          heroDishImage: item.image || '',
          heroDishSubtitle: item.description || '',
        };
        await prisma.website.update({
          where: { organizationId: orgId },
          data: { draftTheme: draft, publishedTheme: published },
        });
      }
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error('Update item error:', error);
    return NextResponse.json({ error: error?.message || 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; itemId: string }> }
) {
  try {
    const { orgId, itemId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership || membership.role === 'EDITOR') {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    await prisma.menuItem.delete({
      where: { id: itemId, organizationId: orgId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
