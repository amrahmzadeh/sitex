'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, Trash2, Eye, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface SiteSyncInfo {
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  trigger: string;
  commitSha: string | null;
  commitUrl: string | null;
  lastError: string | null;
  noChanges: boolean;
  finishedAt: string | null;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  website: { isPublished: boolean; publishedAt: string | null } | null;
  memberships: Array<{ user: { id: string; name: string | null; email: string } }>;
  _count: { menuItems: number; menuCategories: number };
  sync: SiteSyncInfo | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('az-AZ');
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('az-AZ');
}

const SYNC_LABELS: Record<SiteSyncInfo['status'], { label: string; color: string; bg: string }> = {
  DONE: { label: 'Sinxron', color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  FAILED: { label: 'Xəta', color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  RUNNING: { label: 'İşləyir', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  PENDING: { label: 'Növbədə', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
};

export default function AdminSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncRepo, setSyncRepo] = useState<string | null>(null);
  const [syncTarget, setSyncTarget] = useState<Site | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const LIMIT = 20;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), search });
      const res = await fetch(`/api/admin/sites?${params}`);
      const data = await res.json();
      setSites(data.sites || []);
      setTotal(data.total || 0);
      setSyncEnabled(Boolean(data.syncEnabled));
      setSyncRepo(data.repository || null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/sites/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (res.ok) {
      showToast('Sayt silindi');
      setDeleteTarget(null);
      fetchSites();
    } else {
      const d = await res.json();
      showToast(d.error || 'Xəta baş verdi');
    }
  };

  const handleSync = async (site: Site) => {
    setSyncLoading(true);
    try {
      const res = await fetch(`/api/admin/sites/${site.id}/sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(
          data.outcome?.status === 'deduped'
            ? 'Bu sayt üçün sync artıq növbədədir'
            : 'GitHub sinxronizasiyası növbəyə atıldı'
        );
        setSyncTarget(null);
        fetchSites();
        setTimeout(fetchSites, 3000);
      } else {
        showToast(data.error || 'Sinxronizasiya başladıla bilmədi');
      }
    } finally {
      setSyncLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ maxWidth: 1200 }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 12, padding: '12px 20px', color: '#E8E8F0', fontSize: 14, zIndex: 1000 }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0' }}>Saytlar</h1>
          <p style={{ color: '#8888A0', fontSize: 14 }}>Cəmi: {total} sayt</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={fetchSites} style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Yenilə
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={14} color="#8888A0" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="Sayt adı və ya slug axtar..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="dash-input"
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      <div className="dash-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A3A' }}>
                {['Sayt Adı', 'Slug', 'Sahibi', 'Status', 'Yaradılma', 'Menyu', 'GitHub', 'Əməliyyatlar'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8888A0', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>
                    Sayt tapılmadı
                  </td>
                </tr>
              ) : sites.map(site => {
                const owner = site.memberships[0]?.user;
                const isPublished = site.website?.isPublished;
                return (
                  <tr key={site.id} style={{ borderBottom: '1px solid #1A1A24' }}>
                    <td style={{ padding: '12px 16px', color: '#E8E8F0', fontWeight: 500 }}>{site.name}</td>
                    <td style={{ padding: '12px 16px', color: '#7C5CFC' }}>/{site.slug}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {owner ? (
                        <div>
                          <p style={{ color: '#E8E8F0' }}>{owner.name || '—'}</p>
                          <p style={{ color: '#8888A0', fontSize: 11 }}>{owner.email}</p>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: isPublished ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                        color: isPublished ? '#34D399' : '#FBBF24',
                        padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                      }}>
                        {isPublished ? 'Yayınlanıb' : 'Qaralama'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0', whiteSpace: 'nowrap' }}>
                      {formatDate(site.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0' }}>
                      {site._count.menuItems} yemək / {site._count.menuCategories} kat.
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {!syncEnabled ? (
                        <span style={{ color: '#8888A0', fontSize: 12 }}>Söndürülüb</span>
                      ) : site.sync ? (
                        <button
                          onClick={() => setSyncTarget(site)}
                          title="GitHub sinxronizasiya detalları"
                          style={{
                            background: SYNC_LABELS[site.sync.status].bg,
                            color: SYNC_LABELS[site.sync.status].color,
                            border: 'none',
                            padding: '3px 10px',
                            borderRadius: 100,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {SYNC_LABELS[site.sync.status].label}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSyncTarget(site)}
                          title="GitHub sinxronizasiya detalları"
                          style={{ background: 'transparent', border: '1px solid #2A2A3A', color: '#8888A0', borderRadius: 100, padding: '3px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Yoxdur
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isPublished && (
                          <a
                            href={`/site/${site.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Sayta bax"
                            style={{ background: 'rgba(52,211,153,0.1)', border: 'none', color: '#34D399', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => setDeleteTarget(site)}
                          title="Sil"
                          style={{ background: 'rgba(248,113,113,0.1)', border: 'none', color: '#F87171', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid #2A2A3A', justifyContent: 'flex-end' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 8, padding: '6px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, color: '#8888A0' }}>{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 8, padding: '6px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1A1A24', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 12 }}>Saytı Sil</h2>
            <p style={{ color: '#8888A0', fontSize: 14, marginBottom: 8 }}>
              <strong style={{ color: '#E8E8F0' }}>{deleteTarget.name}</strong> saytını və ona aid bütün məlumatları (menyu, şəkillər, parametrlər) həmişəlik silmək istədiyinizə əminsiniz?
            </p>
            <p style={{ color: '#F87171', fontSize: 13, marginBottom: 24 }}>
              ⚠️ Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} className="dash-btn-secondary">Ləğv et</button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="dash-btn-danger"
                style={{ opacity: deleteLoading ? 0.7 : 1, background: 'rgba(248,113,113,0.15)', fontWeight: 600 }}
              >
                {deleteLoading ? 'Silinir...' : 'Bəli, sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Sync Modal */}
      {syncTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 4 }}>GitHub sinxronizasiyası</h2>
            <p style={{ color: '#8888A0', fontSize: 13, marginBottom: 20 }}>
              {syncTarget.name} · <span style={{ color: '#7C5CFC' }}>/{syncTarget.slug}</span>
            </p>

            <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#8888A0' }}>Status</span>
                <span style={{ color: syncTarget.sync ? SYNC_LABELS[syncTarget.sync.status].color : '#8888A0', fontWeight: 600 }}>
                  {syncTarget.sync ? SYNC_LABELS[syncTarget.sync.status].label : 'Hələ sinxronlaşdırılmayıb'}
                  {syncTarget.sync?.noChanges ? ' (dəyişiklik yoxdur)' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#8888A0' }}>Son cəhd</span>
                <span style={{ color: '#E8E8F0' }}>{formatDateTime(syncTarget.sync?.createdAt ?? null)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#8888A0' }}>Son uğurlu</span>
                <span style={{ color: '#E8E8F0' }}>{formatDateTime(syncTarget.sync?.finishedAt ?? null)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#8888A0' }}>Commit</span>
                {syncTarget.sync?.commitUrl ? (
                  <a
                    href={syncTarget.sync.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#7C5CFC', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                  >
                    {syncTarget.sync.commitSha?.slice(0, 7)} <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ color: '#8888A0' }}>—</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: '#8888A0' }}>Repository</span>
                <span style={{ color: '#E8E8F0', fontFamily: 'monospace', fontSize: 12 }}>{syncRepo || '—'}</span>
              </div>
            </div>

            {syncTarget.sync?.lastError && (
              <p style={{ marginTop: 16, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 12, color: '#F87171', fontSize: 12, lineHeight: 1.5 }}>
                {syncTarget.sync.lastError}
              </p>
            )}

            {!syncEnabled && (
              <p style={{ marginTop: 16, color: '#FBBF24', fontSize: 12 }}>
                Sinxronizasiya söndürülüb (SITE_GITHUB_SYNC_ENABLED).
              </p>
            )}

            <p style={{ marginTop: 16, color: '#8888A0', fontSize: 12, lineHeight: 1.6 }}>
              Sayt silinəndə GitHub-dakı fayllar silinmir — <code>site.json</code>-a <code>deletedAt</code> yazılır.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setSyncTarget(null)} className="dash-btn-secondary">Bağla</button>
              <button
                onClick={() => handleSync(syncTarget)}
                disabled={syncLoading || !syncEnabled}
                className="dash-btn-primary"
                style={{ opacity: syncLoading || !syncEnabled ? 0.6 : 1 }}
              >
                {syncLoading ? 'Göndərilir...' : 'İndi sinxronlaşdır'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

