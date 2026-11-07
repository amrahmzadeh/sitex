'use client';

import React, { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount?: number;
    onPageChange: (page: number) => void;
  };
  keyExtractor?: (item: T, index: number) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'Məlumat tapılmadı',
  emptyDescription = 'Cədvəldə göstəriləcək heç bir qeyd yoxdur.',
  pagination,
  keyExtractor = (item, idx) => item.id || idx,
}: DataTableProps<T>) {
  return (
    <div
      className="dash-card"
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #383334',
        background: '#1A1A1E',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2A2A32', background: '#141418' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '14px 18px',
                    textAlign: col.align || 'left',
                    color: '#8888A0',
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    width: col.width,
                    whiteSpace: 'nowrap',
                  }}
                  className={col.className}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #24242C' }}>
                  {columns.map((col, j) => (
                    <td key={j} style={{ padding: '16px 18px' }}>
                      <div className="skeleton" style={{ height: 16, borderRadius: 4, width: '75%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  style={{
                    borderBottom: '1px solid #24242C',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: '14px 18px',
                        textAlign: col.align || 'left',
                        color: '#E8E8F0',
                        verticalAlign: 'middle',
                      }}
                      className={col.className}
                    >
                      {col.render ? col.render(item, index) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #2A2A32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            color: '#8888A0',
          }}
        >
          <span>
            {pagination.totalCount !== undefined
              ? `Cəmi ${pagination.totalCount} qeyd (Səhifə ${pagination.currentPage} / ${pagination.totalPages})`
              : `Səhifə ${pagination.currentPage} / ${pagination.totalPages}`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || loading}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #383334',
                background: '#23232B',
                color: pagination.currentPage <= 1 ? '#555566' : '#E8E8F0',
                cursor: pagination.currentPage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ChevronLeft size={15} /> Əvvəlki
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || loading}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #383334',
                background: '#23232B',
                color: pagination.currentPage >= pagination.totalPages ? '#555566' : '#E8E8F0',
                cursor: pagination.currentPage >= pagination.totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Növbəti <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

