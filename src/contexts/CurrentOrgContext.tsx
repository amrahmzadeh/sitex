'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface OrgData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  siteCategory?: string | null;
  siteSubcategory?: string | null;
  website?: {
    isPublished: boolean;
    pagesConfig?: any;
    draftTheme?: any;
    publishedTheme?: any;
  };
  [key: string]: any;
}

interface CurrentOrgContextValue {
  /** Current org id (shortcut) */
  orgId: string | null;
  /** Full current org object */
  org: OrgData | null;
  /** All orgs the user has access to */
  orgs: OrgData[];
  /** True while the initial fetch is in progress */
  loading: boolean;
  /** Switch to a different org */
  switchOrg: (org: OrgData) => void;
  /** Force re-fetch orgs from API */
  refresh: () => void;
}

const CurrentOrgContext = createContext<CurrentOrgContextValue>({
  orgId: null,
  org: null,
  orgs: [],
  loading: true,
  switchOrg: () => {},
  refresh: () => {},
});

export function CurrentOrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<OrgData[]>([]);
  const [currentOrg, setCurrentOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(() => {
    setLoading(true);
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          setOrgs(d.organizations);
          const saved = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null;
          const found = d.organizations.find((o: OrgData) => o.id === saved);
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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  // Listen for org-updated / storage events
  useEffect(() => {
    const handle = () => fetchOrgs();
    window.addEventListener('org-updated', handle);
    window.addEventListener('storage', handle);
    return () => {
      window.removeEventListener('org-updated', handle);
      window.removeEventListener('storage', handle);
    };
  }, [fetchOrgs]);

  const switchOrg = useCallback((org: OrgData) => {
    setCurrentOrg(org);
    localStorage.setItem('currentOrgId', org.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('org-updated', { detail: { id: org.id } }));
      window.dispatchEvent(new Event('storage'));
    }
  }, []);

  return (
    <CurrentOrgContext value={{
      orgId: currentOrg?.id ?? null,
      org: currentOrg,
      orgs,
      loading,
      switchOrg,
      refresh: fetchOrgs,
    }}>
      {children}
    </CurrentOrgContext>
  );
}

/**
 * Hook to access current org context.
 * Returns { orgId, org, orgs, loading, switchOrg, refresh }
 */
export function useCurrentOrg() {
  return useContext(CurrentOrgContext);
}

