import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { menuItemSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import { verifyOrgPermission } from '@/lib/permissions';

async function verifyAccess(orgId: string, action: 'view' | 'create' = 'view') {
  const perm = await verifyOrgPermission(orgId, 'menu', action);
  return perm.ok ? perm : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId, 'view');
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const items = await prisma.menuItem.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId, 'create');
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json();
    const result = menuItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, ...rest } = result.data;
    let slug = generateSlug(name);

    const existingSlug = await prisma.menuItem.findUnique({
      where: { organizationId_slug: { organizationId: orgId, slug } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const maxOrder = await prisma.menuItem.findFirst({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    if (rest.isFeatured) {
      await prisma.menuItem.updateMany({
        where: { organizationId: orgId },
        data: { isFeatured: false },
      });
    }

    const { sortOrder: _unused, ...restWithoutOrderClean } = rest;
    const item = await prisma.menuItem.create({
      data: {
        organizationId: orgId,
        name,
        slug,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        ...restWithoutOrderClean,
      },
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

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
