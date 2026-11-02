import { LucideIcon } from 'lucide-react';

export interface SiteContext {
  id?: string;
  category?: string | null;
  subcategory?: string | null;
  isPublished?: boolean;
}

export interface NavItemConfig {
  id: string;
  href: string;
  icon: LucideIcon;
  label: string;
  visibleFor?: string[];
  isVisible?: (site: SiteContext | null) => boolean;
}

