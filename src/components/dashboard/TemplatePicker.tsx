'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Sparkles, Wand2 } from 'lucide-react';

export interface TemplateOption {
  id: string;
  name: string;
  description?: string;
  version: string;
  preview?: { gradient: string[] };
  requiresGitHub: boolean;
  installable: boolean;
}

interface TemplatePickerProps {
  categoryId: string;
  subcategoryId: string;
  value: string;
  onChange: (templateId: string) => void;
}

/**
 * Seçilmiş kateqoriya/alt kateqoriya üçün şablonları yükləyir.
 * Komponent `key` ilə yenidən qurulduğu üçün yükləmə vəziyyəti təbii sıfırlanır.
 */
export default function TemplatePicker({
  categoryId,
  subcategoryId,
  value,
  onChange,
}: TemplatePickerProps) {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    fetch(
      `/api/templates?category=${encodeURIComponent(categoryId)}&subcategory=${encodeURIComponent(subcategoryId)}`,
      { signal: controller.signal }
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Şablon siyahısı yüklənmədi');
        setTemplates(data.templates || []);
        if (data.meta?.warning) setWarning(data.meta.warning);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setTemplates([]);
        setError(err instanceof Error ? err.message : 'Şablon siyahısı yüklənmədi');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [categoryId, subcategoryId]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Wand2 size={16} color="#00D37D" />
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
          Şablon seçimi
        </h3>
      </div>
      <p style={{ fontSize: 12, color: '#8888A0', margin: '0 0 12px' }}>
        Şablonlar GitHub anbarından yalnız ehtiyac yarandıqda yüklənir. Seçim etməsəniz uyğun standart tema tətbiq olunur.
      </p>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8888A0', fontSize: 13, padding: '12px 0' }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          Şablonlar yüklənir...
        </div>
      )}

      {!loading && (
        <div className="template-grid">
          <button
            type="button"
            className="template-card"
            data-selected={value === ''}
            aria-pressed={value === ''}
            onClick={() => onChange('')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,211,125,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#00D37D" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  Avtomatik seçim
                </p>
                <p style={{ fontSize: 11, color: '#8888A0', margin: 0 }}>
                  Sayt növünə uyğun standart tema
                </p>
              </div>
              {value === '' && <Check size={15} color="#00D37D" />}
            </div>
          </button>

          {templates.map((template) => {
            const selected = template.id === value;
            const gradient = template.preview?.gradient;
            return (
              <button
                key={template.id}
                type="button"
                className="template-card"
                data-selected={selected}
                aria-pressed={selected}
                onClick={() => onChange(template.id)}
                disabled={!template.installable}
              >
                {gradient && (
                  <div
                    className="template-preview"
                    style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
                  />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                      {template.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#8888A0', margin: '2px 0 0' }}>
                      v{template.version}
                      {template.requiresGitHub ? ' · GitHub' : ' · Daxili'}
                    </p>
                  </div>
                  {selected && <Check size={15} color="#00D37D" />}
                </div>
                {template.description && (
                  <p style={{ fontSize: 11, color: '#8888A0', margin: 0, lineHeight: 1.4 }}>
                    {template.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {!loading && templates.length === 0 && !error && (
        <p style={{ fontSize: 12, color: '#8888A0', margin: '10px 0 0' }}>
          Bu sayt növü üçün xüsusi şablon hələ əlavə olunmayıb — standart tema istifadə olunacaq.
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#FBBF24', margin: '10px 0 0' }}>
          {error} Sayt yaradılması davam edə bilər.
        </p>
      )}
      {!error && warning && (
        <p style={{ fontSize: 12, color: '#FBBF24', margin: '10px 0 0' }}>
          {warning}
        </p>
      )}
    </div>
  );
}
