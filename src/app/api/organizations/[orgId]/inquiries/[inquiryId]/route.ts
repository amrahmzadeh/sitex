import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ContactSubmissionStatus } from '@prisma/client';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as { id: string; role?: string };
  if (user.role === 'SUPER_ADMIN') {
    return { role: 'OWNER', userId: user.id };
  }
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; inquiryId: string }> }
) {
  try {
    const { orgId, inquiryId } = await params;
    const access = await verifyAccess(orgId);
    if (!access) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const existing = await prisma.contactSubmission.findUnique({
      where: { id: inquiryId },
    });

    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json({ error: 'Müraciət tapılmadı' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data: any = {};

    if (
      body.status &&
      Object.values(ContactSubmissionStatus).includes(body.status as ContactSubmissionStatus)
    ) {
      data.status = body.status as ContactSubmissionStatus;
    }

    if (body.notes !== undefined) {
      data.notes = typeof body.notes === 'string' ? body.notes.trim() : null;
    }

    const updated = await prisma.contactSubmission.update({
      where: { id: inquiryId },
      data,
    });

    return NextResponse.json({ inquiry: updated });
  } catch (error) {
    console.error('Update inquiry error:', error);
    return NextResponse.json({ error: 'Yenilənmədi' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; inquiryId: string }> }
) {
  try {
    const { orgId, inquiryId } = await params;
    const access = await verifyAccess(orgId);
    if (!access) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const existing = await prisma.contactSubmission.findUnique({
      where: { id: inquiryId },
    });

    if (!existing || existing.organizationId !== orgId) {
      return NextResponse.json({ error: 'Müraciət tapılmadı' }, { status: 404 });
    }

    await prisma.contactSubmission.delete({
      where: { id: inquiryId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    return NextResponse.json({ error: 'Silinmədi' }, { status: 500 });
  }
}
