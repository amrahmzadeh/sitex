import { ThemeDefinition } from '../types';

export const elegantTheme: ThemeDefinition = {
  id: 'elegant',
  name: 'Elegant',
  slug: 'elegant',
  description: 'Zərif qızılı tonlar və klassik serif şriftlərlə premium dizayn.',
  previewGradient: ['#D4A574', '#FFF8F0'],
  category: ['restoran-ve-qida-sayti', 'kafe-ve-qehvexana', 'portfolio-sayti', 'butik'],
  version: '1.0.0',
  source: 'builtin',
  createdAt: '2026-01-01T00:00:00.000Z',
  tokens: {
    colors: {
      primary: '#D4A574',
      secondary: '#2C1810',
      accent: '#E8C9A0',
      background: '#FFF8F0',
      text: '#1A1A1A',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
    },
    spacing: {
      heroHeight: '85vh',
      heroOverlay: 0.45,
    },
    radius: {
      borderRadius: '12px',
    },
  },
  layout: {
    headerStyle: 'transparent',
    footerStyle: 'dark',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
  },
  sections: [],
};

