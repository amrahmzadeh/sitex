import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function DashboardNotFound() {
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
          background: 'rgba(0, 211, 125, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Compass size={32} color="#00D37D" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
        Dashboard Bölməsi Tapılmadı
      </h2>
      <p style={{ color: '#8888A0', fontSize: 14, maxWidth: 420, lineHeight: 1.5, margin: '0 0 24px' }}>
        Axtardığınız idarəetmə bölməsi mövcud deyil və ya giriş icazəniz yoxdur.
      </p>
      <Link
        href="/dashboard"
        className="dash-btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, textDecoration: 'none' }}
      >
        <Home size={15} /> Dashboard Ana Səhifəsi
      </Link>
    </div>
  );
}

