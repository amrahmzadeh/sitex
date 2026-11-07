/**
 * SiteX Vahid Modul Qeydiyyat Sistemi (Module Registry)
 * Yeni bir modul əlavə edərkən tək bir yerdən qeydiyyat:
 * Naviqasiya menyusu, route bağlama və əməkdaş icazələri avtomatik sinxronlaşır.
 */

import { LucideIcon } from 'lucide-react';
import { NavItemConfig, SiteContext } from '@/modules/navigation/types';
import { PermissionAction, SystemModuleDefinition } from '@/lib/permissions';
import {
  LayoutDashboard,
  Globe,
  PenLine,
  Palette,
  Share2,
  Images,
  Package,
  Layers,
  Sparkles,
  UtensilsCrossed,
  Briefcase,
  Inbox,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  QrCode,
  BarChart3,
  CreditCard,
  Download,
  Users,
  Settings,
} from 'lucide-react';
import {
  isFoodCategory,
  isHospitalityCategory,
  isEnterpriseServiceCategory,
  isMenuActive,
  isProductsActive,
} from '@/modules/navigation/config';

export interface ModuleDefinition {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  category: 'main' | 'content' | 'settings' | 'system';
  description: string;
  actions: PermissionAction[];
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  visibleFor?: string[];
  isVisible?: (site: SiteContext | null) => boolean;
}

class ModuleRegistry {
  private modules: Map<string, ModuleDefinition> = new Map();

  constructor() {
    this.registerDefaults();
  }

  public register(mod: ModuleDefinition): void {
    this.modules.set(mod.id, mod);
  }

  public get(id: string): ModuleDefinition | undefined {
    return this.modules.get(id);
  }

  public getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Naviqasiya menyusu üçün NavItemConfig siyahısını qaytarır
   */
  public getNavItems(): NavItemConfig[] {
    return this.getAll().map((m) => ({
      id: m.id,
      href: m.href,
      icon: m.icon,
      label: m.label,
      adminOnly: m.adminOnly,
      superAdminOnly: m.superAdminOnly,
      visibleFor: m.visibleFor,
      isVisible: m.isVisible,
    }));
  }

  /**
   * Əməkdaş icazələri üçün SystemModuleDefinition siyahısını qaytarır
   */
  public getSystemModules(): SystemModuleDefinition[] {
    return this.getAll().map((m) => ({
      id: m.id,
      label: m.label,
      category: m.category,
      description: m.description,
      actions: m.actions,
    }));
  }

  private registerDefaults(): void {
    const defaultModules: ModuleDefinition[] = [
      {
        id: 'dashboard',
        label: 'Ana Səhifə',
        href: '/dashboard',
        icon: LayoutDashboard,
        category: 'main',
        description: 'Ümumi statistika və sistem məlumatları',
        actions: ['view'],
      },
      {
        id: 'website',
        label: 'Veb Saytım',
        href: '/dashboard/website',
        icon: Globe,
        category: 'main',
        description: 'Saytın əsas tənzimləmələri və önizləməsi',
        actions: ['view', 'edit', 'manage'],
      },
      {
        id: 'site-editor',
        label: 'Saytı Redaktə et',
        href: '/dashboard/site-editor',
        icon: PenLine,
        category: 'content',
        description: 'Saytın blokları və mətnlərinin redaktəsi',
        actions: ['view', 'edit', 'manage'],
      },
      {
        id: 'theme',
        label: 'Tema Kitabxanası',
        href: '/dashboard/theme',
        icon: Palette,
        category: 'settings',
        description: 'Saytın dizayn temasının seçilməsi və idarəsi',
        actions: ['view', 'edit', 'manage'],
      },
      {
        id: 'social',
        label: 'Sosial Media',
        href: '/dashboard/social',
        icon: Share2,
        category: 'content',
        description: 'Sosial şəbəkə hesabları və paylaşımlar',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
      },
      {
        id: 'gallery',
        label: 'Qalareya',
        href: '/dashboard/gallery',
        icon: Images,
        category: 'content',
        description: 'Saytın foto və video qalareyası',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
      },
      {
        id: 'packages',
        label: 'Paketlər',
        href: '/dashboard/packages',
        icon: Package,
        category: 'content',
        description: 'Xüsusi paketlər və təkliflər',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
      },
      {
        id: 'site-modules',
        label: 'Sayt Modulları',
        href: '/dashboard/site-modules',
        icon: Layers,
        category: 'settings',
        description: 'Aktiv və deaktiv sayt blokları',
        actions: ['view', 'edit', 'manage'],
      },
      {
        id: 'splash',
        label: 'Splash Screen',
        href: '/dashboard/splash',
        icon: Sparkles,
        category: 'system',
        description: 'Açılış video və animasiya ekranı',
        actions: ['view', 'edit', 'manage'],
        adminOnly: true,
      },
      {
        id: 'menu',
        label: 'Menyu',
        href: '/dashboard/menu',
        icon: UtensilsCrossed,
        category: 'content',
        description: 'Menyu kateqoriyaları və təamların idarəsi',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
        visibleFor: [
          'restoran-ve-qida-sayti',
          'restoran',
          'kafe-ve-qehvexana',
          'kafe',
          'fast-food',
          'otel-ve-turizm',
          'otel-ve-qonaq-evi',
          'seyahat-ve-turizm-sayti',
          'hotel',
        ],
        isVisible: (site) => {
          if (!site) return true;
          if (!site.category && !site.subcategory) return true;
          if (isFoodCategory(site.category, site.subcategory)) return true;
          if (isHospitalityCategory(site.category, site.subcategory)) return isMenuActive(site);
          if (isEnterpriseServiceCategory(site.category, site.subcategory)) return isMenuActive(site);
          return isMenuActive(site);
        },
      },
      {
        id: 'services',
        label: 'Xidmətlər',
        href: '/dashboard/services',
        icon: Briefcase,
        category: 'content',
        description: 'Təqdim olunan xidmətlərin idarəsi',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
        isVisible: (site) => {
          if (!site) return false;
          return isEnterpriseServiceCategory(site.category, site.subcategory);
        },
      },
      {
        id: 'products',
        label: 'Məhsullar',
        href: '/dashboard/products',
        icon: Package,
        category: 'content',
        description: 'Məhsulların kataloqu və qiymətlər',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
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
      {
        id: 'inquiries',
        label: 'Müraciətlər',
        href: '/dashboard/inquiries',
        icon: Inbox,
        category: 'main',
        description: 'Əlaqə formalarından daxil olan müraciətlər',
        actions: ['view', 'edit', 'delete', 'manage'],
      },
      {
        id: 'media',
        label: 'Media Kitabxanası',
        href: '/dashboard/media',
        icon: ImageIcon,
        category: 'content',
        description: 'Yüklənmiş şəkillər və fayllar',
        actions: ['view', 'create', 'delete', 'manage'],
      },
      {
        id: 'whatsapp',
        label: 'Sifariş Ayarları',
        href: '/dashboard/whatsapp',
        icon: MessageCircle,
        category: 'settings',
        description: 'WhatsApp sifariş və mesaj tənzimləmələri',
        actions: ['view', 'edit', 'manage'],
      },
      {
        id: 'working-hours',
        label: 'İş Saatları',
        href: '/dashboard/working-hours',
        icon: Clock,
        category: 'settings',
        description: 'İş qrafiki və fasilələrin idarəsi',
        actions: ['view', 'edit', 'manage'],
      },
      {
        id: 'qr',
        label: 'QR Yaradıcı',
        href: '/dashboard/qr',
        icon: QrCode,
        category: 'main',
        description: 'Menyu və sayt üçün QR kod generasiyası',
        actions: ['view', 'create', 'manage'],
      },
      {
        id: 'analytics',
        label: 'Analitika',
        href: '/dashboard/analytics',
        icon: BarChart3,
        category: 'main',
        description: 'Ziyarətçi statistikası və kliklər',
        actions: ['view'],
      },
      {
        id: 'billing',
        label: 'Abunəlik',
        href: '/dashboard/billing',
        icon: CreditCard,
        category: 'system',
        description: 'Tarif planı və ödəniş məlumatları',
        actions: ['view', 'manage'],
      },
      {
        id: 'export-import',
        label: 'Export / Import',
        href: '/dashboard/export-import',
        icon: Download,
        category: 'settings',
        description: 'Məlumatların ehtiyat nüsxəsi və bərpası',
        actions: ['view', 'manage'],
      },
      {
        id: 'employees',
        label: 'Əməkdaşlar',
        href: '/dashboard/employees',
        icon: Users,
        category: 'settings',
        description: 'İstifadəçi və əməkdaş səlahiyyətləri',
        actions: ['view', 'create', 'edit', 'delete', 'manage'],
      },
      {
        id: 'settings',
        label: 'Parametrlər',
        href: '/dashboard/settings',
        icon: Settings,
        category: 'settings',
        description: 'Müəssisə və istifadəçi profil ayarları',
        actions: ['view', 'edit', 'manage'],
      },
    ];

    for (const m of defaultModules) {
      this.register(m);
    }
  }
}

export const moduleRegistry = new ModuleRegistry();
export const registerModule = (mod: ModuleDefinition) => moduleRegistry.register(mod);
export const getModule = (id: string) => moduleRegistry.get(id);
export const getAllModules = () => moduleRegistry.getAll();
export const getDashboardNavItems = () => moduleRegistry.getNavItems();
export const getSystemModules = () => moduleRegistry.getSystemModules();

