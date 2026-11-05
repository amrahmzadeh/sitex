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
  PanelLeftClose,
  PanelLeftOpen,
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
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function LivePreviewEngine({
  theme,
  siteData,
  viewport,
  onViewportChange,
  onSelectComponent,
  isSidebarCollapsed,
  onToggleSidebar,
}: LivePreviewEngineProps) {
  const [scale, setScale] = useState<number>(100);
  const [autoFit, setAutoFit] = useState<boolean>(true);
  const [desktopPreset, setDesktopPreset] = useState<'fluid' | '1200' | '1440'>('fluid');
  const [availableWidth, setAvailableWidth] = useState<number>(1200);
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

  const isDesktopFluid = viewport === 'desktop' && desktopPreset === 'fluid';

  const targetWidth = useMemo(() => {
    if (viewport === 'mobile') return 375;
    if (viewport === 'tablet') return 768;
    if (desktopPreset === '1440') return 1440;
    if (desktopPreset === '1200') return 1200;
    return availableWidth > 0 ? availableWidth : 1200;
  }, [viewport, desktopPreset, availableWidth]);

  const autoScale = useMemo(() => {
    if (isDesktopFluid) return 1;
    if (!availableWidth || availableWidth <= 0) return 1;
    const padding = viewport === 'desktop' ? 16 : 32;
    const maxAvailable = availableWidth - padding;
    if (maxAvailable >= targetWidth) return 1;
    const fit = maxAvailable / targetWidth;
    return Math.min(1, Math.max(0.35, parseFloat(fit.toFixed(2))));
  }, [availableWidth, targetWidth, viewport, isDesktopFluid]);

  const effectiveScale = isDesktopFluid
    ? (autoFit ? 1 : scale / 100)
    : (autoFit ? autoScale : scale / 100);

  const displayPercent = isDesktopFluid && autoFit
    ? 100
    : Math.round(effectiveScale * 100);

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
        {/* Left Side: Sidebar Toggle & Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              title={isSidebarCollapsed ? 'Redaktoru Aç' : 'Tam Ekran Önizləmə (Redaktoru Gizlə)'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 9px',
                borderRadius: 6,
                border: isSidebarCollapsed ? '1px solid #00D37D' : '1px solid #323548',
                background: isSidebarCollapsed ? 'rgba(0,211,125,0.15)' : '#1F2230',
                color: isSidebarCollapsed ? '#00D37D' : '#8888A0',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
              <span>{isSidebarCollapsed ? 'Redaktor' : 'Geniş'}</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#10121C', padding: 3, borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => {
                onViewportChange('desktop');
                setDesktopPreset('fluid');
                setAutoFit(true);
                setScale(100);
              }}
              title="Masaüstü (Tam Responsive)"
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
              onClick={() => {
                onViewportChange('tablet');
                setAutoFit(true);
              }}
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
              onClick={() => {
                onViewportChange('mobile');
                setAutoFit(true);
              }}
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

          {/* Desktop Responsive Presets (Fluid vs Fixed) */}
          {viewport === 'desktop' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#10121C', padding: 2, borderRadius: 6 }}>
              <button
                type="button"
                onClick={() => {
                  setDesktopPreset('fluid');
                  setAutoFit(true);
                  setScale(100);
                }}
                title="Tam Genişlik (Responsive)"
                style={{
                  padding: '3px 7px',
                  borderRadius: 4,
                  border: 'none',
                  background: desktopPreset === 'fluid' ? '#25293A' : 'transparent',
                  color: desktopPreset === 'fluid' ? '#00D37D' : '#8888A0',
                  fontSize: 10,
                  fontWeight: desktopPreset === 'fluid' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesktopPreset('1200');
                  setAutoFit(true);
                }}
                title="1200px Standart Ekran"
                style={{
                  padding: '3px 7px',
                  borderRadius: 4,
                  border: 'none',
                  background: desktopPreset === '1200' ? '#25293A' : 'transparent',
                  color: desktopPreset === '1200' ? '#00D37D' : '#8888A0',
                  fontSize: 10,
                  fontWeight: desktopPreset === '1200' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                1200px
              </button>
              <button
                type="button"
                onClick={() => {
                  setDesktopPreset('1440');
                  setAutoFit(true);
                }}
                title="1440px Geniş Ekran"
                style={{
                  padding: '3px 7px',
                  borderRadius: 4,
                  border: 'none',
                  background: desktopPreset === '1440' ? '#25293A' : 'transparent',
                  color: desktopPreset === '1440' ? '#00D37D' : '#8888A0',
                  fontSize: 10,
                  fontWeight: desktopPreset === '1440' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                1440px
              </button>
            </div>
          )}
        </div>

        {/* Page Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
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
            {inspectMode ? 'Müfəttiş' : 'Müfəttiş'}
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
                  if (viewport === 'desktop') {
                    setDesktopPreset('fluid');
                  }
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
              {isDesktopFluid && autoFit
                ? `100% (${availableWidth}px)`
                : autoFit
                ? `Uyğun (${displayPercent}%)`
                : `${displayPercent}%`}
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
        .sitex-preview-canvas h1,
        .sitex-preview-canvas h2,
        .sitex-preview-canvas h3,
        .sitex-preview-canvas h4,
        .sitex-preview-canvas p {
          overflow-wrap: break-word !important;
          word-break: normal !important;
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
          padding:
            isDesktopFluid && effectiveScale === 1
              ? 0
              : viewport === 'mobile'
              ? '24px 16px'
              : '16px 12px',
          background: '#0B0D13',
        }}
      >
        <div
          style={{
            width:
              isDesktopFluid && effectiveScale === 1
                ? '100%'
                : Math.round(targetWidth * effectiveScale),
            height:
              viewport === 'mobile'
                ? Math.round(844 * effectiveScale)
                : viewport === 'tablet'
                ? Math.round(1024 * effectiveScale)
                : '100%',
            minHeight: viewport === 'desktop' ? '100%' : undefined,
            flexShrink: 0,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            margin: '0 auto',
          }}
        >
          <div
            className="sitex-preview-canvas"
            style={{
              width: isDesktopFluid && effectiveScale === 1 ? '100%' : `${targetWidth}px`,
              maxWidth: isDesktopFluid ? '100%' : undefined,
              height:
                viewport === 'mobile'
                  ? '844px'
                  : viewport === 'tablet'
                  ? '1024px'
                  : effectiveScale === 1
                  ? '100%'
                  : `${Math.round(100 / effectiveScale)}%`,
              minHeight:
                viewport === 'desktop'
                  ? effectiveScale === 1
                    ? '100%'
                    : `${Math.round(100 / effectiveScale)}%`
                  : undefined,
              transform: effectiveScale === 1 ? 'none' : `scale(${effectiveScale})`,
              transformOrigin: 'top center',
              transition: 'width 0.2s ease, transform 0.2s ease',
              borderRadius:
                viewport === 'mobile'
                  ? 36
                  : viewport === 'tablet'
                  ? 24
                  : isDesktopFluid && effectiveScale === 1
                  ? 0
                  : 8,
              border:
                viewport !== 'desktop'
                  ? '8px solid #232738'
                  : isDesktopFluid && effectiveScale === 1
                  ? 'none'
                  : '1px solid #282A3A',
              boxShadow:
                viewport !== 'desktop'
                  ? '0 25px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px #383D55'
                  : isDesktopFluid && effectiveScale === 1
                  ? 'none'
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
