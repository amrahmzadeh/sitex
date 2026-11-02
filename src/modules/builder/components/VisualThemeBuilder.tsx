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
  FolderOpen,
  Sparkles,
  GripVertical,
  Type,
  Image as ImageIcon,
  Compass,
  Utensils,
  ShieldCheck,
  MessageSquareQuote,
  Send,
  MapPin,
  PanelBottom,
  Minus,
  Box,
  Images,
  ZoomIn,
  ZoomOut,
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
      background: '#1F202E',
      surface: '#2B2D42',
      text: '#F4F1DE',
      mutedText: '#A8A29E',
    },
  },
  {
    name: 'Zərif Minimalist',
    colors: {
      primary: '#FFFFFF',
      secondary: '#18181B',
      accent: '#A1A1AA',
      background: '#09090B',
      surface: '#141417',
      text: '#FAFAFA',
      mutedText: '#71717A',
    },
  },
];

const STARTER_TEMPLATES = [
  {
    id: 'starter-restaurant',
    title: 'Müasir Restoran & Kafe',
    description: 'Header, Qəhrəman Başlıq, Xüsusi Menyu, Üstünlüklər, Rəylər və Sonluq.',
    badge: 'Populyar',
    nodes: [
      {
        id: 'node-nav-1',
        type: 'navbar',
        props: {
          brandName: 'Liman Restoran',
          links: 'Menyu, Haqqımızda, Qalereya, Əlaqə',
          ctaText: 'Rezervasiya',
          bgColor: '#101216',
        },
      },
      {
        id: 'node-hero-1',
        type: 'hero',
        props: {
          title: 'Ləzzət və Zövqün Tək Ünvanı',
          subtitle: 'Ənənəvi kulinariya ənənələri və müasir xidmət mədəniyyəti bir arada.',
          buttonText: 'Menyuya Bax',
          secondaryButtonText: 'Masa Sifarişi',
        },
      },
      {
        id: 'node-menu-1',
        type: 'menu_list',
        props: {
          categoryBadge: 'Xüsusi Təkliflər',
          title: 'Şefin Seçimi Təamlar',
          items:
            'Lülə Kebab - 14 AZN, Şah Plov - 28 AZN, Ribeye Steyk - 36 AZN, Qızılbalıq Qrildə - 26 AZN, Tiramisu - 10 AZN',
        },
      },
      {
        id: 'node-features-1',
        type: 'features',
        props: { sectionTitle: 'Niyə Müştərilərimiz Bizi Seçir?' },
      },
      {
        id: 'node-testimonials-1',
        type: 'testimonials',
        props: {
          author: 'Rəşad Quliyev',
          review: 'Şəhərin ən yaxşı ab-havası və dadlı mətbəxi! Hər həftə ailəmlə gəlirəm.',
        },
      },
      {
        id: 'node-contact-1',
        type: 'contact_form',
        props: { title: 'Masa Rezervasiyası və Əlaqə' },
      },
      {
        id: 'node-footer-1',
        type: 'footer',
        props: { copyright: '© 2026 Liman Restoran. Bütün hüquqlar qorunur.' },
      },
    ],
  },
  {
    id: 'starter-steakhouse',
    title: 'Lüks Steykhaus & Lounge',
    description: 'Qaranlıq zərif interyer, steyk və ət təamları üçün xüsusi dizayn.',
    badge: 'Premium',
    nodes: [
      {
        id: 'node-nav-2',
        type: 'navbar',
        props: {
          brandName: 'Prime Steakhouse',
          links: 'Steyklər, Şərab Kartı, Rezervasiya',
          bgColor: '#0B0D11',
          ctaText: 'Masa Seçin',
        },
      },
      {
        id: 'node-hero-2',
        type: 'hero',
        props: {
          title: 'Premium Quru Yetişdirilmiş Ətlər',
          subtitle: 'Xüsusi reseptlərlə köz üzərində hazırlanan dadlı qastronomik şah əsərləri.',
          buttonText: 'Steyk Menyu',
        },
      },
      {
        id: 'node-menu-2',
        type: 'menu_list',
        props: {
          title: 'Dry-Aged Steyklər',
          items:
            'Tomahawk Steyk (1.2 kq) - 85 AZN, Ribeye Black Angus - 48 AZN, Filet Mignon - 45 AZN, Wagyu Burger - 22 AZN',
        },
      },
      {
        id: 'node-gallery-2',
        type: 'gallery',
        props: { title: 'İnteryer və Atmosfer' },
      },
      {
        id: 'node-map-2',
        type: 'map',
        props: { address: 'Fəvvarələr Meydanı, Tərlan Əliyarbəyov 12, Bakı' },
      },
      {
        id: 'node-footer-2',
        type: 'footer',
        props: { copyright: '© 2026 Prime Steakhouse. Bütün hüquqlar qorunur.' },
      },
    ],
  },
  {
    id: 'starter-cafe',
    title: 'Artisan Kafe & Qənnadı',
    description: 'Qəhvə, səhər yeməkləri və şirniyyat evləri üçün isti və cəlbedici şablon.',
    badge: 'İsti & Şık',
    nodes: [
      {
        id: 'node-nav-3',
        type: 'navbar',
        props: {
          brandName: 'Aroma Coffee & Bakery',
          links: 'Qəhvələr, Şirniyyatlar, Brunch, Əlaqə',
          ctaText: 'Sifariş Ver',
        },
      },
      {
        id: 'node-hero-3',
        type: 'hero',
        props: {
          title: 'Təzə Qovrulmuş Xüsusi Qəhvə',
          subtitle: 'Hər səhər təzə bişən kruassanlar və 100% Arabika qəhvə dənələri.',
          buttonText: 'Qəhvə Kartı',
        },
      },
      {
        id: 'node-menu-3',
        type: 'menu_list',
        props: {
          title: 'Populyar İçkilər və Desertlər',
          items:
            'Flat White - 6 AZN, Spanish Latte - 7 AZN, San Sebastian Cheesecake - 9 AZN, Badamlı Kruassan - 5 AZN',
        },
      },
      {
        id: 'node-features-3',
        type: 'features',
        props: {
          f1Title: '100% Arabika Dənələri',
          f2Title: 'Təbii Kərə Yağı',
          f3Title: 'Rahat Coworking Mühiti',
        },
      },
      {
        id: 'node-footer-3',
        type: 'footer',
        props: { copyright: '© 2026 Aroma Coffee. Bütün hüquqlar qorunur.' },
      },
    ],
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
  // Navigation Dock Tab: 'add' | 'layers' | 'design' | 'templates' | 'layout'
  const [activeDockTab, setActiveDockTab] = useState<'add' | 'layers' | 'design' | 'templates' | 'layout'>('add');
  const [componentCategory, setComponentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [insertTargetIndex, setInsertTargetIndex] = useState<number | undefined>(undefined);

  // Sidebar width & collapse states
  const [sidebarWidth, setSidebarWidth] = useState<number>(360);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(1280);
  const isDraggingRef = useRef(false);

  // Responsive resize tracking & initial collapse
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      if (w < 1100) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = windowWidth < 1100;
  const isMobile = windowWidth < 768;

  // Restore sidebar width from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sitex_builder_sidebar_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 300 && parsed <= 460) {
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
      const newWidth = Math.min(460, Math.max(300, startWidth + delta));
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

  const handleApplyPreset = (presetColors: GlobalDesignTokens['colors']) => {
    onUpdateTokens({
      ...tokens,
      colors: { ...presetColors },
    });
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

  // Components registry
  const allComponents = listComponents();
  const filteredComponents = allComponents.filter((comp) => {
    const matchesSearch =
      comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      componentCategory === 'all' ||
      (componentCategory === 'layout' && (comp.category === 'layout' || comp.type === 'navbar' || comp.type === 'footer')) ||
      (componentCategory === 'hero' && comp.type === 'hero') ||
      (componentCategory === 'menu' && comp.type === 'menu_list') ||
      (componentCategory === 'content' && (comp.category === 'content' || comp.category === 'typography')) ||
      (componentCategory === 'media' && (comp.category === 'media' || comp.type === 'image' || comp.type === 'gallery')) ||
      (componentCategory === 'contact' && (comp.type === 'contact_form' || comp.type === 'map'));
    return matchesSearch && matchesCategory;
  });

  const handleInsertComponent = (type: string) => {
    onAddNode(type, insertTargetIndex);
    setInsertTargetIndex(undefined);
    if (isCompact) {
      setIsCollapsed(true);
    }
  };

  const handleLoadStarterTemplate = (starter: (typeof STARTER_TEMPLATES)[0]) => {
    if (confirm(`"${starter.title}" şablonunu tətbiq etmək istəyirsiniz? Mövcud kətan bölmələri yenilənəcək.`)) {
      onUpdateNodes(starter.nodes as BuilderNode[]);
      onSelectNode(starter.nodes[0]?.id || null);
    }
  };

  // Color row helper
  const renderColorRow = (
    key: keyof GlobalDesignTokens['colors'],
    label: string,
    checkAgainstBg = true
  ) => {
    const val = tokens.colors[key] || '#000000';
    const contrast = checkAgainstBg ? checkWCAGContrast(val, tokens.colors.background) : null;

    return (
      <div
        key={key}
        style={{
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: '#12141A',
          borderRadius: 8,
          border: '1px solid #20242E',
          marginBottom: 8,
          boxSizing: 'border-box',
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
                border: contrast.aaPass
                  ? '1px solid rgba(0, 211, 125, 0.25)'
                  : '1px solid rgba(239, 68, 68, 0.25)',
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
        .sitex-rail-btn {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #7E8494;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sitex-rail-btn:hover {
          background: #14171F;
          color: #F4F5F8;
        }
        .sitex-rail-btn.active {
          background: #00D37D;
          color: #08090C;
          box-shadow: 0 2px 10px rgba(0, 211, 125, 0.3);
        }
        @media (max-width: 1100px) {
          .sitex-drawer-panel {
            position: fixed !important;
            top: 52px !important;
            left: 54px !important;
            bottom: 0 !important;
            width: min(340px, calc(100vw - 54px)) !important;
            z-index: 100 !important;
            box-shadow: 14px 0 40px rgba(0,0,0,0.85) !important;
          }
          .sitex-properties-panel-wrap {
            position: fixed !important;
            top: 52px !important;
            right: 0 !important;
            bottom: 0 !important;
            width: min(340px, 92vw) !important;
            max-width: 92vw !important;
            z-index: 100 !important;
            box-shadow: -14px 0 40px rgba(0,0,0,0.85) !important;
          }
        }
        @media (max-width: 640px) {
          .sitex-drawer-panel {
            left: 0 !important;
            width: 100vw !important;
          }
          .sitex-properties-panel-wrap {
            width: 100vw !important;
          }
          .sitex-canvas-subtoolbar-label {
            display: none !important;
          }
          .sitex-device-btn-text {
            display: none !important;
          }
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
        {/* 1. SLIM LEFT RAIL DOCK (54px) */}
        <nav
          aria-label="Studio Əsas Alətlər Paneli"
          style={{
            width: 54,
            minWidth: 54,
            maxWidth: 54,
            background: '#090B0E',
            borderRight: '1px solid #1C202A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 0',
            gap: 8,
            zIndex: 30,
            flexShrink: 0,
            userSelect: 'none',
            boxSizing: 'border-box',
          }}
        >
          <button
            type="button"
            className={`sitex-rail-btn ${activeDockTab === 'add' && !isCollapsed ? 'active' : ''}`}
            onClick={() => {
              setActiveDockTab('add');
              setIsCollapsed(false);
            }}
            title="Bölmə & Element Əlavə Et"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Əlavə</span>
          </button>

          <button
            type="button"
            className={`sitex-rail-btn ${activeDockTab === 'layers' && !isCollapsed ? 'active' : ''}`}
            onClick={() => {
              setActiveDockTab('layers');
              setIsCollapsed(false);
            }}
            title="Səhifə Qatları və Bölmələr Ağacı"
          >
            <Layers size={18} />
            <span>Qatlar</span>
          </button>

          <button
            type="button"
            className={`sitex-rail-btn ${activeDockTab === 'design' && !isCollapsed ? 'active' : ''}`}
            onClick={() => {
              setActiveDockTab('design');
              setIsCollapsed(false);
            }}
            title="Qlobal Tema və Dizayn Tokenləri"
          >
            <Palette size={18} />
            <span>Dizayn</span>
          </button>

          <button
            type="button"
            className={`sitex-rail-btn ${activeDockTab === 'templates' && !isCollapsed ? 'active' : ''}`}
            onClick={() => {
              setActiveDockTab('templates');
              setIsCollapsed(false);
            }}
            title="Hazır Şablonlar (Starter Kits)"
          >
            <FolderOpen size={18} />
            <span>Şablon</span>
          </button>

          <button
            type="button"
            className={`sitex-rail-btn ${activeDockTab === 'layout' && !isCollapsed ? 'active' : ''}`}
            onClick={() => {
              setActiveDockTab('layout');
              setIsCollapsed(false);
            }}
            title="Konteyner və Şəbəkə Tərtibatı"
          >
            <Layout size={18} />
            <span>Tərtibat</span>
          </button>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7E8494',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
            }}
            title={isCollapsed ? 'Paneli aç ( [ )' : 'Paneli yığ ( [ )'}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </nav>

        {/* 2. SECONDARY DRAWER PANEL (Resizable, 300px - 440px) */}
        {!isCollapsed && (
          <aside
            role="region"
            aria-label="Studio İdarəetmə Paneli"
            className="sitex-drawer-panel"
            style={{
              width: isCompact ? 320 : sidebarWidth,
              minWidth: isCompact ? 280 : 300,
              maxWidth: 440,
              background: '#0D0F14',
              borderRight: '1px solid #1C202A',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 100,
              position: 'relative',
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            {/* Header Close button for compact view */}
            {isCompact && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#07080B',
                  borderBottom: '1px solid #1C202A',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00D37D', textTransform: 'uppercase' }}>
                  {activeDockTab === 'add'
                    ? 'Bölmə Kataloqu'
                    : activeDockTab === 'layers'
                    ? 'Qatlar Ağacı'
                    : activeDockTab === 'design'
                    ? 'Dizayn Tokenləri'
                    : activeDockTab === 'templates'
                    ? 'Şablonlar'
                    : 'Tərtibat'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  style={{
                    background: '#151922',
                    border: '1px solid #20242E',
                    color: '#8A8F9E',
                    borderRadius: 6,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  title="Paneli bağla"
                >
                  ✕ Bağla
                </button>
              </div>
            )}
            {/* TAB: ADD COMPONENTS */}
            {activeDockTab === 'add' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #1E222B',
                    background: '#090B0E',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#F4F5F8' }}>
                        Bölmə & Blok Kataloqu
                      </span>
                      {insertTargetIndex !== undefined && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(0, 211, 125, 0.15)',
                            color: '#00D37D',
                            fontWeight: 700,
                          }}
                        >
                          #{insertTargetIndex + 1}-ci yerə
                        </span>
                      )}
                    </div>
                    {insertTargetIndex !== undefined && (
                      <button
                        type="button"
                        onClick={() => setInsertTargetIndex(undefined)}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11 }}
                      >
                        ✕ İmtina
                      </button>
                    )}
                  </div>

                  {/* Search Input */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#13151D',
                      border: '1px solid #20242E',
                      borderRadius: 8,
                      padding: '6px 10px',
                    }}
                  >
                    <Search size={13} color="#7E8494" />
                    <input
                      type="text"
                      placeholder="Blok və ya komponent axtar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#E2E5EE',
                        fontSize: 12,
                        width: '100%',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Category Pills */}
                  <div
                    className="sitex-custom-scroll"
                    style={{
                      display: 'flex',
                      gap: 6,
                      overflowX: 'auto',
                      paddingTop: 10,
                      paddingBottom: 2,
                    }}
                  >
                    {[
                      { id: 'all', label: 'Hamısı' },
                      { id: 'layout', label: 'Quruluş' },
                      { id: 'hero', label: 'Qəhrəman' },
                      { id: 'menu', label: 'Menyu' },
                      { id: 'content', label: 'Məzmun' },
                      { id: 'media', label: 'Media' },
                      { id: 'contact', label: 'Əlaqə' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setComponentCategory(cat.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          border: componentCategory === cat.id ? '1px solid #00D37D' : '1px solid #20242E',
                          background: componentCategory === cat.id ? '#00D37D' : '#13151D',
                          color: componentCategory === cat.id ? '#08090C' : '#8A8F9E',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Component List */}
                <div
                  className="sitex-custom-scroll"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {filteredComponents.map((comp) => (
                    <div
                      key={comp.type}
                      onClick={() => handleInsertComponent(comp.type)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', comp.type);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: '#13151D',
                        border: '1px solid #20242E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'grab',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00D37D';
                        e.currentTarget.style.background = '#171B24';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#20242E';
                        e.currentTarget.style.background = '#13151D';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'rgba(0, 211, 125, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#00D37D',
                          }}
                        >
                          <Plus size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#F4F5F8' }}>{comp.label}</div>
                          <div style={{ fontSize: 11, color: '#7E8494', textTransform: 'capitalize' }}>
                            Kateqoriya: {comp.category}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          background: 'rgba(0, 211, 125, 0.12)',
                          color: '#00D37D',
                          border: '1px solid rgba(0, 211, 125, 0.25)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Əlavə et
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LAYERS & OUTLINE */}
            {activeDockTab === 'layers' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #1E222B',
                    background: '#090B0E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={16} color="#00D37D" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#F4F5F8' }}>Səhifə Qatları</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#888D9E', fontWeight: 600 }}>{nodes.length} Blok</span>
                </div>

                <div
                  className="sitex-custom-scroll"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {nodes.map((node, index) => {
                    const isSelected = selectedNodeId === node.id;
                    const def = allComponents.find((c) => c.type === node.type);

                    return (
                      <div
                        key={node.id}
                        onClick={() => onSelectNode(node.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: isSelected ? 'rgba(0, 211, 125, 0.1)' : '#13151D',
                          border: isSelected ? '1px solid #00D37D' : '1px solid #20242E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#687082', width: 14 }}>{index + 1}.</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#00D37D' : '#F5F5F7' }}>
                            {def?.label || node.type}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={(e) => e.stopPropagation()}>
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
                            <ChevronUp size={13} />
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
                            <ChevronDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateNode(node.id)}
                            style={{ background: 'transparent', border: 'none', color: '#8A8F9E', padding: 4, cursor: 'pointer' }}
                            title="Kopyala"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteNode(node.id)}
                            style={{ background: 'transparent', border: 'none', color: '#F87171', padding: 4, cursor: 'pointer' }}
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: DESIGN TOKENS */}
            {activeDockTab === 'design' && (
              <div
                className="sitex-custom-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                {/* 1. Palitra Presets */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F4F5F8', margin: '0 0 10px' }}>
                    Rəng Palitrası Seçimləri
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {PALETTE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset.colors)}
                        style={{
                          padding: '10px',
                          borderRadius: 8,
                          background: '#13151D',
                          border: '1px solid #20242E',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.primary }} />
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.accent }} />
                          <span style={{ width: 14, height: 14, borderRadius: '50%', background: preset.colors.background, border: '1px solid #333' }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#E2E5EE' }}>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Color Tokens */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F4F5F8', margin: '0 0 10px' }}>
                    Fərdi Rəng Tokenləri
                  </h4>
                  {renderColorRow('primary', 'Əsas Rəng (Primary)')}
                  {renderColorRow('secondary', 'İkinci Rəng (Secondary)')}
                  {renderColorRow('accent', 'Vurğu Rəngi (Accent)')}
                  {renderColorRow('background', 'Arxa Fon Rəngi', false)}
                  {renderColorRow('surface', 'Səth Rəngi (Surface)', false)}
                  {renderColorRow('text', 'Əsas Mətn Rəngi')}
                  {renderColorRow('mutedText', 'Sönük Mətn Rəngi')}
                </div>

                {/* 3. Typography */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F4F5F8', margin: '0 0 10px' }}>
                    Typoqrafiya və Şriftlər
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: '#888D9E', display: 'block', marginBottom: 4 }}>
                        Başlıq Şrifti (Heading)
                      </label>
                      <select
                        value={tokens.typography.headingFont}
                        onChange={(e) => updateTypography('headingFont', e.target.value)}
                        style={{
                          width: '100%',
                          background: '#13151D',
                          border: '1px solid #20242E',
                          borderRadius: 8,
                          padding: '8px 10px',
                          color: '#F4F5F8',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f} value={f} style={{ background: '#13151D', color: '#FFF' }}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: '#888D9E', display: 'block', marginBottom: 4 }}>
                        Əsas Mətn Şrifti (Body)
                      </label>
                      <select
                        value={tokens.typography.bodyFont}
                        onChange={(e) => updateTypography('bodyFont', e.target.value)}
                        style={{
                          width: '100%',
                          background: '#13151D',
                          border: '1px solid #20242E',
                          borderRadius: 8,
                          padding: '8px 10px',
                          color: '#F4F5F8',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f} value={f} style={{ background: '#13151D', color: '#FFF' }}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Layout Corners */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F4F5F8', margin: '0 0 10px' }}>
                    Künc Yuvarlaqlığı (Border Radius)
                  </h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['4px', '8px', '12px', '16px', '24px'].map((rad) => (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => updateLayout('borderRadius', rad)}
                        style={{
                          flex: 1,
                          padding: '8px 0',
                          borderRadius: 6,
                          background: tokens.layout.borderRadius === rad ? '#00D37D' : '#13151D',
                          color: tokens.layout.borderRadius === rad ? '#08090C' : '#888D9E',
                          border: tokens.layout.borderRadius === rad ? '1px solid #00D37D' : '1px solid #20242E',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {rad}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: STARTER TEMPLATES */}
            {activeDockTab === 'templates' && (
              <div
                className="sitex-custom-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 800, color: '#F4F5F8', margin: '0 0 4px' }}>
                    1-Klik Hazır Şablonlar
                  </h4>
                  <p style={{ fontSize: 12, color: '#7E8494', margin: 0 }}>
                    Tam hazır biznes və restoran strukturlarını dərhal kətana tətbiq edin.
                  </p>
                </div>

                {STARTER_TEMPLATES.map((starter) => (
                  <div
                    key={starter.id}
                    style={{
                      background: '#13151D',
                      border: '1px solid #20242E',
                      borderRadius: 10,
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>{starter.title}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(0, 211, 125, 0.15)',
                          color: '#00D37D',
                        }}
                      >
                        {starter.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#888D9E', margin: 0, lineHeight: 1.5 }}>
                      {starter.description}
                    </p>
                    <div style={{ fontSize: 11, color: '#687082' }}>
                      Cəmi {starter.nodes.length} bölmə
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLoadStarterTemplate(starter)}
                      style={{
                        marginTop: 4,
                        padding: '8px 12px',
                        background: '#00D37D',
                        color: '#08090C',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 211, 125, 0.25)',
                      }}
                    >
                      Şablonu Tətbiq Et
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: LAYOUT */}
            {activeDockTab === 'layout' && (
              <div
                className="sitex-custom-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#F4F5F8', margin: '0 0 6px' }}>
                    Konteyner Qaydaları
                  </h4>
                  <p style={{ fontSize: 11, color: '#7E8494', margin: '0 0 12px' }}>
                    Saytınızın ümumi eni və bölmələr arasındakı boşluqları idarə edin.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#888D9E', display: 'block', marginBottom: 4 }}>
                    Maksimum Səhifə Eni
                  </label>
                  <select
                    value={tokens.layout.containerWidth || '1200px'}
                    onChange={(e) => updateLayout('containerWidth', e.target.value)}
                    style={{
                      width: '100%',
                      background: '#13151D',
                      border: '1px solid #20242E',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#F4F5F8',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  >
                    <option value="1024px">1024px (Kompakt)</option>
                    <option value="1200px">1200px (Standart)</option>
                    <option value="1360px">1360px (Geniş)</option>
                    <option value="100%">100% (Tam Ekran)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: '#888D9E', display: 'block', marginBottom: 4 }}>
                    Bölmə Daxili Boşluğu (Spacing)
                  </label>
                  <select
                    value={tokens.layout.spacing || '48px'}
                    onChange={(e) => updateLayout('spacing', e.target.value)}
                    style={{
                      width: '100%',
                      background: '#13151D',
                      border: '1px solid #20242E',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#F4F5F8',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  >
                    <option value="32px">32px (Sıx)</option>
                    <option value="48px">48px (Orta)</option>
                    <option value="64px">64px (Geniş)</option>
                    <option value="96px">96px (Dəbdəbəli)</option>
                  </select>
                </div>
              </div>
            )}

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
        )}

        {/* 3. CENTER: CANVAS & TOOLBAR */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Canvas Sub-Header Toolbar (46px) */}
          <div
            style={{
              height: 46,
              minHeight: 46,
              maxHeight: 46,
              background: '#0B0D12',
              borderBottom: '1px solid #1C202A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              userSelect: 'none',
              boxSizing: 'border-box',
              zIndex: 10,
            }}
          >
            {/* Left: Section Count & Insertion Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8A8F9E' }}>
              <span className="sitex-canvas-subtoolbar-label" style={{ fontWeight: 600, color: '#E2E5EE' }}>Studio Kətanı •</span>
              <span style={{ color: '#00D37D', fontWeight: 600 }}>{nodes.length} Bölmə</span>
            </div>

            {/* Center: Device Viewport Switcher */}
            <div
              style={{
                display: 'inline-flex',
                background: '#13151D',
                padding: 3,
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
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  background: device === 'desktop' ? '#1E2330' : 'transparent',
                  color: device === 'desktop' ? '#00D37D' : '#8A8F9E',
                  fontSize: 11,
                  fontWeight: device === 'desktop' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Masaüstü rejimi (100%)"
              >
                <Monitor size={13} />
                <span className="sitex-device-btn-text">Masaüstü</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDevice('tablet')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  background: device === 'tablet' ? '#1E2330' : 'transparent',
                  color: device === 'tablet' ? '#00D37D' : '#8A8F9E',
                  fontSize: 11,
                  fontWeight: device === 'tablet' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Planşet rejimi (768px)"
              >
                <Tablet size={13} />
                <span className="sitex-device-btn-text">Planşet</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDevice('mobile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  background: device === 'mobile' ? '#1E2330' : 'transparent',
                  color: device === 'mobile' ? '#00D37D' : '#8A8F9E',
                  fontSize: 11,
                  fontWeight: device === 'mobile' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Mobil rejimi (390px)"
              >
                <Smartphone size={13} />
                <span className="sitex-device-btn-text">Mobil</span>
              </button>
            </div>

            {/* Right: Zoom & Quick Add */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#13151D',
                  borderRadius: 6,
                  border: '1px solid #20242E',
                  padding: '2px 4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 3 }}
                  title="Kiçilt"
                >
                  <ZoomOut size={12} />
                </button>
                <span style={{ fontSize: 10, color: '#A0A7B8', minWidth: 30, textAlign: 'center' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 3 }}
                  title="Böyüt"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveDockTab('add');
                  setIsCollapsed(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: '#00D37D',
                  color: '#08090C',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 211, 125, 0.25)',
                }}
              >
                <Plus size={13} strokeWidth={3} />
                <span className="sitex-device-btn-text">Bölmə Əlavə Et</span>
              </button>
            </div>
          </div>

          {/* Canvas Component */}
          <Canvas
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            device={device}
            onDropComponent={onAddNode}
            onOpenAddModal={() => {
              setActiveDockTab('add');
              setIsCollapsed(false);
            }}
            tokens={tokens}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
            onMoveNode={onMoveNode}
            onChangeNodeType={() => {
              setActiveDockTab('add');
              setIsCollapsed(false);
            }}
            onInsertAtIndex={(index) => {
              setInsertTargetIndex(index);
              setActiveDockTab('add');
              setIsCollapsed(false);
            }}
            zoom={zoomLevel}
          />
        </div>

        {/* Backdrop for Drawer on compact screens */}
        {isCompact && !isCollapsed && (
          <div
            onClick={() => setIsCollapsed(true)}
            style={{
              position: 'fixed',
              inset: 0,
              top: isMobile ? 52 : 56,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 90,
            }}
          />
        )}

        {/* Backdrop for Properties Panel on compact screens */}
        {isCompact && selectedNode && (
          <div
            onClick={() => onSelectNode(null)}
            style={{
              position: 'fixed',
              inset: 0,
              top: isMobile ? 52 : 56,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 90,
            }}
          />
        )}

        {/* 4. RIGHT PROPERTIES PANEL */}
        <div
          className="sitex-properties-panel-wrap"
          style={{
            display: isCompact && !selectedNode ? 'none' : 'flex',
            height: '100%',
          }}
        >
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateProps={onUpdateNodeProps}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
            onMoveNode={onMoveNode}
            onClose={() => onSelectNode(null)}
            totalNodesCount={nodes.length}
          />
        </div>
      </div>
    </>
  );
}
