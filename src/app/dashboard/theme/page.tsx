'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Save, Globe, Eye, Check, Palette, MessageCircle, Layers, Monitor, Smartphone, Sparkles, Clock, Utensils, BookOpen, FileText } from 'lucide-react';
import { defaultThemes, ThemeConfig, resolveBg, BRAND_FONTS } from '@/lib/themes';
import RestaurantSite, { SiteData } from '@/components/themes/RestaurantSite';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
    </div>
  );
}

export default function ThemePage() {
  const orgId = useCurrentOrg();
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemes.elegant);
  const [slug, setSlug] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgData, setOrgData] = useState<any>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
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
        if (d.organization) {
          setOrgData(d.organization);
          if (d.organization.website?.draftTheme) {
            const dt = d.organization.website.draftTheme as Partial<ThemeConfig>;
            setTheme({
              ...defaultThemes.elegant,
              ...dt,
              isProTemplate: Boolean(dt.isProTemplate),
            });
          }
          setSlug(d.organization.slug || '');
          setOrgLogo(d.organization.logo || '');
          setOrgName(d.organization.name || '');
        }
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

  const applyTheme = (t: ThemeConfig) => {
    setTheme(prev => ({
      ...prev,
      ...t,
      isProTemplate: Boolean(t.isProTemplate),
    }));
  };

  const isProActive = Boolean(theme.isProTemplate);

  const previewSiteData = useMemo<SiteData>(() => {
    const rawCategories = orgData?.menuCategories || [];
    const validCategories = rawCategories.filter((c: any) => c.menuItems && c.menuItems.length > 0);

    const categories = validCategories.length > 0 ? validCategories : [
      {
        id: 'cat-1',
        name: 'Aş Çeşidləri',
        slug: 'as-cesidleri',
        isVisible: true,
        menuItems: [
          {
            id: 'item-1',
            name: 'Toyuq Plov (kiçik)',
            slug: 'toyuq-plov-kicik',
            description: 'Zəfəranlı uzun düyü, zərif bişmiş toyuq əti, təbii kərə yağı ilə doyumlu kiçik porsiya.',
            price: 2.80,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
            isNew: false,
            isPopular: true,
            portionSize: 'Kiçik porsiya',
          },
          {
            id: 'item-2',
            name: 'Toyuq Plov (böyük)',
            slug: 'toyuq-plov-boyuk',
            description: 'Bol toyuq tikələri və ətirli plov ilə zənginləşdirilmiş doyurucu böyük porsiya.',
            price: 4.20,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-dish-with-rice-and-chicken-42861-large.mp4',
            isFeatured: true,
            isNew: false,
            isPopular: true,
            portionSize: 'Böyük porsiya',
          },
        ],
      },
      {
        id: 'cat-2',
        name: 'Qulyaşlar',
        slug: 'qulyaslar',
        isVisible: true,
        menuItems: [
          {
            id: 'item-3',
            name: 'Ətli Qulyaş',
            slug: 'etli-qulyas',
            description: 'Yumşaq mal əti, qatı ətirli sous və istəyə uyğun qarnir.',
            price: 3.80,
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
            isNew: true,
            isPopular: false,
            portionSize: 'Klassik',
          },
          {
            id: 'item-4',
            name: 'Toyuqlu Qulyaş',
            slug: 'toyuqlu-qulyas',
            description: 'Zərif toyuq filesi, şirin bibər və xüsusi tomat sousu ilə ləzzətli seçim.',
            price: 3.20,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
            isNew: false,
            isPopular: true,
            portionSize: 'Yüngül & Dadlı',
          },
        ],
      },
    ];

    return {
      organization: {
        name: orgName || orgData?.name || 'Restoran',
        slug: slug || orgData?.slug || 'restoran',
        logo: orgLogo || orgData?.logo || undefined,
        description: orgData?.description || 'Ənənəvi dad və keyfiyyəti bir araya gətirən məkan.',
        phone: orgData?.phone || '+994 55 366 77 07',
        email: orgData?.email || '',
        address: orgData?.address || 'Bakı, Azərbaycan',
        city: orgData?.city || 'Bakı',
        mapUrl: orgData?.mapUrl || '',
        currency: orgData?.currency || 'AZN',
      },
      website: {
        theme: {
          ...theme,
          isProTemplate: isProActive,
        },
        seoTitle: orgName,
        seoDescription: orgData?.description,
      },
      whatsapp: orgData?.whatsappSettings || {
        countryCode: '994',
        phoneNumber: orgData?.phone || '553667707',
        orderMessage: 'Salam! Sifariş vermək istəyirəm: {name} - {price} AZN',
        buttonText: 'WhatsApp Sifariş',
        isEnabled: true,
      },
      socialLinks: orgData?.socialLinks?.length
        ? orgData.socialLinks
        : [
            { platform: 'instagram', url: 'https://instagram.com' },
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'whatsapp', url: 'https://wa.me' },
          ],
      workingHours: orgData?.workingHours && orgData.workingHours.length > 0 ? orgData.workingHours : [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 2, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 3, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 4, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 5, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 6, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 0, openTime: '', closeTime: '', isClosed: true },
      ],
      menuCategories: categories,
    };
  }, [orgData, orgName, slug, orgLogo, theme, isProActive]);

  if (loading) return <div style={{ display: 'grid', gap: 16 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}</div>;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bebas+Neue&family=Cinzel:wght@600;700;900&family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Dancing+Script:wght@700&family=DM+Serif+Display:ital@0;1&family=Great+Vibes&family=Kaushan+Script&family=Lobster&family=Marcellus&family=Montserrat:wght@700;800&family=Oswald:wght@600&family=Outfit:wght@700;800&family=Pacifico&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Prata&family=Righteous&family=Satisfy&display=swap"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start', maxWidth: '100%' }}>
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
            <strong>Warm Gourmet Street Food</strong> — Qaranlıq şifer dərinlikləri, zəfəran qızılı işıltılar, interaktiv səbət və sürətli WhatsApp sifariş sistemi.
          </p>

          {theme.isProTemplate && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(229, 169, 60, 0.15)',
                border: '1px solid rgba(229, 169, 60, 0.3)',
                fontSize: 12,
                color: '#ffc665',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Check size={14} />
              <span>Pro Şablon aktivdir. Saytınız yeni dizaynla işləyəcək.</span>
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
            Navbar-dakı loqo yanı, Hero əsas başlığı və Footer-dəki restoran adınız üçün havalı və xüsusi şrift:
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
              <label className="dash-label">Platforma / Yaradıcı Qeydi</label>
              <input
                className="dash-input"
                placeholder="Sayt MyRestoran platforması ilə yaradılıb"
                value={theme.footerPlatformText ?? ''}
                onChange={(e) => setTheme(p => ({ ...p, footerPlatformText: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ position: 'sticky', top: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>Canlı Önizləmə</h2>
            {isProActive && (
              <span style={{ background: 'linear-gradient(135deg, #E5A93C, #F59E0B)', color: '#111315', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 9999 }}>
                PRO ŞABLON AKTİV
              </span>
            )}
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

          {/* Device switcher */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#1e2022', padding: 3, borderRadius: 8, border: '1px solid #2A2A3A', gap: 4 }}>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                background: previewDevice === 'desktop' ? '#7C5CFC' : 'transparent',
                color: previewDevice === 'desktop' ? '#fff' : '#8888A0',
                transition: 'all 0.15s',
              }}
            >
              <Monitor size={14} /> Masaüstü
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                background: previewDevice === 'mobile' ? '#7C5CFC' : 'transparent',
                color: previewDevice === 'mobile' ? '#fff' : '#8888A0',
                transition: 'all 0.15s',
              }}
            >
              <Smartphone size={14} /> Mobil
            </button>
          </div>
        </div>

        {/* Real Live Site Viewport Container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: previewDevice === 'mobile' ? '#0c0e10' : 'transparent',
            padding: previewDevice === 'mobile' ? '16px 0' : 0,
            borderRadius: 18,
          }}
        >
          <div
            style={{
              width: previewDevice === 'mobile' ? 390 : '100%',
              height: 'calc(100vh - 120px)',
              minHeight: 800,
              borderRadius: 16,
              overflow: 'hidden',
              overflowY: 'auto',
              border: previewDevice === 'mobile' ? '8px solid #282a2c' : '1px solid #2A2A3A',
              boxShadow: previewDevice === 'mobile' ? '0 16px 40px rgba(0,0,0,0.8)' : '0 8px 30px rgba(0,0,0,0.4)',
              transform: 'translateZ(0)',
              position: 'relative',
              background: theme.backgroundColor || '#121416',
            }}
          >
            <RestaurantSite data={previewSiteData} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
