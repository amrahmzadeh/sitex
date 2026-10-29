'use client';

import { useEffect, useState } from 'react';
import { Users, Globe, ShieldAlert, Clock, CheckCircle2, XCircle } from 'lucide-react';

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Ümumi İstifadəçi', value: stats.totalUsers, icon: Users, color: '#7C5CFC' },
    { label: 'Aktiv İstifadəçi', value: stats.activeUsers, icon: CheckCircle2, color: '#34D399' },
    { label: 'Bloklanmış', value: stats.bannedUsers, icon: ShieldAlert, color: '#F87171' },
    { label: 'Müddəti Bitmiş', value: stats.expiredUsers, icon: Clock, color: '#FBBF24' },
    { label: 'Ümumi Sayt', value: stats.totalSites, icon: Globe, color: '#22D3EE' },
    { label: 'Yayınlanmış', value: stats.publishedSites, icon: CheckCircle2, color: '#34D399' },
    { label: 'Qaralama', value: stats.unpublishedSites, icon: XCircle, color: '#8888A0' },
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>
          İcmal
        </h1>
        <p style={{ color: '#8888A0', fontSize: 15 }}>Platformanın ümumi vəziyyəti</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="dash-card"
            style={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontSize: 13, color: '#8888A0' }}>{label}</p>
            </div>
            <p style={{ fontSize: 32, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

