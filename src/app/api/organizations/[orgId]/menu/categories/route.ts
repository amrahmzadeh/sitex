import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { menuCategorySchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const categories = await prisma.menuCategory.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          orderBy: { sortOrder: 'asc' },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        },
        _count: { select: { menuItems: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json();
    const result = menuCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, ...rest } = result.data;
    let slug = generateSlug(name);

    const existingSlug = await prisma.menuCategory.findUnique({
      where: { organizationId_slug: { organizationId: orgId, slug } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Get max sort order
    const maxOrder = await prisma.menuCategory.findFirst({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const { sortOrder: _unused, ...restWithoutOrder } = rest;
    const category = await prisma.menuCategory.create({
      data: {
        organizationId: orgId,
        name,
        slug,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        ...restWithoutOrder,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
