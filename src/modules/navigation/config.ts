import {
  LayoutDashboard,
  Globe,
  Palette,
  Share2,
  Sparkles,
  UtensilsCrossed,
  Briefcase,
  Package,
  Image,
  Images,
  Layers,
  MessageCircle,
  QrCode,
  BarChart3,
  CreditCard,
  Download,
  Settings,
  Inbox,
  Clock,
  PenLine,
} from 'lucide-react';
import { NavItemConfig, SiteContext } from './types';

export const isFoodCategory = (category?: string | null, subcategory?: string | null): boolean => {
  if (!category && !subcategory) return true;
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  return (
    cat.includes('restoran') ||
    cat.includes('kafe') ||
    cat.includes('qida') ||
    sub.includes('restoran') ||
    sub.includes('kafe') ||
    sub.includes('qida')
  );
};

export const isHospitalityCategory = (category?: string | null, subcategory?: string | null): boolean => {
  if (!category && !subcategory) return false;
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();
  return (
    cat.includes('hotel') ||
    cat.includes('otel') ||
    cat.includes('qonaq') ||
    sub.includes('hotel') ||
    sub.includes('otel') ||
    sub.includes('qonaq')
  );
};

export const isMenuSupportedCategory = (category?: string | null, subcategory?: string | null): boolean => {
  return isFoodCategory(category, subcategory) || isHospitalityCategory(category, subcategory);
};

export const isEnterpriseServiceCategory = (
  category?: string | null,
  subcategory?: string | null
): boolean => {
  if (!category && !subcategory) return false;
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();

  // "Müəssisə Saytı" kateqoriyası
  if (cat === 'muessise-sayti') {
    // Restoran və kafe qida kateqoriyasıdır (menyu bölməsini istifadə edir)
    return !isFoodCategory(cat, sub);
  }

  // "Şəxsi və Rəsmi Sayt" kateqoriyası
  if (
    cat === 'sexsi-ve-resmi-sayt' ||
    cat.includes('sexsi-ve-resmi') ||
    cat.includes('resmi-sayt') ||
    sub === 'sexsi-vebsayt' ||
    sub === 'resmi-sexs-sayti' ||
    sub.includes('resmi-sexs') ||
    sub.includes('sexsi-tanitim')
  ) {
    return true;
  }

  // "Şəxsi Bloq" kateqoriyası
  if (
    cat === 'sexsi-blog' ||
    cat === 'sexsi-bloq' ||
    cat.includes('sexsi-blog') ||
    cat.includes('sexsi-bloq') ||
    sub.includes('blog') ||
    sub.includes('bloq')
  ) {
    return true;
  }

  const explicitSubcategories = [
    'klinika-ve-tibb-merkezi',
    'gozellik-salonu',
    'tikinti-sirketi',
    'avtomobil-servisi',
  ];

  if (explicitSubcategories.some((s) => sub === s || sub.includes(s))) {
    return !isFoodCategory(cat, sub);
  }

  return false;
};

export const isMenuActive = (site: SiteContext | null): boolean => {
  if (!site) return false;
  // Qida kateqoriyalarında menyu həmişə aktivdir
  if (isFoodCategory(site.category, site.subcategory)) return true;


  if ((site as any).menuEnabled === true || (site as any).hasMenu === true) return true;

  const draftTheme = site.website?.draftTheme as any;
  if (
    draftTheme?.menuEnabled === true ||
    draftTheme?.hasMenu === true ||
    draftTheme?.enableMenu === true
  ) {
    return true;
  }

  const publishedTheme = site.website?.publishedTheme as any;
  if (
    publishedTheme?.menuEnabled === true ||
    publishedTheme?.hasMenu === true ||
    publishedTheme?.enableMenu === true
  ) {
    return true;
  }

  const pagesConfig = site.website?.pagesConfig;
  if (Array.isArray(pagesConfig)) {
    const hasMenu = pagesConfig.some(
      (p: any) =>
        (p?.id === 'menu' || p?.id === 'menyu') && p?.enabled !== false
    );
    if (hasMenu) return true;
  }

  if (typeof window !== 'undefined') {
    const id = site.id || localStorage.getItem('currentOrgId');
    if (id) {
      const stored =
        localStorage.getItem(`site_${id}_menu_enabled`) ||
        localStorage.getItem(`menu_enabled_${id}`);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    }
  }

  return false;
};

export const isProductsActive = (site: SiteContext | null): boolean => {
  if (!site) return false;
  if (site.productsEnabled === true || site.hasProducts === true) return true;

  const draftTheme = site.website?.draftTheme as any;
  if (
    draftTheme?.productsEnabled === true ||
    draftTheme?.hasProducts === true ||
    draftTheme?.enableProducts === true
  ) {
    return true;
  }

  const pagesConfig = site.website?.pagesConfig;
  if (Array.isArray(pagesConfig)) {
    const hasProducts = pagesConfig.some(
      (p: any) =>
        (p?.id === 'products' || p?.id === 'mehsullar') && p?.enabled !== false
    );
    if (hasProducts) return true;
  }

  if (typeof window !== 'undefined') {
    const id = site.id || localStorage.getItem('currentOrgId');
    if (id) {
      const stored =
        localStorage.getItem(`site_${id}_products_enabled`) ||
        localStorage.getItem(`products_enabled_${id}`);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    }
  }

  return false;
};

export const dashboardNavItems: NavItemConfig[] = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Ana Səhifə' },
  { id: 'website', href: '/dashboard/website', icon: Globe, label: 'Veb Saytım' },
  { id: 'site-editor', href: '/dashboard/site-editor', icon: PenLine, label: 'Saytı Redaktə et' },
  { id: 'theme', href: '/dashboard/theme', icon: Palette, label: 'Tema Redaktoru', adminOnly: true },
  { id: 'social', href: '/dashboard/social', icon: Share2, label: 'Sosial Media' },
  { id: 'gallery', href: '/dashboard/gallery', icon: Images, label: 'Qalareya' },
  { id: 'packages', href: '/dashboard/packages', icon: Package, label: 'Paketlər' },
  { id: 'site-modules', href: '/dashboard/site-modules', icon: Layers, label: 'Sayt Modulları' },
  { id: 'splash', href: '/dashboard/splash', icon: Sparkles, label: 'Splash Screen', adminOnly: true },
  {
    id: 'menu',
    href: '/dashboard/menu',
    icon: UtensilsCrossed,
    label: 'Menyu',
    visibleFor: [
      'restoran-ve-qida-sayti', 'restoran', 'kafe-ve-qehvexana', 'kafe', 'fast-food',
      'otel-ve-turizm', 'otel-ve-qonaq-evi', 'seyahat-ve-turizm-sayti', 'hotel'
    ],
    isVisible: (site) => {
      if (!site) return true;
      if (!site.category && !site.subcategory) return true;
      if (isFoodCategory(site.category, site.subcategory)) {
        return true;
      }
      if (isHospitalityCategory(site.category, site.subcategory)) {
        return isMenuActive(site);
      }
      if (isEnterpriseServiceCategory(site.category, site.subcategory)) {
        return isMenuActive(site);
      }
      return isMenuActive(site);
    },
  },
  {
    id: 'services',
    href: '/dashboard/services',
    icon: Briefcase,
    label: 'Xidmətlər',
    isVisible: (site) => {
      if (!site) return false;
      return isEnterpriseServiceCategory(site.category, site.subcategory);
    },
  },
  {
    id: 'products',
    href: '/dashboard/products',
    icon: Package,
    label: 'Məhsullar',
    isVisible: (site) => {
      if (!site) return false;
      if (isFoodCategory(site.category, site.subcategory)) return false;
      if (site.category === 'onlayn-magaza') return true;
      if (isEnterpriseServiceCategory(site.category, site.subcategory)) {
        return isProductsActive(site);
      }
      return false;
    },
  },
  { id: 'inquiries', href: '/dashboard/inquiries', icon: Inbox, label: 'Müraciətlər' },
  { id: 'media', href: '/dashboard/media', icon: Image, label: 'Media Kitabxanası' },
  { id: 'whatsapp', href: '/dashboard/whatsapp', icon: MessageCircle, label: 'Sifariş Ayarları' },
  { id: 'working-hours', href: '/dashboard/working-hours', icon: Clock, label: 'İş Saatları' },
  { id: 'qr', href: '/dashboard/qr', icon: QrCode, label: 'QR Yaradıcı' },
  { id: 'analytics', href: '/dashboard/analytics', icon: BarChart3, label: 'Analitika' },
  { id: 'billing', href: '/dashboard/billing', icon: CreditCard, label: 'Abunəlik' },
  { id: 'export-import', href: '/dashboard/export-import', icon: Download, label: 'Export / Import' },
  { id: 'settings', href: '/dashboard/settings', icon: Settings, label: 'Parametrlər' },
];

