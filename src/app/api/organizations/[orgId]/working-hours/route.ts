import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  DEFAULT_WEEK_SCHEDULE,
  DEFAULT_TIMEZONE,
  DEFAULT_OFF_HOURS_MESSAGE,
  validateDaySchedule,
  WorkingHoursEntry,
} from '@/lib/working-hours';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';

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

    const [dbHours, dbSettings] = await Promise.all([
      prisma.workingHours.findMany({
        where: { organizationId: orgId },
        orderBy: { dayOfWeek: 'asc' },
      }),
      prisma.workingHoursSettings.findUnique({
        where: { organizationId: orgId },
      }),
    ]);

    // Ensure all 7 days exist (0 to 6)
    const hours: WorkingHoursEntry[] = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const found = dbHours.find((h) => h.dayOfWeek === day);
      if (found) {
        return {
          dayOfWeek: found.dayOfWeek,
          openTime: found.openTime,
          closeTime: found.closeTime,
          isClosed: found.isClosed,
          breakStart: found.breakStart,
          breakEnd: found.breakEnd,
        };
      }
      const def = DEFAULT_WEEK_SCHEDULE.find((d) => d.dayOfWeek === day);
      return {
        dayOfWeek: day,
        openTime: def?.openTime || '09:00',
        closeTime: def?.closeTime || '22:00',
        isClosed: def?.isClosed ?? false,
        breakStart: null,
        breakEnd: null,
      };
    });

    const settings = {
      timezone: dbSettings?.timezone || DEFAULT_TIMEZONE,
      pauseOrdersOutsideHours: dbSettings?.pauseOrdersOutsideHours ?? false,
      offHoursMessage: dbSettings?.offHoursMessage || DEFAULT_OFF_HOURS_MESSAGE,
    };

    return NextResponse.json({ hours, settings });
  } catch (error) {
    console.error('Get working hours error:', error);
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
    if (!membership || membership.role === 'EDITOR') {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Yanlış sorğu forması' }, { status: 400 });
    }

    const rawHours: WorkingHoursEntry[] = Array.isArray(body.hours) ? body.hours : [];
    const rawSettings = body.settings || {};

    // Validate days
    for (const h of rawHours) {
      if (typeof h.dayOfWeek !== 'number' || h.dayOfWeek < 0 || h.dayOfWeek > 6) {
        return NextResponse.json({ error: 'Yanlış gün indeksi' }, { status: 400 });
      }
      const err = validateDaySchedule(h);
      if (err) {
        return NextResponse.json({ error: err }, { status: 400 });
      }
    }

    // Save settings
    const timezone = typeof rawSettings.timezone === 'string' && rawSettings.timezone.trim()
      ? rawSettings.timezone.trim()
      : DEFAULT_TIMEZONE;
    const pauseOrdersOutsideHours = !!rawSettings.pauseOrdersOutsideHours;
    const offHoursMessage = typeof rawSettings.offHoursMessage === 'string'
      ? rawSettings.offHoursMessage.trim()
      : null;

    const savedSettings = await prisma.workingHoursSettings.upsert({
      where: { organizationId: orgId },
      update: {
        timezone,
        pauseOrdersOutsideHours,
        offHoursMessage,
      },
      create: {
        organizationId: orgId,
        timezone,
        pauseOrdersOutsideHours,
        offHoursMessage,
      },
    });

    // Save hours
    await prisma.$transaction(
      rawHours.map((h) =>
        prisma.workingHours.upsert({
          where: {
            organizationId_dayOfWeek: {
              organizationId: orgId,
              dayOfWeek: h.dayOfWeek,
            },
          },
          update: {
            openTime: h.isClosed ? null : h.openTime || null,
            closeTime: h.isClosed ? null : h.closeTime || null,
            isClosed: !!h.isClosed,
            breakStart: h.isClosed ? null : h.breakStart || null,
            breakEnd: h.isClosed ? null : h.breakEnd || null,
          },
          create: {
            organizationId: orgId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.isClosed ? null : h.openTime || null,
            closeTime: h.isClosed ? null : h.closeTime || null,
            isClosed: !!h.isClosed,
            breakStart: h.isClosed ? null : h.breakStart || null,
            breakEnd: h.isClosed ? null : h.breakEnd || null,
          },
        })
      )
    );

    // Schedule site sync if site is published
    try {
      await scheduleSiteSync(orgId, 'publish');
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      settings: savedSettings,
    });
  } catch (error) {
    console.error('Update working hours error:', error);
    return NextResponse.json({ error: 'Yadda saxlanarkən xəta baş verdi' }, { status: 500 });
  }
}

