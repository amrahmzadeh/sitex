'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2, Check, ExternalLink, Phone } from 'lucide-react';
import { formatWhatsAppUrl } from '@/lib/utils';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';

export default function WhatsAppPage() {
  const { orgId } = useCurrentOrg();
  const [form, setForm] = useState({
    countryCode: '+994',
    phoneNumber: '',
    orderMessage: 'Salam! Bu məhsulu sifariş etmək istəyirəm:\n\nMəhsul: {name}\nQiymət: {price} AZN',
    buttonText: 'WhatsApp ilə sifariş et',
    contactNumber: '',
    isEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}/whatsapp`)
      .then(r => r.json())
      .then(d => { if (d.settings) setForm({ ...form, ...d.settings }); })
      .finally(() => setLoading(false));
  }, [orgId]);

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/whatsapp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  };

  const previewUrl = form.phoneNumber
    ? formatWhatsAppUrl(form.countryCode, form.phoneNumber, 'Salam! Test mesajı.')
    : null;

  if (loading) return <div style={{ display: 'grid', gap: 16 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}</div>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageCircle size={28} color="#34D399" /> Sifariş Ayarları
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>WhatsApp üzərindən sifariş parametrləri</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Enable toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0' }}>WhatsApp sifarişi aktiv et</p>
              <p style={{ fontSize: 13, color: '#8888A0', marginTop: 2 }}>Müştərilər məhsul səhifəsindən birbaşa sifariş verə bilər</p>
            </div>
            <div
              onClick={() => set('isEnabled', !form.isEnabled)}
              style={{
                width: 48, height: 26, borderRadius: 13, background: form.isEnabled ? '#34D399' : '#2A2A3A',
                position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0,
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 3, left: form.isEnabled ? 25 : 3,
                transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </label>
        </motion.div>

        {/* Phone Numbers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="dash-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Phone size={18} color="#7C5CFC" /> Telefon Nömrəsi
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="dash-label">Ölkə kodu</label>
              <select className="dash-input" value={form.countryCode} onChange={(e) => set('countryCode', e.target.value)}>
                {['+994', '+90', '+7', '+1', '+44', '+49', '+33'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="dash-label">WhatsApp nömrəsi (sifarişlər üçün) *</label>
              <input className="dash-input" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value.replace(/\D/g, ''))} placeholder="501234567" />
            </div>
          </div>
          <div>
            <label className="dash-label">Əlaqə nömrəsi (ayrıdırsa)</label>
            <input className="dash-input" value={form.contactNumber} onChange={(e) => set('contactNumber', e.target.value)} placeholder="Boş qoyun — sifariş nömrəsi istifadə olunar" />
          </div>

          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 16px', borderRadius: 10, background: 'rgba(52,211,153,0.1)', color: '#34D399', textDecoration: 'none', fontSize: 13 }}
            >
              <ExternalLink size={14} /> Test mesajı göndər
            </a>
          )}
        </motion.div>

        {/* Messages */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="dash-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 8 }}>💬 Mesaj Şablonu</h2>
          <p style={{ fontSize: 12, color: '#8888A0', marginBottom: 16 }}>
            Dəyişənlər: <code style={{ color: '#7C5CFC' }}>{'{name}'}</code>, <code style={{ color: '#7C5CFC' }}>{'{price}'}</code>, <code style={{ color: '#7C5CFC' }}>{'{url}'}</code>
          </p>
          <div style={{ marginBottom: 16 }}>
            <label className="dash-label">Sifariş mesajı</label>
            <textarea
              className="dash-input"
              value={form.orderMessage}
              onChange={(e) => set('orderMessage', e.target.value)}
              rows={5}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <label className="dash-label">Buton mətni</label>
            <input className="dash-input" value={form.buttonText} onChange={(e) => set('buttonText', e.target.value)} placeholder="WhatsApp ilə sifariş et" />
          </div>
        </motion.div>

        <button
          onClick={save}
          disabled={saving}
          className="dash-btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 32px' }}
        >
          {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={16} /> : null}
          {saved ? 'Yadda saxlandı!' : 'Ayarları saxla'}
        </button>
      </div>
    </div>
  );
}
