// ============================================================
// Content Utilities — i18n resolve, default fallback
// ============================================================

import type { Locale, I18nString, FieldValue, BlockContent, ContentDoc, FieldSchema } from './types';
import { SUPPORTED_LOCALES } from './types';

/** i18n sətirini locale-ə görə resolve edir. Eksikdə az-a düşür */
export function t(
  value: FieldValue | undefined,
  locale: Locale = 'az'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (isI18nString(value)) {
    return value[locale] ?? value['az'] ?? value['en'] ?? value['ru'] ?? '';
  }
  return '';
}

export function isI18nString(val: unknown): val is I18nString {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return false;
  return SUPPORTED_LOCALES.some((l) => l in val);
}

/** Schema default dəyərlərindən boş content yaradır */
export function buildDefaultContent(fields: FieldSchema[]): BlockContent {
  const content: BlockContent = {};
  for (const field of fields) {
    if (field.default !== undefined) {
      content[field.key] = field.default;
    } else if (field.i18n) {
      content[field.key] = { az: '', en: '', ru: '' };
    } else if (field.type === 'toggle') {
      content[field.key] = true;
    } else if (field.type === 'repeater') {
      content[field.key] = [];
    } else {
      content[field.key] = '';
    }
  }
  return content;
}

/** DB content ile schema default-larını birləşdirir (eksik alanlar default ile doldurulur) */
export function mergeWithDefaults(
  dbContent: BlockContent | undefined,
  fields: FieldSchema[]
): BlockContent {
  const defaults = buildDefaultContent(fields);
  if (!dbContent || typeof dbContent !== 'object' || Array.isArray(dbContent)) return defaults;
  const merged: BlockContent = { ...defaults };
  for (const [k, v] of Object.entries(dbContent)) {
    if (v !== undefined && v !== null && v !== '') {
      merged[k] = v;
    }
  }
  return merged;
}

/** Boş string-leri trim edir, i18n obyeləri normalize edir */
export function normalizeContent(
  content: BlockContent,
  fields: FieldSchema[]
): BlockContent {
  const result: BlockContent = { ...content };
  for (const field of fields) {
    const val = result[field.key];
    if (field.i18n && isI18nString(val)) {
      const normalized: I18nString = {};
      for (const locale of SUPPORTED_LOCALES) {
        const lv = (val as I18nString)[locale];
        normalized[locale] = typeof lv === 'string' ? lv.trim() : '';
      }
      result[field.key] = normalized;
    } else if (typeof val === 'string') {
      result[field.key] = val.trim();
    }
  }
  return result;
}

/** ContentDoc boşdursa (fields yoxdursa) yeni hesab edir */
export function isEmptyContent(doc: ContentDoc | undefined): boolean {
  if (!doc) return true;
  const fields = doc.fields;
  if (!fields || typeof fields !== 'object') return true;
  return Object.keys(fields).length === 0;
}

