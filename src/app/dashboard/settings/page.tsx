'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Loader2, Check, Upload } from 'lucide-react';
import { useRef } from 'react';

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
  const orgId = useCurrentOrg();
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '', city: '', mapUrl: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}`).then(r => r.json()).then(d => {
      if (d.organization) setForm({ name: d.organization.name, description: d.organization.description || '', phone: d.organization.phone || '', email: d.organization.email || '', address: d.organization.address || '', city: d.organization.city || '', mapUrl: d.organization.mapUrl || '', logo: d.organization.logo || '' });
    }).finally(() => setLoading(false));
  }, [orgId]);

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

  if (loading) return <div style={{ display: 'grid', gap: 16 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}</div>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Settings size={28} color="#7C5CFC" /> Parametrlər
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>İşletmə məlumatlarını idarə edin</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>Logo</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
            <div style={{ width: 80, height: 80, borderRadius: 16, background: '#2A2A3A', overflow: 'hidden', flexShrink: 0, border: '1px solid #3A3A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {form.logo ? (
                <img src={form.logo} alt="logo" style={{ width: 80, height: 80, objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
              ) : (
                <div style={{ fontSize: 28, fontWeight: 800, color: '#7C5CFC' }}>{form.name?.[0] || '?'}</div>
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
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>Əsas Məlumatlar</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="dash-label">İşletmə adı *</label>
              <input className="dash-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Restoranın adı" />
            </div>
            <div>
              <label className="dash-label">Təsvir</label>
              <textarea className="dash-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="İşletməniz haqqında..." style={{ resize: 'vertical' }} />
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
              <input className="dash-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="restoran@email.com" />
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
          {saved ? 'Saxlandı!' : 'Dəyişiklikləri saxla'}
        </button>
      </div>
    </div>
  );
}
