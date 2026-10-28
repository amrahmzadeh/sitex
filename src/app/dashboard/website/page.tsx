'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, Check, Loader2, Eye } from 'lucide-react';

function useCurrentOrg() {
  const [data, setData] = useState<{ orgId: string | null; slug: string; isPublished: boolean }>({ orgId: null, slug: '', isPublished: false });
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    const fetchOrg = (id: string) => {
      fetch(`/api/organizations/${id}`).then(r => r.json()).then(d => {
        setData({ orgId: id, slug: d.organization?.slug || '', isPublished: d.organization?.website?.isPublished || false });
      });
    };
    if (saved) { fetchOrg(saved); return; }
    fetch('/api/organizations').then(r => r.json()).then(d => {
      if (d.organizations?.[0]) { localStorage.setItem('currentOrgId', d.organizations[0].id); fetchOrg(d.organizations[0].id); }
    });
  }, []);
  return data;
}

export default function WebsitePage() {
  const { orgId, slug, isPublished } = useCurrentOrg();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const publish = async () => {
    if (!orgId) return;
    setPublishing(true);
    try {
      await fetch(`/api/organizations/${orgId}/publish`, { method: 'POST' });
      setPublished(true);
      setTimeout(() => setPublished(false), 4000);
    } finally { setPublishing(false); }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Globe size={28} color="#7C5CFC" /> Veb Saytım
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>Saytınızın yayın vəziyyəti</p>
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: isPublished ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={28} color={isPublished ? '#34D399' : '#FBBF24'} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>
                {isPublished ? '● Sayt Yayınlanıb' : '○ Sayt Qaralamada'}
              </p>
              {slug && (
                <p style={{ fontSize: 13, color: '#8888A0', marginTop: 4 }}>
                  Ünvan: <code style={{ color: '#7C5CFC' }}>/site/{slug}</code>
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {isPublished && slug && (
                <a
                  href={`/site/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dash-btn-secondary"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                >
                  <Eye size={14} /> Görüntülə
                </a>
              )}
              <button
                onClick={publish}
                disabled={publishing}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
              >
                {publishing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : published ? <Check size={14} /> : <Globe size={14} />}
                {published ? 'Yayınlandı!' : isPublished ? 'Yenidən yayınla' : 'Yayınla'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { title: 'Tema redaktoru', desc: 'Rənglər, fontlar, dizayn', href: '/dashboard/theme', color: '#7C5CFC' },
            { title: 'Splash Screen', desc: 'Video və animasiya ekranı', href: '/dashboard/splash', color: '#EC4899' },
            { title: 'Menyu idarəetməsi', desc: 'Kateqoriyalar və yeməklər', href: '/dashboard/menu', color: '#22D3EE' },
            { title: 'Sifariş ayarları', desc: 'WhatsApp parametrləri', href: '/dashboard/whatsapp', color: '#34D399' },
          ].map(({ title, desc, href, color }) => (
            <motion.a
              key={href}
              href={href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="dash-card"
              style={{ padding: 20, textDecoration: 'none', display: 'block' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2A2A3A'; }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#8888A0' }}>{desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
