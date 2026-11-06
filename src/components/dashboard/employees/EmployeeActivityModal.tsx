'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Loader2, Clock, Globe, Shield, Activity } from 'lucide-react';
import { EmployeeItem, ActivityLogItem } from './types';

interface Props {
  employee: EmployeeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeActivityModal({ employee, isOpen, onClose }: Props) {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && employee) {
      setLoading(true);
      fetch(`/api/employees/${employee.id}/activities`)
        .then((r) => r.json())
        .then((d) => {
          setActivities(d.activities || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('az-AZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return { label: 'Giriş', color: '#00D37D', bg: 'rgba(0, 211, 125, 0.15)' };
      case 'CREATE':
        return { label: 'Yaradılma', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'UPDATE':
        return { label: 'Yenilənmə', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'PASSWORD_RESET':
        return { label: 'Şifrə Dəyişimi', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' };
      case 'DELETE':
        return { label: 'Silinmə', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { label: action, color: '#B0B0B8', bg: 'rgba(176, 176, 184, 0.15)' };
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#171717',
            border: '1px solid #383334',
            borderRadius: 16,
            width: '100%',
            maxWidth: 600,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid #383334',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3B82F6',
                }}
              >
                <History size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>
                  Fəaliyyət Tarixçəsi
                </h3>
                <p style={{ fontSize: 12, color: '#B0B0B8', margin: 0 }}>
                  {employee.fullName} ({employee.position || 'Əməkdaş'})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#B0B0B8',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 8,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
                <Loader2 size={28} className="animate-spin" color="#00D37D" />
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#B0B0B8' }}>
                <Activity size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 14 }}>Hələ heç bir fəaliyyət qeydə alınmayıb</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activities.map((act) => {
                  const badge = getActionBadge(act.action);
                  return (
                    <div
                      key={act.id}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: '#202024',
                        border: '1px solid #383334',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: badge.color,
                              background: badge.bg,
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            {badge.label}
                          </span>
                          {act.module && (
                            <span style={{ fontSize: 12, color: '#B0B0B8', background: '#2E292A', padding: '2px 6px', borderRadius: 4 }}>
                              {act.module}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#B0B0B8', fontSize: 11 }}>
                          <Clock size={12} />
                          <span>{formatDate(act.createdAt)}</span>
                        </div>
                      </div>

                      {act.description && (
                        <p style={{ fontSize: 13, color: '#F5F5F7', margin: 0 }}>
                          {act.description}
                        </p>
                      )}

                      {act.ipAddress && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#8888A0' }}>
                          <Globe size={11} />
                          <span>IP: {act.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

