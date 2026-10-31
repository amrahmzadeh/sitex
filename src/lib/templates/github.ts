import { gunzipSync } from 'node:zlib';
import {
  getConfiguredRef,
  getLocalManifest,
  parseTemplateManifest,
  resolveTemplateSource,
  TemplateManifestError,
  type TemplateDefinition,
  type TemplateManifest,
} from './manifest';

/** Uzaq manifestdə (varsa) və ya lokal manifestdə şablon tərifini tapır. */
export async function getTemplateDefinition(
  templateId: string
): Promise<TemplateDefinition | undefined> {
  const remote = await fetchRemoteManifest();
  const manifest = remote.manifest || getLocalManifest();
  return manifest.templates.find((template) => template.id === templateId);
}

/**
 * GitHub əsaslı şablon mənbəyi.
 *
 * Şablonlar serverdə yalnız tələb olunduqda endirilir, yaddaşda saxlanılmır,
 * arxiv təhlükəsiz şəkildə yoxlanılır və istifadəçi saytına heç bir fayl
 * kopyalanmır. Token yalnız bu modulda, server tərəfində oxunur.
 */

const MAX_ARCHIVE_BYTES = 30 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 60 * 1024 * 1024;
const MAX_FILE_BYTES = 3 * 1024 * 1024;
const MAX_TOTAL_FILES_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 300;
const DOWNLOAD_TIMEOUT_MS = 20_000;
const MANIFEST_TTL_MS = 5 * 60 * 1000;
const MANIFEST_FAILURE_TTL_MS = 60 * 1000;

const ALLOWED_EXTENSIONS = new Set([
  '.json', '.md', '.txt', '.html', '.htm', '.css', '.scss',
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif',
  '.woff', '.woff2', '.ttf', '.otf', '.ico', '.webmanifest',
]);

const SKIPPED_SEGMENTS = new Set(['.git', 'node_modules', '__MACOSX']);

export type TemplateSourceErrorCode =
  | 'NOT_CONFIGURED'
  | 'NOT_FOUND'
  | 'AUTH'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'ARCHIVE_TOO_LARGE'
  | 'INVALID_ARCHIVE'
  | 'UNSAFE_ARCHIVE'
  | 'EMPTY_TEMPLATE'
  | 'TOO_MANY_FILES';

export class TemplateSourceError extends Error {
  code: TemplateSourceErrorCode;
  status: number;

  constructor(message: string, code: TemplateSourceErrorCode, status = 502) {
    super(message);
    this.name = 'TemplateSourceError';
    this.code = code;
    this.status = status;
  }
}

function mapHttpError(status: number): TemplateSourceError {
  if (status === 401 || status === 403) {
    return new TemplateSourceError(
      'GitHub şablon mənbəyinə giriş icazəsi yoxdur. GITHUB_TEMPLATE_TOKEN və repository ayarlarını yoxlayın.',
      'AUTH',
      502
    );
  }
  if (status === 404) {
    return new TemplateSourceError(
      'Şablon repository-si, versiyası və ya şablon qovluğu tapılmadı.',
      'NOT_FOUND',
      404
    );
  }
  if (status === 429) {
    return new TemplateSourceError(
      'GitHub API limiti aşıldı. Bir az sonra yenidən cəhd edin və ya GITHUB_TEMPLATE_TOKEN təyin edin.',
      'RATE_LIMIT',
      503
    );
  }
  return new TemplateSourceError(
    `GitHub şablon mənbəyi əlçatan deyil (HTTP ${status}).`,
    'NETWORK',
    502
  );
}

async function fetchWithTimeout(
  url: string,
  token?: string,
  accept = 'application/vnd.github+json'
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'SiteX-Template-Installer',
      Accept: accept,
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    return await fetch(url, {
      headers,
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
      throw new TemplateSourceError(
        'GitHub şablon mənbəyi vaxtında cavab vermədi. Yenidən cəhd edin.',
        'TIMEOUT',
        504
      );
    }
    throw new TemplateSourceError(
      'GitHub şablon mənbəyinə qoşulmaq mümkün olmadı. Şəbəkə və ya repository ayarlarını yoxlayın.',
      'NETWORK',
      502
    );
  } finally {
    clearTimeout(timer);
  }
}

async function readBodyWithLimit(response: Response, limit: number): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > limit) {
    throw new TemplateSourceError(
      'Şablon arxivi icazə verilən ölçüdən böyükdür.',
      'ARCHIVE_TOO_LARGE'
    );
  }

  if (!response.body) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > limit) {
      throw new TemplateSourceError('Şablon arxivi icazə verilən ölçüdən böyükdür.', 'ARCHIVE_TOO_LARGE');
    }
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel().catch(() => {});
        throw new TemplateSourceError('Şablon arxivi icazə verilən ölçüdən böyükdür.', 'ARCHIVE_TOO_LARGE');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks);
}

async function downloadArchive(repository: string, ref: string): Promise<Buffer> {
  const token = process.env.GITHUB_TEMPLATE_TOKEN?.trim();
  // Token varsa GitHub API (private repo dəstəyi), yoxsa codeload (API limitinə düşmür).
  const url = token
    ? `https://api.github.com/repos/${repository}/tarball/${encodeURIComponent(ref)}`
    : `https://codeload.github.com/${repository}/tar.gz/${encodeURIComponent(ref)}`;

  const response = await fetchWithTimeout(url, token);
  if (!response.ok) throw mapHttpError(response.status);
  return readBodyWithLimit(response, MAX_ARCHIVE_BYTES);
}

function readString(header: Buffer, offset: number, length: number): string {
  const slice = header.subarray(offset, offset + length);
  const end = slice.indexOf(0);
  return (end === -1 ? slice : slice.subarray(0, end)).toString('utf8').trim();
}

function readOctal(header: Buffer, offset: number, length: number): number {
  const raw = readString(header, offset, length).replace(/[^0-7]/g, '');
  if (!raw) return 0;
  return parseInt(raw, 8);
}

function isSafeTarPath(value: string): boolean {
  if (!value || value.startsWith('/') || value.includes('\\') || value.includes('\0')) return false;
  return !value.split('/').some((part) => part === '' || part === '.' || part === '..');
}

interface TarFile {
  path: string;
  data: Buffer;
}

function readTarEntries(tar: Buffer): TarFile[] {
  const entries: TarFile[] = [];
  let offset = 0;
  let zeroBlocks = 0;

  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);

    if (header.every((byte) => byte === 0)) {
      zeroBlocks += 1;
      offset += 512;
      if (zeroBlocks >= 2) break;
      continue;
    }
    zeroBlocks = 0;

    const name = readString(header, 0, 100);
    const prefix = readString(header, 345, 155);
    const fullPath = prefix ? `${prefix}/${name}` : name;
    const size = readOctal(header, 124, 12);
    const typeFlag = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;

    if (dataEnd > tar.length) {
      throw new TemplateSourceError('Şablon arxivi zədələnib (natamam fayl).', 'INVALID_ARCHIVE');
    }

    if (typeFlag === '1' || typeFlag === '2' || typeFlag === '3' || typeFlag === '4' || typeFlag === '6') {
      throw new TemplateSourceError(
        'Şablon arxivində simvolik link və ya xüsusi fayl aşkarlandı və rədd edildi.',
        'UNSAFE_ARCHIVE'
      );
    }

    if (typeFlag === 'L' || typeFlag === 'K') {
      throw new TemplateSourceError(
        'Şablon arxivində uzun fayl adı başlığı aşkarlandı və rədd edildi.',
        'UNSAFE_ARCHIVE'
      );
    }

    if (typeFlag === '0' || typeFlag === '\0') {
      if (!isSafeTarPath(fullPath)) {
        throw new TemplateSourceError(
          'Şablon arxivində təhlükəsiz olmayan fayl yolu aşkarlandı.',
          'UNSAFE_ARCHIVE'
        );
      }
      entries.push({ path: fullPath, data: tar.subarray(dataStart, dataEnd) });
    }
    // '5' (qovluq), 'x'/'g' (PAX metadata) səssiz ötürülür.

    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  return entries;
}

function isAllowedTemplateFile(relativePath: string): boolean {
  const segments = relativePath.split('/');
  if (segments.some((segment) => SKIPPED_SEGMENTS.has(segment))) return false;
  if (segments.some((segment) => segment.startsWith('.'))) return false;

  const basename = segments[segments.length - 1];
  if (!basename || basename.toLowerCase().startsWith('.env')) return false;

  const dotIndex = basename.lastIndexOf('.');
  if (dotIndex <= 0) return false;
  return ALLOWED_EXTENSIONS.has(basename.slice(dotIndex).toLowerCase());
}

/**
 * Arxivdən yalnız seçilmiş şablon qovluğundakı faylları çıxarır.
 * Yol traversal, link faylları, ölçü və fayl sayı limitləri burada tətbiq olunur.
 */
export function extractTemplateFiles(
  archive: Buffer,
  templatePath: string
): Map<string, Buffer> {
  if (!isSafeTarPath(templatePath)) {
    throw new TemplateSourceError('Şablon yolu etibarsızdır.', 'UNSAFE_ARCHIVE');
  }

  let tar: Buffer;
  try {
    tar = gunzipSync(archive, { maxOutputLength: MAX_UNCOMPRESSED_BYTES });
  } catch {
    throw new TemplateSourceError(
      'Şablon arxivi açıla bilmədi və ya icazə verilən ölçüdən böyükdür.',
      'INVALID_ARCHIVE'
    );
  }

  const allEntries = readTarEntries(tar);
  const templateSegments = templatePath.split('/');
  const files = new Map<string, Buffer>();
  const roots = new Set<string>();
  let totalBytes = 0;

  for (const entry of allEntries) {
    const segments = entry.path.split('/');

    let matchIndex = -1;
    for (let i = 1; i <= segments.length - templateSegments.length; i += 1) {
      if (templateSegments.every((part, j) => segments[i + j] === part)) {
        matchIndex = i;
        break;
      }
    }
    if (matchIndex === -1) continue;

    roots.add(segments.slice(0, matchIndex).join('/'));
    const relative = segments.slice(matchIndex + templateSegments.length).join('/');
    if (!relative || !isAllowedTemplateFile(relative)) continue;

    if (entry.data.length > MAX_FILE_BYTES) {
      throw new TemplateSourceError(
        `Şablon faylı icazə verilən ölçüdən böyükdür: ${relative}`,
        'ARCHIVE_TOO_LARGE'
      );
    }

    totalBytes += entry.data.length;
    if (totalBytes > MAX_TOTAL_FILES_BYTES) {
      throw new TemplateSourceError('Şablon fayllarının ümumi ölçüsü limiti aşır.', 'ARCHIVE_TOO_LARGE');
    }

    files.set(relative, entry.data);
    if (files.size > MAX_FILES) {
      throw new TemplateSourceError('Şablonda icazə veriləndən çox fayl var.', 'TOO_MANY_FILES');
    }
  }

  if (roots.size > 1) {
    throw new TemplateSourceError(
      'Şablon arxivində birdən çox kök qovluq uyğun gəldi və qeyri-müəyyənlik yarandı.',
      'UNSAFE_ARCHIVE'
    );
  }

  if (files.size === 0) {
    throw new TemplateSourceError(
      'Şablon qovluğunda istifadə oluna bilən fayl tapılmadı.',
      'EMPTY_TEMPLATE',
      404
    );
  }

  return files;
}

export interface DownloadedTemplate {
  files: Map<string, Buffer>;
  repository: string;
  ref: string;
  repositoryPath: string;
}

/** Bütün repository-ni deyil, yalnız seçilmiş şablonu endirir və çıxarır. */
export async function downloadTemplateFiles(template: TemplateDefinition): Promise<DownloadedTemplate> {
  const source = resolveTemplateSource(template);
  if (!source) {
    throw new TemplateSourceError(
      'GitHub şablon mənbəyi konfiqurasiya edilməyib. GITHUB_TEMPLATE_REPO dəyişənini təyin edin.',
      'NOT_CONFIGURED',
      503
    );
  }

  const archive = await downloadArchive(source.repository, source.ref);
  const files = extractTemplateFiles(archive, source.path);

  return {
    files,
    repository: source.repository,
    ref: source.ref,
    repositoryPath: source.path,
  };
}

interface ManifestCacheEntry {
  key: string;
  expiresAt: number;
  manifest?: TemplateManifest;
  error?: string;
}

let manifestCache: ManifestCacheEntry | null = null;

/**
 * Manifesti GitHub-dan oxuyur (konfiqurasiya olunubsa) və 5 dəqiqə keşləyir.
 * Uğursuz cəhdlər 1 dəqiqə keşlənir ki, GitHub API limiti boş yerə xərclənməsin.
 */
export async function fetchRemoteManifest(): Promise<{
  manifest: TemplateManifest | null;
  source: 'github' | 'local';
  error?: string;
  cached: boolean;
}> {
  const local = getLocalManifest();
  const repository = process.env.GITHUB_TEMPLATE_REPO?.trim();
  if (!repository) {
    return { manifest: local, source: 'local', cached: false };
  }

  const ref = process.env.GITHUB_TEMPLATE_REF?.trim() || local.defaults.ref;
  const manifestPath = process.env.GITHUB_TEMPLATE_MANIFEST?.trim() || local.defaults.manifestPath;
  const key = `${repository}@${ref}:${manifestPath}`;
  const now = Date.now();

  if (manifestCache && manifestCache.key === key && manifestCache.expiresAt > now) {
    if (manifestCache.manifest) {
      return { manifest: manifestCache.manifest, source: 'github', cached: true };
    }
    return {
      manifest: local,
      source: 'local',
      error: manifestCache.error,
      cached: true,
    };
  }

  try {
    const token = process.env.GITHUB_TEMPLATE_TOKEN?.trim();
    const url = `https://api.github.com/repos/${repository}/contents/${manifestPath}?ref=${encodeURIComponent(ref)}`;
    const response = await fetchWithTimeout(url, token, 'application/vnd.github.raw');

    if (!response.ok) throw mapHttpError(response.status);

    const raw = JSON.parse(await response.text());
    const manifest = parseTemplateManifest(raw);
    manifestCache = { key, expiresAt: now + MANIFEST_TTL_MS, manifest };
    return { manifest, source: 'github', cached: false };
  } catch (error) {
    const message =
      error instanceof TemplateSourceError || error instanceof TemplateManifestError
        ? error.message
        : 'GitHub manifestini oxumaq mümkün olmadı.';

    manifestCache = { key, expiresAt: now + MANIFEST_FAILURE_TTL_MS, error: message };
    return { manifest: local, source: 'local', error: message, cached: false };
  }
}

/** Testlər üçün keşi sıfırlayır. */
export function resetTemplateSourceCache(): void {
  manifestCache = null;
}

export { getConfiguredRef };
