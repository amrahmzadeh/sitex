'use client';

import { useEffect } from 'react';

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Site Error Boundary caught:', error);
    try {
      // If a splash or session item was corrupt, clear it
      sessionStorage.clear();
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    } catch {}
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121416',
        color: '#e2e2e5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          marginBottom: 16,
        }}
      >
        ⚠️
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
        Səhifə yüklənərkən xəta baş verdi
      </h2>
      <p style={{ fontSize: 14, color: '#8888A0', maxWidth: 400, margin: '0 0 20px', lineHeight: 1.5 }}>
        Bağlantıda müvəqqəti problem yarandı. Səhifəni yeniləyərək yenidən cəhd edə bilərsiniz.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => {
            try {
              sessionStorage.clear();
              window.location.reload();
            } catch {
              reset();
            }
          }}
          style={{
            background: '#00D37D',
            color: '#111315',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Yenidən yüklə
        </button>
        <button
          onClick={() => window.history.back()}
          style={{
            background: '#232738',
            color: '#C8CAD8',
            border: '1px solid #33374D',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Geri qayıt
        </button>
      </div>
    </div>
  );
}
