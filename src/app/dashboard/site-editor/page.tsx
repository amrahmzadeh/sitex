'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { Loader2, PenLine } from 'lucide-react';

// SiteEditorShell client-side dinamik import (ağır bileşen)
const SiteEditorShell = dynamic(
  () => import('@/modules/site-editor/components/SiteEditorShell'),
  { ssr: false, loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: '#8888A0' }}>
      <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
      Redaktor yüklənir...
    </div>
  )}
);

function useCurrentOrg() {
  const [org, setOrg] = useState<{ id: string; slug: string } | null>(null);
  useEffect(() => {
    const id = localStorage.getItem('currentOrgId');
    if (!id) return;
    fetch(`/api/organizations/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.organization) {
          setOrg({ id: d.organization.id, slug: d.organization.slug });
        }
      })
      .catch(() => {});
  }, []);
  return org;
}

export default function SiteEditorPage() {
  const { status } = useSession();
  const org = useCurrentOrg();

  if (status === 'loading' || !org) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: '#8888A0' }}>
        <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
        Yüklənir...
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ textAlign: 'center', marginTop: 80, color: '#8888A0' }}>
        <PenLine size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
        <p>Sayt tapılmadı. Zəhmət olmasa bir sayt yaradın.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', margin: '-28px' }}>
      <SiteEditorShell orgId={org.id} slug={org.slug} />
    </div>
  );
}

