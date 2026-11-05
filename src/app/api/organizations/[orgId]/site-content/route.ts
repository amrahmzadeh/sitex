// GET  /api/organizations/[orgId]/site-content  → draft content map
// PUT  /api/organizations/[orgId]/site-content  → update draft
// DELETE /api/organizations/[orgId]/site-content → revert block to default

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ---- Yetkilendirme yardımcısı ----
async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

// ---- GET ----
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const membership = await verifyAccess(orgId);
  if (!membership) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });

  const rows = await prisma.siteContent.findMany({
    where: { organizationId: orgId },
    select: { pageKey: true, blockKey: true, draftContent: true, version: true },
  });

  // pageKey → blockKey → ContentDoc
  const content: Record<string, Record<string, unknown>> = {};
  for (const row of rows) {
    if (!content[row.pageKey]) content[row.pageKey] = {};
    content[row.pageKey][row.blockKey] = row.draftContent;
  }

  return NextResponse.json({ content });
}

// ---- PUT (tam content map-i saxla) ----
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const membership = await verifyAccess(orgId);
  if (!membership) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });

  const body = await req.json();
  const contentMap = body.content as Record<string, Record<string, unknown>>;

  if (typeof contentMap !== 'object' || contentMap === null) {
    return NextResponse.json({ error: 'Yanlış format' }, { status: 400 });
  }

  // Upsert each block
  const ops = [];
  for (const [pageKey, blocks] of Object.entries(contentMap)) {
    for (const [blockKey, doc] of Object.entries(blocks)) {
      ops.push(
        prisma.siteContent.upsert({
          where: { organizationId_pageKey_blockKey: { organizationId: orgId, pageKey, blockKey } },
          create: { organizationId: orgId, pageKey, blockKey, draftContent: doc as object },
          update: { draftContent: doc as object },
        })
      );
    }
  }

  await prisma.$transaction(ops);
  return NextResponse.json({ success: true });
}

// ---- DELETE (bir bloku sil — default-a qaytar) ----
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const membership = await verifyAccess(orgId);
  if (!membership) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });

  const body = await req.json();
  const { pageKey, blockKey } = body as { pageKey: string; blockKey: string };

  if (!pageKey || !blockKey) {
    return NextResponse.json({ error: 'pageKey və blockKey tələb olunur' }, { status: 400 });
  }

  await prisma.siteContent.deleteMany({
    where: { organizationId: orgId, pageKey, blockKey },
  });

  return NextResponse.json({ success: true });
}

