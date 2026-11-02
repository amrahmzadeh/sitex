'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Utensils,
  BookOpen,
  Phone,
  Layers,
  Palette,
  Eye,
  Sliders,
} from 'lucide-react';
import { GlobalDesignTokens, DeviceMode } from '../types';

interface LivePreviewEngineProps {
  tokens: GlobalDesignTokens;
  compiledCss?: string;
  hasUnsavedChanges?: boolean;
}

export function LivePreviewEngine({
  tokens,
  compiledCss = '',
  hasUnsavedChanges = false,
}: LivePreviewEngineProps) {
  const [activePage, setActivePage] = useState<'home' | 'menu' | 'contact' | 'components'>('home');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [customWidth, setCustomWidth] = useState<number>(1200);

  const getContainerWidth = () => {
    if (device === 'mobile') return 375;
    if (device === 'tablet') return 768;
    return '100%';
  };

  const c = tokens.colors;
  const t = tokens.typography;
  const l = tokens.layout;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: 'calc(100vh - 56px)', background: '#0D0E11', overflow: 'hidden' }}>
      {/* Top Controls Bar */}
      <div
        style={{
          height: 48,
          background: '#13151A',
          borderBottom: '1px solid #22262E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        {/* Page Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { id: 'home', label: 'Ana Səhifə', icon: Sparkles },
            { id: 'menu', label: 'Menyu & Məhsullar', icon: Utensils },
            { id: 'contact', label: 'Əlaqə & Rezervasiya', icon: Phone },
            { id: 'components', label: 'Komponentlər Palitrası', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: isActive ? '1px solid #00D37D' : '1px solid transparent',
                  background: isActive ? 'rgba(0,211,125,0.12)' : 'transparent',
                  color: isActive ? '#00D37D' : '#8888A0',
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: '#0B0C0E', padding: 2, borderRadius: 8, border: '1px solid #22262E' }}>
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: device === 'desktop' ? '#1E222A' : 'transparent',
                color: device === 'desktop' ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
              }}
              title="Desktop Görünüşü"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: device === 'tablet' ? '#1E222A' : 'transparent',
                color: device === 'tablet' ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
              }}
              title="Planşet Görünüşü"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: device === 'mobile' ? '#1E222A' : 'transparent',
                color: device === 'mobile' ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
              }}
              title="Mobil Görünüşü"
            >
              <Smartphone size={15} />
            </button>
          </div>

          {hasUnsavedChanges && (
            <span style={{ fontSize: 11, color: '#FBBF24', background: 'rgba(251,191,36,0.1)', padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(251,191,36,0.2)' }}>
              ● Yadda saxlanılmamış dəyişikliklər
            </span>
          )}
        </div>
      </div>

      {/* Preview Viewport Canvas */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#0B0C0E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          className="sitex-live-preview-frame"
          style={{
            width: getContainerWidth(),
            minHeight: '85vh',
            background: c.background,
            color: c.text,
            fontFamily: t.bodyFont,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            borderRadius: device === 'desktop' ? 8 : 20,
            overflow: 'hidden',
            transition: 'width 0.25s ease',
            border: device === 'desktop' ? '1px solid #22262E' : '6px solid #282C35',
          }}
        >
          {/* Real Theme Dynamic Header */}
          <header
            style={{
              padding: '16px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: tokens.header.style === 'glass' ? 'rgba(255,255,255,0.06)' : tokens.header.style === 'solid' ? c.secondary : 'transparent',
              backdropFilter: tokens.header.style === 'glass' ? 'blur(12px)' : undefined,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000' }}>
                SX
              </div>
              <span style={{ fontFamily: t.headingFont, fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
                Restoranınız & Lounge
              </span>
            </div>

            <nav style={{ display: 'flex', gap: 24, fontSize: 14 }}>
              <span style={{ cursor: 'pointer', fontWeight: 600 }}>Ana Səhifə</span>
              <span style={{ cursor: 'pointer', opacity: 0.8 }}>Menyu</span>
              <span style={{ cursor: 'pointer', opacity: 0.8 }}>Haqqımızda</span>
              <span style={{ cursor: 'pointer', opacity: 0.8 }}>Əlaqə</span>
            </nav>

            <button
              type="button"
              style={{
                padding: '8px 18px',
                borderRadius: tokens.components.button.radius,
                background: tokens.components.button.style === 'outline' ? 'transparent' : c.primary,
                color: tokens.components.button.style === 'outline' ? c.primary : '#000',
                border: tokens.components.button.style === 'outline' ? `1px solid ${c.primary}` : 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Rezervasiya Et
            </button>
          </header>

          {/* PAGE CONTENT 1: HOME */}
          {activePage === 'home' && (
            <div>
              {/* Hero Section */}
              <div
                style={{
                  padding: '90px 32px',
                  textAlign: 'center',
                  background: `linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80") center/cover no-repeat`,
                  color: '#FFFFFF',
                }}
              >
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: tokens.components.badge.radius,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      color: c.accent,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 16,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    ✦ Xüsusi Qastronomik Təcrübə
                  </span>
                  <h1 style={{ fontFamily: t.headingFont, fontSize: device === 'mobile' ? 28 : 46, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
                    Dadların və Zərifliyin Mükəmməl Harmoniyası
                  </h1>
                  <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.6, marginBottom: 28 }}>
                    Şeflərimizin sevgisi ilə yerli təbii ərzaqlardan hazırlanan ləzzətli yeməklər və unudulmaz mühit.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
                    <button
                      type="button"
                      style={{
                        padding: '12px 28px',
                        borderRadius: tokens.components.button.radius,
                        background: c.primary,
                        color: '#000',
                        fontWeight: 700,
                        fontSize: 14,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Menyuya Bax
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '12px 28px',
                        borderRadius: tokens.components.button.radius,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFF',
                        fontWeight: 600,
                        fontSize: 14,
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                      }}
                    >
                      Masa Sifariş Et
                    </button>
                  </div>
                </div>
              </div>

              {/* Highlights Feature Cards */}
              <div style={{ padding: '60px 32px', maxWidth: l.containerWidth, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <h2 style={{ fontFamily: t.headingFont, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                    Niyə Bizi Seçməlisiniz?
                  </h2>
                  <p style={{ color: c.mutedText || '#8888A0', fontSize: 14 }}>
                    Hər bir detala qayğı ilə yanaşırıq
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: device === 'mobile' ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                  {[
                    { title: 'Təbii İnqrediyentlər', desc: 'Hər səhər təzə fermer məhsulları gətirilir.' },
                    { title: 'Usta Aşpazlar', desc: 'Beynəlxalq təcrübəyə malik peşəkar komanda.' },
                    { title: 'Sürətli Çatdırılma', desc: 'İsti və təzə şəkildə qapınıza çatdırılma.' },
                  ].map((card, i) => (
                    <div
                      key={i}
                      style={{
                        background: c.surface,
                        borderRadius: tokens.components.card.radius,
                        padding: tokens.components.card.padding,
                        border: tokens.components.card.style === 'bordered' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        boxShadow: tokens.components.card.style === 'elevated' ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      <h3 style={{ fontFamily: t.headingFont, fontSize: 18, fontWeight: 700, marginBottom: 8, color: c.text }}>
                        {card.title}
                      </h3>
                      <p style={{ fontSize: 14, color: c.mutedText || '#8888A0', lineHeight: 1.5 }}>
                        {card.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE CONTENT 2: MENU & CARDS */}
          {activePage === 'menu' && (
            <div style={{ padding: '60px 32px', maxWidth: l.containerWidth, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontFamily: t.headingFont, fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                  Bizim Seçilmiş Menyu
                </h2>
                <p style={{ color: c.mutedText || '#8888A0', fontSize: 14 }}>
                  Ən sevilən yemək və içkilərimiz
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: device === 'mobile' ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
                {[
                  {
                    name: 'Şah Plovu',
                    price: '28.00 AZN',
                    category: 'Əsas Yeməklər',
                    desc: 'Xırtıldayan lavaş içərisində ətirli zəfəranlı düyü, qaysı, şabalıd və quzu əti.',
                    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    name: 'Can Əti ilə Sac',
                    price: '34.00 AZN',
                    category: 'Sac Yeməkləri',
                    desc: 'Zərif dana əti, badımcan, pomidor, bibər və quyruq yağı ilə ənənəvi sacda.',
                    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    name: 'Xüsusi Qrildə Qızılbalıq',
                    price: '22.50 AZN',
                    category: 'Dəniz Məhsulları',
                    desc: 'Təzə qızılbalıq filesi, limonlu kərə yağı sousu və qulançar qarniri ilə.',
                    img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
                  },
                ].map((dish, i) => (
                  <div
                    key={i}
                    style={{
                      background: c.surface,
                      borderRadius: tokens.components.card.radius,
                      overflow: 'hidden',
                      border: tokens.components.card.style === 'bordered' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      boxShadow: tokens.components.card.style === 'elevated' ? '0 8px 24px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <div style={{ height: 180, background: `url(${dish.img}) center/cover no-repeat` }} />
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ fontFamily: t.headingFont, fontSize: 17, fontWeight: 700, margin: 0 }}>
                          {dish.name}
                        </h4>
                        <span style={{ color: c.primary, fontWeight: 700, fontSize: 16 }}>{dish.price}</span>
                      </div>
                      <p style={{ fontSize: 13, color: c.mutedText || '#8888A0', lineHeight: 1.5, marginBottom: 16 }}>
                        {dish.desc}
                      </p>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: tokens.components.button.radius,
                          background: c.primary,
                          color: '#000',
                          fontWeight: 700,
                          fontSize: 13,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Sifariş Et
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE CONTENT 3: DESIGN SYSTEM SHOWROOM */}
          {activePage === 'components' && (
            <div style={{ padding: '40px 32px', maxWidth: l.containerWidth, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <h3 style={{ fontFamily: t.headingFont, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                  Düymə Stilləri (Button Showcase)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <button
                    type="button"
                    style={{
                      padding: '10px 22px',
                      borderRadius: tokens.components.button.radius,
                      background: c.primary,
                      color: '#000',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Əsas Düymə (Primary)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '10px 22px',
                      borderRadius: tokens.components.button.radius,
                      background: 'transparent',
                      color: c.primary,
                      border: `2px solid ${c.primary}`,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Xəttli Düymə (Outline)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '10px 22px',
                      borderRadius: tokens.components.button.radius,
                      background: c.secondary,
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    İkinci Dərəcəli (Secondary)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '10px 22px',
                      borderRadius: tokens.components.button.radius,
                      background: c.accent,
                      color: '#000',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Vurğu Düyməsi (Accent)
                  </button>
                </div>
              </div>

              <div>
                <h3 style={{ fontFamily: t.headingFont, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                  Form & Daxiletmə Sahələri (Inputs)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: device === 'mobile' ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Ad və Soyad</label>
                    <input
                      type="text"
                      placeholder="Məsələn: Əli Məmmədov"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: tokens.components.input.radius,
                        background: c.surface,
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: c.text,
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>Telefon Nömrəsi</label>
                    <input
                      type="text"
                      placeholder="+994 50 123 45 67"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: tokens.components.input.radius,
                        background: c.surface,
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: c.text,
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontFamily: t.headingFont, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                  Nişanlar və Teqlər (Badges)
                </h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ padding: '6px 14px', borderRadius: tokens.components.badge.radius, background: c.primary, color: '#000', fontSize: 12, fontWeight: 700 }}>
                    Aktiv
                  </span>
                  <span style={{ padding: '6px 14px', borderRadius: tokens.components.badge.radius, background: c.accent, color: '#000', fontSize: 12, fontWeight: 700 }}>
                    Populyar
                  </span>
                  <span style={{ padding: '6px 14px', borderRadius: tokens.components.badge.radius, background: 'rgba(255,255,255,0.1)', color: '#FFF', fontSize: 12, fontWeight: 600 }}>
                    Yeni
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PAGE CONTENT 4: CONTACT */}
          {activePage === 'contact' && (
            <div style={{ padding: '60px 32px', maxWidth: l.containerWidth, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h2 style={{ fontFamily: t.headingFont, fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
                  Masa Rezervasiyası
                </h2>
                <p style={{ color: c.mutedText || '#8888A0', fontSize: 14 }}>
                  Bizimlə əlaqə saxlayın və unudulmaz axşam keçirin
                </p>
              </div>

              <div
                style={{
                  maxWidth: 540,
                  margin: '0 auto',
                  background: c.surface,
                  borderRadius: tokens.components.card.radius,
                  padding: 30,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Adınız</label>
                    <input
                      type="text"
                      placeholder="Adınızı daxil edin"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: tokens.components.input.radius,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: c.text,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Qonaq Sayı</label>
                    <select
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: tokens.components.input.radius,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: c.text,
                      }}
                    >
                      <option value="2">2 nəfərlik</option>
                      <option value="4">4 nəfərlik</option>
                      <option value="6">6 nəfərlik</option>
                      <option value="10+">Böyük qrup (10+ nəfər)</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: tokens.components.button.radius,
                      background: c.primary,
                      color: '#000',
                      fontWeight: 700,
                      border: 'none',
                      fontSize: 14,
                      cursor: 'pointer',
                      marginTop: 8,
                    }}
                  >
                    Təsdiq Et və Göndər
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Footer */}
          <footer
            style={{
              padding: '40px 32px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: tokens.footer.style === 'light' ? '#FFFFFF' : tokens.footer.style === 'accent' ? c.accent : '#0B0D10',
              color: tokens.footer.style === 'light' ? '#111' : '#FFF',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>
              © 2026 Restoranınız. Bütün hüquqlar qorunur. • Powered by SiteX
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
