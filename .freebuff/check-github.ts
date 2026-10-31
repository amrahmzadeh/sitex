/**
 * GitHub şablon mənbəyini tətbiqin öz modulları ilə yoxlayır.
 * Token yalnız mühitdən oxunur, çap olunmur.
 */
import {
  downloadTemplateFiles,
  fetchRemoteManifest,
  resetTemplateSourceCache,
} from '../src/lib/templates/github';
import { resolveTemplateTheme } from '../src/lib/templates/installer';

async function main() {
  const results: Record<string, unknown> = {};

  resetTemplateSourceCache();
  const remote = await fetchRemoteManifest();
  results.manifest = {
    source: remote.source,
    error: remote.error ?? null,
    cached: remote.cached,
    count: remote.manifest?.templates.length ?? 0,
    ids: remote.manifest?.templates.map((t) => t.id).slice(0, 4),
  };

  const restaurant = await resolveTemplateTheme('restaurant-modern');
  results.restaurant = {
    source: restaurant.source,
    fileCount: restaurant.fileCount,
    primaryColor: restaurant.theme.primaryColor,
    heroHeight: restaurant.theme.heroHeight,
    name: restaurant.name,
    warning: restaurant.warning ?? null,
  };

  const saas = await resolveTemplateTheme('saas-landing');
  results.saas = {
    source: saas.source,
    fileCount: saas.fileCount,
    primaryColor: saas.theme.primaryColor,
    textColor: saas.theme.textColor,
    warning: saas.warning ?? null,
  };

  // Token olmadan private repo → codeload 404 → daxili temaya düşməlidir.
  const savedToken = process.env.GITHUB_TEMPLATE_TOKEN;
  delete process.env.GITHUB_TEMPLATE_TOKEN;
  resetTemplateSourceCache();
  const offline = await resolveTemplateTheme('restaurant-modern');
  results.withoutToken = {
    source: offline.source,
    primaryColor: offline.theme.primaryColor,
    warningPresent: Boolean(offline.warning),
  };
  process.env.GITHUB_TEMPLATE_TOKEN = savedToken;

  // Yanlış tag → aydın xəta + fallback.
  const savedRef = process.env.GITHUB_TEMPLATE_REF;
  process.env.GITHUB_TEMPLATE_REF = 'v9.9.9-nonexistent';
  resetTemplateSourceCache();
  const badRef = await resolveTemplateTheme('restaurant-modern');
  results.badRef = {
    source: badRef.source,
    warning: badRef.warning ? badRef.warning.slice(0, 120) : null,
  };
  process.env.GITHUB_TEMPLATE_REF = savedRef;

  // Yalnız GitHub mənbəyi olan (daxili teması olmayan) şablon xətası.
  resetTemplateSourceCache();

  const raw = await downloadTemplateFiles({
    id: 'restaurant-modern',
    name: 'Modern Restoran',
    category: 'restoran-ve-qida-sayti',
    subcategory: 'restoran',
    version: '1.0.0',
    source: { path: 'templates/restaurant-modern', ref: 'v1.0.0' },
  });
  results.downloaded = {
    files: [...raw.files.keys()].sort(),
    repository: raw.repository,
    ref: raw.ref,
    repositoryPath: raw.repositoryPath,
  };

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error('FAILED:', error instanceof Error ? error.message : error);
  process.exit(1);
});
