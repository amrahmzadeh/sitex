'use client';

import { useSession } from 'next-auth/react';
import { Loader2, PenLine } from 'lucide-react';
import SiteEditorShell from '@/modules/site-editor/components/SiteEditorShell';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';

export default function SiteEditorPage() {
  const { status } = useSession();
  const { org } = useCurrentOrg();

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
