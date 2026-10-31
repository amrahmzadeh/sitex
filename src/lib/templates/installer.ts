import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { defaultThemes, type ThemeConfig } from '@/lib/themes';
import { downloadTemplateFiles, getTemplateDefinition, TemplateSourceError } from './github';
import type { TemplateDefinition } from './manifest';

/**
 * Şablonun temanı sayta tətbiq edən hissəsi.
 *
 * GitHub-dan gələn fayllar yalnız müvəqqəti qovluqda açılır, `template.json`
 * oxunur və qovluq hər halda silinir. Sayt üçün heç bir şablon faylı daimi
 * olaraq diskdə saxlanılmır — yalnız validasiya olunmuş tema konfiqurasiyası
 * verilənlər bazasına yazılır.
 */

const PACKAGE_CONFIG_FILE = 'template.json';
const BLOCKED_VALUE_PATTERN = /<|>|javascript:|data:|onerror|onload|expression\s*\(/i;
const THEME_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9]{0,40}$/;

const packageThemeValueSchema = z.union([
  z.string().max(300),
  z.number().finite(),
  z.boolean(),
]);

const templatePackageSchema = z
  .object({
    id: z.string().max(80).optional(),
    name: z.string().max(80).optional(),
    version: z.string().max(30).optional(),
    theme: z.record(packageThemeValueSchema).optional(),
  })
  .passthrough();

export type TemplateSourceKind = 'github' | 'builtin';

export interface ResolvedTemplate {
  templateId: string;
  name: string;
  version: string;
  category: string;
  subcategory: string;
  source: TemplateSourceKind;
  theme: ThemeConfig;
  fileCount: number;
  /** GitHub əlçatmaz olduqda istifadəçiyə göstərilən xəbərdarlıq */
  warning?: string;
}

export class TemplateUnavailableError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = 'TemplateUnavailableError';
    this.status = status;
  }
}

function cloneTheme(theme: ThemeConfig): ThemeConfig {
  return JSON.parse(JSON.stringify(theme)) as ThemeConfig;
}

/**
 * `template.json` içindəki tema dəyərlərini təmizləyir: yalnız sadə açar və
 * skalyar dəyərlər qəbul edilir, HTML/script/data URL-lər atılır.
 */
export function sanitizeThemeOverrides(
  input: Record<string, unknown>
): Partial<ThemeConfig> {
  const sanitized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!THEME_KEY_PATTERN.test(key)) continue;

    if (typeof value === 'string') {
      if (!value || value.length > 300 || BLOCKED_VALUE_PATTERN.test(value)) continue;
      if ((/url$/i.test(key) || /image$/i.test(key)) && !/^(https?:\/\/|\/)/i.test(value)) continue;
      sanitized[key] = value;
    } else if (typeof value === 'number') {
      if (!Number.isFinite(value)) continue;
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    }
  }

  return sanitized as Partial<ThemeConfig>;
}

async function readPackageTheme(files: Map<string, Buffer>): Promise<Partial<ThemeConfig> | null> {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'sitex-template-'));

  try {
    const rootWithSeparator = tempRoot + path.sep;

    for (const [relativePath, data] of files) {
      const target = path.resolve(tempRoot, relativePath);
      if (!target.startsWith(rootWithSeparator)) {
        throw new TemplateUnavailableError(
          'Şablon fayl yolu təhlükəsizlik yoxlamasından keçmədi.',
          422
        );
      }
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, data);
    }

    let raw: string;
    try {
      raw = await readFile(path.resolve(tempRoot, PACKAGE_CONFIG_FILE), 'utf8');
    } catch {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new TemplateUnavailableError('Şablonun template.json faylı düzgün JSON deyil.', 422);
    }

    const result = templatePackageSchema.safeParse(parsed);
    if (!result.success) {
      throw new TemplateUnavailableError('Şablonun template.json faylı etibarsızdır.', 422);
    }

    return result.data.theme ? sanitizeThemeOverrides(result.data.theme) : null;
  } finally {
    await rm(tempRoot, { recursive: true, force: true }).catch(() => {});
  }
}

function buildBuiltinTheme(template: TemplateDefinition): ThemeConfig {
  const preset =
    (template.themePreset && defaultThemes[template.themePreset]) || defaultThemes.elegant;
  return cloneTheme(preset);
}

/**
 * Şablonu həll edir: GitHub mənbəyi konfiqurasiya olunubsa oradan endirir,
 * olmadıqda və ya xəta baş verdikdə daxili tema presetinə düşür.
 */
export async function resolveTemplateTheme(templateId: string): Promise<ResolvedTemplate> {
  const template = await getTemplateDefinition(templateId);
  if (!template) {
    throw new TemplateUnavailableError('Şablon tapılmadı.', 404);
  }

  const builtinTheme = buildBuiltinTheme(template);

  if (!template.source) {
    return {
      templateId: template.id,
      name: template.name,
      version: template.version,
      category: template.category,
      subcategory: template.subcategory,
      source: 'builtin',
      theme: builtinTheme,
      fileCount: 0,
    };
  }

  try {
    const downloaded = await downloadTemplateFiles(template);
    const overrides = await readPackageTheme(downloaded.files);

    const theme: ThemeConfig = {
      ...builtinTheme,
      ...(overrides || {}),
      id: builtinTheme.id,
      name: builtinTheme.name,
      templateId: builtinTheme.templateId,
    };

    return {
      templateId: template.id,
      name: template.name,
      version: template.version,
      category: template.category,
      subcategory: template.subcategory,
      source: 'github',
      theme,
      fileCount: downloaded.files.size,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Şablon mənbəyi əlçatan deyil.';

    if (!template.themePreset) {
      throw new TemplateUnavailableError(message, error instanceof TemplateSourceError ? error.status : 502);
    }

    return {
      templateId: template.id,
      name: template.name,
      version: template.version,
      category: template.category,
      subcategory: template.subcategory,
      source: 'builtin',
      theme: builtinTheme,
      fileCount: 0,
      warning: `Şablon GitHub-dan götürülə bilmədi: ${message} Daxili tema tətbiq olundu.`,
    };
  }
}
