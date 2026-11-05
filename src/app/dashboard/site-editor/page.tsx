'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Loader2, PenLine } from 'lucide-react';

const SiteEditorShell = dynamic(
  () => import('@/modules/site-editor/components/SiteEditorShell'),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, gap: 12, color: '#8888A0' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        Redaktor yüklənir...
      </div>
    ),
  }
);

function useCurrentOrg() {
  const [org, setOrg] = useState<{ id: string; slug: string } | null>(null);

  const loadOrg = useCallback((targetId?: string | null) => {
    const id = targetId || (typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null);
    if (!id) {
      fetch('/api/organizations')
        .then((r) => r.json())
        .then((d) => {
          if (d.organizations?.length) {
            const first = d.organizations[0];
            setOrg({ id: first.id, slug: first.slug });
            localStorage.setItem('currentOrgId', first.id);
          }
        })
        .catch(() => {});
      return;
    }
    fetch(`/api/organizations/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.organization) {
          setOrg({ id: d.organization.id, slug: d.organization.slug });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadOrg();
    const handleOrgChange = (e?: any) => {
      loadOrg(e?.detail?.id);
    };
    window.addEventListener('org-updated', handleOrgChange);
    window.addEventListener('storage', handleOrgChange);
    return () => {
      window.removeEventListener('org-updated', handleOrgChange);
      window.removeEventListener('storage', handleOrgChange);
    };
  }, [loadOrg]);

  return org;
}

export default function SiteEditorPage() {
  const { status } = useSession();
  const org = useCurrentOrg();

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, gap: 12, color: '#8888A0' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        Yüklənir...
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8888A0' }}>
        <PenLine size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
        <p>Sayt tapılmadı. Zəhmət olmasa bir sayt yaradın.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SiteEditorShell key={org.id} orgId={org.id} slug={org.slug} />
    </div>
  );
}
