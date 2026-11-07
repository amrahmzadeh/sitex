'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, Trash2, ExternalLink, Globe } from 'lucide-react';
import { DataTable, Column, PageHeader, ConfirmDialog } from '@/components/common';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

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
  const { success: toastSuccess, error: toastError } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync state
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncRepo, setSyncRepo] = useState<string | null>(null);
  const [syncTarget, setSyncTarget] = useState<Site | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const LIMIT = 20;

  const fetchSites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<{
        sites: Site[];
        total: number;
        syncEnabled?: boolean;
        repository?: string;
      }>('/api/admin/sites', {
        params: { page, limit: LIMIT, search },
      });
      setSites(data.sites || []);
      setTotal(data.total || 0);
      setSyncEnabled(Boolean(data.syncEnabled));
      setSyncRepo(data.repository || null);
    } catch (err: any) {
      toastError(err.message || 'Saytlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [page, search, toastError]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/api/admin/sites/${deleteTarget.id}`);
      toastSuccess(`"${deleteTarget.name}" saytı uğurla silindi`);
      setDeleteTarget(null);
      fetchSites();
    } catch (err: any) {
      toastError(err.message || 'Silinmə zamanı xəta baş verdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSync = async (site: Site) => {
    setSyncLoading(true);
    try {
      const data = await apiClient.post(`/api/admin/sites/${site.id}/sync`);
      toastSuccess(
        data.outcome?.status === 'deduped'
          ? 'Bu sayt üçün sync artıq növbədədir'
          : 'GitHub sinxronizasiyası növbəyə atıldı'
      );
      setSyncTarget(null);
      fetchSites();
      setTimeout(fetchSites, 3000);
    } catch (err: any) {
      toastError(err.message || 'Sinxronizasiya başladıla bilmədi');
    } finally {
      setSyncLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const columns: Column<Site>[] = [
    {
      key: 'name',
      header: 'Sayt Adı',
      render: (site) => (
        <span style={{ color: '#E8E8F0', fontWeight: 600 }}>{site.name}</span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (site) => (
        <span style={{ color: '#00D37D', fontFamily: 'monospace' }}>/{site.slug}</span>
      ),
    },
    {
      key: 'owner',
      header: 'Sahibi',
      render: (site) => {
        const owner = site.memberships[0]?.user;
        if (!owner) return <span style={{ color: '#8888A0' }}>—</span>;
        return (
          <div>
            <p style={{ color: '#E8E8F0', margin: 0, fontWeight: 500 }}>{owner.name || '—'}</p>
            <p style={{ color: '#8888A0', fontSize: 11, margin: 0 }}>{owner.email}</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (site) => {
        const isPublished = site.website?.isPublished;
        return (
          <span
            style={{
              background: isPublished ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
              color: isPublished ? '#34D399' : '#FBBF24',
              padding: '3px 10px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {isPublished ? 'Yayınlanıb' : 'Qaralama'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Yaradılma',
      render: (site) => (
        <span style={{ color: '#8888A0', whiteSpace: 'nowrap' }}>
          {formatDate(site.createdAt)}
        </span>
      ),
    },
    {
      key: 'menu',
      header: 'Məzmun',
      render: (site) => (
        <span style={{ color: '#8888A0' }}>
          {site._count.menuItems} yemək / {site._count.menuCategories} kat.
        </span>
      ),
    },
    {
      key: 'github',
      header: 'GitHub Sync',
      render: (site) => {
        if (!syncEnabled) {
          return <span style={{ color: '#8888A0', fontSize: 12 }}>Söndürülüb</span>;
        }
        if (site.sync) {
          const cfg = SYNC_LABELS[site.sync.status];
          return (
            <button
              onClick={() => setSyncTarget(site)}
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: 'none',
                padding: '3px 10px',
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cfg.label}
            </button>
          );
        }
        return (
          <button
            onClick={() => setSyncTarget(site)}
            style={{
              background: 'transparent',
              border: '1px solid #2A2A3A',
              color: '#8888A0',
              borderRadius: 100,
              padding: '3px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Yoxdur
          </button>
        );
      },
    },
    {
      key: 'actions',
      header: 'Əməliyyatlar',
      render: (site) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {site.website?.isPublished && (
            <a
              href={`/site/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Sayta bax"
              style={{
                background: 'rgba(52,211,153,0.1)',
                border: 'none',
                color: '#34D399',
                borderRadius: 8,
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={() => setDeleteTarget(site)}
            title="Sil"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: 'none',
              color: '#F87171',
              borderRadius: 8,
              padding: '6px 8px',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title="Saytlar"
        description={`Sistemdə qeydiyyatdan keçmiş cəmi ${total} sayt`}
        icon={Globe}
        iconColor="#22D3EE"
        actions={
          <button
            onClick={fetchSites}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <RefreshCw size={14} /> Yenilə
          </button>
        }
      />

      {/* Search Input */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={14} color="#8888A0" style={{ position: 'absolute', left: 12, top: 13 }} />
          <input
            type="text"
            placeholder="Sayt adı və ya slug axtar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="dash-input"
            style={{ paddingLeft: 34, height: 40, width: '100%' }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sites}
        loading={loading}
        emptyTitle="Heç bir sayt tapılmadı"
        emptyDescription="Axtarış meyarlarınıza uyğun sayt mövcud deyil."
        pagination={{
          currentPage: page,
          totalPages,
          totalCount: total,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Saytı Sil"
        description={`"${deleteTarget?.name}" saytını və ona aid bütün məlumatları (menyu, parametrlər, şəkillər) həmişəlik silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.`}
        confirmLabel="Bəli, sil"
        cancelLabel="Ləğv et"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* GitHub Sync Modal */}
      {syncTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#1A1A24',
              border: '1px solid #2A2A3A',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 520,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 4 }}>
              GitHub Sinxronizasiyası
            </h2>
            <p style={{ color: '#8888A0', fontSize: 13, marginBottom: 20 }}>
              {syncTarget.name} · <span style={{ color: '#00D37D' }}>/{syncTarget.slug}</span>
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
                    style={{ color: '#00D37D', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
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

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setSyncTarget(null)} className="dash-btn-secondary">
                Bağla
              </button>
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
