import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_SITE_CATEGORY_ID,
  DEFAULT_SITE_SUBCATEGORY_ID,
  SITE_CATEGORIES,
  getSiteCategory,
  getSiteSubcategory,
  getSiteTypeLabel,
  isValidSiteType,
} from '../src/config/site-categories';
import { getDefaultPagesForSite } from '../src/lib/site-pages';

test('kataloqda 25 əsas kateqoriya var', () => {
  assert.equal(SITE_CATEGORIES.length, 25);
});

test('kateqoriya və alt kateqoriya ID-ləri unikaldır', () => {
  const categoryIds = new Set<string>();

  for (const category of SITE_CATEGORIES) {
    assert.ok(!categoryIds.has(category.id), `Təkrarlanan kateqoriya: ${category.id}`);
    categoryIds.add(category.id);

    assert.ok(category.subcategories.length >= 6, `${category.id} üçün alt kateqoriya azdır`);

    const subIds = new Set<string>();
    for (const sub of category.subcategories) {
      assert.ok(!subIds.has(sub.id), `Təkrarlanan alt kateqoriya: ${category.id}/${sub.id}`);
      subIds.add(sub.id);
      assert.match(sub.id, /^[a-z0-9-]+$/, 'Alt kateqoriya ID-si yalnız aşağı hərf, rəqəm və tiredən ibarət olmalıdır');
    }
  }
});

test('tələb olunan kateqoriya adları və alt növlər mövcuddur', () => {
  const names = SITE_CATEGORIES.map((category) => category.name);

  assert.ok(names.includes('Şəxsi Bloq'));
  assert.ok(names.includes('Müəssisə Saytı'));
  assert.ok(names.includes('Onlayn Mağaza'));
  assert.ok(names.includes('Digər Sayt Növləri'));

  const store = getSiteCategory('onlayn-magaza');
  assert.equal(store?.subcategories.length, 10);
  assert.equal(getSiteSubcategory('onlayn-magaza', 'reqemsal-mehsullar')?.name, 'Rəqəmsal Məhsullar');

  const other = getSiteCategory('diger-sayt-novleri');
  assert.equal(other?.subcategories.length, 6);
});

test('sayt növü validasiyası uyğun və uyğun olmayan cütləri ayırır', () => {
  assert.equal(isValidSiteType('restoran-ve-qida-sayti', 'restoran'), true);
  assert.equal(isValidSiteType('restoran-ve-qida-sayti', 'saas-platformasi'), false);
  assert.equal(isValidSiteType('namelum-kateqoriya', 'restoran'), false);
  assert.equal(isValidSiteType('', ''), false);

  // "Digər" kateqoriyası həmişə seçilə bilən variant kimi mövcuddur.
  assert.equal(
    isValidSiteType(DEFAULT_SITE_CATEGORY_ID, DEFAULT_SITE_SUBCATEGORY_ID),
    true
  );
});

test('görünüş etiketi kateqoriya/alt kateqoriyanı birləşdirir və köhnə saytlar üçün null qaytarır', () => {
  assert.equal(
    getSiteTypeLabel('restoran-ve-qida-sayti', 'restoran'),
    'Restoran və Qida Saytı / Restoran'
  );
  assert.equal(getSiteTypeLabel('restoran-ve-qida-sayti', 'restoran'), 'Restoran və Qida Saytı / Restoran');
  assert.equal(getSiteTypeLabel(null, null), null);
  assert.equal(getSiteTypeLabel('diger-sayt-novleri', 'diger'), 'Digər Sayt Növləri / Digər');
});

test('standart səhifələr sayt növünə uyğunlaşır, kateqoriyasız saytlar köhnə menyu davranışını saxlayır', () => {
  assert.deepEqual(
    getDefaultPagesForSite().map((page) => page.id),
    ['home', 'about', 'menu', 'contact']
  );

  assert.ok(getDefaultPagesForSite('onlayn-magaza', 'elektronika').some((page) => page.id === 'products'));
  assert.ok(
    getDefaultPagesForSite('muessise-sayti', 'restoran-ve-kafe').some((page) => page.id === 'menu')
  );
  assert.ok(
    getDefaultPagesForSite('muessise-sayti', 'klinika-ve-tibb-merkezi').some((page) => page.id === 'services')
  );
});
