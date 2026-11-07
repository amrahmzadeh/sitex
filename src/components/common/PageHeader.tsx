'use client';

import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.FC<{ size?: number; color?: string; className?: string }>;
  iconColor?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = '#00D37D',
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 28,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${iconColor}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={24} color={iconColor} />
          </div>
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#F5F5F7',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p style={{ color: '#8888A0', fontSize: 14, margin: '4px 0 0', lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

