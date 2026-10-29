'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Globe, Phone, MapPin, Loader2, ChevronRight } from 'lucide-react';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    mapUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Müəssisə adı tələb olunur'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Müəssisə yaradılarkən xəta baş verdi');
        return;
      }
      if (data.organization?.id) {
        localStorage.setItem('currentOrgId', data.organization.id);
      }
      window.location.href = '/dashboard';
    } catch {
      setError('Şəbəkə xətası baş verdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>
          Yeni müəssisə yarat
        </h1>
        <p style={{ color: '#8888A0' }}>Müəssisənizin əsas məlumatlarını daxil edin</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[1, 2].map((s) => (
          <div
            key={s}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: step >= s ? '#00D37D' : '#383334',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="dash-card"
        style={{ padding: 32 }}
      >
        {step === 1 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color="#00D37D" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0' }}>Əsas məlumatlar</h2>
                <p style={{ fontSize: 13, color: '#8888A0' }}>Müəssisə adı və təsviri</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="dash-label">Müəssisə adı *</label>
                <input className="dash-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Məs: Ləzzət Restoranı" />
              </div>
              <div>
                <label className="dash-label">Qısa təsvir</label>
                <textarea
                  className="dash-input"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Müəssisəniz haqqında qısa məlumat..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div>
                <label className="dash-label">E-poçt</label>
                <input className="dash-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="restoran@example.com" />
              </div>
            </div>

            <button
              onClick={() => { if (!form.name.trim()) { setError('Müəssisə adı tələb olunur'); return; } setError(''); setStep(2); }}
              className="dash-btn-primary"
              style={{ width: '100%', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Növbəti <ChevronRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="#22D3EE" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0' }}>Əlaqə & Ünvan</h2>
                <p style={{ fontSize: 13, color: '#8888A0' }}>İstəyə bağlı, sonra da doldura bilərsiniz</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dash-label">Telefon</label>
                  <input className="dash-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+994 50 000 00 00" />
                </div>
                <div>
                  <label className="dash-label">Şəhər</label>
                  <input className="dash-input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Bakı" />
                </div>
              </div>
              <div>
                <label className="dash-label">Ünvan</label>
                <input className="dash-input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Küçə, ev, mənzil..." />
              </div>
              <div>
                <label className="dash-label">Google Maps linki</label>
                <input className="dash-input" value={form.mapUrl} onChange={(e) => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(1)} className="dash-btn-secondary" style={{ flex: 1 }}>
                Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="dash-btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
              >
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Müəssisəni yarat
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
