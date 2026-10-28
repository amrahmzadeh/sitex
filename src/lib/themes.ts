export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  heroHeight: string;
  heroOverlay: number;
  templateId: string;
  buttonStyle: 'solid' | 'outline' | 'ghost';
  cardStyle: 'elevated' | 'flat' | 'bordered';
  headerStyle: 'transparent' | 'solid' | 'glass';
  footerStyle: 'dark' | 'light' | 'accent';
  headerMediaType?: 'image' | 'video';
  headerImageUrl?: string;
  headerVideoUrl?: string;
  backgroundImageUrl?: string;
  backgroundOverlay?: number;
  whatsappColor?: string;
  whatsappIconColor?: string;
  heroLogoSize?: number;
  navLogoSize?: number;
  logoHasFrame?: boolean;
  logoSpacing?: number;
  logoMarginTop?: number;
}

export const defaultThemes: Record<string, ThemeConfig> = {
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    primaryColor: '#D4A574',
    secondaryColor: '#2C1810',
    accentColor: '#E8C9A0',
    backgroundColor: '#FFF8F0',
    textColor: '#1A1A1A',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    borderRadius: '12px',
    heroHeight: '85vh',
    heroOverlay: 0.45,
    templateId: 'elegant',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
    headerStyle: 'transparent',
    footerStyle: 'dark',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    primaryColor: '#FF6B35',
    secondaryColor: '#1B1B2F',
    accentColor: '#FFE4CC',
    backgroundColor: '#FAFAFA',
    textColor: '#1B1B2F',
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    borderRadius: '16px',
    heroHeight: '90vh',
    heroOverlay: 0.5,
    templateId: 'modern',
    buttonStyle: 'solid',
    cardStyle: 'flat',
    headerStyle: 'glass',
    footerStyle: 'dark',
  },
  classic: {
    id: 'classic',
    name: 'Klassik',
    primaryColor: '#8B0000',
    secondaryColor: '#1A1A2E',
    accentColor: '#FFD700',
    backgroundColor: '#FFFEF7',
    textColor: '#2D2D2D',
    headingFont: 'Merriweather',
    bodyFont: 'Source Sans 3',
    borderRadius: '8px',
    heroHeight: '80vh',
    heroOverlay: 0.55,
    templateId: 'classic',
    buttonStyle: 'solid',
    cardStyle: 'bordered',
    headerStyle: 'solid',
    footerStyle: 'dark',
  },
};

export function getThemeCSS(theme: Partial<ThemeConfig>): Record<string, string> {
  return {
    '--color-primary': theme.primaryColor || '#D4A574',
    '--color-secondary': theme.secondaryColor || '#2C1810',
    '--color-accent': theme.accentColor || '#E8C9A0',
    '--color-bg': theme.backgroundColor || '#FFF8F0',
    '--color-text': theme.textColor || '#1A1A1A',
    '--font-heading': theme.headingFont || 'Playfair Display',
    '--font-body': theme.bodyFont || 'Inter',
    '--border-radius': theme.borderRadius || '12px',
    '--hero-height': theme.heroHeight || '85vh',
    '--color-whatsapp': theme.whatsappColor || '#25D366',
    '--color-whatsapp-icon': theme.whatsappIconColor || '#FFFFFF',
  };
}

export function getGoogleFontsUrl(theme: Partial<ThemeConfig>): string {
  const fonts = new Set<string>();
  if (theme.headingFont) fonts.add(theme.headingFont);
  if (theme.bodyFont) fonts.add(theme.bodyFont);
  
  const fontParams = Array.from(fonts)
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`)
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}
