import { ThemeDefinition } from '../types';

export const classicTheme: ThemeDefinition = {
  id: 'classic',
  name: 'Klassik',
  slug: 'classic',
  description: 'Zəngin qırmızı və qızılı elementlərlə ənənəvi, prestijli üslub.',
  previewGradient: ['#8B0000', '#FFFEF7'],
  category: ['sexsi-blog', 'tehsil-sayti', 'restoran-ve-qida-sayti', 'huquq-firmasi'],
  version: '1.0.0',
  source: 'builtin',
  createdAt: '2026-01-01T00:00:00.000Z',
  tokens: {
    colors: {
      primary: '#8B0000',
      secondary: '#1A1A2E',
      accent: '#FFD700',
      background: '#FFFEF7',
      text: '#2D2D2D',
    },
    typography: {
      headingFont: 'Merriweather',
      bodyFont: 'Source Sans 3',
    },
    spacing: {
      heroHeight: '80vh',
      heroOverlay: 0.55,
    },
    radius: {
      borderRadius: '8px',
    },
  },
  layout: {
    headerStyle: 'solid',
    footerStyle: 'dark',
    buttonStyle: 'solid',
    cardStyle: 'bordered',
  },
  sections: [],
};
