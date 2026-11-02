'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Eye,
  Check,
  CheckCircle2,
  Sparkles,
  Search,
  Sliders,
  Flame,
  Layers,
  ArrowRight,
  RotateCcw,
  Info,
} from 'lucide-react';
import { defaultThemes, ThemeConfig } from '@/lib/themes';

interface ThemeLibraryProps {
  activeTheme: ThemeConfig;
  previewTheme: ThemeConfig | null;
  onPreview: (theme: ThemeConfig) => void;
  onApply: (theme: ThemeConfig) => void;
  onCancelPreview: () => void;
  onSwitchToCustomizer?: () => void;
  isSaving?: boolean;
}

/**
 * Reallığa yaxın vizual tema önizləmə komponenti
 */
function ThemeMiniPreview({ theme }: { theme: ThemeConfig }) {
  const isDark =
    theme.backgroundColor === '#121416' ||
    theme.backgroundColor?.toLowerCase().startsWith('#1') ||
    theme.backgroundColor?.toLowerCase().startsWith('#2');

  const bgStyle =
    theme.siteBgType === 'gradient' && theme.siteGradientFrom && theme.siteGradientTo
      ? `linear-gradient(${theme.siteGradientDir || '135deg'}, ${theme.siteGradientFrom}, ${theme.siteGradientTo})`
      : theme.backgroundColor || '#121416';

  return (
    <div
      style={{
        height: 165,
        borderRadius: '12px 12px 0 0',
        background: bgStyle,
        color: theme.textColor || '#FFFFFF',
        padding: '12px 14px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
      }}
    >
      {/* Mini Naviqasiya Paneli */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: 8,
          background:
            theme.headerStyle === 'glass'
              ? 'rgba(255,255,255,0.08)'
              : theme.headerStyle === 'solid'
              ? theme.secondaryColor || '#1B1B2F'
              : 'rgba(0,0,0,0.15)',
          backdropFilter: theme.headerStyle === 'glass' ? 'blur(8px)' : undefined,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.primaryColor,
              boxShadow: `0 0 6px ${theme.primaryColor}80`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: theme.headingFont || 'serif',
              letterSpacing: '-0.01em',
              color: theme.textColor || '#FFFFFF',
            }}
          >
            {theme.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ width: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          <span
            style={{
              width: 22,
              height: 12,
              borderRadius: 4,
              background: theme.primaryColor,
              display: 'inline-block',
            }}
          />
        </div>
      </div>

      {/* Mini Qəhrəman Bölməsi (Hero) */}
      <div style={{ padding: '4px 2px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 999,
            background: `${theme.primaryColor}22`,
            border: `1px solid ${theme.primaryColor}55`,
            fontSize: 9,
            fontWeight: 700,
            color: theme.primaryColor,
            marginBottom: 4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {theme.isProTemplate ? '✦ PRO ŞABLON' : '✦ DİZAYN TEMASI'}
        </div>
        <h4
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            fontFamily: theme.headingFont || 'serif',
            color: theme.textColor,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          {theme.name} Stilləri
        </h4>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 10,
            opacity: 0.75,
            color: theme.textColor,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {theme.headingFont} & {theme.bodyFont} tipoqrafiyası
        </p>
      </div>

      {/* Mini Kart və Buton */}
      <div style={{ display: 'flex', gap: 6 }}>
        <div
          style={{
            flex: 1,
            padding: '5px 8px',
            borderRadius: theme.borderRadius || '8px',
            background:
              theme.cardStyle === 'elevated'
                ? isDark
                  ? '#1e2022'
                  : '#ffffff'
                : theme.cardStyle === 'bordered'
                ? 'transparent'
                : isDark
                ? '#181b1e'
                : '#f0f0f5',
            border:
              theme.cardStyle === 'bordered'
                ? `1px solid ${theme.primaryColor}70`
                : '1px solid rgba(255,255,255,0.08)',
            boxShadow: theme.cardStyle === 'elevated' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>Önizləmə Kartı</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: theme.primaryColor }}>₼ 15.00</span>
        </div>
        <div
          style={{
            padding: '5px 12px',
            borderRadius: theme.borderRadius || '8px',
            background: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
            color:
              theme.buttonStyle === 'solid'
                ? isDark && theme.primaryColor === '#ffc665'
                  ? '#111315'
                  : '#FFFFFF'
                : theme.primaryColor,
            border:
              theme.buttonStyle === 'outline'
                ? `1.5px solid ${theme.primaryColor}`
                : theme.buttonStyle === 'ghost'
                ? 'none'
                : 'none',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Sifariş et
        </div>
      </div>
    </div>
  );
}

export default function ThemeLibrary({
  activeTheme,
  previewTheme,
  onPreview,
  onApply,
  onCancelPreview,
  onSwitchToCustomizer,
  isSaving = false,
}: ThemeLibraryProps) {
  const [themesList, setThemesList] = useState<ThemeConfig[]>(Object.values(defaultThemes));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Dinamik olaraq /api/themes və Theme Registry məlumatlarını yüklə
  useEffect(() => {
    let isMounted = true;
    fetch('/api/themes')
      .then((res) => {
        if (!res.ok) return { themes: [] };
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data.success || !Array.isArray(data.themes)) return;

        // Backend ThemeDefinition-ları mövcud defaultThemes ilə birləşdir
        const mergedMap = new Map<string, ThemeConfig>();

        // 1. defaultThemes bazasını doldur
        Object.values(defaultThemes).forEach((t) => mergedMap.set(t.id, t));

        // 2. Dinamik temaları əlavə et və ya zənginləşdir
        data.themes.forEach((dt: any) => {
          const existing = mergedMap.get(dt.id) || mergedMap.get(dt.slug);
          const mapped: ThemeConfig = {
            ...(existing || defaultThemes.elegant),
            id: dt.id,
            name: dt.name || existing?.name || dt.id,
            description: dt.description || existing?.description || '',
            category: Array.isArray(dt.category) ? dt.category : existing?.category || [],
            previewGradient: dt.previewGradient || existing?.previewGradient,
            primaryColor: dt.tokens?.colors?.primary || existing?.primaryColor || '#D4A574',
            secondaryColor: dt.tokens?.colors?.secondary || existing?.secondaryColor || '#2C1810',
            accentColor: dt.tokens?.colors?.accent || existing?.accentColor || '#E8C9A0',
            backgroundColor: dt.tokens?.colors?.background || existing?.backgroundColor || '#FFF8F0',
            textColor: dt.tokens?.colors?.text || existing?.textColor || '#1A1A1A',
            headingFont: dt.tokens?.typography?.headingFont || existing?.headingFont || 'Playfair Display',
            bodyFont: dt.tokens?.typography?.bodyFont || existing?.bodyFont || 'Inter',
            borderRadius: dt.tokens?.radius?.borderRadius || existing?.borderRadius || '12px',
            heroHeight: dt.tokens?.spacing?.heroHeight || existing?.heroHeight || '85vh',
            heroOverlay: dt.tokens?.spacing?.heroOverlay ?? existing?.heroOverlay ?? 0.5,
            templateId: dt.slug || dt.id,
            buttonStyle: dt.layout?.buttonStyle || existing?.buttonStyle || 'solid',
            cardStyle: dt.layout?.cardStyle || existing?.cardStyle || 'elevated',
            headerStyle: dt.layout?.headerStyle || existing?.headerStyle || 'transparent',
            footerStyle: dt.layout?.footerStyle || existing?.footerStyle || 'dark',
            whatsappColor: dt.tokens?.colors?.whatsapp || existing?.whatsappColor,
            whatsappIconColor: dt.tokens?.colors?.whatsappIcon || existing?.whatsappIconColor,
            ...(dt.tokens?.customProps || {}),
          };
          mergedMap.set(dt.id, mapped);
        });

        setThemesList(Array.from(mergedMap.values()));
      })
      .catch((err) => {
        console.warn('Temalar dinamik yüklənərkən xəbərdarlıq:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'Bütün Temalar' },
      { id: 'food', label: 'Restoran & Kafe' },
      { id: 'modern', label: 'Müasir & Biznes' },
      { id: 'classic', label: 'Klassik & Zərif' },
      { id: 'pro', label: 'Street Food (PRO)' },
    ];
  }, []);

  // Filter və Axtarış
  const filteredThemes = useMemo(() => {
    return themesList.filter((t) => {
      // Kateqoriya filtri
      if (selectedCategory === 'pro' && !t.isProTemplate) return false;
      if (selectedCategory === 'food') {
        const catStr = (t.category || []).join(' ').toLowerCase();
        if (!catStr.includes('restoran') && !catStr.includes('kafe') && !catStr.includes('qida') && !t.isProTemplate) {
          return false;
        }
      }
      if (selectedCategory === 'modern') {
        const catStr = (t.category || []).join(' ').toLowerCase() + ' ' + t.name.toLowerCase();
        if (!catStr.includes('modern') && !catStr.includes('müasir') && !catStr.includes('korporativ')) {
          return false;
        }
      }
      if (selectedCategory === 'classic') {
        const catStr = (t.category || []).join(' ').toLowerCase() + ' ' + t.name.toLowerCase();
        if (!catStr.includes('klassik') && !catStr.includes('zərif') && !catStr.includes('elegant') && !catStr.includes('bloq')) {
          return false;
        }
      }

      // Axtarış sorğusu
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = t.name.toLowerCase().includes(q);
        const inDesc = (t.description || '').toLowerCase().includes(q);
        const inHeading = (t.headingFont || '').toLowerCase().includes(q);
        const inBody = (t.bodyFont || '').toLowerCase().includes(q);
        const inCategory = (t.category || []).some((c) => c.toLowerCase().includes(q));
        if (!inName && !inDesc && !inHeading && !inBody && !inCategory) {
          return false;
        }
      }

      return true;
    });
  }, [themesList, selectedCategory, searchQuery]);

  // Aktiv temanın müəyyənləşdirilməsi
  const isThemeActive = (themeItem: ThemeConfig) => {
    if (activeTheme.id === themeItem.id) return true;
    if (activeTheme.isProTemplate && themeItem.isProTemplate) {
      if (activeTheme.id && themeItem.id && activeTheme.id === themeItem.id) return true;
      return activeTheme.primaryColor === themeItem.primaryColor && activeTheme.brandFont === themeItem.brandFont;
    }
    if (
      !activeTheme.isProTemplate &&
      !themeItem.isProTemplate &&
      activeTheme.primaryColor === themeItem.primaryColor &&
      activeTheme.headingFont === themeItem.headingFont
    ) {
      return true;
    }
    return false;
  };

  const isThemePreviewing = (themeItem: ThemeConfig) => {
    return previewTheme?.id === themeItem.id;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Önizləmə Bildiriş Paneli */}
      {previewTheme && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '14px 18px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.22), rgba(0, 211, 125, 0.12))',
            border: '1.5px solid #7C5CFC',
            boxShadow: '0 8px 24px rgba(124, 92, 252, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(124, 92, 252, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C4B5FD',
              }}
            >
              <Eye size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                  Önizləmə aktivdir: "{previewTheme.name}"
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(124, 92, 252, 0.4)',
                    color: '#E0E7FF',
                  }}
                >
                  Qaralama Rejimi
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#B0B0B8' }}>
                Bu tema hələ tətbiq olunmayıb. Sağdakı ekranda saytınızın yeni görünüşünü yoxlaya bilərsiniz.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onCancelPreview}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #3A3A4E',
                background: '#23232F',
                color: '#E8E8F0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <RotateCcw size={14} />
              Önizləmədən çıx
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onApply(previewTheme)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#00D37D',
                color: '#0D1117',
                fontSize: 12,
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(0, 211, 125, 0.35)',
                transition: 'all 0.15s',
              }}
            >
              <Check size={16} />
              {isSaving ? 'Tətbiq edilir...' : 'Tətbiq et'}
            </button>
          </div>
        </div>
      )}

      {/* Başlıq və Filter İdarəetmə Paneli */}
      <div
        className="dash-card"
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid #2A2A3A',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Palette size={20} color="#00D37D" />
              Tema Kitabxanası
            </h2>
            <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0' }}>
              Saytınız üçün peşəkar temalar toplusu. Seçin, canlı önizləyin və bir kliklə tətbiq edin.
            </p>
          </div>

          {/* Aktiv Tema Mini Göstəricisi */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px',
              borderRadius: 10,
              background: 'rgba(0, 211, 125, 0.1)',
              border: '1px solid rgba(0, 211, 125, 0.3)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#00D37D',
                boxShadow: '0 0 8px #00D37D',
              }}
            />
            <span style={{ fontSize: 12, color: '#B0B0B8' }}>Aktiv Tema:</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00D37D' }}>
              {activeTheme.name}
            </span>
          </div>
        </div>

        {/* Axtarış və Kateqoriya Filterləri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Axtarış Girişi */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8888A0',
              }}
            />
            <input
              type="text"
              placeholder="Temalarda axtar... (ad, təsvir, şrift və ya stil)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dash-input"
              style={{
                width: '100%',
                paddingLeft: 38,
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid #2A2A3A',
                borderRadius: 10,
                fontSize: 13,
                height: 40,
                color: '#FFFFFF',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#8888A0',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Təmizlə
              </button>
            )}
          </div>

          {/* Kateqoriya Tabları */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    border: active ? '1px solid #00D37D' : '1px solid #2A2A3A',
                    background: active ? 'rgba(0, 211, 125, 0.12)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#00D37D' : '#8888A0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tema Kartları Şəbəkəsi (Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 20,
        }}
      >
        {filteredThemes.map((themeItem) => {
          const active = isThemeActive(themeItem);
          const isPreviewing = isThemePreviewing(themeItem);

          return (
            <div
              key={themeItem.id}
              className="dash-card"
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: isPreviewing
                  ? '2px solid #7C5CFC'
                  : active
                  ? '2px solid #00D37D'
                  : '1px solid #2A2A3A',
                background: active
                  ? 'linear-gradient(180deg, rgba(0, 211, 125, 0.05), rgba(24, 27, 30, 0.95))'
                  : isPreviewing
                  ? 'linear-gradient(180deg, rgba(124, 92, 252, 0.08), rgba(24, 27, 30, 0.95))'
                  : '#181B1E',
                boxShadow: isPreviewing
                  ? '0 10px 30px rgba(124, 92, 252, 0.25)'
                  : active
                  ? '0 10px 30px rgba(0, 211, 125, 0.2)'
                  : '0 4px 16px rgba(0,0,0,0.2)',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Status Nişanı (Overlay Badge) */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  display: 'flex',
                  gap: 6,
                }}
              >
                {active && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'rgba(0, 211, 125, 0.92)',
                      color: '#0D1117',
                      fontSize: 11,
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(0, 211, 125, 0.4)',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    Aktivdir
                  </span>
                )}
                {isPreviewing && !active && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'rgba(124, 92, 252, 0.92)',
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(124, 92, 252, 0.4)',
                    }}
                  >
                    <Eye size={13} />
                    Önizlənilir
                  </span>
                )}
                {themeItem.isProTemplate && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, #E5A93C, #F59E0B)',
                      color: '#111315',
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Flame size={12} />
                    PRO
                  </span>
                )}
              </div>

              {/* Tema Canlı Mockup Önizləməsi */}
              <ThemeMiniPreview theme={themeItem} />

              {/* Tema Haqqında Məlumatlar */}
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>
                {/* Başlıq və Təsvir */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
                      {themeItem.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#8888A0',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      {themeItem.buttonStyle} düymə
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#9BA3AF', lineHeight: '18px' }}>
                    {themeItem.description || 'Saytınız üçün hazırlanmış balanslaşdırılmış dizayn tərtibatı.'}
                  </p>
                </div>

                {/* Rəng Palitrası */}
                <div>
                  <span style={{ fontSize: 11, color: '#8888A0', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Rəng Palitrası:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {[
                      { c: themeItem.primaryColor, label: 'Əsas Rəng' },
                      { c: themeItem.secondaryColor, label: 'İkinci Rəng' },
                      { c: themeItem.accentColor, label: 'Vurğu Rəngi' },
                      { c: themeItem.backgroundColor, label: 'Arxa Plan' },
                      { c: themeItem.textColor, label: 'Mətn Rəngi' },
                    ].map(({ c, label }, idx) => (
                      <div
                        key={idx}
                        title={`${label}: ${c}`}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: c,
                          border: '2px solid #2A2A3A',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                    <span style={{ fontSize: 11, color: '#6A6A80', marginLeft: 'auto', fontFamily: 'monospace' }}>
                      {themeItem.primaryColor}
                    </span>
                  </div>
                </div>

                {/* Tipoqrafiya və Stil Nişanları */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)',
                      color: '#B0B0C0',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Başlıq: <strong>{themeItem.headingFont}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)',
                      color: '#B0B0C0',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Mətn: <strong>{themeItem.bodyFont}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.04)',
                      color: '#B0B0C0',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    Radius: <strong>{themeItem.borderRadius}</strong>
                  </span>
                </div>

                {/* Fəaliyyət Düymələri (Actions) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px solid #26292E',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onPreview(themeItem)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: isPreviewing ? '1px solid #7C5CFC' : '1px solid #3A3A4E',
                      background: isPreviewing ? 'rgba(124, 92, 252, 0.15)' : '#23262B',
                      color: isPreviewing ? '#C4B5FD' : '#E8E8F0',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Eye size={15} />
                    {isPreviewing ? 'Önizlənilir' : 'Önizlə'}
                  </button>

                  <button
                    type="button"
                    disabled={active || isSaving}
                    onClick={() => onApply(themeItem)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '9px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: active
                        ? 'rgba(0, 211, 125, 0.15)'
                        : isPreviewing
                        ? '#00D37D'
                        : '#7C5CFC',
                      color: active ? '#00D37D' : isPreviewing ? '#0D1117' : '#FFFFFF',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: active || isSaving ? 'default' : 'pointer',
                      boxShadow:
                        active || isSaving
                          ? 'none'
                          : isPreviewing
                          ? '0 4px 14px rgba(0, 211, 125, 0.35)'
                          : '0 4px 14px rgba(124, 92, 252, 0.35)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {active ? (
                      <>
                        <CheckCircle2 size={15} />
                        Aktivdir
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        {isSaving ? 'Saxlanır...' : 'Tətbiq et'}
                      </>
                    )}
                  </button>
                </div>

                {/* Əgər aktivdirsə fərdiləşdirməyə keçid linki */}
                {active && onSwitchToCustomizer && (
                  <button
                    type="button"
                    onClick={onSwitchToCustomizer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      background: 'transparent',
                      border: 'none',
                      color: '#00D37D',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '2px 0',
                    }}
                  >
                    <Sliders size={13} />
                    Bu temanın rənglərini və təfərrüatlarını fərdiləşdir
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredThemes.length === 0 && (
        <div
          className="dash-card"
          style={{
            padding: 40,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Info size={32} color="#8888A0" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
            Uyğun tema tapılmadı
          </h3>
          <p style={{ fontSize: 13, color: '#8888A0', margin: 0, maxWidth: 360 }}>
            "{searchQuery}" axtarışına uyğun heç bir nəticə yoxdur. Zəhmət olmasa başqa açar söz sınayın və ya filtrləri sıfırlayın.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="dash-btn-secondary"
            style={{ fontSize: 12, padding: '6px 14px', marginTop: 8 }}
          >
            Filtrləri sıfırla
          </button>
        </div>
      )}
    </div>
  );
}

