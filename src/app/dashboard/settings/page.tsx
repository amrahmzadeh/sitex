'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader2, Check, Upload, User, Lock, Mail } from 'lucide-react';
import { useRef } from 'react';
import { useSession } from 'next-auth/react';

function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) { setOrgId(saved); return; }
    fetch('/api/organizations').then(r => r.json()).then(d => {
      if (d.organizations?.[0]) { setOrgId(d.organizations[0].id); localStorage.setItem('currentOrgId', d.organizations[0].id); }
    });
  }, []);
  return orgId;
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const orgId = useCurrentOrg();

  // Business form state
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '', city: '', mapUrl: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // User account state
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });
  const [userLoading, setUserLoading] = useState(true);
  const [userSaving, setUserSaving] = useState(false);
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Fetch business info
  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}`).then(r => r.json()).then(d => {
      if (d.organization) setForm({ name: d.organization.name, description: d.organization.description || '', phone: d.organization.phone || '', email: d.organization.email || '', address: d.organization.address || '', city: d.organization.city || '', mapUrl: d.organization.mapUrl || '', logo: d.organization.logo || '' });
    }).finally(() => setLoading(false));
  }, [orgId]);

  // Fetch user profile
  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUserProfile({
            name: d.user.name || '',
            email: d.user.email || '',
          });
        }
      })
      .finally(() => setUserLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSaving(true);
    setUserError('');
    setUserSuccess('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userProfile.name,
          email: userProfile.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUserError(data.error || 'Xəta baş verdi');
      } else {
        setUserSuccess('Hesab məlumatları yeniləndi');
        if (updateSession) {
          await updateSession();
        }
        setTimeout(() => setUserSuccess(''), 3000);
      }
    } catch {
      setUserError('Yenilənmə zamanı xəta baş verdi');
    } finally {
      setUserSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('Yeni şifrələr bir-biri ilə uyğun gəlmir');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPassError('Yeni şifrə ən azı 6 simvoldan ibarət olmalıdır');
      return;
    }

    setPassSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || 'Xəta baş verdi');
      } else {
        setPassSuccess('Şifrə uğurla dəyişdirildi');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPassSuccess(''), 3000);
      }
    } catch {
      setPassError('Şifrə dəyişdirilərkən xəta baş verdi');
    } finally {
      setPassSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!orgId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        set('logo', data.url);
      } else {
        alert(data.error || 'Logo yüklənərkən xəta baş verdi');
      }
    } catch (e: any) {
      alert(e?.message || 'Logo yüklənərkən xəta baş verdi');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description ? form.description.trim() : null,
        phone: form.phone ? form.phone.trim() : null,
        email: form.email ? form.email.trim() : null,
        address: form.address ? form.address.trim() : null,
        city: form.city ? form.city.trim() : null,
        mapUrl: form.mapUrl ? form.mapUrl.trim() : null,
        logo: form.logo ? form.logo.trim() : null,
      };
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || 'Saxlama zamanı xəta baş verdi');
      }
    } catch (e: any) {
      alert(e?.message || 'Saxlama zamanı xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Settings size={28} color="#00D37D" /> Parametrlər
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>Profil və sayt parametrlərinizi idarə edin</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ================= USER ACCOUNT SETTINGS ================= */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 24, border: '1px solid rgba(124, 92, 252, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <User size={20} color="#00D37D" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0' }}>İstifadəçi Hesabım</h2>
          </div>

          {userSuccess && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 14px', color: '#34D399', fontSize: 13, marginBottom: 16 }}>
              ✓ {userSuccess}
            </div>
          )}
          {userError && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16 }}>
              {userError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="dash-label">Ad və Soyad</label>
                <input
                  className="dash-input"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Adınız"
                  required
                />
              </div>
              <div>
                <label className="dash-label">E-poçt ünvanı</label>
                <input
                  className="dash-input"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="sizin@email.com"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="submit"
                disabled={userSaving || userLoading}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 18px' }}
              >
                {userSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                {userSaving ? 'Saxlanılır...' : 'Hesab məlumatlarını yenilə'}
              </button>
            </div>
          </form>

          {/* Password Change Form */}
          <div style={{ borderTop: '1px solid #383334', marginTop: 20, paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Lock size={16} color="#8888A0" />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0' }}>Şifrəni Dəyişdir</h3>
            </div>

            {passSuccess && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 14px', color: '#34D399', fontSize: 13, marginBottom: 16 }}>
                ✓ {passSuccess}
              </div>
            )}
            {passError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16 }}>
                {passError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="dash-label">Cari Şifrə</label>
                <input
                  type="password"
                  className="dash-input"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="dash-label">Yeni Şifrə</label>
                  <input
                    type="password"
                    className="dash-input"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Ən azı 6 simvol"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="dash-label">Yeni Şifrə (Təkrar)</label>
                  <input
                    type="password"
                    className="dash-input"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Şifrəni təsdiqləyin"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={passSaving}
                  className="dash-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 18px' }}
                >
                  {passSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={14} />}
                  {passSaving ? 'Dəyişdirilir...' : 'Şifrəni yenilə'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ================= BUSINESS SETTINGS ================= */}
        {orgId && (
          <>
            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>Sayt Logosu</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <div style={{ width: 80, height: 80, borderRadius: 16, background: '#383334', overflow: 'hidden', flexShrink: 0, border: '1px solid #3A3A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {form.logo ? (
                    <img src={form.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                  ) : (
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#00D37D' }}>{form.name?.[0] || '?'}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="dash-btn-secondary"
                      disabled={uploading}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                    >
                      {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                      Logo yüklə
                    </button>
                    {form.logo && (
                      <button
                        type="button"
                        onClick={() => set('logo', '')}
                        className="dash-btn-secondary"
                        style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.3)', fontSize: 13 }}
                      >
                        Logonu sil
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#8888A0', margin: 0 }}>PNG, JPG, WebP — tövsiyə olunan: 200×200px</p>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }} />
                </div>
              </div>
              <div>
                <label className="dash-label">Logo URL linki</label>
                <input
                  className="dash-input"
                  value={form.logo}
                  onChange={(e) => set('logo', e.target.value)}
                  placeholder="https://misal.com/logo.png və ya yuxarıdan fayl seçin"
                />
              </div>
            </motion.div>

            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="dash-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>Əsas Sayt Məlumatları</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="dash-label">Sayt adı *</label>
                  <input className="dash-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Saytın adı" />
                </div>
                <div>
                  <label className="dash-label">Təsvir</label>
                  <textarea className="dash-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Saytınız haqqında..." style={{ resize: 'vertical' }} />
                </div>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dash-card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>Əlaqə Məlumatları</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label className="dash-label">Telefon</label>
                  <input className="dash-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+994 50 000 00 00" />
                </div>
                <div>
                  <label className="dash-label">E-poçt</label>
                  <input className="dash-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="sayt@email.com" />
                </div>
                <div>
                  <label className="dash-label">Şəhər</label>
                  <input className="dash-input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Bakı" />
                </div>
                <div>
                  <label className="dash-label">Ünvan</label>
                  <input className="dash-input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Küçə, ev..." />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label className="dash-label">Google Maps linki</label>
                <input className="dash-input" value={form.mapUrl} onChange={(e) => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
              </div>
            </motion.div>

            <button
              onClick={save}
              disabled={saving}
              className="dash-btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 32px' }}
            >
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={16} /> : null}
              {saved ? 'Saxlandı!' : 'Sayt dəyişikliklərini saxla'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
