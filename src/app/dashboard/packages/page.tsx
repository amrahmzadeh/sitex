'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Trash2, Pencil, ExternalLink,
  Check, AlertCircle, Eye, EyeOff, Loader2, ArrowUp, ArrowDown,
  Sparkles, Tag, DollarSign, ListChecks, Layers, Image as ImageIcon, X
} from 'lucide-react';

interface PackageItem {
  id: string;
  name: string;
  title?: string | null;
  description?: string | null;
  fullDescription?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  image?: string | null;
  features: string[];
  tag?: string | null;
  badgeText?: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  currency?: string;
}

export default function PackagesPage() {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['']);
  const [formIsActive, setFormIsActive] = useState(true);

  // Load organization
  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          const saved = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null;
          const found = d.organizations.find((o: Organization) => o.id === saved);
          setCurrentOrg(found || d.organizations[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch packages
  const loadPackages = async (orgId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/organizations/${orgId}/packages`);
      const data = await res.json();
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch {
      setMessage({ type: 'error', text: 'Paketlər yüklənərkən xəta baş verdi' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrg?.id) {
      loadPackages(currentOrg.id);
    }
  }, [currentOrg?.id]);

  const openCreateModal = () => {
    setEditingPkg(null);
    setFormName('');
    setFormTitle('');
    setFormDesc('');
    setFormFullDesc('');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormImage('');
    setFormTag('');
    setFormBadgeText('');
    setFormFeatures(['']);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageItem) => {
    setEditingPkg(pkg);
    setFormName(pkg.name);
    setFormTitle(pkg.title || '');
    setFormDesc(pkg.description || '');
    setFormFullDesc(pkg.fullDescription || '');
    setFormPrice(pkg.price !== null && pkg.price !== undefined ? String(pkg.price) : '');
    setFormDiscountPrice(pkg.discountPrice !== null && pkg.discountPrice !== undefined ? String(pkg.discountPrice) : '');
    setFormImage(pkg.image || '');
    setFormTag(pkg.tag || '');
    setFormBadgeText(pkg.badgeText || '');
    setFormFeatures(Array.isArray(pkg.features) && pkg.features.length > 0 ? [...pkg.features] : ['']);
    setFormIsActive(pkg.isActive);
    setIsModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id || !formName.trim()) return;

    try {
      setSaving(true);
      setMessage(null);

      const cleanedFeatures = formFeatures.map(f => f.trim()).filter(Boolean);

      const payload = {
        name: formName.trim(),
        title: formTitle.trim() || null,
        description: formDesc.trim() || null,
        fullDescription: formFullDesc.trim() || null,
        price: formPrice !== '' ? Number(formPrice) : null,
        discountPrice: formDiscountPrice !== '' ? Number(formDiscountPrice) : null,
        image: formImage.trim() || null,
        tag: formTag.trim() || null,
        badgeText: formBadgeText.trim() || null,
        features: cleanedFeatures,
        isActive: formIsActive,
      };

      if (editingPkg) {
        // Update
        const res = await fetch(`/api/organizations/${currentOrg.id}/packages/${editingPkg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Yeniləmək mümkün olmadı');

        setPackages(prev => prev.map(p => p.id === editingPkg.id ? data.package : p));
        setMessage({ type: 'success', text: 'Paket uğurla yeniləndi' });
      } else {
        // Create
        const res = await fetch(`/api/organizations/${currentOrg.id}/packages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Əlavə etmək mümkün olmadı');

        setPackages(prev => [...prev, data.package]);
        setMessage({ type: 'success', text: 'Yeni paket uğurla əlavə edildi' });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xəta baş verdi' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!currentOrg?.id) return;
    if (!confirm(`"${name}" paketini silmək istədiyinizdən əminsiniz?`)) return;

    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/packages/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Silmək mümkün olmadı');

      setPackages(prev => prev.filter(p => p.id !== id));
      setMessage({ type: 'success', text: 'Paket silindi' });
    } catch {
      setMessage({ type: 'error', text: 'Paketi silərkən xəta baş verdi' });
    }
  };

  const handleToggleActive = async (pkg: PackageItem) => {
    if (!currentOrg?.id) return;
    const newStatus = !pkg.isActive;

    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) throw new Error();

      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, isActive: newStatus } : p));
    } catch {
      setMessage({ type: 'error', text: 'Statusu dəyişmək mümkün olmadı' });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (!currentOrg?.id) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= packages.length) return;

    const newPackages = [...packages];
    const temp = newPackages[index];
    newPackages[index] = newPackages[targetIndex];
    newPackages[targetIndex] = temp;

    // Update sortOrder
    const updated = newPackages.map((p, idx) => ({ ...p, sortOrder: idx }));
    setPackages(updated);

    // Save in background
    try {
      await Promise.all([
        fetch(`/api/organizations/${currentOrg.id}/packages/${updated[index].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: index }),
        }),
        fetch(`/api/organizations/${currentOrg.id}/packages/${updated[targetIndex].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: targetIndex }),
        }),
      ]);
    } catch {}
  };

  const currency = currentOrg?.currency || 'AZN';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={22} color="#F59E0B" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>Paketlər və Xüsusi Təkliflər</h1>
              <p style={{ color: '#8888A0', fontSize: 13, margin: '2px 0 0' }}>
                Saytınızda nümayiş olunacaq xüsusi paketləri, menyu kombolarını və xidmət təkliflərini idarə edin.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {currentOrg?.slug && (
            <a
              href={`/site/${currentOrg.slug}#offers`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
            >
              <ExternalLink size={15} />
              Saytda bax
            </a>
          )}
          <button
            onClick={openCreateModal}
            className="dash-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F59E0B', borderColor: '#D97706', color: '#000', fontWeight: 600 }}
          >
            <Plus size={16} />
            Yeni Paket Əlavə Et
          </button>
        </div>
      </div>

      {/* Alert message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              background: message.type === 'success' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)',
              border: `1px solid ${message.type === 'success' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              color: message.type === 'success' ? '#34D399' : '#F87171',
            }}
          >
            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Package List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
            Mövcud Paketlər ({packages.length})
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="dash-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Package size={30} color="#F59E0B" style={{ opacity: 0.6 }} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', marginBottom: 6 }}>Hələ heç bir paket əlavə edilməyib</h3>
            <p style={{ fontSize: 13, color: '#8888A0', maxWidth: 440, margin: '0 auto 20px' }}>
              Restoranınız və ya xidmətiniz üçün xüsusi təklif, biznes nahar, kombo menyu və ya fərdi paket yaradın.
            </p>
            <button
              onClick={openCreateModal}
              className="dash-btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F59E0B', borderColor: '#D97706', color: '#000', fontWeight: 600 }}
            >
              <Plus size={16} />
              İlk Paketi Yarat
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            <AnimatePresence>
              {packages.map((pkg, index) => {
                const price = pkg.price;
                const discountPrice = pkg.discountPrice;
                return (
                  <motion.div
                    key={pkg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="dash-card dash-menu-item-card"
                    style={{
                      border: pkg.isActive ? '1px solid rgba(255,255,255,0.06)' : '1px dashed rgba(255,255,255,0.04)',
                      opacity: pkg.isActive ? 1 : 0.6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div className="dash-menu-item-top">
                      {/* Sort buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          style={{
                            border: 'none',
                            background: 'rgba(255,255,255,0.04)',
                            color: index === 0 ? '#444' : '#8888A0',
                            cursor: index === 0 ? 'default' : 'pointer',
                            padding: 4,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === packages.length - 1}
                          style={{
                            border: 'none',
                            background: 'rgba(255,255,255,0.04)',
                            color: index === packages.length - 1 ? '#444' : '#8888A0',
                            cursor: index === packages.length - 1 ? 'default' : 'pointer',
                            padding: 4,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      {/* Image / Thumbnail */}
                      {pkg.image ? (
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Package size={28} color="#F59E0B" />
                        </div>
                      )}

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: '#F7F8F9', margin: 0 }}>
                            {pkg.title || pkg.name}
                          </h4>
                          {pkg.tag && (
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: 100 }}>
                              {pkg.tag}
                            </span>
                          )}
                          {pkg.badgeText && (
                            <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(124, 92, 252, 0.15)', color: '#A78BFA', border: '1px solid rgba(124, 92, 252, 0.3)', padding: '2px 8px', borderRadius: 100 }}>
                              {pkg.badgeText}
                            </span>
                          )}
                          {!pkg.isActive && (
                            <span style={{ fontSize: 10, fontWeight: 600, background: 'rgba(248, 113, 113, 0.15)', color: '#F87171', padding: '2px 6px', borderRadius: 6 }}>
                              Deaktiv
                            </span>
                          )}
                        </div>

                        {pkg.description && (
                          <p style={{ fontSize: 13, color: '#8888A0', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pkg.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          {price !== null && price !== undefined ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {discountPrice !== null && discountPrice !== undefined && discountPrice < price ? (
                                <>
                                  <span style={{ fontSize: 15, fontWeight: 700, color: '#34D399' }}>
                                    {discountPrice.toFixed(2)} {currency}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#8888A0', textDecoration: 'line-through' }}>
                                    {price.toFixed(2)} {currency}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#F59E0B' }}>
                                  {price.toFixed(2)} {currency}
                                </span>
                              )}
                            </div>
                          ) : null}

                          {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                            <span style={{ fontSize: 12, color: '#9BA3AF' }}>
                              • {pkg.features.length} xidmət / üstünlük
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="dash-menu-item-actions">
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        title={pkg.isActive ? 'Deaktiv et' : 'Aktiv et'}
                        className="dash-btn-secondary"
                        style={{ padding: '8px 10px', color: pkg.isActive ? '#34D399' : '#8888A0' }}
                      >
                        {pkg.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>

                      <button
                        onClick={() => openEditModal(pkg)}
                        className="dash-btn-secondary"
                        style={{ padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                      >
                        <Pencil size={14} />
                        Düzəlt
                      </button>

                      <button
                        onClick={() => handleDelete(pkg.id, pkg.name)}
                        className="dash-btn-danger"
                        style={{ padding: '8px 10px' }}
                        title="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#181A22',
                border: '1px solid #282B36',
                borderRadius: 18,
                padding: 28,
                width: '100%',
                maxWidth: 620,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Package size={22} color="#F59E0B" />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>
                    {editingPkg ? 'Paketi Redaktə Et' : 'Yeni Paket Yarat'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSavePackage} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Name & Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">Paket Adı *</label>
                    <input
                      className="dash-input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Məs: Biznes Nahar"
                      required
                    />
                  </div>
                  <div>
                    <label className="dash-label">Göstərilən Başlıq</label>
                    <input
                      className="dash-input"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Məs: Biznes Nahar Menyu"
                    />
                  </div>
                </div>

                {/* Tag & Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">Etiket (Tag)</label>
                    <input
                      className="dash-input"
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value)}
                      placeholder="Məs: HƏFTƏ İÇİ, 12:00-15:00"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Badge Mətni</label>
                    <input
                      className="dash-input"
                      value={formBadgeText}
                      onChange={(e) => setFormBadgeText(e.target.value)}
                      placeholder="Məs: 4 Nəfərlik, VIP Xidmət"
                    />
                  </div>
                </div>

                {/* Prices */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">Qiymət ({currency})</label>
                    <input
                      className="dash-input"
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="12.00"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Endirimli Qiymət ({currency})</label>
                    <input
                      className="dash-input"
                      type="number"
                      step="0.01"
                      value={formDiscountPrice}
                      onChange={(e) => setFormDiscountPrice(e.target.value)}
                      placeholder="9.90"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="dash-label">Qısa Açıqlama</label>
                  <textarea
                    className="dash-input"
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Günün şorbası, ləziz isti yemək, təzə mövsüm salatı və sərinləşdirici içki."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="dash-label">Paket Şəkli / Banner URL</label>
                  <input
                    className="dash-input"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                {/* Features / Services included */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="dash-label" style={{ margin: 0 }}>Paketə Daxil Olan Xidmətlər və Üstünlüklər</label>
                    <button
                      type="button"
                      onClick={() => setFormFeatures([...formFeatures, ''])}
                      className="dash-btn-secondary"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                    >
                      + Əlavə et
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {formFeatures.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 6 }}>
                        <input
                          className="dash-input"
                          value={feat}
                          onChange={(e) => {
                            const updated = [...formFeatures];
                            updated[idx] = e.target.value;
                            setFormFeatures(updated);
                          }}
                          placeholder={`Üstünlük ${idx + 1} (məs: Pulsuz desert və ya Limitsiz çay)`}
                          style={{ flex: 1, padding: '7px 12px', fontSize: 13 }}
                        />
                        {formFeatures.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormFeatures(formFeatures.filter((_, i) => i !== idx))}
                            className="dash-btn-danger"
                            style={{ padding: '7px 10px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid #282B36' }}>
                  <input
                    type="checkbox"
                    id="packageActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#F59E0B', cursor: 'pointer' }}
                  />
                  <label htmlFor="packageActive" style={{ fontSize: 13, color: '#E8E8F0', cursor: 'pointer', fontWeight: 500 }}>
                    Bu paket aktivdir və saytda göstərilsin
                  </label>
                </div>

                {/* Submit buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="dash-btn-secondary"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="dash-btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F59E0B', borderColor: '#D97706', color: '#000', fontWeight: 600 }}
                  >
                    {saving && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                    {editingPkg ? 'Yadda Saxla' : 'Paketi Yarat'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

