// POST /api/organizations/[orgId]/site-content/publish
// draft → published, version++, history snapshot

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { membership: null, userId: null };
  const userId = (session.user as { id: string }).id;
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  return { membership, userId };
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const { membership, userId } = await verifyAccess(orgId);
  if (!membership) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });

  // EDITOR yalnız saxlaya bilər, yayımlaya bilməz
  if (membership.role === 'EDITOR') {
    return NextResponse.json({ error: 'Yayımlamaq üçün OWNER/ADMIN icazəsi lazımdır' }, { status: 403 });
  }

  const rows = await prisma.siteContent.findMany({
    where: { organizationId: orgId },
  });

  // History snapshot + version artırımı + publish
  const historyInserts = rows.map((row) =>
    prisma.siteContentHistory.create({
      data: {
        organizationId: orgId,
        pageKey: row.pageKey,
        blockKey: row.blockKey,
        content: row.draftContent ?? {},
        version: row.version,
        createdBy: userId ?? undefined,
      },
    })
  );

  const publishUpdates = rows.map((row) =>
    prisma.siteContent.update({
      where: { id: row.id },
      data: {
        publishedContent: row.draftContent ?? {},
        version: { increment: 1 },
      },
    })
  );

  await prisma.$transaction([...historyInserts, ...publishUpdates]);

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { slug: true },
  });
  if (org?.slug) {
    revalidatePath(`/site/${org.slug}`);
    revalidatePath('/');
  }

  return NextResponse.json({ success: true, published: rows.length });
}
