'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Eye,
  Check,
  CheckCircle2,
  Sparkles,
  Search,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  Loader2,
  RotateCcw,
  Sliders,
  Flame,
  Layers,
  X,
  AlertCircle,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { defaultThemes, ThemeConfig } from '@/lib/themes';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';
import RestaurantSite from '@/components/themes/RestaurantSite';

interface ThemeItem extends ThemeConfig {
  source?: 'builtin' | 'custom';
  createdAt?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Bütün Temalar' },
  { id: 'restoran', label: 'Restoran və Kafe' },
  { id: 'biznes', label: 'Biznes və Şirkət' },
  { id: 'modern', label: 'Müasir və Minimal' },
  { id: 'dark', label: 'Qaranlıq (Dark)' },
  { id: 'pro', label: 'Pro Şablonlar' },
];

function ThemeMiniCard({
  theme,
  isActive,
  onPreview,
  onApply,
  onExport,
  onDelete,
  isApplying,
}: {
  theme: ThemeItem;
  isActive: boolean;
  onPreview: (theme: ThemeItem) => void;
  onApply: (theme: ThemeItem, publishImmediately?: boolean) => void;
  onExport: (theme: ThemeItem) => void;
  onDelete?: (theme: ThemeItem) => void;
  isApplying: boolean;
}) {
  const isDark =
    theme.backgroundColor === '#121416' ||
    theme.backgroundColor?.toLowerCase().startsWith('#1') ||
    theme.backgroundColor?.toLowerCase().startsWith('#2');

  const bgStyle =
    theme.siteBgType === 'gradient' && theme.siteGradientFrom && theme.siteGradientTo
      ? `linear-gradient(${theme.siteGradientDir || '135deg'}, ${theme.siteGradientFrom}, ${theme.siteGradientTo})`
      : theme.backgroundColor || '#121416';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`dash-card theme-card ${isActive ? 'is-active' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        border: isActive ? '2px solid #00D37D' : '1px solid #383334',
        background: '#1A1A1E',
        boxShadow: isActive ? '0 0 20px rgba(0, 211, 125, 0.2)' : 'none',
        position: 'relative',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Mini Visual Preview Area */}
      <div
        style={{
          height: 180,
          background: bgStyle,
          color: theme.textColor || '#FFFFFF',
          padding: 16,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
        }}
        onClick={() => onPreview(theme)}
      >
        {/* Top bar inside mini preview */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 12px',
            borderRadius: 8,
            background:
              theme.headerStyle === 'glass'
                ? 'rgba(255,255,255,0.1)'
                : theme.headerStyle === 'solid'
                ? theme.secondaryColor || '#1B1B2F'
                : 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: theme.primaryColor,
                boxShadow: `0 0 8px ${theme.primaryColor}`,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: theme.headingFont || 'sans-serif',
                color: theme.textColor || '#FFFFFF',
              }}
            >
              {theme.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ width: 12, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
            <span
              style={{
                width: 18,
                height: 10,
                borderRadius: 4,
                background: theme.primaryColor,
                display: 'inline-block',
              }}
            />
          </div>
        </div>

        {/* Hero title & badges */}
        <div style={{ padding: '6px 2px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: `${theme.primaryColor}22`,
                border: `1px solid ${theme.primaryColor}55`,
                fontSize: 9,
                fontWeight: 700,
                color: theme.primaryColor,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {theme.isProTemplate ? '✦ PRO ŞABLON' : '✦ DİZAYN'}
            </span>
            {theme.source === 'custom' && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(124, 92, 252, 0.2)',
                  border: '1px solid rgba(124, 92, 252, 0.4)',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#A78BFA',
                }}
              >
                Fərdi Tema
              </span>
            )}
          </div>
          <h4
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              fontFamily: theme.headingFont || 'sans-serif',
              color: theme.textColor,
              lineHeight: 1.2,
            }}
          >
            {theme.name}
          </h4>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: 10,
              opacity: 0.75,
              color: theme.textColor,
            }}
          >
            {theme.headingFont} + {theme.bodyFont}
          </p>
        </div>

        {/* Sample card & button */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div
            style={{
              flex: 1,
              padding: '4px 8px',
              borderRadius: theme.borderRadius || '8px',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 9, opacity: 0.9 }}>Nümunə menyu</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: theme.primaryColor }}>₼ 12.00</span>
          </div>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: theme.borderRadius || '8px',
              background: theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
              color: theme.buttonStyle === 'solid' ? (isDark ? '#0F0F14' : '#FFF') : theme.primaryColor,
              border: `1px solid ${theme.primaryColor}`,
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Sifariş
          </div>
        </div>

        {/* Hover preview overlay hint */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            opacity: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 0.2s',
            backdropFilter: 'blur(3px)',
          }}
          className="preview-hover-hint"
        >
          <span
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              background: '#00D37D',
              color: '#0F0F14',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Eye size={14} /> Tam önizləmə
          </span>
        </div>
      </div>

      {/* Card Info & Actions */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>{theme.name}</h3>
              {isActive && (
                <span
                  style={{
                    background: 'rgba(0,211,125,0.15)',
                    color: '#00D37D',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Check size={12} /> Aktiv
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#8888A0', margin: '4px 0 0', lineHeight: 1.4 }}>
              {theme.description || 'Hazır dizayn və tipoqrafiya konfiqurasiyası.'}
            </p>
          </div>
        </div>

        {/* Color Palette Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <span style={{ fontSize: 11, color: '#6E6E80' }}>Rənglər:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[theme.primaryColor, theme.secondaryColor, theme.accentColor, theme.backgroundColor].map((col, idx) => (
              <span
                key={idx}
                title={col}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: col,
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8888A0', fontFamily: 'monospace' }}>
            {theme.headingFont}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid #2A2A32' }}>
          <button
            onClick={() => onPreview(theme)}
            className="dash-btn-secondary"
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Eye size={14} /> Önizlə
          </button>

          {isActive ? (
            <button
              disabled
              style={{
                flex: 1.2,
                padding: '8px 12px',
                fontSize: 12,
                borderRadius: 10,
                border: '1px solid #00D37D',
                background: 'rgba(0,211,125,0.15)',
                color: '#00D37D',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'default',
              }}
            >
              <CheckCircle2 size={14} /> Seçilib
            </button>
          ) : (
            <button
              onClick={() => onApply(theme)}
              disabled={isApplying}
              className="dash-btn-primary"
              style={{
                flex: 1.2,
                padding: '8px 12px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {isApplying ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Sparkles size={14} />
              )}
              Aktiv et
            </button>
          )}

          {/* Export button */}
          <button
            onClick={() => onExport(theme)}
            title="Temanı JSON olaraq yüklə"
            style={{
              padding: 8,
              borderRadius: 8,
              background: '#23232B',
              border: '1px solid #383334',
              color: '#8888A0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Download size={14} />
          </button>

          {/* Delete custom theme button */}
          {theme.source === 'custom' && onDelete && (
            <button
              onClick={() => onDelete(theme)}
              title="Temanı sil"
              style={{
                padding: 8,
                borderRadius: 8,
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                color: '#F87171',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ThemeLibraryPage() {
  const { data: session } = useSession();
  const { orgId, org, refresh: refreshOrg } = useCurrentOrg();

  const [themes, setThemes] = useState<ThemeItem[]>(() =>
    Object.values(defaultThemes).map((t) => ({ ...t, source: 'builtin' }))
  );
  const [activeThemeId, setActiveThemeId] = useState<string>('elegant');
  const [currentThemeConfig, setCurrentThemeConfig] = useState<ThemeConfig | null>(null);

  const [loading, setLoading] = useState(true);
  const [applyingThemeId, setApplyingThemeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Preview Modal
  const [previewingTheme, setPreviewingTheme] = useState<ThemeItem | null>(null);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch themes and current site theme
  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [themesRes, orgThemeRes] = await Promise.all([
        fetch('/api/themes'),
        fetch(`/api/organizations/${orgId}/theme`),
      ]);

      if (themesRes.ok) {
        const d = await themesRes.json();
        if (d.themes && Array.isArray(d.themes)) {
          // Map ThemeDefinition to ThemeItem / ThemeConfig
          const mapped: ThemeItem[] = d.themes.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            category: Array.isArray(t.category) ? t.category : [t.category || 'all'],
            primaryColor: t.tokens?.colors?.primary || t.primaryColor || '#00D37D',
            secondaryColor: t.tokens?.colors?.secondary || t.secondaryColor || '#121212',
            accentColor: t.tokens?.colors?.accent || t.accentColor || '#00D37D',
            backgroundColor: t.tokens?.colors?.background || t.backgroundColor || '#121416',
            textColor: t.tokens?.colors?.text || t.textColor || '#FFFFFF',
            headingFont: t.tokens?.typography?.headingFont || t.headingFont || 'Outfit',
            bodyFont: t.tokens?.typography?.bodyFont || t.bodyFont || 'Inter',
            borderRadius: t.tokens?.radius?.borderRadius || t.borderRadius || '12px',
            heroHeight: t.tokens?.spacing?.heroHeight || t.heroHeight || '85vh',
            heroOverlay: t.tokens?.spacing?.heroOverlay ?? t.heroOverlay ?? 0.5,
            templateId: t.templateId || t.id,
            buttonStyle: t.layout?.buttonStyle || t.buttonStyle || 'solid',
            cardStyle: t.layout?.cardStyle || t.cardStyle || 'elevated',
            headerStyle: t.layout?.headerStyle || t.headerStyle || 'solid',
            footerStyle: t.layout?.footerStyle || t.footerStyle || 'dark',
            source: t.source || 'builtin',
            isProTemplate: t.isProTemplate || false,
            createdAt: t.createdAt,
          }));

          // Merge with defaultThemes without duplicates
          const existingIds = new Set(mapped.map((m) => m.id));
          const builtinDefaults = Object.values(defaultThemes)
            .filter((dt) => !existingIds.has(dt.id))
            .map((dt) => ({ ...dt, source: 'builtin' as const }));

          setThemes([...mapped, ...builtinDefaults]);
        }
      }

      if (orgThemeRes.ok) {
        const od = await orgThemeRes.json();
        if (od.theme) {
          setCurrentThemeConfig(od.theme);
          if (od.theme.id) setActiveThemeId(od.theme.id);
          else if (od.theme.templateId) setActiveThemeId(od.theme.templateId);
        }
      }
    } catch (err) {
      console.error('Load themes error:', err);
      showToast('Temalar yüklənərkən xəta baş verdi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  // Filtered themes
  const filteredThemes = useMemo(() => {
    return themes.filter((t) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catStr = (t.category || []).join(' ').toLowerCase();
        const nameStr = t.name.toLowerCase();
        const descStr = (t.description || '').toLowerCase();

        if (selectedCategory === 'restoran') {
          if (!catStr.includes('restoran') && !catStr.includes('kafe') && !descStr.includes('restoran')) {
            return false;
          }
        } else if (selectedCategory === 'biznes') {
          if (!catStr.includes('biznes') && !catStr.includes('muessise') && !descStr.includes('biznes')) {
            return false;
          }
        } else if (selectedCategory === 'dark') {
          const isDark =
            t.backgroundColor === '#121416' ||
            t.backgroundColor?.toLowerCase().startsWith('#1') ||
            t.backgroundColor?.toLowerCase().startsWith('#0');
          if (!isDark) return false;
        } else if (selectedCategory === 'pro') {
          if (!t.isProTemplate) return false;
        } else if (selectedCategory === 'modern') {
          if (!catStr.includes('modern') && !nameStr.includes('modern') && !nameStr.includes('müasir')) {
            return false;
          }
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesFont = t.headingFont.toLowerCase().includes(q) || t.bodyFont.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesFont) return false;
      }

      return true;
    });
  }, [themes, selectedCategory, searchQuery]);

  // Apply Theme to Site
  const handleApplyTheme = async (themeToApply: ThemeItem, publishNow: boolean = false) => {
    if (!orgId) return;
    setApplyingThemeId(themeToApply.id);

    try {
      const res = await fetch(`/api/organizations/${orgId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeToApply,
          publishImmediately: publishNow,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Tema tətbiq edilə bilmədi');
      }

      setActiveThemeId(themeToApply.id);
      setCurrentThemeConfig(themeToApply);
      showToast(
        publishNow
          ? `"${themeToApply.name}" canlı sayta uğurla tətbiq edildi!`
          : `"${themeToApply.name}" saytın qaralamasına tətbiq olundu. "Yayınla" düyməsi ilə canlıya verə bilərsiniz.`
      );
      if (previewingTheme) setPreviewingTheme(null);
      refreshOrg();
    } catch (err: any) {
      showToast(err.message || 'Xəta baş verdi', 'error');
    } finally {
      setApplyingThemeId(null);
    }
  };

  // Export Theme to JSON file
  const handleExportTheme = (themeToExport: ThemeItem) => {
    const exportData = {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      theme: themeToExport,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeToExport.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`"${themeToExport.name}" JSON faylı yükləndi`);
  };

  // Delete Custom Theme
  const handleDeleteTheme = async (themeToDelete: ThemeItem) => {
    if (themeToDelete.source !== 'custom') {
      showToast('Daxili sistem temaları silinə bilməz', 'error');
      return;
    }

    if (!confirm(`"${themeToDelete.name}" temasını silmək istədiyinizdən əminsiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/themes?id=${encodeURIComponent(themeToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Silinmə uğursuz oldu');
      }

      setThemes((prev) => prev.filter((t) => t.id !== themeToDelete.id));
      showToast('Tema uğurla silindi');
    } catch (err: any) {
      showToast(err.message || 'Xəta baş verdi', 'error');
    }
  };

  // Import Theme from JSON
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('JSON mətni daxil edin və ya fayl seçin');
      return;
    }

    try {
      setImporting(true);
      const parsed = JSON.parse(importJsonText);
      const themeObj = parsed.theme || parsed;

      if (!themeObj.name || !themeObj.primaryColor) {
        throw new Error('Etibarsız tema strukturu: "name" və "primaryColor" zəruridir');
      }

      const newId = themeObj.id ? `custom-${themeObj.id}-${Date.now()}` : `custom-${Date.now()}`;
      const themePayload: ThemeItem = {
        ...themeObj,
        id: newId,
        source: 'custom',
        createdAt: new Date().toISOString(),
      };

      // Register theme in backend
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: themePayload.id,
          name: themePayload.name,
          slug: themePayload.id,
          description: themePayload.description || 'İdxal edilmiş fərdi tema',
          category: themePayload.category || ['fərdi'],
          version: '1.0.0',
          tokens: {
            colors: {
              primary: themePayload.primaryColor,
              secondary: themePayload.secondaryColor || '#1B1B2F',
              accent: themePayload.accentColor || themePayload.primaryColor,
              background: themePayload.backgroundColor || '#121416',
              text: themePayload.textColor || '#FFFFFF',
            },
            typography: {
              headingFont: themePayload.headingFont || 'Outfit',
              bodyFont: themePayload.bodyFont || 'Inter',
            },
            spacing: {
              heroHeight: themePayload.heroHeight || '85vh',
              heroOverlay: themePayload.heroOverlay ?? 0.5,
            },
            radius: {
              borderRadius: themePayload.borderRadius || '12px',
            },
          },
          layout: {
            headerStyle: themePayload.headerStyle || 'solid',
            footerStyle: themePayload.footerStyle || 'dark',
            buttonStyle: themePayload.buttonStyle || 'solid',
            cardStyle: themePayload.cardStyle || 'elevated',
          },
          sections: [],
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Tema serverdə qeydiyyatdan keçmədi');
      }

      setThemes((prev) => [themePayload, ...prev]);
      setShowImportModal(false);
      setImportJsonText('');
      showToast(`"${themePayload.name}" uğurla idxal edildi!`);
    } catch (err: any) {
      setImportError(err.message || 'JSON formatı yanlışdır');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
      setImportError('');
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 99999,
              background: toast.type === 'success' ? '#00D37D' : '#F87171',
              color: toast.type === 'success' ? '#0F0F14' : '#FFFFFF',
              padding: '12px 20px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 32,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(0, 211, 125, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={24} color="#00D37D" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F5F5F7', margin: 0 }}>Tema Kitabxanası</h1>
              <p style={{ color: '#8888A0', fontSize: 14, margin: '4px 0 0' }}>
                Saytınız üçün peşəkar dizayn temalarını seçin, önizləyin və aktivləşdirin
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowImportModal(true)}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 16px' }}
          >
            <Upload size={16} /> Tema İdxal et (JSON)
          </button>
          <button
            onClick={loadData}
            title="Yenilə"
            className="dash-btn-secondary"
            style={{ padding: 10 }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Active Theme Status Banner */}
      {currentThemeConfig && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0,211,125,0.08) 0%, rgba(26,26,30,0.8) 100%)',
            border: '1px solid rgba(0,211,125,0.25)',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#00D37D',
                boxShadow: '0 0 10px #00D37D',
              }}
            />
            <div>
              <span style={{ fontSize: 12, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hazırda Aktiv Tema
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', margin: '2px 0 0' }}>
                {currentThemeConfig.name}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
              {[
                currentThemeConfig.primaryColor,
                currentThemeConfig.secondaryColor,
                currentThemeConfig.accentColor,
                currentThemeConfig.backgroundColor,
              ].map((c, i) => (
                <span
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: c,
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {org?.website?.isPublished && org?.slug && (
              <a
                href={`/site/${org.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#00D37D',
                  textDecoration: 'none',
                  background: 'rgba(0,211,125,0.1)',
                  border: '1px solid rgba(0,211,125,0.2)',
                }}
              >
                <Globe size={14} /> Canlı Saytda Gör
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* Search and Category Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8888A0' }}
            />
            <input
              type="text"
              placeholder="Tema adı, tipoqrafiya və ya kateqoriya axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dash-input"
              style={{ paddingLeft: 42, width: '100%', height: 44, borderRadius: 12 }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8888A0',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  border: active ? '1px solid #00D37D' : '1px solid #383334',
                  background: active ? 'rgba(0,211,125,0.15)' : '#1A1A1E',
                  color: active ? '#00D37D' : '#8888A0',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Theme Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 340, borderRadius: 16 }} />
          ))}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div
          style={{
            padding: 60,
            textAlign: 'center',
            background: '#1A1A1E',
            borderRadius: 16,
            border: '1px solid #383334',
          }}
        >
          <Palette size={48} style={{ color: '#8888A0', margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>Uyğun tema tapılmadı</h3>
          <p style={{ color: '#8888A0', fontSize: 14, margin: '8px 0 20px' }}>
            Axtarış sözünü dəyişin və ya başqa bir kateqoriya seçin.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="dash-btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            Bütün temaları göstər
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredThemes.map((theme) => (
            <ThemeMiniCard
              key={theme.id}
              theme={theme}
              isActive={activeThemeId === theme.id || currentThemeConfig?.name === theme.name}
              onPreview={(t) => setPreviewingTheme(t)}
              onApply={(t) => handleApplyTheme(t, false)}
              onExport={handleExportTheme}
              onDelete={handleDeleteTheme}
              isApplying={applyingThemeId === theme.id}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Interactive Preview Modal */}
      <AnimatePresence>
        {previewingTheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              padding: 20,
            }}
          >
            {/* Modal Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderRadius: 12,
                background: '#1A1A1E',
                border: '1px solid #383334',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#F5F5F7' }}>{previewingTheme.name}</span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: `${previewingTheme.primaryColor}25`,
                    color: previewingTheme.primaryColor,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  Canlı Önizləmə
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => handleApplyTheme(previewingTheme, false)}
                  disabled={applyingThemeId === previewingTheme.id}
                  className="dash-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13 }}
                >
                  {applyingThemeId === previewingTheme.id ? (
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Bu Temanı Aktiv et
                </button>
                <button
                  onClick={() => setPreviewingTheme(null)}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    background: '#23232B',
                    border: '1px solid #383334',
                    color: '#8888A0',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div
              style={{
                flex: 1,
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid #383334',
                background: previewingTheme.backgroundColor || '#121416',
                position: 'relative',
              }}
            >
              <div style={{ height: '100%', overflowY: 'auto' }}>
                <RestaurantSite
                  data={{
                    organization: {
                      id: org?.id,
                      name: org?.name || previewingTheme.name,
                      slug: org?.slug || 'preview',
                      description: org?.description || previewingTheme.description,
                      phone: org?.phone || '+994 50 123 45 67',
                      email: org?.email || 'info@sitex.az',
                      address: org?.address || 'Nizami küç. 45, Bakı',
                      city: org?.city || 'Bakı',
                      currency: 'AZN',
                      siteCategory: org?.siteCategory || 'restoran-ve-qida-sayti',
                    },
                    website: {
                      theme: previewingTheme as unknown as Record<string, unknown>,
                      draftTheme: previewingTheme as unknown as Record<string, unknown>,
                      publishedTheme: previewingTheme as unknown as Record<string, unknown>,
                    },
                    socialLinks: [],
                    workingHours: [],
                    menuCategories: [
                      {
                        id: 'c1',
                        name: 'İsti Yeməklər',
                        slug: 'isti-yemekler',
                        isVisible: true,
                        menuItems: [
                          {
                            id: 'i1',
                            name: 'Şefin Xüsusi Steak-i',
                            slug: 'sefin-xususi-steaki',
                            description: 'Mərmər ət, rozmarin və zərif kərə yağı sousu ilə',
                            price: 28,
                            isFeatured: true,
                            isNew: true,
                            isPopular: true,
                          },
                        ],
                      },
                      {
                        id: 'c2',
                        name: 'Desertlər',
                        slug: 'desertler',
                        isVisible: true,
                        menuItems: [
                          {
                            id: 'i2',
                            name: 'Tiramisu Klasik',
                            slug: 'tiramisu-klasik',
                            description: 'Mascarpone pendiri və espresso aroması ilə',
                            price: 9,
                            isFeatured: false,
                            isNew: false,
                            isPopular: true,
                          },
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="dash-card"
              style={{
                width: '100%',
                maxWidth: 540,
                padding: 24,
                borderRadius: 16,
                background: '#1A1A1E',
                border: '1px solid #383334',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                  Yeni Tema İdxal et (JSON)
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="dash-label" style={{ marginBottom: 6, display: 'block' }}>
                    JSON Faylı Seçin:
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    ref={importFileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    className="dash-btn-secondary"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: '1px dashed #383334',
                      borderRadius: 10,
                    }}
                  >
                    <Upload size={16} /> Fayl seçin (.json)
                  </button>
                </div>

                <div>
                  <label className="dash-label" style={{ marginBottom: 6, display: 'block' }}>
                    və ya JSON Mətnini Yapışdırın:
                  </label>
                  <textarea
                    rows={8}
                    value={importJsonText}
                    onChange={(e) => {
                      setImportJsonText(e.target.value);
                      setImportError('');
                    }}
                    placeholder='{"name": "Mənim Xüsusi Temam", "primaryColor": "#00D37D", ...}'
                    className="dash-input"
                    style={{
                      width: '100%',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      padding: 12,
                      borderRadius: 10,
                      background: '#121215',
                    }}
                  />
                </div>

                {importError && (
                  <p style={{ fontSize: 12, color: '#F87171', margin: 0 }}>
                    {importError}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="dash-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    disabled={importing}
                    className="dash-btn-primary"
                    style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {importing && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                    İdxal et və Yadda Saxla
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
