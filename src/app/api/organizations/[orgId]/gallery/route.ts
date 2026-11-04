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

    const items = await prisma.galleryItem.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error('Gallery GET error:', e);
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

    // Bulk save / reorder
    if (Array.isArray(body.items)) {
      await prisma.$transaction(
        body.items.map((item: any, index: number) => {
          if (item.id && !item.id.startsWith('temp_')) {
            return prisma.galleryItem.update({
              where: { id: item.id },
              data: {
                url: item.url,
                title: item.title || null,
                description: item.description || null,
                isVisible: item.isVisible !== false,
                sortOrder: item.sortOrder ?? index,
              },
            });
          } else {
            return prisma.galleryItem.create({
              data: {
                organizationId: orgId,
                url: item.url,
                title: item.title || null,
                description: item.description || null,
                isVisible: item.isVisible !== false,
                sortOrder: item.sortOrder ?? index,
              },
            });
          }
        })
      );

      const updated = await prisma.galleryItem.findMany({
        where: { organizationId: orgId },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json({ items: updated });
    }

    // Single item add
    if (!body.url || typeof body.url !== 'string' || !body.url.trim()) {
      return NextResponse.json({ error: 'Şəkil linki mütləqdir' }, { status: 400 });
    }

    const maxSort = await prisma.galleryItem.aggregate({
      where: { organizationId: orgId },
      _max: { sortOrder: true },
    });

    const nextOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const newItem = await prisma.galleryItem.create({
      data: {
        organizationId: orgId,
        url: body.url.trim(),
        title: body.title?.trim() || null,
        description: body.description?.trim() || null,
        isVisible: body.isVisible !== false,
        sortOrder: nextOrder,
      },
    });

    return NextResponse.json({ item: newItem });
  } catch (e) {
    console.error('Gallery POST error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PUT(
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
    if (!body.id) {
      return NextResponse.json({ error: 'ID tələb olunur' }, { status: 400 });
    }

    const updated = await prisma.galleryItem.update({
      where: { id: body.id },
      data: {
        url: body.url !== undefined ? body.url.trim() : undefined,
        title: body.title !== undefined ? (body.title ? body.title.trim() : null) : undefined,
        description: body.description !== undefined ? (body.description ? body.description.trim() : null) : undefined,
        isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (e) {
    console.error('Gallery PUT error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

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

    await prisma.galleryItem.deleteMany({
      where: {
        id,
        organizationId: orgId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Gallery DELETE error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

