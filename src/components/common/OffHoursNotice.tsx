'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface OffHoursNoticeProps {
  message: string;
  variant?: 'banner' | 'inline' | 'compact';
  style?: React.CSSProperties;
}

export function OffHoursNotice({
  message,
  variant = 'banner',
  style,
}: OffHoursNoticeProps) {
  if (!message) return null;

  if (variant === 'compact') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: '#F87171',
          padding: '6px 10px',
          borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          ...style,
        }}
      >
        <Clock size={14} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          fontSize: 13,
          lineHeight: 1.45,
          color: '#FFA2A2',
          padding: '10px 14px',
          borderRadius: 10,
          background: 'rgba(220, 38, 38, 0.12)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          ...style,
        }}
      >
        <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1, color: '#F87171' }} />
        <span>{message}</span>
      </div>
    );
  }

  // Banner variant
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '12px 18px',
        borderRadius: 12,
        background: 'rgba(15, 17, 23, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        color: '#FCA5A5',
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        ...style,
      }}
    >
      <Clock size={17} color="#F87171" style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
  );
}

