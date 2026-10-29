'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Shield, Users, Globe, Settings, FileText,
  LayoutDashboard, LogOut, ChevronRight, Menu, X,
  ChefHat,
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'İcmal' },
  { href: '/admin/users', icon: Users, label: 'İstifadəçilər' },
  { href: '/admin/sites', icon: Globe, label: 'Saytlar' },
  { href: '/admin/settings', icon: Settings, label: 'Platforma Parametrləri' },
  { href: '/admin/audit', icon: FileText, label: 'Audit Jurnalı' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #2A2A3A' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: 18 }}>
          <Shield size={24} color="#F87171" />
          Super Admin
        </Link>
        <p style={{ fontSize: 11, color: '#8888A0', marginTop: 4 }}>İdarəetmə Paneli</p>
      </div>

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
                background: active ? 'rgba(248,113,113,0.15)' : 'transparent',
                color: active ? '#F87171' : '#8888A0',
                fontWeight: active ? 600 : 400, fontSize: 14,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={18} />
              {label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </Link>
          );
        })}

        <div style={{ borderTop: '1px solid #2A2A3A', marginTop: 12, paddingTop: 12 }}>
          <Link
            href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: '#8888A0', fontSize: 14 }}
          >
            <ChefHat size={18} />
            Dashboard
          </Link>
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #2A2A3A' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F87171, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {session?.user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0' }}>{session?.user?.name}</p>
            <p style={{ fontSize: 11, color: '#F87171' }}>Super Admin</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#8888A0', fontSize: 13, cursor: 'pointer', width: '100%' }}
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
      <aside className="dash-sidebar" style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', borderRight: '1px solid rgba(248,113,113,0.2)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
        />
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: 60, borderBottom: '1px solid #2A2A3A', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0, background: '#0F0F14' }}>
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer', padding: 4 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#F87171" />
            <span style={{ fontSize: 13, color: '#F87171', fontWeight: 600 }}>Super Admin Paneli</span>
          </div>
        </header>

        <main className="dash-main" style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

