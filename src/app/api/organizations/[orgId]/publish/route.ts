import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

// Publish site: copy draft to published
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId, 'ADMIN');
    if (!access.ok) return tenantError(access);

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
    });

    if (!website) {
      return NextResponse.json({ error: 'Veb sayt tapılmadı' }, { status: 404 });
    }

    const updated = await prisma.website.update({
      where: { organizationId: orgId },
      data: {
        publishedTheme: website.draftTheme as object,
        publishedPages: website.pagesConfig as object,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    // Publish cavabı GitHub-ı gözləmir: sync fon rejimində növbəyə atılır.
    scheduleSiteSync(orgId, 'publish', access.userId);

    return NextResponse.json({ website: updated });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
