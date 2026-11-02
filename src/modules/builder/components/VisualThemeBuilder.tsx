'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Layout,
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
  Check,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { BuilderNode, DeviceMode, GlobalDesignTokens } from '../types';
import { listComponents } from '../registry/componentRegistry';
import '../registry/builtinComponents';
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
  const [searchParam, setSearchParam] = useState('');
  const [modularScale, setModularScale] = useState(1.2);

  // Sidebar width & collapse states
  const [sidebarWidth, setSidebarWidth] = useState<number>(340);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDraggingRef = useRef(false);

  // Restore sidebar width from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sitex_builder_sidebar_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 280 && parsed <= 450) {
        setSidebarWidth(parsed);
      }
    }
  }, []);

  // Keyboard shortcut '[' to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '[' &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle resizing drag
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(420, Math.max(300, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      localStorage.setItem('sitex_builder_sidebar_width', String(sidebarWidth));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;
  const textContrast = checkWCAGContrast(tokens.colors.text, tokens.colors.background);

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

  // Color row definition with 44px standard height
  const renderColorRow = (
    key: keyof GlobalDesignTokens['colors'],
    label: string,
    checkAgainstBg = true
  ) => {
    if (searchParam && !label.toLowerCase().includes(searchParam.toLowerCase())) {
      return null;
    }
    const val = tokens.colors[key] || '#000000';
    const contrast = checkAgainstBg ? checkWCAGContrast(val, tokens.colors.background) : null;

    return (
      <div
        key={key}
        style={{
          height: 44,
          minHeight: 44,
          maxHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: '#12141A',
          borderRadius: 8,
          border: '1px solid #20242E',
          marginBottom: 8,
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease',
        }}
      >
        <span style={{ fontSize: 13, color: '#E2E5EE', fontWeight: 500 }}>{label}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {contrast && (
            <span
              title={`Kontrast nisbəti: ${contrast.ratio}:1`}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: 4,
                background: contrast.aaPass ? 'rgba(0, 211, 125, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: contrast.aaPass ? '#00D37D' : '#EF4444',
                border: contrast.aaPass ? '1px solid rgba(0, 211, 125, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              {contrast.aaaPass ? 'AAA' : contrast.aaPass ? 'AA' : 'Fail'}
            </span>
          )}

          <span
            style={{
              fontSize: 11,
              color: '#8A8F9E',
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {val.slice(0, 7)}
          </span>

          <label
            title="Rəngi dəyişdir"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: val,
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              display: 'inline-block',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            <input
              type="color"
              value={val.slice(0, 7)}
              onChange={(e) => updateColor(key, e.target.value)}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .sitex-custom-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .sitex-custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sitex-custom-scroll::-webkit-scrollbar-thumb {
          background: #252A36;
          border-radius: 10px;
        }
        .sitex-custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #353C4D;
        }
        .sitex-panel-tab {
          height: 44px;
          border: none;
          background: transparent;
          color: #8A8F9E;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.15s ease;
          outline: none;
        }
        .sitex-panel-tab:hover {
          color: #E2E5EE;
          background: rgba(255,255,255,0.02);
        }
        .sitex-panel-tab:focus-visible {
          box-shadow: inset 0 0 0 2px #00D37D;
        }
        .sitex-panel-tab.active {
          color: #00D37D;
          border-bottom-color: #00D37D;
          background: #14171E;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          background: '#090A0D',
          position: 'relative',
        }}
      >
        {/* SOL PANEL (320-360px resizable / collapsible) */}
        {!isCollapsed ? (
          <aside
            role="region"
            aria-label="Tema vizual tənzimləmə paneli"
            style={{
              width: sidebarWidth,
              minWidth: 300,
              maxWidth: 420,
              background: '#0D0F14',
              borderRight: '1px solid #1E222B',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              position: 'relative',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            {/* 1. Sticky 44px Sub-tabs */}
            <div
              role="tablist"
              aria-label="Panel bölmələri"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderBottom: '1px solid #1E222B',
                background: '#0A0B0F',
                position: 'sticky',
                top: 0,
                zIndex: 20,
                height: 44,
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                role="tab"
                id="panel-tab-global"
                aria-selected={activePanelTab === 'global'}
                aria-controls="panel-content-global"
                onClick={() => setActivePanelTab('global')}
                className={`sitex-panel-tab ${activePanelTab === 'global' ? 'active' : ''}`}
                title="Qlobal Rəng və Şrift Parametrləri"
              >
                <Palette size={14} />
                <span>Qlobal</span>
              </button>
              <button
                type="button"
                role="tab"
                id="panel-tab-layout"
                aria-selected={activePanelTab === 'layout'}
                aria-controls="panel-content-layout"
                onClick={() => setActivePanelTab('layout')}
                className={`sitex-panel-tab ${activePanelTab === 'layout' ? 'active' : ''}`}
                title="Tərtibat və Şəbəkə Parametrləri"
              >
                <Layout size={14} />
                <span>Tərtibat</span>
              </button>
              <button
                type="button"
                role="tab"
                id="panel-tab-components"
                aria-selected={activePanelTab === 'components'}
                aria-controls="panel-content-components"
                onClick={() => setActivePanelTab('components')}
                className={`sitex-panel-tab ${activePanelTab === 'components' ? 'active' : ''}`}
                title="Komponent Stilləri"
              >
                <Sliders size={14} />
                <span>Stillər</span>
              </button>
              <button
                type="button"
                role="tab"
                id="panel-tab-sections"
                aria-selected={activePanelTab === 'sections'}
                aria-controls="panel-content-sections"
                onClick={() => setActivePanelTab('sections')}
                className={`sitex-panel-tab ${activePanelTab === 'sections' ? 'active' : ''}`}
                title="Bölmələr İdarəetməsi"
              >
                <Layers size={14} />
                <span>Bölmələr</span>
              </button>
            </div>

            {/* 2. Search & Collapse Bar */}
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #1E222B',
                background: '#0D0F14',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#12141A',
                  border: '1px solid #20242E',
                  borderRadius: 6,
                  padding: '4px 8px',
                }}
              >
                <Search size={13} color="#7E8494" />
                <input
                  type="text"
                  placeholder="Parametr axtar…"
                  value={searchParam}
                  onChange={(e) => setSearchParam(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#E2E5EE',
                    fontSize: 12,
                    outline: 'none',
                    width: '100%',
                  }}
                />
                {searchParam && (
                  <button
                    type="button"
                    onClick={() => setSearchParam('')}
                    style={{ background: 'transparent', border: 'none', color: '#7E8494', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                title="Paneli daralt (Kısayol: [ )"
                style={{
                  background: '#12141A',
                  border: '1px solid #20242E',
                  borderRadius: 6,
                  color: '#8A8F9E',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <PanelLeftClose size={14} />
              </button>
            </div>

            {/* 3. Panel Content with Thin Scroll & 24px bottom padding */}
            <div
              className="sitex-custom-scroll"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 16px 24px 16px',
                boxSizing: 'border-box',
              }}
            >
              {/* TAB 1: GLOBAL */}
              {activePanelTab === 'global' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Reset to Default */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button
                      type="button"
                      onClick={handleResetTokens}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #282D3A',
                        background: '#12141A',
                        color: '#8A8F9E',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Mənbəyə Qayıt (Sıfırla)
                    </button>
                  </div>

                  {/* Palette Presets */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      PALİTRA TƏKLİFLƏRİ
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
                      {PALETTE_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleApplyPreset(p.colors)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: '1px solid #20242E',
                            background: '#12141A',
                            color: '#D4D7E2',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            textAlign: 'left',
                          }}
                        >
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: p.colors.primary,
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </span>
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
                        border: textContrast.aaPass ? '1px solid rgba(0,211,125,0.25)' : '1px solid rgba(239,68,68,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                      }}
                    >
                      <span style={{ fontSize: 12, color: textContrast.aaPass ? '#00D37D' : '#EF4444', fontWeight: 600 }}>
                        WCAG Kontrast Nisbəti: {textContrast.ratio}:1
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: textContrast.aaPass ? '#00D37D' : '#EF4444',
                          color: '#08090C',
                        }}
                      >
                        {textContrast.aaaPass ? 'AAA Əla' : textContrast.aaPass ? 'AA Qəbul' : 'Zəif'}
                      </span>
                    </div>
                  )}

                  {/* Color Palette (44px rows) */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      RƏNG PALİTRASI
                    </h4>
                    <div style={{ marginTop: 12 }}>
                      {renderColorRow('primary', 'Əsas Rəng (Primary)')}
                      {renderColorRow('secondary', 'İkinci dərəcəli (Secondary)')}
                      {renderColorRow('accent', 'Vurğu Rəngi (Accent)')}
                      {renderColorRow('background', 'Arxa Fon (Background)', false)}
                      {renderColorRow('surface', 'Kart və Səth (Surface)', false)}
                      {renderColorRow('text', 'Mətn Rəngi (Text)')}
                    </div>
                  </div>

                  {/* Typography */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      TİPOQRAFİYA
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#8A8F9E', marginBottom: 6 }}>
                          Başlıq Şrifti (Heading)
                        </label>
                        <select
                          value={tokens.typography.headingFont}
                          onChange={(e) => updateTypography('headingFont', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: '#12141A',
                            border: '1px solid #20242E',
                            borderRadius: 6,
                            color: '#FFF',
                            fontSize: 13,
                          }}
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#8A8F9E', marginBottom: 6 }}>
                          Mətn Şrifti (Body)
                        </label>
                        <select
                          value={tokens.typography.bodyFont}
                          onChange={(e) => updateTypography('bodyFont', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: '#12141A',
                            border: '1px solid #20242E',
                            borderRadius: 6,
                            color: '#FFF',
                            fontSize: 13,
                          }}
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ color: '#8A8F9E' }}>Baza Ölçü</span>
                          <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.typography.baseSize}</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={20}
                          value={parseInt(tokens.typography.baseSize, 10) || 16}
                          onChange={(e) => updateTypography('baseSize', `${e.target.value}px`)}
                          style={{ width: '100%', accentColor: '#00D37D' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#8A8F9E', marginBottom: 6 }}>
                          Modullu Şrift Şkalası (Modular Scale)
                        </label>
                        <select
                          value={modularScale}
                          onChange={(e) => setModularScale(parseFloat(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: '#12141A',
                            border: '1px solid #20242E',
                            borderRadius: 6,
                            color: '#FFF',
                            fontSize: 13,
                          }}
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
                </div>
              )}

              {/* TAB 2: LAYOUT */}
              {activePanelTab === 'layout' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Header Style */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      HEADER & NAVİQASİYA
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
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
                            border: tokens.header.style === item.id ? '1px solid #00D37D' : '1px solid #20242E',
                            background: tokens.header.style === item.id ? 'rgba(0,211,125,0.12)' : '#12141A',
                            color: tokens.header.style === item.id ? '#00D37D' : '#8A8F9E',
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

                  {/* Footer Style */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      FOOTER DİZAYNI
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
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
                            border: tokens.footer.style === item.id ? '1px solid #00D37D' : '1px solid #20242E',
                            background: tokens.footer.style === item.id ? 'rgba(0,211,125,0.12)' : '#12141A',
                            color: tokens.footer.style === item.id ? '#00D37D' : '#8A8F9E',
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

                  {/* Radius and Spacing */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      RADİUS VƏ BOŞLUQLAR
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ color: '#8A8F9E' }}>Künc Yuvarlaqlığı</span>
                          <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.layout.borderRadius}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={24}
                          value={parseInt(tokens.layout.borderRadius, 10) || 12}
                          onChange={(e) => updateLayout('borderRadius', `${e.target.value}px`)}
                          style={{ width: '100%', accentColor: '#00D37D' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                          <span style={{ color: '#8A8F9E' }}>Seksiyalararası Boşluq</span>
                          <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.layout.spacing}</span>
                        </div>
                        <input
                          type="range"
                          min={8}
                          max={32}
                          step={4}
                          value={parseInt(tokens.layout.spacing, 10) || 16}
                          onChange={(e) => updateLayout('spacing', `${e.target.value}px`)}
                          style={{ width: '100%', accentColor: '#00D37D' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#8A8F9E', marginBottom: 6 }}>
                          Konteyner Maksimum Eni
                        </label>
                        <select
                          value={tokens.layout.containerWidth}
                          onChange={(e) => updateLayout('containerWidth', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: '#12141A',
                            border: '1px solid #20242E',
                            borderRadius: 6,
                            color: '#FFF',
                            fontSize: 13,
                          }}
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

              {/* TAB 3: COMPONENTS */}
              {activePanelTab === 'components' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Buttons */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      DÜYMƏLƏR (BUTTONS)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {(['solid', 'outline', 'ghost', 'soft', 'pill'] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => updateComponentToken('button', 'style', style)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: tokens.components.button.style === style ? '1px solid #00D37D' : '1px solid #20242E',
                              background: tokens.components.button.style === style ? 'rgba(0,211,125,0.12)' : '#12141A',
                              color: tokens.components.button.style === style ? '#00D37D' : '#8A8F9E',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              textTransform: 'capitalize',
                            }}
                          >
                            {style}
                          </button>
                        ))}
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                          <span style={{ color: '#8A8F9E' }}>Düymə Küncləri</span>
                          <span style={{ color: '#00D37D', fontWeight: 600 }}>{tokens.components.button.radius}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={24}
                          value={parseInt(tokens.components.button.radius, 10) || 8}
                          onChange={(e) => updateComponentToken('button', 'radius', `${e.target.value}px`)}
                          style={{ width: '100%', accentColor: '#00D37D' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ marginBottom: 24 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 12,
                        margin: 0,
                      }}
                    >
                      KARTLAR (CARDS)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
                      {(['elevated', 'flat', 'bordered'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateComponentToken('card', 'style', style)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 6,
                            border: tokens.components.card.style === style ? '1px solid #00D37D' : '1px solid #20242E',
                            background: tokens.components.card.style === style ? 'rgba(0,211,125,0.12)' : '#12141A',
                            color: tokens.components.card.style === style ? '#00D37D' : '#8A8F9E',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SECTIONS */}
              {activePanelTab === 'sections' && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8F9E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        margin: 0,
                      }}
                    >
                      BÖLMƏLƏR SİYAHISI ({nodes.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#00D37D',
                        color: '#08090C',
                        border: 'none',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={12} strokeWidth={3} />
                      Bölmə Əlavə Et
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {nodes.map((node, index) => {
                      const isSelected = selectedNodeId === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => onSelectNode(node.id)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: isSelected ? 'rgba(0,211,125,0.1)' : '#12141A',
                            border: isSelected ? '1px solid #00D37D' : '1px solid #20242E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#7E8494', width: 16 }}>{index + 1}.</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#00D37D' : '#F5F5F7' }}>
                              {node.type}
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
                                color: index === 0 ? '#333' : '#8A8F9E',
                                padding: 4,
                                cursor: index === 0 ? 'default' : 'pointer',
                              }}
                              title="Yuxarı daşı"
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
                                color: index === nodes.length - 1 ? '#333' : '#8A8F9E',
                                padding: 4,
                                cursor: index === nodes.length - 1 ? 'default' : 'pointer',
                              }}
                              title="Aşağı daşı"
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDuplicateNode(node.id)}
                              style={{ background: 'transparent', border: 'none', color: '#8A8F9E', padding: 4, cursor: 'pointer' }}
                              title="Təkrarlayın"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteNode(node.id)}
                              style={{ background: 'transparent', border: 'none', color: '#F87171', padding: 4, cursor: 'pointer' }}
                              title="Sil"
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

            {/* Resize Drag Handle */}
            <div
              onMouseDown={handleMouseDownResize}
              title="Genişliyi dəyişmək üçün sürüşdürün"
              style={{
                position: 'absolute',
                top: 0,
                right: -3,
                width: 6,
                bottom: 0,
                cursor: 'col-resize',
                zIndex: 30,
                background: 'transparent',
              }}
            />
          </aside>
        ) : (
          /* Collapsed Indicator Button */
          <div
            style={{
              width: 38,
              borderRight: '1px solid #1E222B',
              background: '#0D0F14',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 12,
              zIndex: 10,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              title="Paneli genişləndir (Kısayol: [ )"
              style={{
                background: '#14171E',
                border: '1px solid #242936',
                borderRadius: 6,
                color: '#00D37D',
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {/* ORTA: Canvas və Cihaz Toolbar-ı */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* 48px Cihaz Seçici & Toolbar */}
          <div
            style={{
              height: 48,
              minHeight: 48,
              maxHeight: 48,
              background: '#0C0E12',
              borderBottom: '1px solid #1E222B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
          >
            {/* Tez Məlumat Sol */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8A8F9E' }}>
              <span style={{ fontWeight: 600, color: '#E2E5EE' }}>İnteraktiv Kətan</span>
              <span style={{ color: '#2B313E' }}>•</span>
              <span style={{ color: '#00D37D', fontWeight: 600 }}>{nodes.length} Bölmə</span>
            </div>

            {/* Mərkəzləşdirilmiş Cihaz Seçici (Segmented 36px) */}
            <div
              style={{
                display: 'inline-flex',
                background: '#12141A',
                padding: 2,
                borderRadius: 8,
                border: '1px solid #20242E',
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => onSetDevice('desktop')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: device === 'desktop' ? '#1A1E27' : 'transparent',
                  color: device === 'desktop' ? '#00D37D' : '#8A8F9E',
                  fontSize: 12,
                  fontWeight: device === 'desktop' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Monitor size={14} />
                <span>Masaüstü (100%)</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDevice('tablet')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: device === 'tablet' ? '#1A1E27' : 'transparent',
                  color: device === 'tablet' ? '#00D37D' : '#8A8F9E',
                  fontSize: 12,
                  fontWeight: device === 'tablet' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Tablet size={14} />
                <span>Planşet (768px)</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDevice('mobile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: device === 'mobile' ? '#1A1E27' : 'transparent',
                  color: device === 'mobile' ? '#00D37D' : '#8A8F9E',
                  fontSize: 12,
                  fontWeight: device === 'mobile' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Smartphone size={14} />
                <span>Mobil (375px)</span>
              </button>
            </div>

            {/* Bölmə Əlavə Et Düyməsi */}
            <button
              type="button"
              onClick={() => setShowAddSectionModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: '#00D37D',
                color: '#08090C',
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,211,125,0.25)',
              }}
            >
              <Plus size={14} strokeWidth={3} />
              <span>Bölmə Əlavə Et</span>
            </button>
          </div>

          {/* Kətan (Single Scroll & Dot Grid) */}
          <Canvas
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            device={device}
            onDropComponent={onAddNode}
            onOpenAddModal={() => setShowAddSectionModal(true)}
            tokens={tokens}
            onDeleteNode={onDeleteNode}
            onChangeNodeType={() => setShowAddSectionModal(true)}
          />
        </div>

        {/* SAĞ PANEL: Seçilmiş Bölmə Xassələri (320px) */}
        {selectedNode && (
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateProps={onUpdateNodeProps}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
            onMoveNode={onMoveNode}
            onClose={() => onSelectNode('')}
          />
        )}

        {/* Bölmə Əlavə Et Modalı */}
        {showAddSectionModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowAddSectionModal(false)}
          >
            <div
              style={{
                width: 560,
                maxHeight: '80vh',
                background: '#12141A',
                borderRadius: 14,
                border: '1px solid #242936',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                  Yeni Bölmə Əlavə Et
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#8A8F9E', fontSize: 18, cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div
                className="sitex-custom-scroll"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                  overflowY: 'auto',
                  paddingRight: 4,
                  maxHeight: '60vh',
                }}
              >
                {listComponents().map((comp) => (
                  <button
                    key={comp.type}
                    type="button"
                    onClick={() => {
                      onAddNode(comp.type);
                      setShowAddSectionModal(false);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: '#181B22',
                      border: '1px solid #242936',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00D37D';
                      e.currentTarget.style.background = '#1E232E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#242936';
                      e.currentTarget.style.background = '#181B22';
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{comp.label}</span>
                    <span style={{ fontSize: 11, color: '#8A8F9E', textTransform: 'capitalize' }}>
                      Növ: <code>{comp.type}</code>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
