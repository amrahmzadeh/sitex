import Link from 'next/link';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';

export default function AdminNotFound() {
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
        <ShieldAlert size={32} color="#F87171" />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>
        Admin Səhifəsi Tapılmadı
      </h2>
      <p style={{ color: '#8888A0', fontSize: 14, maxWidth: 420, lineHeight: 1.5, margin: '0 0 24px' }}>
        Axtardığınız super admin bölməsi tapılmadı və ya qeyri-dəqiq ünvan daxil etmisiniz.
      </p>
      <Link
        href="/admin"
        className="dash-btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: 13, textDecoration: 'none' }}
      >
        <LayoutDashboard size={15} /> Super Admin İcmalı
      </Link>
    </div>
  );
}

