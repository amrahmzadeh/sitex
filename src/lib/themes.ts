export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  category?: string[];
  previewGradient?: string[];
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
  heroDishId?: string;
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

  // Social Icons
  socialIconStyle?: 'circle' | 'rounded' | 'square';
  socialIconColor?: string;
  socialIconBgColor?: string;
  socialIconSize?: number;

  // Social Media Feed Module
  socialFeedEnabled?: boolean;
  socialFeedTitle?: string;
  socialFeedSubtitle?: string;
  socialFeedLayout?: 'grid' | 'carousel';
  socialFeedColumns?: 2 | 3 | 4;
  socialFeedCardStyle?: 'modern' | 'glass' | 'bordered';
  socialFeedBgColor?: string;
  socialFeedCardBg?: string;
  socialFeedTextColor?: string;
  socialFeedAccentColor?: string;
  socialFeedShowEngagement?: boolean;
}

export const defaultThemes: Record<string, ThemeConfig> = {
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Zərif qızılı tonlar və klassik serif şriftlərlə premium dizayn.',
    category: ['Restoran & Kafe', 'Zərif & Premium'],
    previewGradient: ['#D4A574', '#FFF8F0'],
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
    description: 'Müasir kontrastlar, canlı narıncı vurğular və təmiz həndəsi xətlər.',
    category: ['Müasir', 'Korporativ'],
    previewGradient: ['#FF6B35', '#1B1B2F'],
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
    description: 'Zəngin qırmızı və qızılı elementlərlə ənənəvi, prestijli üslub.',
    category: ['Klassik & Ənənəvi', 'Bloq'],
    previewGradient: ['#8B0000', '#FFFEF7'],
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
    description: 'Street food və qastronomiya məkanları üçün qaranlıq fon və kəhrəba vurğuları.',
    category: ['Restoran & Kafe', 'Street Food', 'PRO'],
    previewGradient: ['#ffc665', '#121416'],
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
  bySalmanov: {
    id: 'bySalmanov',
    name: 'By Salmanov (PRO)',
    description: 'Chef By Salmanov: qaranlıq zəmin, al-qırmızı vurğular, video hero və Cinzel şrifti ilə lüks dizayn.',
    category: ['Restoran & Kafe', 'Zərif & Premium', 'PRO'],
    previewGradient: ['#cc0000', '#121416'],
    primaryColor: '#cc0000',
    secondaryColor: '#cc0000',
    accentColor: '#cc0000',
    backgroundColor: '#121416',
    textColor: '#e2e2e5',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    brandFont: 'Cinzel',
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
    heroLogoSize: 185,
    navLogoSize: 72,
    logoHasFrame: false,
    logoMarginTop: 36,
    logoSpacing: 14,
    headerMediaType: 'video',
    headerVideoUrl: 'https://youtu.be/unS9d3lMIek',
    backgroundOverlay: 0.83,
    siteBgType: 'solid',
    siteBgColor: '#121416',
    navbarBgType: 'solid',
    navbarBgColor: '#111315',
    formBgType: 'solid',
    formBgColor: '#181B1E',
    footerBgType: 'solid',
    footerBgColor: '#0c0e10',
    aboutImageUrl: 'https://hezzinn.az/storage/01JS19AHW5WG51SX52YJ1WWJ6G.jpg',
    footerPlatformText: 'Sayt SiteX platforması ilə yaradılıb',
    heroBadgeText: 'LƏZZƏTİN ÜNVANI',
    heroFeature1: 'Təbii inqrediyentlər',
    heroFeature2: 'İsti yeməklər',
    heroFeature3: 'Sürətli çatdırılma',
    heroDishBadge: 'Günün Sevimli Təamı',
    heroDishTitle: 'Lülə',
    heroDishSubtitle: 'Ənənəvi kərə yağı və xüsusi ədviyyatlarla',
    heroDishPriceNote: 'təzə və isti',
    heroDishImage: 'https://evdar.az/wp-content/uploads/Tavada-L%C9%99zz%C9%99tli-L%C3%BCl%C9%99-Kabab.jpg',
    aboutFeature1Title: 'Müştəri Məmnuniyyəti',
    aboutFeature1Desc: 'Hər bir qonağımıza səmimi münasibət və yüksək keyfiyyət zəmanəti.',
    aboutFeature2Title: 'İsti Yeməklər',
    aboutFeature2Desc: 'Yeməklər yalnız gün ərzində sifarişlə təzə şəkildə hazırlanır.',
    aboutBadgeRight: 'Sürətli Çatdırılma',
    menuSubtitle: 'Hər gün sevgi və ənənəvi reseptlərlə təzə bişirilən street food və kabab ləzzətləri.',
    contactSubtitle: 'Sualınız var və ya sifariş vermək istəyirsiniz? Bizimlə dərhal əlaqə saxlayın.',
    workingHoursTitle: 'İş saatları',
    workingHoursSubtitle: 'Həftəlik iş qrafiki',
  },
  mehinIsmayilova: {
    id: 'mehinIsmayilova',
    name: 'Mehin İsmayılova (PRO)',
    description: 'Nitq mədəniyyəti, diksiya təlimləri, tədbir aparıcılığı və peşəkar səsləndirmə üçün zərif editorial şablon.',
    category: ['Müəssisə Saytı', 'Portfolio', 'Təlim & Kurs', 'Zərif & Premium', 'PRO'],
    previewGradient: ['#e6c184', '#101c2e'],
    primaryColor: '#765a26',
    secondaryColor: '#101c2e',
    accentColor: '#e6c184',
    backgroundColor: '#fcf9f8',
    textColor: '#1b1b1c',
    headingFont: 'Playfair Display',
    bodyFont: 'Manrope',
    brandFont: 'Playfair Display',
    borderRadius: '12px',
    heroHeight: '90vh',
    heroOverlay: 0.35,
    templateId: 'speech-academy',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
    headerStyle: 'glass',
    footerStyle: 'dark',
    isProTemplate: true,
    proTemplateId: 'speech-academy',
    whatsappColor: '#25D366',
    whatsappIconColor: '#FFFFFF',
    siteBgType: 'solid',
    siteBgColor: '#fcf9f8',
    navbarBgType: 'solid',
    navbarBgColor: 'rgba(252, 249, 248, 0.94)',
    formBgType: 'solid',
    formBgColor: '#ffffff',
    footerBgType: 'solid',
    footerBgColor: '#101c2e',
    heroBadgeText: 'PEŞƏKAR NİTQ MƏDƏNİYYƏTİ VƏ NATİQLİK',
    heroFeature1: '10+ illik təcrübə',
    heroFeature2: '500+ məzun',
    heroFeature3: '100+ mötəbər tədbir',
    headerImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANbKfhgJiJaQWxonyHpqyiuG_8xAtkaGR4HdgzZ80RfKLoxVjufA75yQcMh9pZqg-fZ4Mf9ajAlgBZKh30jO1_qqzx792KT0mIeLS6EMBWwqiHi85CS-8G-5cke5HuI2J5jP_EyClESq0krSvpbhMnm0MfH3Pm7J5Du7Oik6ZqD9h2eGT7u8dTZaqQDPAN3TJBObTLD-pU2feANU47-TQedwn5H7V49Ha1kXxaR2E',
    aboutImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnu2hiAntH63v2-yVMg5PySCayGVDJSgPW0_n1XznNqOgmyV-_fg7ons8J3zhMEIXv1VzX1Ixuqki2z86OvRilCqI9BL1FoQpg7zZz7qzXb0bD1oDsamo85mGdR-cc9LdKaDunFcLBa1wzNcfwkeWLJRsLrqTC6ZUijoXKXO3cs8UfO-cqSq6fswqshjrHKO32b2IJ-7d1eQeD6GS9bnTYV03HaadlquLYjkJOkuA',
    aboutFeature1Title: '01 / TƏLİM',
    aboutFeature1Desc: 'Fərdi və korporativ təlimlər: dəqiq artikulyasiya və inamlı səhnə duruşu.',
    aboutFeature2Title: '02 / SƏHNƏ',
    aboutFeature2Desc: 'Dövlət və özəl tədbirlər: yüksək səviyyəli rəsmi protokola uyğun aparıcılıq.',
    heroDishTitle: '03 / SƏS',
    heroDishSubtitle: 'Reklam və korporativ səsləndirmə: emosional dərinlik və kristal təmiz səs tonu.',
    contactSubtitle: 'Təlimlərə yazılmaq, tədbirlərin aparıcılığı və ya səsləndirmə layihələri üçün müraciət edin.',
    footerCopyrightText: '© 2026 Mehin İsmayılova. Bütün hüquqlar qorunur.',
    footerPlatformText: 'Sayt SiteX platforması ilə yaradılıb',
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
  { name: 'Manrope', label: 'Manrope', category: 'Zərif Editorial Sans' },
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

