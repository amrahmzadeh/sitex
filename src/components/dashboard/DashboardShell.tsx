'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, LayoutDashboard, Globe, Palette, BookOpen,
  UtensilsCrossed, Image, MessageCircle, Settings,
  LogOut, ChevronRight, Menu, X, Building2,
  BarChart3, CreditCard, ExternalLink, Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Ana Səhifə' },
  { href: '/dashboard/website', icon: Globe, label: 'Veb Saytım' },
  { href: '/dashboard/theme', icon: Palette, label: 'Tema Redaktoru' },
  { href: '/dashboard/splash', icon: Sparkles, label: 'Splash Screen' },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menyu' },
  { href: '/dashboard/media', icon: Image, label: 'Media Kitabxanası' },
  { href: '/dashboard/whatsapp', icon: MessageCircle, label: 'Sifariş Ayarları' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analitika' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Abunəlik' },
  { href: '/dashboard/settings', icon: Settings, label: 'Parametrlər' },
];

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: { isPublished: boolean };
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          setOrgs(d.organizations);
          const saved = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null;
          const found = d.organizations.find((o: Organization) => o.id === saved);
          const selected = found || d.organizations[0];
          setCurrentOrg(selected);
          if (selected?.id) {
            localStorage.setItem('currentOrgId', selected.id);
          }
        } else {
          setOrgs([]);
          setCurrentOrg(null);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const switchOrg = (org: Organization) => {
    setCurrentOrg(org);
    localStorage.setItem('currentOrgId', org.id);
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2A2A3A' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: 18 }}>
          <ChefHat size={24} color="#7C5CFC" />
          MyRestoran
        </Link>
      </div>

      {/* Org Selector */}
      {currentOrg && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A3A' }}>
          <p style={{ fontSize: 11, color: '#8888A0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>İşletmə</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => switchOrg(org)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: currentOrg.id === org.id ? 'rgba(124,92,252,0.15)' : 'transparent',
                  color: currentOrg.id === org.id ? '#9B7FFF' : '#E8E8F0',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'rgba(124,92,252,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {org.logo
                    ? <img src={org.logo} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                    : <Building2 size={16} color="#7C5CFC" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{org.name}</p>
                  {org.website?.isPublished && (
                    <p style={{ fontSize: 11, color: '#34D399' }}>● Yayınlanıb</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/new-organization"
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 10px', borderRadius: 8, fontSize: 12, color: '#8888A0', textDecoration: 'none' }}
          >
            + Yeni işletmə
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
                color: active ? '#9B7FFF' : '#8888A0',
                fontWeight: active ? 600 : 400, fontSize: 14,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = '#22222E'; (e.currentTarget as HTMLElement).style.color = '#E8E8F0'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8888A0'; }}
            >
              <Icon size={18} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #2A2A3A' }}>
        {currentOrg?.website?.isPublished && (
          <a
            href={`/site/${currentOrg.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, marginBottom: 8, fontSize: 13, color: '#34D399', textDecoration: 'none', background: 'rgba(52,211,153,0.1)' }}
          >
            <ExternalLink size={14} />
            Saytı görüntülə
          </a>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C5CFC, #22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.name}</p>
            <p style={{ fontSize: 11, color: '#8888A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#8888A0', fontSize: 13, cursor: 'pointer', width: '100%' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)'; (e.currentTarget as HTMLElement).style.color = '#F87171'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8888A0'; }}
        >
          <LogOut size={16} />
          Çıxış
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0F0F14' }}>
      {/* Desktop Sidebar */}
      <aside
        className="dash-sidebar"
        style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'none' }}
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="dash-sidebar"
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, zIndex: 50, display: 'none' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 60, borderBottom: '1px solid #2A2A3A', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0 }}>
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer', padding: 4, display: 'none' }}
          >
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />
          {currentOrg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8888A0' }}>
              <Building2 size={14} />
              <span>{currentOrg.name}</span>
              {currentOrg.website?.isPublished
                ? <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', padding: '2px 8px', borderRadius: 100, fontSize: 11 }}>Yayınlanıb</span>
                : <span style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', padding: '2px 8px', borderRadius: 100, fontSize: 11 }}>Qaralama</span>}
            </div>
          )}
        </header>

        {/* Page Content */}
        <main
          className="dash-main"
          style={{ flex: 1, overflowY: 'auto', padding: 28 }}
        >
          {/* Pass current org context via a context/prop */}
          {orgs.length === 0 && pathname !== '/dashboard/new-organization' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center' }}>
              <Building2 size={48} color="#2A2A3A" />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#E8E8F0' }}>Hələ işletməniz yoxdur</h2>
              <p style={{ color: '#8888A0', maxWidth: 400 }}>İlk işletmənizi yaradın və veb saytınızı qurmağa başlayın</p>
              <Link href="/dashboard/new-organization" className="dash-btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
                İlk işletməni yarat
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
