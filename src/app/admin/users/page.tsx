'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Edit2,
  Ban,
  CheckCircle2,
  Trash2,
  Users,
  X,
  Save,
} from 'lucide-react';
import { DataTable, Column, PageHeader, ConfirmDialog, FormField } from '@/components/common';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  status: 'ACTIVE' | 'BANNED';
  role: string;
  subscriptionExpiry: string | null;
  maxSites: number | null;
  _count: { memberships: number };
}

const SUBSCRIPTION_PRESETS = [
  { label: '7 gün', days: 7 },
  { label: '15 gün', days: 15 },
  { label: '30 gün', days: 30 },
  { label: '90 gün', days: 90 },
  { label: '180 gün', days: 180 },
  { label: '365 gün', days: 365 },
];

const SITE_LIMIT_PRESETS = [1, 3, 5, 10];

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('az-AZ');
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

function userStatusLabel(u: User) {
  if (u.status === 'BANNED') return { label: 'Ban', color: '#F87171', bg: 'rgba(248,113,113,0.1)' };
  if (isExpired(u.subscriptionExpiry)) return { label: 'Müddəti bitib', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' };
  return { label: 'Aktiv', color: '#34D399', bg: 'rgba(52,211,153,0.1)' };
}

export default function AdminUsersPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ subscriptionExpiry: '', maxSites: '', customDate: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirm
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<{ users: User[]; total: number }>('/api/admin/users', {
        params: {
          page,
          limit: LIMIT,
          search,
          status: statusFilter,
        },
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      toastError(err.message || 'İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBan = async (u: User) => {
    const newStatus = u.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    try {
      await apiClient.patch(`/api/admin/users/${u.id}`, { status: newStatus });
      toastSuccess(newStatus === 'BANNED' ? 'İstifadəçi bloklandı' : 'İstifadəçi aktivləşdirildi');
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Əməliyyat icra olunmadı');
    }
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setEditForm({
      subscriptionExpiry: u.subscriptionExpiry ? u.subscriptionExpiry.slice(0, 10) : '',
      maxSites: u.maxSites !== null ? String(u.maxSites) : '',
      customDate: '',
    });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditLoading(true);
    setEditError('');
    try {
      const body: Record<string, unknown> = {};

      if (editForm.subscriptionExpiry === 'unlimited') {
        body.subscriptionExpiry = null;
      } else if (editForm.subscriptionExpiry) {
        body.subscriptionExpiry = new Date(editForm.subscriptionExpiry).toISOString();
      }

      if (editForm.maxSites === '' || editForm.maxSites === 'unlimited') {
        body.maxSites = null;
      } else {
        body.maxSites = parseInt(editForm.maxSites);
      }

      await apiClient.patch(`/api/admin/users/${editUser.id}`, body);
      toastSuccess('Dəyişikliklər saxlandı');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditError(err.message || 'Yadda saxlanarkən xəta baş verdi');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/api/admin/users/${deleteUser.id}`);
      toastSuccess('İstifadəçi silindi');
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Silinmə zamanı xəta baş verdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'İstifadəçi',
      render: (u) => (
        <div>
          <p style={{ fontWeight: 600, color: '#E8E8F0', margin: 0 }}>{u.name || 'Ad qeyd olunmayıb'}</p>
          <p style={{ fontSize: 11, color: '#8888A0', margin: 0 }}>{u.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => {
        const s = userStatusLabel(u);
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              background: s.bg,
              color: s.color,
            }}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      key: 'role',
      header: 'Rol',
      render: (u) => (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 6,
            background: u.role === 'SUPER_ADMIN' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)',
            color: u.role === 'SUPER_ADMIN' ? '#F87171' : '#8888A0',
          }}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: 'subscriptionExpiry',
      header: 'Abunəlik Bitişi',
      render: (u) => (
        <span style={{ color: isExpired(u.subscriptionExpiry) ? '#FBBF24' : '#8888A0' }}>
          {formatDate(u.subscriptionExpiry)}
        </span>
      ),
    },
    {
      key: 'sites',
      header: 'Sayt Limiti',
      render: (u) => (
        <span style={{ color: '#8888A0' }}>
          {u._count.memberships} / {u.maxSites === null ? 'Limitsiz' : u.maxSites}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Qeydiyyat',
      render: (u) => (
        <span style={{ color: '#8888A0', whiteSpace: 'nowrap' }}>
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Əməliyyatlar',
      render: (u) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => openEdit(u)}
            title="Redaktə et"
            style={{
              background: 'rgba(124,92,252,0.1)',
              border: 'none',
              color: '#7C5CFC',
              borderRadius: 8,
              padding: '6px 8px',
              cursor: 'pointer',
            }}
          >
            <Edit2 size={14} />
          </button>
          {u.role !== 'SUPER_ADMIN' && (
            <>
              <button
                onClick={() => handleBan(u)}
                title={u.status === 'BANNED' ? 'Blokdan çıxar' : 'Blokla'}
                style={{
                  background: u.status === 'BANNED' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  border: 'none',
                  color: u.status === 'BANNED' ? '#34D399' : '#F87171',
                  borderRadius: 8,
                  padding: '6px 8px',
                  cursor: 'pointer',
                }}
              >
                {u.status === 'BANNED' ? <CheckCircle2 size={14} /> : <Ban size={14} />}
              </button>
              <button
                onClick={() => setDeleteUser(u)}
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
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title="İstifadəçilər"
        description={`Sistemdə qeydiyyatdan keçmiş cəmi ${total} istifadəçi`}
        icon={Users}
        iconColor="#7C5CFC"
        actions={
          <button
            onClick={fetchUsers}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <RefreshCw size={14} /> Yenilə
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={14} color="#8888A0" style={{ position: 'absolute', left: 12, top: 13 }} />
          <input
            type="text"
            placeholder="Ad və ya e-poçt axtar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="dash-input"
            style={{ paddingLeft: 34, height: 40, width: '100%' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="dash-input"
          style={{ width: 160, height: 40 }}
        >
          <option value="">Bütün statuslar</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="BANNED">Bloklanmış</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="İstifadəçi tapılmadı"
        emptyDescription="Axtarış meyarlarınıza uyğun heç bir istifadəçi mövcud deyil."
        pagination={{
          currentPage: page,
          totalPages,
          totalCount: total,
          onPageChange: (p) => setPage(p),
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteUser)}
        title="İstifadəçini Sil"
        description={`"${deleteUser?.email}" istifadəçisini və onun yaratdığı bütün saytları və məlumatları silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.`}
        confirmLabel="Bəli, sil"
        cancelLabel="Ləğv et"
        isDestructive={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteUser(null)}
      />

      {/* Edit Modal */}
      {editUser && (
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
              maxWidth: 480,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>
                İstifadəçi Redaktəsi
              </h2>
              <button
                onClick={() => setEditUser(null)}
                style={{ background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ color: '#8888A0', fontSize: 13, marginBottom: 16 }}>
              {editUser.name || 'Ad yoxdur'} ({editUser.email})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <FormField label="Abunəlik Müddəti">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {SUBSCRIPTION_PRESETS.map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, subscriptionExpiry: addDays(p.days) }))}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid #383334',
                        background: '#23232B',
                        color: '#E8E8F0',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      +{p.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, subscriptionExpiry: 'unlimited' }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #383334',
                      background: '#23232B',
                      color: '#00D37D',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Limitsiz
                  </button>
                </div>
                <input
                  type="date"
                  value={editForm.subscriptionExpiry === 'unlimited' ? '' : editForm.subscriptionExpiry}
                  onChange={(e) => setEditForm((f) => ({ ...f, subscriptionExpiry: e.target.value }))}
                  className="dash-input"
                />
              </FormField>

              <FormField label="Maksimum Sayt Sayı">
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {SITE_LIMIT_PRESETS.map((lim) => (
                    <button
                      key={lim}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, maxSites: String(lim) }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #383334',
                        background: '#23232B',
                        color: '#E8E8F0',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {lim} sayt
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, maxSites: 'unlimited' }))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid #383334',
                      background: '#23232B',
                      color: '#00D37D',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Limitsiz
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="Limitsiz üçün boş buraxın"
                  value={editForm.maxSites === 'unlimited' ? '' : editForm.maxSites}
                  onChange={(e) => setEditForm((f) => ({ ...f, maxSites: e.target.value }))}
                  className="dash-input"
                />
              </FormField>
            </div>

            {editError && (
              <p style={{ color: '#F87171', fontSize: 13, marginTop: 12, marginBottom: 0 }}>
                {editError}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                onClick={() => setEditUser(null)}
                className="dash-btn-secondary"
                disabled={editLoading}
              >
                Ləğv et
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Save size={14} /> {editLoading ? 'Saxlanılır...' : 'Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
