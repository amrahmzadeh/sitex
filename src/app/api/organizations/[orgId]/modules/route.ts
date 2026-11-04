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

const DEFAULT_MODULES = {
  menu: true,
  packages: true,
  gallery: true,
  contact: true,
};

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

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: { moduleSettings: true },
    });

    const stored = (website?.moduleSettings as Record<string, boolean>) || {};
    const modules = {
      ...DEFAULT_MODULES,
      ...stored,
    };

    return NextResponse.json({ modules });
  } catch (e) {
    console.error('Modules GET error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PATCH(
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

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: { id: true, moduleSettings: true },
    });

    if (!website) {
      return NextResponse.json({ error: 'Vebsayt tapılmadı' }, { status: 404 });
    }

    const current = (website.moduleSettings as Record<string, boolean>) || {};
    const updated = {
      ...DEFAULT_MODULES,
      ...current,
      ...body,
    };

    await prisma.website.update({
      where: { organizationId: orgId },
      data: {
        moduleSettings: updated,
      },
    });

    return NextResponse.json({ modules: updated });
  } catch (e) {
    console.error('Modules PATCH error:', e);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

