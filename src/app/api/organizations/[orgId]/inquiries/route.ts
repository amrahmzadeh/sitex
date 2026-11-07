import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ContactSubmissionStatus } from '@prisma/client';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const search = (searchParams.get('search') || '').trim();

    const where: any = { organizationId: orgId };

    if (
      statusParam &&
      statusParam !== 'ALL' &&
      Object.values(ContactSubmissionStatus).includes(statusParam as ContactSubmissionStatus)
    ) {
      where.status = statusParam as ContactSubmissionStatus;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { service: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [inquiries, total, newCount, inProgressCount, resolvedCount, archivedCount] =
      await Promise.all([
        prisma.contactSubmission.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.contactSubmission.count({ where: { organizationId: orgId } }),
        prisma.contactSubmission.count({
          where: { organizationId: orgId, status: ContactSubmissionStatus.NEW },
        }),
        prisma.contactSubmission.count({
          where: { organizationId: orgId, status: ContactSubmissionStatus.IN_PROGRESS },
        }),
        prisma.contactSubmission.count({
          where: { organizationId: orgId, status: ContactSubmissionStatus.RESOLVED },
        }),
        prisma.contactSubmission.count({
          where: { organizationId: orgId, status: ContactSubmissionStatus.ARCHIVED },
        }),
      ]);

    return NextResponse.json({
      inquiries,
      counts: {
        total,
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        archived: archivedCount,
      },
    });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return NextResponse.json({ error: 'Müraciətlər yüklənmədi' }, { status: 500 });
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

    const body = await req.json().catch(() => null);
    if (!body?.fullName || !body?.message) {
      return NextResponse.json({ error: 'Ad və mesaj tələb olunur' }, { status: 400 });
    }

    const inquiry = await prisma.contactSubmission.create({
      data: {
        organizationId: orgId,
        fullName: body.fullName.trim(),
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        service: body.service?.trim() || null,
        subject: body.subject?.trim() || null,
        message: body.message.trim(),
        notes: body.notes?.trim() || null,
        status: (body.status as ContactSubmissionStatus) || ContactSubmissionStatus.NEW,
      },
    });

    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (error) {
    console.error('Create inquiry error:', error);
    return NextResponse.json({ error: 'Müraciət yaradılmadı' }, { status: 500 });
  }
}
