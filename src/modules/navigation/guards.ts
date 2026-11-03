import { NavItemConfig, SiteContext } from './types';

export function isNavItemVisible(
  item: NavItemConfig,
  site: SiteContext | null,
  userRole?: string | null
): boolean {
  if (item.adminOnly && userRole !== 'SUPER_ADMIN') {
    return false;
  }

  if (item.isVisible) {
    return item.isVisible(site);
  }

  if (item.visibleFor && item.visibleFor.length > 0) {
    if (!site || (!site.category && !site.subcategory)) {
      return true;
    }
    const cat = site.category || '';
    const sub = site.subcategory || '';
    return item.visibleFor.includes(cat) || item.visibleFor.includes(sub);
  }

  return true;
}

