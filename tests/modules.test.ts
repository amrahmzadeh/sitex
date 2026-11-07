import test from 'node:test';
import assert from 'node:assert/strict';
import {
  themeRegistry,
  registerTheme,
  getTheme,
  listThemes,
  ThemeDefinitionSchema,
} from '../src/modules/themes';
import {
  dashboardNavItems,
  isNavItemVisible,
  isFoodCategory,
} from '../src/modules/navigation';

test('Theme Registry: Mövcud 4 daxili tema qeydiyyatdan keçib', () => {
  const elegant = getTheme('elegant');
  const modern = getTheme('modern');
  const classic = getTheme('classic');
  const warmGourmetPro = getTheme('warmGourmetPro');
  const bySalmanov = getTheme('bySalmanov');
  const mehinIsmayilova = getTheme('mehinIsmayilova');

  assert.ok(elegant, 'Elegant tema mövcuddur');
  assert.ok(modern, 'Modern tema mövcuddur');
  assert.ok(classic, 'Classic tema mövcuddur');
  assert.ok(warmGourmetPro, 'Warm Gourmet Pro tema mövcuddur');
  assert.ok(bySalmanov, 'By Salmanov tema mövcuddur');
  assert.ok(mehinIsmayilova, 'Mehin Ismayilova tema mövcuddur');

  assert.equal(elegant?.source, 'builtin');
  assert.equal(warmGourmetPro?.tokens.colors.primary, '#ffc665');
  assert.equal(bySalmanov?.tokens.colors.primary, '#cc0000');
  assert.equal(mehinIsmayilova?.tokens.colors.primary, '#765a26');
});

test('Theme Registry: Yeni tema qeydiyyatı və kateqoriya filtri', () => {
  const newCustomTheme = {
    id: 'test-custom-theme',
    name: 'Test Custom',
    slug: 'test-custom',
    description: 'Test üçün xüsusi tema',
    category: ['restoran-ve-qida-sayti', 'test-cat'],
    version: '1.0.0',
    source: 'custom' as const,
    createdAt: new Date().toISOString(),
    tokens: {
      colors: {
        primary: '#123456',
        secondary: '#654321',
        accent: '#abcdef',
        background: '#ffffff',
        text: '#000000',
      },
      typography: {
        headingFont: 'Outfit',
        bodyFont: 'Inter',
      },
      spacing: {
        heroHeight: '85vh',
        heroOverlay: 0.5,
      },
      radius: {
        borderRadius: '12px',
      },
    },
    layout: {
      headerStyle: 'solid' as const,
      footerStyle: 'dark' as const,
      buttonStyle: 'solid' as const,
      cardStyle: 'flat' as const,
    },
    sections: [],
  };

  registerTheme(newCustomTheme);
  const found = getTheme('test-custom-theme');
  assert.ok(found);
  assert.equal(found.name, 'Test Custom');

  const filtered = listThemes({ category: 'test-cat' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'test-custom-theme');
});

test('Navigation: Menyu elementi yalnız restoran və kafe kateqoriyalarında görünür', () => {
  const menuItem = dashboardNavItems.find((item) => item.id === 'menu');
  assert.ok(menuItem, 'Menyu nav item mövcuddur');

  // Restoran üçün görünməlidir
  assert.equal(
    isNavItemVisible(menuItem, { category: 'restoran-ve-qida-sayti', subcategory: 'restoran' }),
    true
  );

  // Kafe üçün görünməlidir
  assert.equal(
    isNavItemVisible(menuItem, { category: 'restoran-ve-qida-sayti', subcategory: 'kafe-ve-qehvexana' }),
    true
  );

  // Klinika üçün görünməməlidir
  assert.equal(
    isNavItemVisible(menuItem, { category: 'sehiyye-ve-saglamliq-sayti', subcategory: 'tibb-merkezi' }),
    false
  );

  // Hüquq firması üçün görünməməlidir
  assert.equal(
    isNavItemVisible(menuItem, { category: 'huquq-firmasi', subcategory: 'vekil-burosu' }),
    false
  );

  // Kateqoriyası olmayan köhnə saytlar üçün geriyə uyğunluq (true qaytarmalıdır)
  assert.equal(isNavItemVisible(menuItem, null), true);
  assert.equal(isNavItemVisible(menuItem, { category: null, subcategory: null }), true);
});

test('Navigation: Tema Redaktoru və Splash Screen yalnız SUPER_ADMIN üçün görünür', () => {
  const themeItem = dashboardNavItems.find((item) => item.id === 'theme');
  const splashItem = dashboardNavItems.find((item) => item.id === 'splash');

  assert.ok(themeItem, 'Tema nav item mövcuddur');
  assert.ok(splashItem, 'Splash nav item mövcuddur');

  // Normal USER üçün gizli olmalıdır
  assert.equal(isNavItemVisible(themeItem, null, 'USER'), false);
  assert.equal(isNavItemVisible(splashItem, null, 'USER'), false);
  assert.equal(isNavItemVisible(themeItem, null, null), false);
  assert.equal(isNavItemVisible(splashItem, null, undefined), false);

  // SUPER_ADMIN üçün görünməlidir
  assert.equal(isNavItemVisible(themeItem, null, 'SUPER_ADMIN'), true);
  assert.equal(isNavItemVisible(splashItem, null, 'SUPER_ADMIN'), true);
});

test('Navigation: Müəssisə Saytı > Restoran və Kafe olduqda yalnız Menyu görünür, digərlərində Xidmətlər və aktiv edildikdə Məhsullar', () => {
  const menuItem = dashboardNavItems.find((item) => item.id === 'menu');
  const servicesItem = dashboardNavItems.find((item) => item.id === 'services');
  const productsItem = dashboardNavItems.find((item) => item.id === 'products');

  assert.ok(menuItem, 'Menyu nav item mövcuddur');
  assert.ok(servicesItem, 'Xidmətlər nav item mövcuddur');
  assert.ok(productsItem, 'Məhsullar nav item mövcuddur');

  // 1. "Müəssisə Saytı" > "Restoran və Kafe": yalnız Menyu görünməlidir
  const restaurantContext = {
    category: 'muessise-sayti',
    subcategory: 'restoran-ve-kafe',
  };
  assert.equal(isNavItemVisible(menuItem, restaurantContext), true, 'Restoran və Kafe üçün Menyu görünməlidir');
  assert.equal(isNavItemVisible(servicesItem, restaurantContext), false, 'Restoran və Kafe üçün Xidmətlər görünməməlidir');
  assert.equal(isNavItemVisible(productsItem, restaurantContext), false, 'Restoran və Kafe üçün Məhsullar görünməməlidir');

  // Hətta productsEnabled: true olsa belə, Restoran və Kafe üçün Məhsullar görünməməlidir
  assert.equal(isNavItemVisible(productsItem, { ...restaurantContext, productsEnabled: true }), false);

  // 2. Digər Müəssisə Saytı subkateqoriyaları:
  const enterpriseSubcategories = [
    'klinika-ve-tibb-merkezi',
    'gozellik-salonu',
    'tikinti-sirketi',
    'avtomobil-servisi',
  ];

  for (const subcategory of enterpriseSubcategories) {
    const context = { category: 'muessise-sayti', subcategory };

    // Menyu görünməməlidir
    assert.equal(isNavItemVisible(menuItem, context), false, `${subcategory} üçün Menyu görünməməlidir`);

    // Xidmətlər görünməlidir
    assert.equal(isNavItemVisible(servicesItem, context), true, `${subcategory} üçün Xidmətlər görünməlidir`);

    // Məhsullar deaktiv olduqda görünməməlidir
    assert.equal(isNavItemVisible(productsItem, context), false, `${subcategory} üçün deaktiv Məhsullar görünməməlidir`);

    // Məhsullar aktiv edildikdə görünməlidir
    assert.equal(
      isNavItemVisible(productsItem, { ...context, productsEnabled: true }),
      true,
      `${subcategory} üçün aktiv Məhsullar görünməlidir`
    );
  }

  // 3. Otel və Turizm:
  const hotelContext = { category: 'muessise-sayti', subcategory: 'otel-ve-turizm' };
  // Standart vəziyyətdə Xidmətlər görünür, Menyu görünmür
  assert.equal(isNavItemVisible(servicesItem, hotelContext), true, 'Otel və Turizm üçün Xidmətlər görünməlidir');
  assert.equal(isNavItemVisible(menuItem, hotelContext), false, 'Menyu aktiv edilmədikdə Otel və Turizm üçün Menyu görünməməlidir');

  // Menyu aktiv edildikdə isə Xidmətlərlə birgə Menyu da görünməlidir!
  const hotelWithMenu = {
    ...hotelContext,
    menuEnabled: true,
  };
  assert.equal(isNavItemVisible(servicesItem, hotelWithMenu), true, 'Otel və Turizm üçün Xidmətlər aktiv qalmalıdır');
  assert.equal(isNavItemVisible(menuItem, hotelWithMenu), true, 'Menyu aktiv edildikdə Otel və Turizm üçün Menyu da görünməlidir');

  // draftTheme üzərindən menuEnabled aktiv edildikdə də görünməlidir
  const hotelWithDraftMenu = {
    ...hotelContext,
    website: {
      draftTheme: { menuEnabled: true },
    },
  };
  assert.equal(isNavItemVisible(menuItem, hotelWithDraftMenu), true, 'draftTheme.menuEnabled olduqda Menyu görünməlidir');

  // 4. Şəxsi və Rəsmi Sayt:
  const personalOfficialContext = { category: 'sexsi-ve-resmi-sayt', subcategory: 'sexsi-vebsayt' };
  assert.equal(isNavItemVisible(servicesItem, personalOfficialContext), true, 'Şəxsi və Rəsmi Sayt üçün Xidmətlər görünməlidir');
  assert.equal(isNavItemVisible(menuItem, personalOfficialContext), false, 'Menyu aktiv edilmədikdə Menyu görünməməlidir');

  // 5. Şəxsi Bloq:
  const personalBlogContext = { category: 'sexsi-blog', subcategory: 'doktor-blogu' };
  assert.equal(isNavItemVisible(servicesItem, personalBlogContext), true, 'Şəxsi Bloq üçün Xidmətlər görünməlidir');
  assert.equal(isNavItemVisible(menuItem, personalBlogContext), false, 'Menyu aktiv edilmədikdə Menyu görünməməlidir');

  // 6. Müraciətlər (Inquiries):
  const inquiriesItem = dashboardNavItems.find((item) => item.id === 'inquiries');
  assert.ok(inquiriesItem, 'Müraciətlər nav item mövcuddur');
  assert.equal(isNavItemVisible(inquiriesItem, personalOfficialContext), true, 'Şəxsi və Rəsmi Sayt üçün Müraciətlər görünməlidir');
  assert.equal(isNavItemVisible(inquiriesItem, restaurantContext), true, 'Restoran üçün də Müraciətlər görünməlidir');
});

