'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, Globe, Eye, Check, Palette, MessageCircle, Layers } from 'lucide-react';
import { defaultThemes, ThemeConfig, resolveBg } from '@/lib/themes';

function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) { setOrgId(saved); return; }
    fetch('/api/organizations').then(r => r.json()).then(d => {
      if (d.organizations?.[0]) { setOrgId(d.organizations[0].id); localStorage.setItem('currentOrgId', d.organizations[0].id); }
    });
  }, []);
  return orgId;
}

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

export default function ThemePage() {
  const orgId = useCurrentOrg();
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemes.elegant);
  const [slug, setSlug] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}`)
      .then(r => r.json())
      .then(d => {
        if (d.organization?.website?.draftTheme) {
          setTheme({ ...defaultThemes.elegant, ...(d.organization.website.draftTheme as Partial<ThemeConfig>) });
        }
        setSlug(d.organization?.slug || '');
        setOrgLogo(d.organization?.logo || '');
        setOrgName(d.organization?.name || '');
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  const saveDraft = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      await fetch(`/api/organizations/${orgId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const publish = async () => {
    if (!orgId) return;
    setPublishing(true);
    try {
      await saveDraft();
      await fetch(`/api/organizations/${orgId}/publish`, { method: 'POST' });
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } finally { setPublishing(false); }
  };

  const applyTheme = (t: ThemeConfig) => setTheme(t);

  if (loading) return <div style={{ display: 'grid', gap: 16 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}</div>;

  const previewNavbarBg = resolveBg(theme.navbarBgType, theme.navbarBgColor, theme.navbarGradientFrom, theme.navbarGradientTo, theme.navbarGradientDir, `${theme.backgroundColor}E0`);
  const previewFormBg = resolveBg(theme.formBgType, theme.formBgColor, theme.formGradientFrom, theme.formGradientTo, theme.formGradientDir, theme.backgroundColor);
  const previewSiteBg = resolveBg(theme.siteBgType, theme.siteBgColor, theme.siteGradientFrom, theme.siteGradientTo, theme.siteGradientDir, theme.backgroundColor);
  const previewFooterBg = resolveBg(theme.footerBgType, theme.footerBgColor, theme.footerGradientFrom, theme.footerGradientTo, theme.footerGradientDir, theme.secondaryColor);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start', maxWidth: 1200 }}>
      {/* Left Panel */}
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

        {/* Preset Themes */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={16} color="#7C5CFC" /> Hazır Temalar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.values(defaultThemes).map((t) => (
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

        {/* Typography */}
        <div className="dash-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>🖊 Tipografiya</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="dash-label">Başlıq fontu</label>
              <select className="dash-input" value={theme.headingFont} onChange={(e) => setTheme(p => ({ ...p, headingFont: e.target.value }))}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="dash-label">Mətn fontu</label>
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
      </div>

      {/* Preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8F0' }}>Canlı Önizləmə</h2>
          {slug && (
            <a
              href={`/site/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7C5CFC', textDecoration: 'none' }}
            >
              <Eye size={14} /> Yayınlanmış saytı aç
            </a>
          )}
        </div>
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #2A2A3A',
            height: '75vh',
            background: theme.backgroundImageUrl
              ? `linear-gradient(rgba(0,0,0,${theme.backgroundOverlay ?? 0.4}), rgba(0,0,0,${theme.backgroundOverlay ?? 0.4})), url(${theme.backgroundImageUrl}) center/cover fixed no-repeat`
              : previewSiteBg,
            fontFamily: theme.bodyFont,
          }}
        >
          {/* Mini preview of the site */}
          <div style={{ height: '100%', overflowY: 'auto' }}>
            {/* Navbar Preview */}
            <div style={{
              padding: '10px 16px',
              background: previewNavbarBg,
              borderBottom: `1px solid ${theme.primaryColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 20,
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {orgLogo && <img src={orgLogo} alt="Logo" style={{ width: 20, height: 20, objectFit: 'contain' }} />}
                <span style={{ fontSize: 13, fontWeight: 700, color: theme.textColor, fontFamily: theme.headingFont }}>{orgName || 'Restoran'}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: `${theme.primaryColor}20`, color: theme.primaryColor, fontWeight: 600 }}>Menyu</span>
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', color: theme.textColor, fontWeight: 600 }}>Səbət</span>
              </div>
            </div>

            {/* Hero Preview */}
            <div style={{
              height: 240,
              background: theme.headerImageUrl
                ? `url(${theme.headerImageUrl}) center/cover no-repeat`
                : `linear-gradient(${theme.heroOverlay * 100}deg, ${theme.secondaryColor}CC, ${theme.primaryColor}44)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              padding: 24, textAlign: 'center', position: 'relative',
              overflow: 'hidden',
            }}>
              {theme.headerMediaType === 'video' && theme.headerVideoUrl && (
                <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                  <span style={{ fontSize: 13, color: '#fff' }}>📹 Video Fon Aktivdir</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${theme.backgroundOverlay ?? theme.heroOverlay ?? 0.4})` }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {orgLogo ? (
                  <img
                    src={orgLogo}
                    alt={orgName || 'Logo'}
                    style={{
                      maxHeight: Math.min(theme.heroLogoSize ?? 120, 140),
                      maxWidth: 180,
                      width: 'auto',
                      height: 'auto',
                      borderRadius: theme.logoHasFrame ? 16 : 0,
                      objectFit: 'contain',
                      display: 'block',
                      marginTop: `${theme.logoMarginTop ?? 0}px`,
                      marginBottom: `${theme.logoSpacing ?? 16}px`,
                      boxShadow: theme.logoHasFrame ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
                      background: 'transparent',
                    }}
                  />
                ) : null}
                <h1 style={{ fontFamily: theme.headingFont, color: '#fff', fontSize: 28, fontWeight: 800, marginTop: 0, marginBottom: 8 }}>{orgName || 'Restoranınızın Adı'}</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 }}>Ən dadlı yeməklərimizi kəşf edin</p>
                <button style={{ background: theme.primaryColor, color: '#fff', border: 'none', borderRadius: theme.borderRadius, padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Menyuya bax
                </button>
              </div>
            </div>

            {/* Featured Items Preview */}
            <div style={{ padding: 24, background: 'transparent' }}>
              <h2 style={{ fontFamily: theme.headingFont, color: theme.textColor, fontSize: 20, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
                Seçilmiş Yeməklər
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {['Margherita Pizza', 'Baş Şorba', 'Çeizkeyk'].map((name) => (
                  <div key={name} style={{ background: previewFormBg, borderRadius: theme.borderRadius, overflow: 'hidden', border: `1px solid ${theme.primaryColor}30`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <div style={{ height: 80, background: `linear-gradient(135deg, ${theme.primaryColor}44, ${theme.accentColor}44)` }} />
                    <div style={{ padding: 10 }}>
                      <p style={{ fontFamily: theme.headingFont, color: theme.textColor, fontSize: 13, fontWeight: 600 }}>{name}</p>
                      <p style={{ color: theme.primaryColor, fontSize: 12, fontWeight: 700, marginTop: 4 }}>12.50 AZN</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Preview */}
            <div style={{ padding: 20, background: previewFooterBg, textAlign: 'center', position: 'relative' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontFamily: theme.bodyFont }}>
                © 2026 Restoranınız · Bütün hüquqlar qorunur
              </p>
            </div>

            {/* Floating WhatsApp preview */}
            <div
              style={{
                position: 'sticky',
                bottom: 16,
                marginLeft: 'auto',
                marginRight: 16,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: theme.whatsappColor || '#25D366',
                color: theme.whatsappIconColor || '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${(theme.whatsappColor || '#25D366')}80`,
                zIndex: 10,
              }}
              title="WhatsApp İkon Önizləməsi"
            >
              <MessageCircle size={24} color={theme.whatsappIconColor || '#FFFFFF'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
