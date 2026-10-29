'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search, RefreshCw, Edit2, Ban, CheckCircle2, Trash2,
  Clock, ChevronLeft, ChevronRight, X, Save,
} from 'lucide-react';

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
  const [editSuccess, setEditSuccess] = useState('');

  // Delete confirm
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState('');

  const LIMIT = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleBan = async (u: User) => {
    const newStatus = u.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(newStatus === 'BANNED' ? 'İstifadəçi bloklandı' : 'İstifadəçi aktivləşdirildi');
      fetchUsers();
    } else {
      const d = await res.json();
      showToast(d.error || 'Xəta baş verdi');
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
    setEditSuccess('');
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    try {
      const body: Record<string, unknown> = {};

      // subscription
      if (editForm.subscriptionExpiry === 'unlimited') {
        body.subscriptionExpiry = null;
      } else if (editForm.subscriptionExpiry) {
        body.subscriptionExpiry = new Date(editForm.subscriptionExpiry).toISOString();
      }

      // maxSites
      if (editForm.maxSites === '' || editForm.maxSites === 'unlimited') {
        body.maxSites = null;
      } else {
        body.maxSites = parseInt(editForm.maxSites);
      }

      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Xəta baş verdi');
      } else {
        setEditSuccess('Dəyişikliklər saxlandı');
        fetchUsers();
        setTimeout(() => setEditUser(null), 1200);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (res.ok) {
      showToast('İstifadəçi silindi');
      setDeleteUser(null);
      fetchUsers();
    } else {
      const d = await res.json();
      showToast(d.error || 'Xəta baş verdi');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 12, padding: '12px 20px', color: '#E8E8F0', fontSize: 14, zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0' }}>İstifadəçilər</h1>
          <p style={{ color: '#8888A0', fontSize: 14 }}>Cəmi: {total} istifadəçi</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={fetchUsers} style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Yenilə
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} color="#8888A0" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="Ad və ya e-poçt axtar..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="dash-input"
            style={{ paddingLeft: 34 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="dash-input"
          style={{ width: 160 }}
        >
          <option value="">Bütün statuslar</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="BANNED">Bloklanmış</option>
        </select>
      </div>

      {/* Table */}
      <div className="dash-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A3A' }}>
                {['Ad', 'E-poçt', 'Qeydiyyat', 'Status', 'Müddət', 'Sayt Limiti', 'Saytlar', 'Əməliyyatlar'].map(h => (
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>
                    İstifadəçi tapılmadı
                  </td>
                </tr>
              ) : users.map(u => {
                const statusInfo = userStatusLabel(u);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1A1A24' }}>
                    <td style={{ padding: '12px 16px', color: '#E8E8F0', fontWeight: 500 }}>
                      {u.name || '—'}
                      {u.role === 'SUPER_ADMIN' && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: '#F87171', background: 'rgba(248,113,113,0.1)', padding: '2px 6px', borderRadius: 6 }}>
                          Admin
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: '#8888A0', whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0', whiteSpace: 'nowrap' }}>
                      {u.subscriptionExpiry
                        ? <span style={{ color: isExpired(u.subscriptionExpiry) ? '#F87171' : '#E8E8F0' }}>{formatDate(u.subscriptionExpiry)}</span>
                        : <span style={{ color: '#34D399' }}>Limitsiz</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0' }}>
                      {u.maxSites === null ? <span style={{ color: '#34D399' }}>Limitsiz</span> : u.maxSites}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#7C5CFC', fontWeight: 600 }}>
                      {u._count.memberships}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openEdit(u)}
                          title="Redaktə et"
                          style={{ background: 'rgba(124,92,252,0.1)', border: 'none', color: '#7C5CFC', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleBan(u)}
                          title={u.status === 'BANNED' ? 'Aktivləşdir' : 'Blokla'}
                          disabled={u.role === 'SUPER_ADMIN'}
                          style={{ background: u.status === 'BANNED' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: 'none', color: u.status === 'BANNED' ? '#34D399' : '#F87171', borderRadius: 8, padding: '6px 8px', cursor: u.role === 'SUPER_ADMIN' ? 'not-allowed' : 'pointer', opacity: u.role === 'SUPER_ADMIN' ? 0.4 : 1 }}
                        >
                          {u.status === 'BANNED' ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                        </button>
                        <button
                          onClick={() => setDeleteUser(u)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderTop: '1px solid #2A2A3A', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 8, padding: '6px 10px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, color: '#8888A0' }}>{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 8, padding: '6px 10px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>Redaktə: {editUser.name || editUser.email}</h2>
              <button onClick={() => setEditUser(null)} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16 }}>
                {editError}
              </div>
            )}
            {editSuccess && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 14px', color: '#34D399', fontSize: 13, marginBottom: 16 }}>
                {editSuccess}
              </div>
            )}

            {/* Subscription */}
            <div style={{ marginBottom: 24 }}>
              <label className="dash-label">İstifadə Müddəti</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {SUBSCRIPTION_PRESETS.map(p => (
                  <button
                    key={p.days}
                    onClick={() => setEditForm(f => ({ ...f, subscriptionExpiry: addDays(p.days) }))}
                    className="dash-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    +{p.label}
                  </button>
                ))}
                <button
                  onClick={() => setEditForm(f => ({ ...f, subscriptionExpiry: 'unlimited' }))}
                  className="dash-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12, color: '#34D399', borderColor: 'rgba(52,211,153,0.3)' }}
                >
                  Limitsiz
                </button>
              </div>
              <input
                type="date"
                value={editForm.subscriptionExpiry === 'unlimited' ? '' : editForm.subscriptionExpiry}
                onChange={e => setEditForm(f => ({ ...f, subscriptionExpiry: e.target.value }))}
                className="dash-input"
                placeholder="Fərdi tarix seçin"
              />
              {editForm.subscriptionExpiry === 'unlimited' && (
                <p style={{ fontSize: 12, color: '#34D399', marginTop: 4 }}>Limitsiz seçilib</p>
              )}
            </div>

            {/* Max Sites */}
            <div style={{ marginBottom: 24 }}>
              <label className="dash-label">Maksimum Sayt Limiti</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {SITE_LIMIT_PRESETS.map(n => (
                  <button
                    key={n}
                    onClick={() => setEditForm(f => ({ ...f, maxSites: String(n) }))}
                    className="dash-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12, background: editForm.maxSites === String(n) ? 'rgba(124,92,252,0.15)' : 'transparent', borderColor: editForm.maxSites === String(n) ? '#7C5CFC' : undefined, color: editForm.maxSites === String(n) ? '#9B7FFF' : undefined }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setEditForm(f => ({ ...f, maxSites: 'unlimited' }))}
                  className="dash-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: 12, color: '#34D399', borderColor: editForm.maxSites === 'unlimited' ? '#34D399' : 'rgba(52,211,153,0.3)' }}
                >
                  Limitsiz
                </button>
              </div>
              {editForm.maxSites !== 'unlimited' && (
                <input
                  type="number"
                  min={0}
                  value={editForm.maxSites}
                  onChange={e => setEditForm(f => ({ ...f, maxSites: e.target.value }))}
                  className="dash-input"
                  placeholder="Fərdi limit daxil edin"
                />
              )}
              {editForm.maxSites === 'unlimited' && (
                <p style={{ fontSize: 12, color: '#34D399', marginTop: 4 }}>Limitsiz seçilib</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditUser(null)} className="dash-btn-secondary">
                Ləğv et
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: editLoading ? 0.7 : 1 }}
              >
                <Save size={14} /> Saxla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#1A1A24', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', marginBottom: 12 }}>İstifadəçini Sil</h2>
            <p style={{ color: '#8888A0', fontSize: 14, marginBottom: 8 }}>
              <strong style={{ color: '#E8E8F0' }}>{deleteUser.name || deleteUser.email}</strong> adlı istifadəçini və ona aid bütün saytları, menyuları, şəkilləri həmişəlik silmək istəyirsiniz?
            </p>
            <p style={{ color: '#F87171', fontSize: 13, marginBottom: 24 }}>
              ⚠️ Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteUser(null)} className="dash-btn-secondary">Ləğv et</button>
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

