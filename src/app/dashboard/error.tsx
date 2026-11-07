'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: '#F5F5F7',
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(248, 113, 113, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <AlertCircle size={32} color="#F87171" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: '#F87171' }}>
        Dashboard Xətası
      </h2>
      <p style={{ color: '#8888A0', fontSize: 14, maxWidth: 440, lineHeight: 1.5, margin: '0 0 24px' }}>
        {error?.message || 'Bu panel səhifəsi yüklənərkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => reset()}
          className="dash-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}
        >
          <RefreshCw size={14} /> Yenidən Yüklə
        </button>
        <Link
          href="/dashboard"
          className="dash-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, textDecoration: 'none' }}
        >
          <Home size={14} /> Ana Səhifə
        </Link>
      </div>
    </div>
  );
}

