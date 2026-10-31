import { createHash } from 'node:crypto';

/**
 * GitHub-a yazılan məlumatın təmizlənməsi.
 *
 * İki qat müdafiə:
 *  1. Payload qurucusu (payload.ts) verilənlər bazasından YALNIZ sayt
 *     məlumatını oxuyur — istifadəçi qeydi heç vaxt sorğuya düşmür.
 *  2. Bu modul hər dəyəri yenidən yoxlayır: parol, token, API açarı və şəxsi
 *     məlumat (owner e-poçtu/telefonu) adlı açarlar tamamilə atılır.
 *
 * Saytın öz açıq əlaqə məlumatı `publicEmail` / `publicPhone` adları ilə
 * saxlanılır — bu sahələr onsuz da dərc olunmuş saytda görünür.
 */

export interface SanitizeLimits {
  maxDepth: number;
  maxStringLength: number;
  maxArrayLength: number;
  maxObjectKeys: number;
}

export const DEFAULT_SANITIZE_LIMITS: SanitizeLimits = {
  maxDepth: 8,
  maxStringLength: 4000,
  maxArrayLength: 300,
  maxObjectKeys: 250,
};

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Dəqiq adla bloklanan açarlar (normallaşdırılmış formada). */
const DENIED_KEYS = new Set([
  'password',
  'passwordhash',
  'hashedpassword',
  'passphrase',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'sessiontoken',
  'bearertoken',
  'secret',
  'clientsecret',
  'apisecret',
  'apikey',
  'privatekey',
  'signingkey',
  'encryptionkey',
  'webhooksecret',
  'authorization',
  'cookie',
  'setcookie',
  'sessionid',
  'email',
  'emailaddress',
  'phone',
  'phonenumber',
  'contactnumber',
  'owneremail',
  'ownerphone',
  'ownerip',
  'ipaddress',
  'billingemail',
  'billingaddress',
  'cardnumber',
  'cardexpiry',
  'cvv',
  'cvc',
  'iban',
  'bankaccount',
  'passwordresettoken',
  'emailverificationtoken',
  'credential',
  'credentials',
]);

/** Adı bu şəkilçilərlə bitən açarlar da atılır (məs. `nextAuthSecret`). */
const DENIED_SUFFIXES = ['password', 'token', 'secret', 'apikey', 'privatekey', 'credential'];

export function isDeniedKey(key: string): boolean {
  const normalized = normalizeKey(key);
  if (!normalized) return false;
  if (DENIED_KEYS.has(normalized)) return true;
  return DENIED_SUFFIXES.some((suffix) => normalized.length > suffix.length && normalized.endsWith(suffix));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cleanString(value: string, limits: SanitizeLimits): string | null {
  // Nəzarət simvolları (NUL daxil) JSON-da saxlanıla bilməz.
  const cleaned = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (!cleaned) return null;
  return cleaned.length > limits.maxStringLength ? cleaned.slice(0, limits.maxStringLength) : cleaned;
}

function sanitizeValue(
  value: unknown,
  depth: number,
  limits: SanitizeLimits
): unknown {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') return cleanString(value, limits);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();

  if (depth >= limits.maxDepth) return null;

  if (Array.isArray(value)) {
    const output: unknown[] = [];
    for (const item of value.slice(0, limits.maxArrayLength)) {
      const cleaned = sanitizeValue(item, depth + 1, limits);
      if (cleaned !== null && cleaned !== undefined) output.push(cleaned);
    }
    return output;
  }

  if (isPlainObject(value)) {
    const output: Record<string, unknown> = {};
    const entries = Object.entries(value).slice(0, limits.maxObjectKeys);

    for (const [key, nested] of entries) {
      if (!key || isDeniedKey(key)) continue;
      const cleaned = sanitizeValue(nested, depth + 1, limits);
      if (cleaned === null || cleaned === undefined) continue;
      output[key] = cleaned;
    }

    return output;
  }

  // Funksiya, symbol, BigInt, Buffer, class instansiyası — yazılmır.
  return null;
}

/**
 * Obyekti GitHub-a yazıla bilən sadə JSON formasına gətirir.
 * Gizli açarlar, istifadəçi e-poçtu/telefonu və naməlum tiplər atılır.
 */
export function sanitizeForSync<T = unknown>(
  input: T,
  limits: SanitizeLimits = DEFAULT_SANITIZE_LIMITS
): unknown {
  return sanitizeValue(input, 0, limits);
}

/**
 * Fayl xəritəsinin stabil SHA-256 hash-i.
 * Sıra vacib deyil — açarlar əlifba sırası ilə hesablanır.
 * CHANGELOG.md hash-ə daxil edilmir (hər sync-də dəyişir).
 */
export function hashSyncFiles(files: Map<string, string> | Record<string, string>): string {
  const entries =
    files instanceof Map ? Array.from(files.entries()) : Object.entries(files);

  const sorted = entries
    .filter(([path]) => path !== 'CHANGELOG.md' && !path.endsWith('/CHANGELOG.md'))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const hash = createHash('sha256');
  for (const [path, content] of sorted) {
    hash.update(path, 'utf8');
    hash.update('\0', 'utf8');
    hash.update(content, 'utf8');
    hash.update('\0', 'utf8');
  }

  return hash.digest('hex');
}
