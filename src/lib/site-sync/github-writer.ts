import type { SiteSyncConfig } from './config';
import { assertSafeBranch, buildRepoPath } from './paths';

/**
 * GitHub-a YAZMA üçün klient (Git Data API).
 *
 * Şablon oxuyan `src/lib/templates/github.ts` modulundan ayrıdır: başqa token
 * (`GITHUB_SITES_TOKEN`), başqa repository və başqa icazə səviyyəsi.
 *
 * Bir saytın bütün faylları TƏK commit-də yazılır:
 *   blobs → tree (base_tree ilə) → commit → ref yeniləmə
 * Hər fayl üçün ayrı `PUT /contents` sorğusu edilmir.
 */

export type GitHubSyncErrorCode =
  | 'NOT_CONFIGURED'
  | 'PUBLIC_REPO'
  | 'AUTH'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'SERVER'
  | 'INVALID_RESPONSE';

export class GitHubSyncError extends Error {
  code: GitHubSyncErrorCode;
  status: number;
  retryable: boolean;
  retryAfterMs?: number;

  constructor(
    message: string,
    code: GitHubSyncErrorCode,
    options: { status?: number; retryable?: boolean; retryAfterMs?: number } = {}
  ) {
    super(message);
    this.name = 'GitHubSyncError';
    this.code = code;
    this.status = options.status ?? 0;
    this.retryable = options.retryable ?? false;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export interface GitHubWriterConfig {
  repository: string;
  branch: string;
  token: string;
  apiBaseUrl: string;
}

export interface GitHubWriterDeps {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
  timeoutMs?: number;
  maxConflictRetries?: number;
  maxListedFiles?: number;
}

interface GitHubRefResponse {
  object: { sha: string };
}

interface GitHubCommitResponse {
  sha: string;
  tree: { sha: string };
}

interface GitHubTreeResponse {
  sha: string;
}

interface GitHubRepositoryResponse {
  private: boolean;
  default_branch: string;
  html_url: string;
}

interface GitHubTreeListEntry {
  path: string;
  type: string;
  sha: string;
  size?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_CONFLICT_RETRIES = 2;
const DEFAULT_MAX_LISTED_FILES = 500;

const INITIAL_COMMIT_MESSAGE = 'chore: initialize site sync repository';
const INITIAL_README = [
  '# Saytların GitHub ehtiyat nüsxəsi',
  '',
  'Bu repository platformada yaradılmış veb saytların avtomatik ehtiyat nüsxəsidir.',
  'Hər sayt `sites/<siteId>/` qovluğunda saxlanılır və hər publish bir commit-dir.',
  'Faylları əl ilə redaktə etməyin — növbəti sinxronizasiya onları üzərinə yazacaq.',
  '',
].join('\n');

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class GitHubWriter {
  private readonly config: GitHubWriterConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly random: () => number;
  private readonly timeoutMs: number;
  private readonly maxConflictRetries: number;
  private readonly maxListedFiles: number;

  constructor(config: GitHubWriterConfig, deps: GitHubWriterDeps = {}) {
    assertSafeBranch(config.branch);
    this.config = config;
    this.fetchImpl = deps.fetchImpl ?? ((...args) => fetch(...args));
    this.sleep = deps.sleep ?? defaultSleep;
    this.random = deps.random ?? Math.random;
    this.timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxConflictRetries = deps.maxConflictRetries ?? DEFAULT_CONFLICT_RETRIES;
    this.maxListedFiles = deps.maxListedFiles ?? DEFAULT_MAX_LISTED_FILES;
  }

  static fromConfig(config: SiteSyncConfig, deps: GitHubWriterDeps = {}): GitHubWriter {
    return new GitHubWriter(
      {
        repository: config.repository,
        branch: config.branch,
        token: config.token,
        apiBaseUrl: config.apiBaseUrl,
      },
      deps
    );
  }

  get repository(): string {
    return this.config.repository;
  }

  get branch(): string {
    return this.config.branch;
  }

  private apiUrl(path: string): string {
    return `${this.config.apiBaseUrl.replace(/\/+$/, '')}/repos/${this.config.repository}${path}`;
  }

  private encodePath(repoPath: string): string {
    return repoPath.split('/').map((segment) => encodeURIComponent(segment)).join('/');
  }

  private rateLimitFromHeaders(headers: Headers): GitHubSyncError | null {
    const remaining = headers.get('x-ratelimit-remaining');
    const retryAfter = headers.get('retry-after');
    const reset = headers.get('x-ratelimit-reset');

    if (remaining !== '0' && !retryAfter) return null;

    let retryAfterMs: number | undefined;
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds)) retryAfterMs = Math.max(1, seconds) * 1000;
    } else if (reset) {
      const resetSeconds = Number(reset);
      if (Number.isFinite(resetSeconds)) {
        retryAfterMs = Math.max(1000, resetSeconds * 1000 - Date.now());
      }
    }

    return new GitHubSyncError(
      'GitHub API limiti aşıldı. Sinxronizasiya bir az sonra təkrar olunacaq.',
      'RATE_LIMIT',
      { status: 429, retryable: true, retryAfterMs }
    );
  }

  private async request(
    method: string,
    path: string,
    options: { body?: unknown; raw?: boolean } = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.config.token}`,
        Accept: options.raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'SiteX-Site-Sync',
      };
      if (options.body !== undefined) headers['Content-Type'] = 'application/json';

      const response = await this.fetchImpl(this.apiUrl(path), {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.ok) return response;

      const status = response.status;
      const text = await response.text().catch(() => '');

      if (status === 401) {
        throw new GitHubSyncError(
          'GitHub tokeni etibarsızdır (401). GITHUB_SITES_TOKEN dəyərini yeniləyin.',
          'AUTH',
          { status }
        );
      }

      if (status === 403) {
        const rateLimited = this.rateLimitFromHeaders(response.headers);
        if (rateLimited) throw rateLimited;
        if (/rate limit/i.test(text)) {
          throw new GitHubSyncError(
            'GitHub API limiti aşıldı. Sinxronizasiya bir az sonra təkrar olunacaq.',
            'RATE_LIMIT',
            { status, retryable: true }
          );
        }
        throw new GitHubSyncError(
          'GitHub yazma icazəsi yoxdur (403). Token üçün "Contents: Read and write" lazımdır.',
          'AUTH',
          { status }
        );
      }

      if (status === 404) {
        throw new GitHubSyncError('GitHub resursu tapılmadı (404).', 'NOT_FOUND', { status });
      }

      if (status === 409 || status === 422) {
        throw new GitHubSyncError(
          'GitHub ref-i dəyişdi (konflikt). Yenidən cəhd olunur.',
          'CONFLICT',
          { status, retryable: true }
        );
      }

      if (status === 429) {
        const rateLimited = this.rateLimitFromHeaders(response.headers);
        throw (
          rateLimited ??
          new GitHubSyncError('GitHub API limiti aşıldı.', 'RATE_LIMIT', {
            status,
            retryable: true,
          })
        );
      }

      if (status >= 500) {
        throw new GitHubSyncError(`GitHub server xətası (HTTP ${status}).`, 'SERVER', {
          status,
          retryable: true,
        });
      }

      throw new GitHubSyncError(`GitHub sorğusu uğursuz oldu (HTTP ${status}).`, 'INVALID_RESPONSE', {
        status,
      });
    } catch (error) {
      if (error instanceof GitHubSyncError) throw error;

      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        throw new GitHubSyncError('GitHub sorğusu vaxtında cavab vermədi.', 'TIMEOUT', {
          retryable: true,
        });
      }

      throw new GitHubSyncError('GitHub-a qoşulmaq mümkün olmadı (şəbəkə xətası).', 'NETWORK', {
        retryable: true,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private async requestJson<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await this.request(method, path, { body });
    try {
      return (await response.json()) as T;
    } catch {
      throw new GitHubSyncError('GitHub cavabı düzgün JSON deyil.', 'INVALID_RESPONSE');
    }
  }

  /** Repository məlumatı — private olub-olmadığını yoxlamaq üçün. */
  async getRepository(): Promise<GitHubRepositoryResponse> {
    return this.requestJson<GitHubRepositoryResponse>('GET', '');
  }

  async assertPrivateRepository(): Promise<GitHubRepositoryResponse> {
    const repository = await this.getRepository();
    if (!repository.private) {
      throw new GitHubSyncError(
        'GITHUB_SITES_REPO publikdir. Sayt məlumatı yalnız private repository-yə yazıla bilər — sinxronizasiya dayandırıldı.',
        'PUBLIC_REPO'
      );
    }
    return repository;
  }

  /** Cari branch-in son commit SHA-sı; boş repository üçün `null`. */
  async getHeadSha(): Promise<string | null> {
    return this.resolveRefSha(this.branch);
  }

  /** Branch adı və ya 40 simvollu commit SHA-sını SHA-ya çevirir. */
  private async resolveRefSha(ref: string): Promise<string | null> {
    if (/^[0-9a-f]{40}$/i.test(ref)) return ref;

    try {
      const response = await this.requestJson<GitHubRefResponse>(
        'GET',
        `/git/ref/heads/${encodeURIComponent(ref)}`
      );
      return response.object?.sha ?? null;
    } catch (error) {
      if (error instanceof GitHubSyncError && (error.code === 'NOT_FOUND' || error.code === 'CONFLICT')) {
        return null; // boş repository
      }
      throw error;
    }
  }

  /**
   * Boş repository-də branch yaradır və ilk commit-in SHA-sını qaytarır.
   *
   * Boş repository-də Git Data API (`/git/trees`, `/git/blobs`, `/git/commits`)
   * 409 "Git Repository is empty." qaytarır. Ona görə ilk commit Contents API
   * ilə yaradılır — bu, branch-i də avtomatik yaradır. Sonrakı bütün yazılar
   * yenə tək commit-li Git Data axını ilə gedir.
   */
  private async createInitialCommit(): Promise<string> {
    const response = await this.requestJson<{ commit?: { sha?: string } }>(
      'PUT',
      '/contents/README.md',
      {
        message: INITIAL_COMMIT_MESSAGE,
        content: Buffer.from(INITIAL_README, 'utf8').toString('base64'),
        branch: this.branch,
      }
    );

    const sha = response?.commit?.sha;
    if (!sha) {
      throw new GitHubSyncError(
        'GitHub boş repository-də ilk commit yaradıla bilmədi.',
        'INVALID_RESPONSE'
      );
    }

    return sha;
  }

  private async createBlob(content: string): Promise<string> {
    const blob = await this.requestJson<{ sha: string }>('POST', '/git/blobs', {
      content: Buffer.from(content, 'utf8').toString('base64'),
      encoding: 'base64',
    });
    return blob.sha;
  }

  /**
   * Faylları tək commit-də yazır. `null` dəyəri faylı silir.
   * Ref konflikti olduqda son commit yenidən oxunur və 3 cəhdə qədər
   * exponential backoff ilə təkrarlanır.
   */
  async commitFiles(
    changes: Map<string, string | null>,
    message: string
  ): Promise<{ sha: string; branch: string; changed: number; previousSha: string | null }> {
    if (changes.size === 0) {
      throw new GitHubSyncError('Yazılacaq fayl yoxdur.', 'INVALID_RESPONSE');
    }

    // Blob-lar məzmuna görə ünvanlandığı üçün onları bir dəfə yaradırıq.
    const entries: Array<Record<string, unknown>> = [];
    for (const [repoPath, content] of changes) {
      const safePath = buildRepoPath(repoPath);
      if (content === null) {
        entries.push({ path: safePath, mode: '100644', type: 'blob', sha: null });
        continue;
      }
      entries.push({
        path: safePath,
        mode: '100644',
        type: 'blob',
        sha: await this.createBlob(content),
      });
    }

    let lastError: GitHubSyncError | null = null;

    for (let attempt = 0; attempt <= this.maxConflictRetries; attempt += 1) {
      try {
        let head = await this.getHeadSha();
        if (!head) head = await this.createInitialCommit();

        const baseCommit = await this.requestJson<GitHubCommitResponse>(
          'GET',
          `/git/commits/${head}`
        );

        const tree = await this.requestJson<GitHubTreeResponse>('POST', '/git/trees', {
          base_tree: baseCommit.tree.sha,
          tree: entries,
        });

        const commit = await this.requestJson<GitHubCommitResponse>('POST', '/git/commits', {
          message,
          tree: tree.sha,
          parents: [head],
        });

        await this.requestJson('PATCH', `/git/refs/heads/${encodeURIComponent(this.branch)}`, {
          sha: commit.sha,
          force: false,
        });

        return {
          sha: commit.sha,
          branch: this.branch,
          changed: changes.size,
          previousSha: head,
        };
      } catch (error) {
        if (!(error instanceof GitHubSyncError)) throw error;
        lastError = error;
        if (!error.retryable || attempt === this.maxConflictRetries) throw error;

        const base = error.code === 'RATE_LIMIT' ? (error.retryAfterMs ?? 1000) : 250 * 2 ** attempt;
        const jitter = Math.floor(this.random() * 100);
        await this.sleep(Math.min(base + jitter, 30_000));
      }
    }

    throw lastError ?? new GitHubSyncError('GitHub commit yaradıla bilmədi.', 'CONFLICT');
  }

  /** Branch-dəki faylın məzmunu; yoxdursa `null`. */
  async readFile(repoPath: string): Promise<string | null> {
    return this.readFileAt(this.branch, repoPath);
  }

  /** Müəyyən ref (branch və ya commit SHA) üzrə fayl məzmunu. */
  async readFileAt(ref: string, repoPath: string): Promise<string | null> {
    const safePath = buildRepoPath(repoPath);
    try {
      const response = await this.request(
        'GET',
        `/contents/${this.encodePath(safePath)}?ref=${encodeURIComponent(ref)}`,
        { raw: true }
      );
      return await response.text();
    } catch (error) {
      if (error instanceof GitHubSyncError && error.code === 'NOT_FOUND') return null;
      throw error;
    }
  }

  /** Qovluq altındakı bütün mətn fayllarını oxuyur (bərpa üçün). */
  async listFiles(dirPath: string): Promise<Map<string, string>> {
    return this.listFilesAt(this.branch, dirPath);
  }

  /** Müəyyən ref (branch və ya commit SHA) üzrə qovluğun mətn faylları. */
  async listFilesAt(ref: string, dirPath: string): Promise<Map<string, string>> {
    const safeDir = buildRepoPath(dirPath);
    const head = await this.resolveRefSha(ref);
    if (!head) return new Map();

    const tree = await this.requestJson<{ tree?: GitHubTreeListEntry[]; truncated?: boolean }>(
      'GET',
      `/git/trees/${head}?recursive=1`
    );

    const entries = (tree.tree ?? []).filter(
      (entry) => entry.type === 'blob' && entry.path.startsWith(`${safeDir}/`)
    );

    if (entries.length > this.maxListedFiles) {
      throw new GitHubSyncError(
        'Qovluqda bərpa üçün icazə veriləndən çox fayl var.',
        'INVALID_RESPONSE'
      );
    }

    const files = new Map<string, string>();
    let totalBytes = 0;

    for (const entry of entries) {
      const blob = await this.requestJson<{ content: string; encoding: string }>(
        'GET',
        `/git/blobs/${entry.sha}`
      );
      const content =
        blob.encoding === 'base64'
          ? Buffer.from(blob.content, 'base64').toString('utf8')
          : blob.content;

      totalBytes += Buffer.byteLength(content, 'utf8');
      if (totalBytes > 10 * 1024 * 1024) {
        throw new GitHubSyncError('Bərpa məlumatı 10 MB limitini aşır.', 'INVALID_RESPONSE');
      }

      files.set(entry.path, content);
    }

    return files;
  }
}
