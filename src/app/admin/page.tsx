'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Globe, ShieldAlert, Clock, CheckCircle2, XCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { PageHeader, LoadingState } from '@/components/common';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  expiredUsers: number;
  totalSites: number;
  publishedSites: number;
  unpublishedSites: number;
}

export default function AdminPage() {
  const { error: toastError } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Stats>('/api/admin/stats');
      setStats(data);
    } catch (err: any) {
      toastError(err.message || 'Statistika yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = stats
    ? [
        { label: 'Ümumi İstifadəçi', value: stats.totalUsers, icon: Users, color: '#7C5CFC' },
        { label: 'Aktiv İstifadəçi', value: stats.activeUsers, icon: CheckCircle2, color: '#34D399' },
        { label: 'Bloklanmış', value: stats.bannedUsers, icon: ShieldAlert, color: '#F87171' },
        { label: 'Müddəti Bitmiş', value: stats.expiredUsers, icon: Clock, color: '#FBBF24' },
        { label: 'Ümumi Sayt', value: stats.totalSites, icon: Globe, color: '#22D3EE' },
        { label: 'Yayınlanmış', value: stats.publishedSites, icon: CheckCircle2, color: '#34D399' },
        { label: 'Qaralama', value: stats.unpublishedSites, icon: XCircle, color: '#8888A0' },
      ]
    : [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader
        title="İcmal"
        description="Platformanın ümumi vəziyyəti və qlobal statistik göstəricilər"
        icon={LayoutDashboard}
        iconColor="#F87171"
        actions={
          <button
            onClick={fetchStats}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <RefreshCw size={14} /> Yenilə
          </button>
        }
      />

      {loading ? (
        <LoadingState rows={3} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="dash-card"
              style={{ padding: 24, borderRadius: 16, border: '1px solid #383334', background: '#1A1A1E' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color={color} />
                </div>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>{label}</p>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color, margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
