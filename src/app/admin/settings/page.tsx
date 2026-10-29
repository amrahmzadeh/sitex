'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

interface Settings {
  registration_enabled: string;
  login_enabled: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    registration_enabled: 'true',
    login_enabled: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Xəta baş verdi');
      } else {
        setMessage('Parametrlər saxlandı');
        setTimeout(() => setMessage(''), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({
    value,
    onChange,
    label,
    description,
    icon: Icon,
    onColor = '#34D399',
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    description: string;
    icon: React.FC<{ size: number; color?: string }>;
    onColor?: string;
  }) => {
    const isOn = value === 'true';
    return (
      <div className="dash-card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: isOn ? `${onColor}20` : 'rgba(136,136,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={22} color={isOn ? onColor : '#8888A0'} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 13, color: '#8888A0' }}>{description}</p>
          </div>
          <div>
            <button
              onClick={() => onChange(isOn ? 'false' : 'true')}
              style={{
                width: 52, height: 28,
                borderRadius: 14,
                border: 'none',
                background: isOn ? onColor : '#2A2A3A',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 22, height: 22,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: 3,
                left: isOn ? 27 : 3,
                transition: 'left 0.2s',
              }} />
            </button>
            <p style={{ fontSize: 11, color: isOn ? onColor : '#F87171', textAlign: 'center', marginTop: 4, fontWeight: 600 }}>
              {isOn ? 'AKTİV' : 'DEAKTİV'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0' }}>Platforma Parametrləri</h1>
          <p style={{ color: '#8888A0', fontSize: 14 }}>Qeydiyyat və giriş funksiyalarını idarə edin</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={fetchSettings} style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Yenilə
        </button>
      </div>

      {message && (
        <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 16px', color: '#34D399', fontSize: 14, marginBottom: 20 }}>
          ✓ {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 16px', color: '#F87171', fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div>
          <div className="skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        </div>
      ) : (
        <>
          <Toggle
            value={settings.registration_enabled}
            onChange={v => setSettings(s => ({ ...s, registration_enabled: v }))}
            label="Yeni İstifadəçi Qeydiyyatı"
            description="Deaktiv etdikdə yeni istifadəçilər qeydiyyatdan keçə bilməyəcək. Mövcud hesablara təsir etmir."
            icon={UserPlus}
            onColor="#34D399"
          />

          <Toggle
            value={settings.login_enabled}
            onChange={v => setSettings(s => ({ ...s, login_enabled: v }))}
            label="İstifadəçi Girişi"
            description="Deaktiv etdikdə adi istifadəçilər sistemə girə bilməyəcək. Super Admin girişi həmişə aktiv qalır."
            icon={LogIn}
            onColor="#7C5CFC"
          />

          <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldCheck size={18} color="#F87171" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 13, color: '#F87171', fontWeight: 600, marginBottom: 4 }}>Super Admin Qoruması</p>
                <p style={{ fontSize: 12, color: '#8888A0', lineHeight: 1.5 }}>
                  Girişi deaktiv etdiyiniz halda Super Admin hesabınız həmişə aktiv qalır.
                  Adi istifadəçilərin girişini bloklamaq Super Admin panelinə girişə mane olmur.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="dash-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}
          >
            <Save size={16} />
            {saving ? 'Saxlanılır...' : 'Dəyişiklikləri Saxla'}
          </button>
        </>
      )}
    </div>
  );
}

