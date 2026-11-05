'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Globe2,
  ShieldAlert,
  Coffee,
  Copy,
} from 'lucide-react';
import {
  WorkingHoursEntry,
  DAY_NAMES_AZ,
  DEFAULT_TIMEZONE,
  DEFAULT_OFF_HOURS_MESSAGE,
  validateDaySchedule,
} from '@/lib/working-hours';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon to Sun

const TIMEZONES = [
  { value: 'Asia/Baku', label: 'Bakı (Asia/Baku, GMT+4)' },
  { value: 'Europe/Istanbul', label: 'İstanbul (Europe/Istanbul, GMT+3)' },
  { value: 'Europe/Moscow', label: 'Moskva (Europe/Moscow, GMT+3)' },
  { value: 'Europe/London', label: 'London (Europe/London, GMT+0/+1)' },
  { value: 'Europe/Berlin', label: 'Berlin (Europe/Berlin, GMT+1/+2)' },
  { value: 'America/New_York', label: 'Nyu-York (America/New_York, GMT-5/-4)' },
  { value: 'UTC', label: 'UTC (Qrinviç)' },
];

export default function WorkingHoursPage() {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [hours, setHours] = useState<WorkingHoursEntry[]>([]);
  const [initialHours, setInitialHours] = useState<WorkingHoursEntry[]>([]);
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [pauseOrders, setPauseOrders] = useState(false);
  const [offHoursMessage, setOffHoursMessage] = useState(DEFAULT_OFF_HOURS_MESSAGE);
  const [initialSettings, setInitialSettings] = useState({
    timezone: DEFAULT_TIMEZONE,
    pauseOrders: false,
    offHoursMessage: DEFAULT_OFF_HOURS_MESSAGE,
  });

  // Track active break editors
  const [breakOpen, setBreakOpen] = useState<Record<number, boolean>>({});

  // Fetch current org
  const loadOrg = useCallback(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null;
          const found = d.organizations.find((o: Organization) => o.id === saved);
          setCurrentOrg(found || d.organizations[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOrg();
    const handleOrgUpdate = () => loadOrg();
    window.addEventListener('org-updated', handleOrgUpdate);
    window.addEventListener('storage', handleOrgUpdate);
    return () => {
      window.removeEventListener('org-updated', handleOrgUpdate);
      window.removeEventListener('storage', handleOrgUpdate);
    };
  }, [loadOrg]);

  // Fetch hours for selected org
  const fetchHours = useCallback(async (orgId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/working-hours`);
      const data = await res.json();
      if (data.hours) {
        setHours(data.hours);
        setInitialHours(JSON.parse(JSON.stringify(data.hours)));

        // Open break editor for days that have break set
        const breaks: Record<number, boolean> = {};
        data.hours.forEach((h: WorkingHoursEntry) => {
          if (h.breakStart || h.breakEnd) breaks[h.dayOfWeek] = true;
        });
        setBreakOpen(breaks);
      }
      if (data.settings) {
        const tz = data.settings.timezone || DEFAULT_TIMEZONE;
        const po = !!data.settings.pauseOrdersOutsideHours;
        const msg = data.settings.offHoursMessage || DEFAULT_OFF_HOURS_MESSAGE;
        setTimezone(tz);
        setPauseOrders(po);
        setOffHoursMessage(msg);
        setInitialSettings({ timezone: tz, pauseOrders: po, offHoursMessage: msg });
      }
    } catch {
      setMessage({ type: 'error', text: 'İş saatları yüklənərkən xəta baş verdi' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchHours(currentOrg.id);
    }
  }, [currentOrg?.id, fetchHours]);

  const updateDay = (day: number, patch: Partial<WorkingHoursEntry>) => {
    setHours((prev) =>
      prev.map((item) => (item.dayOfWeek === day ? { ...item, ...patch } : item))
    );
  };

  const applyToAllOpenDays = (sourceDay: number) => {
    const src = hours.find((h) => h.dayOfWeek === sourceDay);
    if (!src) return;
    setHours((prev) =>
      prev.map((item) => {
        if (item.isClosed) return item;
        return {
          ...item,
          openTime: src.openTime,
          closeTime: src.closeTime,
          breakStart: src.breakStart,
          breakEnd: src.breakEnd,
        };
      })
    );
    setMessage({
      type: 'success',
      text: `${DAY_NAMES_AZ[sourceDay]} saatları digər açıq günlərə tətbiq edildi`,
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReset = () => {
    setHours(JSON.parse(JSON.stringify(initialHours)));
    setTimezone(initialSettings.timezone);
    setPauseOrders(initialSettings.pauseOrders);
    setOffHoursMessage(initialSettings.offHoursMessage);
    setMessage({ type: 'success', text: 'Dəyişikliklər ləğv edildi' });
    setTimeout(() => setMessage(null), 2500);
  };

  const handleSave = async () => {
    if (!currentOrg?.id) return;

    // Validate
    for (const h of hours) {
      const err = validateDaySchedule(h);
      if (err) {
        setMessage({ type: 'error', text: `${DAY_NAMES_AZ[h.dayOfWeek]}: ${err}` });
        return;
      }
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/working-hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours,
          settings: {
            timezone,
            pauseOrdersOutsideHours: pauseOrders,
            offHoursMessage,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yadda saxlanıla bilmədi');
      }

      setInitialHours(JSON.parse(JSON.stringify(hours)));
      setInitialSettings({ timezone, pauseOrders, offHoursMessage });
      setMessage({ type: 'success', text: 'İş saatları uğurla yadda saxlanıldı!' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xəta baş verdi' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 68, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 80px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(0, 211, 125, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00D37D',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                İş Saatları
              </h1>
              <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0' }}>
                {currentOrg ? (
                  <>
                    <strong style={{ color: '#00D37D' }}>{currentOrg.name}</strong> saytının iş
                    qrafiki və sifariş rejimi
                  </>
                ) : (
                  'Saytın iş qrafikini və qeyri-iş vaxtı sifariş siyasətini idarə edin'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleReset}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #383334',
              color: '#B0B0B8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={15} />
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              background: '#00D37D',
              border: 'none',
              color: '#0D0F12',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(0, 211, 125, 0.3)',
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Yadda saxlanılır...' : 'Yadda saxla'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 500,
              background:
                message.type === 'success'
                  ? 'rgba(0, 211, 125, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${
                message.type === 'success'
                  ? 'rgba(0, 211, 125, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)'
              }`,
              color: message.type === 'success' ? '#00D37D' : '#F87171',
            }}
          >
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 1: Off-hours Order Control & Timezone */}
      <div
        style={{
          background: '#161921',
          border: '1px solid #2A2C38',
          borderRadius: 14,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', margin: '0 0 16px' }}>
          Sifariş & Saat Qurşağı Tənzimləmələri
        </h2>

        <div style={{ display: 'grid', gap: 20 }}>
          {/* Pause orders toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              padding: 16,
              borderRadius: 12,
              background: pauseOrders ? 'rgba(0, 211, 125, 0.05)' : '#111315',
              border: `1px solid ${pauseOrders ? 'rgba(0, 211, 125, 0.3)' : '#262833'}`,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: pauseOrders ? 'rgba(0, 211, 125, 0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: pauseOrders ? '#00D37D' : '#8888A0',
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <label
                  htmlFor="pause-toggle"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#F5F5F7',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                >
                  Qeyri-iş saatında sifarişləri dayandır
                </label>
                <p style={{ fontSize: 12, color: '#8888A0', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Aktiv olduqda, saytda iş saatından kənar vaxtlarda &quot;Sifariş et&quot; və səbət
                  düymələri avtomatik deaktiv ediləcək və müştəriyə məlumat bildirişi
                  göstəriləcək.
                </p>
              </div>
            </div>

            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: 48,
                height: 26,
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <input
                id="pause-toggle"
                type="checkbox"
                checked={pauseOrders}
                onChange={(e) => setPauseOrders(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: pauseOrders ? '#00D37D' : '#383334',
                  transition: '0.2s',
                  borderRadius: 26,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: "''",
                    height: 20,
                    width: 20,
                    left: pauseOrders ? 25 : 3,
                    bottom: 3,
                    backgroundColor: '#fff',
                    transition: '0.2s',
                    borderRadius: '50%',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Conditional message */}
          {pauseOrders && (
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#B0B0B8',
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Qeyri-iş saatı bildiriş mətni
              </label>
              <textarea
                value={offHoursMessage}
                onChange={(e) => setOffHoursMessage(e.target.value)}
                rows={2}
                placeholder={DEFAULT_OFF_HOURS_MESSAGE}
                style={{
                  width: '100%',
                  background: '#111315',
                  border: '1px solid #2A2C38',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#F5F5F7',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <p style={{ fontSize: 11, color: '#777788', margin: '4px 0 0' }}>
                Saytda növbəti açılış vaxtı (məs: &quot;Növbəti açılış: Sabah 09:00&quot;) avtomatik bu
                mətnin sonuna əlavə edilir.
              </p>
            </div>
          )}

          {/* Timezone picker */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Globe2 size={15} color="#00D37D" />
              <label style={{ fontSize: 12, fontWeight: 600, color: '#B0B0B8' }}>
                Saat Qurşağı (Timezone)
              </label>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 400,
                background: '#111315',
                border: '1px solid #2A2C38',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#F5F5F7',
                fontSize: 13,
                outline: 'none',
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 11, color: '#777788', margin: '4px 0 0' }}>
              İş saatı müqayisəsi və sifariş qəbulu seçilmiş saat qurşağı üzrə dəqiq hesablanır.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Weekly Schedule */}
      <div
        style={{
          background: '#161921',
          border: '1px solid #2A2C38',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
              Həftəlik İş Qrafiki
            </h2>
            <p style={{ fontSize: 12, color: '#8888A0', margin: '4px 0 0' }}>
              Hər gün üçün açılış, bağlanış və istəyə görə fasilə vaxtını təyin edin.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {ORDERED_DAYS.map((day) => {
            const entry = hours.find((h) => h.dayOfWeek === day) || {
              dayOfWeek: day,
              openTime: '09:00',
              closeTime: '22:00',
              isClosed: false,
            };
            const isClosed = !!entry.isClosed;
            const hasBreak = !!breakOpen[day];

            return (
              <div
                key={day}
                style={{
                  background: isClosed ? 'rgba(255,255,255,0.015)' : '#111315',
                  border: `1px solid ${isClosed ? '#262833' : '#2A2C38'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  {/* Day name & Closed checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 160 }}>
                    <div style={{ minWidth: 120 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isClosed ? '#777788' : '#F5F5F7',
                        }}
                      >
                        {DAY_NAMES_AZ[day]}
                      </span>
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        color: isClosed ? '#F87171' : '#B0B0B8',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: isClosed ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isClosed}
                        onChange={(e) => updateDay(day, { isClosed: e.target.checked })}
                        style={{ cursor: 'pointer' }}
                      />
                      {isClosed ? 'Bağlıdır' : 'İş günüdür'}
                    </label>
                  </div>

                  {/* Hours inputs */}
                  {!isClosed && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#8888A0' }}>Açılış:</span>
                        <input
                          type="time"
                          value={entry.openTime || '09:00'}
                          onChange={(e) => updateDay(day, { openTime: e.target.value })}
                          style={{
                            background: '#161921',
                            border: '1px solid #383334',
                            borderRadius: 8,
                            padding: '6px 10px',
                            color: '#F5F5F7',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>

                      <span style={{ color: '#666' }}>—</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: '#8888A0' }}>Bağlanış:</span>
                        <input
                          type="time"
                          value={entry.closeTime || '22:00'}
                          onChange={(e) => updateDay(day, { closeTime: e.target.value })}
                          style={{
                            background: '#161921',
                            border: '1px solid #383334',
                            borderRadius: 8,
                            padding: '6px 10px',
                            color: '#F5F5F7',
                            fontSize: 13,
                            outline: 'none',
                          }}
                        />
                      </div>

                      {/* Break toggle button */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !hasBreak;
                          setBreakOpen((prev) => ({ ...prev, [day]: nextState }));
                          if (!nextState) {
                            updateDay(day, { breakStart: null, breakEnd: null });
                          } else if (!entry.breakStart) {
                            updateDay(day, { breakStart: '13:00', breakEnd: '14:00' });
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: hasBreak ? 'rgba(0, 211, 125, 0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${hasBreak ? 'rgba(0, 211, 125, 0.3)' : '#383334'}`,
                          color: hasBreak ? '#00D37D' : '#999',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Nahar və ya fasilə vaxtı əlavə et"
                      >
                        <Coffee size={13} />
                        {hasBreak ? 'Fasilə var' : '+ Fasilə'}
                      </button>

                      {/* Copy to all button */}
                      <button
                        type="button"
                        onClick={() => applyToAllOpenDays(day)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid #383334',
                          color: '#B0B0B8',
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                        title="Bu saatları bütün açıq günlərə kopyala"
                      >
                        <Copy size={12} />
                        Hamısına tətbiq et
                      </button>
                    </div>
                  )}

                  {isClosed && (
                    <span style={{ fontSize: 12, color: '#777788', fontStyle: 'italic' }}>
                      Bütün gün qapalıdır
                    </span>
                  )}
                </div>

                {/* Break row */}
                {!isClosed && hasBreak && (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px dashed #2A2C38',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#E5A93C', fontWeight: 600 }}>
                      ☕ Fasilə vaxtı:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="time"
                        value={entry.breakStart || '13:00'}
                        onChange={(e) => updateDay(day, { breakStart: e.target.value })}
                        style={{
                          background: '#161921',
                          border: '1px solid #383334',
                          borderRadius: 6,
                          padding: '4px 8px',
                          color: '#F5F5F7',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                      <span style={{ color: '#666' }}>—</span>
                      <input
                        type="time"
                        value={entry.breakEnd || '14:00'}
                        onChange={(e) => updateDay(day, { breakEnd: e.target.value })}
                        style={{
                          background: '#161921',
                          border: '1px solid #383334',
                          borderRadius: 6,
                          padding: '4px 8px',
                          color: '#F5F5F7',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBreakOpen((prev) => ({ ...prev, [day]: false }));
                        updateDay(day, { breakStart: null, breakEnd: null });
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#F87171',
                        fontSize: 11,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Sil
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

