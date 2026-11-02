import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
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
    const { itemId } = body;

    if (!itemId) {
      // Clear hero dish
      await prisma.menuItem.updateMany({
        where: { organizationId: orgId },
        data: { isFeatured: false },
      });

      const website = await prisma.website.findUnique({
        where: { organizationId: orgId },
      });

      if (website) {
        const draft = (typeof website.draftTheme === 'object' && website.draftTheme ? { ...(website.draftTheme as any) } : {}) as Record<string, any>;
        const published = (typeof website.publishedTheme === 'object' && website.publishedTheme ? { ...(website.publishedTheme as any) } : {}) as Record<string, any>;

        delete draft.heroDishId;
        delete published.heroDishId;

        await prisma.website.update({
          where: { organizationId: orgId },
          data: {
            draftTheme: draft,
            publishedTheme: published,
          },
        });
      }

      await scheduleSiteSync(orgId, 'publish', membership.userId);
      return NextResponse.json({ success: true, heroDish: null });
    }

    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, organizationId: orgId },
      include: { category: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Yemək tapılmadı' }, { status: 404 });
    }

    // Set this item as featured, unset others
    await prisma.menuItem.updateMany({
      where: { organizationId: orgId, id: { not: itemId } },
      data: { isFeatured: false },
    });

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isFeatured: true },
      include: { category: true },
    });

    // Sync to website draftTheme and publishedTheme
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
        data: {
          draftTheme: draft,
          publishedTheme: published,
        },
      });
    }

    await scheduleSiteSync(orgId, 'publish', membership.userId);

    return NextResponse.json({ success: true, heroDish: updatedItem });
  } catch (error: any) {
    console.error('Set hero dish error:', error);
    return NextResponse.json({ error: error?.message || 'Xəta baş verdi' }, { status: 500 });
  }
}
