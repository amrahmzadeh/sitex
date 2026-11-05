// SiteEditorShell.tsx — Hər cihaz ekranına tam uyğun (Responsive) 3-panel arxitekturası
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, Globe, RotateCcw, Loader2, Check,
  ChevronRight, Layers, X, AlertCircle, Smartphone, Tablet, Monitor,
  PanelLeftClose, PanelLeft, Edit3, ListOrdered
} from 'lucide-react';
import type { ContentDoc, SiteContentMap, Locale, BlockContent } from '../types';
import { getAllBlocks, getBlocksByPage, getPages } from '../block-registry';
import BlockForm from './BlockForm';

// ----- Schema-ları import et (registry-ə qeyd edir) -----
import '../schemas/hero.schema';
import '../schemas/about.schema';
import '../schemas/contact.schema';
import '../schemas/menu.schema';
import '../schemas/gallery.schema';
import '../schemas/reservation.schema';

const C = {
  bg: '#0F0F14',
  sidebar: '#121218',
  card: '#1A1A22',
  border: '#383334',
  text: '#E8E8F0',
  muted: '#8888A0',
  accent: '#00D37D',
  accentBg: 'rgba(0,211,125,0.12)',
  error: '#F87171',
  errorBg: 'rgba(248,113,113,0.1)',
};

const PAGE_LABELS: Record<string, string> = {
  hero: 'Ana Səhifə',
  about: 'Haqqımızda',
  contact: 'Əlaqə',
  menu: 'Menyu',
  gallery: 'Qalareya',
  reservation: 'Rezervasiya',
};

interface SiteEditorShellProps {
  orgId: string;
  slug: string;
}

type MobileTab = 'sections' | 'edit' | 'preview';
type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

export default function SiteEditorShell({ orgId, slug }: SiteEditorShellProps) {
  // ---- State ----
  const [contentMap, setContentMap] = useState<SiteContentMap>({});
  const [draftMap, setDraftMap] = useState<SiteContentMap>({});
  const [selectedPage, setSelectedPage] = useState<string>('hero');
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('az');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Responsive UI state
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('edit');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('mobile');
  const [previewKey, setPreviewKey] = useState<number>(() => Date.now());

  const pages = getPages();

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const mob = w < 768;
      const tab = w >= 768 && w < 1100;
      setIsMobile(mob);
      setIsTablet(tab);

      if (mob) {
        setSidebarOpen(false);
      } else if (tab) {
        setSidebarOpen(false);
        setShowPreview(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---- Fetch content ----
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/organizations/${orgId}/site-content`)
      .then((r) => r.json())
      .then((data) => {
        const map: SiteContentMap = data.content ?? {};
        setContentMap(map);
        setDraftMap(JSON.parse(JSON.stringify(map)));
      })
      .catch(() => setError('Məlumatlar yüklənəndə xəta baş verdi'))
      .finally(() => setLoading(false));
  }, [orgId]);

  // İlk bloku seç
  useEffect(() => {
    const pageBlocks = getBlocksByPage(selectedPage);
    if (pageBlocks.length > 0) {
      setSelectedBlock(pageBlocks[0].key);
    }
  }, [selectedPage]);

  // ---- Auto-save ----
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveDraft(true);
    }, 2500);
  }, [draftMap]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraft = useCallback(async (silent = false) => {
    if (!isDirty) return;
    setSaving(true);
    if (!silent) setError('');
    try {
      const res = await fetch(`/api/organizations/${orgId}/site-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draftMap }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Saxlama xətası'); return; }
      setContentMap(JSON.parse(JSON.stringify(draftMap)));
      setIsDirty(false);
      setPreviewKey(Date.now());
      if (!silent) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } catch {
      if (!silent) setError('Saxlama zamanı xəta baş verdi');
    } finally {
      setSaving(false);
    }
  }, [orgId, draftMap, isDirty]);

  const publish = async () => {
    await saveDraft();
    setPublishing(true);
    setError('');
    try {
      const res = await fetch(`/api/organizations/${orgId}/site-content/publish`, { method: 'POST' });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Yayım xətası'); return; }
      setPublished(true);
      setPreviewKey(Date.now());
      setTimeout(() => setPublished(false), 3000);
    } catch {
      setError('Yayım zamanı xəta baş verdi');
    } finally {
      setPublishing(false);
    }
  };

  const revertBlock = async (blockKey: string, pageKey: string) => {
    if (!confirm('Bu bloku default dəyərlərinə qaytarmaq istəyirsiniz?')) return;
    try {
      const res = await fetch(`/api/organizations/${orgId}/site-content`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageKey, blockKey }),
      });
      if (!res.ok) return;
      setDraftMap((prev) => {
        const next = { ...prev };
        if (next[pageKey]) {
          const p = { ...next[pageKey] };
          delete p[blockKey];
          next[pageKey] = p;
        }
        return next;
      });
      setContentMap((prev) => {
        const next = { ...prev };
        if (next[pageKey]) {
          const p = { ...next[pageKey] };
          delete p[blockKey];
          next[pageKey] = p;
        }
        return next;
      });
    } catch { /* silent */ }
  };

  // ---- Content update ----
  const updateBlockContent = (blockKey: string, pageKey: string, fields: BlockContent) => {
    setDraftMap((prev) => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] ?? {}),
        [blockKey]: {
          ...(prev[pageKey]?.[blockKey] ?? {}),
          fields,
        },
      },
    }));
    setIsDirty(true);
    triggerAutoSave();
  };

  const updateBlockVisibility = (blockKey: string, pageKey: string, visible: boolean) => {
    setDraftMap((prev) => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] ?? {}),
        [blockKey]: {
          ...(prev[pageKey]?.[blockKey] ?? {}),
          visible,
        },
      },
    }));
    setIsDirty(true);
    triggerAutoSave();
  };

  const currentBlock = selectedBlock ? getAllBlocks().find((b) => b.key === selectedBlock) : null;
  const currentDoc = selectedBlock && currentBlock
    ? draftMap[currentBlock.pageKey]?.[selectedBlock]
    : undefined;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: C.muted }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        Yüklənir...
      </div>
    );
  }

  // Preview width helper
  const getPreviewWidth = () => {
    if (previewDevice === 'mobile') return '375px';
    if (previewDevice === 'tablet') return '768px';
    return '100%';
  };

  return (
    <div className="site-editor-shell">
      <style jsx>{`
        .site-editor-shell {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: ${C.bg};
          overflow: hidden;
          font-family: inherit;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid ${C.border};
          background: ${C.sidebar};
          flex-shrink: 0;
          gap: 8px;
          z-index: 10;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid ${C.border};
          background: transparent;
          color: ${C.text};
          white-space: nowrap;
          min-height: 38px;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background: ${C.accent};
          color: #000;
          border: none;
        }
        .btn-primary:hover:not(:disabled) {
          background: #00ea8b;
        }
        .body-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .sidebar {
          width: 260px;
          flex-shrink: 0;
          border-right: 1px solid ${C.border};
          background: ${C.sidebar};
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: ${C.bg};
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .main-inner {
          width: 100%;
          max-width: 680px;
        }
        .preview-pane {
          width: 440px;
          border-left: 1px solid ${C.border};
          background: #000;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
        }
        .mobile-tab-bar {
          display: none;
          background: ${C.sidebar};
          border-top: 1px solid ${C.border};
          padding: 6px 12px;
          z-index: 20;
          gap: 8px;
        }

        @media (max-width: 1024px) {
          .preview-pane {
            width: 380px;
          }
        }
        @media (max-width: 768px) {
          .topbar {
            padding: 8px 12px;
          }
          .title-text {
            display: none;
          }
          .sidebar {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 15;
            background: ${C.sidebar};
          }
          .main-content {
            padding: 16px 12px;
            width: 100%;
          }
          .mobile-tab-bar {
            display: flex;
          }
          .btn-text {
            display: none;
          }
          .btn {
            padding: 8px 10px;
          }
          .preview-modal {
            position: fixed;
            inset: 0;
            z-index: 50;
            background: #000;
            display: flex;
            flex-direction: column;
          }
        }
      `}</style>

      {/* ---- Top Bar ---- */}
      <header className="topbar">
        <div className="topbar-left">
          {/* Toggle sidebar button on Desktop/Tablet */}
          {!isMobile && (
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="btn"
              title={sidebarOpen ? 'Bölmələri gizlət' : 'Bölmələri göstər'}
              aria-label="Sidebar toggle"
            >
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color={C.accent} />
            <span className="title-text" style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              Saytı Redaktə et
            </span>
          </div>

          {/* Quick Breadcrumb/Selector on Mobile */}
          {isMobile && currentBlock && (
            <span style={{ fontSize: 12, color: C.accent, background: C.card, padding: '4px 8px', borderRadius: 6, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentBlock.label}
            </span>
          )}

          {isDirty && (
            <span style={{ fontSize: 10, color: '#FBBF24', background: 'rgba(251,191,36,0.15)', borderRadius: 4, padding: '2px 6px', fontWeight: 600 }}>
              Dəyişdirilib
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="topbar-actions">
          <button
            type="button"
            onClick={async () => {
              if (isDirty) {
                await saveDraft(true);
              }
              setPreviewKey(Date.now());
              if (isMobile) {
                setMobileTab(mobileTab === 'preview' ? 'edit' : 'preview');
              } else {
                setShowPreview((p) => !p);
              }
            }}
            className="btn"
            style={{
              background: (isMobile ? mobileTab === 'preview' : showPreview) ? C.accentBg : 'transparent',
              borderColor: (isMobile ? mobileTab === 'preview' : showPreview) ? C.accent : C.border,
              color: (isMobile ? mobileTab === 'preview' : showPreview) ? C.accent : C.text,
            }}
            title="Önizləmə"
          >
            <Eye size={15} />
            <span className="btn-text">Önizləmə</span>
          </button>

          <button
            type="button"
            onClick={() => saveDraft()}
            disabled={saving || !isDirty}
            className="btn"
            title="Qaralamanı saxla"
            style={{ color: saved ? C.accent : C.text }}
          >
            {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={15} /> : <Save size={15} />}
            <span className="btn-text">{saved ? 'Saxlanıldı' : 'Saxla'}</span>
          </button>

          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="btn btn-primary"
            title="Canlı saytda yayımla"
          >
            {publishing ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : published ? <Check size={15} /> : <Globe size={15} />}
            <span className="btn-text">{published ? 'Yayımlandı' : 'Yayımla'}</span>
          </button>
        </div>
      </header>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: C.errorBg, color: C.error, fontSize: 13, borderBottom: `1px solid ${C.border}` }}>
          <AlertCircle size={14} />
          <span style={{ flex: 1 }}>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: C.error, cursor: 'pointer', padding: 4 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ---- Body Layout ---- */}
      <div className="body-layout">
        {/* Sol Panel: Sayfalar & Bloklar */}
        {(!isMobile ? sidebarOpen : mobileTab === 'sections') && (
          <aside className="sidebar">
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bölmələr
              </span>
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setMobileTab('edit')}
                  style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 4 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {pages.map((page) => (
                <div key={page} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPage(page)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '11px 16px',
                      border: 'none', background: selectedPage === page ? C.accentBg : 'transparent',
                      color: selectedPage === page ? C.accent : C.muted,
                      fontSize: 13, fontWeight: selectedPage === page ? 700 : 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      borderLeft: `3px solid ${selectedPage === page ? C.accent : 'transparent'}`,
                      minHeight: 44,
                    }}
                    aria-current={selectedPage === page ? 'page' : undefined}
                  >
                    <span style={{ flex: 1 }}>{PAGE_LABELS[page] ?? page}</span>
                    {selectedPage === page && <ChevronRight size={14} />}
                  </button>

                  {selectedPage === page && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 0' }}>
                      {getBlocksByPage(page).map((block) => {
                        const doc = draftMap[block.pageKey]?.[block.key];
                        const isActive = selectedBlock === block.key;
                        return (
                          <button
                            key={block.key}
                            type="button"
                            onClick={() => {
                              setSelectedBlock(block.key);
                              if (isMobile) setMobileTab('edit');
                            }}
                            style={{
                              width: '100%', textAlign: 'left', padding: '10px 16px 10px 32px',
                              border: 'none', background: isActive ? 'rgba(0,211,125,0.1)' : 'transparent',
                              color: isActive ? '#fff' : C.muted,
                              fontSize: 13, fontWeight: isActive ? 600 : 400,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              minHeight: 40,
                            }}
                            aria-current={isActive ? 'true' : undefined}
                          >
                            <span>{block.label}</span>
                            {doc?.visible === false && (
                              <span style={{ fontSize: 10, color: C.muted, background: C.card, padding: '1px 5px', borderRadius: 4 }}>
                                gizli
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Orta Panel: Blok Redaktə Formu */}
        {(!isMobile || mobileTab === 'edit') && (
          <main className="main-content">
            <div className="main-inner">
              {currentBlock ? (
                <>
                  <BlockForm
                    schema={currentBlock}
                    contentDoc={currentDoc}
                    locale={locale}
                    orgId={orgId}
                    onLocaleChange={setLocale}
                    onChange={(fields) => updateBlockContent(currentBlock.key, currentBlock.pageKey, fields)}
                    onVisibilityChange={(v) => updateBlockVisibility(currentBlock.key, currentBlock.pageKey, v)}
                  />

                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => revertBlock(currentBlock.key, currentBlock.pageKey)}
                      className="btn"
                      style={{ fontSize: 12, padding: '8px 14px', color: C.muted }}
                    >
                      <RotateCcw size={13} /> Default-a qaytar
                    </button>

                    <button
                      type="button"
                      onClick={() => saveDraft()}
                      disabled={saving || !isDirty}
                      className="btn"
                      style={{ fontSize: 12, padding: '8px 16px', background: C.accentBg, borderColor: C.accent, color: C.accent }}
                    >
                      <Save size={13} /> Yadda saxla
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
                  <Layers size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: 14 }}>Zəhmət olmasa, sol tərəfdən bir bölmə seçin.</p>
                </div>
              )}
            </div>
          </main>
        )}

        {/* Sağ Panel: Desktop / Tablet Canlı Önizləmə */}
        {!isMobile && showPreview && (
          <aside className="preview-pane">
            {/* Önizləmə başlıq barı */}
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.sidebar }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  style={{ background: previewDevice === 'mobile' ? C.card : 'transparent', border: `1px solid ${previewDevice === 'mobile' ? C.accent : 'transparent'}`, borderRadius: 6, color: previewDevice === 'mobile' ? C.accent : C.muted, padding: 5, cursor: 'pointer' }}
                  title="Mobil ölçü"
                >
                  <Smartphone size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  style={{ background: previewDevice === 'tablet' ? C.card : 'transparent', border: `1px solid ${previewDevice === 'tablet' ? C.accent : 'transparent'}`, borderRadius: 6, color: previewDevice === 'tablet' ? C.accent : C.muted, padding: 5, cursor: 'pointer' }}
                  title="Planşet ölçü"
                >
                  <Tablet size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  style={{ background: previewDevice === 'desktop' ? C.card : 'transparent', border: `1px solid ${previewDevice === 'desktop' ? C.accent : 'transparent'}`, borderRadius: 6, color: previewDevice === 'desktop' ? C.accent : C.muted, padding: 5, cursor: 'pointer' }}
                  title="Masaüstü ölçü"
                >
                  <Monitor size={15} />
                </button>
              </div>

              <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            {/* Iframe wrapper */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0e', overflow: 'hidden', padding: previewDevice === 'desktop' ? 0 : 12 }}>
              <div style={{ width: getPreviewWidth(), height: '100%', maxHeight: '100%', transition: 'all 0.25s ease', boxShadow: previewDevice !== 'desktop' ? '0 10px 30px rgba(0,0,0,0.8)' : 'none', borderRadius: previewDevice !== 'desktop' ? 12 : 0, overflow: 'hidden', border: previewDevice !== 'desktop' ? `1px solid ${C.border}` : 'none' }}>
                <iframe
                  src={`/site/${slug}?preview=1&t=${previewKey}`}
                  style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                  title="Sayt önizləməsi"
                />
              </div>
            </div>
          </aside>
        )}

        {/* Mobil Canlı Önizləmə Ekranı */}
        {isMobile && mobileTab === 'preview' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
            <iframe
              src={`/site/${slug}?preview=1&t=${previewKey}`}
              style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
              title="Sayt mobil önizləməsi"
            />
          </div>
        )}
      </div>

      {/* ---- Mobile Bottom Tab Bar ---- */}
      {isMobile && (
        <nav className="mobile-tab-bar">
          <button
            type="button"
            onClick={() => setMobileTab('sections')}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
              background: mobileTab === 'sections' ? C.card : 'transparent',
              color: mobileTab === 'sections' ? C.accent : C.muted,
              fontSize: 11, fontWeight: 600,
            }}
          >
            <ListOrdered size={18} />
            Bölmələr
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
              background: mobileTab === 'edit' ? C.card : 'transparent',
              color: mobileTab === 'edit' ? C.accent : C.muted,
              fontSize: 11, fontWeight: 600,
            }}
          >
            <Edit3 size={18} />
            Redaktə
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
              background: mobileTab === 'preview' ? C.card : 'transparent',
              color: mobileTab === 'preview' ? C.accent : C.muted,
              fontSize: 11, fontWeight: 600,
            }}
          >
            <Eye size={18} />
            Önizləmə
          </button>
        </nav>
      )}
    </div>
  );
}
