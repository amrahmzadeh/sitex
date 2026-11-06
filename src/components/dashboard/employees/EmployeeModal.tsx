'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Briefcase,
  KeyRound,
  ShieldCheck,
  Loader2,
  Check,
  AlertCircle,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { EmployeeItem, SystemModule, EmployeeOrganization } from './types';

interface Props {
  employee: EmployeeItem | null; // null = create mode
  systemModules: SystemModule[];
  organizations: EmployeeOrganization[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'personal' | 'work' | 'login' | 'permissions';

export default function EmployeeModal({
  employee,
  systemModules,
  organizations,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(employee);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [workSchedule, setWorkSchedule] = useState('Tam iş günü');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');
  const [organizationId, setOrganizationId] = useState('');
  const [baseSalary, setBaseSalary] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Permissions state: { [moduleId]: { canView, canCreate, canEdit, canDelete, canManage } }
  const [perms, setPerms] = useState<
    Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canManage: boolean }>
  >({});

  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    // Initial permissions map from system modules
    const initialPerms: Record<
      string,
      { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean; canManage: boolean }
    > = {};

    systemModules.forEach((m) => {
      initialPerms[m.id] = {
        canView: m.id === 'dashboard',
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false,
      };
    });

    if (employee) {
      setFullName(employee.fullName || '');
      setEmail(employee.email || '');
      setUsername(employee.username || '');
      setPhone(employee.phone || '');
      setBirthDate(employee.birthDate ? employee.birthDate.split('T')[0] : '');
      setAvatarUrl(employee.avatarUrl || '');
      setAddress(employee.address || '');
      setNotes(employee.notes || '');

      setPosition(employee.position || '');
      setDepartment(employee.department || '');
      setWorkSchedule(employee.workSchedule || 'Tam iş günü');
      setStartDate(employee.startDate ? employee.startDate.split('T')[0] : '');
      setStatus(employee.status || 'ACTIVE');
      setOrganizationId(employee.organizationId || '');
      setBaseSalary(employee.baseSalary != null ? String(employee.baseSalary) : '');

      setPassword('');
      setPasswordConfirm('');

      if (employee.permissions && employee.permissions.length > 0) {
        employee.permissions.forEach((p) => {
          initialPerms[p.module] = {
            canView: p.canView,
            canCreate: p.canCreate,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
            canManage: p.canManage,
          };
        });
      }
    } else {
      setFullName('');
      setEmail('');
      setUsername('');
      setPhone('');
      setBirthDate('');
      setAvatarUrl('');
      setAddress('');
      setNotes('');
      setPosition('');
      setDepartment('');
      setWorkSchedule('Tam iş günü');
      setStartDate(new Date().toISOString().split('T')[0]);
      setStatus('ACTIVE');
      setOrganizationId(organizations[0]?.id || '');
      setBaseSalary('');
      setPassword('');
      setPasswordConfirm('');
    }

    setPerms(initialPerms);
    setActiveTab('personal');
  }, [isOpen, employee, systemModules, organizations]);

  if (!isOpen) return null;

  const handleTogglePerm = (
    moduleId: string,
    action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canManage'
  ) => {
    setPerms((prev) => {
      const current = prev[moduleId] || {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManage: false,
      };

      const updated = { ...current };

      if (action === 'canManage') {
        const nextVal = !current.canManage;
        updated.canManage = nextVal;
        if (nextVal) {
          updated.canView = true;
          updated.canCreate = true;
          updated.canEdit = true;
          updated.canDelete = true;
        }
      } else {
        updated[action] = !current[action];
        // If creating, editing, or deleting, view must be enabled
        if ((action === 'canCreate' || action === 'canEdit' || action === 'canDelete') && updated[action]) {
          updated.canView = true;
        }
        // If view is disabled, disable all
        if (action === 'canView' && !updated.canView) {
          updated.canCreate = false;
          updated.canEdit = false;
          updated.canDelete = false;
          updated.canManage = false;
        }
        // If unchecking something while canManage is true, turn off canManage
        if (!updated[action] && updated.canManage) {
          updated.canManage = false;
        }
      }

      return { ...prev, [moduleId]: updated };
    });
  };

  // Bulk presets
  const applyPreset = (preset: 'all' | 'view_only' | 'reset' | 'editor') => {
    setPerms((prev) => {
      const next: typeof prev = {};
      systemModules.forEach((m) => {
        if (preset === 'all') {
          next[m.id] = {
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canManage: true,
          };
        } else if (preset === 'view_only') {
          next[m.id] = {
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canManage: false,
          };
        } else if (preset === 'editor') {
          next[m.id] = {
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: false,
            canManage: false,
          };
        } else {
          // reset
          next[m.id] = {
            canView: m.id === 'dashboard',
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canManage: false,
          };
        }
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Ad və soyad ən azı 2 simvol olmalıdır');
      setActiveTab('personal');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Düzgün e-poçt ünvanı daxil edin');
      setActiveTab('personal');
      return;
    }

    if (!isEdit) {
      if (!password || password.length < 6) {
        setError('Şifrə ən azı 6 simvol olmalıdır');
        setActiveTab('login');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Şifrələr uyğun gəlmir');
        setActiveTab('login');
        return;
      }
    }

    // Format permissions payload
    const permissionsPayload = Object.entries(perms).map(([moduleId, p]) => ({
      module: moduleId,
      canView: p.canView,
      canCreate: p.canCreate,
      canEdit: p.canEdit,
      canDelete: p.canDelete,
      canManage: p.canManage,
    }));

    setLoading(true);

    try {
      const url = isEdit ? `/api/employees/${employee?.id}` : '/api/employees';
      const method = isEdit ? 'PATCH' : 'POST';

      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim() || null,
        phone: phone.trim() || null,
        birthDate: birthDate || null,
        avatarUrl: avatarUrl.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
        position: position.trim() || null,
        department: department.trim() || null,
        workSchedule,
        startDate: startDate || null,
        status,
        organizationId: organizationId || null,
        baseSalary: baseSalary ? Number(baseSalary) : null,
        permissions: permissionsPayload,
      };

      if (!isEdit) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Xəta baş verdi');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#171717',
            border: '1px solid #383334',
            borderRadius: 18,
            width: '100%',
            maxWidth: 820,
            maxHeight: '92vh',
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
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                {isEdit ? 'Əməkdaş Məlumatlarını Redaktə Et' : 'Yeni Əməkdaş Əlavə Et'}
              </h3>
              <p style={{ fontSize: 13, color: '#B0B0B8', margin: '3px 0 0' }}>
                Fərdi giriş məlumatları və modul icazələrinin tənzimlənməsi
              </p>
            </div>
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
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '10px 24px',
              borderBottom: '1px solid #383334',
              background: '#1A1A1E',
            }}
          >
            {[
              { id: 'personal', label: 'Şəxsi Məlumatlar', icon: User },
              { id: 'work', label: 'İş Məlumatları', icon: Briefcase },
              ...(!isEdit ? [{ id: 'login', label: 'Giriş Məlumatları', icon: KeyRound }] : []),
              { id: 'permissions', label: 'Modul İcazələri', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: active ? 'rgba(0,211,125,0.15)' : 'transparent',
                    color: active ? '#00D37D' : '#B0B0B8',
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#EF4444',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 13,
                    marginBottom: 20,
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. PERSONAL TAB */}
              {activeTab === 'personal' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Ad və Soyad *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Məs: Əli Məmmədov"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      E-poçt Ünvanı *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eli@example.com"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Telefon Nömrəsi
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+994 50 123 45 67"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      İstifadəçi Adı (Login üçün)
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="eli_mammadov"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Doğum Tarixi
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Profil Şəkli (URL)
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Ünvan
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Bakı ş., Nizami ray."
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Əlavə Qeydlər
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Əməkdaş haqqında əlavə qeydlər..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {/* 2. WORK TAB */}
              {activeTab === 'work' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Peşəsi / Vəzifəsi
                    </label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Məs: Menyu İdarəçisi, Operator, Satış Meneceri"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Şöbə
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Məs: Xidmət, Marketinq, Mətbəx"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      İş Rejimi
                    </label>
                    <select
                      value={workSchedule}
                      onChange={(e) => setWorkSchedule(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="Tam iş günü">Tam iş günü (Full-time)</option>
                      <option value="Yarım iş günü">Yarım iş günü (Part-time)</option>
                      <option value="Növbəli">Növbəli (Shift)</option>
                      <option value="Sərbəst">Sərbəst qrafik (Flexible)</option>
                      <option value="Uzaqdan">Uzaqdan (Remote)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      İşə Başlama Tarixi
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      style={inputStyle}
                    >
                      <option value="ACTIVE">Aktiv (Girişə icazə verilir)</option>
                      <option value="INACTIVE">Deaktiv (Giriş bloklanır)</option>
                      <option value="ON_LEAVE">Məzuniyyətdə</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Aid Olduğu Sayt
                    </label>
                    <select
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Bütün saytlar</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Əsas Aylıq Maaş (₼)
                    </label>
                    <input
                      type="number"
                      value={baseSalary}
                      onChange={(e) => setBaseSalary(e.target.value)}
                      placeholder="0.00"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* 3. LOGIN TAB (for Create) */}
              {activeTab === 'login' && !isEdit && (
                <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Şifrə *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ən azı 6 simvol"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#B0B0B8', marginBottom: 6 }}>
                      Şifrənin Təkrarı *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Şifrəni təkrar daxil edin"
                      style={inputStyle}
                    />
                  </div>

                  <p style={{ fontSize: 12, color: '#8888A0', lineHeight: 1.5 }}>
                    💡 Əməkdaş sistemə daxil olarkən daxil etdiyiniz e-poçt ünvanını (və ya istifadəçi adını) və bu şifrəni istifadə edəcək. Şifrəni sonradan istənilən vaxt dəyişə bilərsiniz.
                  </p>
                </div>
              )}

              {/* 4. PERMISSIONS TAB */}
              {activeTab === 'permissions' && (
                <div>
                  {/* Presets header */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 16,
                      padding: '12px 16px',
                      background: '#202024',
                      borderRadius: 12,
                      border: '1px solid #383334',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={16} color="#00D37D" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>Hazır Şablonlar:</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => applyPreset('all')}
                        style={presetBtnStyle}
                      >
                        Tam Səlahiyyət
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('editor')}
                        style={presetBtnStyle}
                      >
                        Redaktor (Baxış+Redaktə)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('view_only')}
                        style={presetBtnStyle}
                      >
                        Yalnız Baxış
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('reset')}
                        style={{ ...presetBtnStyle, color: '#EF4444' }}
                      >
                        Sıfırla
                      </button>
                    </div>
                  </div>

                  {/* Modules Matrix Table */}
                  <div
                    style={{
                      border: '1px solid #383334',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#1A1A1E',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(180px, 2fr) repeat(5, minmax(70px, 1fr))',
                        padding: '12px 16px',
                        background: '#222226',
                        borderBottom: '1px solid #383334',
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

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {systemModules.map((mod) => {
                        const p = perms[mod.id] || {
                          canView: false,
                          canCreate: false,
                          canEdit: false,
                          canDelete: false,
                          canManage: false,
                        };

                        const hasCreate = mod.actions.includes('create');
                        const hasEdit = mod.actions.includes('edit');
                        const hasDelete = mod.actions.includes('delete');
                        const hasManage = mod.actions.includes('manage');

                        return (
                          <div
                            key={mod.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(180px, 2fr) repeat(5, minmax(70px, 1fr))',
                              padding: '10px 16px',
                              borderBottom: '1px solid #28282D',
                              alignItems: 'center',
                              background: p.canManage ? 'rgba(0,211,125,0.03)' : 'transparent',
                            }}
                          >
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7', margin: 0 }}>
                                {mod.label}
                              </p>
                              <p style={{ fontSize: 11, color: '#8888A0', margin: '2px 0 0' }}>
                                {mod.description}
                              </p>
                            </div>

                            {/* View */}
                            <div style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={p.canView || p.canManage}
                                onChange={() => handleTogglePerm(mod.id, 'canView')}
                                style={checkboxStyle}
                              />
                            </div>

                            {/* Create */}
                            <div style={{ textAlign: 'center' }}>
                              {hasCreate ? (
                                <input
                                  type="checkbox"
                                  checked={p.canCreate || p.canManage}
                                  onChange={() => handleTogglePerm(mod.id, 'canCreate')}
                                  style={checkboxStyle}
                                />
                              ) : (
                                <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>
                              )}
                            </div>

                            {/* Edit */}
                            <div style={{ textAlign: 'center' }}>
                              {hasEdit ? (
                                <input
                                  type="checkbox"
                                  checked={p.canEdit || p.canManage}
                                  onChange={() => handleTogglePerm(mod.id, 'canEdit')}
                                  style={checkboxStyle}
                                />
                              ) : (
                                <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>
                              )}
                            </div>

                            {/* Delete */}
                            <div style={{ textAlign: 'center' }}>
                              {hasDelete ? (
                                <input
                                  type="checkbox"
                                  checked={p.canDelete || p.canManage}
                                  onChange={() => handleTogglePerm(mod.id, 'canDelete')}
                                  style={checkboxStyle}
                                />
                              ) : (
                                <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>
                              )}
                            </div>

                            {/* Manage */}
                            <div style={{ textAlign: 'center' }}>
                              {hasManage ? (
                                <input
                                  type="checkbox"
                                  checked={p.canManage}
                                  onChange={() => handleTogglePerm(mod.id, 'canManage')}
                                  style={checkboxStyle}
                                />
                              ) : (
                                <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #383334',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#1A1A1E',
              }}
            >
              <div style={{ fontSize: 12, color: '#B0B0B8' }}>
                {activeTab === 'personal' && '1/4 Şəxsi Məlumatlar'}
                {activeTab === 'work' && '2/4 İş Məlumatları'}
                {activeTab === 'login' && '3/4 Giriş Məlumatları'}
                {activeTab === 'permissions' && '4/4 İcazələr'}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 10,
                    background: '#2E292A',
                    border: '1px solid #383334',
                    color: '#B0B0B8',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 22px',
                    borderRadius: 10,
                    background: '#00D37D',
                    border: 'none',
                    color: '#121212',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {isEdit ? 'Yadda saxla' : 'Əməkdaşı Yarat'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  background: '#202024',
  border: '1px solid #383334',
  color: '#F5F5F7',
  fontSize: 13,
  outline: 'none',
};

const presetBtnStyle: React.CSSProperties = {
  padding: '5px 12px',
  borderRadius: 8,
  background: '#2A2A2F',
  border: '1px solid #383334',
  color: '#F5F5F7',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
};

const checkboxStyle: React.CSSProperties = {
  width: 17,
  height: 17,
  accentColor: '#00D37D',
  cursor: 'pointer',
};

