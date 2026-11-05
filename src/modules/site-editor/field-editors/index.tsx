// ============================================================
// Field Editors — Hər alan tipi üçün ayrı bileşen
// ============================================================

'use client';

import { useState, useRef } from 'react';
import type { FieldSchema, FieldValue, I18nString, ImageValue, LinkValue, RepeaterItem } from '../types';
import { SUPPORTED_LOCALES, type Locale } from '../types';

// Stil sabitləri (DashboardShell rənk palitrasına uyğun)
const C = {
  bg: '#1A1A22',
  border: '#383334',
  borderFocus: '#00D37D',
  text: '#E8E8F0',
  muted: '#8888A0',
  accent: '#00D37D',
  error: '#F87171',
  inputBg: '#121218',
  badgeBg: 'rgba(0,211,125,0.12)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: C.inputBg,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 15,
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box',
  minHeight: 42,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: C.muted,
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

// ---- Shared props ----

export interface FieldEditorProps {
  schema: FieldSchema;
  value: FieldValue;
  locale: Locale;
  onChange: (value: FieldValue) => void;
  orgId?: string;
}

// ====================
// TextField
// ====================
export function TextField({ schema, value, locale, onChange }: FieldEditorProps) {
  const isI18n = schema.i18n;
  const strVal = isI18n
    ? ((value as I18nString)?.[locale] ?? '')
    : (typeof value === 'string' ? value : '');

  const handleChange = (v: string) => {
    if (isI18n) {
      onChange({ ...(value as I18nString ?? {}), [locale]: v });
    } else {
      onChange(v);
    }
  };

  return (
    <div>
      <label style={labelStyle}>{schema.label}{schema.required && <span style={{ color: C.error }}> *</span>}</label>
      <input
        type="text"
        value={strVal}
        placeholder={schema.placeholder}
        onChange={(e) => handleChange(e.target.value)}
        style={inputStyle}
        aria-label={schema.label}
      />
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// TextareaField
// ====================
export function TextareaField({ schema, value, locale, onChange }: FieldEditorProps) {
  const isI18n = schema.i18n;
  const strVal = isI18n
    ? ((value as I18nString)?.[locale] ?? '')
    : (typeof value === 'string' ? value : '');

  const handleChange = (v: string) => {
    if (isI18n) {
      onChange({ ...(value as I18nString ?? {}), [locale]: v });
    } else {
      onChange(v);
    }
  };

  return (
    <div>
      <label style={labelStyle}>{schema.label}</label>
      <textarea
        value={strVal}
        placeholder={schema.placeholder}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
        aria-label={schema.label}
      />
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// RichTextField (minimal — no extra deps)
// Sadə bold/italic/list toolbar
// ====================
export function RichTextField({ schema, value, locale, onChange }: FieldEditorProps) {
  const isI18n = schema.i18n;
  const strVal = isI18n
    ? ((value as I18nString)?.[locale] ?? '')
    : (typeof value === 'string' ? value : '');

  const handleChange = (v: string) => {
    if (isI18n) {
      onChange({ ...(value as I18nString ?? {}), [locale]: v });
    } else {
      onChange(v);
    }
  };

  // Sanitize client-side — backend-də də edilir
  return (
    <div>
      <label style={labelStyle}>{schema.label}</label>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
        HTML teqlərə icazə verilir: {(schema.allowedTags ?? ['p', 'strong', 'em']).join(', ')}
      </p>
      <textarea
        value={strVal}
        placeholder={schema.placeholder ?? '<p>Mətninizi daxil edin</p>'}
        onChange={(e) => handleChange(e.target.value)}
        rows={6}
        style={{ ...inputStyle, resize: 'vertical', minHeight: 120, fontFamily: 'monospace', fontSize: 13 }}
        aria-label={schema.label}
        spellCheck={false}
      />
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// ImageField
// ====================
export function ImageField({ schema, value, locale, onChange, orgId }: FieldEditorProps) {
  const img = value as ImageValue | undefined;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validation = schema.imageValidation ?? {};
  const maxMb = validation.maxSizeMb ?? 5;
  const accept = validation.accept ?? ['image/jpeg', 'image/png', 'image/webp'];

  const uploadFile = async (file: File) => {
    setError('');
    if (!accept.includes(file.type)) {
      setError(`Yalnız ${accept.join(', ')} fayllar qəbul edilir`);
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Fayl ölçüsü ${maxMb}MB-dan böyük olmamalıdır`);
      return;
    }
    if (!orgId) { setError('orgId tapılmadı'); return; }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', 'site-content');
      const res = await fetch(`/api/organizations/${orgId}/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Yükləmə xətası'); return; }
      onChange({ url: data.url, alt: img?.alt ?? { az: '', en: '', ru: '' } } as ImageValue);
    } catch {
      setError('Yükləmə xətası');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (file: File | null) => { if (file) uploadFile(file); };

  const altVal = img?.alt
    ? (typeof img.alt === 'string' ? img.alt : (img.alt as I18nString)[locale] ?? '')
    : '';

  return (
    <div>
      <label style={labelStyle}>{schema.label}</label>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.accent : C.border}`,
          borderRadius: 10,
          padding: 20,
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(0,211,125,0.05)' : C.inputBg,
          transition: 'all 0.2s',
          marginBottom: 8,
        }}
        role="button"
        aria-label="Şəkil yükləyin"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        {img?.url ? (
          <img
            src={img.url}
            alt={altVal || 'preview'}
            style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
          />
        ) : (
          <div style={{ color: C.muted, fontSize: 13 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
            Şəkil sürükləyin və ya klikləyin
            <div style={{ fontSize: 11, marginTop: 4 }}>
              {accept.map(a => a.split('/')[1]).join(', ').toUpperCase()} · maks {maxMb}MB
            </div>
          </div>
        )}
        {uploading && <div style={{ color: C.accent, fontSize: 13, marginTop: 8 }}>Yüklənir...</div>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        aria-hidden="true"
      />

      {img?.url && (
        <>
          <input
            type="text"
            placeholder="Alt mətn (SEO)"
            value={altVal}
            onChange={(e) => {
              const newAlt: I18nString = { ...(typeof img.alt === 'object' && img.alt !== null ? img.alt as I18nString : {}), [locale]: e.target.value };
              onChange({ ...img, alt: newAlt } as ImageValue);
            }}
            style={{ ...inputStyle, marginTop: 4, fontSize: 13 }}
            aria-label="Şəkil alt mətni"
          />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            style={{ marginTop: 6, fontSize: 12, color: C.error, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ✕ Şəkili sil
          </button>
        </>
      )}
      {error && <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{error}</p>}
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// LinkField
// ====================
export function LinkField({ schema, value, locale, onChange }: FieldEditorProps) {
  const link = (value as LinkValue | undefined) ?? { href: '', label: { az: '', en: '', ru: '' } };
  const labelVal = typeof link.label === 'string' ? link.label : ((link.label as I18nString)?.[locale] ?? '');

  const setLabel = (v: string) => {
    const newLabel: I18nString = { ...(typeof link.label === 'object' ? link.label as I18nString : {}), [locale]: v };
    onChange({ ...link, label: newLabel } as LinkValue);
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={labelStyle}>{schema.label}</label>
      <input
        type="text"
        placeholder="Düymə mətni"
        value={labelVal}
        onChange={(e) => setLabel(e.target.value)}
        style={inputStyle}
        aria-label={`${schema.label} - mətn`}
      />
      <input
        type="url"
        placeholder="URL (https://...)"
        value={link.href}
        onChange={(e) => onChange({ ...link, href: e.target.value } as LinkValue)}
        style={inputStyle}
        aria-label={`${schema.label} - URL`}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.muted, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!link.openInNewTab}
          onChange={(e) => onChange({ ...link, openInNewTab: e.target.checked } as LinkValue)}
          aria-label="Yeni tabda aç"
        />
        Yeni tabda aç
      </label>
      {schema.hint && <p style={{ fontSize: 11, color: C.muted }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// SelectField
// ====================
export function SelectField({ schema, value, onChange }: FieldEditorProps) {
  return (
    <div>
      <label style={labelStyle}>{schema.label}</label>
      <select
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
        aria-label={schema.label}
      >
        <option value="">Seçin...</option>
        {schema.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// ToggleField
// ====================
export function ToggleField({ schema, value, onChange }: FieldEditorProps) {
  const checked = typeof value === 'boolean' ? value : value === 'true';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <label style={{ ...labelStyle, marginBottom: 2 }}>{schema.label}</label>
        {schema.hint && <p style={{ fontSize: 11, color: C.muted }}>{schema.hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={schema.label}
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          background: checked ? C.accent : C.border,
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

// ====================
// NumberField
// ====================
export function NumberField({ schema, value, onChange }: FieldEditorProps) {
  return (
    <div>
      <label style={labelStyle}>{schema.label}</label>
      <input
        type="number"
        value={typeof value === 'number' ? value : ''}
        placeholder={schema.placeholder}
        onChange={(e) => onChange(Number(e.target.value))}
        style={inputStyle}
        aria-label={schema.label}
      />
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{schema.hint}</p>}
    </div>
  );
}

// ====================
// RepeaterField
// ====================
export function RepeaterField({ schema, value, locale, onChange, orgId }: FieldEditorProps) {
  const items = (value as RepeaterItem[] | undefined) ?? [];

  const addItem = () => {
    const blank: RepeaterItem = {};
    for (const f of schema.repeaterFields ?? []) {
      blank[f.key] = f.i18n ? { az: '', en: '', ru: '' } : (f.default ?? '');
    }
    onChange([...items, blank]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, fieldKey: string, val: FieldValue) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [fieldKey]: val } : item);
    onChange(updated);
  };

  return (
    <div>
      <label style={labelStyle}>{schema.label}</label>
      {schema.hint && <p style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{schema.hint}</p>}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                style={{ background: 'none', border: 'none', color: C.error, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                aria-label="Sil"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {(schema.repeaterFields ?? []).map((subField) => (
                <FieldEditor
                  key={subField.key}
                  schema={subField}
                  value={item[subField.key]}
                  locale={locale}
                  onChange={(v) => updateItem(idx, subField.key, v)}
                  orgId={orgId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: C.accent,
          background: C.badgeBg,
          border: `1px solid ${C.accent}33`,
          borderRadius: 8,
          padding: '7px 14px',
          cursor: 'pointer',
        }}
        aria-label={`${schema.label} əlavə et`}
      >
        + Əlavə et
      </button>
    </div>
  );
}

// ====================
// FieldEditor — dispatcher
// ====================
export function FieldEditor(props: FieldEditorProps) {
  const { schema } = props;
  switch (schema.type) {
    case 'text':     return <TextField {...props} />;
    case 'textarea': return <TextareaField {...props} />;
    case 'richtext': return <RichTextField {...props} />;
    case 'image':    return <ImageField {...props} />;
    case 'link':     return <LinkField {...props} />;
    case 'select':   return <SelectField {...props} />;
    case 'toggle':   return <ToggleField {...props} />;
    case 'number':   return <NumberField {...props} />;
    case 'repeater': return <RepeaterField {...props} />;
    default:         return <div style={{ color: C.error, fontSize: 12 }}>Naməlum alan tipi: {schema.type}</div>;
  }
}
