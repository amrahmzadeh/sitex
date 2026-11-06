'use client';

import { useState } from 'react';
import {
  Eye,
  Edit,
  KeyRound,
  History,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  ShieldAlert,
  BarChart2,
} from 'lucide-react';
import { EmployeeItem } from './types';

interface Props {
  employees: EmployeeItem[];
  loading: boolean;
  onView: (emp: EmployeeItem) => void;
  onEdit: (emp: EmployeeItem) => void;
  onResetPassword: (emp: EmployeeItem) => void;
  onViewActivity: (emp: EmployeeItem) => void;
  onToggleStatus: (emp: EmployeeItem) => void;
  onDelete: (emp: EmployeeItem) => void;
  onAddNew: () => void;
  onFinance?: (emp: EmployeeItem) => void;
}

export default function EmployeeTable({
  employees,
  loading,
  onView,
  onEdit,
  onResetPassword,
  onViewActivity,
  onToggleStatus,
  onDelete,
  onAddNew,
  onFinance,
}: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Aktiv', color: '#00D37D', bg: 'rgba(0, 211, 125, 0.15)' };
      case 'INACTIVE':
        return { label: 'Deaktiv', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'ON_LEAVE':
        return { label: 'Məzuniyyət', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { label: status, color: '#B0B0B8', bg: 'rgba(176, 176, 184, 0.15)' };
    }
  };

  const formatLastLogin = (dateStr?: string | null) => {
    if (!dateStr) return 'Heç vaxt';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) return 'İndicə';
      if (diffMins < 60) return `${diffMins} dəq əvvəl`;
      if (diffHours < 24) return `${diffHours} saat əvvəl`;
      if (diffDays === 1) return 'Dünən';
      if (diffDays < 7) return `${diffDays} gün əvvəl`;

      return date.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#171717', border: '1px solid #383334', borderRadius: 16, padding: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 0',
              borderBottom: i < 4 ? '1px solid #28282D' : 'none',
              opacity: 0.5,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#2E292A' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: 140, height: 14, borderRadius: 6, background: '#2E292A', marginBottom: 8 }} />
              <div style={{ width: 200, height: 10, borderRadius: 4, background: '#222226' }} />
            </div>
            <div style={{ width: 80, height: 22, borderRadius: 6, background: '#2E292A' }} />
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div
        style={{
          background: '#171717',
          border: '1px solid #383334',
          borderRadius: 16,
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: 'rgba(0,211,125,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#00D37D',
          }}
        >
          <Building2 size={30} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 6 }}>
          Əməkdaş tapılmadı
        </h3>
        <p style={{ color: '#8888A0', fontSize: 13, maxWidth: 380, margin: '0 auto 20px' }}>
          Axtarışınıza uyğun heç bir əməkdaş yoxdur və ya hələ heç bir əməkdaş əlavə edilməyib.
        </p>
        <button
          onClick={onAddNew}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            background: '#00D37D',
            border: 'none',
            color: '#121212',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Yeni Əməkdaş Əlavə Et
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#171717',
        border: '1px solid #383334',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #383334', background: '#1A1A1E' }}>
              <th style={thStyle}>Əməkdaş</th>
              <th style={thStyle}>Vəzifə / Şöbə</th>
              <th style={thStyle}>Əlaqə</th>
              <th style={thStyle}>Sayt</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Son Giriş</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const statusBadge = getStatusBadge(emp.status);
              const isMenuOpen = activeMenuId === emp.id;

              return (
                <tr
                  key={emp.id}
                  style={{
                    borderBottom: '1px solid #28282D',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1E1E22';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Name + Avatar */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #00D37D, #008f53)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#121212',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {emp.avatarUrl ? (
                          <img
                            src={emp.avatarUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          emp.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>
                            {emp.fullName}
                          </span>
                        </div>
                        {emp.username && (
                          <span style={{ fontSize: 11, color: '#8888A0' }}>
                            @{emp.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Position / Dept */}
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13, color: '#F5F5F7', fontWeight: 500 }}>
                      {emp.position || '—'}
                    </div>
                    {emp.department && (
                      <div style={{ fontSize: 11, color: '#8888A0' }}>
                        {emp.department}
                      </div>
                    )}
                  </td>

                  {/* Contact */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#F5F5F7' }}>
                      <Mail size={12} color="#B0B0B8" />
                      <span>{emp.email}</span>
                    </div>
                    {emp.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8888A0', marginTop: 2 }}>
                        <Phone size={12} color="#8888A0" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                  </td>

                  {/* Organization */}
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: '#B0B0B8' }}>
                      {emp.organization?.name || 'Bütün saytlar'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        color: statusBadge.color,
                        background: statusBadge.bg,
                        padding: '3px 8px',
                        borderRadius: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: statusBadge.color,
                        }}
                      />
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#B0B0B8' }}>
                      <Clock size={12} />
                      <span>{formatLastLogin(emp.lastLoginAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => onView(emp)}
                        title="Profilə bax"
                        style={actionIconBtnStyle}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        title="Redaktə et"
                        style={actionIconBtnStyle}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => onResetPassword(emp)}
                        title="Şifrəni dəyiş"
                        style={actionIconBtnStyle}
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        onClick={() => onViewActivity(emp)}
                        title="Fəaliyyət tarixçəsi"
                        style={actionIconBtnStyle}
                      >
                        <History size={15} />
                      </button>
                      {onFinance && (
                        <button
                          onClick={() => onFinance(emp)}
                          title="Maliyyə & Qiymətləndirmə"
                          style={{ ...actionIconBtnStyle, color: '#00D37D' }}
                        >
                          <BarChart2 size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => onToggleStatus(emp)}
                        title={emp.status === 'ACTIVE' ? 'Deaktiv et' : 'Aktiv et'}
                        style={{
                          ...actionIconBtnStyle,
                          color: emp.status === 'ACTIVE' ? '#EF4444' : '#00D37D',
                        }}
                      >
                        {emp.status === 'ACTIVE' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                      </button>
                      <button
                        onClick={() => onDelete(emp)}
                        title="Sil"
                        style={{
                          ...actionIconBtnStyle,
                          color: '#EF4444',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 18px',
  fontSize: 12,
  fontWeight: 600,
  color: '#B0B0B8',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 18px',
  verticalAlign: 'middle',
};

const actionIconBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: '#222226',
  border: '1px solid #383334',
  color: '#B0B0B8',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

