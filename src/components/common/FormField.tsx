'use client';

import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  style,
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#E8E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {label}
        {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 11, color: '#8888A0', lineHeight: 1.3 }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: '#F87171', fontWeight: 500, lineHeight: 1.3 }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;

