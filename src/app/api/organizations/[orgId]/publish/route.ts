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

// Publish site: copy draft to published
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership || membership.role === 'EDITOR') {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

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
    scheduleSiteSync(orgId, 'publish', membership.userId);

    return NextResponse.json({ website: updated });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
