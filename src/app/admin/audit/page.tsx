'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { DataTable, Column, PageHeader } from '@/components/common';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';

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
  const { error: toastError } = useToast();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<{ logs: AuditEntry[]; total: number }>(`/api/admin/audit?page=${page}`);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      toastError(err.message || 'Audit qeydləri yüklənmədi');
    } finally {
      setLoading(false);
    }
  }, [page, toastError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  const columns: Column<AuditEntry>[] = [
    {
      key: 'createdAt',
      header: 'Tarix',
      width: 170,
      render: (log) => (
        <span style={{ color: '#8888A0', fontSize: 12, whiteSpace: 'nowrap' }}>
          {formatDate(log.createdAt)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Admin',
      width: 180,
      render: (log) => (
        <div>
          <p style={{ fontWeight: 600, color: '#E8E8F0', margin: 0 }}>{log.actor.name || 'Admin'}</p>
          <p style={{ fontSize: 11, color: '#8888A0', margin: 0 }}>{log.actor.email}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Əməliyyat',
      width: 180,
      render: (log) => {
        const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: '#8888A0' };
        return (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: `${actionInfo.color}15`,
              color: actionInfo.color,
              whiteSpace: 'nowrap',
            }}
          >
            {actionInfo.label}
          </span>
        );
      },
    },
    {
      key: 'target',
      header: 'Hədəf',
      width: 150,
      render: (log) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#8888A0' }}>
          {log.targetType}:{log.targetId.slice(-6)}
        </span>
      ),
    },
    {
      key: 'meta',
      header: 'Məlumat',
      render: (log) => {
        let metaStr = '';
        try {
          if (log.meta) {
            const parsed = JSON.parse(log.meta);
            metaStr = Object.entries(parsed)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
              .join(' | ');
          }
        } catch {
          metaStr = log.meta || '';
        }
        return (
          <span
            style={{
              fontSize: 12,
              color: '#8888A0',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {metaStr || '—'}
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader
        title="Audit Jurnalı"
        description={`Sistemdə icra olunmuş cəmi ${total} əməliyyat`}
        icon={FileText}
        iconColor="#7C5CFC"
        actions={
          <button
            onClick={fetchLogs}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <RefreshCw size={14} /> Yenilə
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyTitle="Hələ heç bir əməliyyat qeydə alınmayıb"
        emptyDescription="Sistem əməliyyatları icra edildikcə burada göstəriləcək."
        pagination={{
          currentPage: page,
          totalPages,
          totalCount: total,
          onPageChange: (p) => setPage(p),
        }}
      />
    </div>
  );
}
