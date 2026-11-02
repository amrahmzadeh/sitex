'use client';

import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  MousePointer,
  Sparkles,
  Check,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import RestaurantSite, { SiteData } from '@/components/themes/RestaurantSite';
import { ViewportMode, ComponentTarget } from './types';

interface LivePreviewEngineProps {
  theme: ThemeConfig;
  siteData?: SiteData | null;
  slug?: string;
  viewport: ViewportMode;
  onViewportChange: (vp: ViewportMode) => void;
  selectedComponent?: ComponentTarget;
  onSelectComponent?: (comp: ComponentTarget) => void;
}

export default function LivePreviewEngine({
  theme,
  siteData,
  slug,
  viewport,
  onViewportChange,
  selectedComponent,
  onSelectComponent,
}: LivePreviewEngineProps) {
  const [scale, setScale] = useState<number>(100);
  const [inspectMode, setInspectMode] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<'home' | 'menu' | 'about' | 'contact'>('home');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const effectiveSiteData = React.useMemo(() => {
    if (!siteData) return null;
    return {
      ...siteData,
      website: {
        ...siteData.website,
        theme: {
          ...theme,
        },
      },
    };
  }, [siteData, theme]);

  // Viewport widths
  const containerWidth =
    viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0E1017',
        borderRadius: 12,
        border: '1px solid #282A3A',
        overflow: 'hidden',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 99999 : undefined,
      }}
    >
      {/* Top Preview Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: '#161824',
          borderBottom: '1px solid #282A3A',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {/* Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10121C', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => onViewportChange('desktop')}
            title="Masaüstü (100%)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: 'none',
              background: viewport === 'desktop' ? '#00D37D' : 'transparent',
              color: viewport === 'desktop' ? '#000000' : '#8888A0',
              fontWeight: viewport === 'desktop' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Monitor size={14} />
            Masaüstü
          </button>
          <button
            type="button"
            onClick={() => onViewportChange('tablet')}
            title="Planşet (768px)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: 'none',
              background: viewport === 'tablet' ? '#00D37D' : 'transparent',
              color: viewport === 'tablet' ? '#000000' : '#8888A0',
              fontWeight: viewport === 'tablet' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Tablet size={14} />
            Planşet
          </button>
          <button
            type="button"
            onClick={() => onViewportChange('mobile')}
            title="Mobil (375px)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: 'none',
              background: viewport === 'mobile' ? '#00D37D' : 'transparent',
              color: viewport === 'mobile' ? '#000000' : '#8888A0',
              fontWeight: viewport === 'mobile' ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Smartphone size={14} />
            Mobil
          </button>
        </div>

        {/* Page Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { id: 'home', label: 'Ana Səhifə' },
            { id: 'menu', label: 'Menyu' },
            { id: 'about', label: 'Haqqımızda' },
            { id: 'contact', label: 'Əlaqə' },
          ].map((pg) => (
            <button
              key={pg.id}
              type="button"
              onClick={() => setActivePage(pg.id as any)}
              style={{
                padding: '4px 8px',
                borderRadius: 5,
                border: 'none',
                background: activePage === pg.id ? 'rgba(0,211,125,0.12)' : 'transparent',
                color: activePage === pg.id ? '#00D37D' : '#8888A0',
                fontSize: 11,
                fontWeight: activePage === pg.id ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {pg.label}
            </button>
          ))}
        </div>

        {/* Zoom & Inspect Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setInspectMode(!inspectMode)}
            title="Element Müfəttişi Rejimi"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 8px',
              borderRadius: 6,
              border: '1px solid #323548',
              background: inspectMode ? 'rgba(0,211,125,0.15)' : '#1F2230',
              color: inspectMode ? '#00D37D' : '#8888A0',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <MousePointer size={12} />
            {inspectMode ? 'Müfəttiş Aktiv' : 'Müfəttiş'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#1F2230', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(50, s - 10))}
              style={{ padding: '3px 6px', border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}
            >
              <ZoomOut size={12} />
            </button>
            <span style={{ fontSize: 11, color: '#FFFFFF', minWidth: 32, textAlign: 'center', fontFamily: 'monospace' }}>
              {scale}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(120, s + 10))}
              style={{ padding: '3px 6px', border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}
            >
              <ZoomIn size={12} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Tam ekrandan çıx' : 'Tam ekran'}
            style={{
              padding: 6,
              borderRadius: 6,
              border: '1px solid #323548',
              background: '#1F2230',
              color: '#8888A0',
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Scoped Preview Containment Styles */}
      <style>{`
        .sitex-preview-canvas header {
          position: sticky !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 50 !important;
        }
      `}</style>

      {/* Canvas Viewport Frame */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: viewport === 'desktop' ? 'flex-start' : 'center',
          padding: viewport === 'desktop' ? 0 : 24,
          background: '#0B0D13',
        }}
      >
        <div
          className="sitex-preview-canvas"
          style={{
            width: containerWidth,
            maxWidth: '100%',
            height: viewport === 'desktop' ? '100%' : '844px',
            transform: scale !== 100 ? `scale(${scale / 100})` : 'translateZ(0)',
            transformOrigin: 'top center',
            transition: 'width 0.25s ease',
            borderRadius: viewport === 'mobile' ? 36 : viewport === 'tablet' ? 24 : 0,
            border:
              viewport !== 'desktop'
                ? '8px solid #232738'
                : '1px solid #282A3A',
            boxShadow:
              viewport !== 'desktop'
                ? '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px #383D55'
                : 'none',
            overflow: 'hidden',
            position: 'relative',
            isolation: 'isolate',
            contain: 'paint layout',
            background: theme.backgroundColor || '#FFFFFF',
          }}
        >
          {/* Mobile phone camera notch */}
          {viewport === 'mobile' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 20,
                background: '#232738',
                borderRadius: '0 0 14px 14px',
                zIndex: 100,
              }}
            />
          )}

          {/* Site Rendering */}
          <div
            className="sitex-preview-canvas"
            style={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              position: 'relative',
              transform: 'translateZ(0)',
              isolation: 'isolate',
              contain: 'paint layout',
            }}
            onClick={(e) => {
              if (inspectMode && onSelectComponent) {
                const target = (e.target as HTMLElement).closest('[data-component-type]');
                if (target) {
                  const compType = target.getAttribute('data-component-type') as ComponentTarget;
                  if (compType) onSelectComponent(compType);
                }
              }
            }}
          >
            {effectiveSiteData ? (
              <RestaurantSite data={effectiveSiteData} />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>
                <p>Sayt məlumatları yüklənir...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
