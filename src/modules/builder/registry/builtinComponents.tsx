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
    links: 'Menyu, Haqqımızda, Əlaqə',
    bgColor: '#111315',
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
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const bg = node.props.bgColor || t.colors?.surface || '#111315';
    const fg = node.props.textColor || t.colors?.text || '#F5F5F7';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '8px';

    return (
      <nav
        style={{
          padding: '16px 24px',
          background: bg,
          color: fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: primary }} />
          <span>{node.props.brandName || 'Brend Adı'}</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, fontWeight: 500 }}>
          {(node.props.links || 'Menyu, Haqqımızda, Əlaqə').split(',').map((l: string, i: number) => (
            <span key={i} style={{ opacity: 0.85, cursor: 'pointer', transition: 'opacity 0.15s' }}>
              {l.trim()}
            </span>
          ))}
        </div>
        {node.props.ctaText && (
          <button
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: radius,
              background: primary,
              color: '#08090C',
              fontWeight: 700,
              border: 'none',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {node.props.ctaText}
          </button>
        )}
      </nav>
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
    title: 'Xüsusi Dadlar və İsti Mühit',
    subtitle: 'Hər gün təbii inqrediyentlərlə hazırlanan ləzzətli yeməklər',
    buttonText: 'Menyuya Bax',
    bgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    align: 'center',
  },
  propSchema: {
    title: { type: 'string', label: 'Başlıq', category: 'content' },
    subtitle: { type: 'textarea', label: 'Alt Başlıq', category: 'content' },
    buttonText: { type: 'string', label: 'Düymə Mətni', category: 'content' },
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
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const primary = t.colors?.primary || '#00D37D';
    const accent = t.colors?.accent || '#D4A574';
    const radius = t.layout?.borderRadius || '10px';
    const headingFont = t.typography?.headingFont ? `'${t.typography.headingFont}', sans-serif` : 'inherit';

    return (
      <section
        style={{
          padding: '80px 24px',
          textAlign: (node.props.align as any) || 'center',
          background: `linear-gradient(rgba(10,11,15,0.75), rgba(10,11,15,0.85)), url(${node.props.bgImage}) center/cover no-repeat`,
          color: '#FFFFFF',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: 760, margin: node.props.align === 'center' ? '0 auto' : '0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              color: accent,
              marginBottom: 16,
            }}
          >
            ★ Premium Restoran Təcrübəsi
          </div>
          <h1
            style={{
              fontFamily: headingFont,
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            {node.props.title}
          </h1>
          <p
            style={{
              fontSize: 16,
              opacity: 0.9,
              marginBottom: 28,
              lineHeight: 1.6,
              maxWidth: 600,
              margin: node.props.align === 'center' ? '0 auto 28px' : '0 0 28px',
            }}
          >
            {node.props.subtitle}
          </p>
          {node.props.buttonText && (
            <button
              type="button"
              style={{
                padding: '12px 28px',
                borderRadius: radius,
                background: primary,
                color: '#08090C',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 211, 125, 0.3)',
              }}
            >
              {node.props.buttonText}
            </button>
          )}
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
    content: 'Buraya istənilən məlumatı daxil edə bilərsiniz. Formatlama və abzaslar asanlıqla dəyişdirilir.',
    fontSize: 16,
    color: '#E2E2E5',
    textAlign: 'left',
  },
  propSchema: {
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
    return (
      <div
        style={{
          padding: '24px',
          fontSize: Number(node.props.fontSize) || 16,
          color: node.props.color || t.colors?.text || '#E2E2E5',
          textAlign: (node.props.textAlign as any) || 'left',
          lineHeight: 1.7,
        }}
      >
        {node.props.content}
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
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    alt: 'Restoran Təqdimatı',
    borderRadius: 12,
  },
  propSchema: {
    url: { type: 'image', label: 'Şəkil URL', category: 'content' },
    alt: { type: 'string', label: 'Alt Mətn', category: 'content' },
    borderRadius: { type: 'number', label: 'Künc Yuvarlaqlığı (px)', category: 'style' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const radius = Number(node.props.borderRadius) || t.layout?.borderRadius || 12;

    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
        <img
          src={node.props.url}
          alt={node.props.alt || 'Görsəl'}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: radius,
            objectFit: 'cover',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        />
      </div>
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
    text: 'Ətraflı Bax',
    variant: 'solid',
    bgColor: '#00D37D',
    textColor: '#08090C',
  },
  propSchema: {
    text: { type: 'string', label: 'Düymə Mətni', category: 'content' },
    bgColor: { type: 'color', label: 'Düymə Rəngi', category: 'style' },
    textColor: { type: 'color', label: 'Yazı Rəngi', category: 'style' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const bg = node.props.bgColor || t.colors?.primary || '#00D37D';
    const fg = node.props.textColor || '#08090C';
    const radius = t.layout?.borderRadius || '8px';

    return (
      <div style={{ padding: '16px 24px' }}>
        <button
          type="button"
          style={{
            padding: '10px 24px',
            borderRadius: radius,
            background: bg,
            color: fg,
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
    title: 'Seçilmiş Təamlar',
    items: 'Steyk Ribeye - 32 AZN, Caesar Salatı - 14 AZN, Tiramisu - 9 AZN, Şah Plov - 25 AZN',
  },
  propSchema: {
    title: { type: 'string', label: 'Bölmə Başlığı', category: 'content' },
    items: { type: 'textarea', label: 'Təamlar (Ad - Qiymət, vergüllə)', category: 'content' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#181B20';
    const primary = t.colors?.primary || '#00D37D';
    const accent = t.colors?.accent || '#D4A574';
    const radius = t.layout?.borderRadius || '12px';
    const headingFont = t.typography?.headingFont ? `'${t.typography.headingFont}', sans-serif` : 'inherit';

    return (
      <section style={{ padding: '32px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            background: surface,
            borderRadius: radius,
            padding: '28px 24px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: headingFont, fontSize: 22, fontWeight: 700, color: accent, margin: 0 }}>
              {node.props.title || 'Seçilmiş Təamlar'}
            </h3>
            <span style={{ fontSize: 11, color: '#888D9E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Qastronomik Seçimlər
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {(node.props.items || '').split(',').map((it: string, i: number) => {
              const parts = it.split('-');
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ color: '#F5F5F7', fontWeight: 600, fontSize: 14 }}>
                    {parts[0]?.trim()}
                  </div>
                  <div style={{ color: primary, fontWeight: 700, fontSize: 13, background: 'rgba(0, 211, 125, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    {parts[1]?.trim() || '—'}
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
    f1Title: 'Təzə İnqrediyentlər',
    f1Desc: 'Yalnız gündəlik yoxlanılmış fermer məhsulları.',
    f2Title: 'Usta Aşpazlar',
    f2Desc: 'Beynəlxalq təcrübəyə malik peşəkar komanda.',
    f3Title: 'Sürətli Xidmət',
    f3Desc: 'Qüsursuz masa xidməti və rahat mühit.',
  },
  propSchema: {
    f1Title: { type: 'string', label: '1-ci Başlıq', category: 'content' },
    f1Desc: { type: 'string', label: '1-ci İzah', category: 'content' },
    f2Title: { type: 'string', label: '2-ci Başlıq', category: 'content' },
    f2Desc: { type: 'string', label: '2-ci İzah', category: 'content' },
    f3Title: { type: 'string', label: '3-ci Başlıq', category: 'content' },
    f3Desc: { type: 'string', label: '3-ci İzah', category: 'content' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#181B20';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';

    return (
      <section style={{ padding: '32px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { t: node.props.f1Title, d: node.props.f1Desc, icon: '🌿' },
            { t: node.props.f2Title, d: node.props.f2Desc, icon: '👨‍🍳' },
            { t: node.props.f3Title, d: node.props.f3Desc, icon: '⚡' },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                background: surface,
                padding: 24,
                borderRadius: radius,
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>{f.t}</h4>
              <p style={{ fontSize: 13, color: '#8888A0', margin: 0, lineHeight: 1.5 }}>{f.d}</p>
            </div>
          ))}
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
    review: 'Yeməklər inanılmaz dərəcədə dadlı idi! Xüsusilə steyk və desert çox xoşuma gəldi.',
    role: 'Daimi Müştəri',
  },
  propSchema: {
    author: { type: 'string', label: 'Müştəri Adı', category: 'content' },
    role: { type: 'string', label: 'Status / Peşə', category: 'content' },
    review: { type: 'textarea', label: 'Rəy Mətni', category: 'content' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const accent = t.colors?.accent || '#D4A574';
    const radius = t.layout?.borderRadius || '12px';

    return (
      <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            padding: '28px',
            background: 'rgba(212,165,116,0.06)',
            borderRadius: radius,
            border: '1px solid rgba(212,165,116,0.2)',
          }}
        >
          <div style={{ color: accent, fontSize: 18, marginBottom: 8 }}>★★★★★</div>
          <p style={{ fontStyle: 'italic', fontSize: 15, color: '#E2E2E5', marginBottom: 16, lineHeight: 1.6 }}>
            “{node.props.review}”
          </p>
          <div style={{ fontWeight: 700, color: accent, fontSize: 14 }}>{node.props.author}</div>
          <div style={{ fontSize: 12, color: '#8888A0' }}>{node.props.role}</div>
        </div>
      </div>
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
    title: 'Bizimlə Əlaqə Saxlayın',
    submitText: 'Mesaj Göndər',
  },
  propSchema: {
    title: { type: 'string', label: 'Başlıq', category: 'content' },
    submitText: { type: 'string', label: 'Göndər Düyməsi', category: 'content' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#181B20';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';

    return (
      <section style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            padding: '28px',
            background: surface,
            borderRadius: radius,
            border: '1px solid rgba(255,255,255,0.08)',
            maxWidth: 540,
            margin: '0 auto',
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 16 }}>{node.props.title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              style={{
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#FFF',
                fontSize: 13,
              }}
              placeholder="Adınız və Soyadınız"
              disabled
            />
            <input
              style={{
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#FFF',
                fontSize: 13,
              }}
              placeholder="Əlaqə nömrəniz"
              disabled
            />
            <textarea
              style={{
                padding: '10px 14px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#FFF',
                fontSize: 13,
                minHeight: 80,
              }}
              placeholder="Mesajınız və ya sifariş qeydiniz"
              disabled
            />
            <button
              type="button"
              style={{
                padding: '12px',
                background: primary,
                color: '#08090C',
                fontWeight: 700,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {node.props.submitText}
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
    address: 'Nizami küçəsi 45, Bakı, Azərbaycan',
  },
  propSchema: {
    address: { type: 'string', label: 'Ünvan', category: 'content' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const surface = t.colors?.surface || '#181B20';
    const primary = t.colors?.primary || '#00D37D';
    const radius = t.layout?.borderRadius || '12px';

    return (
      <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            padding: '36px 24px',
            background: surface,
            borderRadius: radius,
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0, 211, 125, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              marginBottom: 12,
              color: primary,
            }}
          >
            📍
          </div>
          <div style={{ fontWeight: 700, color: '#F5F5F7', fontSize: 16 }}>{node.props.address}</div>
          <p style={{ fontSize: 12, color: '#8888A0', marginTop: 6 }}>İnteraktiv Xəritə və Yol Bələdçisi</p>
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
    poweredBy: 'SiteX tərəfindən təmin edilir.',
    bgColor: '#0C0E10',
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
    const bg = node.props.bgColor || '#0C0E10';
    const fg = node.props.textColor || '#8888A0';

    return (
      <footer
        style={{
          padding: '28px 24px',
          background: bg,
          color: fg,
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{node.props.copyright}</p>
        <p style={{ margin: '6px 0 0', fontSize: 11, opacity: 0.65 }}>{node.props.poweredBy}</p>
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
    height: 32,
    showLine: true,
  },
  propSchema: {
    height: { type: 'number', label: 'Hündürlük (px)', category: 'layout' },
    showLine: { type: 'boolean', label: 'Xətt Göstər', category: 'style' },
  },
  render: ({ node }: RenderProps) => (
    <div style={{ height: Number(node.props.height) || 32, display: 'flex', alignItems: 'center', width: '100%' }}>
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
    padding: 20,
    bgColor: 'transparent',
  },
  propSchema: {
    padding: { type: 'number', label: 'Daxili Boşluq (px)', category: 'layout' },
    bgColor: { type: 'color', label: 'Arxa Fon Rəngi', category: 'style' },
  },
  render: ({ node, children }: any) => (
    <div
      style={{
        padding: Number(node.props.padding) || 20,
        background: node.props.bgColor || 'transparent',
        border: '1px dashed rgba(255,255,255,0.12)',
        borderRadius: 8,
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
    title: 'Foto Qalereya',
    columns: 3,
  },
  propSchema: {
    title: { type: 'string', label: 'Qalereya Başlığı', category: 'content' },
    columns: { type: 'number', label: 'Sütun Sayı', category: 'layout' },
  },
  render: ({ node, tokens }: RenderProps) => {
    const t = tokens || (FALLBACK_TOKENS as any);
    const radius = t.layout?.borderRadius || '8px';

    return (
      <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 14 }}>{node.props.title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns || 3}, 1fr)`, gap: 12 }}>
          {['1517248135467-4c7edcad34c4', '1555396273-367ea4eb4db5', '1552566626-52f8b828add9'].map((id, i) => (
            <img
              key={i}
              src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`}
              alt="Qalereya şəkli"
              style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: radius }}
            />
          ))}
        </div>
      </div>
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
