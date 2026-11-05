import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWorkingStatus,
  parseTimeToMinutes,
  formatMinutesToTime,
  validateDaySchedule,
  WorkingHoursEntry,
} from '../src/lib/working-hours';

test('parseTimeToMinutes parses HH:MM correctly', () => {
  assert.equal(parseTimeToMinutes('09:30'), 570);
  assert.equal(parseTimeToMinutes('00:00'), 0);
  assert.equal(parseTimeToMinutes('23:59'), 1439);
  assert.equal(parseTimeToMinutes('invalid'), null);
  assert.equal(parseTimeToMinutes(''), null);
});

test('formatMinutesToTime formats minutes correctly', () => {
  assert.equal(formatMinutesToTime(570), '09:30');
  assert.equal(formatMinutesToTime(0), '00:00');
  assert.equal(formatMinutesToTime(1439), '23:59');
});

test('computeWorkingStatus normal day open hours', () => {
  // Monday 09:00 - 22:00
  const schedule: WorkingHoursEntry[] = [
    { dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 2, openTime: '09:00', closeTime: '22:00', isClosed: false },
  ];

  // 2026-11-02 was Monday. In Asia/Baku: 2026-11-02T12:00:00+04:00 (12:00 Baku time)
  const duringDay = new Date('2026-11-02T08:00:00Z'); // 12:00 in UTC+4
  const res = computeWorkingStatus(schedule, 'Asia/Baku', duringDay);
  assert.equal(res.isOpen, true);

  // Before open: 07:00 Baku time (03:00 UTC)
  const beforeOpen = new Date('2026-11-02T03:00:00Z');
  const resBefore = computeWorkingStatus(schedule, 'Asia/Baku', beforeOpen);
  assert.equal(resBefore.isOpen, false);
  assert.equal(resBefore.reason, 'before_open');
  assert.equal(resBefore.nextOpenTime, 'Bu gün 09:00');

  // After close: 23:00 Baku time (19:00 UTC)
  const afterClose = new Date('2026-11-02T19:00:00Z');
  const resAfter = computeWorkingStatus(schedule, 'Asia/Baku', afterClose);
  assert.equal(resAfter.isOpen, false);
  assert.equal(resAfter.reason, 'after_close');
  assert.equal(resAfter.nextOpenTime, 'Sabah 09:00');
});

test('computeWorkingStatus closed day', () => {
  const schedule: WorkingHoursEntry[] = [
    { dayOfWeek: 0, openTime: '09:00', closeTime: '22:00', isClosed: true }, // Sunday closed
    { dayOfWeek: 1, openTime: '10:00', closeTime: '22:00', isClosed: false }, // Monday
  ];

  // 2026-11-01 was Sunday.
  const sundayNoon = new Date('2026-11-01T08:00:00Z'); // 12:00 Baku
  const res = computeWorkingStatus(schedule, 'Asia/Baku', sundayNoon);
  assert.equal(res.isOpen, false);
  assert.equal(res.reason, 'closed_day');
  assert.equal(res.nextOpenTime, 'Sabah 10:00');
});

test('computeWorkingStatus overnight shift (18:00 to 02:00)', () => {
  const schedule: WorkingHoursEntry[] = [
    // Friday (5): 18:00 - 02:00
    { dayOfWeek: 5, openTime: '18:00', closeTime: '02:00', isClosed: false },
    // Saturday (6): 18:00 - 02:00
    { dayOfWeek: 6, openTime: '18:00', closeTime: '02:00', isClosed: false },
  ];

  // Friday night at 23:00 Baku time: 2026-11-06T19:00:00Z
  const fridayNight = new Date('2026-11-06T19:00:00Z');
  const resFri = computeWorkingStatus(schedule, 'Asia/Baku', fridayNight);
  assert.equal(resFri.isOpen, true);

  // Saturday morning at 01:30 Baku time (past midnight): 2026-11-06T21:30:00Z
  const satEarlyMorning = new Date('2026-11-06T21:30:00Z');
  const resSatMorning = computeWorkingStatus(schedule, 'Asia/Baku', satEarlyMorning);
  assert.equal(resSatMorning.isOpen, true); // Still open from Friday's shift!

  // Saturday at 03:00 Baku time: 2026-11-06T23:00:00Z
  const satAfterClose = new Date('2026-11-06T23:00:00Z');
  const resClosed = computeWorkingStatus(schedule, 'Asia/Baku', satAfterClose);
  assert.equal(resClosed.isOpen, false);
});

test('computeWorkingStatus handles break hours', () => {
  const schedule: WorkingHoursEntry[] = [
    {
      dayOfWeek: 1,
      openTime: '09:00',
      closeTime: '22:00',
      isClosed: false,
      breakStart: '13:00',
      breakEnd: '14:00',
    },
  ];

  // Monday at 13:30 Baku (09:30 UTC)
  const inBreak = new Date('2026-11-02T09:30:00Z');
  const res = computeWorkingStatus(schedule, 'Asia/Baku', inBreak);
  assert.equal(res.isOpen, false);
  assert.equal(res.reason, 'in_break');
  assert.equal(res.nextOpenTime, 'Bu gün 14:00');
});

test('validateDaySchedule checks hours and breaks', () => {
  assert.equal(validateDaySchedule({ dayOfWeek: 1, isClosed: true }), null);
  assert.equal(
    validateDaySchedule({ dayOfWeek: 1, isClosed: false, openTime: '', closeTime: '22:00' }),
    'Açılış və bağlanış vaxtı daxil edilməlidir'
  );
  assert.equal(
    validateDaySchedule({
      dayOfWeek: 1,
      isClosed: false,
      openTime: '09:00',
      closeTime: '22:00',
      breakStart: '14:00',
      breakEnd: '13:00',
    }),
    'Fasilənin bitmə vaxtı başlanğıcından sonra olmalıdır'
  );
  assert.equal(
    validateDaySchedule({
      dayOfWeek: 1,
      isClosed: false,
      openTime: '09:00',
      closeTime: '22:00',
      breakStart: '13:00',
      breakEnd: '14:00',
    }),
    null
  );
});

