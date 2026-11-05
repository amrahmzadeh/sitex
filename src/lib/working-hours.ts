export interface WorkingHoursEntry {
  dayOfWeek: number; // 0 = Bazar, 1 = Bazar ertəsi, ..., 6 = Şənbə
  openTime?: string | null;
  closeTime?: string | null;
  isClosed?: boolean;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface WorkingHoursSettingsData {
  timezone?: string;
  pauseOrdersOutsideHours?: boolean;
  offHoursMessage?: string | null;
}

export const DAY_NAMES_AZ = [
  'Bazar',
  'Bazar ertəsi',
  'Çərşənbə axşamı',
  'Çərşənbə',
  'Cümə axşamı',
  'Cümə',
  'Şənbə',
];

export const DEFAULT_TIMEZONE = 'Asia/Baku';

export const DEFAULT_OFF_HOURS_MESSAGE =
  'Hazırda qeyri-iş saatıdır. Sifarişlər növbəti iş saatında qəbul olunacaq.';

export const DEFAULT_WEEK_SCHEDULE: WorkingHoursEntry[] = [
  { dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '23:00', isClosed: false },
  { dayOfWeek: 6, openTime: '10:00', closeTime: '23:00', isClosed: false },
  { dayOfWeek: 0, openTime: '10:00', closeTime: '22:00', isClosed: false },
];

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function formatMinutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getTimezoneParts(
  timezone = DEFAULT_TIMEZONE,
  targetDate: Date = new Date()
): { dayOfWeek: number; currentMinutes: number; timeStr: string } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    const parts = formatter.formatToParts(targetDate);
    let weekdayStr = 'Sun';
    let hour = 0;
    let minute = 0;

    for (const p of parts) {
      if (p.type === 'weekday') weekdayStr = p.value;
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
    }

    const dayOfWeek = WEEKDAY_MAP[weekdayStr] ?? targetDate.getDay();
    const currentMinutes = hour * 60 + minute;
    return {
      dayOfWeek,
      currentMinutes,
      timeStr: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    };
  } catch {
    // Fallback if timezone string is invalid
    const dayOfWeek = targetDate.getDay();
    const currentMinutes = targetDate.getHours() * 60 + targetDate.getMinutes();
    return {
      dayOfWeek,
      currentMinutes,
      timeStr: formatMinutesToTime(currentMinutes),
    };
  }
}

export interface StatusResult {
  isOpen: boolean;
  reason?: 'closed_day' | 'before_open' | 'after_close' | 'in_break' | 'no_schedule';
  nextOpenTime?: string | null;
  todaySchedule?: WorkingHoursEntry;
}

/**
 * Checks whether the business is currently open based on weekly schedule, timezone,
 * overnight shifts (e.g. 18:00 - 02:00), and break windows.
 */
export function computeWorkingStatus(
  schedule: WorkingHoursEntry[] = [],
  timezone = DEFAULT_TIMEZONE,
  atDate: Date = new Date()
): StatusResult {
  const effectiveSchedule =
    schedule && schedule.length > 0 ? schedule : DEFAULT_WEEK_SCHEDULE;

  const { dayOfWeek, currentMinutes } = getTimezoneParts(timezone, atDate);
  const prevDayOfWeek = (dayOfWeek + 6) % 7;

  const today = effectiveSchedule.find((s) => s.dayOfWeek === dayOfWeek);
  const yesterday = effectiveSchedule.find((s) => s.dayOfWeek === prevDayOfWeek);

  // 1. Check yesterday's overnight shift carry-over (e.g., Friday 18:00-02:00 checked on Saturday 01:30)
  if (yesterday && !yesterday.isClosed && yesterday.openTime && yesterday.closeTime) {
    const yOpen = parseTimeToMinutes(yesterday.openTime);
    const yClose = parseTimeToMinutes(yesterday.closeTime);
    if (yOpen !== null && yClose !== null && yClose < yOpen) {
      // Overnight shift! Today between 00:00 and yClose is open
      if (currentMinutes < yClose) {
        // Check if yesterday had a break that falls in morning hours
        if (yesterday.breakStart && yesterday.breakEnd) {
          const bStart = parseTimeToMinutes(yesterday.breakStart);
          const bEnd = parseTimeToMinutes(yesterday.breakEnd);
          if (bStart !== null && bEnd !== null && bStart < yClose) {
            if (currentMinutes >= bStart && currentMinutes < bEnd) {
              return {
                isOpen: false,
                reason: 'in_break',
                nextOpenTime: formatMinutesToTime(bEnd),
                todaySchedule: yesterday,
              };
            }
          }
        }
        return {
          isOpen: true,
          todaySchedule: yesterday,
        };
      }
    }
  }

  // 2. Check today's schedule
  if (!today || today.isClosed) {
    return {
      isOpen: false,
      reason: 'closed_day',
      nextOpenTime: findNextOpen(effectiveSchedule, dayOfWeek, currentMinutes),
      todaySchedule: today,
    };
  }

  const openMin = parseTimeToMinutes(today.openTime);
  const closeMin = parseTimeToMinutes(today.closeTime);

  // If times are not specified or 24/7 (00:00 to 00:00 or null)
  if (openMin === null || closeMin === null) {
    return { isOpen: true, todaySchedule: today };
  }

  // 24 hours open
  if (openMin === 0 && (closeMin === 0 || closeMin === 1440 || closeMin === 1439)) {
    return { isOpen: true, todaySchedule: today };
  }

  const isOvernight = closeMin <= openMin;

  let isInHours = false;
  if (isOvernight) {
    // Overnight: e.g. 18:00 to 02:00 -> open if currentMinutes >= 18:00 (rest checked next day)
    isInHours = currentMinutes >= openMin;
  } else {
    // Standard: e.g. 09:00 to 22:00
    isInHours = currentMinutes >= openMin && currentMinutes < closeMin;
  }

  if (!isInHours) {
    const isBefore = currentMinutes < openMin;
    return {
      isOpen: false,
      reason: isBefore ? 'before_open' : 'after_close',
      nextOpenTime: findNextOpen(effectiveSchedule, dayOfWeek, currentMinutes),
      todaySchedule: today,
    };
  }

  // Check break
  if (today.breakStart && today.breakEnd) {
    const bStart = parseTimeToMinutes(today.breakStart);
    const bEnd = parseTimeToMinutes(today.breakEnd);
    if (bStart !== null && bEnd !== null) {
      if (currentMinutes >= bStart && currentMinutes < bEnd) {
        return {
          isOpen: false,
          reason: 'in_break',
          nextOpenTime: `Bu gün ${today.breakEnd}`,
          todaySchedule: today,
        };
      }
    }
  }

  return {
    isOpen: true,
    todaySchedule: today,
  };
}

function findNextOpen(
  schedule: WorkingHoursEntry[],
  currentDay: number,
  currentMinutes: number
): string | null {
  // Check today if it hasn't opened yet
  const today = schedule.find((s) => s.dayOfWeek === currentDay);
  if (today && !today.isClosed && today.openTime) {
    const openMin = parseTimeToMinutes(today.openTime);
    if (openMin !== null && currentMinutes < openMin) {
      return `Bu gün ${today.openTime}`;
    }
  }

  // Search upcoming 7 days
  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (currentDay + offset) % 7;
    const entry = schedule.find((s) => s.dayOfWeek === nextDay);
    if (entry && !entry.isClosed && entry.openTime) {
      const dayLabel = offset === 1 ? 'Sabah' : DAY_NAMES_AZ[nextDay];
      return `${dayLabel} ${entry.openTime}`;
    }
  }

  return null;
}

/**
 * Validates a single day's hours:
 * - If closed, valid.
 * - If open, openTime and closeTime must be valid HH:MM strings.
 * - If break provided, break must be between open and close (for non-overnight)
 */
export function validateDaySchedule(entry: WorkingHoursEntry): string | null {
  if (entry.isClosed) return null;
  if (!entry.openTime || !entry.closeTime) {
    return 'Açılış və bağlanış vaxtı daxil edilməlidir';
  }

  const open = parseTimeToMinutes(entry.openTime);
  const close = parseTimeToMinutes(entry.closeTime);
  if (open === null || close === null) {
    return 'Vaxt formatı düzgün deyil (məs. 09:00)';
  }

  // Overnight is allowed (e.g. 18:00 - 02:00)

  if (entry.breakStart || entry.breakEnd) {
    if (!entry.breakStart || !entry.breakEnd) {
      return 'Fasilə üçün həm başlanğıc, həm də son vaxt seçilməlidir';
    }
    const bStart = parseTimeToMinutes(entry.breakStart);
    const bEnd = parseTimeToMinutes(entry.breakEnd);
    if (bStart === null || bEnd === null) {
      return 'Fasilə vaxt formatı düzgün deyil';
    }
    if (bEnd <= bStart) {
      return 'Fasilənin bitmə vaxtı başlanğıcından sonra olmalıdır';
    }
  }

  return null;
}

