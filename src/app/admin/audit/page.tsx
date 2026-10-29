'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  meta: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string };
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  BAN_USER: { label: 'İstifadəçi Bloklandı', color: '#F87171' },
  UPDATE_USER: { label: 'İstifadəçi Yeniləndi', color: '#7C5CFC' },
  DELETE_USER: { label: 'İstifadəçi Silindi', color: '#F87171' },
  ADMIN_DELETE_SITE: { label: 'Sayt Silindi (Admin)', color: '#F87171' },
  DELETE_SITE: { label: 'Sayt Silindi', color: '#FBBF24' },
  PUBLISH_SITE: { label: 'Sayt Yayınlandı', color: '#34D399' },
  UNPUBLISH_SITE: { label: 'Yayın Dayandırıldı', color: '#FBBF24' },
  UPDATE_SETTINGS: { label: 'Parametrlər Dəyişdirildi', color: '#22D3EE' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('az-AZ');
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?page=${page}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0' }}>Audit Jurnalı</h1>
          <p style={{ color: '#8888A0', fontSize: 14 }}>Cəmi: {total} əməliyyat</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={fetchLogs} style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Yenilə
        </button>
      </div>

      <div className="dash-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2A2A3A' }}>
                {['Tarix', 'Admin', 'Əməliyyat', 'Hədəf', 'Məlumat'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8888A0', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '80%' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#8888A0' }}>
                    Hələ heç bir əməliyyat yoxdur
                  </td>
                </tr>
              ) : logs.map(log => {
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: '#8888A0' };
                let metaStr = '';
                try {
                  if (log.meta) {
                    const parsed = JSON.parse(log.meta);
                    metaStr = Object.entries(parsed)
                      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                      .join(' | ');
                  }
                } catch { metaStr = log.meta || ''; }

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #1A1A24' }}>
                    <td style={{ padding: '12px 16px', color: '#8888A0', whiteSpace: 'nowrap', fontSize: 12 }}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ color: '#E8E8F0' }}>{log.actor.name || '—'}</p>
                      <p style={{ color: '#8888A0', fontSize: 11 }}>{log.actor.email}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: `${actionInfo.color}15`, color: actionInfo.color, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {actionInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0', fontSize: 12 }}>
                      <span style={{ color: '#7C5CFC' }}>{log.targetType}</span> · {log.targetId.slice(0, 12)}…
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8888A0', fontSize: 12, maxWidth: 300 }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {metaStr || '—'}
                      </span>
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
    </div>
  );
}

