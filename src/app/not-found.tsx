import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function GlobalNotFound() {
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
          background: 'rgba(0, 211, 125, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Compass size={36} color="#00D37D" />
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
        404 — Səhifə Tapılmadı
      </h1>
      <p style={{ color: '#8888A0', fontSize: 15, maxWidth: 440, lineHeight: 1.6, margin: '0 0 28px' }}>
        Axtardığınız səhifə mövcud deyil, ünvanı dəyişdirilib və ya silinib.
      </p>
      <Link
        href="/dashboard"
        className="dash-btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 24px',
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        <Home size={16} /> Dashboard-a Qayıt
      </Link>
    </div>
  );
}

