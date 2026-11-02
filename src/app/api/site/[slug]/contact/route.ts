import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Müəssisə tapılmadı' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Etibarsız sorğu forması' }, { status: 400 });
    }

    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    let phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    let email = typeof body.email === 'string' ? body.email.trim() : '';
    const service = typeof body.service === 'string' ? body.service.trim() : null;
    const subject = typeof body.subject === 'string' ? body.subject.trim() : null;
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!fullName) {
      return NextResponse.json({ error: 'Ad və soyad daxil edilməlidir' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Mesaj daxil edilməlidir' }, { status: 400 });
    }

    // Əgər istifadəçi "E-poçt və ya əlaqə nömrəsi" sahəsinə e-poçt daxil edibsə, onu düzgün ayır
    if (phone && phone.includes('@') && !email) {
      email = phone;
      phone = '';
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        organizationId: org.id,
        fullName,
        email: email || null,
        phone: phone || null,
        service: service || null,
        subject: subject || null,
        message,
        status: 'NEW',
        metadata: body.metadata || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Müraciətiniz qəbul edildi',
      id: submission.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: 'Server xətası baş verdi' }, { status: 500 });
  }
}
