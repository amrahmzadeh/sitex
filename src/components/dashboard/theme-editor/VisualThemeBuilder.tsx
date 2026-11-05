'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  Layers,
  Sparkles,
  Sliders,
  RotateCcw,
  Undo2,
  Redo2,
  ChevronRight,
  Maximize2,
  Eye,
  Check,
  Shield,
  Square,
  Circle,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { ThemeConfig, BRAND_FONTS } from '@/lib/themes';
import { ComponentTarget } from './types';

interface VisualThemeBuilderProps {
  theme: ThemeConfig;
  onChange: (updated: ThemeConfig) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedComponent: ComponentTarget;
  onSelectComponent: (comp: ComponentTarget) => void;
}

const GOOGLE_FONTS = [
  'Outfit',
  'Inter',
  'Playfair Display',
  'Poppins',
  'Merriweather',
  'Source Sans 3',
  'Lora',
  'Raleway',
  'Cinzel',
  'Cormorant Garamond',
  'Montserrat',
  'Lobster',
  'Pacifico',
  'Abril Fatface',
];

const PRESET_PALETTES = [
  { name: 'Emerald Luxe', primary: '#00D37D', secondary: '#1A1A2E', accent: '#D4A574', bg: '#0D0F12', text: '#FFFFFF' },
  { name: 'Royal Indigo', primary: '#6366F1', secondary: '#0F172A', accent: '#F59E0B', bg: '#FFFFFF', text: '#1E293B' },
  { name: 'Sunset Amber', primary: '#FF6B35', secondary: '#2D1B36', accent: '#F7C59F', bg: '#18121E', text: '#F5F5F7' },
  { name: 'Velvet Rose', primary: '#E11D48', secondary: '#1E1B4B', accent: '#FDA4AF', bg: '#0F0E17', text: '#FFFFFE' },
  { name: 'Nordic Clean', primary: '#0284C7', secondary: '#0F172A', accent: '#38BDF8', bg: '#FFFFFF', text: '#0F172A' },
  { name: 'Warm Mocha', primary: '#C49A6C', secondary: '#2C221E', accent: '#DDB892', bg: '#1B1412', text: '#FDFBF7' },
];

export default function VisualThemeBuilder({
  theme,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  selectedComponent,
  onSelectComponent,
}: VisualThemeBuilderProps) {
  const [activeCategory, setActiveCategory] = useState<'global' | 'layout' | 'components'>('global');

  const updateProp = <K extends keyof ThemeConfig>(key: K, val: ThemeConfig[K]) => {
    onChange({
      ...theme,
      [key]: val,
    });
  };

  const sanitizeColor = (c?: string) => {
    if (!c) return '#000000';
    if (c.startsWith('#')) return c.slice(0, 7);
    return '#000000';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#161822',
        borderRadius: 12,
        border: '1px solid #282A3A',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
      }}
    >
      {/* Top Header & History Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#1B1E2B',
          borderBottom: '1px solid #282A3A',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Geri Qaytar (Ctrl+Z)"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #2D3145',
              background: canUndo ? '#232738' : 'rgba(255,255,255,0.02)',
              color: canUndo ? '#F0F2F8' : '#55586D',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
          >
            <Undo2 size={13} />
            Geri
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="İrəli (Ctrl+Y)"
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #2D3145',
              background: canRedo ? '#232738' : 'rgba(255,255,255,0.02)',
              color: canRedo ? '#F0F2F8' : '#55586D',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
            }}
          >
            <Redo2 size={13} />
            İrəli
          </button>
        </div>

        {/* Component Focus Quick Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#8888A0' }}>Fokus:</span>
          <select
            value={selectedComponent}
            onChange={(e) => onSelectComponent(e.target.value as ComponentTarget)}
            style={{
              background: '#232738',
              border: '1px solid #33374D',
              color: '#00D37D',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">Bütün Elementlər</option>
            <option value="header">Başlıq & Loqo</option>
            <option value="navigation">Naviqasiya</option>
            <option value="buttons">Düymələr</option>
            <option value="cards">Kartlar</option>
            <option value="inputs">Formalar</option>
            <option value="footer">Footer</option>
          </select>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderBottom: '1px solid #282A3A',
          background: '#141620',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveCategory('global')}
          style={{
            padding: '10px 8px',
            border: 'none',
            borderBottom: activeCategory === 'global' ? '2px solid #00D37D' : '2px solid transparent',
            background: activeCategory === 'global' ? 'rgba(0,211,125,0.08)' : 'transparent',
            color: activeCategory === 'global' ? '#00D37D' : '#8888A0',
            fontWeight: activeCategory === 'global' ? 600 : 500,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Palette size={14} />
          Qlobal Dizayn
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('layout')}
          style={{
            padding: '10px 8px',
            border: 'none',
            borderBottom: activeCategory === 'layout' ? '2px solid #7C5CFC' : '2px solid transparent',
            background: activeCategory === 'layout' ? 'rgba(124,92,252,0.08)' : 'transparent',
            color: activeCategory === 'layout' ? '#A78BFA' : '#8888A0',
            fontWeight: activeCategory === 'layout' ? 600 : 500,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Layout size={14} />
          Tərtibat
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('components')}
          style={{
            padding: '10px 8px',
            border: 'none',
            borderBottom: activeCategory === 'components' ? '2px solid #38BDF8' : '2px solid transparent',
            background: activeCategory === 'components' ? 'rgba(56,189,248,0.08)' : 'transparent',
            color: activeCategory === 'components' ? '#38BDF8' : '#8888A0',
            fontWeight: activeCategory === 'components' ? 600 : 500,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Layers size={14} />
          Komponentlər
        </button>
      </div>

      {/* Control Panels Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* ================= GLOBAL DESIGN PANEL ================= */}
        {activeCategory === 'global' && (
          <>
            {/* Quick Presets */}
            <div style={{ background: '#1C1F2E', padding: 12, borderRadius: 10, border: '1px solid #2B2F44' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E0E2EC', display: 'block', marginBottom: 8 }}>
                Hazır Rəng Palitraları
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      onChange({
                        ...theme,
                        primaryColor: p.primary,
                        secondaryColor: p.secondary,
                        accentColor: p.accent,
                        backgroundColor: p.bg,
                        textColor: p.text,
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 8px',
                      background: '#151722',
                      border: '1px solid #282A3A',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 2 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.primary }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.accent }} />
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.bg }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#D0D2DE', fontWeight: 500 }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00D37D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Əsas Rənglər
              </span>

              {[
                { label: 'Əsas Rəng (Primary)', key: 'primaryColor', val: theme.primaryColor || '#00D37D' },
                { label: 'İkinci Rəng (Secondary)', key: 'secondaryColor', val: theme.secondaryColor || '#1A1A2E' },
                { label: 'Vurğu Rəngi (Accent)', key: 'accentColor', val: theme.accentColor || '#D4A574' },
                { label: 'Arxa Fon Rəngi (Background)', key: 'backgroundColor', val: theme.backgroundColor || '#FFFFFF' },
                { label: 'Mətn Rəngi (Text)', key: 'textColor', val: theme.textColor || '#111315' },
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: '#1A1D2B',
                    border: '1px solid #2B2F44',
                  }}
                >
                  <label style={{ fontSize: 12, color: '#C8CAD8', fontWeight: 500 }}>{item.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>{item.val}</span>
                    <input
                      type="color"
                      value={sanitizeColor(item.val)}
                      onChange={(e) => updateProp(item.key as keyof ThemeConfig, e.target.value)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Typography */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7C5CFC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tipoqrafiya & Şriftlər
              </span>

              {/* Heading Font */}
              <div style={{ background: '#1A1D2B', padding: 10, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>Başlıq Şrifti</label>
                <select
                  value={theme.headingFont || 'Outfit'}
                  onChange={(e) => updateProp('headingFont', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Body Font */}
              <div style={{ background: '#1A1D2B', padding: 10, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>Əsas Mətn Şrifti</label>
                <select
                  value={theme.bodyFont || 'Inter'}
                  onChange={(e) => updateProp('bodyFont', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Accent Font */}
              <div style={{ background: '#1A1D2B', padding: 10, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>Brend Xüsusi Şrifti</label>
                <select
                  value={theme.brandFont || ''}
                  onChange={(e) => updateProp('brandFont', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 6,
                    color: '#FFFFFF',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  <option value="">Standart (Başlıq şrifti ilə eyni)</option>
                  {BRAND_FONTS.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Global Shape & Radii */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Forma & Künc Yuvarlaqlığı
              </span>

              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, color: '#C8CAD8' }}>Qlobal Künc Radiusu</label>
                  <span style={{ fontSize: 12, color: '#00D37D', fontWeight: 600 }}>{theme.borderRadius || '12px'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                  {['0px', '4px', '8px', '12px', '16px', '24px'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateProp('borderRadius', r)}
                      style={{
                        padding: '6px 4px',
                        background: theme.borderRadius === r ? 'rgba(0,211,125,0.2)' : '#131520',
                        border: theme.borderRadius === r ? '1px solid #00D37D' : '1px solid #33374D',
                        borderRadius: 6,
                        color: theme.borderRadius === r ? '#00D37D' : '#8888A0',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= LAYOUT BUILDER PANEL ================= */}
        {activeCategory === 'layout' && (
          <>
            {/* Header / Navbar Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00D37D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Başlıq & Naviqasiya (Header)
              </span>

              {/* Header Style */}
              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 8 }}>Başlıq Görünüşü</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'transparent', label: 'Şəffaf' },
                    { id: 'solid', label: 'Bütöv (Solid)' },
                    { id: 'glass', label: 'Şüşə (Glass)' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => updateProp('headerStyle', h.id as any)}
                      style={{
                        padding: '8px 6px',
                        background: theme.headerStyle === h.id ? 'rgba(0,211,125,0.2)' : '#131520',
                        border: theme.headerStyle === h.id ? '1px solid #00D37D' : '1px solid #33374D',
                        borderRadius: 6,
                        color: theme.headerStyle === h.id ? '#00D37D' : '#8888A0',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Controls */}
              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, color: '#C8CAD8' }}>Naviqasiya Loqo Ölçüsü</label>
                  <span style={{ fontSize: 12, color: '#00D37D', fontWeight: 600 }}>{theme.navLogoSize || 42}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={theme.navLogoSize || 42}
                  onChange={(e) => updateProp('navLogoSize', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#00D37D', cursor: 'pointer' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: '#C8CAD8' }}>Loqo Çərçivəsi (Frame)</label>
                  <input
                    type="checkbox"
                    checked={theme.logoHasFrame || false}
                    onChange={(e) => updateProp('logoHasFrame', e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#00D37D', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Site Background (Solid vs Gradient) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7C5CFC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Saytın Ümumi Arxa Fonu
              </span>

              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: '#C8CAD8' }}>Fon Növü</label>
                  <div style={{ display: 'flex', background: '#131520', borderRadius: 6, padding: 2 }}>
                    <button
                      type="button"
                      onClick={() => updateProp('siteBgType', 'solid')}
                      style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: 4,
                        background: (theme.siteBgType || 'solid') === 'solid' ? '#7C5CFC' : 'transparent',
                        color: (theme.siteBgType || 'solid') === 'solid' ? '#fff' : '#8888A0',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Bütöv
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProp('siteBgType', 'gradient')}
                      style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: 4,
                        background: theme.siteBgType === 'gradient' ? '#7C5CFC' : 'transparent',
                        color: theme.siteBgType === 'gradient' ? '#fff' : '#8888A0',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Qradiyent
                    </button>
                  </div>
                </div>

                {theme.siteBgType === 'gradient' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#8888A0' }}>Başlanğıc (From):</span>
                      <input
                        type="color"
                        value={sanitizeColor(theme.siteGradientFrom || '#1A1A2E')}
                        onChange={(e) => updateProp('siteGradientFrom', e.target.value)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#8888A0' }}>Son (To):</span>
                      <input
                        type="color"
                        value={sanitizeColor(theme.siteGradientTo || '#121416')}
                        onChange={(e) => updateProp('siteGradientTo', e.target.value)}
                        style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#8888A0' }}>Fon Rəngi:</span>
                    <input
                      type="color"
                      value={sanitizeColor(theme.siteBgColor || theme.backgroundColor || '#FFFFFF')}
                      onChange={(e) => {
                        updateProp('siteBgColor', e.target.value);
                        updateProp('backgroundColor', e.target.value);
                      }}
                      style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Aşağı Hissə (Footer)
              </span>

              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 8 }}>Footer Üslubu</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'dark', label: 'Tünd' },
                    { id: 'light', label: 'Açıq' },
                    { id: 'accent', label: 'Vurğu' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => updateProp('footerStyle', f.id as any)}
                      style={{
                        padding: '8px 6px',
                        background: theme.footerStyle === f.id ? 'rgba(56,189,248,0.2)' : '#131520',
                        border: theme.footerStyle === f.id ? '1px solid #38BDF8' : '1px solid #33374D',
                        borderRadius: 6,
                        color: theme.footerStyle === f.id ? '#38BDF8' : '#8888A0',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>Footer Şüarı (Loqo altı)</label>
                  <textarea
                    rows={2}
                    value={theme.footerTagline || ''}
                    onChange={(e) => updateProp('footerTagline', e.target.value)}
                    placeholder="Loqo altındakı qısa şüar..."
                    style={{
                      width: '100%',
                      background: '#131520',
                      border: '1px solid #33374D',
                      borderRadius: 6,
                      padding: '8px 10px',
                      color: '#F7F8F9',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= COMPONENT STYLING PANEL ================= */}
        {activeCategory === 'components' && (
          <>
            {/* Button Component */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00D37D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Düymələr (Buttons)
              </span>

              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 8 }}>Əsas Düymə Tərzi</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
                  {[
                    { id: 'solid', label: 'Dolu (Solid)' },
                    { id: 'outline', label: 'Kontur (Outline)' },
                    { id: 'ghost', label: 'Şəffaf (Ghost)' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => updateProp('buttonStyle', b.id as any)}
                      style={{
                        padding: '8px 4px',
                        background: theme.buttonStyle === b.id ? 'rgba(0,211,125,0.2)' : '#131520',
                        border: theme.buttonStyle === b.id ? '1px solid #00D37D' : '1px solid #33374D',
                        borderRadius: 6,
                        color: theme.buttonStyle === b.id ? '#00D37D' : '#8888A0',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Button live interactive preview */}
                <div
                  style={{
                    padding: 12,
                    background: '#12141C',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: '8px 18px',
                      borderRadius: theme.borderRadius || '8px',
                      background:
                        theme.buttonStyle === 'solid'
                          ? theme.primaryColor || '#00D37D'
                          : theme.buttonStyle === 'outline'
                          ? 'transparent'
                          : 'rgba(255,255,255,0.06)',
                      border:
                        theme.buttonStyle === 'outline'
                          ? `1.5px solid ${theme.primaryColor || '#00D37D'}`
                          : 'none',
                      color: theme.buttonStyle === 'outline' ? theme.primaryColor : '#000000',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'default',
                    }}
                  >
                    Nümunə Düymə
                  </button>
                </div>
              </div>
            </div>

            {/* Cards Component */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7C5CFC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kartlar & Qutular (Cards)
              </span>

              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 8 }}>Kart Üslubu</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'elevated', label: 'Qabarıq' },
                    { id: 'flat', label: 'Düz' },
                    { id: 'bordered', label: 'Çərçivəli' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateProp('cardStyle', c.id as any)}
                      style={{
                        padding: '8px 4px',
                        background: theme.cardStyle === c.id ? 'rgba(124,92,252,0.2)' : '#131520',
                        border: theme.cardStyle === c.id ? '1px solid #7C5CFC' : '1px solid #33374D',
                        borderRadius: 6,
                        color: theme.cardStyle === c.id ? '#C4B5FD' : '#8888A0',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp Floating Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#25D366', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                WhatsApp Sifariş Düyməsi
              </span>

              <div style={{ background: '#1A1D2B', padding: 12, borderRadius: 8, border: '1px solid #2B2F44' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 12, color: '#C8CAD8' }}>WhatsApp Düymə Rəngi</label>
                  <input
                    type="color"
                    value={sanitizeColor(theme.whatsappColor || '#25D366')}
                    onChange={(e) => updateProp('whatsappColor', e.target.value)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
