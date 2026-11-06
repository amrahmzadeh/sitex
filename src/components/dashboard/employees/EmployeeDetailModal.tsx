'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building,
  ShieldCheck,
  MapPin,
  Clock,
  KeyRound,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { EmployeeItem, SystemModule } from './types';

interface Props {
  employee: EmployeeItem | null;
  systemModules: SystemModule[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (employee: EmployeeItem) => void;
  onResetPassword: (employee: EmployeeItem) => void;
}

export default function EmployeeDetailModal({
  employee,
  systemModules,
  isOpen,
  onClose,
  onEdit,
  onResetPassword,
}: Props) {
  if (!isOpen || !employee) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Qeyd olunmayıb';
    try {
      return new Date(dateStr).toLocaleDateString('az-AZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Aktiv', color: '#00D37D', bg: 'rgba(0, 211, 125, 0.15)' };
      case 'INACTIVE':
        return { label: 'Deaktiv', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'ON_LEAVE':
        return { label: 'Məzuniyyətdə', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { label: status, color: '#B0B0B8', bg: 'rgba(176, 176, 184, 0.15)' };
    }
  };

  const statusBadge = getStatusBadge(employee.status);

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#171717',
            border: '1px solid #383334',
            borderRadius: 18,
            width: '100%',
            maxWidth: 720,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #383334',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #00D37D, #008f53)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#121212',
                  overflow: 'hidden',
                }}
              >
                {employee.avatarUrl ? (
                  <img
                    src={employee.avatarUrl}
                    alt={employee.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  employee.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                    {employee.fullName}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: statusBadge.color,
                      background: statusBadge.bg,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#B0B0B8', margin: '2px 0 0' }}>
                  {employee.position || 'Vəzifə qeyd olunmayıb'} • {employee.department || 'Ümumi şöbə'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => {
                  onClose();
                  onResetPassword(employee);
                }}
                title="Şifrəni yenilə"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: 'rgba(236,72,153,0.15)',
                  border: 'none',
                  color: '#EC4899',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <KeyRound size={14} />
                Şifrə
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(employee);
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: '#2E292A',
                  border: '1px solid #383334',
                  color: '#F5F5F7',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Redaktə et
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#B0B0B8',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 8,
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {/* Contact & Meta info grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 14,
                marginBottom: 24,
              }}
            >
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <Mail size={13} /> E-poçt
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0, wordBreak: 'break-all' }}>
                  {employee.email}
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <User size={13} /> İstifadəçi Adı
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                  {employee.username || 'Qeyd olunmayıb'}
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <Phone size={13} /> Telefon
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                  {employee.phone || 'Qeyd olunmayıb'}
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <Building size={13} /> Təyin olunan Sayt
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                  {employee.organization?.name || 'Bütün saytlar'}
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <Briefcase size={13} /> İş Rejimi
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                  {employee.workSchedule || 'Tam iş günü'}
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <Calendar size={13} /> İşə Başlama Tarixi
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                  {formatDate(employee.startDate)}
                </p>
              </div>

              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                  <Clock size={13} /> Son Giriş
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                  {employee.lastLoginAt ? new Date(employee.lastLoginAt).toLocaleString('az-AZ') : 'Heç vaxt'}
                </p>
              </div>

              {employee.address && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#202024', border: '1px solid #383334' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 11, marginBottom: 4 }}>
                    <MapPin size={13} /> Ünvan
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                    {employee.address}
                  </p>
                </div>
              )}
            </div>

            {employee.notes && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: '#202024',
                  border: '1px solid #383334',
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#B0B0B8', fontSize: 12, marginBottom: 6 }}>
                  <FileText size={14} /> Əlavə Qeydlər
                </div>
                <p style={{ fontSize: 13, color: '#E4E4E7', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {employee.notes}
                </p>
              </div>
            )}

            {/* Permissions breakdown */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <ShieldCheck size={18} color="#00D37D" />
                <h4 style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>
                  Modul İcazələri ({employee.permissions?.length || 0})
                </h4>
              </div>

              <div
                style={{
                  border: '1px solid #383334',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#202024',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                    padding: '10px 14px',
                    borderBottom: '1px solid #383334',
                    background: '#1A1A1E',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#B0B0B8',
                  }}
                >
                  <div>Modul</div>
                  <div style={{ textAlign: 'center' }}>Baxış</div>
                  <div style={{ textAlign: 'center' }}>Yarat</div>
                  <div style={{ textAlign: 'center' }}>Redaktə</div>
                  <div style={{ textAlign: 'center' }}>Sil</div>
                  <div style={{ textAlign: 'center' }}>Tam İdarə</div>
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {systemModules.map((mod) => {
                    const perm = employee.permissions?.find((p) => p.module === mod.id);
                    const canView = perm?.canView || perm?.canManage || false;
                    const canCreate = perm?.canCreate || perm?.canManage || false;
                    const canEdit = perm?.canEdit || perm?.canManage || false;
                    const canDelete = perm?.canDelete || perm?.canManage || false;
                    const canManage = perm?.canManage || false;

                    return (
                      <div
                        key={mod.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                          padding: '10px 14px',
                          borderBottom: '1px solid #2E292A',
                          alignItems: 'center',
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 500, color: '#F5F5F7', margin: 0 }}>
                            {mod.label}
                          </p>
                          <p style={{ fontSize: 11, color: '#8888A0', margin: 0 }}>
                            {mod.description}
                          </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          {canView ? <CheckCircle2 size={16} color="#00D37D" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#4B5563" style={{ margin: '0 auto' }} />}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          {canCreate ? <CheckCircle2 size={16} color="#00D37D" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#4B5563" style={{ margin: '0 auto' }} />}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          {canEdit ? <CheckCircle2 size={16} color="#00D37D" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#4B5563" style={{ margin: '0 auto' }} />}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          {canDelete ? <CheckCircle2 size={16} color="#00D37D" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#4B5563" style={{ margin: '0 auto' }} />}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          {canManage ? <CheckCircle2 size={16} color="#3B82F6" style={{ margin: '0 auto' }} /> : <XCircle size={16} color="#4B5563" style={{ margin: '0 auto' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

