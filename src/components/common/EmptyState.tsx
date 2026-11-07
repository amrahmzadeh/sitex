'use client';

import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }>;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '50px 24px',
        textAlign: 'center',
        borderRadius: 16,
        border: '1px dashed #383334',
        background: 'rgba(26, 26, 30, 0.4)',
        width: '100%',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(136, 136, 160, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={28} color="#8888A0" />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F5F5F7', margin: '0 0 6px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: '#8888A0', fontSize: 13, maxWidth: 380, lineHeight: 1.5, margin: '0 0 20px' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;

