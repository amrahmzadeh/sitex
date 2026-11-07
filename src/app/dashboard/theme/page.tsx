'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Save,
  Globe,
  Eye,
  Check,
  Palette,
  MessageCircle,
  Layers,
  Monitor,
  Smartphone,
  Sparkles,
  Clock,
  Utensils,
  BookOpen,
  FileText,
  Share2,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Code,
  History,
  Plus,
  Download,
  Upload,
  Copy,
  Settings as SettingsIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { defaultThemes, ThemeConfig, BRAND_FONTS } from '@/lib/themes';
import RestaurantSite, { SiteData, GalleryItem, MenuCategory } from '@/components/themes/RestaurantSite';
import ThemeLibrary from '@/components/dashboard/ThemeLibrary';
import {
  ThemeEditorTab,
  ViewportMode,
  ComponentTarget,
  ThemeVersionRecord,
  STLCodeEditor,
  VisualThemeBuilder,
  LivePreviewEngine,
  ThemeAssetsManager,
  ThemeVersionHistory,
  ThemeManagementModal,
  ThemeSettingsPanel,
} from '@/components/dashboard/theme-editor';
import { themeConfigToSTL, convertSTLToThemeConfig } from '@/modules/stl';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';
import dynamic from 'next/dynamic';

const ThemeCustomizerTab = dynamic(() => import('@/components/dashboard/theme-editor/ThemeCustomizerTab'), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: '#8888A0' }}>Yüklənir...</div>,
});


export default function ThemePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const isSuperAdmin = (session?.user as { role?: string })?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (sessionStatus !== 'loading' && !isSuperAdmin) {
      router.replace('/dashboard');
    }
  }, [sessionStatus, isSuperAdmin, router]);

  const { orgId } = useCurrentOrg();
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemes.elegant);
  const [stlCode, setStlCode] = useState<string>(() => themeConfigToSTL(defaultThemes.elegant));
  const [activeTab, setActiveTab] = useState<ThemeEditorTab | 'customizer'>('builder');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentTarget>('all');
  const [modalType, setModalType] = useState<'create' | 'duplicate' | 'rename' | 'import' | 'export' | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<ThemeConfig[]>([defaultThemes.elegant]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  // Versions history
  const [versions, setVersions] = useState<ThemeVersionRecord[]>([]);

  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgName, setOrgName] = useState('');
  // B04 fix: narrow orgData type (Prisma Organization shape, partial)
  type OrgData = {
    name?: string; slug?: string; logo?: string; description?: string;
    phone?: string; email?: string; address?: string; city?: string;
    mapUrl?: string; currency?: string; siteCategory?: string; siteSubcategory?: string;
    website?: { draftTheme?: Partial<ThemeConfig>; pagesConfig?: unknown; theme?: unknown };
    whatsappSettings?: { countryCode: string; phoneNumber: string; orderMessage: string; buttonText: string; isEnabled: boolean };
    socialLinks?: Array<{ platform: string; url: string }>;
    workingHours?: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>;
    galleryItems?: GalleryItem[]; menuCategories?: MenuCategory[];
  };
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    fetch(`/api/organizations/${orgId}`)
      .then(r => r.json())
      .then(d => {
        if (d.organization) {
          setOrgData(d.organization);
          if (d.organization.website?.draftTheme) {
            const dt = d.organization.website.draftTheme as Partial<ThemeConfig>;
            const loadedTheme: ThemeConfig = {
              ...defaultThemes.elegant,
              ...dt,
              isProTemplate: Boolean(dt.isProTemplate),
            };
            setTheme(loadedTheme);
            setStlCode(themeConfigToSTL(loadedTheme));
            setHistory([loadedTheme]);
            setHistoryIdx(0);
          }
          setSlug(d.organization.slug || '');
          setOrgLogo(d.organization.logo || '');
          setOrgName(d.organization.name || '');
        }
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  // B23 fix: warn user about unsaved changes on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (historyIdx > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [historyIdx]);

  // Load versions from localStorage
  useEffect(() => {
    if (!orgId) return;
    const key = `sitex_theme_versions_${orgId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: initial version load from localStorage
        setVersions(JSON.parse(stored));
      } catch {
        setVersions([]);
      }
    } else {
      const now = Date.now();
      const initialVer: ThemeVersionRecord = {
        id: 'ver_init_' + now,
        version: '1.0',
        title: 'İlkin Tema Versiyası',
        timestamp: now,
        author: 'SiteX Sistemi',
        trigger: 'auto',
        theme: defaultThemes.elegant,
        stlCode: themeConfigToSTL(defaultThemes.elegant),
      };
      setVersions([initialVer]);
      localStorage.setItem(key, JSON.stringify([initialVer]));
    }
  }, [orgId]);

  const pushThemeChange = (newTheme: ThemeConfig) => {
    const nextHist = history.slice(0, historyIdx + 1);
    nextHist.push(newTheme);
    if (nextHist.length > 50) nextHist.shift();
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
    setTheme(newTheme);
    setStlCode(themeConfigToSTL(newTheme));
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      setTheme(prev);
      setStlCode(themeConfigToSTL(prev));
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      setTheme(next);
      setStlCode(themeConfigToSTL(next));
    }
  };

  const recordVersion = (
    title: string,
    note?: string,
    trigger: ThemeVersionRecord['trigger'] = 'manual',
    customTheme?: ThemeConfig
  ) => {
    const t = customTheme || theme;
    const currentList = versions;
    // eslint-disable-next-line react-hooks/purity -- Date.now() is in an event callback, not in render
    const now = Date.now();
    const newVer: ThemeVersionRecord = {
      id: 'ver_' + now,
      version: `${currentList.length + 1}.0`,
      title,
      note,
      timestamp: now,
      author: orgName || 'SiteX User',
      trigger,
      theme: t,
      stlCode: themeConfigToSTL(t),
    };
    const updated = [newVer, ...currentList].slice(0, 30);
    setVersions(updated);
    if (orgId) {
      localStorage.setItem(`sitex_theme_versions_${orgId}`, JSON.stringify(updated));
    }
  };

  const saveDraft = async (): Promise<boolean> => {
    if (!orgId) return false;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `Saxlama xətası (${res.status})`);
        return false;
      }
      setSaved(true);
      recordVersion('Qaralama Saxlandı', 'İstifadəçi tərəfindən saxlanıldı', 'manual');
      setTimeout(() => setSaved(false), 3000);
      return true;
    } catch {
      setSaveError('Şəbəkə xətası baş verdi');
      return false;
    } finally { setSaving(false); }
  };

  const publish = async () => {
    if (!orgId) return;
    setPublishing(true);
    setSaveError(null);
    try {
      const ok = await saveDraft();
      if (!ok) return; // B03 fix: abort publish if save failed
      const res = await fetch(`/api/organizations/${orgId}/publish`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `Yayınlama xətası (${res.status})`);
        return;
      }
      setPublished(true);
      recordVersion('Saytda Yayınlandı', 'Canlı saytda aktiv edildi', 'publish');
      setTimeout(() => setPublished(false), 3000);
    } catch {
      setSaveError('Şəbəkə xətası baş verdi');
    } finally { setPublishing(false); }
  };

  const applyTheme = async (t: ThemeConfig) => {
    const nextTheme: ThemeConfig = {
      ...(defaultThemes[t.id] || t),
      ...t,
      isProTemplate: Boolean(t.isProTemplate),
    };
    pushThemeChange(nextTheme);
    setPreviewTheme(null);

    if (orgId) {
      setSaving(true);
      try {
        await fetch(`/api/organizations/${orgId}/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: nextTheme }),
        });
        recordVersion(`"${t.name}" Teması Tətbiq Edildi`, 'Kitabxanadan seçildi', 'manual', nextTheme);
        setToastMessage(`"${t.name}" teması uğurla tətbiq edildi!`);
        setTimeout(() => setToastMessage(null), 3500);
      } catch (err) {
        console.error('Tema tətbiq olunarkən xəta:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreateTheme = (name: string, description: string, baseId?: string) => {
    const base = (baseId && defaultThemes[baseId]) ? defaultThemes[baseId] : defaultThemes.modern;
    // eslint-disable-next-line react-hooks/purity -- Date.now() used in event handler, not render path
    const newId = 'custom-' + Date.now();
    const created: ThemeConfig = {
      ...base,
      id: newId,
      name,
      description,
    };
    pushThemeChange(created);
    recordVersion(`Yeni Tema: "${name}"`, description, 'manual', created);
    setToastMessage(`"${name}" adlı yeni tema yaradıldı və tətbiq edildi!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDuplicateTheme = (name: string) => {
    // eslint-disable-next-line react-hooks/purity -- Date.now() used in event handler, not render path
    const newId = 'copy-' + Date.now();
    const duplicated: ThemeConfig = {
      ...theme,
      id: newId,
      name,
    };
    pushThemeChange(duplicated);
    recordVersion(`Kopya: "${name}"`, 'Əvvəlki temadan kopyalandı', 'manual', duplicated);
    setToastMessage(`"${name}" nüsxəsi yaradıldı!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRenameTheme = (newName: string) => {
    const updated: ThemeConfig = {
      ...theme,
      name: newName,
    };
    pushThemeChange(updated);
    setToastMessage(`Tema adı "${newName}" olaraq dəyişdirildi!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleImportTheme = (imported: ThemeConfig, importedStl?: string) => {
    pushThemeChange(imported);
    if (importedStl) setStlCode(importedStl);
    recordVersion(`İdxal: "${imported.name || 'İdxal edilmiş tema'}"`, 'Fayldan daxil edildi', 'import', imported);
    setToastMessage(`"${imported.name || 'Tema'}" uğurla idxal edildi!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetDefault = () => {
    const resetTheme = defaultThemes.elegant;
    pushThemeChange(resetTheme);
    recordVersion('Standart Temaya Sıfırlama', 'İlkin parametrlərə qaytarıldı', 'manual', resetTheme);
    setToastMessage('Tema standart ayarlara sıfırlandı!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRestoreVersion = (ver: ThemeVersionRecord) => {
    pushThemeChange(ver.theme);
    if (ver.stlCode) setStlCode(ver.stlCode);
    setToastMessage(`v${ver.version} ("${ver.title}") uğurla bərpa edildi!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const effectiveTheme = previewTheme || theme;
  const isProActive = Boolean(effectiveTheme.isProTemplate);

  const previewSiteData = useMemo<SiteData>(() => {
    const rawCategories = orgData?.menuCategories || [];
    const validCategories = rawCategories.filter((c) => Array.isArray(c.menuItems) && c.menuItems.length > 0);

    const categories = validCategories.length > 0 ? validCategories : [
      {
        id: 'cat-1',
        name: 'Aş Çeşidləri',
        slug: 'as-cesidleri',
        isVisible: true,
        menuItems: [
          {
            id: 'item-1',
            name: 'Toyuq Plov (kiçik)',
            slug: 'toyuq-plov-kicik',
            description: 'Zəfəranlı uzun düyü, zərif bişmiş toyuq əti, təbii kərə yağı ilə doyumlu kiçik porsiya.',
            price: 2.80,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
            isFeatured: true,
            isNew: false,
            isPopular: true,
            portionSize: 'Kiçik porsiya',
          },
          {
            id: 'item-2',
            name: 'Toyuq Plov (böyük)',
            slug: 'toyuq-plov-boyuk',
            description: 'Bol toyuq tikələri və ətirli plov ilə zənginləşdirilmiş doyurucu böyük porsiya.',
            price: 4.20,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            video: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-dish-with-rice-and-chicken-42861-large.mp4',
            isFeatured: true,
            isNew: false,
            isPopular: true,
            portionSize: 'Böyük porsiya',
          },
        ],
      },
      {
        id: 'cat-2',
        name: 'Qulyaşlar',
        slug: 'qulyaslar',
        isVisible: true,
        menuItems: [
          {
            id: 'item-3',
            name: 'Ətli Qulyaş',
            slug: 'etli-qulyas',
            description: 'Yumşaq mal əti, qatı ətirli sous və istəyə uyğun qarnir.',
            price: 3.80,
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
            isNew: true,
            isPopular: false,
            portionSize: 'Klassik',
          },
          {
            id: 'item-4',
            name: 'Toyuqlu Qulyaş',
            slug: 'toyuqlu-qulyas',
            description: 'Zərif toyuq filesi, şirin bibər və xüsusi tomat sousu ilə ləzzətli seçim.',
            price: 3.20,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
            isFeatured: false,
            isNew: false,
            isPopular: true,
            portionSize: 'Yüngül & Dadlı',
          },
        ],
      },
    ];

    return {
      organization: {
        name: orgName || orgData?.name || 'Restoran',
        slug: slug || orgData?.slug || 'restoran',
        logo: orgLogo || orgData?.logo || undefined,
        description: orgData?.description || 'Ənənəvi dad və keyfiyyəti bir araya gətirən məkan.',
        phone: orgData?.phone || '+994 55 366 77 07',
        email: orgData?.email || '',
        address: orgData?.address || 'Bakı, Azərbaycan',
        city: orgData?.city || 'Bakı',
        mapUrl: orgData?.mapUrl || '',
        currency: orgData?.currency || 'AZN',
        siteCategory: orgData?.siteCategory,
        siteSubcategory: orgData?.siteSubcategory,
      },
      website: {
        theme: {
          ...effectiveTheme,
          isProTemplate: isProActive,
        },
        draftTheme: effectiveTheme,
        pagesConfig: orgData?.website?.pagesConfig,
        seoTitle: orgName,
        seoDescription: orgData?.description,
      },
      whatsapp: orgData?.whatsappSettings || {
        countryCode: '994',
        phoneNumber: orgData?.phone || '553667707',
        orderMessage: 'Salam! Sifariş vermək istəyirəm: {name} - {price} AZN',
        buttonText: 'WhatsApp Sifariş',
        isEnabled: true,
      },
      socialLinks: orgData?.socialLinks?.length
        ? orgData.socialLinks
        : [
            { platform: 'instagram', url: 'https://instagram.com' },
            { platform: 'facebook', url: 'https://facebook.com' },
            { platform: 'whatsapp', url: 'https://wa.me' },
          ],
      workingHours: orgData?.workingHours && orgData.workingHours.length > 0 ? orgData.workingHours : [
        { dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 2, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 3, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 4, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 5, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 6, openTime: '09:00', closeTime: '22:00', isClosed: false },
        { dayOfWeek: 0, openTime: '', closeTime: '', isClosed: true },
      ],
      menuCategories: categories,
      galleryItems: orgData?.galleryItems || [],
    };
  }, [orgData, orgName, slug, orgLogo, effectiveTheme, isProActive]);

  if (sessionStatus === 'loading' || loading) {
    return <div style={{ display: 'grid', gap: 16 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}</div>;
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bebas+Neue&family=Cinzel:wght@600;700;900&family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Dancing+Script:wght@700&family=DM+Serif+Display:ital@0;1&family=Great+Vibes&family=Kaushan+Script&family=Lobster&family=Marcellus&family=Montserrat:wght@700;800&family=Oswald:wght@600&family=Outfit:wght@700;800&family=Pacifico&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Prata&family=Righteous&family=Satisfy&display=swap"
      />
      <style>{`
        @media (max-width: 1080px) {
          .theme-workspace-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: unset !important;
          }
        }
        .sitex-preview-canvas header,
        .sitex-preview-canvas [data-theme-header] {
          position: relative !important;
          top: 0 !important;
          left: auto !important;
          right: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          z-index: 10 !important;
        }
        .sitex-preview-canvas {
          contain: layout paint;
          transform: translateZ(0);
        }
        .sitex-preview-canvas .restaurant-site-container,
        .sitex-preview-canvas .pro-restaurant-site,
        .sitex-preview-canvas .speech-academy-root {
          overflow-x: clip !important;
          position: relative !important;
          width: 100% !important;
          max-width: 100% !important;
        }
      `}</style>

      {/* Top Header & Tab Navigation */}
      <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Palette size={24} color="#00D37D" />
                Tema Redaktoru
              </h1>
              <span
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'rgba(0,211,125,0.15)',
                  color: '#00D37D',
                  fontWeight: 600,
                  border: '1px solid rgba(0,211,125,0.3)',
                }}
              >
                {theme.name || 'SiteX Tema'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#8888A0', margin: '4px 0 0' }}>
              Wix və Webflow səviyyəsində vizual redaktor, STL proqramlaşdırma dili və canlı önizləmə sistemi.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => setModalType('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #3A3A4E',
                background: '#1F2230',
                color: '#E0E2EC',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={13} color="#00D37D" />
              Yeni Tema
            </button>

            <button
              type="button"
              onClick={() => setModalType('duplicate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #3A3A4E',
                background: '#1F2230',
                color: '#E0E2EC',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Copy size={13} color="#7C5CFC" />
              Kopyala
            </button>

            <button
              type="button"
              onClick={() => setModalType('import')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #3A3A4E',
                background: '#1F2230',
                color: '#E0E2EC',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Upload size={13} color="#38BDF8" />
              İdxal Et
            </button>

            <button
              type="button"
              onClick={() => setModalType('export')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid #3A3A4E',
                background: '#1F2230',
                color: '#E0E2EC',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={13} color="#F59E0B" />
              İxrac Et
            </button>

            {slug && (
              <a
                href={`/site/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #3A3A4E',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#B0B0C0',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} />
                Saytı aç
              </a>
            )}

            <button
              onClick={saveDraft}
              disabled={saving}
              className="dash-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px' }}
            >
              {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={13} color="#34D399" /> : <Save size={13} />}
              {saved ? 'Saxlandı' : 'Qaralama saxla'}
            </button>

            <button
              onClick={publish}
              disabled={publishing}
              className="dash-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 16px' }}
            >
              {publishing ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : published ? <Check size={13} /> : <Globe size={13} />}
              {published ? 'Yayınlandı!' : 'Yayınla'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #2A2A3A', paddingBottom: 10, overflowX: 'auto' }}>
          {[
            { id: 'builder', label: 'Vizual Redaktor', icon: Palette, color: '#00D37D' },
            { id: 'code', label: 'STL Kod Redaktoru', icon: Code, color: '#7C5CFC' },
            { id: 'library', label: 'Tema Kitabxanası', icon: Sparkles, color: '#38BDF8' },
            { id: 'assets', label: 'Aktivlər & Şəkillər', icon: ImageIcon, color: '#F59E0B' },
            { id: 'versions', label: 'Versiya Tarixçəsi', icon: History, color: '#EC4899' },
            { id: 'settings', label: 'Parametrlər', icon: SettingsIcon, color: '#94A3B8' },
            { id: 'customizer', label: 'Qabaqcıl Detallar', icon: Sliders, color: '#C4B5FD' },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                type="button"
                onClick={() => setActiveTab(tabItem.id as ThemeEditorTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: isActive ? `1px solid ${tabItem.color}` : '1px solid transparent',
                  background: isActive ? `${tabItem.color}18` : 'transparent',
                  color: isActive ? tabItem.color : '#8888A0',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                {tabItem.label}
              </button>
            );
          })}
        </div>

        {/* Uğur Bildirişi Toast */}
        {toastMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 10,
              background: 'rgba(0, 211, 125, 0.15)',
              border: '1.5px solid #00D37D',
              color: '#00D37D',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0, 211, 125, 0.2)',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Xəta Bildirişi Toast (B02/B03 fix) */}
        {saveError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid #EF4444',
              color: '#F87171',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15)',
            }}
          >
            <span>⚠ {saveError}</span>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 0, fontSize: 16, lineHeight: 1 }}
              aria-label="Xəta bildirişini bağla"
            >×</button>
          </div>
        )}
      </div>

      {/* Visual Builder Workspace */}
      {activeTab === 'builder' && (
        <div
          className="theme-workspace-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: isSidebarCollapsed ? '1fr' : 'minmax(340px, 420px) 1fr',
            gap: 20,
            alignItems: 'start',
            height: 'calc(100vh - 200px)',
            minHeight: 700,
            transition: 'grid-template-columns 0.2s ease',
          }}
        >
          {!isSidebarCollapsed && (
            <VisualThemeBuilder
              theme={theme}
              onChange={pushThemeChange}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIdx > 0}
              canRedo={historyIdx < history.length - 1}
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
            />
          )}
          <LivePreviewEngine
            theme={theme}
            siteData={previewSiteData}
            slug={slug}
            viewport={viewport}
            onViewportChange={setViewport}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>
      )}

      {/* STL Code Editor Workspace */}
      {activeTab === 'code' && (
        <div
          className="theme-workspace-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: isSidebarCollapsed ? '1fr' : 'minmax(480px, 1.2fr) minmax(360px, 1fr)',
            gap: 20,
            alignItems: 'start',
            height: 'calc(100vh - 200px)',
            minHeight: 700,
            transition: 'grid-template-columns 0.2s ease',
          }}
        >
          {!isSidebarCollapsed && (
            <STLCodeEditor
              initialCode={stlCode}
              onCodeChange={setStlCode}
              onCompileSuccess={(ast) => {
                try {
                  const converted = convertSTLToThemeConfig(ast, theme);
                  setTheme(converted);
                } catch {
                  // ignore
                }
              }}
            />
          )}
          <LivePreviewEngine
            theme={theme}
            siteData={previewSiteData}
            slug={slug}
            viewport={viewport}
            onViewportChange={setViewport}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        </div>
      )}

      {/* Assets Manager Workspace */}
      {activeTab === 'assets' && (
        <ThemeAssetsManager
          theme={theme}
          orgId={orgId}
          onChange={pushThemeChange}
        />
      )}

      {/* Version History Workspace */}
      {activeTab === 'versions' && (
        <ThemeVersionHistory
          versions={versions}
          currentTheme={theme}
          onRestore={handleRestoreVersion}
          onCreateSnapshot={(title, note) => recordVersion(title, note, 'manual')}
        />
      )}

      {/* Settings Workspace */}
      {activeTab === 'settings' && (
        <ThemeSettingsPanel
          theme={theme}
          onChange={pushThemeChange}
          onResetDefault={handleResetDefault}
        />
      )}

      {/* Library or Customizer Workspaces */}
      {(activeTab === 'library' || activeTab === 'customizer') && (
        <div
          className="theme-workspace-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'library' ? 'minmax(0, 1.4fr) minmax(360px, 460px)' : '340px 1fr',
            gap: 24,
            alignItems: 'start',
            maxWidth: '100%',
          }}
        >
        {/* Left Panel */}
        {activeTab === 'library' ? (
          <ThemeLibrary
            activeTheme={theme}
            previewTheme={previewTheme}
            onPreview={(t) => setPreviewTheme(t)}
            onApply={applyTheme}
            onCancelPreview={() => setPreviewTheme(null)}
            onSwitchToCustomizer={() => setActiveTab('builder')}
            isSaving={saving}
          />
        ) : (
          <ThemeCustomizerTab
            theme={theme}
            setTheme={setTheme}
            saveDraft={saveDraft}
            publish={publish}
            saving={saving}
            saved={saved}
            publishing={publishing}
            published={published}
            orgId={orgId}
            orgName={orgName}
            applyTheme={applyTheme}
          />
        )}

      {/* Preview */}
      <div style={{ position: 'sticky', top: 20 }}>
        {previewTheme && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.25), rgba(0, 211, 125, 0.15))',
              border: '1.5px solid #7C5CFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              boxShadow: '0 4px 16px rgba(124, 92, 252, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#FFFFFF' }}>
              <Eye size={16} color="#C4B5FD" />
              <span>
                <strong>&ldquo;{previewTheme.name}&rdquo;</strong> canlı önizlənilir
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 6,
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                Çıx
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => applyTheme(previewTheme)}
                style={{
                  background: '#00D37D',
                  border: 'none',
                  borderRadius: 6,
                  color: '#0D1117',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 12px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Tətbiq edilir...' : 'Tətbiq et'}
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>Canlı Önizləmə</h2>
            {slug && (
              <a
                href={`/site/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#7C5CFC', textDecoration: 'none' }}
              >
                <Eye size={14} /> Yayınlanmış saytı aç
              </a>
            )}
          </div>

          {/* Device switcher */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#1e2022', padding: 3, borderRadius: 8, border: '1px solid #2A2A3A', gap: 4 }}>
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                background: previewDevice === 'desktop' ? '#7C5CFC' : 'transparent',
                color: previewDevice === 'desktop' ? '#fff' : '#8888A0',
                transition: 'all 0.15s',
              }}
            >
              <Monitor size={14} /> Masaüstü
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                background: previewDevice === 'mobile' ? '#7C5CFC' : 'transparent',
                color: previewDevice === 'mobile' ? '#fff' : '#8888A0',
                transition: 'all 0.15s',
              }}
            >
              <Smartphone size={14} /> Mobil
            </button>
          </div>
        </div>

        {/* Real Live Site Viewport Container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: previewDevice === 'mobile' ? '#0c0e10' : 'transparent',
            padding: previewDevice === 'mobile' ? '16px 0' : 0,
            borderRadius: 18,
          }}
        >
          <div
            className="sitex-preview-canvas"
            style={{
              width: previewDevice === 'mobile' ? 390 : '100%',
              height: 'calc(100vh - 120px)',
              minHeight: 800,
              borderRadius: 16,
              overflow: 'hidden',
              overflowY: 'auto',
              border: previewDevice === 'mobile' ? '8px solid #282a2c' : '1px solid #2A2A3A',
              boxShadow: previewDevice === 'mobile' ? '0 16px 40px rgba(0,0,0,0.8)' : '0 8px 30px rgba(0,0,0,0.4)',
              transform: 'translateZ(0)',
              position: 'relative',
              isolation: 'isolate',
              contain: 'paint layout',
              background: effectiveTheme.backgroundColor || '#121416',
            }}
          >
            <RestaurantSite data={previewSiteData} />
          </div>
        </div>
      </div>
    </div>
    )}

    {/* Theme Management Modal */}
    <ThemeManagementModal
      type={modalType}
      currentTheme={theme}
      onClose={() => setModalType(null)}
      onCreateTheme={handleCreateTheme}
      onDuplicateTheme={handleDuplicateTheme}
      onRenameTheme={handleRenameTheme}
      onImportTheme={handleImportTheme}
    />
    </>
  );
}
