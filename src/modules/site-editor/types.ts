// ============================================================
// Site Editor — Core Types
// Bu fayl dəyişdirilməməlidir; genişləndirmək üçün block-registry.ts istifadə edin.
// ============================================================

export type Locale = 'az' | 'en' | 'ru';
export const SUPPORTED_LOCALES: Locale[] = ['az', 'en', 'ru'];

/** Çox dilli sətir */
export type I18nString = { [K in Locale]?: string };

/** Görüntü dəyəri */
export interface ImageValue {
  url: string;
  alt?: I18nString | string;
  width?: number;
  height?: number;
}

/** Keçid dəyəri */
export interface LinkValue {
  label?: I18nString | string;
  href: string;
  openInNewTab?: boolean;
}

/** Repeater elementi (açıq tip, schema-driven) */
export type RepeaterItem = Record<string, FieldValue>;

/** İstənilən alan dəyəri */
export type FieldValue =
  | string
  | I18nString
  | boolean
  | number
  | ImageValue
  | LinkValue
  | RepeaterItem[]
  | null
  | undefined;

// ---- Alan tipi ----

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'link'
  | 'select'
  | 'toggle'
  | 'number'
  | 'repeater';

/** Bir alan tanımı */
export interface FieldSchema {
  key: string;
  type: FieldType;
  label: string;
  /** true → {az, en, ru} yapısında saxlanır */
  i18n?: boolean;
  required?: boolean;
  default?: FieldValue;
  placeholder?: string;
  /** select tipi üçün */
  options?: { value: string; label: string }[];
  /** richtext üçün allowed tags */
  allowedTags?: string[];
  /** image üçün validasyon */
  imageValidation?: {
    maxSizeMb?: number;
    accept?: string[];
    maxWidth?: number;
    maxHeight?: number;
  };
  /** repeater üçün alt-alanlar */
  repeaterFields?: FieldSchema[];
  /** Blok daxilindəki görünürlük şərti */
  showIf?: (fields: BlockContent) => boolean;
  hint?: string;
  /** Form daxilində bölmə ayırıcı başlığı */
  section?: string;
}

/** Bir blok tanımı */
export interface BlockSchema {
  /** Unikal açar, nöqtəli: "hero.main" */
  key: string;
  /** Sayfa açarı: "hero" | "about" | "contact" | "menu" | "gallery" | "reservation" */
  pageKey: string;
  label: string;
  description?: string;
  icon?: string;
  fields: FieldSchema[];
  /** Bu blok görünürlük toggle-a sahibdirmi? */
  hasVisibilityToggle?: boolean;
  /** Bu blok sırala destekləyirmi? */
  hasSortOrder?: boolean;
}

// ---- Content strukturu ----

export type BlockContent = Record<string, FieldValue>;

/** Bir blok üçün DB-dəki content */
export interface ContentDoc {
  fields: BlockContent;
  visible?: boolean;
  sortOrder?: number;
  version?: number;
}

/** Bütün saytın content map-i: pageKey → blockKey → ContentDoc */
export type SiteContentMap = Record<string, Record<string, ContentDoc>>;

// ---- API tipi ----

export interface SiteContentPayload {
  pageKey: string;
  blockKey: string;
  content: ContentDoc;
}

// ---- History ----

export interface ContentHistoryEntry {
  id: string;
  version: number;
  content: ContentDoc;
  createdAt: string;
  createdBy?: string;
}

