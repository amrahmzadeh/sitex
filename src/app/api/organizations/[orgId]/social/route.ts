import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

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
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

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
