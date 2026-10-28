import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const { orgId } = await params;
    const userId = (session.user as { id: string }).id;

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!membership) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 });
    }

    const website = await prisma.website.findUnique({
      where: { organizationId: orgId },
      select: {
        splashEnabled: true,
        splashConfig: true,
      },
    });

    return NextResponse.json({
      splashEnabled: website?.splashEnabled || false,
      splashConfig: website?.splashConfig || {},
    });
  } catch (error) {
    console.error('Get splash config error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const { orgId } = await params;
    const userId = (session.user as { id: string }).id;

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!membership) {
      return NextResponse.json({ error: 'İcazəniz yoxdur' }, { status: 403 });
    }

    const body = await req.json();
    const { splashEnabled, splashConfig } = body;

    const updated = await prisma.website.upsert({
      where: { organizationId: orgId },
      update: {
        splashEnabled: Boolean(splashEnabled),
        splashConfig: splashConfig || {},
      },
      create: {
        organizationId: orgId,
        splashEnabled: Boolean(splashEnabled),
        splashConfig: splashConfig || {},
      },
    });

    return NextResponse.json({
      splashEnabled: updated.splashEnabled,
      splashConfig: updated.splashConfig,
    });
  } catch (error) {
    console.error('Update splash config error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
