'use client';

import React, { useMemo } from 'react';
import { ThemeDefinition } from './types';

interface ThemeProviderProps {
  theme: ThemeDefinition | Partial<ThemeDefinition>;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVars = useMemo(() => {
    const tokens = theme.tokens;
    if (!tokens) return {};

    return {
      '--color-primary': tokens.colors?.primary || '#D4A574',
      '--color-secondary': tokens.colors?.secondary || '#2C1810',
      '--color-accent': tokens.colors?.accent || '#E8C9A0',
      '--color-bg': tokens.colors?.background || '#FFF8F0',
      '--color-text': tokens.colors?.text || '#1A1A1A',
      '--color-whatsapp': tokens.colors?.whatsapp || '#25D366',
      '--color-whatsapp-icon': tokens.colors?.whatsappIcon || '#FFFFFF',
      '--font-heading': tokens.typography?.headingFont || 'Playfair Display',
      '--font-body': tokens.typography?.bodyFont || 'Inter',
      '--border-radius': tokens.radius?.borderRadius || '12px',
      '--hero-height': tokens.spacing?.heroHeight || '85vh',
    } as React.CSSProperties;
  }, [theme]);

  return (
    <div className="theme-provider-root" style={cssVars}>
      {children}
    </div>
  );
}

