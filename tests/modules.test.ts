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
import {
  componentRegistry,
  listComponents,
  getComponent,
} from '../src/modules/builder/registry/componentRegistry';
import '../src/modules/builder/registry/builtinComponents';
import {
  serializeTemplateToTheme,
  exportTemplateAsJSON,
  importTemplateFromJSON,
} from '../src/modules/builder/serializer';

test('Theme Registry: Mövcud 4 daxili tema qeydiyyatdan keçib', () => {
  const elegant = getTheme('elegant');
  const modern = getTheme('modern');
  const classic = getTheme('classic');
  const warmGourmetPro = getTheme('warmGourmetPro');

  assert.ok(elegant, 'Elegant tema mövcuddur');
  assert.ok(modern, 'Modern tema mövcuddur');
  assert.ok(classic, 'Classic tema mövcuddur');
  assert.ok(warmGourmetPro, 'Warm Gourmet Pro tema mövcuddur');

  assert.equal(elegant?.source, 'builtin');
  assert.equal(warmGourmetPro?.tokens.colors.primary, '#ffc665');
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

test('Builder Component Registry: Bütün zəruri 14 komponent qeydiyyatdadır', () => {
  const requiredComponents = [
    'navbar',
    'hero',
    'text',
    'image',
    'button',
    'menu_list',
    'features',
    'testimonials',
    'contact_form',
    'map',
    'footer',
    'divider',
    'container',
    'gallery',
  ];

  const registered = listComponents().map((c) => c.type);
  for (const req of requiredComponents) {
    assert.ok(registered.includes(req), `Komponent tapılmadı: ${req}`);
    const comp = getComponent(req);
    assert.ok(comp?.propSchema, `${req} üçün propSchema mövcuddur`);
  }
});

test('Builder Serializer: Template sənədini ThemeDefinition-a və JSON-a çevirmək', () => {
  const sampleDoc = {
    id: 'doc-123',
    name: 'Gözəl Restoran Teması',
    slug: 'gozel-restoran-temasi',
    description: 'Açıqlama',
    version: '1.0.0',
    tokens: { primary: '#FF0000' },
    nodes: [
      { id: '1', type: 'navbar', props: { brandName: 'Dadlı' } },
      { id: '2', type: 'hero', props: { title: 'Xoş gəlmisiniz' } },
    ],
    updatedAt: new Date().toISOString(),
  };

  const json = exportTemplateAsJSON(sampleDoc);
  const reimported = importTemplateFromJSON(json);
  assert.equal(reimported.name, sampleDoc.name);
  assert.equal(reimported.nodes.length, 2);

  const themeDef = serializeTemplateToTheme(sampleDoc);
  assert.equal(themeDef.id, 'doc-123');
  assert.equal(themeDef.source, 'custom');
  assert.equal(themeDef.sections.length, 2);
  assert.ok(ThemeDefinitionSchema.safeParse(themeDef).success);
});
