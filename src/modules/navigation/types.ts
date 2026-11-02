import { LucideIcon } from 'lucide-react';

export interface SiteContext {
  id?: string;
  category?: string | null;
  subcategory?: string | null;
  isPublished?: boolean;
  productsEnabled?: boolean;
  hasProducts?: boolean;
  website?: {
    pagesConfig?: any;
    draftTheme?: any;
    [key: string]: any;
  } | null;
}

export interface NavItemConfig {
  id: string;
  href: string;
  icon: LucideIcon;
  label: string;
  visibleFor?: string[];
  isVisible?: (site: SiteContext | null) => boolean;
}

