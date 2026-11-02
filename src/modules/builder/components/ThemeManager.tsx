'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  Globe,
  Download,
  Upload,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Code,
  Palette,
  Eye,
  Check,
} from 'lucide-react';
import { ThemeDefinition } from '../../themes/types';
import { listThemes, getTheme, registerTheme } from '../../themes/registry';
import { themeConfigToSTL } from '../../stl';
import { BuilderTemplateDocument } from '../types';

interface ThemeManagerProps {
  currentThemeId: string;
  onSelectTheme: (theme: ThemeDefinition) => void;
  onOpenVisualBuilder: () => void;
  onOpenCodeEditor: () => void;
  onExportTheme: () => void;
  onImportTheme: () => void;
  orgId?: string | null;
}

export function ThemeManager({
  currentThemeId,
  onSelectTheme,
  onOpenVisualBuilder,
  onOpenCodeEditor,
  onExportTheme,
  onImportTheme,
  orgId,
}: ThemeManagerProps) {
  const [themes, setThemes] = useState<ThemeDefinition[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'builtin' | 'custom'>('all');
  const [activeThemeId, setActiveThemeId] = useState<string>(currentThemeId);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Theme Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [cloneFromId, setCloneFromId] = useState<string>('elegant');

  const refreshThemes = () => {
    const list = listThemes();
    setThemes(list);
  };

  useEffect(() => {
    refreshThemes();
  }, []);

  const handleCreateNewTheme = () => {
    if (!newThemeName.trim()) return;

    const baseTheme = getTheme(cloneFromId) || themes[0];
    const newId = 'custom-' + Date.now();
    const newSlug = newThemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const created: ThemeDefinition = {
      ...baseTheme,
      id: newId,
      name: newThemeName,
      slug: newSlug,
      description: `"${newThemeName}" xüsusi istifadəçi teması`,
      source: 'custom',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
    };

    registerTheme(created);
    refreshThemes();
    onSelectTheme(created);
    setShowNewModal(false);
    setNewThemeName('');
    setStatusMessage(`"${newThemeName}" teması uğurla yaradıldı!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDuplicate = (targetTheme: ThemeDefinition) => {
    const newId = `${targetTheme.id}-copy-${Date.now().toString().slice(-4)}`;
    const copyName = `${targetTheme.name} (Kopya)`;

    const duplicated: ThemeDefinition = {
      ...targetTheme,
      id: newId,
      name: copyName,
      slug: `${targetTheme.slug}-copy`,
      source: 'custom',
      createdAt: new Date().toISOString(),
    };

    registerTheme(duplicated);
    refreshThemes();
    setStatusMessage(`"${copyName}" kopyalandı!`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleActivateTheme = async (theme: ThemeDefinition) => {
    setActiveThemeId(theme.id);
    onSelectTheme(theme);

    if (orgId) {
      try {
        await fetch(`/api/organizations/${orgId}/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: {
              id: theme.id,
              name: theme.name,
              primaryColor: theme.tokens.colors.primary,
              secondaryColor: theme.tokens.colors.secondary,
              accentColor: theme.tokens.colors.accent,
              backgroundColor: theme.tokens.colors.background,
              textColor: theme.tokens.colors.text,
              headingFont: theme.tokens.typography.headingFont,
              bodyFont: theme.tokens.typography.bodyFont,
              borderRadius: theme.tokens.radius.borderRadius,
            },
          }),
        });
        setStatusMessage(`"${theme.name}" veb saytınız üçün aktivləşdirildi!`);
        setTimeout(() => setStatusMessage(null), 3500);
      } catch (err) {
        console.error('Tema aktivləşdirmə xətası:', err);
      }
    } else {
      setStatusMessage(`"${theme.name}" seçildi!`);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const filteredThemes = themes.filter((t) => {
    if (selectedFilter === 'builtin') return t.source === 'builtin';
    if (selectedFilter === 'custom') return t.source === 'custom';
    return true;
  });

  return (
    <div style={{ flex: 1, height: 'calc(100vh - 56px)', background: '#0D0E11', overflowY: 'auto', padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F5F5F7', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Palette size={24} color="#00D37D" />
              Tema İdarəetmə Mərkəzi
            </h1>
            <p style={{ fontSize: 14, color: '#8888A0', marginTop: 6 }}>
              Veb saytınız üçün mövcud temaları idarə edin, sıfırdan yeni tema qurun və ya STL ilə fərdiləşdirin.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onImportTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 8,
                background: '#1A1D24',
                color: '#C0C0D0',
                border: '1px solid #282C35',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Upload size={14} />
              İdxal Et
            </button>
            <button
              type="button"
              onClick={onExportTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 8,
                background: '#1A1D24',
                color: '#C0C0D0',
                border: '1px solid #282C35',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              İxrac Et
            </button>
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                background: '#00D37D',
                color: '#000',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              Yeni Tema Yarat
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 18px',
              borderRadius: 8,
              background: 'rgba(0, 211, 125, 0.12)',
              border: '1px solid #00D37D',
              color: '#00D37D',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, borderBottom: '1px solid #22262E', paddingBottom: 12 }}>
          {[
            { id: 'all', label: `Bütün Temalar (${themes.length})` },
            { id: 'builtin', label: 'Rəsmi Şablonlar' },
            { id: 'custom', label: 'Mənim Xüsusi Temalarım' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: selectedFilter === f.id ? '1px solid #00D37D' : '1px solid transparent',
                background: selectedFilter === f.id ? 'rgba(0,211,125,0.12)' : 'rgba(255,255,255,0.03)',
                color: selectedFilter === f.id ? '#00D37D' : '#8888A0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Themes Grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 24,
        }}
      >
        {filteredThemes.map((theme) => {
          const isActive = theme.id === activeThemeId;
          const primary = theme.tokens.colors.primary;
          const secondary = theme.tokens.colors.secondary;
          const bg = theme.tokens.colors.background;

          return (
            <div
              key={theme.id}
              style={{
                background: '#14161C',
                borderRadius: 14,
                border: isActive ? '2px solid #00D37D' : '1px solid #252932',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {/* Preview Gradient Strip */}
              <div
                style={{
                  height: 140,
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: 20,
                }}
              >
                <div
                  style={{
                    background: bg,
                    color: theme.tokens.colors.text,
                    padding: '12px 24px',
                    borderRadius: theme.tokens.radius.borderRadius,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    fontFamily: theme.tokens.typography.headingFont,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {theme.name}
                </div>

                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: '#00D37D',
                      color: '#000',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Check size={12} />
                    Aktiv Tema
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>{theme.name}</h3>
                  <span style={{ fontSize: 11, color: '#8888A0', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
                    v{theme.version}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#8888A0', lineHeight: 1.5, margin: '6px 0 16px', flex: 1 }}>
                  {theme.description}
                </p>

                {/* Color swatches */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                  {[primary, secondary, theme.tokens.colors.accent, bg].map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: c,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                      title={c}
                    />
                  ))}
                  <span style={{ fontSize: 11, color: '#6A6A80', alignSelf: 'center', marginLeft: 6 }}>
                    {theme.tokens.typography.headingFont} / {theme.tokens.typography.bodyFont}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #22262E', paddingTop: 14 }}>
                  <button
                    type="button"
                    onClick={() => handleActivateTheme(theme)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: isActive ? 'rgba(0,211,125,0.15)' : '#00D37D',
                      color: isActive ? '#00D37D' : '#000',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isActive ? 'Hazırda Aktivdir' : 'Aktivləşdir'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTheme(theme);
                      onOpenVisualBuilder();
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#1F232B',
                      color: '#FFF',
                      border: '1px solid #2E333D',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Vizual Redaktorda Düzəlt"
                  >
                    <Palette size={13} />
                    Düzəlt
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTheme(theme);
                      onOpenCodeEditor();
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#1F232B',
                      color: '#FFF',
                      border: '1px solid #2E333D',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="STL Kodunu Redaktə Et"
                  >
                    <Code size={13} />
                    STL
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(theme)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: '#1F232B',
                      color: '#8888A0',
                      border: '1px solid #2E333D',
                      cursor: 'pointer',
                    }}
                    title="Kopyasını Çıxar"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Theme Modal */}
      {showNewModal && (
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
          onClick={() => setShowNewModal(false)}
        >
          <div
            style={{
              width: 480,
              background: '#181B22',
              borderRadius: 16,
              border: '1px solid #2E333E',
              padding: 28,
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: '0 0 8px' }}>
              Yeni Tema Yarat
            </h3>
            <p style={{ fontSize: 13, color: '#8888A0', marginBottom: 20 }}>
              Sıfırdan unikal tema yaradın və ya hazır şablonu baza olaraq seçin.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#C0C0D0', marginBottom: 6 }}>
                  Temanın Adı
                </label>
                <input
                  type="text"
                  placeholder="Məs: Premium Lounge 2026"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#111317',
                    border: '1px solid #2E333E',
                    color: '#FFF',
                    fontSize: 14,
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#C0C0D0', marginBottom: 6 }}>
                  Baza Şablonu Seçin
                </label>
                <select
                  value={cloneFromId}
                  onChange={(e) => setCloneFromId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#111317',
                    border: '1px solid #2E333E',
                    color: '#FFF',
                    fontSize: 14,
                  }}
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.source === 'builtin' ? 'Rəsmi' : 'Xüsusi'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid #2E333E',
                    color: '#8888A0',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv Et
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewTheme}
                  disabled={!newThemeName.trim()}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 8,
                    background: newThemeName.trim() ? '#00D37D' : '#333',
                    color: '#000',
                    fontWeight: 700,
                    border: 'none',
                    fontSize: 13,
                    cursor: newThemeName.trim() ? 'pointer' : 'default',
                  }}
                >
                  Yarat və Redaktəyə Keç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

