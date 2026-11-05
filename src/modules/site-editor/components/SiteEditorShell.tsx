// SiteEditorShell.tsx — 3-panel layout: sol blok listesi, orta form, sağ önizleme
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, Globe, RotateCcw, Loader2, Check,
  ChevronRight, Layers, X, AlertCircle,
} from 'lucide-react';
import type { BlockSchema, ContentDoc, SiteContentMap, Locale, BlockContent } from '../types';
import { getAllBlocks, getBlocksByPage, getPages } from '../block-registry';
import { mergeWithDefaults } from '../content-utils';
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
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pages = getPages();
  const blocks = getBlocksByPage(selectedPage);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* ---- Top Bar ---- */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
        background: C.sidebar, flexShrink: 0, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Layers size={20} color={C.accent} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Saytı Redaktə et</span>
          {isDirty && (
            <span style={{ fontSize: 11, color: C.muted, background: C.card, borderRadius: 6, padding: '2px 8px' }}>
              dəyişdirildi
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent',
              color: C.muted, fontSize: 13, cursor: 'pointer',
            }}
          >
            <Eye size={14} /> Önizləmə
          </button>
          <button
            type="button"
            onClick={() => saveDraft()}
            disabled={saving || !isDirty}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent',
              color: saved ? C.accent : C.muted, fontSize: 13, cursor: 'pointer',
              opacity: !isDirty ? 0.5 : 1,
            }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Saxlanıldı' : 'Saxla'}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
              borderRadius: 8, border: 'none',
              background: published ? '#00a360' : C.accent,
              color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {publishing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : published ? <Check size={14} /> : <Globe size={14} />}
            {published ? 'Yayımlandı!' : 'Yayımla'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: C.errorBg, color: C.error, fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.error, cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ---- 3 Panel ---- */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sol: Sayfa & Blok listesi */}
        <aside style={{
          width: 240, flexShrink: 0,
          borderRight: `1px solid ${C.border}`,
          background: C.sidebar,
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {pages.map((page) => (
            <div key={page}>
              <button
                type="button"
                onClick={() => setSelectedPage(page)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  border: 'none', background: selectedPage === page ? C.accentBg : 'transparent',
                  color: selectedPage === page ? C.accent : C.muted,
                  fontSize: 13, fontWeight: selectedPage === page ? 700 : 400,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  borderLeft: `3px solid ${selectedPage === page ? C.accent : 'transparent'}`,
                }}
                aria-current={selectedPage === page ? 'page' : undefined}
              >
                {PAGE_LABELS[page] ?? page}
                {selectedPage === page && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
              </button>
              {selectedPage === page && getBlocksByPage(page).map((block) => {
                const doc = draftMap[block.pageKey]?.[block.key];
                const isActive = selectedBlock === block.key;
                return (
                  <button
                    key={block.key}
                    type="button"
                    onClick={() => setSelectedBlock(block.key)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 16px 8px 30px',
                      border: 'none', background: isActive ? 'rgba(0,211,125,0.08)' : 'transparent',
                      color: isActive ? C.text : C.muted,
                      fontSize: 12, cursor: 'pointer',
                      opacity: doc?.visible === false ? 0.4 : 1,
                    }}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {block.label}
                    {doc?.visible === false && ' (gizli)'}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Orta: Form */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
          background: C.bg,
        }}>
          {currentBlock ? (
            <div style={{ maxWidth: 640 }}>
              <BlockForm
                schema={currentBlock}
                contentDoc={currentDoc}
                locale={locale}
                orgId={orgId}
                onLocaleChange={setLocale}
                onChange={(fields) => updateBlockContent(currentBlock.key, currentBlock.pageKey, fields)}
                onVisibilityChange={(v) => updateBlockVisibility(currentBlock.key, currentBlock.pageKey, v)}
              />

              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => revertBlock(currentBlock.key, currentBlock.pageKey)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                    padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.muted, cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={12} /> Default-a qaytar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: C.muted, fontSize: 14 }}>
              Sol tərəfdən bir bölüm seçin
            </div>
          )}
        </main>

        {/* Sağ: Önizleme (opsional) */}
        <AnimatePresence>
          {showPreview && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              style={{
                borderLeft: `1px solid ${C.border}`,
                background: C.sidebar,
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Canlı Önizləmə</span>
                <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                  <X size={16} />
                </button>
              </div>
              <iframe
                src={`/site/${slug}?preview=1&t=${Date.now()}`}
                style={{ flex: 1, border: 'none', width: '100%' }}
                title="Sayt önizləməsi"
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

