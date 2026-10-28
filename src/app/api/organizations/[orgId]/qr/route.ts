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

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        website: true,
        whatsappSettings: true,
        qrSettings: true,
      },
    });

    if (!org) return NextResponse.json({ error: 'Tapılmadı' }, { status: 404 });

    return NextResponse.json({
      organization: { name: org.name, slug: org.slug },
      qrSettings: org.qrSettings,
      isPublished: org.website?.isPublished ?? false,
    });
  } catch (error) {
    console.error('Get QR error:', error);
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
    const { tableCount, designConfig } = body;

    const qrSettings = await prisma.qRSettings.upsert({
      where: { organizationId: orgId },
      update: {
        tableCount: tableCount ?? undefined,
        designConfig: designConfig ? JSON.stringify(designConfig) : undefined,
      },
      create: {
        organizationId: orgId,
        tableCount: tableCount ?? 10,
        designConfig: designConfig ? JSON.stringify(designConfig) : '{}',
      },
    });

    return NextResponse.json({ qrSettings });
  } catch (error) {
    console.error('Update QR error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
