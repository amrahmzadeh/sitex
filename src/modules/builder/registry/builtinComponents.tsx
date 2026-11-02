'use client';

import React from 'react';
import { ComponentDefinition, BuilderNode, GlobalDesignTokens, DeviceMode } from '../types';
import { registerComponent } from './componentRegistry';

interface RenderProps {
  node: BuilderNode;
  tokens?: GlobalDesignTokens;
  device?: DeviceMode;
  isSelected?: boolean;
}

const FALLBACK_TOKENS = {
  colors: {
    primary: '#00D37D',
    secondary: '#1A1A2E',
    accent: '#D4A574',
    background: '#0F1115',
    surface: '#181B20',
    text: '#F5F5F7',
    mutedText: '#8888A0',
  },
  typography: {
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    baseSize: '16px',
    lineHeight: '1.6',
  },
  layout: {
    borderRadius: '10px',
  },
};

// 1. Header / Navbar
export const NavbarComponent: ComponentDefinition = {
  type: 'navbar',
  label: 'Header / Navbar',
  icon: 'Compass',
  category: 'layout',
  defaultProps: {
    brandName: 'Restoranınız',
    links: 'Menyu, Haqqımızda, Qalereya, Əlaqə',
    bgColor: '#101216',
    textColor: '#F5F5F7',
    ctaText: 'Rezervasiya',
  },
  propSchema: {
    brandName: { type: 'string', label: 'Brend Adı', category: 'content' },
    links: { type: 'string', label: 'Menyu Keçidləri (vergüllə)', category: 'content' },
    ctaText: { type: 'string', label: 'Düymə Mətni', category: 'content' },
    bgColor: { type: 'color', label: 'Arxa Fon Rəngi', category: 'style' },
    textColor: { type: 'color', label: 'Mətn Rəngi', category: 'style' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const bg = node.props.bgColor || t.colors?.surface || '#101216';
    const fg = node.props.textColor || t.colors?.text || '#F5F5F7';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '8px';
    const isMobile = device === 'mobile';

    return (
      <header
        style={{
          padding: isMobile ? '14px 16px' : '16px 32px',
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 19, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: primary,
              boxShadow: `0 0 12px ${primary}`,
            }}
          />
          <span style={{ color: fg }}>{node.props.brandName || 'Brend Adı'}</span>
        </div>

        {!isMobile && (
          <nav style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 500 }}>
            {(node.props.links || 'Menyu, Haqqımızda, Əlaqə').split(',').map((l: string, i: number) => (
              <span
                key={i}
                style={{
                  color: fg,
                  opacity: 0.82,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {l.trim()}
              </span>
            ))}
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {node.props.ctaText && (
            <button
              type="button"
              style={{
                padding: isMobile ? '7px 14px' : '9px 18px',
                borderRadius: radius,
                background: primary,
                color: '#08090C',
                fontWeight: 700,
                border: 'none',
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: `0 2px 10px ${primary}40`,
                transition: 'transform 0.15s ease',
              }}
            >
              {node.props.ctaText}
            </button>
          )}
          {isMobile && (
            <div style={{ fontSize: 18, color: fg, cursor: 'pointer', padding: 4 }}>
              ☰
            </div>
          )}
        </div>
      </header>
    );
  },
};

// 2. Hero
export const HeroComponent: ComponentDefinition = {
  type: 'hero',
  label: 'Hero Bölməsi',
  icon: 'Sparkles',
  category: 'content',
  defaultProps: {
    badgeText: '★ Qüsursuz Qastronomiya Təcrübəsi',
    title: 'Xüsusi Dadlar və İsti Mühit',
    subtitle: 'Hər gün təbii yerli inqrediyentlərlə hazırlanan unudulmaz kulinariya şah əsərləri.',
    buttonText: 'Menyuya Bax',
    secondaryButtonText: 'Masa Rezervasiyası',
    bgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
    align: 'center',
  },
  propSchema: {
    badgeText: { type: 'string', label: 'Yuxarı Etiket', category: 'content' },
    title: { type: 'string', label: 'Başlıq', category: 'content' },
    subtitle: { type: 'textarea', label: 'Alt Başlıq', category: 'content' },
    buttonText: { type: 'string', label: 'Əsas Düymə', category: 'content' },
    secondaryButtonText: { type: 'string', label: 'İkinci Düymə', category: 'content' },
    bgImage: { type: 'image', label: 'Arxa Fon Şəkli', category: 'style' },
    align: {
      type: 'select',
      label: 'Hizalanma',
      options: [
        { label: 'Mərkəz', value: 'center' },
        { label: 'Sol', value: 'left' },
      ],
      category: 'layout',
    },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const primary = t.colors?.primary || '#00D37D';
    const accent = t.colors?.accent || '#D4A574';
    const radius = t.layout?.borderRadius || '10px';
    const headingFont = t.typography?.headingFont ? `'${t.typography.headingFont}', sans-serif` : 'inherit';
    const isMobile = device === 'mobile';
    const align = (node.props.align as any) || 'center';

    return (
      <section
        style={{
          padding: isMobile ? '64px 20px' : '100px 32px',
          textAlign: align,
          background: `linear-gradient(rgba(8,10,14,0.78), rgba(8,10,14,0.92)), url(${node.props.bgImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'}) center/cover no-repeat`,
          color: '#FFFFFF',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 820, margin: align === 'center' ? '0 auto' : '0' }}>
          {node.props.badgeText && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '6px 14px',
                borderRadius: 24,
                fontSize: 12,
                fontWeight: 600,
                color: accent,
                marginBottom: 20,
              }}
            >
              {node.props.badgeText}
            </div>
          )}

          <h1
            style={{
              fontFamily: headingFont,
              fontSize: isMobile ? 28 : 46,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              marginBottom: 18,
              lineHeight: 1.15,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            {node.props.title || 'Xüsusi Dadlar və İsti Mühit'}
          </h1>

          <p
            style={{
              fontSize: isMobile ? 14 : 17,
              opacity: 0.9,
              marginBottom: 32,
              lineHeight: 1.65,
              maxWidth: 640,
              margin: align === 'center' ? '0 auto 32px' : '0 0 32px',
              color: '#D8DBE2',
            }}
          >
            {node.props.subtitle}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: align === 'center' ? 'center' : 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {node.props.buttonText && (
              <button
                type="button"
                style={{
                  padding: '13px 28px',
                  borderRadius: radius,
                  background: primary,
                  color: '#08090C',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 4px 18px ${primary}40`,
                  transition: 'transform 0.15s ease',
                }}
              >
                {node.props.buttonText}
              </button>
            )}

            {node.props.secondaryButtonText && (
              <button
                type="button"
                style={{
                  padding: '13px 26px',
                  borderRadius: radius,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {node.props.secondaryButtonText}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  },
};

// 3. Text
export const TextComponent: ComponentDefinition = {
  type: 'text',
  label: 'Mətn Bloku',
  icon: 'Type',
  category: 'typography',
  defaultProps: {
    heading: 'Bizim Fəlsəfəmiz',
    content: 'Buraya istənilən məlumatı daxil edə bilərsiniz. Hər bir yeməyimiz ənənəvi reseptlərin müasir kulinariya sənəti ilə harmoniyasını əks etdirir.',
    fontSize: 16,
    color: '#E2E5EE',
    textAlign: 'center',
  },
  propSchema: {
    heading: { type: 'string', label: 'Bölmə Başlığı (könüllü)', category: 'content' },
    content: { type: 'textarea', label: 'Məzmun', category: 'content' },
    fontSize: { type: 'number', label: 'Şrift Ölçüsü (px)', category: 'style' },
    color: { type: 'color', label: 'Mətn Rəngi', category: 'style' },
    textAlign: {
      type: 'select',
      label: 'Hizalanma',
      options: [
        { label: 'Sol', value: 'left' },
        { label: 'Mərkəz', value: 'center' },
        { label: 'Sağ', value: 'right' },
      ],
      category: 'layout',
    },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const headingFont = t.typography?.headingFont ? `'${t.typography.headingFont}', sans-serif` : 'inherit';

    return (
      <div
        style={{
          padding: '40px 24px',
          maxWidth: 800,
          margin: '0 auto',
          textAlign: (node.props.textAlign as any) || 'center',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {node.props.heading && (
          <h2
            style={{
              fontFamily: headingFont,
              fontSize: 26,
              fontWeight: 700,
              color: node.props.color || t.colors?.text || '#F5F5F7',
              marginBottom: 14,
            }}
          >
            {node.props.heading}
          </h2>
        )}
        <p
          style={{
            fontSize: Number(node.props.fontSize) || 16,
            color: node.props.color || t.colors?.text || '#E2E5EE',
            lineHeight: 1.75,
            margin: 0,
            opacity: 0.9,
          }}
        >
          {node.props.content}
        </p>
      </div>
    );
  },
};

// 4. Image
export const ImageComponent: ComponentDefinition = {
  type: 'image',
  label: 'Görsəl / Şəkil',
  icon: 'Image',
  category: 'media',
  defaultProps: {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    alt: 'Restoran Təqdimatı',
    borderRadius: 14,
    caption: 'Təbii inqrediyentlərlə hazırlanan xüsusi qastronomiya təamları',
  },
  propSchema: {
    url: { type: 'image', label: 'Şəkil URL', category: 'content' },
    alt: { type: 'string', label: 'Alt Mətn', category: 'content' },
    caption: { type: 'string', label: 'Şəkil Başlığı / Qeyd', category: 'content' },
    borderRadius: { type: 'number', label: 'Künc Yuvarlaqlığı (px)', category: 'style' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const radius = Number(node.props.borderRadius) || t.layout?.borderRadius || 14;

    return (
      <figure style={{ padding: '28px 24px', maxWidth: 960, margin: '0 auto', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        <img
          src={node.props.url}
          alt={node.props.alt || 'Görsəl'}
          style={{
            width: '100%',
            maxHeight: 460,
            objectFit: 'cover',
            borderRadius: radius,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />
        {node.props.caption && (
          <figcaption style={{ marginTop: 10, fontSize: 12, color: '#8888A0', fontStyle: 'italic' }}>
            {node.props.caption}
          </figcaption>
        )}
      </figure>
    );
  },
};

// 5. Button
export const ButtonComponent: ComponentDefinition = {
  type: 'button',
  label: 'Fəaliyyət Düyməsi',
  icon: 'MousePointerClick',
  category: 'content',
  defaultProps: {
    text: 'Menyuya Keçid Et',
    variant: 'solid',
    bgColor: '#00D37D',
    textColor: '#08090C',
    align: 'center',
  },
  propSchema: {
    text: { type: 'string', label: 'Düymə Mətni', category: 'content' },
    bgColor: { type: 'color', label: 'Düymə Rəngi', category: 'style' },
    textColor: { type: 'color', label: 'Yazı Rəngi', category: 'style' },
    align: {
      type: 'select',
      label: 'Hizalanma',
      options: [
        { label: 'Mərkəz', value: 'center' },
        { label: 'Sol', value: 'left' },
        { label: 'Sağ', value: 'right' },
      ],
      category: 'layout',
    },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const bg = node.props.bgColor || t.colors?.primary || '#00D37D';
    const fg = node.props.textColor || '#08090C';
    const radius = t.layout?.borderRadius || '8px';
    const align = (node.props.align as any) || 'center';

    return (
      <div style={{ padding: '16px 24px', textAlign: align, width: '100%', boxSizing: 'border-box' }}>
        <button
          type="button"
          style={{
            padding: '12px 28px',
            borderRadius: radius,
            background: bg,
            color: fg,
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 4px 14px ${bg}40`,
            transition: 'transform 0.15s ease',
          }}
        >
          {node.props.text}
        </button>
      </div>
    );
  },
};

// 6. Menu List
export const MenuListComponent: ComponentDefinition = {
  type: 'menu_list',
  label: 'Menyu Siyahısı',
  icon: 'Utensils',
  category: 'content',
  defaultProps: {
    categoryBadge: 'Mətbəxin İnciləri',
    title: 'Seçilmiş Xüsusi Təamlar',
    description: 'Şefimizin xüsusi reseptləri əsasında hazırlanan qastronomik şah əsərləri',
    items: 'Ribeye Steyk - 34 AZN, Şah Plov - 28 AZN, Qızılbalıq Qrildə - 24 AZN, Caesar Salatı - 14 AZN, Tiramisu Dessert - 10 AZN, Xüsusi Çay Dəsgahı - 16 AZN',
  },
  propSchema: {
    categoryBadge: { type: 'string', label: 'Kiçik Etiket', category: 'content' },
    title: { type: 'string', label: 'Bölmə Başlığı', category: 'content' },
    description: { type: 'string', label: 'Bölmə İzahı', category: 'content' },
    items: { type: 'textarea', label: 'Təamlar (Ad - Qiymət, vergüllə)', category: 'content' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#15181F';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';
    const headingFont = t.typography?.headingFont ? `'${t.typography.headingFont}', sans-serif` : 'inherit';
    const isMobile = device === 'mobile';

    return (
      <section style={{ padding: isMobile ? '36px 16px' : '54px 28px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            maxWidth: 1040,
            margin: '0 auto',
            background: surface,
            borderRadius: radius,
            padding: isMobile ? '24px 18px' : '36px 32px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {node.props.categoryBadge && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: primary,
                  background: `${primary}15`,
                  padding: '4px 12px',
                  borderRadius: 20,
                  display: 'inline-block',
                  marginBottom: 8,
                }}
              >
                {node.props.categoryBadge}
              </span>
            )}
            <h3
              style={{
                fontFamily: headingFont,
                fontSize: isMobile ? 22 : 30,
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '4px 0 8px',
                letterSpacing: '-0.02em',
              }}
            >
              {node.props.title || 'Seçilmiş Təamlar'}
            </h3>
            {node.props.description && (
              <p style={{ fontSize: 14, color: '#8888A0', margin: 0, maxWidth: 540, marginInline: 'auto' }}>
                {node.props.description}
              </p>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 16,
            }}
          >
            {(node.props.items || '').split(',').map((it: string, i: number) => {
              const parts = it.split('-');
              const name = parts[0]?.trim();
              const price = parts[1]?.trim();

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.22)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ color: '#F5F5F7', fontWeight: 600, fontSize: 14 }}>{name}</span>
                    <span style={{ fontSize: 11, color: '#7E8494' }}>Təzə təbii inqrediyentlər</span>
                  </div>
                  <div
                    style={{
                      color: primary,
                      fontWeight: 800,
                      fontSize: 14,
                      background: `${primary}15`,
                      padding: '4px 10px',
                      borderRadius: 8,
                      border: `1px solid ${primary}30`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {price || '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  },
};

// 7. Features / Özəlliklər
export const FeaturesComponent: ComponentDefinition = {
  type: 'features',
  label: 'Üstünlüklər / Xüsusiyyətlər',
  icon: 'ShieldCheck',
  category: 'content',
  defaultProps: {
    sectionTitle: 'Niyə Məhz Biz?',
    f1Title: 'Təzə Fermer Məhsulları',
    f1Desc: 'Yalnız hər səhər təzə gətirilən təbii və sertifikatlaşdırılmış inqrediyentlər.',
    f2Title: 'Usta Aşpazlar',
    f2Desc: 'Avropa və Şərq kulinariya sənətində illərin peşəkar təcrübəsinə malik şeflər.',
    f3Title: 'Qüsursuz Rahatlıq',
    f3Desc: 'Lüks interyer, səmimi xidmət və canlı musiqi ilə zəngin unudulmaz axşamlar.',
  },
  propSchema: {
    sectionTitle: { type: 'string', label: 'Bölmə Başlığı', category: 'content' },
    f1Title: { type: 'string', label: '1-ci Başlıq', category: 'content' },
    f1Desc: { type: 'string', label: '1-ci İzah', category: 'content' },
    f2Title: { type: 'string', label: '2-ci Başlıq', category: 'content' },
    f2Desc: { type: 'string', label: '2-ci İzah', category: 'content' },
    f3Title: { type: 'string', label: '3-ci Başlıq', category: 'content' },
    f3Desc: { type: 'string', label: '3-ci İzah', category: 'content' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#161921';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';
    const isMobile = device === 'mobile';

    return (
      <section style={{ padding: isMobile ? '40px 16px' : '54px 28px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          {node.props.sectionTitle && (
            <h3
              style={{
                textAlign: 'center',
                fontSize: isMobile ? 22 : 28,
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: 32,
                letterSpacing: '-0.02em',
              }}
            >
              {node.props.sectionTitle}
            </h3>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {[
              { t: node.props.f1Title, d: node.props.f1Desc, icon: '🌱' },
              { t: node.props.f2Title, d: node.props.f2Desc, icon: '👨‍🍳' },
              { t: node.props.f3Title, d: node.props.f3Desc, icon: '✨' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: surface,
                  padding: '28px 24px',
                  borderRadius: radius,
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${primary}18`,
                    border: `1px solid ${primary}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                  }}
                >
                  {f.icon}
                </div>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>{f.t}</h4>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0, lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
};

// 8. Testimonials / Rəylər
export const TestimonialsComponent: ComponentDefinition = {
  type: 'testimonials',
  label: 'Müştəri Rəyləri',
  icon: 'MessageSquareQuote',
  category: 'content',
  defaultProps: {
    author: 'Samir Əliyev',
    review: 'Yeməklər inanılmaz dərəcədə dadlı idi! Xüsusilə steyk və desert çox xoşuma gəldi. Personalın diqqəti və abu-hava yüksək səviyyədədir.',
    role: 'Qastronomiya Bloqeri',
    rating: 5,
  },
  propSchema: {
    author: { type: 'string', label: 'Müştəri Adı', category: 'content' },
    role: { type: 'string', label: 'Status / Peşə', category: 'content' },
    review: { type: 'textarea', label: 'Rəy Mətni', category: 'content' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const accent = t.colors?.accent || '#D4A574';
    const radius = t.layout?.borderRadius || '12px';
    const isMobile = device === 'mobile';

    return (
      <section style={{ padding: isMobile ? '32px 16px' : '48px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            padding: isMobile ? '24px 20px' : '36px 36px',
            background: 'rgba(212,165,116,0.06)',
            borderRadius: radius,
            border: '1px solid rgba(212,165,116,0.25)',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ color: accent, fontSize: 20, marginBottom: 12, letterSpacing: 4 }}>★★★★★</div>
          <p
            style={{
              fontStyle: 'italic',
              fontSize: isMobile ? 15 : 18,
              color: '#F0F2F7',
              marginBottom: 20,
              lineHeight: 1.65,
            }}
          >
            “{node.props.review}”
          </p>
          <div style={{ fontWeight: 800, color: accent, fontSize: 16 }}>{node.props.author}</div>
          <div style={{ fontSize: 12, color: '#8888A0', marginTop: 4 }}>{node.props.role}</div>
        </div>
      </section>
    );
  },
};

// 9. Contact Form
export const ContactFormComponent: ComponentDefinition = {
  type: 'contact_form',
  label: 'Əlaqə Formu',
  icon: 'Send',
  category: 'form',
  defaultProps: {
    title: 'Bizimlə Əlaqə Saxlayın və ya Rezervasiya Edin',
    subtitle: 'Suallarınız və ya xüsusi tədbir sifarişləriniz üçün bizimlə əlaqə qurun.',
    submitText: 'Mesajı Göndər',
  },
  propSchema: {
    title: { type: 'string', label: 'Başlıq', category: 'content' },
    subtitle: { type: 'string', label: 'Alt Başlıq', category: 'content' },
    submitText: { type: 'string', label: 'Göndər Düyməsi', category: 'content' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#15181F';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';
    const isMobile = device === 'mobile';

    return (
      <section style={{ padding: isMobile ? '36px 16px' : '54px 28px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            padding: isMobile ? '24px 20px' : '36px 36px',
            background: surface,
            borderRadius: radius,
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: 600,
            margin: '0 auto',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          }}
        >
          <h3 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: '#F5F5F7', margin: '0 0 6px', textAlign: 'center' }}>
            {node.props.title}
          </h3>
          {node.props.subtitle && (
            <p style={{ fontSize: 13, color: '#8888A0', margin: '0 0 24px', textAlign: 'center' }}>
              {node.props.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <input
                style={{
                  padding: '12px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#FFF',
                  fontSize: 13,
                  outline: 'none',
                }}
                placeholder="Adınız və Soyadınız"
                disabled
              />
              <input
                style={{
                  padding: '12px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#FFF',
                  fontSize: 13,
                  outline: 'none',
                }}
                placeholder="Əlaqə Nömrəniz"
                disabled
              />
            </div>
            <textarea
              style={{
                padding: '12px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#FFF',
                fontSize: 13,
                minHeight: 90,
                outline: 'none',
                resize: 'none',
              }}
              placeholder="Mesajınız və ya masa rezervasiyası qeydiniz..."
              disabled
            />
            <button
              type="button"
              style={{
                padding: '13px',
                background: primary,
                color: '#08090C',
                fontWeight: 800,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                boxShadow: `0 4px 14px ${primary}40`,
              }}
            >
              {node.props.submitText || 'Mesajı Göndər'}
            </button>
          </div>
        </div>
      </section>
    );
  },
};

// 10. Map / Xəritə
export const MapComponent: ComponentDefinition = {
  type: 'map',
  label: 'Xəritə Bloku',
  icon: 'MapPin',
  category: 'content',
  defaultProps: {
    address: 'Nizami küçəsi 45, Səbail rayonu, Bakı, Azərbaycan',
    workingHours: 'Hər gün: 10:00 - 00:00',
    phone: '+994 (12) 490 00 00',
  },
  propSchema: {
    address: { type: 'string', label: 'Ünvan', category: 'content' },
    workingHours: { type: 'string', label: 'İş Saatları', category: 'content' },
    phone: { type: 'string', label: 'Telefon', category: 'content' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#161921';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';
    const isMobile = device === 'mobile';

    return (
      <div style={{ padding: isMobile ? '24px 16px' : '36px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            padding: '36px 24px',
            background: surface,
            borderRadius: radius,
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            maxWidth: 820,
            margin: '0 auto',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `${primary}18`,
              border: `1px solid ${primary}35`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              marginBottom: 14,
              color: primary,
            }}
          >
            📍
          </div>
          <div style={{ fontWeight: 800, color: '#F5F5F7', fontSize: 18 }}>{node.props.address}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, fontSize: 13, color: '#8888A0', flexWrap: 'wrap' }}>
            <span>🕒 {node.props.workingHours || '10:00 - 00:00'}</span>
            <span>📞 {node.props.phone || '+994 (12) 490 00 00'}</span>
          </div>
        </div>
      </div>
    );
  },
};

// 11. Footer
export const FooterComponent: ComponentDefinition = {
  type: 'footer',
  label: 'Footer / Sonluq',
  icon: 'PanelBottom',
  category: 'layout',
  defaultProps: {
    copyright: '© 2026 Restoranınız. Bütün hüquqlar qorunur.',
    poweredBy: 'SiteX Studio ilə təmin edilir.',
    bgColor: '#0A0B0E',
    textColor: '#8888A0',
  },
  propSchema: {
    copyright: { type: 'string', label: 'Müəllif Hüququ', category: 'content' },
    poweredBy: { type: 'string', label: 'Platforma Qeydi', category: 'content' },
    bgColor: { type: 'color', label: 'Arxa Fon Rəngi', category: 'style' },
    textColor: { type: 'color', label: 'Mətn Rəngi', category: 'style' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const bg = node.props.bgColor || '#0A0B0E';
    const fg = node.props.textColor || '#8888A0';

    return (
      <footer
        style={{
          padding: '36px 24px',
          background: bg,
          color: fg,
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{node.props.copyright}</p>
        <p style={{ margin: '8px 0 0', fontSize: 11, opacity: 0.65 }}>{node.props.poweredBy}</p>
      </footer>
    );
  },
};

// 12. Spacer / Divider
export const DividerComponent: ComponentDefinition = {
  type: 'divider',
  label: 'Boşluq / Ayırıcı',
  icon: 'Minus',
  category: 'layout',
  defaultProps: {
    height: 36,
    showLine: true,
  },
  propSchema: {
    height: { type: 'number', label: 'Hündürlük (px)', category: 'layout' },
    showLine: { type: 'boolean', label: 'Xətt Göstər', category: 'style' },
  },
  render: ({ node }: RenderProps) => (
    <div style={{ height: Number(node.props.height) || 36, display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      {node.props.showLine && <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }} />}
    </div>
  ),
};

// 13. Container / Grid
export const ContainerComponent: ComponentDefinition = {
  type: 'container',
  label: 'Qutu / Konteyner',
  icon: 'Box',
  category: 'layout',
  defaultProps: {
    padding: 24,
    bgColor: 'transparent',
  },
  propSchema: {
    padding: { type: 'number', label: 'Daxili Boşluq (px)', category: 'layout' },
    bgColor: { type: 'color', label: 'Arxa Fon Rəngi', category: 'style' },
  },
  render: ({ node, children }: any) => (
    <div
      style={{
        padding: Number(node.props.padding) || 24,
        background: node.props.bgColor || 'transparent',
        border: '1px dashed rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {children}
    </div>
  ),
};

// 14. Gallery
export const GalleryComponent: ComponentDefinition = {
  type: 'gallery',
  label: 'Qalereya',
  icon: 'Images',
  category: 'media',
  defaultProps: {
    title: 'Restoran və Atmosferimiz',
    columns: 3,
  },
  propSchema: {
    title: { type: 'string', label: 'Qalereya Başlığı', category: 'content' },
    columns: { type: 'number', label: 'Sütun Sayı', category: 'layout' },
  },
  render: ({ node, tokens, device }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const radius = t.layout?.borderRadius || '10px';
    const isMobile = device === 'mobile';
    const cols = isMobile ? 1 : Number(node.props.columns) || 3;

    return (
      <section style={{ padding: isMobile ? '32px 16px' : '48px 28px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <h3 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: '#F5F5F7', marginBottom: 20, textAlign: 'center' }}>
            {node.props.title}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
            {[
              '1517248135467-4c7edcad34c4',
              '1555396273-367ea4eb4db5',
              '1552566626-52f8b828add9',
            ].map((id, i) => (
              <img
                key={i}
                src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`}
                alt="Qalereya şəkli"
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: radius,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  },
};

export function registerAllBuiltinComponents() {
  registerComponent(NavbarComponent);
  registerComponent(HeroComponent);
  registerComponent(TextComponent);
  registerComponent(ImageComponent);
  registerComponent(ButtonComponent);
  registerComponent(MenuListComponent);
  registerComponent(FeaturesComponent);
  registerComponent(TestimonialsComponent);
  registerComponent(ContactFormComponent);
  registerComponent(MapComponent);
  registerComponent(FooterComponent);
  registerComponent(DividerComponent);
  registerComponent(ContainerComponent);
  registerComponent(GalleryComponent);
}

// Auto-register on import
registerAllBuiltinComponents();
