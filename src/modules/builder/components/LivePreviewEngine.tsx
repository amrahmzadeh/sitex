'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Utensils,
  BookOpen,
  Phone,
  Layers,
  Palette,
  Eye,
  Sliders,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  DollarSign,
  LogIn,
  AlertOctagon,
  MousePointerClick,
} from 'lucide-react';
import { GlobalDesignTokens, DeviceMode } from '../types';

interface LivePreviewEngineProps {
  tokens: GlobalDesignTokens;
  compiledCss?: string;
  hasUnsavedChanges?: boolean;
  onInspectToken?: (tokenKey: string) => void;
}

export function LivePreviewEngine({
  tokens,
  compiledCss = '',
  hasUnsavedChanges = false,
  onInspectToken,
}: LivePreviewEngineProps) {
  const [activePage, setActivePage] = useState<
    'home' | 'menu' | 'blog' | 'pricing' | 'auth' | 'not_found' | 'components'
  >('home');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [previewThemeMode, setPreviewThemeMode] = useState<'light' | 'dark'>('dark');
  const [inspectMode, setInspectMode] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getContainerDimensions = () => {
    if (device === 'mobile') {
      return orientation === 'portrait' ? { width: 375, height: 667 } : { width: 667, height: 375 };
    }
    if (device === 'tablet') {
      return orientation === 'portrait' ? { width: 768, height: 1024 } : { width: 1024, height: 768 };
    }
    return { width: '100%', height: '100%' };
  };

  const dims = getContainerDimensions();
  const c = tokens.colors;
  const t = tokens.typography;
  const l = tokens.layout;

  // Build the complete self-contained HTML for the sandboxed iframe
  const buildIframeHtml = () => {
    return `<!DOCTYPE html>
<html lang="az" data-theme="${previewThemeMode}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${previewThemeMode === 'dark' ? c.background : '#FFFFFF'};
      color: ${previewThemeMode === 'dark' ? c.text : '#111315'};
      font-family: '${t.bodyFont}', Inter, sans-serif;
      font-size: ${t.baseSize};
      line-height: ${t.lineHeight || '1.6'};
      overflow-x: hidden;
      transition: background 0.2s ease, color 0.2s ease;
    }
    h1, h2, h3, h4, h5 {
      font-family: '${t.headingFont}', Outfit, sans-serif;
      letter-spacing: -0.02em;
    }
    .inspect-hover:hover {
      outline: 2px dashed #00D37D !important;
      outline-offset: 2px;
      cursor: crosshair !important;
    }
    ${compiledCss}
  </style>
</head>
<body class="sitex-theme-preview" data-theme="${previewThemeMode}">
  <div id="root">
    <!-- Header -->
    <header style="padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); background: ${previewThemeMode === 'dark' ? 'rgba(255,255,255,0.04)' : '#FFFFFF'}; backdrop-filter: blur(12px);">
      <div style="display: flex; align-items: center; gap: 10px;" class="inspect-elem" data-token="colors.primary">
        <div style="width: 34px; height: 34px; border-radius: 8px; background: ${c.primary}; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #000;">
          SX
        </div>
        <span style="font-family: '${t.headingFont}'; font-size: 18px; font-weight: 700;">SiteX Premium</span>
      </div>
      <nav style="display: flex; gap: 20px; font-size: 14px;">
        <span style="cursor: pointer; font-weight: 600;">Ana Səhifə</span>
        <span style="cursor: pointer; opacity: 0.8;">Məhsullar</span>
        <span style="cursor: pointer; opacity: 0.8;">Qiymətlər</span>
        <span style="cursor: pointer; opacity: 0.8;">Bloq</span>
      </nav>
      <button class="sitex-btn inspect-elem" data-token="components.button" style="padding: 8px 18px; border-radius: ${l.borderRadius}; background: ${c.primary}; color: #000; border: none; font-weight: 700; cursor: pointer;">
        Başla
      </button>
    </header>

    <!-- Dynamic Page Content -->
    ${
      activePage === 'home'
        ? `
      <section style="padding: 80px 32px; text-align: center; max-width: 900px; margin: 0 auto;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background: rgba(0,211,125,0.12); color: ${c.primary}; font-size: 12px; font-weight: 700; margin-bottom: 16px;">
          YENİ NƏSİL VEB DİZAYN
        </span>
        <h1 style="font-size: 44px; font-weight: 800; margin-bottom: 20px; line-height: 1.15;">
          Müasir & Peşəkar Saytınızı Dərhal Yaradın
        </h1>
        <p style="font-size: 18px; opacity: 0.8; margin-bottom: 32px;">
          SiteX Theme Builder ilə brendinizə uyğun premium rənglər, şriftlər və adaptiv bloklar qurun.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="sitex-btn" style="padding: 12px 28px; border-radius: ${l.borderRadius}; background: ${c.primary}; color: #000; border: none; font-weight: 700; cursor: pointer;">
            Pulsuz Başla
          </button>
          <button style="padding: 12px 28px; border-radius: ${l.borderRadius}; background: transparent; color: ${c.text}; border: 1px solid rgba(255,255,255,0.2); font-weight: 600; cursor: pointer;">
            Daha Ətraflı
          </button>
        </div>
      </section>
      `
        : activePage === 'pricing'
        ? `
      <section style="padding: 60px 32px; text-align: center;">
        <h2 style="font-size: 36px; font-weight: 800; margin-bottom: 12px;">Şəffaf və Əlçatan Qiymətlər</h2>
        <p style="opacity: 0.8; margin-bottom: 40px;">Biznesinizə uyğun paketi seçin.</p>
        <div style="display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;">
          <div class="sitex-card" style="width: 280px; padding: 32px 24px; border-radius: ${l.borderRadius}; background: ${c.surface}; text-align: left; border: 1px solid rgba(255,255,255,0.08);">
            <h3 style="font-size: 20px; margin-bottom: 8px;">Başlanğıc</h3>
            <div style="font-size: 32px; font-weight: 800; color: ${c.primary}; margin-bottom: 16px;">0 AZN<span style="font-size: 14px; opacity: 0.7;">/ay</span></div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 14px; opacity: 0.8; margin-bottom: 24px;">
              <li>✓ 1 Sayt</li>
              <li>✓ STL Dəstəyi</li>
              <li>✓ Standart SSL</li>
            </ul>
            <button class="sitex-btn" style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.1); color: #FFF; border: none; font-weight: 700; cursor: pointer;">Seç</button>
          </div>
          <div class="sitex-card" style="width: 280px; padding: 32px 24px; border-radius: ${l.borderRadius}; background: ${c.surface}; text-align: left; border: 2px solid ${c.primary};">
            <h3 style="font-size: 20px; margin-bottom: 8px;">Pro Ekspert</h3>
            <div style="font-size: 32px; font-weight: 800; color: ${c.primary}; margin-bottom: 16px;">29 AZN<span style="font-size: 14px; opacity: 0.7;">/ay</span></div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px; font-size: 14px; opacity: 0.8; margin-bottom: 24px;">
              <li>✓ Limitsiz Saytlar</li>
              <li>✓ Xüsusi Domen</li>
              <li>✓ 24/7 Prioritet Dəstək</li>
            </ul>
            <button class="sitex-btn" style="width: 100%; padding: 10px; border-radius: 8px; background: ${c.primary}; color: #000; border: none; font-weight: 700; cursor: pointer;">Seç</button>
          </div>
        </div>
      </section>
      `
        : activePage === 'blog'
        ? `
      <section style="padding: 60px 32px; max-width: 900px; margin: 0 auto;">
        <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 24px;">Son Məqalələr və Bələdçilər</h2>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="sitex-card" style="padding: 24px; border-radius: ${l.borderRadius}; background: ${c.surface}; border: 1px solid rgba(255,255,255,0.06);">
            <span style="color: ${c.primary}; font-size: 12px; font-weight: 700;">DİZAYN SİSTEMLƏRİ</span>
            <h3 style="font-size: 20px; margin: 8px 0;">SiteX Theme Language ilə dizayn tokenlərinin gücü</h3>
            <p style="opacity: 0.8; font-size: 14px;">STL dilində dəyişənlər və modullu şkalalar ilə veb dizaynı necə sürətləndirmək olar?</p>
          </div>
          <div class="sitex-card" style="padding: 24px; border-radius: ${l.borderRadius}; background: ${c.surface}; border: 1px solid rgba(255,255,255,0.06);">
            <span style="color: ${c.accent}; font-size: 12px; font-weight: 700;">PERFORMANS</span>
            <h3 style="font-size: 20px; margin: 8px 0;">WCAG 2.2 uyğunluğu və rəng kontrastı</h3>
            <p style="opacity: 0.8; font-size: 14px;">İstifadəçiləriniz üçün həm estetik, həm də əlçatan interfeys yaratmağın yolları.</p>
          </div>
        </div>
      </section>
      `
        : activePage === 'auth'
        ? `
      <section style="padding: 80px 20px; display: flex; justify-content: center;">
        <div class="sitex-card" style="width: 360px; padding: 32px; border-radius: ${l.borderRadius}; background: ${c.surface}; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">Hesaba Giriş</h2>
          <p style="font-size: 13px; opacity: 0.7; margin-bottom: 24px;">SiteX panelinizə daxil olun</p>
          <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; margin-bottom: 20px;">
            <label style="font-size: 12px; font-weight: 600;">E-poçt ünvanı</label>
            <input type="email" placeholder="ad@sirket.az" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #FFF; outline: none;" />
            <label style="font-size: 12px; font-weight: 600;">Şifrə</label>
            <input type="password" placeholder="••••••••" style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.2); color: #FFF; outline: none;" />
          </div>
          <button class="sitex-btn" style="width: 100%; padding: 12px; border-radius: 8px; background: ${c.primary}; color: #000; border: none; font-weight: 700; cursor: pointer;">Daxil Ol</button>
        </div>
      </section>
      `
        : activePage === 'not_found'
        ? `
      <section style="padding: 100px 32px; text-align: center;">
        <h1 style="font-size: 72px; font-weight: 800; color: ${c.primary}; line-height: 1;">404</h1>
        <h2 style="font-size: 28px; margin: 16px 0;">Səhifə Tapılmadı</h2>
        <p style="opacity: 0.8; margin-bottom: 28px;">Axtardığınız səhifə silinib və ya ünvanı dəyişdirilib.</p>
        <button class="sitex-btn" style="padding: 10px 24px; border-radius: ${l.borderRadius}; background: ${c.primary}; color: #000; border: none; font-weight: 700; cursor: pointer;">Ana Səhifəyə Qayıt</button>
      </section>
      `
        : `
      <!-- Components Palette -->
      <section style="padding: 40px 32px;">
        <h2 style="font-size: 28px; margin-bottom: 20px;">Dizayn Komponentləri Palitrası</h2>
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <button class="sitex-btn" style="padding: 10px 20px; border-radius: ${l.borderRadius}; background: ${c.primary}; color: #000; border: none; font-weight: 700;">Primary Button</button>
          <button style="padding: 10px 20px; border-radius: ${l.borderRadius}; background: ${c.secondary}; color: #FFF; border: none; font-weight: 700;">Secondary Button</button>
          <button style="padding: 10px 20px; border-radius: ${l.borderRadius}; background: ${c.accent}; color: #000; border: none; font-weight: 700;">Accent Button</button>
        </div>
      </section>
      `
    }
  </div>

  <script>
    // Inspect to edit listener
    window.addEventListener('click', (e) => {
      const target = e.target.closest('[data-token]');
      if (target) {
        const token = target.getAttribute('data-token');
        window.parent.postMessage({ type: 'INSPECT_TOKEN', token: token }, '*');
      }
    });

    // Parent postMessage receiver
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_THEME') {
        document.documentElement.setAttribute('data-theme', event.data.themeMode);
      }
    });
  </script>
</body>
</html>`;
  };

  // Sync postMessage on mode change without full reload
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'UPDATE_THEME', themeMode: previewThemeMode },
        '*'
      );
    }
  }, [previewThemeMode]);

  // Listen for inspect element messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'INSPECT_TOKEN' && onInspectToken) {
        onInspectToken(e.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onInspectToken]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: 'calc(100vh - 56px)',
        background: '#0D0E11',
        overflow: 'hidden',
      }}
    >
      {/* Top Controls Bar */}
      <div
        style={{
          height: 48,
          background: '#13151A',
          borderBottom: '1px solid #22262E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}
      >
        {/* Page Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { id: 'home', label: 'Ana Səhifə', icon: Sparkles },
            { id: 'pricing', label: 'Qiymətlər', icon: DollarSign },
            { id: 'blog', label: 'Bloq', icon: FileText },
            { id: 'auth', label: 'Giriş', icon: LogIn },
            { id: 'not_found', label: '404', icon: AlertOctagon },
            { id: 'components', label: 'Komponentlər', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePage(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: isActive ? '1px solid #00D37D' : '1px solid transparent',
                  background: isActive ? 'rgba(0,211,125,0.12)' : 'transparent',
                  color: isActive ? '#00D37D' : '#8888A0',
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Device, Mode, Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setPreviewThemeMode(previewThemeMode === 'dark' ? 'light' : 'dark')}
            title="İşıqlı / Qaranlıq Rejim Simulyasiyası"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #282C35',
              background: '#0B0C0E',
              color: '#FFF',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {previewThemeMode === 'dark' ? (
              <Moon size={14} color="#00D37D" />
            ) : (
              <Sun size={14} color="#FBBF24" />
            )}
            <span style={{ textTransform: 'capitalize' }}>{previewThemeMode}</span>
          </button>

          {/* Zoom Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#0B0C0E',
              padding: '2px 6px',
              borderRadius: 6,
              border: '1px solid #22262E',
            }}
          >
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}
            >
              <ZoomOut size={13} />
            </button>
            <span style={{ fontSize: 11, color: '#FFF', minWidth: 34, textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Device Switcher */}
          <div
            style={{
              display: 'flex',
              background: '#0B0C0E',
              padding: 2,
              borderRadius: 8,
              border: '1px solid #22262E',
            }}
          >
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: device === 'desktop' ? '#1E222A' : 'transparent',
                color: device === 'desktop' ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
              }}
              title="Desktop"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: device === 'tablet' ? '#1E222A' : 'transparent',
                color: device === 'tablet' ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
              }}
              title="Planşet"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: device === 'mobile' ? '#1E222A' : 'transparent',
                color: device === 'mobile' ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
              }}
              title="Mobil"
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Orientation Toggle for Mobile/Tablet */}
          {device !== 'desktop' && (
            <button
              type="button"
              onClick={() =>
                setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')
              }
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #282C35',
                background: '#0B0C0E',
                color: '#8888A0',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
            </button>
          )}

          {hasUnsavedChanges && (
            <span
              style={{
                fontSize: 11,
                color: '#FBBF24',
                background: 'rgba(251,191,36,0.1)',
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid rgba(251,191,36,0.2)',
              }}
            >
              ● Dəyişikliklər var
            </span>
          )}
        </div>
      </div>

      {/* Sandboxed iFrame Viewport Canvas */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#07080A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: device === 'desktop' ? 'stretch' : 'center',
          padding: device === 'desktop' ? 0 : 24,
        }}
      >
        <div
          style={{
            width: dims.width,
            height: dims.height,
            maxWidth: '100%',
            transition: 'width 0.3s ease, height 0.3s ease',
            borderRadius: device === 'desktop' ? 0 : 16,
            overflow: 'hidden',
            boxShadow:
              device === 'desktop'
                ? 'none'
                : '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={buildIframeHtml()}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: previewThemeMode === 'dark' ? c.background : '#FFFFFF',
            }}
            title="Live Theme Preview"
          />
        </div>
      </div>
    </div>
  );
}
