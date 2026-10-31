import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { gzipSync } from 'node:zlib';
import {
  getLocalManifest,
  getTemplatesForSiteType,
  parseTemplateManifest,
  toPublicTemplate,
} from '../src/lib/templates/manifest';
import {
  extractTemplateFiles,
  getTemplateDefinition,
  TemplateSourceError,
} from '../src/lib/templates/github';
import { resolveTemplateTheme, sanitizeThemeOverrides } from '../src/lib/templates/installer';
import { isValidSiteType } from '../src/config/site-categories';

function tarHeader(name: string, size: number, type = '0'): Buffer {
  const header = Buffer.alloc(512);
  header.write(name, 0, 100, 'utf8');
  header.write('0000644\0', 100, 'ascii');
  header.write('0000000\0', 108, 'ascii');
  header.write('0000000\0', 116, 'ascii');
  header.write(`${size.toString(8).padStart(11, '0')}\0`, 124, 'ascii');
  header.write('00000000000\0', 136, 'ascii');
  header.write('        ', 148, 'ascii');
  header.write(type, 156, 'ascii');
  header.write('ustar\0', 257, 'ascii');
  header.write('00', 263, 'ascii');

  let checksum = 0;
  for (const byte of header) checksum += byte;
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 'ascii');

  return header;
}

function buildTarGz(entries: Array<{ name: string; data?: string; type?: string }>): Buffer {
  const chunks: Buffer[] = [];

  for (const entry of entries) {
    const data = Buffer.from(entry.data || '', 'utf8');
    chunks.push(tarHeader(entry.name, data.length, entry.type || '0'));
    chunks.push(data);
    const padding = (512 - (data.length % 512)) % 512;
    if (padding) chunks.push(Buffer.alloc(padding));
  }

  chunks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(chunks));
}

const TEMPLATE_PATH = 'templates/restaurant-modern';

afterEach(() => {
  delete process.env.GITHUB_TEMPLATE_REPO;
  delete process.env.GITHUB_TEMPLATE_REF;
  delete process.env.GITHUB_TEMPLATE_TOKEN;
});

test('manifest düzgün validasiya olunur və şablon ID-ləri unikaldır', () => {
  const manifest = getLocalManifest();
  assert.equal(manifest.schemaVersion, 1);
  assert.ok(manifest.templates.length >= 10);

  const ids = new Set(manifest.templates.map((template) => template.id));
  assert.equal(ids.size, manifest.templates.length);

  for (const template of manifest.templates) {
    assert.ok(
      isValidSiteType(template.category, template.subcategory),
      `${template.id} üçün kateqoriya cütü etibarsızdır`
    );
    assert.match(template.version, /^\d+\.\d+\.\d+$/);
    assert.ok(template.source?.path.startsWith('templates/'));
    assert.ok(!template.source?.path.includes('..'));
  }
});

test('seçilmiş sayt növü üzrə şablon tapılır', () => {
  const matches = getTemplatesForSiteType('restoran-ve-qida-sayti', 'restoran');
  assert.deepEqual(matches.map((template) => template.id), ['restaurant-modern']);

  const allInCategory = getTemplatesForSiteType('restoran-ve-qida-sayti');
  assert.deepEqual(allInCategory.map((template) => template.id).sort(), ['cafe-cozy', 'restaurant-modern']);

  assert.equal(getTemplatesForSiteType('restoran-ve-qida-sayti', 'saas-platformasi').length, 0);
});

test('ictimai şablon görünüşü repository və yol məlumatını sızdırmır', () => {
  const template = getLocalManifest().templates[0];
  const publicView = toPublicTemplate(template);
  const serialized = JSON.stringify(publicView);

  assert.equal(publicView.id, template.id);
  assert.equal('source' in publicView, false);
  assert.equal(serialized.includes('repository'), false);
  assert.equal(serialized.includes('templates/'), false);
  assert.equal(serialized.includes('github.com'), false);
});

test('etibarsız manifest aydın xəta ilə rədd olunur', () => {
  assert.throws(
    () =>
      parseTemplateManifest({
        schemaVersion: 1,
        defaults: { repository: '', ref: 'v1.0.0', manifestPath: 'manifest.json' },
        templates: [
          {
            id: 'bad-template',
            name: 'Bad',
            category: 'restoran-ve-qida-sayti',
            subcategory: 'saas-platformasi',
            version: '1.0.0',
            themePreset: 'modern',
          },
        ],
      }),
    /alt kateqoriyası/
  );

  assert.throws(
    () =>
      parseTemplateManifest({
        schemaVersion: 1,
        defaults: { repository: '', ref: 'v1.0.0', manifestPath: 'manifest.json' },
        templates: [
          {
            id: 'unsafe-path',
            name: 'Unsafe',
            category: 'restoran-ve-qida-sayti',
            subcategory: 'restoran',
            version: '1.0.0',
            themePreset: 'modern',
            source: { path: 'templates/../../etc', ref: 'v1.0.0' },
          },
        ],
      }),
    /təhlükəsiz/
  );
});

test('arxivdən yalnız seçilmiş şablon qovluğu və icazəli fayllar çıxarılır', () => {
  const archive = buildTarGz([
    {
      name: `restaurant-templates-1.0.0/${TEMPLATE_PATH}/template.json`,
      data: JSON.stringify({ theme: { primaryColor: '#ffc665' } }),
    },
    { name: `restaurant-templates-1.0.0/${TEMPLATE_PATH}/pages/index.html`, data: '<h1>Test</h1>' },
    { name: `restaurant-templates-1.0.0/${TEMPLATE_PATH}/run.sh`, data: 'rm -rf /' },
    { name: 'restaurant-templates-1.0.0/templates/other/template.json', data: '{}' },
    { name: 'restaurant-templates-1.0.0/README.md', data: 'root readme' },
  ]);

  const files = extractTemplateFiles(archive, TEMPLATE_PATH);

  assert.deepEqual(Array.from(files.keys()).sort(), ['pages/index.html', 'template.json']);
  assert.equal(files.get('template.json')?.toString('utf8'), JSON.stringify({ theme: { primaryColor: '#ffc665' } }));
});

test('path traversal olan arxiv rədd edilir', () => {
  const archive = buildTarGz([
    { name: `repo-main/${TEMPLATE_PATH}/../../evil.json`, data: '{}' },
  ]);

  assert.throws(
    () => extractTemplateFiles(archive, TEMPLATE_PATH),
    (error: unknown) =>
      error instanceof TemplateSourceError && error.code === 'UNSAFE_ARCHIVE'
  );
});

test('mütləq yol və simvolik link olan arxiv rədd edilir', () => {
  const absolute = buildTarGz([{ name: '/etc/passwd', data: 'root' }]);
  assert.throws(() => extractTemplateFiles(absolute, TEMPLATE_PATH), /təhlükəsiz olmayan fayl yolu/);

  const symlink = buildTarGz([
    { name: `repo-main/${TEMPLATE_PATH}/link`, data: '', type: '2' },
  ]);
  assert.throws(() => extractTemplateFiles(symlink, TEMPLATE_PATH), /simvolik link/);
});

test('gzip olmayan/zədələnmiş arxiv aydın xəta ilə rədd edilir', () => {
  assert.throws(
    () => extractTemplateFiles(Buffer.from('not-a-gzip-archive'), TEMPLATE_PATH),
    (error: unknown) => error instanceof TemplateSourceError && error.code === 'INVALID_ARCHIVE'
  );
});

test('şablon qovluğunda fayl yoxdursa xəta qaytarılır', () => {
  const archive = buildTarGz([{ name: 'repo-main/README.md', data: 'nothing here' }]);

  assert.throws(
    () => extractTemplateFiles(archive, TEMPLATE_PATH),
    (error: unknown) => error instanceof TemplateSourceError && error.code === 'EMPTY_TEMPLATE'
  );
});

test('tema dəyərləri təmizlənir, script və data URL-lər atılır', () => {
  const sanitized = sanitizeThemeOverrides({
    primaryColor: '#00D37D',
    heroHeight: '80vh',
    heroOverlay: 0.5,
    socialFeedEnabled: true,
    backgroundImageUrl: 'javascript:alert(1)',
    aboutImageUrl: '/uploads/ok.png',
    customText: '<script>alert(1)</script>',
    'bad key': 'value',
    nested: { deep: true } as unknown as string,
  });

  assert.equal(sanitized.primaryColor, '#00D37D');
  assert.equal(sanitized.heroOverlay, 0.5);
  assert.equal(sanitized.socialFeedEnabled, true);
  assert.equal(sanitized.backgroundImageUrl, undefined);
  assert.equal(sanitized.aboutImageUrl, '/uploads/ok.png');
  assert.equal('customText' in sanitized, false);
  assert.equal('bad key' in sanitized, false);
  assert.equal('nested' in sanitized, false);
});

test('şablon tərifi lokal manifestdən tapılır, naməlum ID undefined qaytarır', async () => {
  const template = await getTemplateDefinition('restaurant-modern');
  assert.equal(template?.category, 'restoran-ve-qida-sayti');
  assert.equal(template?.version, '1.0.0');
  assert.equal(await getTemplateDefinition('movcud-olmayan-sablon'), undefined);
});

test('GitHub konfiqurasiya olunmayıbsa daxili tema ilə fallback işləyir', async () => {
  const resolved = await resolveTemplateTheme('restaurant-modern');

  assert.equal(resolved.source, 'builtin');
  assert.equal(resolved.version, '1.0.0');
  assert.ok(resolved.theme.primaryColor);
  assert.match(resolved.warning || '', /GitHub/);
});

test('naməlum şablon 404 xətası qaytarır', async () => {
  await assert.rejects(
    () => resolveTemplateTheme('movcud-olmayan-sablon'),
    (error: unknown) => error instanceof Error && 'status' in error && error.status === 404
  );
});
