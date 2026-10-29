'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Check, Loader2 } from 'lucide-react';
import { PLATFORM_INFO } from '@/components/themes/SocialIcons';

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

const PLATFORMS_LIST = Object.entries(PLATFORM_INFO).map(([value, info]) => ({
  value,
  label: info.name,
  color: info.brandColor,
  bg: info.defaultBg,
  svg: info.svg,
}));

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
          Əlaqə bölməsində və saytın aşağı hissəsində orijinal ikonlarla görünəcək sosial media hesablarınızı əlavə edin.
        </p>
      </div>

      {/* Social Media Feed Notice */}
      <div
        style={{
          marginBottom: 24,
          padding: '14px 16px',
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.12), rgba(30, 25, 45, 0.5))',
          border: '1px solid rgba(124, 92, 252, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#A78BFA', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span>✨</span>
            <span>Canlı Sosial Media Feed Modulu Aktivdir</span>
          </div>
          <div style={{ fontSize: 12, color: '#C4C4D4', lineHeight: 1.4 }}>
            Daxil etdiyiniz sosial media səhifələrinin son paylaşımları ana səhifədə <strong>Əlaqə</strong> bölməsindən sonra canlı qrid/karuseldə nümayiş olunur.
          </div>
        </div>
        <a
          href="/dashboard/theme"
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            background: '#7C5CFC',
            color: '#FFF',
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Dizaynı Dəyiş →
        </a>
      </div>

      {/* Active Links */}
      {links.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Əlavə edilmiş ({links.length})
          </h2>
          {links.map((link, i) => {
            const p = PLATFORMS_LIST.find(x => x.value === link.platform.toLowerCase().trim());
            return (
              <motion.div
                key={link.platform}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: '#1A1A24',
                  border: `1px solid ${p?.color || '#7C5CFC'}35`,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: p?.bg || '#7C5CFC',
                    color: link.platform === 'snapchat' ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    padding: 9,
                    boxSizing: 'border-box',
                    boxShadow: `0 2px 8px ${p?.color || '#7C5CFC'}30`,
                  }}
                >
                  {p?.svg}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', marginBottom: 4 }}>
                    {p?.label || link.platform}
                  </div>
                  <input
                    className="dash-input"
                    placeholder={`https://${link.platform}.com/...`}
                    value={link.url}
                    onChange={(e) => updateUrl(link.platform, e.target.value)}
                    style={{ margin: 0, fontSize: 13, padding: '7px 10px', width: '100%' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(link.platform)}
                  title="Sil"
                  style={{
                    border: 'none', background: 'rgba(248,113,113,0.12)',
                    color: '#F87171', borderRadius: 8, width: 34, height: 34,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.25)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.12)'; }}
                >
                  <Trash2 size={15} />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
          {PLATFORMS_LIST.map(p => {
            const isAdded = links.some(l => l.platform.toLowerCase() === p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => addLink(p.value)}
                disabled={isAdded}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '12px 8px', borderRadius: 12,
                  border: `1px solid ${isAdded ? p.color + '60' : '#2A2A3A'}`,
                  background: isAdded ? p.color + '15' : '#14141E',
                  color: isAdded ? p.color : '#C4C4D4',
                  cursor: isAdded ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: isAdded ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isAdded) {
                    (e.currentTarget as HTMLElement).style.borderColor = p.color + '80';
                    (e.currentTarget as HTMLElement).style.background = p.color + '18';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdded) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2A2A3A';
                    (e.currentTarget as HTMLElement).style.background = '#14141E';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: p.bg,
                    color: p.value === 'snapchat' ? '#000' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 7,
                    boxSizing: 'border-box',
                  }}
                >
                  {p.svg}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{p.label}</span>
                {isAdded && <span style={{ fontSize: 10, color: '#34D399', fontWeight: 700 }}>✓ Əlavə edilib</span>}
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
