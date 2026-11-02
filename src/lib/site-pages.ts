import { getSiteCategory, getSiteSubcategory } from '@/config/site-categories';

/**
 * Seçilmiş sayt növünə uyğun standart səhifə konfiqurasiyası.
 * Köhnə davranış (kateqoriyasız saytlar) qorunur: home/about/menu/contact.
 */

export interface DefaultSitePage {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface SectionDefinition {
  id: string;
  name: string;
}

const CATEGORY_SECTIONS: Record<string, SectionDefinition> = {
  'onlayn-magaza': { id: 'products', name: 'Məhsullar' },
  'portfolio-sayti': { id: 'projects', name: 'Layihələr' },
  'xeber-ve-media-sayti': { id: 'news', name: 'Xəbərlər' },
  'sexsi-blog': { id: 'news', name: 'Bloqlar' },
  'tehsil-sayti': { id: 'courses', name: 'Kurslar' },
  'dasinmaz-emlak-sayti': { id: 'listings', name: 'Elanlar' },
  'restoran-ve-qida-sayti': { id: 'menu', name: 'Menyu' },
  'muessise-sayti': { id: 'services', name: 'Xidmətlər' },
};

/**
 * Restoran/kafe alt kateqoriyaları menyu bölməsini saxlayır; digər müəssisə
 * növləri üçün xidmətlər bölməsi istifadə olunur.
 */
function resolveSection(categoryId?: string | null, subcategoryId?: string | null): SectionDefinition {
  const category = getSiteCategory(categoryId);
  if (!category) return { id: 'menu', name: 'Menyu' };

  const subcategory = getSiteSubcategory(categoryId, subcategoryId);
  const subcategoryName = subcategory?.name.toLowerCase() || '';
  const subId = (subcategoryId || '').toLowerCase();

  if (category.id === 'muessise-sayti') {
    const isFood =
      subId === 'restoran-ve-kafe' ||
      subId.includes('restoran') ||
      subId.includes('kafe') ||
      subcategoryName.includes('restoran') ||
      subcategoryName.includes('kafe');
    return isFood ? { id: 'menu', name: 'Menyu' } : { id: 'services', name: 'Xidmətlər' };
  }

  return CATEGORY_SECTIONS[category.id] || { id: 'services', name: 'Xidmətlər' };
}

export function getDefaultPagesForSite(
  categoryId?: string | null,
  subcategoryId?: string | null,
  options?: { includeMenu?: boolean; includeServices?: boolean }
): DefaultSitePage[] {
  const section = resolveSection(categoryId, subcategoryId);

  const pages: DefaultSitePage[] = [
    { id: 'home', name: 'Ana Səhifə', enabled: true, order: 0 },
    { id: 'about', name: 'Haqqımızda', enabled: true, order: 1 },
  ];

  if (section.id === 'services') {
    pages.push({ id: 'services', name: 'Xidmətlər', enabled: true, order: 2 });
    if (options?.includeMenu) {
      pages.push({ id: 'menu', name: 'Menyu', enabled: true, order: 3 });
    }
  } else {
    pages.push({ id: section.id, name: section.name, enabled: true, order: 2 });
    if (options?.includeServices) {
      pages.push({ id: 'services', name: 'Xidmətlər', enabled: true, order: 3 });
    }
  }

  pages.push({ id: 'contact', name: 'Əlaqə', enabled: true, order: pages.length });
  return pages;
}
