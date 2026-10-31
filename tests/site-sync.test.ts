import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_SANITIZE_LIMITS,
  hashSyncFiles,
  isDeniedKey,
  sanitizeForSync,
} from '../src/lib/site-sync/sanitizer';
import {
  assertSafeSiteId,
  assertSafeSlug,
  buildRepoPath,
  toSafeFileSegment,
  UnsafeSyncPathError,
} from '../src/lib/site-sync/paths';
import {
  composeSiteFiles,
  parseChangelogLines,
  readPages,
  SiteSyncPayloadError,
  type SiteSnapshot,
} from '../src/lib/site-sync/payload';
import { GitHubSyncError, GitHubWriter } from '../src/lib/site-sync/github-writer';

const SITE_ID = 'clx000000000000000000abcd';

function baseSnapshot(): SiteSnapshot {
  return {
    site: {
      id: SITE_ID,
      name: 'Test Restoran',
      slug: 'test-restoran',
      description: 'Test sayt',
      publicEmail: 'info@test.az',
      publicPhone: '+994501112233',
      isPublished: true,
      publishedAt: '2026-10-01T10:00:00.000Z',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z',
    },
    ownerId: 'user-1',
    theme: {
      published: { primaryColor: '#111111', heroHeight: '85vh' },
      draft: { primaryColor: '#222222' },
    },
    seo: { title: 'Test', description: 'Test sayt', ogImage: null },
    pages: [
      { id: 'home', name: 'Ana Səhifə', enabled: true, order: 0 },
      { id: 'menu', name: 'Menyu', enabled: true, order: 2 },
    ],
    menu: {
      categories: [
        {
          id: 'cat-1',
          name: 'Əsas yeməklər',
          slug: 'esas-yemekler',
          description: null,
          image: null,
          sortOrder: 0,
          isVisible: true,
          items: [{ id: 'item-1', name: 'Plov', slug: 'plov', price: 12 }],
        },
      ],
    },
    assets: [
      {
        filename: 'logo.png',
        url: '/uploads/logo.png',
        mimeType: 'image/png',
        size: 1024,
        fingerprint: 'abc123',
      },
    ],
    socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/test', sortOrder: 0 }],
    workingHours: [{ dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false }],
    whatsapp: { countryCode: '+994', publicPhone: '501112233', isEnabled: true },
    deletedAt: null,
  };
}

test('sanitizer gizli açarları və şəxsi məlumatı atır', () => {
  const cleaned = sanitizeForSync({
    name: 'Sayt',
    email: 'owner@example.com',
    phone: '+994500000000',
    passwordHash: '$2b$12$hash',
    apiKey: 'secret-key',
    ownerEmail: 'owner@example.com',
    publicEmail: 'info@site.az',
    publicPhone: '+994501112233',
    nested: { accessToken: 'token', note: 'saxlanır' },
    templateSource: 'github',
  }) as Record<string, unknown>;

  assert.equal(cleaned.name, 'Sayt');
  assert.equal(cleaned.email, undefined, 'istifadəçi e-poçtu yazılmamalıdır');
  assert.equal(cleaned.phone, undefined, 'istifadəçi telefonu yazılmamalıdır');
  assert.equal(cleaned.passwordHash, undefined);
  assert.equal(cleaned.apiKey, undefined);
  assert.equal(cleaned.ownerEmail, undefined);
  assert.equal(cleaned.templateSource, 'github');

  // Saytın öz açıq əlaqə məlumatı qorunur.
  assert.equal(cleaned.publicEmail, 'info@site.az');
  assert.equal(cleaned.publicPhone, '+994501112233');

  const nested = cleaned.nested as Record<string, unknown>;
  assert.equal(nested.accessToken, undefined);
  assert.equal(nested.note, 'saxlanır');
});

test('sanitizer şəkilçi ilə gələn gizli açarları və icazəsiz tipləri atır', () => {
  assert.equal(isDeniedKey('nextAuthSecret'), true);
  assert.equal(isDeniedKey('refreshToken'), true);
  assert.equal(isDeniedKey('webhookSecret'), true);
  assert.equal(isDeniedKey('publicEmail'), false);
  assert.equal(isDeniedKey('siteCategory'), false);

  const cleaned = sanitizeForSync({
    fn: () => 'x',
    big: BigInt(10),
    binary: Buffer.from('x'),
    keep: 'ok',
  }) as Record<string, unknown>;

  assert.equal(cleaned.fn, undefined);
  assert.equal(cleaned.big, undefined);
  assert.equal(cleaned.binary, undefined);
  assert.equal(cleaned.keep, 'ok');
});

test('sanitizer dərinlik və massiv limitlərini tətbiq edir', () => {
  let deep: Record<string, unknown> = { value: 'bottom' };
  for (let i = 0; i < DEFAULT_SANITIZE_LIMITS.maxDepth + 3; i += 1) {
    deep = { nested: deep };
  }

  const cleaned = sanitizeForSync(deep);
  let cursor: unknown = cleaned;
  let depth = 0;
  while (cursor && typeof cursor === 'object' && depth < 50) {
    const keys = Object.keys(cursor as Record<string, unknown>);
    if (keys.length === 0) break;
    cursor = (cursor as Record<string, unknown>)[keys[0]];
    depth += 1;
  }
  assert.ok(depth <= DEFAULT_SANITIZE_LIMITS.maxDepth + 1, 'dərinlik limiti pozulmamalıdır');

  const manyItems = sanitizeForSync({ list: Array.from({ length: 500 }, (_, i) => i) }) as {
    list: unknown[];
  };
  assert.equal(manyItems.list.length, DEFAULT_SANITIZE_LIMITS.maxArrayLength);
});

test('hash fayl sırasından asılı deyil və CHANGELOG-u nəzərə almır', () => {
  const a = new Map([
    ['sites/x/site.json', '{"a":1}'],
    ['sites/x/theme.json', '{"b":2}'],
    ['sites/x/CHANGELOG.md', '- 1'],
  ]);
  const b = new Map([
    ['sites/x/theme.json', '{"b":2}'],
    ['sites/x/site.json', '{"a":1}'],
    ['sites/x/CHANGELOG.md', '- 2'],
  ]);
  const c = new Map([
    ['sites/x/site.json', '{"a":2}'],
    ['sites/x/theme.json', '{"b":2}'],
  ]);

  assert.equal(hashSyncFiles(a), hashSyncFiles(b));
  assert.notEqual(hashSyncFiles(a), hashSyncFiles(c));
});

test('yol validasiyası traversal və mütləq yolları rədd edir', () => {
  assert.equal(assertSafeSiteId(SITE_ID), SITE_ID);
  assert.equal(assertSafeSlug('test-restoran'), 'test-restoran');

  assert.throws(() => assertSafeSiteId('../etc/passwd'), UnsafeSyncPathError);
  assert.throws(() => assertSafeSiteId('SITE_ID'), UnsafeSyncPathError);
  assert.throws(() => assertSafeSlug('slug/../../x'), UnsafeSyncPathError);
  assert.throws(() => buildRepoPath('sites', '../x'), UnsafeSyncPathError);
  assert.throws(() => buildRepoPath('/etc', 'passwd'), UnsafeSyncPathError);
  assert.throws(() => buildRepoPath('sites', 'a\\b'), UnsafeSyncPathError);

  assert.match(toSafeFileSegment('Ana Səhifə!', 'page-0'), /^[a-z0-9-]+$/);
  assert.equal(toSafeFileSegment('', 'page-1'), 'page-1');
});

test('composeSiteFiles gözlənilən strukturu və təmiz məzmunu yaradır', () => {
  const snapshot = baseSnapshot();
  snapshot.site = {
    ...snapshot.site,
    ownerEmail: 'leak@example.com',
    passwordHash: 'should-not-appear',
  };

  const result = composeSiteFiles(snapshot, {
    changelogLines: ['- 2026-10-30 — v1 (publish)'],
  });

  const paths = Array.from(result.files.keys()).sort();
  assert.deepEqual(paths, [
    `sites/${SITE_ID}/CHANGELOG.md`,
    `sites/${SITE_ID}/assets.json`,
    `sites/${SITE_ID}/pages/home.json`,
    `sites/${SITE_ID}/pages/menu.json`,
    `sites/${SITE_ID}/site.json`,
    `sites/${SITE_ID}/theme.json`,
  ]);

  const siteJson = result.files.get(`sites/${SITE_ID}/site.json`) as string;
  assert.ok(!siteJson.includes('leak@example.com'), 'istifadəçi e-poçtu sızmamalıdır');
  assert.ok(!siteJson.includes('should-not-appear'));

  const siteData = JSON.parse(siteJson);
  assert.equal(siteData.publicEmail, 'info@test.az');
  assert.equal(siteData.ownerId, 'user-1');

  const menuPage = JSON.parse(result.files.get(`sites/${SITE_ID}/pages/menu.json`) as string);
  assert.equal(menuPage.content.categories[0].items[0].slug, 'plov');

  const assets = JSON.parse(result.files.get(`sites/${SITE_ID}/assets.json`) as string);
  assert.equal(assets.assets[0].url, '/uploads/logo.png');

  assert.deepEqual(parseChangelogLines(result.files.get(`sites/${SITE_ID}/CHANGELOG.md`) ?? null), [
    '- 2026-10-30 — v1 (publish)',
  ]);

  // İdempotentlik: eyni snapshot → eyni hash.
  const again = composeSiteFiles(baseSnapshot(), {
    changelogLines: ['- 2026-10-30 — v1 (publish)'],
  });
  assert.equal(result.contentHash, again.contentHash);
});

test('səhifə konfiqurasiyası massiv və JSON mətni kimi oxunur', () => {
  const page = { id: 'home', name: 'Ana Səhifə', enabled: true, order: 0 };

  assert.equal(readPages([page]).length, 1);
  assert.equal(readPages(JSON.stringify([page])).length, 1, 'JSON mətni dəstəklənir');
  assert.equal(
    readPages(JSON.stringify(JSON.stringify([page]))).length,
    1,
    'iki dəfə kodlanmış mətn dəstəklənir'
  );
  assert.deepEqual(readPages(null), []);
  assert.deepEqual(readPages('broken{'), []);
  assert.deepEqual(readPages({ id: 'home' }), []);
});

test('menyu səhifəsi olmayanda məzmun ayrıca fayla yazılır', () => {
  const snapshot = baseSnapshot();
  snapshot.pages = [{ id: 'home', name: 'Ana Səhifə', enabled: true, order: 0 }];

  const result = composeSiteFiles(snapshot);
  assert.ok(result.files.has(`sites/${SITE_ID}/content/menu.json`));
});

test('ölçü limiti aşılarsa SiteSyncPayloadError atılır', () => {
  assert.throws(
    () =>
      composeSiteFiles(baseSnapshot(), {
        limits: { maxFileBytes: 10, maxTotalBytes: 100, maxFiles: 10, changelogLines: 10 },
      }),
    (error: unknown) =>
      error instanceof SiteSyncPayloadError && error.code === 'TOO_LARGE'
  );
});

/* ------------------------------------------------------------------ */
/* GitHub writer — mock fetch                                          */
/* ------------------------------------------------------------------ */

interface MockState {
  head: string | null;
  commits: Map<string, string>;
  commitCounter: number;
  treeCounter: number;
  blobCalls: number;
  patchCalls: number;
  initialCommitCalls: number;
  failFirstPatch: boolean;
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function createMockGitHub(failFirstPatch = false) {
  const state: MockState = {
    head: null,
    commits: new Map(),
    commitCounter: 0,
    treeCounter: 0,
    blobCalls: 0,
    patchCalls: 0,
    initialCommitCalls: 0,
    failFirstPatch,
  };
  const calls: string[] = [];

  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? 'GET').toUpperCase();
    const path = url.replace('https://api.github.com/repos/acme/sites', '');
    calls.push(`${method} ${path}`);

    if (method === 'GET' && path === '') {
      return jsonResponse({
        private: true,
        default_branch: 'main',
        html_url: 'https://github.com/acme/sites',
      });
    }

    if (method === 'GET' && path.startsWith('/git/ref/heads/')) {
      if (!state.head) return jsonResponse({ message: 'Not Found' }, 404);
      return jsonResponse({ object: { sha: state.head } });
    }

    if (method === 'POST' && path === '/git/trees') {
      // Real GitHub: boş repository-də Git Data API 409 qaytarır.
      if (!state.head) return jsonResponse({ message: 'Git Repository is empty.' }, 409);
      const body = JSON.parse(String(init?.body ?? '{}'));
      state.treeCounter += 1;
      const sha = body.base_tree ? `tree-${state.treeCounter}` : 'tree-root';
      return jsonResponse({ sha });
    }

    if (method === 'PUT' && path === '/contents/README.md') {
      state.initialCommitCalls += 1;
      if (state.head) return jsonResponse({ message: 'sha not supplied' }, 422);
      state.head = 'commit-init';
      state.commits.set('commit-init', 'tree-root');
      return jsonResponse({ content: { path: 'README.md' }, commit: { sha: 'commit-init' } }, 201);
    }

    if (method === 'POST' && path === '/git/blobs') {
      state.blobCalls += 1;
      return jsonResponse({ sha: `blob-${state.blobCalls}` });
    }

    if (method === 'GET' && path.startsWith('/git/commits/')) {
      const sha = decodeURIComponent(path.slice('/git/commits/'.length));
      return jsonResponse({ sha, tree: { sha: state.commits.get(sha) ?? 'tree-root' } });
    }

    if (method === 'POST' && path === '/git/commits') {
      const body = JSON.parse(String(init?.body ?? '{}'));
      state.commitCounter += 1;
      const sha = `commit-${state.commitCounter}`;
      state.commits.set(sha, body.tree);
      return jsonResponse({ sha, tree: { sha: body.tree } });
    }

    if (method === 'POST' && path === '/git/refs') {
      const body = JSON.parse(String(init?.body ?? '{}'));
      state.head = body.sha;
      return jsonResponse({ ref: body.ref, object: { sha: body.sha } });
    }

    if (method === 'PATCH' && path.startsWith('/git/refs/heads/')) {
      const body = JSON.parse(String(init?.body ?? '{}'));
      state.patchCalls += 1;
      if (state.failFirstPatch && state.patchCalls === 1) {
        return jsonResponse({ message: 'Update is not a fast forward' }, 422);
      }
      state.head = body.sha;
      return jsonResponse({ object: { sha: body.sha } });
    }

    return jsonResponse({ message: `unexpected ${method} ${path}` }, 500);
  }) as typeof fetch;

  return { fetchImpl, state, calls };
}

const writerConfig = {
  repository: 'acme/sites',
  branch: 'main',
  token: 'test-token',
  apiBaseUrl: 'https://api.github.com',
};

test('commitFiles boş repository-də branch yaradır və bütün faylları tək commit-də yazır', async () => {
  const mock = createMockGitHub();
  const delays: number[] = [];

  const writer = new GitHubWriter(writerConfig, {
    fetchImpl: mock.fetchImpl,
    sleep: async (ms) => {
      delays.push(ms);
    },
    random: () => 0,
  });

  const result = await writer.commitFiles(
    new Map([
      ['sites/x/site.json', '{"a":1}'],
      ['sites/x/theme.json', '{"b":2}'],
    ]),
    'site(x): publish v1 by user-1'
  );

  assert.equal(result.changed, 2);
  assert.equal(mock.state.initialCommitCalls, 1, 'boş repo ilk commit-i Contents API ilə alır');
  assert.equal(mock.state.patchCalls, 1, 'ref yalnız bir dəfə yenilənməlidir');
  assert.equal(mock.state.blobCalls, 2);
  assert.equal(mock.state.commitCounter, 1, 'initial commit Contents API-dən, sayt commit-i bir dənə');
  assert.equal(mock.state.head, result.sha);
  assert.deepEqual(delays, []);
});

test('422 konfliktində ref yenidən oxunur və backoff ilə təkrarlanır', async () => {
  const mock = createMockGitHub(true);
  const delays: number[] = [];

  const writer = new GitHubWriter(writerConfig, {
    fetchImpl: mock.fetchImpl,
    sleep: async (ms) => {
      delays.push(ms);
    },
    random: () => 0,
  });

  const result = await writer.commitFiles(
    new Map([['sites/x/site.json', '{"a":1}']]),
    'site(x): publish v1 by user-1'
  );

  assert.equal(mock.state.patchCalls, 2, 'ilk PATCH konflikt, ikinci uğurlu');
  assert.equal(mock.state.blobCalls, 1, 'retry zamanı blob yenidən yaradılmır');
  assert.equal(delays.length, 1);
  assert.ok(delays[0] >= 250, 'backoff tətbiq olunmalıdır');
  assert.equal(mock.state.head, result.sha);
});

test('rate limit (403 + x-ratelimit) aydın xəta qaytarır', async () => {
  const fetchImpl = (async () =>
    jsonResponse({ message: 'API rate limit exceeded' }, 403, {
      'x-ratelimit-remaining': '0',
      'retry-after': '2',
    })) as unknown as typeof fetch;

  const writer = new GitHubWriter(writerConfig, { fetchImpl });

  await assert.rejects(
    () => writer.assertPrivateRepository(),
    (error: unknown) =>
      error instanceof GitHubSyncError &&
      error.code === 'RATE_LIMIT' &&
      error.retryable === true &&
      error.retryAfterMs === 2000
  );
});

test('publik repository sinxronizasiyanı dayandırır', async () => {
  const fetchImpl = (async () =>
    jsonResponse({ private: false, default_branch: 'main', html_url: 'x' }, 200)) as unknown as typeof fetch;

  const writer = new GitHubWriter(writerConfig, { fetchImpl });

  await assert.rejects(
    () => writer.assertPrivateRepository(),
    (error: unknown) => error instanceof GitHubSyncError && error.code === 'PUBLIC_REPO'
  );
});

test('401 və şəbəkə xətaları düzgün kodlarla qaytarılır', async () => {
  const unauthorized = (async () =>
    jsonResponse({ message: 'Bad credentials' }, 401)) as unknown as typeof fetch;
  await assert.rejects(
    () => new GitHubWriter(writerConfig, { fetchImpl: unauthorized }).assertPrivateRepository(),
    (error: unknown) => error instanceof GitHubSyncError && error.code === 'AUTH'
  );

  const offline = (async () => {
    throw new TypeError('fetch failed');
  }) as unknown as typeof fetch;
  await assert.rejects(
    () => new GitHubWriter(writerConfig, { fetchImpl: offline }).assertPrivateRepository(),
    (error: unknown) =>
      error instanceof GitHubSyncError && error.code === 'NETWORK' && error.retryable === true
  );
});
