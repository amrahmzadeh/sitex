'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  minHeight?: number | string;
  rows?: number;
}

export function LoadingState({
  message = 'Məlumatlar yüklənir...',
  minHeight = 240,
  rows,
}: LoadingStateProps) {
  if (rows && rows > 0) {
    return (
      <div style={{ display: 'grid', gap: 12, width: '100%' }}>
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 12,
        color: '#8888A0',
        padding: 32,
      }}
    >
      <Loader2 size={26} color="#00D37D" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{message}</span>
    </div>
  );
}

export default LoadingState;

