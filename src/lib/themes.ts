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
  brandFont?: string;
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
  // Backgrounds (Navbar, Form/Cards, Site, Footer)
  navbarBgType?: 'solid' | 'gradient';
  navbarBgColor?: string;
  navbarGradientFrom?: string;
  navbarGradientTo?: string;
  navbarGradientDir?: string;

  formBgType?: 'solid' | 'gradient';
  formBgColor?: string;
  formGradientFrom?: string;
  formGradientTo?: string;
  formGradientDir?: string;

  siteBgType?: 'solid' | 'gradient';
  siteBgColor?: string;
  siteGradientFrom?: string;
  siteGradientTo?: string;
  siteGradientDir?: string;

  footerBgType?: 'solid' | 'gradient';
  footerBgColor?: string;
  footerGradientFrom?: string;
  footerGradientTo?: string;
  footerGradientDir?: string;
  // Pro Template Module
  isProTemplate?: boolean;
  proTemplateId?: string;

  // Template Content & Image Customizations
  heroBadgeText?: string;
  heroFeature1?: string;
  heroFeature2?: string;
  heroFeature3?: string;
  heroDishBadge?: string;
  heroDishImage?: string;
  heroDishTitle?: string;
  heroDishSubtitle?: string;
  heroDishPriceNote?: string;

  menuSubtitle?: string;

  aboutFeature1Title?: string;
  aboutFeature1Desc?: string;
  aboutFeature2Title?: string;
  aboutFeature2Desc?: string;
  aboutImageUrl?: string;
  aboutBadgeLeft?: string;
  aboutBadgeRight?: string;

  contactSubtitle?: string;
  workingHoursTitle?: string;
  workingHoursSubtitle?: string;

  footerCopyrightText?: string;
  footerPlatformText?: string;
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
  warmGourmetPro: {
    id: 'warmGourmetPro',
    name: 'Warm Gourmet (PRO)',
    primaryColor: '#ffc665',
    secondaryColor: '#1e2022',
    accentColor: '#e5a93c',
    backgroundColor: '#121416',
    textColor: '#e2e2e5',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    borderRadius: '12px',
    heroHeight: '85vh',
    heroOverlay: 0.5,
    templateId: 'warm-gourmet-pro',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
    headerStyle: 'glass',
    footerStyle: 'dark',
    isProTemplate: true,
    proTemplateId: 'warm-gourmet',
    whatsappColor: '#25D366',
    whatsappIconColor: '#FFFFFF',
    siteBgType: 'solid',
    siteBgColor: '#121416',
    navbarBgType: 'solid',
    navbarBgColor: '#111315',
    formBgType: 'solid',
    formBgColor: '#181B1E',
    footerBgType: 'solid',
    footerBgColor: '#0c0e10',
    heroBadgeText: 'ORİJİNAL STREET FOOD DADI',
    heroFeature1: 'Təbii inqrediyentlər',
    heroFeature2: 'Gündəlik təzə bişirilir',
    heroFeature3: 'Sürətli çatdırılma',
    heroDishBadge: 'Günün Sevimli Təamı',
    heroDishSubtitle: 'Ənənəvi kərə yağı və xüsusi ədviyyatlarla',
    heroDishPriceNote: 'təzə və isti',
    menuSubtitle: 'Hər gün sevgi və ənənəvi reseptlərlə təzə bişirilən street food ləzzətləri.',
    aboutFeature1Title: 'Müştəri Məmnuniyyəti',
    aboutFeature1Desc: 'Hər bir qonağımıza səmimi münasibət və yüksək keyfiyyət zəmanəti.',
    aboutFeature2Title: 'Gündəlik Təzəlik',
    aboutFeature2Desc: 'Yeməklər yalnız gün ərzində sifarişlə təzə şəkildə hazırlanır.',
    aboutBadgeRight: 'Sürətli Çatdırılma',
    contactSubtitle: 'Sualınız var və ya sifariş vermək istəyirsiniz? Bizimlə dərhal əlaqə saxlayın.',
    workingHoursTitle: 'İş saatları',
    workingHoursSubtitle: 'Həftəlik iş qrafiki',
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
  if (theme.brandFont) fonts.add(theme.brandFont);
  
  const fontParams = Array.from(fonts)
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`)
    .join('&');
  
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

export const BRAND_FONTS = [
  { name: 'Playfair Display', label: 'Playfair Display', category: 'Klassik Lüks Serif' },
  { name: 'Cinzel', label: 'Cinzel', category: 'Kral & Qədim Roma' },
  { name: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'Gourmet Zərif Serif' },
  { name: 'Abril Fatface', label: 'Abril Fatface', category: 'Qalın & Dəbdəbəli Display' },
  { name: 'DM Serif Display', label: 'DM Serif Display', category: 'Müasir Editorial' },
  { name: 'Marcellus', label: 'Marcellus', category: 'Aralıq Dənizi Zərifliyi' },
  { name: 'Prata', label: 'Prata', category: 'Zərif Moda & Lüks' },
  { name: 'Righteous', label: 'Righteous', category: 'Modern & Enerji' },
  { name: 'Bebas Neue', label: 'Bebas Neue', category: 'Güclü Street Food' },
  { name: 'Oswald', label: 'Oswald', category: 'Möhkəm & Kompakt' },
  { name: 'Montserrat', label: 'Montserrat', category: 'Modern Həndəsi Qalın' },
  { name: 'Outfit', label: 'Outfit', category: 'Minimalist Premium' },
  { name: 'Pacifico', label: 'Pacifico', category: 'İsti & Səmimi Əl Yazısı' },
  { name: 'Lobster', label: 'Lobster', category: 'Məşhur Retro Şrift' },
  { name: 'Satisfy', label: 'Satisfy', category: 'Usta Əl İşləməsi' },
  { name: 'Great Vibes', label: 'Great Vibes', category: 'Lüks Xəttatlıq (Script)' },
  { name: 'Dancing Script', label: 'Dancing Script', category: 'Canlı Əl Yazısı' },
  { name: 'Kaushan Script', label: 'Kaushan Script', category: 'Dinamik Fırça' },
];

export function resolveBg(
  type?: 'solid' | 'gradient',
  solid?: string,
  from?: string,
  to?: string,
  dir?: string,
  fallback?: string
): string {
  if (type === 'gradient') {
    const f = from || solid || '#1A1A2E';
    const t = to || '#16213E';
    const d = dir || '135deg';
    return `linear-gradient(${d}, ${f}, ${t})`;
  }
  return solid || fallback || 'transparent';
}

