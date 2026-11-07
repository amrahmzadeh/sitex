// POST /api/organizations/[orgId]/site-content/publish
// draft → published, version++, history snapshot

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId, 'ADMIN');
  if (!access.ok) return tenantError(access);

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
        createdBy: access.userId,
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
