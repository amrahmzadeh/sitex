// BlockForm.tsx — Schema-dan avtomatik form generatoru
'use client';

import { useMemo } from 'react';
import type { BlockSchema, BlockContent, ContentDoc } from '../types';
import type { Locale } from '../types';
import { SUPPORTED_LOCALES } from '../types';
import { mergeWithDefaults } from '../content-utils';
import { FieldEditor } from '../field-editors';

const C = {
  bg: '#121218',
  border: '#383334',
  text: '#E8E8F0',
  muted: '#8888A0',
  accent: '#00D37D',
  error: '#F87171',
  tabActive: 'rgba(0,211,125,0.15)',
};

const LOCALE_LABELS: Record<Locale, string> = { az: 'AZ', en: 'EN', ru: 'RU' };

interface BlockFormProps {
  schema: BlockSchema;
  contentDoc: ContentDoc | undefined;
  locale: Locale;
  orgId: string;
  onLocaleChange: (l: Locale) => void;
  onChange: (fields: BlockContent) => void;
  onVisibilityChange?: (v: boolean) => void;
}

export default function BlockForm({
  schema,
  contentDoc,
  locale,
  orgId,
  onLocaleChange,
  onChange,
  onVisibilityChange,
}: BlockFormProps) {
  // Support both { fields: { ... } } wrapper and flat { ... } content
  const docFields = (contentDoc && typeof contentDoc === 'object' && 'fields' in contentDoc && contentDoc.fields && typeof contentDoc.fields === 'object')
    ? (contentDoc.fields as BlockContent)
    : (contentDoc && typeof contentDoc === 'object' && !('fields' in contentDoc) ? (contentDoc as BlockContent) : undefined);

  const fields = useMemo(
    () => mergeWithDefaults(docFields, schema.fields),
    [docFields, schema.fields]
  );

  const hasI18nFields = schema.fields.some((f) => f.i18n);

  return (
    <div>
      {/* Blok başlığı */}
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>{schema.label}</h3>
        {schema.description && (
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{schema.description}</p>
        )}
      </div>

      {/* Görünürlük toggle */}
      {schema.hasVisibilityToggle && onVisibilityChange && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 13, color: C.muted }}>Bölüm aktiv</span>
          <button
            type="button"
            role="switch"
            aria-checked={contentDoc?.visible !== false}
            onClick={() => onVisibilityChange(contentDoc?.visible === false)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: contentDoc?.visible !== false ? C.accent : C.border,
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, borderRadius: '50%',
              left: contentDoc?.visible !== false ? 22 : 2,
              width: 20, height: 20, background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      )}

      {/* Dil tab-ları */}
      {hasI18nFields && (
        <div
          style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.bg, borderRadius: 10, padding: 4, border: `1px solid ${C.border}` }}
          role="tablist"
          aria-label="Dil seçimi"
        >
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={locale === l}
              onClick={() => onLocaleChange(l)}
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: locale === l ? 700 : 400,
                background: locale === l ? C.tabActive : 'transparent',
                color: locale === l ? C.accent : C.muted,
                transition: 'all 0.15s',
              }}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}

      {/* Alan formaları */}
      <div style={{ display: 'grid', gap: 18 }}>
        {schema.fields.map((fieldSchema) => {
          // showIf şərti
          if (fieldSchema.showIf && !fieldSchema.showIf(fields)) return null;
          return (
            <div key={fieldSchema.key} style={{ display: 'contents' }}>
              {fieldSchema.section && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderLeft: `4px solid ${C.accent}`,
                    borderRadius: '0 8px 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: '0.02em' }}>
                    {fieldSchema.section}
                  </span>
                </div>
              )}
              <FieldEditor
                schema={fieldSchema}
                value={fields[fieldSchema.key]}
                locale={locale}
                orgId={orgId}
                onChange={(val) => {
                  onChange({ ...fields, [fieldSchema.key]: val });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

