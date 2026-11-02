import {
  LayoutDashboard,
  Globe,
  Palette,
  Share2,
  Sparkles,
  UtensilsCrossed,
  Image,
  MessageCircle,
  QrCode,
  BarChart3,
  CreditCard,
  Download,
  Settings,
} from 'lucide-react';
import { NavItemConfig } from './types';

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

export const dashboardNavItems: NavItemConfig[] = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Ana Səhifə' },
  { id: 'website', href: '/dashboard/website', icon: Globe, label: 'Veb Saytım' },
  { id: 'theme', href: '/dashboard/theme', icon: Palette, label: 'Tema' },
  { id: 'social', href: '/dashboard/social', icon: Share2, label: 'Sosial Media' },
  { id: 'splash', href: '/dashboard/splash', icon: Sparkles, label: 'Splash Screen' },
  {
    id: 'menu',
    href: '/dashboard/menu',
    icon: UtensilsCrossed,
    label: 'Menyu',
    visibleFor: ['restoran-ve-qida-sayti', 'restoran', 'kafe-ve-qehvexana', 'kafe', 'fast-food'],
    isVisible: (site) => {
      if (!site) return true;
      if (!site.category && !site.subcategory) return true;
      return isFoodCategory(site.category, site.subcategory);
    },
  },
  { id: 'media', href: '/dashboard/media', icon: Image, label: 'Media Kitabxanası' },
  { id: 'whatsapp', href: '/dashboard/whatsapp', icon: MessageCircle, label: 'Sifariş Ayarları' },
  { id: 'qr', href: '/dashboard/qr', icon: QrCode, label: 'QR Yaradıcı' },
  { id: 'analytics', href: '/dashboard/analytics', icon: BarChart3, label: 'Analitika' },
  { id: 'billing', href: '/dashboard/billing', icon: CreditCard, label: 'Abunəlik' },
  { id: 'export-import', href: '/dashboard/export-import', icon: Download, label: 'Export / Import' },
  { id: 'settings', href: '/dashboard/settings', icon: Settings, label: 'Parametrlər' },
];

