'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  WorkingHoursEntry,
  WorkingHoursSettingsData,
  DEFAULT_WEEK_SCHEDULE,
  DEFAULT_TIMEZONE,
  DEFAULT_OFF_HOURS_MESSAGE,
  computeWorkingStatus,
  StatusResult,
} from '@/lib/working-hours';

export interface UseWorkingHoursOptions {
  workingHours?: WorkingHoursEntry[] | null;
  settings?: WorkingHoursSettingsData | null;
  refreshIntervalMs?: number;
}

export interface UseWorkingHoursReturn {
  isOpen: boolean;
  isOrdersPaused: boolean;
  noticeMessage: string;
  nextOpenTime: string | null;
  todaySchedule?: WorkingHoursEntry;
  reason?: StatusResult['reason'];
  timezone: string;
  schedule: WorkingHoursEntry[];
}

export function useWorkingHours({
  workingHours,
  settings,
  refreshIntervalMs = 30000,
}: UseWorkingHoursOptions = {}): UseWorkingHoursReturn {
  const timezone = settings?.timezone || DEFAULT_TIMEZONE;
  const pauseOrdersOutsideHours = !!settings?.pauseOrdersOutsideHours;
  const customMessage = settings?.offHoursMessage?.trim() || DEFAULT_OFF_HOURS_MESSAGE;

  const schedule = useMemo(() => {
    return workingHours && workingHours.length > 0 ? workingHours : DEFAULT_WEEK_SCHEDULE;
  }, [workingHours]);

  const [status, setStatus] = useState<StatusResult>(() =>
    computeWorkingStatus(schedule, timezone, new Date())
  );

  useEffect(() => {
    // Initial evaluation
    setStatus(computeWorkingStatus(schedule, timezone, new Date()));

    // Periodic evaluation for live status changes
    const interval = setInterval(() => {
      setStatus(computeWorkingStatus(schedule, timezone, new Date()));
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [schedule, timezone, refreshIntervalMs]);

  const isOpen = status.isOpen;
  const isOrdersPaused = pauseOrdersOutsideHours && !isOpen;

  // Build user-friendly message
  const nextText = status.nextOpenTime ? ` Növbəti açılış: ${status.nextOpenTime}` : '';
  const noticeMessage = `${customMessage}${nextText}`;

  return {
    isOpen,
    isOrdersPaused,
    noticeMessage,
    nextOpenTime: status.nextOpenTime || null,
    todaySchedule: status.todaySchedule,
    reason: status.reason,
    timezone,
    schedule,
  };
}

