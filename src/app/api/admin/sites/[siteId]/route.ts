import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse, logAudit } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';

// DELETE /api/admin/sites/[siteId] — admin force-delete a site
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { siteId } = await params;

  const org = await prisma.organization.findUnique({
    where: { id: siteId },
    select: { id: true, name: true, slug: true },
  });

  if (!org) return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });

  // GitHub-da fayllar qorunur; sayt soft-delete kimi işarələnir.
  scheduleSiteSync(siteId, 'delete', admin.id);

  // Delete - cascades all related data
  await prisma.organization.delete({ where: { id: siteId } });

  await logAudit(admin.id, 'ADMIN_DELETE_SITE', 'SITE', siteId, {
    siteName: org.name,
    slug: org.slug,
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/sites/[siteId] — toggle publish status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { siteId } = await params;
  const body = await req.json();

  const website = await prisma.website.findUnique({
    where: { organizationId: siteId },
  });
  if (!website) return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });

  const updated = await prisma.website.update({
    where: { organizationId: siteId },
    data: { isPublished: body.isPublished },
  });

  await logAudit(admin.id, body.isPublished ? 'PUBLISH_SITE' : 'UNPUBLISH_SITE', 'SITE', siteId);

  return NextResponse.json({ website: updated });
}

