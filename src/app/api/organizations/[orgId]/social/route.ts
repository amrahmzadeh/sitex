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
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

    const links = await prisma.socialLink.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ links });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

    const body = await req.json();
    const links: Array<{ platform: string; url: string; sortOrder?: number }> = body.links || [];

    // Replace all links
    await prisma.socialLink.deleteMany({ where: { organizationId: orgId } });
    if (links.length > 0) {
      await prisma.socialLink.createMany({
        data: links.map((l, i) => ({
          organizationId: orgId,
          platform: l.platform,
          url: l.url,
          sortOrder: l.sortOrder ?? i,
        })),
      });
    }

    const updated = await prisma.socialLink.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ links: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}
