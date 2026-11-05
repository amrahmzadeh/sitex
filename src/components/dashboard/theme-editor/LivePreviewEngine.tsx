'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MousePointer,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import RestaurantSite, { SiteData } from '@/components/themes/RestaurantSite';
import { isEnterpriseServiceCategory, isMenuActive, SiteContext } from '@/modules/navigation';
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
  viewport,
  onViewportChange,
  onSelectComponent,
}: LivePreviewEngineProps) {
  const [scale, setScale] = useState<number>(100);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [availableWidth, setAvailableWidth] = useState<number>(800);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [inspectMode, setInspectMode] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<'home' | 'menu' | 'about' | 'contact' | 'services'>('home');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el) {
        setAvailableWidth(el.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const targetWidth =
    viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : 1200;

  const autoScale = useMemo(() => {
    if (!availableWidth || availableWidth <= 0) return 1;
    const padding = viewport === 'desktop' ? 16 : 32;
    const fit = (availableWidth - padding) / targetWidth;
    return Math.min(1, Math.max(0.35, parseFloat(fit.toFixed(2))));
  }, [availableWidth, targetWidth, viewport]);

  const effectiveScale = autoFit ? autoScale : scale / 100;
  const displayPercent = Math.round(effectiveScale * 100);

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

  const previewPages = React.useMemo(() => {
    const isSpeechAcademy =
      theme.id === 'mehinIsmayilova' ||
      theme.proTemplateId === 'speech-academy' ||
      theme.templateId === 'speech-academy' ||
      theme.proTemplateId === 'mehin-ismayilova';
    const isEnterprise =
      isEnterpriseServiceCategory(
        siteData?.organization?.siteCategory,
        siteData?.organization?.siteSubcategory
      ) ||
      siteData?.organization?.siteSubcategory === 'otel-ve-turizm' ||
      isSpeechAcademy;

    const hasMenu =
      !isEnterprise ||
      isMenuActive({
        id: siteData?.organization?.id,
        category: siteData?.organization?.siteCategory,
        subcategory: siteData?.organization?.siteSubcategory,
        website: siteData?.website as unknown as SiteContext['website'],
      });

    const pages = [{ id: 'home', label: 'Ana Səhifə' }];
    if (isEnterprise) {
      pages.push({ id: 'services', label: 'Xidmətlər' });
      if (hasMenu) {
        pages.push({ id: 'menu', label: 'Menyu' });
      }
    } else {
      pages.push({ id: 'menu', label: 'Menyu' });
    }
    pages.push({ id: 'about', label: 'Haqqımızda' });
    pages.push({ id: 'contact', label: 'Əlaqə' });
    return pages;
  }, [theme, siteData]);

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
          {previewPages.map((pg) => (
            <button
              key={pg.id}
              type="button"
              onClick={() => setActivePage(pg.id as 'home' | 'menu' | 'about' | 'contact' | 'services')}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#1F2230', padding: 2, borderRadius: 6 }}>
            <button
              type="button"
              onClick={() => {
                setAutoFit(false);
                setScale((s) => Math.max(30, s - 10));
              }}
              title="Kiçilt (-10%)"
              style={{ padding: '3px 6px', border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}
            >
              <ZoomOut size={12} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (autoFit) {
                  setAutoFit(false);
                  setScale(100);
                } else {
                  setAutoFit(true);
                }
              }}
              title={autoFit ? '100% miqyasa keç' : 'Ekrana uyğunlaşdır (Auto-fit)'}
              style={{
                fontSize: 11,
                color: autoFit ? '#00D37D' : '#FFFFFF',
                background: autoFit ? 'rgba(0,211,125,0.15)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {autoFit ? `Uyğun (${displayPercent}%)` : `${displayPercent}%`}
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoFit(false);
                setScale((s) => Math.min(150, s + 10));
              }}
              title="Böyüt (+10%)"
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
        .sitex-preview-canvas {
          container-type: inline-size;
          container-name: sitexpreview;
        }
        .sitex-preview-canvas header,
        .sitex-preview-canvas [data-theme-header] {
          position: relative !important;
          top: 0 !important;
          left: auto !important;
          right: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          z-index: 10 !important;
        }
        .sitex-preview-canvas header button,
        .sitex-preview-canvas header a,
        .sitex-preview-canvas nav button,
        .sitex-preview-canvas nav a {
          white-space: nowrap !important;
          word-break: keep-all !important;
        }
        @container sitexpreview (max-width: 900px) {
          .randevu-desktop-nav,
          .theme-desktop-nav {
            display: none !important;
          }
          .randevu-phone-link {
            display: none !important;
          }
          .randevu-mobile-menu-btn,
          .theme-mobile-nav-btn {
            display: flex !important;
          }
        }
        .sitex-preview-canvas .restaurant-site-container,
        .sitex-preview-canvas .pro-restaurant-site,
        .sitex-preview-canvas .speech-academy-root {
          overflow-x: clip !important;
          position: relative !important;
          width: 100% !important;
          max-width: 100% !important;
        }
      `}</style>

      {/* Canvas Viewport Frame */}
      <div
        ref={viewportRef}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: viewport === 'mobile' ? '24px 16px' : '16px 12px',
          background: '#0B0D13',
        }}
      >
        <div
          style={{
            width: Math.round(targetWidth * effectiveScale),
            height:
              viewport === 'mobile'
                ? Math.round(844 * effectiveScale)
                : viewport === 'tablet'
                ? Math.round(1024 * effectiveScale)
                : '100%',
            minHeight:
              viewport === 'desktop'
                ? '100%'
                : undefined,
            flexShrink: 0,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            className="sitex-preview-canvas"
            style={{
              width: `${targetWidth}px`,
              height:
                viewport === 'mobile'
                  ? '844px'
                  : viewport === 'tablet'
                  ? '1024px'
                  : `${Math.round(100 / effectiveScale)}%`,
              minHeight:
                viewport === 'desktop'
                  ? `${Math.round(100 / effectiveScale)}%`
                  : undefined,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              transition: 'width 0.2s ease',
              borderRadius: viewport === 'mobile' ? 36 : viewport === 'tablet' ? 24 : 8,
              border:
                viewport !== 'desktop'
                  ? '8px solid #232738'
                  : '1px solid #282A3A',
              boxShadow:
                viewport !== 'desktop'
                  ? '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px #383D55'
                  : '0 10px 30px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              position: 'relative',
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
              style={{
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                position: 'relative',
                transform: 'translateZ(0)',
                isolation: 'isolate',
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
    </div>
  );
}
