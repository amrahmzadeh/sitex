'use client';

import React from 'react';
import { ComponentDefinition } from '../types';
import { registerComponent } from './componentRegistry';

// 1. Header / Navbar
export const NavbarComponent: ComponentDefinition = {
  type: 'navbar',
  label: 'Header / Navbar',
  icon: 'Compass',
  category: 'layout',
  defaultProps: {
    brandName: 'Restoran & Kafe',
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
  render: ({ node }) => (
    <nav style={{ padding: '16px 24px', background: node.props.bgColor, color: node.props.textColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{node.props.brandName}</div>
      <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
        {(node.props.links || '').split(',').map((l: string, i: number) => (
          <span key={i} style={{ opacity: 0.85 }}>{l.trim()}</span>
        ))}
      </div>
      {node.props.ctaText && (
        <button style={{ padding: '8px 16px', borderRadius: 8, background: '#00D37D', color: '#000', fontWeight: 600, border: 'none' }}>
          {node.props.ctaText}
        </button>
      )}
    </nav>
  ),
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
  render: ({ node }) => (
    <section
      style={{
        padding: '80px 24px',
        textAlign: node.props.align || 'center',
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${node.props.bgImage}) center/cover no-repeat`,
        color: '#FFFFFF',
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>{node.props.title}</h1>
      <p style={{ fontSize: 16, maxWidth: 600, margin: node.props.align === 'center' ? '0 auto 24px' : '0 0 24px', opacity: 0.9 }}>
        {node.props.subtitle}
      </p>
      {node.props.buttonText && (
        <button style={{ padding: '12px 28px', borderRadius: 10, background: '#D4A574', color: '#1A1A1A', fontWeight: 700, border: 'none' }}>
          {node.props.buttonText}
        </button>
      )}
    </section>
  ),
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
  render: ({ node }) => (
    <div style={{ padding: '16px', fontSize: Number(node.props.fontSize) || 16, color: node.props.color, textAlign: node.props.textAlign }}>
      {node.props.content}
    </div>
  ),
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
  render: ({ node }) => (
    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
      <img
        src={node.props.url}
        alt={node.props.alt}
        style={{ maxWidth: '100%', height: 'auto', borderRadius: Number(node.props.borderRadius) || 12, objectFit: 'cover' }}
      />
    </div>
  ),
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
    textColor: '#000000',
  },
  propSchema: {
    text: { type: 'string', label: 'Düymə Mətni', category: 'content' },
    bgColor: { type: 'color', label: 'Düymə Rəngi', category: 'style' },
    textColor: { type: 'color', label: 'Yazı Rəngi', category: 'style' },
  },
  render: ({ node }) => (
    <div style={{ padding: '16px' }}>
      <button
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          background: node.props.bgColor,
          color: node.props.textColor,
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {node.props.text}
      </button>
    </div>
  ),
};

// 6. Menu List
export const MenuListComponent: ComponentDefinition = {
  type: 'menu_list',
  label: 'Menyu Siyahısı',
  icon: 'Utensils',
  category: 'content',
  defaultProps: {
    title: 'Seçilmiş Təamlar',
    items: 'Steyk Ribeye - 32 AZN, Caesar Salatı - 14 AZN, Tiramisu - 9 AZN',
  },
  propSchema: {
    title: { type: 'string', label: 'Bölmə Başlığı', category: 'content' },
    items: { type: 'textarea', label: 'Təamlar (Ad - Qiymət, vergüllə)', category: 'content' },
  },
  render: ({ node }) => (
    <div style={{ padding: '24px 16px', background: '#181B1E', borderRadius: 12, margin: '16px 0' }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#D4A574', marginBottom: 16 }}>{node.props.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(node.props.items || '').split(',').map((it: string, i: number) => {
          const parts = it.split('-');
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #383334', paddingBottom: 6 }}>
              <span style={{ color: '#F5F5F7', fontWeight: 500 }}>{parts[0]?.trim()}</span>
              <span style={{ color: '#00D37D', fontWeight: 600 }}>{parts[1]?.trim()}</span>
            </div>
          );
        })}
      </div>
    </div>
  ),
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
    f2Desc: 'Beynəlxalq təcrübəyə malik komanda.',
    f3Title: 'Sürətli Çatdırılma',
    f3Desc: 'İsti yeməklər 30 dəqiqə ərzində ünvanınızda.',
  },
  propSchema: {
    f1Title: { type: 'string', label: '1-ci Başlıq', category: 'content' },
    f1Desc: { type: 'string', label: '1-ci İzah', category: 'content' },
    f2Title: { type: 'string', label: '2-ci Başlıq', category: 'content' },
    f2Desc: { type: 'string', label: '2-ci İzah', category: 'content' },
    f3Title: { type: 'string', label: '3-ci Başlıq', category: 'content' },
    f3Desc: { type: 'string', label: '3-ci İzah', category: 'content' },
  },
  render: ({ node }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '24px 16px' }}>
      {[
        { t: node.props.f1Title, d: node.props.f1Desc },
        { t: node.props.f2Title, d: node.props.f2Desc },
        { t: node.props.f3Title, d: node.props.f3Desc },
      ].map((f, i) => (
        <div key={i} style={{ background: '#1E2022', padding: 20, borderRadius: 10, border: '1px solid #383334' }}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>{f.t}</h4>
          <p style={{ fontSize: 13, color: '#B0B0B8', margin: 0 }}>{f.d}</p>
        </div>
      ))}
    </div>
  ),
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
  render: ({ node }) => (
    <div style={{ padding: '24px', background: 'rgba(212,165,116,0.08)', borderRadius: 12, border: '1px solid rgba(212,165,116,0.2)', margin: '16px' }}>
      <p style={{ fontStyle: 'italic', fontSize: 15, color: '#E2E2E5', marginBottom: 12 }}>“{node.props.review}”</p>
      <div style={{ fontWeight: 700, color: '#D4A574', fontSize: 14 }}>{node.props.author}</div>
      <div style={{ fontSize: 12, color: '#B0B0B8' }}>{node.props.role}</div>
    </div>
  ),
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
  render: ({ node }) => (
    <div style={{ padding: '24px', background: '#181B1E', borderRadius: 12, margin: '16px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 16 }}>{node.props.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input style={{ padding: 10, background: '#121416', border: '1px solid #383334', borderRadius: 8, color: '#FFF' }} placeholder="Adınız" disabled />
        <input style={{ padding: 10, background: '#121416', border: '1px solid #383334', borderRadius: 8, color: '#FFF' }} placeholder="Telefon nömrəniz" disabled />
        <textarea style={{ padding: 10, background: '#121416', border: '1px solid #383334', borderRadius: 8, color: '#FFF', minHeight: 70 }} placeholder="Mesajınız" disabled />
        <button style={{ padding: 10, background: '#00D37D', color: '#000', fontWeight: 600, borderRadius: 8, border: 'none' }}>{node.props.submitText}</button>
      </div>
    </div>
  ),
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
  render: ({ node }) => (
    <div style={{ padding: '24px', background: '#121416', borderRadius: 12, border: '1px solid #383334', textAlign: 'center', margin: '16px' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>📍</div>
      <div style={{ fontWeight: 600, color: '#F5F5F7', fontSize: 15 }}>{node.props.address}</div>
      <p style={{ fontSize: 12, color: '#8888A0', marginTop: 4 }}>İnteraktiv Google Maps yerləşdirməsi</p>
    </div>
  ),
};

// 11. Footer
export const FooterComponent: ComponentDefinition = {
  type: 'footer',
  label: 'Footer / Sonluq',
  icon: 'PanelBottom',
  category: 'layout',
  defaultProps: {
    copyright: '© 2026 Bütün hüquqlar qorunur.',
    poweredBy: 'SiteX tərəfindən hazırlanmışdır.',
    bgColor: '#0C0E10',
    textColor: '#8888A0',
  },
  propSchema: {
    copyright: { type: 'string', label: 'Müəllif Hüququ', category: 'content' },
    poweredBy: { type: 'string', label: 'Platforma Qeydi', category: 'content' },
    bgColor: { type: 'color', label: 'Arxa Fon Rəngi', category: 'style' },
    textColor: { type: 'color', label: 'Mətn Rəngi', category: 'style' },
  },
  render: ({ node }) => (
    <footer style={{ padding: '24px 16px', background: node.props.bgColor, color: node.props.textColor, textAlign: 'center', borderTop: '1px solid #222' }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{node.props.copyright}</p>
      <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.7 }}>{node.props.poweredBy}</p>
    </footer>
  ),
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
  render: ({ node }) => (
    <div style={{ height: Number(node.props.height) || 32, display: 'flex', alignItems: 'center' }}>
      {node.props.showLine && <div style={{ width: '100%', height: 1, background: '#383334' }} />}
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
    <div style={{ padding: Number(node.props.padding) || 20, background: node.props.bgColor, border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8 }}>
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
  render: ({ node }) => (
    <div style={{ padding: '20px 16px' }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 12 }}>{node.props.title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${node.props.columns || 3}, 1fr)`, gap: 10 }}>
        {['1517248135467-4c7edcad34c4', '1555396273-367ea4eb4db5', '1552566626-52f8b828add9'].map((id, i) => (
          <img
            key={i}
            src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`}
            alt="gallery"
            style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }}
          />
        ))}
      </div>
    </div>
  ),
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

