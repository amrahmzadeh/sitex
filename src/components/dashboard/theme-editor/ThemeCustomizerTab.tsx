'use client';

import React, { useState, useRef } from 'react';
import {
  Loader2, Check, Save, Globe, Palette, Layers,
  MessageCircle, Share2, Sparkles, Utensils, BookOpen, Clock, FileText,
  Upload, X, Image as ImageIcon
} from 'lucide-react';
import { ThemeConfig, defaultThemes, BRAND_FONTS } from '@/lib/themes';

const FONTS = ['Inter', 'Playfair Display', 'Outfit', 'Merriweather', 'Source Sans 3', 'Lora', 'Raleway', 'Poppins'];

function BgControlItem({
  title,
  subtitle,
  type,
  solidColor,
  fromColor,
  toColor,
  direction,
  fallbackSolid,
  fallbackFrom,
  fallbackTo,
  onChangeType,
  onChangeSolid,
  onChangeFrom,
  onChangeTo,
  onChangeDir,
}: {
  title: string;
  subtitle: string;
  type?: 'solid' | 'gradient';
  solidColor?: string;
  fromColor?: string;
  toColor?: string;
  direction?: string;
  fallbackSolid: string;
  fallbackFrom: string;
  fallbackTo: string;
  onChangeType: (type: 'solid' | 'gradient') => void;
  onChangeSolid: (c: string) => void;
  onChangeFrom: (c: string) => void;
  onChangeTo: (c: string) => void;
  onChangeDir: (d: string) => void;
}) {
  const currentType = type || 'solid';
  const currentSolid = solidColor || fallbackSolid;
  const currentFrom = fromColor || fallbackFrom;
  const currentTo = toColor || fallbackTo;
  const currentDir = direction || '135deg';

  const previewStyle = currentType === 'gradient'
    ? `linear-gradient(${currentDir}, ${currentFrom}, ${currentTo})`
    : currentSolid;

  const sanitizeColor = (c: string) => {
    if (c.startsWith('#')) {
      return c.slice(0, 7);
    }
    return '#1A1A2E';
  };

  return (
    <div style={{
      padding: 14,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid #2A2A3A',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', display: 'block' }}>{title}</span>
          <span style={{ fontSize: 11, color: '#8888A0' }}>{subtitle}</span>
        </div>
        {/* Type toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 8, border: '1px solid #2A2A3A' }}>
          <button
            type="button"
            onClick={() => onChangeType('solid')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              background: currentType === 'solid' ? '#7C5CFC' : 'transparent',
              color: currentType === 'solid' ? '#fff' : '#8888A0',
              transition: 'all 0.15s',
            }}
          >
            Solid
          </button>
          <button
            type="button"
            onClick={() => onChangeType('gradient')}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              background: currentType === 'gradient' ? '#7C5CFC' : 'transparent',
              color: currentType === 'gradient' ? '#fff' : '#8888A0',
              transition: 'all 0.15s',
            }}
          >
            Gradient
          </button>
        </div>
      </div>

      {/* Mini preview strip */}
      <div style={{
        height: 18,
        borderRadius: 6,
        background: previewStyle,
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
      }} />

      {currentType === 'solid' ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, color: '#8888A0' }}>Rəng</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>{currentSolid}</span>
            <input
              type="color"
              value={sanitizeColor(currentSolid)}
              onChange={(e) => onChangeSolid(e.target.value)}
              style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12, color: '#8888A0' }}>Başlanğıc rəng (From)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>{currentFrom}</span>
              <input
                type="color"
                value={sanitizeColor(currentFrom)}
                onChange={(e) => onChangeFrom(e.target.value)}
                style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12, color: '#8888A0' }}>Son rəng (To)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>{currentTo}</span>
              <input
                type="color"
                value={sanitizeColor(currentTo)}
                onChange={(e) => onChangeTo(e.target.value)}
                style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12, color: '#8888A0' }}>İstiqamət</label>
            <select
              className="dash-input"
              value={currentDir}
              onChange={(e) => onChangeDir(e.target.value)}
              style={{ width: 140, padding: '4px 8px', fontSize: 11 }}
            >
              <option value="135deg">Diaqonal ↘ (135°)</option>
              <option value="45deg">Diaqonal ↗ (45°)</option>
              <option value="to bottom">Yuxarıdan aşağı ↓</option>
              <option value="to top">Aşağıdan yuxarı ↑</option>
              <option value="to right">Soldan sağa →</option>
              <option value="to left">Sağdan sola ←</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  onChange,
  orgId,
  placeholder = "Şəkil linki və ya kompüterdən yükləyin..."
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  orgId?: string | null;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Şəkil yüklənmədi');
      }
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : 'Yükləmə xətası');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label className="dash-label" style={{ marginBottom: 4, display: 'block' }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="dash-input"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        {orgId && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                border: '1px solid #2A2A3A',
                background: '#282a2c',
                color: '#E8E8F0',
                borderRadius: 8,
                padding: '0 12px',
                cursor: 'pointer',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {uploading ? 'Yüklənir...' : '📁 Yüklə'}
            </button>
          </>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              border: '1px solid #2A2A3A',
              background: 'rgba(248,113,113,0.15)',
              color: '#F87171',
              borderRadius: 8,
              padding: '0 10px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Sil
          </button>
        )}
      </div>
      {value && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={value} alt="Preview" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid #2A2A3A' }} />
          <span style={{ fontSize: 11, color: '#8888A0', wordBreak: 'break-all' }}>{value}</span>
        </div>
      )}
      {uploadError && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#F87171' }}>
          {uploadError}
        </div>
      )}
    </div>
  );
}


interface ThemeCustomizerTabProps {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  saveDraft: () => void;
  publish: () => void;
  saving: boolean;
  saved: boolean;
  publishing: boolean;
  published: boolean;
  orgId?: string | null;
  orgName?: string;
  applyTheme?: (theme: any) => void;
}

export default function ThemeCustomizerTab({
  theme,
  setTheme,
  saveDraft,
  publish,
  saving,
  saved,
  publishing,
  published,
  orgId,
  orgName = '',
  applyTheme = (_theme: any) => {},
}: ThemeCustomizerTabProps) {
  return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={saveDraft}
            disabled={saving}
            className="dash-btn-secondary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={14} color="#34D399" /> : <Save size={14} />}
            {saved ? 'Saxlandı' : 'Qaralama saxla'}
          </button>
          <button
            onClick={publish}
            disabled={publishing}
            className="dash-btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
          >
            {publishing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : published ? <Check size={14} /> : <Globe size={14} />}
            {published ? 'Yayınlandı!' : 'Yayınla'}
          </button>
        </div>

        {/* Pro Template Module */}
        <div
          className="dash-card"
          style={{
            padding: 20,
            border: theme.isProTemplate ? '1.5px solid #E5A93C' : '1px solid #2A2A3A',
            background: theme.isProTemplate
              ? 'linear-gradient(135deg, rgba(229, 169, 60, 0.12), rgba(24, 27, 30, 0.9))'
              : undefined,
            position: 'relative',
            boxShadow: theme.isProTemplate ? '0 8px 24px rgba(229, 169, 60, 0.15)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #E5A93C, #F59E0B)',
                  color: '#111315',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  letterSpacing: '0.08em',
                }}
              >
                PRO
              </span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9', margin: 0 }}>
                Pro Şablon Modulu
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!theme.isProTemplate) {
                  setTheme(p => ({
                    ...p,
                    ...defaultThemes.warmGourmetPro,
                    isProTemplate: true,
                    templateId: 'warm-gourmet-pro',
                    id: 'warmGourmetPro',
                  }));
                } else {
                  setTheme(p => ({
                    ...p,
                    isProTemplate: false,
                    templateId: 'elegant',
                    id: 'elegant',
                  }));
                }
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                background: theme.isProTemplate
                  ? 'linear-gradient(135deg, #E5A93C, #F59E0B)'
                  : '#282a2c',
                color: theme.isProTemplate ? '#111315' : '#8888A0',
                transition: 'all 0.2s',
              }}
            >
              {theme.isProTemplate ? 'Aktivdir ✓' : 'Aktiv et'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#9BA3AF', margin: 0, lineHeight: '18px' }}>
            Eksklüziv dizayn, xüsusi vizual identiklik və interaktiv modullar təqdim edən premium şablonlar.
          </p>

          {theme.isProTemplate && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                {
                  id: 'pizzaHouse',
                  templateId: 'pizza-house',
                  preset: defaultThemes.pizzaHouse,
                  title: '🍕 Pizza House (PRO)',
                  desc: 'Odun sobası pizzası, zərif Neapolitan palitrası, interaktiv qalereya və masa rezervasiyası.',
                },
                {
                  id: 'randevuCafe',
                  templateId: 'randevu-cafe',
                  preset: defaultThemes.randevuCafe,
                  title: '🍃 Randevu Cafe & Lounge (PRO)',
                  desc: 'Ailəvi lounge və kafe üçün bento şəbəkəsi, zümrüd-burqundu rəngləri və xüsusi təkliflər.',
                },
                {
                  id: 'warmGourmetPro',
                  templateId: 'warm-gourmet-pro',
                  preset: defaultThemes.warmGourmetPro,
                  title: '🔥 Warm Gourmet Street Food (PRO)',
                  desc: 'Qaranlıq şifer dərinlikləri, zəfəran qızılı işıltılar, interaktiv menyu və sürətli sifariş.',
                },
              ].map((proItem) => {
                const isSelected =
                  theme.proTemplateId === proItem.templateId ||
                  theme.templateId === proItem.templateId ||
                  theme.id === proItem.id;
                return (
                  <button
                    key={proItem.id}
                    type="button"
                    onClick={() => {
                      if (proItem.preset) {
                        setTheme((p) => ({
                          ...p,
                          ...proItem.preset,
                          isProTemplate: true,
                          templateId: proItem.templateId,
                          proTemplateId: proItem.templateId,
                          id: proItem.id,
                        }));
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `1px solid ${isSelected ? '#E5A93C' : '#2A2A3A'}`,
                      background: isSelected ? 'rgba(229, 169, 60, 0.15)' : '#181A20',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#ffc665' : '#E8E8F0' }}>
                        {proItem.title}
                      </span>
                      {isSelected && <Check size={14} color="#ffc665" />}
                    </div>
                    <span style={{ fontSize: 11, color: '#9BA3AF' }}>{proItem.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Preset Themes */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={16} color="#7C5CFC" /> Hazır Temalar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.values(defaultThemes).filter(t => !t.isProTemplate).map((t) => (
              <button
                key={t.id}
                onClick={() => applyTheme(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, border: `1px solid ${theme.id === t.id ? t.primaryColor : '#2A2A3A'}`,
                  background: theme.id === t.id ? `${t.primaryColor}15` : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {[t.primaryColor, t.secondaryColor, t.accentColor].map((c) => (
                    <div key={c} style={{ width: 14, height: 14, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0' }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: '#8888A0' }}>{t.headingFont}</p>
                </div>
                {theme.id === t.id && <Check size={14} color={t.primaryColor} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Color Settings */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>🎨 Rənglər</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'primaryColor', label: 'Əsas rəng' },
              { key: 'secondaryColor', label: 'İkinci rəng' },
              { key: 'accentColor', label: 'Vurğu rəngi' },
              { key: 'backgroundColor', label: 'Arxa plan' },
              { key: 'textColor', label: 'Mətn rəngi' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 13, color: '#8888A0' }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>{theme[key as keyof ThemeConfig] as string}</span>
                  <input
                    type="color"
                    value={theme[key as keyof ThemeConfig] as string}
                    onChange={(e) => setTheme(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arxa Plan Tənzimləmələri: Navbar, Form/Kart, Sayt, Footer */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={16} color="#7C5CFC" /> Arxa Planlar (Solid & Gradient)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 1. Navbar */}
            <BgControlItem
              title="Navbar Arxa Planı"
              subtitle="Naviqasiya paneli (header)"
              type={theme.navbarBgType}
              solidColor={theme.navbarBgColor}
              fromColor={theme.navbarGradientFrom}
              toColor={theme.navbarGradientTo}
              direction={theme.navbarGradientDir}
              fallbackSolid={`${theme.backgroundColor}E0`}
              fallbackFrom={theme.primaryColor}
              fallbackTo={theme.secondaryColor}
              onChangeType={(type) => setTheme(p => ({ ...p, navbarBgType: type }))}
              onChangeSolid={(c) => setTheme(p => ({ ...p, navbarBgColor: c }))}
              onChangeFrom={(c) => setTheme(p => ({ ...p, navbarGradientFrom: c }))}
              onChangeTo={(c) => setTheme(p => ({ ...p, navbarGradientTo: c }))}
              onChangeDir={(d) => setTheme(p => ({ ...p, navbarGradientDir: d }))}
            />

            {/* 2. Form & Kartlar */}
            <BgControlItem
              title="Form və Kart Arxa Planı"
              subtitle="Yemək kartları, Səbət & Detal form pəncərələri"
              type={theme.formBgType}
              solidColor={theme.formBgColor}
              fromColor={theme.formGradientFrom}
              toColor={theme.formGradientTo}
              direction={theme.formGradientDir}
              fallbackSolid={theme.backgroundColor}
              fallbackFrom={theme.backgroundColor}
              fallbackTo={`${theme.primaryColor}15`}
              onChangeType={(type) => setTheme(p => ({ ...p, formBgType: type }))}
              onChangeSolid={(c) => setTheme(p => ({ ...p, formBgColor: c }))}
              onChangeFrom={(c) => setTheme(p => ({ ...p, formGradientFrom: c }))}
              onChangeTo={(c) => setTheme(p => ({ ...p, formGradientTo: c }))}
              onChangeDir={(d) => setTheme(p => ({ ...p, formGradientDir: d }))}
            />

            {/* 3. Sayt Arxa Planı */}
            <BgControlItem
              title="Sayt Arxa Planı"
              subtitle="Bütün səhifənin ümumi fonu"
              type={theme.siteBgType}
              solidColor={theme.siteBgColor}
              fromColor={theme.siteGradientFrom}
              toColor={theme.siteGradientTo}
              direction={theme.siteGradientDir}
              fallbackSolid={theme.backgroundColor}
              fallbackFrom={theme.backgroundColor}
              fallbackTo={`${theme.secondaryColor}25`}
              onChangeType={(type) => setTheme(p => ({ ...p, siteBgType: type }))}
              onChangeSolid={(c) => setTheme(p => ({ ...p, siteBgColor: c }))}
              onChangeFrom={(c) => setTheme(p => ({ ...p, siteGradientFrom: c }))}
              onChangeTo={(c) => setTheme(p => ({ ...p, siteGradientTo: c }))}
              onChangeDir={(d) => setTheme(p => ({ ...p, siteGradientDir: d }))}
            />

            {/* 4. Footer */}
            <BgControlItem
              title="Footer Arxa Planı"
              subtitle="Səhifənin alt hissəsi"
              type={theme.footerBgType}
              solidColor={theme.footerBgColor}
              fromColor={theme.footerGradientFrom}
              toColor={theme.footerGradientTo}
              direction={theme.footerGradientDir}
              fallbackSolid={theme.secondaryColor}
              fallbackFrom={theme.secondaryColor}
              fallbackTo="#0D0D15"
              onChangeType={(type) => setTheme(p => ({ ...p, footerBgType: type }))}
              onChangeSolid={(c) => setTheme(p => ({ ...p, footerBgColor: c }))}
              onChangeFrom={(c) => setTheme(p => ({ ...p, footerGradientFrom: c }))}
              onChangeTo={(c) => setTheme(p => ({ ...p, footerGradientTo: c }))}
              onChangeDir={(d) => setTheme(p => ({ ...p, footerGradientDir: d }))}
            />
          </div>
        </div>

        {/* WhatsApp Colors */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={16} color={theme.whatsappColor || '#25D366'} /> WhatsApp İkon və Düymə Rəngləri
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#E8E8F0', fontWeight: 500, display: 'block' }}>İkon Fon / Düymə Rəngi</label>
                <span style={{ fontSize: 11, color: '#8888A0' }}>Üzən ikon və sifariş düymələrinin arxa planı</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>
                  {theme.whatsappColor || '#25D366'}
                </span>
                <input
                  type="color"
                  value={theme.whatsappColor || '#25D366'}
                  onChange={(e) => setTheme(p => ({ ...p, whatsappColor: e.target.value }))}
                  style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#E8E8F0', fontWeight: 500, display: 'block' }}>İkon / Mətn Rəngi</label>
                <span style={{ fontSize: 11, color: '#8888A0' }}>WhatsApp ikonunun özü və düymənin mətni</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>
                  {theme.whatsappIconColor || '#FFFFFF'}
                </span>
                <input
                  type="color"
                  value={theme.whatsappIconColor || '#FFFFFF'}
                  onChange={(e) => setTheme(p => ({ ...p, whatsappIconColor: e.target.value }))}
                  style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span style={{ fontSize: 11, color: '#8888A0', display: 'block', marginBottom: 8 }}>Sürətli seçimlər:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'Orijinal Yaşıl', bg: '#25D366', icon: '#FFFFFF' },
                  { label: 'Saytın Əsas Rəngi', bg: theme.primaryColor, icon: '#FFFFFF' },
                  { label: 'Qara / Minimal', bg: '#111827', icon: '#FFFFFF' },
                  { label: 'Ağ / Clean', bg: '#FFFFFF', icon: '#25D366' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTheme(p => ({ ...p, whatsappColor: preset.bg, whatsappIconColor: preset.icon }))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #2A2A3A',
                      color: '#E8E8F0', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: preset.bg, border: '1px solid #555' }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Icon Style */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔗 Sosial Media İkon Stili
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Shape */}
            <div>
              <label className="dash-label">İkon Forması</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'circle', label: '⬤ Dairə' },
                  { value: 'rounded', label: '▣ Yuvarlaq' },
                  { value: 'square', label: '■ Kare' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(p => ({ ...p, socialIconStyle: opt.value as 'circle' | 'rounded' | 'square' }))}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 8, border: `1px solid ${(theme.socialIconStyle || 'circle') === opt.value ? '#7C5CFC' : '#2A2A3A'}`,
                      background: (theme.socialIconStyle || 'circle') === opt.value ? 'rgba(124,92,252,0.15)' : 'transparent',
                      color: (theme.socialIconStyle || 'circle') === opt.value ? '#A78BFA' : '#8888A0',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Color */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#E8E8F0', fontWeight: 500, display: 'block' }}>İkon Rəngi</label>
                <span style={{ fontSize: 11, color: '#8888A0' }}>Sosial media ikonlarının özünün rəngi</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>
                  {theme.socialIconColor || '#FFFFFF'}
                </span>
                <input
                  type="color"
                  value={theme.socialIconColor || '#FFFFFF'}
                  onChange={(e) => setTheme(p => ({ ...p, socialIconColor: e.target.value }))}
                  style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                />
              </div>
            </div>

            {/* BG Color */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: '#E8E8F0', fontWeight: 500, display: 'block' }}>Arxa Plan Rəngi</label>
                <span style={{ fontSize: 11, color: '#8888A0' }}>İkon düymələrinin arxa fonu</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#8888A0', fontFamily: 'monospace' }}>
                  {theme.socialIconBgColor || theme.primaryColor + '20'}
                </span>
                <input
                  type="color"
                  value={theme.socialIconBgColor || theme.primaryColor}
                  onChange={(e) => setTheme(p => ({ ...p, socialIconBgColor: e.target.value + '33' }))}
                  style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Icon Size */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="dash-label" style={{ marginBottom: 0 }}>İkon Ölçüsü</label>
                <span style={{ fontSize: 12, color: '#7C5CFC', fontWeight: 700, fontFamily: 'monospace' }}>
                  {theme.socialIconSize ?? 44}px
                </span>
              </div>
              <input
                type="range"
                min={32}
                max={64}
                step={2}
                value={theme.socialIconSize ?? 44}
                onChange={(e) => setTheme(p => ({ ...p, socialIconSize: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span style={{ fontSize: 11, color: '#8888A0', display: 'block', marginBottom: 8 }}>Sürətli seçimlər:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'Şəffaf', bg: 'rgba(255,255,255,0.1)', icon: '#FFFFFF' },
                  { label: 'Əsas Rəng', bg: theme.primaryColor + '30', icon: theme.primaryColor },
                  { label: 'Qara / Minimal', bg: '#111827', icon: '#FFFFFF' },
                  { label: 'Ağ / Clean', bg: '#FFFFFF', icon: '#1A1A2E' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTheme(p => ({ ...p, socialIconBgColor: preset.bg, socialIconColor: preset.icon }))}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 8px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #2A2A3A',
                      color: '#E8E8F0', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: preset.bg, border: '1px solid #555' }} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Feed Modulu (Postlar Bölməsi) */}
        <div
          className="dash-card"
          style={{
            padding: 20,
            border: theme.socialFeedEnabled !== false ? '1.5px solid #7C5CFC' : '1px solid #2A2A3A',
            background: theme.socialFeedEnabled !== false
              ? 'linear-gradient(135deg, rgba(124, 92, 252, 0.08), rgba(24, 27, 30, 0.95))'
              : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Share2 size={16} color="#7C5CFC" />
              <span>📱 Sosial Media Feed Modulu</span>
            </h3>
            <button
              type="button"
              onClick={() => setTheme(p => ({ ...p, socialFeedEnabled: p.socialFeedEnabled === false ? true : false }))}
              style={{
                padding: '4px 12px',
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                background: theme.socialFeedEnabled !== false ? '#7C5CFC' : '#2A2A3A',
                color: theme.socialFeedEnabled !== false ? '#FFF' : '#8888A0',
                transition: 'all 0.15s ease',
              }}
            >
              {theme.socialFeedEnabled !== false ? 'Aktivdir ✓' : 'Deaktivdir'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#9BA3AF', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Əlaqə bölməsindən sonra daxil edilən sosial media səhifələrindən canlı postları və videoları saytda nümayiş etdirir.
          </p>

          {theme.socialFeedEnabled !== false && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Title & Subtitle */}
              <div>
                <label className="dash-label">Bölmə Başlığı</label>
                <input
                  className="dash-input"
                  placeholder="Sosial Şəbəkələrdə Biz"
                  value={theme.socialFeedTitle ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, socialFeedTitle: e.target.value }))}
                />
              </div>

              <div>
                <label className="dash-label">Alt İzah Mətni</label>
                <input
                  className="dash-input"
                  placeholder="Canlı atmosferimiz, yeni təamlarımız və xüsusi anlar"
                  value={theme.socialFeedSubtitle ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, socialFeedSubtitle: e.target.value }))}
                />
              </div>

              {/* Layout Mode */}
              <div>
                <label className="dash-label">Düzülüş Formatı (Layout)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'grid', label: '▦ Qrid Şəbəkə' },
                    { value: 'carousel', label: '↔ Karusel Slayder' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(p => ({ ...p, socialFeedLayout: opt.value as 'grid' | 'carousel' }))}
                      style={{
                        flex: 1, padding: '8px 6px', borderRadius: 8,
                        border: `1px solid ${(theme.socialFeedLayout || 'grid') === opt.value ? '#7C5CFC' : '#2A2A3A'}`,
                        background: (theme.socialFeedLayout || 'grid') === opt.value ? 'rgba(124,92,252,0.2)' : 'transparent',
                        color: (theme.socialFeedLayout || 'grid') === opt.value ? '#A78BFA' : '#8888A0',
                        cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Column Count (if grid) */}
              {(theme.socialFeedLayout || 'grid') === 'grid' && (
                <div>
                  <label className="dash-label">Sütun Sayı</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { value: 2, label: '2 Sütun' },
                      { value: 3, label: '3 Sütun' },
                      { value: 4, label: '4 Sütun' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTheme(p => ({ ...p, socialFeedColumns: opt.value as 2 | 3 | 4 }))}
                        style={{
                          flex: 1, padding: '7px 4px', borderRadius: 8,
                          border: `1px solid ${(theme.socialFeedColumns || 3) === opt.value ? '#7C5CFC' : '#2A2A3A'}`,
                          background: (theme.socialFeedColumns || 3) === opt.value ? 'rgba(124,92,252,0.2)' : 'transparent',
                          color: (theme.socialFeedColumns || 3) === opt.value ? '#A78BFA' : '#8888A0',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Style */}
              <div>
                <label className="dash-label">Kart Dizayn Stili</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'glass', label: '✨ Şüşə (Glass)' },
                    { value: 'modern', label: '◼ Modern Tünd' },
                    { value: 'bordered', label: '▢ Sərhədli' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(p => ({ ...p, socialFeedCardStyle: opt.value as 'glass' | 'modern' | 'bordered' }))}
                      style={{
                        flex: 1, padding: '7px 4px', borderRadius: 8,
                        border: `1px solid ${(theme.socialFeedCardStyle || 'glass') === opt.value ? '#7C5CFC' : '#2A2A3A'}`,
                        background: (theme.socialFeedCardStyle || 'glass') === opt.value ? 'rgba(124,92,252,0.2)' : 'transparent',
                        color: (theme.socialFeedCardStyle || 'glass') === opt.value ? '#A78BFA' : '#8888A0',
                        cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customizations */}
              <div style={{ borderTop: '1px solid #2A2A3A', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#E8E8F0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rəng Fərdiləşdirməsi
                </span>

                {/* Section Background Color */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#E8E8F0', display: 'block' }}>Bölmə Arxa Planı</label>
                    <span style={{ fontSize: 10, color: '#8888A0' }}>Feed bölməsinin fon rəngi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>
                      {theme.socialFeedBgColor || 'Şəffaf'}
                    </span>
                    <input
                      type="color"
                      value={theme.socialFeedBgColor && theme.socialFeedBgColor !== 'transparent' ? theme.socialFeedBgColor : '#121416'}
                      onChange={(e) => setTheme(p => ({ ...p, socialFeedBgColor: e.target.value }))}
                      style={{ width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                    />
                  </div>
                </div>

                {/* Card Background Color */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#E8E8F0', display: 'block' }}>Kart Arxa Planı</label>
                    <span style={{ fontSize: 10, color: '#8888A0' }}>Post kartlarının fon rəngi</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>
                      {theme.socialFeedCardBg || 'Avtomatik'}
                    </span>
                    <input
                      type="color"
                      value={theme.socialFeedCardBg || '#1A1C1E'}
                      onChange={(e) => setTheme(p => ({ ...p, socialFeedCardBg: e.target.value }))}
                      style={{ width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#E8E8F0', display: 'block' }}>Mətn Rəngi</label>
                    <span style={{ fontSize: 10, color: '#8888A0' }}>Başlıq və açıqlama mətni</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>
                      {theme.socialFeedTextColor || '#FFFFFF'}
                    </span>
                    <input
                      type="color"
                      value={theme.socialFeedTextColor || '#FFFFFF'}
                      onChange={(e) => setTheme(p => ({ ...p, socialFeedTextColor: e.target.value }))}
                      style={{ width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#E8E8F0', display: 'block' }}>Vurğu və Nişan Rəngi</label>
                    <span style={{ fontSize: 10, color: '#8888A0' }}>Həştəqlər, çərçivə və işıltılar</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>
                      {theme.socialFeedAccentColor || theme.primaryColor || '#D4A574'}
                    </span>
                    <input
                      type="color"
                      value={theme.socialFeedAccentColor || theme.primaryColor || '#D4A574'}
                      onChange={(e) => setTheme(p => ({ ...p, socialFeedAccentColor: e.target.value }))}
                      style={{ width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                    />
                  </div>
                </div>
              </div>

              {/* Engagement Switch */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #2A2A3A', paddingTop: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#E8E8F0', display: 'block', fontWeight: 600 }}>Bəyənmə və Şərh Sayğacları</label>
                  <span style={{ fontSize: 10, color: '#8888A0' }}>Postların altında interaktiv ürək və sayğacları göstər</span>
                </div>
                <input
                  type="checkbox"
                  checked={theme.socialFeedShowEngagement !== false}
                  onChange={(e) => setTheme(p => ({ ...p, socialFeedShowEngagement: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: '#7C5CFC', cursor: 'pointer' }}
                />
              </div>

              {/* Quick Design Presets */}
              <div style={{ borderTop: '1px solid #2A2A3A', paddingTop: 12 }}>
                <span style={{ fontSize: 11, color: '#8888A0', display: 'block', marginBottom: 8 }}>Sürətli Dizayn Preseti:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    {
                      label: '✨ Şüşə & Lüks',
                      style: 'glass' as const,
                      bg: 'transparent',
                      cardBg: '',
                      text: '#FFFFFF',
                      accent: theme.primaryColor || '#D4A574',
                    },
                    {
                      label: '👑 Qızılı Gourmet',
                      style: 'bordered' as const,
                      bg: '#121416',
                      cardBg: '#181b1e',
                      text: '#F7F8F9',
                      accent: '#E5A93C',
                    },
                    {
                      label: '◼ Tünd Minimal',
                      style: 'modern' as const,
                      bg: '#0F1113',
                      cardBg: '#16181A',
                      text: '#E2E2E5',
                      accent: '#A78BFA',
                    },
                    {
                      label: '▫ İşıqlı Clean',
                      style: 'bordered' as const,
                      bg: '#F8F9FA',
                      cardBg: '#FFFFFF',
                      text: '#1A1A1A',
                      accent: '#E4405F',
                    },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setTheme(p => ({
                        ...p,
                        socialFeedCardStyle: preset.style,
                        socialFeedBgColor: preset.bg,
                        socialFeedCardBg: preset.cardBg,
                        socialFeedTextColor: preset.text,
                        socialFeedAccentColor: preset.accent,
                      }))}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid #2A2A3A',
                        color: '#E8E8F0',
                        fontSize: 11,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Social page */}
              <div style={{
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(124, 92, 252, 0.08)',
                border: '1px solid rgba(124, 92, 252, 0.2)',
                fontSize: 11,
                color: '#C4C4D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>Sosial media səhifələrinizi idarə edin:</span>
                <a
                  href="/dashboard/social"
                  style={{ color: '#A78BFA', fontWeight: 700, textDecoration: 'none' }}
                >
                  Hesabları Aç →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Typography & Brand Font */}

        <div className="dash-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <span style={{ fontSize: 16 }}>👑</span>
              <span>Mağaza Adı Xüsusi Fontu</span>
            </h3>
            {theme.brandFont && (
              <button
                type="button"
                onClick={() => setTheme(p => ({ ...p, brandFont: undefined }))}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid #333',
                  borderRadius: 6,
                  color: '#A0A0B0',
                  fontSize: 11,
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                Sıfırla
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#8888A0', marginBottom: 12, lineHeight: 1.4 }}>
            Navbar-dakı loqo yanı, Hero əsas başlığı və Footer-dəki sayt adınız üçün havalı və xüsusi şrift:
          </p>

          {/* Live Preview Box */}
          <div style={{
            padding: '14px 16px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.15), rgba(20, 20, 30, 0.9))',
            border: '1px solid rgba(124, 92, 252, 0.35)',
            marginBottom: 14,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>
              Cari Şrift: {theme.brandFont || `${theme.headingFont || 'Playfair Display'} (Standart)`}
            </div>
            <div style={{
              fontFamily: theme.brandFont ? `'${theme.brandFont}', serif` : `'${theme.headingFont || 'Playfair Display'}', serif`,
              fontSize: 24,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: 1.25,
              wordBreak: 'break-word',
            }}>
              {orgName || 'Aş Xana'}
            </div>
          </div>

          {/* Quick Select Dropdown */}
          <div style={{ marginBottom: 14 }}>
            <label className="dash-label">Sürətli Seçim</label>
            <select
              className="dash-input"
              value={theme.brandFont || ''}
              onChange={(e) => setTheme(p => ({ ...p, brandFont: e.target.value || undefined }))}
            >
              <option value="">Standart (Başlıq Fontu ilə eyni)</option>
              {BRAND_FONTS.map(f => (
                <option key={f.name} value={f.name}>
                  {f.label} — {f.category}
                </option>
              ))}
            </select>
          </div>

          {/* Visual Font Cards Grid */}
          <label className="dash-label" style={{ marginBottom: 8, display: 'block' }}>
            Havalı Şriftlər Qalereyası (Klikləyin)
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            maxHeight: 260,
            overflowY: 'auto',
            paddingRight: 4,
            marginBottom: 16,
          }}>
            {BRAND_FONTS.map(f => {
              const isSelected = (theme.brandFont || '') === f.name;
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setTheme(p => ({ ...p, brandFont: f.name }))}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: isSelected ? 'rgba(124, 92, 252, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid #7C5CFC' : '1px solid #2A2A3A',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{
                    fontFamily: `'${f.name}', sans-serif`,
                    fontSize: 15,
                    color: isSelected ? '#A78BFA' : '#FFFFFF',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {orgName || f.label}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#8888A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                    <span style={{ fontSize: 9, color: isSelected ? '#7C5CFC' : '#555566' }}>{f.category.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* General Typography */}
          <div style={{ borderTop: '1px solid #2A2A3A', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: 12, fontWeight: 600, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Ümumi Sayt Şriftləri
            </h4>
            <div>
              <label className="dash-label">Ümumi Başlıq fontu</label>
              <select className="dash-input" value={theme.headingFont} onChange={(e) => setTheme(p => ({ ...p, headingFont: e.target.value }))}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="dash-label">Mətn (Body) fontu</label>
              <select className="dash-input" value={theme.bodyFont} onChange={(e) => setTheme(p => ({ ...p, bodyFont: e.target.value }))}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Logo Settings */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            🖼️ Logo Ölçüsü və Dizaynı
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="dash-label" style={{ marginBottom: 0 }}>Header (Hero) Logo Ölçüsü</label>
                <span style={{ fontSize: 12, color: '#7C5CFC', fontWeight: 700, fontFamily: 'monospace' }}>
                  {theme.heroLogoSize ?? 120}px
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={260}
                step={5}
                value={theme.heroLogoSize ?? 120}
                onChange={(e) => setTheme(p => ({ ...p, heroLogoSize: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8888A0', marginTop: 2 }}>
                <span>Kiçik (50px)</span>
                <span>Standart (120px)</span>
                <span>Böyük (260px)</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="dash-label" style={{ marginBottom: 0 }}>Yuxarı Menyu (Navbar) Logo Ölçüsü</label>
                <span style={{ fontSize: 12, color: '#7C5CFC', fontWeight: 700, fontFamily: 'monospace' }}>
                  {theme.navLogoSize ?? 44}px
                </span>
              </div>
              <input
                type="range"
                min={28}
                max={90}
                step={2}
                value={theme.navLogoSize ?? 44}
                onChange={(e) => setTheme(p => ({ ...p, navLogoSize: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="dash-label" style={{ marginBottom: 0 }}>Logo Yuxarı Boşluğu</label>
                <span style={{ fontSize: 12, color: '#7C5CFC', fontWeight: 700, fontFamily: 'monospace' }}>
                  {theme.logoMarginTop ?? 0}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={160}
                step={4}
                value={theme.logoMarginTop ?? 0}
                onChange={(e) => setTheme(p => ({ ...p, logoMarginTop: parseInt(e.target.value) || 0 }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8888A0', marginTop: 2 }}>
                <span>0px</span>
                <span>80px</span>
                <span>160px</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="dash-label" style={{ marginBottom: 0 }}>Logo Alt Boşluğu (Başlıq ilə ara məsafə)</label>
                <span style={{ fontSize: 12, color: '#7C5CFC', fontWeight: 700, fontFamily: 'monospace' }}>
                  {theme.logoSpacing ?? 16}px
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={60}
                step={2}
                value={theme.logoSpacing ?? 16}
                onChange={(e) => setTheme(p => ({ ...p, logoSpacing: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8888A0', marginTop: 2 }}>
                <span>Yaxın (8px)</span>
                <span>Normal (16px)</span>
                <span>Geniş (60px)</span>
              </div>
            </div>

            <div style={{ paddingTop: 8, borderTop: '1px solid #2A2A3A' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#E8E8F0' }}>
                <input
                  type="checkbox"
                  checked={theme.logoHasFrame || false}
                  onChange={(e) => setTheme(p => ({ ...p, logoHasFrame: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: '#7C5CFC', cursor: 'pointer' }}
                />
                <span>Logonun kənar qutusu (çərçivə) olsun</span>
              </label>
              <span style={{ fontSize: 11, color: '#8888A0', display: 'block', marginTop: 4, marginLeft: 26 }}>
                İşarələnmədikdə logo təbii şəffaf formasında görünür (çərçivəsiz/qutusuz)
              </span>
            </div>
          </div>
        </div>

        {/* Header / Hero Media */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            🎬 Header Media (Video və ya Şəkil)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => setTheme(p => ({ ...p, headerMediaType: 'image' }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${(!theme.headerMediaType || theme.headerMediaType === 'image') ? '#7C5CFC' : '#2A2A3A'}`,
                  background: (!theme.headerMediaType || theme.headerMediaType === 'image') ? 'rgba(124,92,252,0.15)' : 'transparent',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🖼️ Şəkil
              </button>
              <button
                type="button"
                onClick={() => setTheme(p => ({ ...p, headerMediaType: 'video' }))}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${theme.headerMediaType === 'video' ? '#7C5CFC' : '#2A2A3A'}`,
                  background: theme.headerMediaType === 'video' ? 'rgba(124,92,252,0.15)' : 'transparent',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📹 Video
              </button>
            </div>

            {theme.headerMediaType === 'video' ? (
              <div>
                <label className="dash-label">Header Video Linki (MP4 və ya YouTube)</label>
                <input
                  className="dash-input"
                  placeholder="https://... və ya https://youtu.be/..."
                  value={theme.headerVideoUrl || ''}
                  onChange={(e) => setTheme(p => ({ ...p, headerVideoUrl: e.target.value }))}
                />
                <span style={{ fontSize: 11, color: '#8888A0', marginTop: 4, display: 'block' }}>
                  Hero arxasında avtomatik səssiz oxunacaq
                </span>
              </div>
            ) : (
              <div>
                <label className="dash-label">Header Şəkil Linki</label>
                <input
                  className="dash-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={theme.headerImageUrl || ''}
                  onChange={(e) => setTheme(p => ({ ...p, headerImageUrl: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Site Background Image */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            🖼️ Sayt Arxa Plan Şəkli
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="dash-label">Arxa Plan Şəkil Linki</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="dash-input"
                  placeholder="https://images.unsplash.com/..."
                  value={theme.backgroundImageUrl || ''}
                  onChange={(e) => setTheme(p => ({ ...p, backgroundImageUrl: e.target.value }))}
                  style={{ flex: 1 }}
                />
                {theme.backgroundImageUrl && (
                  <button
                    type="button"
                    onClick={() => setTheme(p => ({ ...p, backgroundImageUrl: '' }))}
                    style={{
                      border: '1px solid #2A2A3A',
                      background: 'rgba(248,113,113,0.15)',
                      color: '#F87171',
                      borderRadius: 8,
                      padding: '0 10px',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="dash-label">
                Qaranlıqlaşdırma örtüyü: {Math.round((theme.backgroundOverlay ?? 0.4) * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={90}
                value={Math.round((theme.backgroundOverlay ?? 0.4) * 100)}
                onChange={(e) => setTheme(p => ({ ...p, backgroundOverlay: parseInt(e.target.value) / 100 }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>📐 Dizayn</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="dash-label">Kənar yuvarlaqlığı: {theme.borderRadius}</label>
              <input
                type="range" min={0} max={24} value={parseInt(theme.borderRadius)}
                onChange={(e) => setTheme(p => ({ ...p, borderRadius: `${e.target.value}px` }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
            </div>
            <div>
              <label className="dash-label">Hero hündürlüyü: {theme.heroHeight}</label>
              <select className="dash-input" value={theme.heroHeight} onChange={(e) => setTheme(p => ({ ...p, heroHeight: e.target.value }))}>
                {['60vh', '70vh', '80vh', '85vh', '90vh', '95vh', '100vh'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="dash-label">Hero örtük: {Math.round(theme.heroOverlay * 100)}%</label>
              <input
                type="range" min={0} max={80} value={Math.round(theme.heroOverlay * 100)}
                onChange={(e) => setTheme(p => ({ ...p, heroOverlay: parseInt(e.target.value) / 100 }))}
                style={{ width: '100%', accentColor: '#7C5CFC' }}
              />
            </div>
          </div>
        </div>

        {/* Template Məzmunu və Şəkilləri */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#E5A93C" /> Hero Məzmunu və Şəkilləri
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="dash-label">Hero Badge Mətni (Yuxarı nişan)</label>
              <input
                className="dash-input"
                placeholder="Məs: ORİJİNAL STREET FOOD DADI"
                value={theme.heroBadgeText ?? ''}
                onChange={(e) => setTheme(p => ({ ...p, heroBadgeText: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 8 }}>
              <div>
                <label className="dash-label">1-ci Xüsusiyyət</label>
                <input
                  className="dash-input"
                  placeholder="Təbii inqrediyentlər"
                  value={theme.heroFeature1 ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, heroFeature1: e.target.value }))}
                />
              </div>
              <div>
                <label className="dash-label">2-ci Xüsusiyyət</label>
                <input
                  className="dash-input"
                  placeholder="Gündəlik təzə bişirilir"
                  value={theme.heroFeature2 ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, heroFeature2: e.target.value }))}
                />
              </div>
              <div>
                <label className="dash-label">3-cü Xüsusiyyət</label>
                <input
                  className="dash-input"
                  placeholder="Sürətli çatdırılma"
                  value={theme.heroFeature3 ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, heroFeature3: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2A2A3A', paddingTop: 12, marginTop: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#E5A93C', margin: '0 0 10px' }}>
                🌟 Sağ Tərəfdəki Yemək Kartı (Günün Təamı)
              </p>
              
              <ImageUploadField
                label="Yemək Kartı Şəkli"
                value={theme.heroDishImage}
                onChange={(url) => setTheme(p => ({ ...p, heroDishImage: url }))}
                orgId={orgId}
                placeholder="Yemək şəklinin linki və ya yükləyin..."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div>
                  <label className="dash-label">Şəkil Üstü Nişan</label>
                  <input
                    className="dash-input"
                    placeholder="Günün Sevimli Təamı"
                    value={theme.heroDishBadge ?? ''}
                    onChange={(e) => setTheme(p => ({ ...p, heroDishBadge: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="dash-label">Kart Başlığı</label>
                  <input
                    className="dash-input"
                    placeholder="Toyuq Plov (kiçik)"
                    value={theme.heroDishTitle ?? ''}
                    onChange={(e) => setTheme(p => ({ ...p, heroDishTitle: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="dash-label">Kart Alt Mətni</label>
                  <input
                    className="dash-input"
                    placeholder="Ənənəvi kərə yağı və xüsusi ədviyyatlarla"
                    value={theme.heroDishSubtitle ?? ''}
                    onChange={(e) => setTheme(p => ({ ...p, heroDishSubtitle: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="dash-label">Qiymət Alt Qeydi</label>
                  <input
                    className="dash-input"
                    placeholder="təzə və isti"
                    value={theme.heroDishPriceNote ?? ''}
                    onChange={(e) => setTheme(p => ({ ...p, heroDishPriceNote: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menyu Mətni */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Utensils size={16} color="#E5A93C" /> Menyu Bölməsi Mətni
          </h3>
          <div>
            <label className="dash-label">Menyu Alt Başlığı</label>
            <textarea
              className="dash-input"
              rows={2}
              placeholder="Məs: Hər gün sevgi və ənənəvi reseptlərlə təzə bişirilən street food ləzzətləri."
              value={theme.menuSubtitle ?? ''}
              onChange={(e) => setTheme(p => ({ ...p, menuSubtitle: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Haqqımızda Məzmunu və Şəkilləri */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} color="#E5A93C" /> Haqqımızda Bölməsi Məzmunu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="dash-label">1-ci Kart Başlığı</label>
                <input
                  className="dash-input"
                  placeholder="Müştəri Məmnuniyyəti"
                  value={theme.aboutFeature1Title ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, aboutFeature1Title: e.target.value }))}
                />
              </div>
              <div>
                <label className="dash-label">1-ci Kart İzahı</label>
                <input
                  className="dash-input"
                  placeholder="Hər bir qonağımıza səmimi münasibət..."
                  value={theme.aboutFeature1Desc ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, aboutFeature1Desc: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="dash-label">2-ci Kart Başlığı</label>
                <input
                  className="dash-input"
                  placeholder="Gündəlik Təzəlik"
                  value={theme.aboutFeature2Title ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, aboutFeature2Title: e.target.value }))}
                />
              </div>
              <div>
                <label className="dash-label">2-ci Kart İzahı</label>
                <input
                  className="dash-input"
                  placeholder="Yeməklər yalnız gün ərzində..."
                  value={theme.aboutFeature2Desc ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, aboutFeature2Desc: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #2A2A3A', paddingTop: 12 }}>
              <ImageUploadField
                label="Haqqımızda Sağ Şəkli"
                value={theme.aboutImageUrl}
                onChange={(url) => setTheme(p => ({ ...p, aboutImageUrl: url }))}
                orgId={orgId}
                placeholder="Haqqımızda şəkil linki və ya kompüterdən yükləyin..."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="dash-label">Şəkil Üstü Sol Nişan</label>
                  <input
                    className="dash-input"
                    placeholder="Məkan: Salyan"
                    value={theme.aboutBadgeLeft ?? ''}
                    onChange={(e) => setTheme(p => ({ ...p, aboutBadgeLeft: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="dash-label">Şəkil Üstü Sağ Nişan</label>
                  <input
                    className="dash-input"
                    placeholder="Sürətli Çatdırılma"
                    value={theme.aboutBadgeRight ?? ''}
                    onChange={(e) => setTheme(p => ({ ...p, aboutBadgeRight: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Əlaqə & İş Saatları Məzmunu */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="#E5A93C" /> Əlaqə & İş Saatları Məzmunu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="dash-label">Əlaqə Bölməsi Alt Başlığı</label>
              <textarea
                className="dash-input"
                rows={2}
                placeholder="Sualınız var və ya sifariş vermək istəyirsiniz? Bizimlə dərhal əlaqə saxlayın."
                value={theme.contactSubtitle ?? ''}
                onChange={(e) => setTheme(p => ({ ...p, contactSubtitle: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="dash-label">İş Saatları Başlığı</label>
                <input
                  className="dash-input"
                  placeholder="İş saatları"
                  value={theme.workingHoursTitle ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, workingHoursTitle: e.target.value }))}
                />
              </div>
              <div>
                <label className="dash-label">İş Saatları Alt İzahı</label>
                <input
                  className="dash-input"
                  placeholder="Həftəlik iş qrafiki"
                  value={theme.workingHoursSubtitle ?? ''}
                  onChange={(e) => setTheme(p => ({ ...p, workingHoursSubtitle: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Mətnləri */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="#E5A93C" /> Footer Mətnləri
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="dash-label">Müəllif Hüququ (Copyright) Mətni</label>
              <input
                className="dash-input"
                placeholder={`© ${new Date().getFullYear()} ${orgName || 'Aş Xana'}. Bütün hüquqlar qorunur.`}
                value={theme.footerCopyrightText ?? ''}
                onChange={(e) => setTheme(p => ({ ...p, footerCopyrightText: e.target.value }))}
              />
            </div>
            <div>
              <label className="dash-label">Footer Şüarı / Qısa Mətn (Loqo altı)</label>
              <textarea
                className="dash-input"
                rows={2}
                placeholder="Ailəniz və doğmalarınız üçün ən sevimli məkan..."
                value={theme.footerTagline ?? ''}
                onChange={(e) => setTheme(p => ({ ...p, footerTagline: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="dash-label">Platforma / Yaradıcı Qeydi</label>
              <input
                className="dash-input"
                placeholder="Sayt SiteX platforması ilə yaradılıb"
                value={theme.footerPlatformText ?? ''}
                onChange={(e) => setTheme(p => ({ ...p, footerPlatformText: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
