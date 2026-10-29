'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed, Globe, Eye, Plus, ArrowRight,
  TrendingUp, Clock, CheckCircle2, AlertCircle, Share2,
} from 'lucide-react';

interface OrgData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: { isPublished: boolean; publishedAt?: string };
  menuItemCount: number;
  categoryCount: number;
  role: string;
}

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<OrgData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => setOrgs(d.organizations || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (orgs.length === 0) {
    return null; // DashboardShell handles empty state
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>
          Xoş gəldiniz! 👋
        </h1>
        <p style={{ color: '#8888A0', fontSize: 15 }}>
          İşletmələrinizin ümumi vəziyyətinə baxın
        </p>
      </div>

      {/* Org Cards */}
      <div style={{ display: 'grid', gap: 20, marginBottom: 40 }}>
        {orgs.map((org, i) => (
          <motion.div
            key={org.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="dash-card"
            style={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {org.logo
                      ? <img src={org.logo} alt={org.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
                      : <span style={{ fontSize: 20, fontWeight: 800, color: '#7C5CFC' }}>{org.name[0]}</span>}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>{org.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#8888A0' }}>/{org.slug}</span>
                      {org.website?.isPublished
                        ? <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', padding: '1px 8px', borderRadius: 100, fontSize: 11 }}>● Yayınlanıb</span>
                        : <span style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', padding: '1px 8px', borderRadius: 100, fontSize: 11 }}>Qaralama</span>}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#7C5CFC' }}>{org.menuItemCount}</p>
                    <p style={{ fontSize: 12, color: '#8888A0' }}>Yemək</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#22D3EE' }}>{org.categoryCount}</p>
                    <p style={{ fontSize: 12, color: '#8888A0' }}>Kateqoriya</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#34D399' }}>
                      {org.website?.isPublished ? '✓' : '—'}
                    </p>
                    <p style={{ fontSize: 12, color: '#8888A0' }}>Yayın</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                <Link
                  href={`/dashboard/menu`}
                  className="dash-btn-primary"
                  style={{ textDecoration: 'none', textAlign: 'center', fontSize: 13 }}
                >
                  <UtensilsCrossed size={14} style={{ marginRight: 6 }} />
                  Menyunu idarə et
                </Link>
                <Link
                  href="/dashboard/theme"
                  className="dash-btn-secondary"
                  style={{ textDecoration: 'none', textAlign: 'center', fontSize: 13 }}
                >
                  <Globe size={14} style={{ marginRight: 6 }} />
                  Saytı düzəlt
                </Link>
                {org.website?.isPublished && (
                  <a
                    href={`/site/${org.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, fontSize: 13, color: '#34D399', textDecoration: 'none', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
                  >
                    <Eye size={14} />
                    Sayta bax
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8F0', marginBottom: 16 }}>
          Sürətli əməliyyatlar
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { href: '/dashboard/menu', icon: Plus, label: 'Yemək əlavə et', color: '#7C5CFC' },
            { href: '/dashboard/theme', icon: Globe, label: 'Tema dəyiş', color: '#22D3EE' },
            { href: '/dashboard/social', icon: Share2, label: 'Sosial Media', color: '#E1306C' },
            { href: '/dashboard/whatsapp', icon: ArrowRight, label: 'WhatsApp qur', color: '#34D399' },
            { href: '/dashboard/new-organization', icon: Plus, label: 'İşletmə yarat', color: '#FBBF24' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link
              key={href}
              href={href}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: '1px solid #2A2A3A', background: '#1A1A24', textDecoration: 'none', color: '#E8E8F0', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2A2A3A'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
