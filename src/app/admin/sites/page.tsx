'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, Trash2, Eye, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  website: { isPublished: boolean; publishedAt: string | null } | null;
  memberships: Array<{ user: { id: string; name: string | null; email: string } }>;
  _count: { menuItems: number; menuCategories: number };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('az-AZ');
}

export default function AdminSitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState('');

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
                {['Sayt Adı', 'Slug', 'Sahibi', 'Status', 'Yaradılma', 'Menyu', 'Əməliyyatlar'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8888A0', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>
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
    </div>
  );
}

