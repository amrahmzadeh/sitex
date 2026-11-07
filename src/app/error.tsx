'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0F0F14',
        color: '#F5F5F7',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'rgba(248, 113, 113, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <AlertOctagon size={36} color="#F87171" />
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 10px', color: '#F87171' }}>
        Sistem Xətası Baş Verdi
      </h1>
      <p style={{ color: '#8888A0', fontSize: 15, maxWidth: 460, lineHeight: 1.6, margin: '0 0 28px' }}>
        Tətbiq işləyərkən gözlənilməz texniki nasazlıq yarandı. Zəhmət olmasa yenidən cəhd edin.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => reset()}
          className="dash-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', fontSize: 14 }}
        >
          <RefreshCw size={16} /> Yenidən Yüklə
        </button>
        <Link
          href="/dashboard"
          className="dash-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', fontSize: 14, textDecoration: 'none' }}
        >
          <Home size={16} /> Ana Səhifə
        </Link>
      </div>
    </div>
  );
}

