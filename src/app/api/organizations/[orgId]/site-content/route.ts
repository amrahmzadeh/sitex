// GET  /api/organizations/[orgId]/site-content  → draft content map
// PUT  /api/organizations/[orgId]/site-content  → update draft only (publishedContent untouched)
// DELETE /api/organizations/[orgId]/site-content → revert block to default

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

// ---- GET ----
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId);
  if (!access.ok) return tenantError(access);

  const rows = await prisma.siteContent.findMany({
    where: { organizationId: orgId },
    select: { pageKey: true, blockKey: true, draftContent: true, publishedContent: true, version: true },
  });

  // pageKey → blockKey → ContentDoc (draft prioriteti ilə)
  const content: Record<string, Record<string, unknown>> = {};
  for (const row of rows) {
    if (!content[row.pageKey]) content[row.pageKey] = {};
    content[row.pageKey][row.blockKey] = row.draftContent || row.publishedContent || {};
  }

  return NextResponse.json({ content });
}

// ---- PUT (tam content map-i saxla) ----
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId);
  if (!access.ok) return tenantError(access);

  const body = await req.json();
  const contentMap = body.content as Record<string, Record<string, unknown>>;

  if (typeof contentMap !== 'object' || contentMap === null) {
    return NextResponse.json({ error: 'Yanlış format' }, { status: 400 });
  }

  // SADECE draftContent güncellenir — publishedContent'e dokunulmaz.
  // Yayınlama ayrı endpoint üzerinden yapılır: POST .../site-content/publish
  const ops = [];
  for (const [pageKey, blocks] of Object.entries(contentMap)) {
    if (!blocks || typeof blocks !== 'object') continue;
    for (const [blockKey, doc] of Object.entries(blocks)) {
      ops.push(
        prisma.siteContent.upsert({
          where: { organizationId_pageKey_blockKey: { organizationId: orgId, pageKey, blockKey } },
          create: {
            organizationId: orgId,
            pageKey,
            blockKey,
            draftContent: (doc as object) ?? {},
            publishedContent: {},
          },
          update: {
            draftContent: (doc as object) ?? {},
            // publishedContent DEĞİŞTİRİLMEZ
          },
        })
      );
    }
  }

  await prisma.$transaction(ops);

  // Draft kayıtları canlı siteyi etkilemez — revalidate yapılmaz.
  // Canlı site yalnızca POST .../site-content/publish sonrası güncellenir.

  return NextResponse.json({ success: true, mode: 'draft_saved' });
}

// ---- DELETE (bir bloku sil — default-a qaytar) ----
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId, 'ADMIN');
  if (!access.ok) return tenantError(access);

  const body = await req.json();
  const { pageKey, blockKey } = body as { pageKey: string; blockKey: string };

  if (!pageKey || !blockKey) {
    return NextResponse.json({ error: 'pageKey və blockKey tələb olunur' }, { status: 400 });
  }

  await prisma.siteContent.deleteMany({
    where: { organizationId: orgId, pageKey, blockKey },
  });

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { slug: true },
  });
  if (org?.slug) {
    revalidatePath(`/site/${org.slug}`);
  }

  return NextResponse.json({ success: true });
}

