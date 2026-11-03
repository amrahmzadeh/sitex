'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Globe, Check, Loader2, Eye, Trash2, X, Palette, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSiteTypeLabel } from '@/config/site-categories';
import { isMenuSupportedCategory, isMenuActive } from '@/modules/navigation';

function useCurrentOrg() {
  const [data, setData] = useState<{
    orgId: string | null;
    slug: string;
    isPublished: boolean;
    siteCategory: string | null;
    siteSubcategory: string | null;
    templateId: string | null;
    templateVersion: string | null;
    templateSource: string | null;
  }>({
    orgId: null,
    slug: '',
    isPublished: false,
    siteCategory: null,
    siteSubcategory: null,
    templateId: null,
    templateVersion: null,
    templateSource: null,
  });
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    const fetchOrg = (id: string) => {
      fetch(`/api/organizations/${id}`).then(r => r.json()).then(d => {
        setData({
          orgId: id,
          slug: d.organization?.slug || '',
          isPublished: d.organization?.website?.isPublished || false,
          siteCategory: d.organization?.siteCategory || null,
          siteSubcategory: d.organization?.siteSubcategory || null,
          templateId: d.organization?.templateId || null,
          templateVersion: d.organization?.templateVersion || null,
          templateSource: d.organization?.templateSource || null,
        });
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
  const { data: session } = useSession();
  const isSuperAdmin = (session?.user as { role?: string })?.role === 'SUPER_ADMIN';
  const {
    orgId, slug, isPublished, siteCategory, siteSubcategory,
    templateId, templateVersion, templateSource,
  } = useCurrentOrg();
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const router = useRouter();

  // Şablon yeniləmə state-i
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');

  const siteTypeLabel = getSiteTypeLabel(siteCategory, siteSubcategory);

  const reapplyTemplate = async () => {
    if (!orgId || !templateId) return;
    setApplying(true);
    setApplyError('');
    setApplyMessage('');
    try {
      const res = await fetch('/api/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId, templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApplyError(data.error || 'Şablon tətbiq edilə bilmədi');
        return;
      }
      setApplyMessage(
        data.template?.warning ||
          'Şablon qaralamaya tətbiq olundu. Dəyişikliyin canlı saytda görünməsi üçün “Yayınla” düyməsini basın.'
      );
    } catch {
      setApplyError('Şəbəkə xətası baş verdi');
    } finally {
      setApplying(false);
    }
  };

  // Delete site state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const publish = async () => {
    if (!orgId) return;
    setPublishing(true);
    try {
      await fetch(`/api/organizations/${orgId}/publish`, { method: 'POST' });
      setPublished(true);
      setTimeout(() => setPublished(false), 4000);
    } finally { setPublishing(false); }
  };

  const handleDeleteSite = async () => {
    if (!orgId) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/organizations/${orgId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        setDeleteError(d.error || 'Xəta baş verdi');
        return;
      }
      // Remove from local storage and redirect
      localStorage.removeItem('currentOrgId');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setDeleteError('Silmə zamanı xəta baş verdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Globe size={28} color="#00D37D" /> Veb Saytım
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
                  Ünvan: <code style={{ color: '#00D37D' }}>/site/{slug}</code>
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

        {/* Sayt növü və şablon */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="dash-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Palette size={20} color="#00D37D" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>Sayt növü və şablon</h2>
          </div>

          <p style={{ fontSize: 13, color: '#E8E8F0', margin: '0 0 4px' }}>
            {siteTypeLabel || 'Bu sayt kateqoriya təyin edilmədən yaradılıb (köhnə sayt).'}
          </p>

          {templateId ? (
            <p style={{ fontSize: 12, color: '#8888A0', margin: '0 0 14px' }}>
              Şablon: <code style={{ color: '#00D37D' }}>{templateId}</code>
              {' · '}v{templateVersion || '1.0.0'}
              {' · '}{templateSource === 'github' ? 'GitHub mənbəyi' : 'Daxili tema'}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: '#8888A0', margin: '0 0 14px' }}>
              Şablon təyin edilməyib. Yeni sayt yaradarkən növ seçsəniz, uyğun şablon avtomatik tətbiq olunur.
            </p>
          )}

          {templateId && (
            <button
              type="button"
              onClick={reapplyTemplate}
              disabled={applying}
              className="dash-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              {applying
                ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                : <RefreshCw size={14} />}
              {applying ? 'Tətbiq olunur...' : 'Şablonu yenidən tətbiq et'}
            </button>
          )}

          {applyMessage && (
            <p style={{ fontSize: 12, color: '#34D399', margin: '12px 0 0' }}>{applyMessage}</p>
          )}
          {applyError && (
            <p style={{ fontSize: 12, color: '#F87171', margin: '12px 0 0' }}>{applyError}</p>
          )}
        </motion.div>

        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            ...(isSuperAdmin ? [
              { title: 'Tema redaktoru', desc: 'Rənglər, fontlar, dizayn', href: '/dashboard/theme', color: '#00D37D' },
              { title: 'Splash Screen', desc: 'Video və animasiya ekranı', href: '/dashboard/splash', color: '#EC4899' },
            ] : []),
            ...(isMenuSupportedCategory(siteCategory, siteSubcategory) || isMenuActive({ id: orgId, category: siteCategory, subcategory: siteSubcategory })
              ? [{ title: 'Menyu idarəetməsi', desc: 'Kateqoriyalar və yeməklər', href: '/dashboard/menu', color: '#22D3EE' }]
              : [{ title: 'Xidmətlər', desc: 'Xidmət və bölmələrin idarəsi', href: '/dashboard/services', color: '#22D3EE' }]),
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
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#383334'; }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#8888A0' }}>{desc}</p>
            </motion.a>
          ))}
        </div>

        {/* Danger Zone */}
        {orgId && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card" style={{ padding: 24, borderColor: 'rgba(248,113,113,0.2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F87171', marginBottom: 8 }}>Təhlükəli Zona</h3>
            <p style={{ fontSize: 13, color: '#8888A0', marginBottom: 16 }}>
              Saytı silmək bütün menyu məlumatlarını, şəkilləri, parametrləri və saytın URL-ni həmişəlik silir. Bu əməliyyat geri qaytarıla bilməz.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="dash-btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
            >
              <Trash2 size={14} /> Bu saytı sil
            </button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#171717', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>Saytı Sil</h2>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#8888A0', fontSize: 14, marginBottom: 8 }}>
              Bu saytı və ona bağlı bütün məlumatları (menyu, kateqoriyalar, şəkillər, parametrlər) həmişəlik silmək istədiyinizə əminsiniz?
            </p>
            <p style={{ color: '#F87171', fontSize: 13, marginBottom: 20 }}>
              ⚠️ Bu əməliyyat geri qaytarıla bilməz.
            </p>
            {deleteError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 16 }}>
                {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} className="dash-btn-secondary">
                Ləğv et
              </button>
              <button
                onClick={handleDeleteSite}
                disabled={deleteLoading}
                className="dash-btn-danger"
                style={{ opacity: deleteLoading ? 0.7 : 1, background: 'rgba(248,113,113,0.15)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Trash2 size={14} />
                {deleteLoading ? 'Silinir...' : 'Bəli, sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

