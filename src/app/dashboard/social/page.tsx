'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Check, Loader2, GripVertical, Instagram, Facebook, Youtube, Twitter, Music2, Link2 } from 'lucide-react';

function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) { setOrgId(saved); return; }
    fetch('/api/organizations').then(r => r.json()).then(d => {
      if (d.organizations?.[0]) {
        setOrgId(d.organizations[0].id);
        localStorage.setItem('currentOrgId', d.organizations[0].id);
      }
    });
  }, []);
  return orgId;
}

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', color: '#E1306C', icon: '📷' },
  { value: 'facebook', label: 'Facebook', color: '#1877F2', icon: '📘' },
  { value: 'tiktok', label: 'TikTok', color: '#000000', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', color: '#FF0000', icon: '▶️' },
  { value: 'twitter', label: 'Twitter / X', color: '#1DA1F2', icon: '🐦' },
  { value: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: '💬' },
  { value: 'telegram', label: 'Telegram', color: '#0088cc', icon: '✈️' },
  { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  { value: 'pinterest', label: 'Pinterest', color: '#E60023', icon: '📌' },
  { value: 'snapchat', label: 'Snapchat', color: '#FFFC00', icon: '👻' },
];

interface SocialLink {
  platform: string;
  url: string;
}

export default function SocialPage() {
  const orgId = useCurrentOrg();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}/social`)
      .then(r => r.json())
      .then(d => setLinks(d.links || []))
      .finally(() => setLoading(false));
  }, [orgId]);

  const save = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      await fetch(`/api/organizations/${orgId}/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const addLink = (platform: string) => {
    if (links.find(l => l.platform === platform)) return;
    setLinks(prev => [...prev, { platform, url: '' }]);
  };

  const removeLink = (platform: string) => {
    setLinks(prev => prev.filter(l => l.platform !== platform));
  };

  const updateUrl = (platform: string, url: string) => {
    setLinks(prev => prev.map(l => l.platform === platform ? { ...l, url } : l));
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>
          Sosial Media Linklər
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14 }}>
          Əlaqə bölməsində görünəcək sosial media hesablarınızı əlavə edin.
        </p>
      </div>

      {/* Active Links */}
      {links.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Əlavə edilmiş ({links.length})
          </h2>
          {links.map((link, i) => {
            const p = PLATFORMS.find(x => x.value === link.platform);
            return (
              <motion.div
                key={link.platform}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  background: '#1A1A24',
                  border: `1px solid ${p?.color || '#7C5CFC'}30`,
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{p?.icon || '🔗'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: p?.color || '#7C5CFC', marginBottom: 4 }}>
                    {p?.label || link.platform}
                  </div>
                  <input
                    className="dash-input"
                    placeholder={`https://...`}
                    value={link.url}
                    onChange={(e) => updateUrl(link.platform, e.target.value)}
                    style={{ margin: 0, fontSize: 13, padding: '6px 10px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(link.platform)}
                  style={{
                    border: 'none', background: 'rgba(248,113,113,0.12)',
                    color: '#F87171', borderRadius: 8, width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Platforms */}
      <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', marginBottom: 14 }}>
          Platform Seçin
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {PLATFORMS.map(p => {
            const isAdded = links.some(l => l.platform === p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => addLink(p.value)}
                disabled={isAdded}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 8px', borderRadius: 10,
                  border: `1px solid ${isAdded ? p.color + '60' : '#2A2A3A'}`,
                  background: isAdded ? p.color + '15' : 'transparent',
                  color: isAdded ? p.color : '#8888A0',
                  cursor: isAdded ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: isAdded ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isAdded) {
                    (e.currentTarget as HTMLElement).style.borderColor = p.color + '60';
                    (e.currentTarget as HTMLElement).style.background = p.color + '10';
                    (e.currentTarget as HTMLElement).style.color = p.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdded) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2A2A3A';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#8888A0';
                  }
                }}
              >
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{p.label}</span>
                {isAdded && <span style={{ fontSize: 10, opacity: 0.8 }}>✓ Əlavə edilib</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="dash-btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}
      >
        {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={16} /> : <Save size={16} />}
        {saved ? 'Saxlandı!' : saving ? 'Saxlanılır...' : 'Yadda saxla'}
      </button>
    </div>
  );
}
