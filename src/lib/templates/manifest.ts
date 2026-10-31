import { z } from 'zod';
import rawManifest from '@/config/templates/manifest.json';
import { isValidSiteType } from '@/config/site-categories';
import { defaultThemes } from '@/lib/themes';

/**
 * Şablon manifesti — kateqoriya ID-ləri, versiya və GitHub mənbəyi burada
 * müəyyən edilir. Şablon faylları bu layihədə saxlanılmır; yalnız metadata
 * və istifadə olunacaq daxili tema göstəricisi saxlanılır.
 */

const SAFE_PATH = /^[A-Za-z0-9._/-]+$/;

function isSafeRelativePath(value: string): boolean {
  if (!value || value.startsWith('/') || value.startsWith('.') || value.includes('\\')) return false;
  return !value.split('/').some((part) => part === '' || part === '.' || part === '..');
}

export const templateSourceSchema = z.object({
  repository: z
    .string()
    .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, 'Repository "OWNER/REPO" formatında olmalıdır')
    .optional(),
  ref: z.string().min(1).max(120).optional(),
  path: z
    .string()
    .min(1)
    .max(200)
    .regex(SAFE_PATH, 'Şablon yolu yalnız hərf, rəqəm, nöqtə, alt xətt və slashdan ibarət olmalıdır')
    .refine(isSafeRelativePath, 'Şablon yolu təhlükəsiz relative yol olmalıdır'),
});

export const templateDefinitionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/, 'Şablon ID-si aşağı hərflərlə olmalıdır'),
    name: z.string().min(2).max(80),
    description: z.string().max(300).optional(),
    category: z.string().min(1).max(80),
    subcategory: z.string().min(1).max(80),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versiya semver formatında olmalıdır'),
    themePreset: z.string().optional(),
    preview: z.object({ gradient: z.array(z.string()).length(2) }).optional(),
    source: templateSourceSchema.optional(),
  })
  .superRefine((template, ctx) => {
    if (!isValidSiteType(template.category, template.subcategory)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subcategory'],
        message: `"${template.subcategory}" alt kateqoriyası "${template.category}" kateqoriyasına aid deyil`,
      });
    }
    if (template.themePreset && !defaultThemes[template.themePreset]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['themePreset'],
        message: `"${template.themePreset}" daxili teması mövcud deyil`,
      });
    }
    if (!template.themePreset && !template.source) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['source'],
        message: 'Şablon üçün ya daxili tema, ya da GitHub mənbəyi tələb olunur',
      });
    }
  });

const manifestDefaultsSchema = z.object({
  repository: z.string().max(140).default(''),
  ref: z.string().min(1).max(120).default('v1.0.0'),
  manifestPath: z
    .string()
    .max(200)
    .default('manifest.json')
    .refine(isSafeRelativePath, 'Manifest yolu təhlükəsiz olmalıdır'),
});

export const templateManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    defaults: manifestDefaultsSchema,
    templates: z.array(templateDefinitionSchema).min(1),
  })
  .superRefine((manifest, ctx) => {
    const seen = new Set<string>();
    manifest.templates.forEach((template, index) => {
      if (seen.has(template.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['templates', index, 'id'],
          message: `Təkrarlanan şablon ID-si: ${template.id}`,
        });
      }
      seen.add(template.id);
    });
  });

export type TemplateSource = z.infer<typeof templateSourceSchema>;
export type TemplateDefinition = z.infer<typeof templateDefinitionSchema>;
export type TemplateManifest = z.infer<typeof templateManifestSchema>;
export type ManifestDefaults = z.infer<typeof manifestDefaultsSchema>;

export interface PublicTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory: string;
  version: string;
  preview?: { gradient: string[] };
  /** GitHub mənbəyi konfiqurasiya olunmayıbsa daxili tema ilə quraşdırılır */
  requiresGitHub: boolean;
  installable: boolean;
}

export class TemplateManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateManifestError';
  }
}

let cachedLocalManifest: TemplateManifest | null = null;

function formatZodError(error: z.ZodError): string {
  return error.errors
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || 'manifest'}: ${issue.message}`)
    .join('; ');
}

/** JSON manifestini validasiya edir. Xəta halında oxunaqlı mesaj qaytarır. */
export function parseTemplateManifest(input: unknown): TemplateManifest {
  const result = templateManifestSchema.safeParse(input);
  if (!result.success) {
    throw new TemplateManifestError(`Şablon manifesti etibarsızdır — ${formatZodError(result.error)}`);
  }
  return result.data;
}

export function getLocalManifest(): TemplateManifest {
  if (!cachedLocalManifest) {
    cachedLocalManifest = parseTemplateManifest(rawManifest);
  }
  return cachedLocalManifest;
}

export function listTemplates(): TemplateDefinition[] {
  return getLocalManifest().templates;
}

export function getTemplateById(templateId?: string | null): TemplateDefinition | undefined {
  if (!templateId) return undefined;
  return listTemplates().find((template) => template.id === templateId);
}

/** Kateqoriya (və istəyə bağlı alt kateqoriya) üzrə uyğun şablonlar. */
export function getTemplatesForSiteType(
  categoryId?: string | null,
  subcategoryId?: string | null
): TemplateDefinition[] {
  return listTemplates().filter((template) => {
    if (categoryId && template.category !== categoryId) return false;
    if (subcategoryId && template.subcategory !== subcategoryId) return false;
    return true;
  });
}

/** Bu şablon üçün istifadə olunacaq GitHub repository-si (env prioritetlidir). */
export function getConfiguredRepository(template?: TemplateDefinition): string | null {
  const envRepo = process.env.GITHUB_TEMPLATE_REPO?.trim();
  if (envRepo) return envRepo;
  const templateRepo = template?.source?.repository?.trim();
  if (templateRepo) return templateRepo;
  const manifestRepo = getLocalManifest().defaults.repository?.trim();
  return manifestRepo || null;
}

/** Sabit versiya: env ilə bütün şablonları pin etmək mümkündür. */
export function getConfiguredRef(template?: TemplateDefinition): string {
  const envRef = process.env.GITHUB_TEMPLATE_REF?.trim();
  if (envRef) return envRef;
  return template?.source?.ref || getLocalManifest().defaults.ref;
}

export function resolveTemplateSource(
  template: TemplateDefinition
): { repository: string; ref: string; path: string } | null {
  if (!template.source) return null;
  const repository = getConfiguredRepository(template);
  if (!repository) return null;
  return {
    repository,
    ref: getConfiguredRef(template),
    path: template.source.path,
  };
}

export function isTemplateInstallable(template: TemplateDefinition): boolean {
  return Boolean(template.themePreset || resolveTemplateSource(template));
}

/** Frontend-ə yalnız təhlükəsiz metadata göndərilir — repository/token yoxdur. */
export function toPublicTemplate(template: TemplateDefinition): PublicTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    subcategory: template.subcategory,
    version: template.version,
    preview: template.preview,
    requiresGitHub: !template.themePreset,
    installable: isTemplateInstallable(template),
  };
}
