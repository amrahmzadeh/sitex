import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/utils';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

interface ImportItem {
  name: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  image?: string;
  ingredients?: string;
  allergens?: string;
  portionSize?: string;
  prepTime?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isVisible?: boolean;
}

interface ImportCategory {
  name: string;
  description?: string;
  isVisible?: boolean;
  items?: ImportItem[];
}

interface ImportPayload {
  mode?: 'append' | 'replace'; // default: append
  categories: ImportCategory[];
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

    const body: ImportPayload = await req.json();

    if (!body.categories || !Array.isArray(body.categories) || body.categories.length === 0) {
      return NextResponse.json({ error: 'categories massivi tələb olunur' }, { status: 400 });
    }

    // Replace mode: delete all existing categories + items
    if (body.mode === 'replace') {
      await prisma.menuItem.deleteMany({ where: { organizationId: orgId } });
      await prisma.menuCategory.deleteMany({ where: { organizationId: orgId } });
    }

    // Get current max sort orders
    const maxCatOrder = await prisma.menuCategory.findFirst({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    let catOrder = (maxCatOrder?.sortOrder ?? -1) + 1;

    const maxItemOrder = await prisma.menuItem.findFirst({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    let itemOrder = (maxItemOrder?.sortOrder ?? -1) + 1;

    let createdCategories = 0;
    let createdItems = 0;

    for (const cat of body.categories) {
      if (!cat.name?.trim()) continue;

      let slug = generateSlug(cat.name);
      const existingSlug = await prisma.menuCategory.findUnique({
        where: { organizationId_slug: { organizationId: orgId, slug } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const createdCat = await prisma.menuCategory.create({
        data: {
          organizationId: orgId,
          name: cat.name.trim(),
          slug,
          description: cat.description?.trim() || null,
          isVisible: cat.isVisible !== false,
          sortOrder: catOrder++,
        },
      });
      createdCategories++;

      for (const item of cat.items || []) {
        if (!item.name?.trim()) continue;

        let itemSlug = generateSlug(item.name);
        const existingItemSlug = await prisma.menuItem.findUnique({
          where: { organizationId_slug: { organizationId: orgId, slug: itemSlug } },
        });
        if (existingItemSlug) {
          itemSlug = `${itemSlug}-${Date.now().toString(36)}`;
        }

        await prisma.menuItem.create({
          data: {
            organizationId: orgId,
            categoryId: createdCat.id,
            name: item.name.trim(),
            slug: itemSlug,
            description: item.description?.trim() || null,
            price: Number(item.price) || 0,
            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            image: item.image?.trim() || null,
            ingredients: item.ingredients?.trim() || null,
            allergens: item.allergens?.trim() || null,
            portionSize: item.portionSize?.trim() || null,
            prepTime: item.prepTime?.trim() || null,
            isFeatured: Boolean(item.isFeatured),
            isNew: Boolean(item.isNew),
            isPopular: Boolean(item.isPopular),
            isVisible: item.isVisible !== false,
            sortOrder: itemOrder++,
          },
        });
        createdItems++;
      }
    }

    return NextResponse.json(
      { success: true, createdCategories, createdItems },
      { status: 201 }
    );
  } catch (error) {
    console.error('Menu import error:', error);
    return NextResponse.json({ error: 'Import zamanı xəta baş verdi' }, { status: 500 });
  }
}
