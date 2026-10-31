import { ThemeDefinition } from '../types';

export const modernTheme: ThemeDefinition = {
  id: 'modern',
  name: 'Modern',
  slug: 'modern',
  description: 'Müasir kontrastlar, canlı narıncı vurğular və təmiz həndəsi xətlər.',
  previewGradient: ['#FF6B35', '#1B1B2F'],
  category: ['korporativ-sayt', 'onlayn-magaza', 'sehiyye-ve-saglamliq-sayti', 'restoran-ve-qida-sayti'],
  version: '1.0.0',
  source: 'builtin',
  createdAt: '2026-01-01T00:00:00.000Z',
  tokens: {
    colors: {
      primary: '#FF6B35',
      secondary: '#1B1B2F',
      accent: '#FFE4CC',
      background: '#FAFAFA',
      text: '#1B1B2F',
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
    },
    spacing: {
      heroHeight: '90vh',
      heroOverlay: 0.5,
    },
    radius: {
      borderRadius: '16px',
    },
  },
  layout: {
    headerStyle: 'glass',
    footerStyle: 'dark',
    buttonStyle: 'solid',
    cardStyle: 'flat',
  },
  sections: [],
};
