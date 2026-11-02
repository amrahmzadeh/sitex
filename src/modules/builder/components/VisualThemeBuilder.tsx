'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  Component,
  Sliders,
  Layers,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Check,
  Sparkles,
  MousePointer,
  HelpCircle,
} from 'lucide-react';
import { BuilderNode, DeviceMode, GlobalDesignTokens } from '../types';
import { getComponent, listComponents } from '../registry/componentRegistry';
import { DEFAULT_DESIGN_TOKENS } from '../serializer';
import { checkWCAGContrast } from '../../stl/colorUtils';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';

const PALETTE_PRESETS = [
  {
    name: 'Müasir Zümrüd',
    colors: {
      primary: '#00D37D',
      secondary: '#1A1A2E',
      accent: '#D4A574',
      background: '#0F1115',
      surface: '#181B20',
      text: '#F5F5F7',
      mutedText: '#8888A0',
    },
  },
  {
    name: 'Dəbdəbəli Qızılı',
    colors: {
      primary: '#D4AF37',
      secondary: '#121212',
      accent: '#C5A059',
      background: '#0A0A0A',
      surface: '#161616',
      text: '#FFFFFF',
      mutedText: '#999999',
    },
  },
  {
    name: 'Texnoloji Göy',
    colors: {
      primary: '#3B82F6',
      secondary: '#0F172A',
      accent: '#60A5FA',
      background: '#030712',
      surface: '#0B0F17',
      text: '#F8FAFC',
      mutedText: '#94A3B8',
    },
  },
  {
    name: 'İsti Kafe',
    colors: {
      primary: '#E07A5F',
      secondary: '#3D405B',
      accent: '#F2CC8F',
      background: '#2B2D42',
      surface: '#34374C',
      text: '#F4F1DE',
      mutedText: '#A8A29E',
    },
  },
];

const MODULAR_SCALES = [
  { label: '1.125 (Major Second)', scale: 1.125 },
  { label: '1.200 (Minor Third)', scale: 1.200 },
  { label: '1.250 (Major Third)', scale: 1.250 },
  { label: '1.333 (Perfect Fourth)', scale: 1.333 },
];

interface VisualThemeBuilderProps {
  tokens: GlobalDesignTokens;
  onUpdateTokens: (newTokens: GlobalDesignTokens) => void;
  nodes: BuilderNode[];
  onUpdateNodes: (nodes: BuilderNode[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  device: DeviceMode;
  onSetDevice: (device: DeviceMode) => void;
  onAddNode: (type: string, index?: number) => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down') => void;
  onUpdateNodeProps: (id: string, newProps: Record<string, any>) => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Outfit',
  'Playfair Display',
  'Poppins',
  'Merriweather',
  'Source Sans 3',
  'Raleway',
  'Montserrat',
  'Plus Jakarta Sans',
  'Cinzel',
];

export function VisualThemeBuilder({
  tokens,
  onUpdateTokens,
  nodes,
  onUpdateNodes,
  selectedNodeId,
  onSelectNode,
  device,
  onSetDevice,
  onAddNode,
  onDuplicateNode,
  onDeleteNode,
  onMoveNode,
  onUpdateNodeProps,
}: VisualThemeBuilderProps) {
  const [activePanelTab, setActivePanelTab] = useState<'global' | 'layout' | 'components' | 'sections'>('global');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [modularScale, setModularScale] = useState(1.2);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const textContrast = checkWCAGContrast(tokens.colors.text, tokens.colors.background);

  const filteredFonts = FONT_OPTIONS.filter((f) =>
    f.toLowerCase().includes(fontSearchQuery.toLowerCase())
  );

  const handleApplyPreset = (presetColors: GlobalDesignTokens['colors']) => {
    onUpdateTokens({
      ...tokens,
      colors: { ...presetColors },
    });
  };

  const handleResetTokens = () => {
    onUpdateTokens(DEFAULT_DESIGN_TOKENS);
  };

  const updateColor = (key: keyof GlobalDesignTokens['colors'], value: string) => {
    onUpdateTokens({
      ...tokens,
      colors: {
        ...tokens.colors,
        [key]: value,
      },
    });
  };

  const updateTypography = (key: keyof GlobalDesignTokens['typography'], value: string) => {
    onUpdateTokens({
      ...tokens,
      typography: {
        ...tokens.typography,
        [key]: value,
      },
    });
  };

  const updateLayout = (key: keyof GlobalDesignTokens['layout'], value: string) => {
    onUpdateTokens({
      ...tokens,
      layout: {
        ...tokens.layout,
        [key]: value,
      },
    });
  };

  const updateHeaderStyle = (style: GlobalDesignTokens['header']['style']) => {
    onUpdateTokens({
      ...tokens,
      header: {
        ...tokens.header,
        style,
      },
    });
  };

  const updateFooterStyle = (style: GlobalDesignTokens['footer']['style']) => {
    onUpdateTokens({
      ...tokens,
      footer: {
        ...tokens.footer,
        style,
      },
    });
  };

  const updateComponentToken = (
    component: keyof GlobalDesignTokens['components'],
    field: string,
    value: any
  ) => {
    onUpdateTokens({
      ...tokens,
      components: {
        ...tokens.components,
        [component]: {
          ...tokens.components[component],
          [field]: value,
        },
      },
    });
  };

  return (
    <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', overflow: 'hidden', background: '#0D0E11' }}>
      {/* Visual Builder Left Sidebar */}
      <div
        style={{
          width: 340,
          background: '#13151A',
          borderRight: '1px solid #22262E',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}
      >
        {/* Sub-tab Navigation */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: '1px solid #22262E',
            background: '#0F1014',
          }}
        >
          <button
            type="button"
            onClick={() => setActivePanelTab('global')}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: activePanelTab === 'global' ? '#181A20' : 'transparent',
              color: activePanelTab === 'global' ? '#00D37D' : '#8888A0',
              borderBottom: activePanelTab === 'global' ? '2px solid #00D37D' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Palette size={16} />
            Qlobal
          </button>
          <button
            type="button"
            onClick={() => setActivePanelTab('layout')}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: activePanelTab === 'layout' ? '#181A20' : 'transparent',
              color: activePanelTab === 'layout' ? '#00D37D' : '#8888A0',
              borderBottom: activePanelTab === 'layout' ? '2px solid #00D37D' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Layout size={16} />
            Tərtibat
          </button>
          <button
            type="button"
            onClick={() => setActivePanelTab('components')}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: activePanelTab === 'components' ? '#181A20' : 'transparent',
              color: activePanelTab === 'components' ? '#00D37D' : '#8888A0',
              borderBottom: activePanelTab === 'components' ? '2px solid #00D37D' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Sliders size={16} />
            Stillər
          </button>
          <button
            type="button"
            onClick={() => setActivePanelTab('sections')}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: activePanelTab === 'sections' ? '#181A20' : 'transparent',
              color: activePanelTab === 'sections' ? '#00D37D' : '#8888A0',
              borderBottom: activePanelTab === 'sections' ? '2px solid #00D37D' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Layers size={16} />
            Bölmələr
          </button>
        </div>

        {/* Panel Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* TAB 1: GLOBAL DESIGN */}
          {activePanelTab === 'global' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Reset to Default Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleResetTokens}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid #333842',
                    background: 'transparent',
                    color: '#8888A0',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Mənbə Temaya Qayıt (Sıfırla)
                </button>
              </div>

              {/* Palette Presets */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Palitra Təklifləri
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {PALETTE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleApplyPreset(p.colors)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 6,
                        border: '1px solid #282C35',
                        background: '#16181E',
                        color: '#C0C0D0',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: p.colors.primary,
                          display: 'inline-block',
                        }}
                      />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast Score Indicator */}
              {textContrast && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: textContrast.aaPass ? 'rgba(0,211,125,0.08)' : 'rgba(239,68,68,0.08)',
                    border: textContrast.aaPass ? '1px solid rgba(0,211,125,0.2)' : '1px solid rgba(239,68,68,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, color: textContrast.aaPass ? '#00D37D' : '#EF4444', fontWeight: 600 }}>
                    WCAG Kontrast Nisbəti: {textContrast.ratio}:1
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: textContrast.aaPass ? '#00D37D' : '#EF4444',
                      color: '#000',
                    }}
                  >
                    {textContrast.aaaPass ? 'AAA Əla' : textContrast.aaPass ? 'AA Qəbul' : 'Zəif'}
                  </span>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Rəng Palitrası
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: 'primary', label: 'Əsas Rəng (Primary)' },
                    { key: 'secondary', label: 'İkinci dərəcəli (Secondary)' },
                    { key: 'accent', label: 'Vurğu Rəngi (Accent)' },
                    { key: 'background', label: 'Arxa Fon (Background)' },
                    { key: 'surface', label: 'Kart və Səth (Surface)' },
                    { key: 'text', label: 'Mətn Rəngi (Text)' },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        border: '1px solid #22262E',
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#C0C0D0' }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>
                          {tokens.colors[key as keyof GlobalDesignTokens['colors']]}
                        </span>
                        <input
                          type="color"
                          value={tokens.colors[key as keyof GlobalDesignTokens['colors']]?.slice(0, 7) || '#000000'}
                          onChange={(e) => updateColor(key as any, e.target.value)}
                          style={{
                            width: 28,
                            height: 28,
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: 'transparent',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Tipoqrafiya
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#8888A0', marginBottom: 6 }}>
                      Başlıq Şrifti (Heading)
                    </label>
                    <select
                      className="dash-input"
                      value={tokens.typography.headingFont}
                      onChange={(e) => updateTypography('headingFont', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#8888A0', marginBottom: 6 }}>
                      Mətn Şrifti (Body)
                    </label>
                    <select
                      className="dash-input"
                      value={tokens.typography.bodyFont}
                      onChange={(e) => updateTypography('bodyFont', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#8888A0', marginBottom: 6 }}>
                      Baza Ölçü ({tokens.typography.baseSize})
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={20}
                      value={parseInt(tokens.typography.baseSize) || 16}
                      onChange={(e) => updateTypography('baseSize', `${e.target.value}px`)}
                      style={{ width: '100%', accentColor: '#00D37D' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#8888A0', marginBottom: 6 }}>
                      Modullu Şrift Şkalası (Modular Scale)
                    </label>
                    <select
                      className="dash-input"
                      value={modularScale}
                      onChange={(e) => setModularScale(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    >
                      {MODULAR_SCALES.map((s) => (
                        <option key={s.scale} value={s.scale}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Qlobal Forma & Radius
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#8888A0' }}>Künc Yuvarlaqlığı</span>
                      <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.layout.borderRadius}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={parseInt(tokens.layout.borderRadius) || 12}
                      onChange={(e) => updateLayout('borderRadius', `${e.target.value}px`)}
                      style={{ width: '100%', accentColor: '#00D37D' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#8888A0' }}>Konteyner Maksimum Eni</span>
                      <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.layout.containerWidth}</span>
                    </div>
                    <select
                      className="dash-input"
                      value={tokens.layout.containerWidth}
                      onChange={(e) => updateLayout('containerWidth', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="1024px">Kompakt (1024px)</option>
                      <option value="1200px">Standart (1200px)</option>
                      <option value="1320px">Geniş (1320px)</option>
                      <option value="100%">Tam Ekran (100%)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAYOUT BUILDER */}
          {activePanelTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Header & Naviqasiya
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {[
                    { id: 'transparent', label: 'Şəffaf' },
                    { id: 'glass', label: 'Şüşə (Glass)' },
                    { id: 'solid', label: 'Bütöv (Solid)' },
                    { id: 'sticky', label: 'Yapışqan (Sticky)' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateHeaderStyle(item.id as any)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: tokens.header.style === item.id ? '1px solid #00D37D' : '1px solid #22262E',
                        background: tokens.header.style === item.id ? 'rgba(0,211,125,0.12)' : 'rgba(255,255,255,0.02)',
                        color: tokens.header.style === item.id ? '#00D37D' : '#8888A0',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Footer Dizaynı
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {[
                    { id: 'dark', label: 'Qaranlıq (Dark)' },
                    { id: 'light', label: 'Açıq (Light)' },
                    { id: 'accent', label: 'Vurğu (Accent)' },
                    { id: 'minimal', label: 'Minimal' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateFooterStyle(item.id as any)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: tokens.footer.style === item.id ? '1px solid #00D37D' : '1px solid #22262E',
                        background: tokens.footer.style === item.id ? 'rgba(0,211,125,0.12)' : 'rgba(255,255,255,0.02)',
                        color: tokens.footer.style === item.id ? '#00D37D' : '#8888A0',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Şəbəkə & Kənar Boşluqlar
                </h4>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: '#8888A0' }}>Seksiyalararası Boşluq</span>
                    <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.layout.spacing}</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={32}
                    step={4}
                    value={parseInt(tokens.layout.spacing) || 16}
                    onChange={(e) => updateLayout('spacing', `${e.target.value}px`)}
                    style={{ width: '100%', accentColor: '#00D37D' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPONENT STYLING */}
          {activePanelTab === 'components' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Düymələr (Buttons)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{ fontSize: 12, color: '#8888A0' }}>Düymə Növü</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {(['solid', 'outline', 'ghost', 'soft', 'pill'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateComponentToken('button', 'style', style)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: tokens.components.button.style === style ? '1px solid #00D37D' : '1px solid #22262E',
                          background: tokens.components.button.style === style ? 'rgba(0,211,125,0.12)' : 'transparent',
                          color: tokens.components.button.style === style ? '#00D37D' : '#8888A0',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: '#8888A0', display: 'block', marginBottom: 4 }}>
                      Düymə Küncləri: {tokens.components.button.radius}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={24}
                      value={parseInt(tokens.components.button.radius) || 8}
                      onChange={(e) => updateComponentToken('button', 'radius', `${e.target.value}px`)}
                      style={{ width: '100%', accentColor: '#00D37D' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Kartlar (Cards)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label style={{ fontSize: 12, color: '#8888A0' }}>Kart Stil Növü</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {(['elevated', 'flat', 'bordered'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updateComponentToken('card', 'style', style)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: tokens.components.card.style === style ? '1px solid #00D37D' : '1px solid #22262E',
                          background: tokens.components.card.style === style ? 'rgba(0,211,125,0.12)' : 'transparent',
                          color: tokens.components.card.style === style ? '#00D37D' : '#8888A0',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F0F0F3', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Form & Daxiletmə Sahələri (Inputs)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {(['solid', 'subtle', 'pill'] as const).map((bStyle) => (
                      <button
                        key={bStyle}
                        type="button"
                        onClick={() => updateComponentToken('input', 'borderStyle', bStyle)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: tokens.components.input.borderStyle === bStyle ? '1px solid #00D37D' : '1px solid #22262E',
                          background: tokens.components.input.borderStyle === bStyle ? 'rgba(0,211,125,0.12)' : 'transparent',
                          color: tokens.components.input.borderStyle === bStyle ? '#00D37D' : '#8888A0',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {bStyle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECTIONS & NODES */}
          {activePanelTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F7' }}>Səhifə Bölmələri ({nodes.length})</span>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#00D37D',
                    color: '#000',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  Bölmə Əlavə Et
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nodes.map((node, index) => {
                  const def = getComponent(node.type);
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: isSelected ? 'rgba(0,211,125,0.1)' : '#181B20',
                        border: isSelected ? '1px solid #00D37D' : '1px solid #282C32',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#8888A0', width: 16 }}>{index + 1}.</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#00D37D' : '#F5F5F7' }}>
                          {def?.label || node.type}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onMoveNode(node.id, 'up')}
                          disabled={index === 0}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: index === 0 ? '#444' : '#8888A0',
                            padding: 4,
                            cursor: index === 0 ? 'default' : 'pointer',
                          }}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveNode(node.id, 'down')}
                          disabled={index === nodes.length - 1}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: index === nodes.length - 1 ? '#444' : '#8888A0',
                            padding: 4,
                            cursor: index === nodes.length - 1 ? 'default' : 'pointer',
                          }}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateNode(node.id)}
                          style={{ background: 'transparent', border: 'none', color: '#8888A0', padding: 4, cursor: 'pointer' }}
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNode(node.id)}
                          style={{ background: 'transparent', border: 'none', color: '#EF4444', padding: 4, cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Canvas (Center Area) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Device Switcher Header */}
        <div
          style={{
            height: 44,
            background: '#13151A',
            borderBottom: '1px solid #22262E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', background: '#0B0C0E', padding: 3, borderRadius: 8, border: '1px solid #22262E' }}>
            <button
              type="button"
              onClick={() => onSetDevice('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: device === 'desktop' ? '#1F232B' : 'transparent',
                color: device === 'desktop' ? '#00D37D' : '#8888A0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Monitor size={14} />
              Desktop (100%)
            </button>
            <button
              type="button"
              onClick={() => onSetDevice('tablet')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: device === 'tablet' ? '#1F232B' : 'transparent',
                color: device === 'tablet' ? '#00D37D' : '#8888A0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Tablet size={14} />
              Planşet (768px)
            </button>
            <button
              type="button"
              onClick={() => onSetDevice('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 6,
                border: 'none',
                background: device === 'mobile' ? '#1F232B' : 'transparent',
                color: device === 'mobile' ? '#00D37D' : '#8888A0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Smartphone size={14} />
              Mobil (375px)
            </button>
          </div>
        </div>

        {/* The Live Interactive Canvas */}
        <Canvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          device={device}
          onDropComponent={onAddNode}
        />
      </div>

      {/* Right Properties Panel when an item is selected */}
      {selectedNode && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateProps={onUpdateNodeProps}
          onDeleteNode={onDeleteNode}
          onDuplicateNode={onDuplicateNode}
          onMoveNode={onMoveNode}
        />
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddSectionModal(false)}
        >
          <div
            style={{
              width: 540,
              maxHeight: '80vh',
              background: '#16181D',
              borderRadius: 16,
              border: '1px solid #282C35',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>Yeni Bölmə Əlavə Et</h3>
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#8888A0', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, overflowY: 'auto', paddingRight: 4 }}>
              {listComponents().map((comp) => (
                <button
                  key={comp.type}
                  type="button"
                  onClick={() => {
                    onAddNode(comp.type);
                    setShowAddSectionModal(false);
                  }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: '#1D2026',
                    border: '1px solid #2A2E38',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00D37D';
                    e.currentTarget.style.background = '#22262E';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2A2E38';
                    e.currentTarget.style.background = '#1D2026';
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{comp.label}</span>
                  <span style={{ fontSize: 11, color: '#8888A0', textTransform: 'capitalize' }}>Kateqoriya: {comp.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

