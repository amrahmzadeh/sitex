'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Loader2, UtensilsCrossed,
  Tag, DollarSign, Eye, EyeOff, Star, Flame, Sparkles, Upload, ChevronDown, Film, AlertCircle,
} from 'lucide-react';
import { isFoodCategory } from '@/modules/navigation';

interface Category { id: string; name: string; description?: string; isVisible: boolean; sortOrder: number; _count?: { menuItems: number }; }
interface MenuItem {
  id: string; name: string; description?: string; price: number; discountPrice?: number;
  categoryId: string; image?: string; video?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
  isVisible: boolean; ingredients?: string; allergens?: string; portionSize?: string;
  prepTime?: string;
}

function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) { setOrgId(saved); return; }
    fetch('/api/organizations').then(r => r.json()).then(d => {
      if (d.organizations?.[0]) {
        setOrgId(d.organizations[0].id);
        localStorage.setItem('currentOrgId', d.organizations[0].id);
      }
    });
  }, []);
  return orgId;
}

export default function MenuPage() {
  const router = useRouter();
  const orgId = useCurrentOrg();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', isVisible: true });
  const [itemForm, setItemForm] = useState<Partial<MenuItem> & { categoryId: string }>({ name: '', price: 0, categoryId: '', isVisible: true, isFeatured: false, isNew: false, isPopular: false });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState('AZN');

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/organizations/${orgId}/menu/categories`).then(r => r.json()),
      fetch(`/api/organizations/${orgId}/menu/items`).then(r => r.json()),
      fetch(`/api/organizations/${orgId}`).then(r => r.json()),
    ]).then(([cats, its, org]) => {
      const orgData = org.organization;
      if (orgData) {
        if (!isFoodCategory(orgData.siteCategory, orgData.siteSubcategory)) {
          setIsAllowed(false);
          router.replace('/dashboard');
          return;
        }
        if (orgData.currency) setCurrency(orgData.currency);
      }
      setCategories(cats.categories || []);
      setItems(its.items || []);
      if (cats.categories?.[0]) setActiveCategory(cats.categories[0].id);
    }).finally(() => setLoading(false));
  }, [orgId, router]);

  if (!isAllowed) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#F87171' }}>
        <p>Bu bölmə yalnız restoran və kafe saytları üçün əlçatandır. Yönləndirilirsiniz...</p>
      </div>
    );
  }

  const openCatModal = (cat?: Category) => {
    setEditCategory(cat || null);
    setCatForm(cat ? { name: cat.name, description: cat.description || '', isVisible: cat.isVisible } : { name: '', description: '', isVisible: true });
    setShowCatModal(true);
  };

  const saveCat = async () => {
    if (!orgId || !catForm.name) return;
    setSaving(true);
    try {
      const url = editCategory ? `/api/organizations/${orgId}/menu/categories/${editCategory.id}` : `/api/organizations/${orgId}/menu/categories`;
      const method = editCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) });
      const data = await res.json();
      if (res.ok) {
        if (editCategory) {
          setCategories(c => c.map(x => x.id === editCategory.id ? { ...x, ...data.category } : x));
        } else {
          setCategories(c => [...c, { ...data.category, _count: { menuItems: 0 } }]);
          setActiveCategory(data.category.id);
        }
        setShowCatModal(false);
      }
    } finally { setSaving(false); }
  };

  const deleteCat = async (id: string) => {
    if (!orgId || !confirm('Kateqoriya silinsin? Bütün yeməklər də silinəcək.')) return;
    await fetch(`/api/organizations/${orgId}/menu/categories/${id}`, { method: 'DELETE' });
    setCategories(c => c.filter(x => x.id !== id));
    if (activeCategory === id) setActiveCategory(categories.find(x => x.id !== id)?.id || null);
  };

  const openItemModal = (item?: MenuItem) => {
    setEditItem(item || null);
    setItemForm(item ? { ...item, video: item.video || '' } : { name: '', price: 0, categoryId: activeCategory || '', isVisible: true, isFeatured: false, isNew: false, isPopular: false, video: '' });
    setShowItemModal(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!orgId) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setItemForm(p => ({ ...p, image: data.url }));
      } else {
        alert(data.error || 'Şəkil yüklənərkən xəta baş verdi');
      }
    } catch (e: any) {
      alert(e?.message || 'Şəkil yüklənərkən xəta baş verdi');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!orgId) return;
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/organizations/${orgId}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setItemForm(p => ({ ...p, video: data.url }));
      } else {
        alert(data.error || 'Video yüklənərkən xəta baş verdi');
      }
    } catch (e: any) {
      alert(e?.message || 'Video yüklənərkən xəta baş verdi');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const saveItem = async () => {
    if (!orgId || !itemForm.name || !itemForm.categoryId) {
      alert('Yemək adı və kateqoriya mütləqdir');
      return;
    }
    setSaving(true);
    try {
      const url = editItem ? `/api/organizations/${orgId}/menu/items/${editItem.id}` : `/api/organizations/${orgId}/menu/items`;
      const method = editItem ? 'PATCH' : 'POST';
      const payload = {
        name: itemForm.name.trim(),
        price: Number(itemForm.price) || 0,
        discountPrice: itemForm.discountPrice ? Number(itemForm.discountPrice) : null,
        categoryId: itemForm.categoryId,
        image: itemForm.image ? itemForm.image.trim() : null,
        video: itemForm.video ? itemForm.video.trim() : null,
        description: itemForm.description ? itemForm.description.trim() : null,
        ingredients: itemForm.ingredients ? itemForm.ingredients.trim() : null,
        portionSize: itemForm.portionSize ? itemForm.portionSize.trim() : null,
        allergens: itemForm.allergens ? itemForm.allergens.trim() : null,
        prepTime: itemForm.prepTime ? itemForm.prepTime.trim() : null,
        isFeatured: Boolean(itemForm.isFeatured),
        isNew: Boolean(itemForm.isNew),
        isPopular: Boolean(itemForm.isPopular),
        isVisible: itemForm.isVisible !== false,
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Xəta baş verdi');
        return;
      }
      if (editItem) {
        const oldCatId = editItem.categoryId;
        const newCatId = data.item.categoryId;
        setItems(its => its.map(x => x.id === editItem.id ? { ...x, ...data.item } : x));
        if (oldCatId !== newCatId) {
          setActiveCategory(newCatId);
        }
      } else {
        setItems(its => [...its, data.item]);
        setActiveCategory(data.item.categoryId);
      }
      setShowItemModal(false);
    } catch (e: any) {
      alert(e?.message || 'Xəta baş verdi');
    } finally { setSaving(false); }
  };

  const deleteItem = async (id: string, _catId: string) => {
    if (!orgId || !confirm('Yemək silinsin?')) return;
    await fetch(`/api/organizations/${orgId}/menu/items/${id}`, { method: 'DELETE' });
    setItems(its => its.filter(x => x.id !== id));
  };

  const catItems = items.filter(i => i.categoryId === activeCategory);

  if (loading) return (
    <div style={{ display: 'grid', gap: 16 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
    </div>
  );

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0' }}>Menyu</h1>
          <p style={{ color: '#8888A0', fontSize: 14 }}>{categories.length} kateqoriya · {items.length} yemək</p>
        </div>
        <button onClick={() => openCatModal()} className="dash-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Kateqoriya əlavə et
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Categories sidebar */}
        <div>
          <div className="dash-card" style={{ overflow: 'hidden' }}>
            {categories.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#8888A0', fontSize: 14 }}>
                <UtensilsCrossed size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>Kateqoriya yoxdur</p>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #2A2A3A',
                    background: activeCategory === cat.id ? 'rgba(124,92,252,0.1)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: activeCategory === cat.id ? '#9B7FFF' : '#E8E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</p>
                    <p style={{ fontSize: 12, color: '#8888A0' }}>{items.filter(i => i.categoryId === cat.id).length} yemək</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <button onClick={(e) => { e.stopPropagation(); openCatModal(cat); }} style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCat(cat.id); }} style={{ border: 'none', background: 'transparent', color: '#F87171', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          {activeCategory ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0' }}>
                  {categories.find(c => c.id === activeCategory)?.name} — {catItems.length} yemək
                </h2>
                <button onClick={() => openItemModal()} className="dash-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <Plus size={14} /> Yemək əlavə et
                </button>
              </div>

              {catItems.length === 0 ? (
                <div className="dash-card" style={{ padding: 48, textAlign: 'center' }}>
                  <UtensilsCrossed size={40} style={{ margin: '0 auto 16px', color: '#2A2A3A' }} />
                  <p style={{ color: '#8888A0', marginBottom: 16 }}>Bu kateqoriyada yemək yoxdur</p>
                  <button onClick={() => openItemModal()} className="dash-btn-primary">
                    İlk yeməyi əlavə et
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  <AnimatePresence>
                    {catItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="dash-card"
                        style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: 10, background: '#2A2A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <UtensilsCrossed size={24} color="#444" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#E8E8F0' }}>{item.name}</span>
                            {item.isFeatured && <span style={{ background: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontSize: 10, padding: '1px 6px', borderRadius: 100 }}>Seçilmiş</span>}
                            {item.isNew && <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', fontSize: 10, padding: '1px 6px', borderRadius: 100 }}>Yeni</span>}
                            {item.isPopular && <span style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', fontSize: 10, padding: '1px 6px', borderRadius: 100 }}>Populyar</span>}
                            {item.video && <span style={{ background: 'rgba(255,159,28,0.18)', color: '#FF9F1C', fontSize: 10, padding: '1px 6px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 3 }}>🎬 Video</span>}
                          </div>
                          {item.description && <p style={{ fontSize: 12, color: '#8888A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            {item.discountPrice ? (
                              <>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#34D399' }}>{item.discountPrice.toFixed(2)} {currency}</span>
                                <span style={{ fontSize: 12, color: '#8888A0', textDecoration: 'line-through' }}>{item.price.toFixed(2)} {currency}</span>
                              </>
                            ) : (
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#7C5CFC' }}>{item.price.toFixed(2)} {currency}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => openItemModal(item)}
                            style={{ border: '1px solid #2A2A3A', background: 'transparent', color: '#8888A0', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}
                          >
                            <Pencil size={14} /> Düzəlt
                          </button>
                          <button
                            onClick={() => deleteItem(item.id, item.categoryId)}
                            style={{ border: '1px solid rgba(248,113,113,0.3)', background: 'transparent', color: '#F87171', cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <div className="dash-card" style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ color: '#8888A0' }}>Soldan bir kateqoriya seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCatModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowCatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>{editCategory ? 'Kateqoriyanı düzəlt' : 'Kateqoriya əlavə et'}</h3>
                <button onClick={() => setShowCatModal(false)} style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="dash-label">Kateqoriya adı *</label>
                  <input className="dash-input" value={catForm.name} onChange={(e) => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="Məs: Şorba, Pizza, Desert..." />
                </div>
                <div>
                  <label className="dash-label">Təsvir</label>
                  <textarea className="dash-input" value={catForm.description} onChange={(e) => setCatForm(p => ({ ...p, description: e.target.value }))} placeholder="Kateqoriya haqqında..." rows={2} style={{ resize: 'none' }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={catForm.isVisible} onChange={(e) => setCatForm(p => ({ ...p, isVisible: e.target.checked }))} />
                  <span style={{ fontSize: 14, color: '#E8E8F0' }}>Saytda göstər</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowCatModal(false)} className="dash-btn-secondary" style={{ flex: 1 }}>Ləğv et</button>
                <button onClick={saveCat} disabled={saving} className="dash-btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {editCategory ? 'Yadda saxla' : 'Əlavə et'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowItemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>{editItem ? 'Yeməyi düzəlt' : 'Yemək əlavə et'}</h3>
                <button onClick={() => setShowItemModal(false)} style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* Image Input & Upload */}
              <div style={{ marginBottom: 20 }}>
                <label className="dash-label">Yeməyin şəkli</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    className="dash-input"
                    style={{ flex: 1 }}
                    value={itemForm.image || ''}
                    onChange={(e) => setItemForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="Şəkil URL linki (və ya aşağıdan fayl yükləyin)..."
                  />
                  {itemForm.image && (
                    <button
                      type="button"
                      onClick={() => setItemForm(p => ({ ...p, image: '' }))}
                      className="dash-btn-secondary"
                      style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.3)', padding: '0 14px', fontSize: 13, flexShrink: 0 }}
                    >
                      Şəkli sil
                    </button>
                  )}
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #2A2A3A',
                    borderRadius: 12,
                    padding: itemForm.image ? 10 : 20,
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  {itemForm.image ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={itemForm.image}
                        alt="Yemək şəkli"
                        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                      />
                      <div style={{ marginTop: 8, fontSize: 12, color: '#8888A0' }}>
                        Başqa şəkil seçmək üçün klikləyin
                      </div>
                    </div>
                  ) : uploadingImage ? (
                    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <Loader2 size={24} color="#7C5CFC" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 13, color: '#E8E8F0' }}>Şəkil yüklənir...</span>
                    </div>
                  ) : (
                    <div style={{ color: '#8888A0', fontSize: 13 }}>
                      <Upload size={24} style={{ margin: '0 auto 8px', color: '#7C5CFC' }} />
                      <p style={{ color: '#E8E8F0', fontWeight: 500 }}>Kompüterdən şəkil yükləmək üçün klikləyin</p>
                      <p style={{ fontSize: 11, marginTop: 4 }}>JPEG, PNG, WebP — maksimum 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                  />
                </div>
              </div>

              {/* Video upload */}
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Yemək videosu (Boydan video / Reels)</span>
                  <span style={{ fontSize: 11, color: '#FF9F1C' }}>Popup solunda boydan görünəcək</span>
                </label>
                <div
                  onClick={() => !uploadingVideo && videoInputRef.current?.click()}
                  style={{
                    border: '2px dashed #2A2A3A',
                    borderRadius: 12,
                    padding: itemForm.video ? 10 : 16,
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  {itemForm.video ? (
                    <div style={{ position: 'relative' }}>
                      <video
                        src={itemForm.video}
                        controls
                        playsInline
                        style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, backgroundColor: '#000' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            videoInputRef.current?.click();
                          }}
                          className="dash-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                        >
                          Başqa video seç
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemForm(p => ({ ...p, video: '' }));
                          }}
                          className="dash-btn-danger"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                        >
                          Videonu sil
                        </button>
                      </div>
                    </div>
                  ) : uploadingVideo ? (
                    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <Loader2 size={24} color="#FF9F1C" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: 13, color: '#E8E8F0' }}>Video yüklənir...</span>
                    </div>
                  ) : (
                    <div style={{ color: '#8888A0', fontSize: 13 }}>
                      <Film size={24} style={{ margin: '0 auto 8px', color: '#FF9F1C' }} />
                      <p style={{ color: '#E8E8F0', fontWeight: 500 }}>Kompüterdən video yükləmək üçün klikləyin</p>
                      <p style={{ fontSize: 11, marginTop: 4 }}>MP4, WebM, MOV — maksimum 100MB (boydan video)</p>
                    </div>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) handleVideoUpload(e.target.files[0]); }}
                  />
                </div>
                <input
                  className="dash-input"
                  style={{ marginTop: 8, fontSize: 12, padding: '8px 12px' }}
                  value={itemForm.video || ''}
                  onChange={(e) => setItemForm(p => ({ ...p, video: e.target.value }))}
                  placeholder="və ya video linki (/uploads/... və ya https://...)"
                />
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label className="dash-label">Yemək adı *</label>
                  <input className="dash-input" value={itemForm.name || ''} onChange={(e) => setItemForm(p => ({ ...p, name: e.target.value }))} placeholder="Məs: Margherita Pizza" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">Qiymət ({currency}) *</label>
                    <input className="dash-input" type="number" step="0.01" min="0" value={itemForm.price || ''} onChange={(e) => setItemForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="dash-label">Endirimli qiymət</label>
                    <input className="dash-input" type="number" step="0.01" min="0" value={itemForm.discountPrice || ''} onChange={(e) => setItemForm(p => ({ ...p, discountPrice: parseFloat(e.target.value) || undefined }))} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="dash-label">Kateqoriya *</label>
                  <select className="dash-input" value={itemForm.categoryId} onChange={(e) => setItemForm(p => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">Kateqoriya seçin</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="dash-label">Qısa təsvir</label>
                  <textarea className="dash-input" rows={2} value={itemForm.description || ''} onChange={(e) => setItemForm(p => ({ ...p, description: e.target.value }))} placeholder="Yemək haqqında qısa məlumat..." style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">Tərkib</label>
                    <input className="dash-input" value={itemForm.ingredients || ''} onChange={(e) => setItemForm(p => ({ ...p, ingredients: e.target.value }))} placeholder="Un, pendir, pomidor..." />
                  </div>
                  <div>
                    <label className="dash-label">Porsiya</label>
                    <input className="dash-input" value={itemForm.portionSize || ''} onChange={(e) => setItemForm(p => ({ ...p, portionSize: e.target.value }))} placeholder="250q, 1 ədəd..." />
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { key: 'isFeatured', label: 'Seçilmiş', color: '#FBBF24' },
                    { key: 'isNew', label: 'Yeni', color: '#34D399' },
                    { key: 'isPopular', label: 'Populyar', color: '#F87171' },
                    { key: 'isVisible', label: 'Görünür', color: '#7C5CFC' },
                  ].map(({ key, label, color }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color }}>
                      <input
                        type="checkbox"
                        checked={!!itemForm[key as keyof typeof itemForm]}
                        onChange={(e) => setItemForm(p => ({ ...p, [key]: e.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowItemModal(false)} className="dash-btn-secondary" style={{ flex: 1 }}>Ləğv et</button>
                <button onClick={saveItem} disabled={saving} className="dash-btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {editItem ? 'Yadda saxla' : 'Əlavə et'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
