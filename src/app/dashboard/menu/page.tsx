'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Package, Layers, Trash2, X, Loader2, UtensilsCrossed,
  Tag, DollarSign, Eye, EyeOff, Star, Flame, Sparkles, Upload, ChevronDown, Film, AlertCircle,
  Check, Search, FileJson, Download,
} from 'lucide-react';
import { isFoodCategory, isMenuActive } from '@/modules/navigation';
import { parseSetItems, serializeSetItems, formatSetSummary, type SetItemEntry } from '@/lib/set-dishes';

interface Category { id: string; name: string; description?: string; isVisible: boolean; sortOrder: number; _count?: { menuItems: number }; }
interface MenuItem {
  id: string; name: string; description?: string; price: number; discountPrice?: number;
  categoryId: string; image?: string; video?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
  isVisible: boolean; ingredients?: string; allergens?: string; portionSize?: string;
  prepTime?: string; isSet?: boolean; setItems?: string | null;
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
  const [heroDishId, setHeroDishId] = useState<string | null>(null);
  const [settingHero, setSettingHero] = useState<string | null>(null);
  const [showHeroPickerModal, setShowHeroPickerModal] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [currentSetList, setCurrentSetList] = useState<SetItemEntry[]>([]);
  const [quickDishSelect, setQuickDishSelect] = useState('');
  const [customSetDishName, setCustomSetDishName] = useState('');
  const [customSetDishPortion, setCustomSetDishPortion] = useState('');
  const [customSetDishQty, setCustomSetDishQty] = useState(1);
  const [menuFilter, setMenuFilter] = useState<'all' | 'single' | 'sets'>('all');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonMode, setJsonMode] = useState<'append' | 'replace'>('append');
  const [jsonImporting, setJsonImporting] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [jsonSuccess, setJsonSuccess] = useState('');

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
        const menuAllowed =
          isFoodCategory(orgData.siteCategory, orgData.siteSubcategory) ||
          isMenuActive({
            id: orgData.id,
            category: orgData.siteCategory,
            subcategory: orgData.siteSubcategory,
            website: orgData.website,
          });
        if (!menuAllowed) {
          setIsAllowed(false);
          router.replace('/dashboard/services');
          return;
        }
        if (orgData.currency) setCurrency(orgData.currency);
        const draft = orgData.website?.draftTheme as any;
        const currentHero = draft?.heroDishId || its.items?.find((i: MenuItem) => i.isFeatured)?.id || null;
        setHeroDishId(currentHero);
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

  const openItemModal = (item?: MenuItem, forceSet?: boolean) => {
    setEditItem(item || null);
    const isSetVal = item ? Boolean(item.isSet) : Boolean(forceSet);
    const parsedList = item?.setItems ? parseSetItems(item.setItems) : [];
    setCurrentSetList(parsedList);
    setQuickDishSelect('');
    setCustomSetDishName('');
    setCustomSetDishPortion('');
    setCustomSetDishQty(1);

    setItemForm(
      item
        ? { ...item, video: item.video || '', isSet: isSetVal, setItems: item.setItems || '' }
        : {
            name: '',
            price: 0,
            categoryId: activeCategory || '',
            isVisible: true,
            isFeatured: false,
            isNew: false,
            isPopular: false,
            video: '',
            isSet: isSetVal,
            setItems: '',
          }
    );
    setShowItemModal(true);
  };

  const addDishToSet = (dishName: string, portion?: string, qty = 1, price?: number) => {
    if (!dishName.trim()) return;
    setCurrentSetList(prev => {
      const existing = prev.find(p => p.name.toLowerCase() === dishName.trim().toLowerCase());
      if (existing) {
        return prev.map(p => p.name.toLowerCase() === dishName.trim().toLowerCase()
          ? { ...p, quantity: (Number(p.quantity) || 1) + qty }
          : p
        );
      }
      return [...prev, { name: dishName.trim(), quantity: qty, portion: portion?.trim() || undefined, price }];
    });
  };

  const removeDishFromSet = (idx: number) => {
    setCurrentSetList(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSetItemQty = (idx: number, qty: number) => {
    if (qty <= 0) {
      removeDishFromSet(idx);
      return;
    }
    setCurrentSetList(prev => prev.map((p, i) => i === idx ? { ...p, quantity: qty } : p));
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
        isSet: Boolean(itemForm.isSet),
        setItems: itemForm.isSet ? serializeSetItems(currentSetList) : null,
      };
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Xəta baş verdi');
        return;
      }
      if (payload.isFeatured) {
        setHeroDishId(data.item.id);
        setItems(its => its.map(x => ({
          ...(x.id === (editItem ? editItem.id : data.item.id) ? data.item : x),
          isFeatured: x.id === data.item.id,
        })));
      } else if (editItem) {
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

  const setAsHeroDish = async (itemId: string | null) => {
    if (!orgId) return;
    setSettingHero(itemId ?? 'clear');
    try {
      const res = await fetch(`/api/organizations/${orgId}/menu/hero-dish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (res.ok) {
        setHeroDishId(itemId);
        setItems(prev => prev.map(item => ({
          ...item,
          isFeatured: item.id === itemId,
        })));
        setShowHeroPickerModal(false);
      } else {
        alert(data.error || 'Xəta baş verdi');
      }
    } catch (e: any) {
      alert(e?.message || 'Xəta baş verdi');
    } finally {
      setSettingHero(null);
    }
  };

  const deleteItem = async (id: string, _catId: string) => {
    if (!orgId || !confirm('Yemək silinsin?')) return;
    await fetch(`/api/organizations/${orgId}/menu/items/${id}`, { method: 'DELETE' });
    setItems(its => its.filter(x => x.id !== id));
    if (heroDishId === id) setHeroDishId(null);
  };

  const importJson = async () => {
    if (!orgId || !jsonText.trim()) return;
    setJsonError('');
    setJsonSuccess('');
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError('JSON formatı yanlışdır. Zəhmət olmasa yoxlayın.');
      return;
    }
    if (!parsed.categories || !Array.isArray(parsed.categories)) {
      setJsonError('"categories" massivi tələb olunur.');
      return;
    }
    setJsonImporting(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/menu/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, mode: jsonMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJsonError(data.error || 'Xəta baş verdi');
        return;
      }
      setJsonSuccess(`✅ ${data.createdCategories} kateqoriya, ${data.createdItems} yemək idxal edildi.`);
      // Reload data
      const [cats, its] = await Promise.all([
        fetch(`/api/organizations/${orgId}/menu/categories`).then(r => r.json()),
        fetch(`/api/organizations/${orgId}/menu/items`).then(r => r.json()),
      ]);
      setCategories(cats.categories || []);
      setItems(its.items || []);
      if (cats.categories?.[0]) setActiveCategory(cats.categories[0].id);
      setJsonText('');
    } catch (e: any) {
      setJsonError(e?.message || 'Xəta baş verdi');
    } finally {
      setJsonImporting(false);
    }
  };

  const JSON_EXAMPLE = JSON.stringify({
    categories: [
      {
        name: 'Şorbalar',
        description: 'İsti şorbalar',
        isVisible: true,
        items: [
          {
            name: 'Düşbərə',
            description: 'Ənənəvi Azərbaycan şorbası',
            price: 8.5,
            discountPrice: null,
            image: 'https://example.com/dushbara.jpg',
            ingredients: 'Un, ət, soğan',
            portionSize: '350ml',
            allergens: 'Gluten',
            prepTime: '15 dəq',
            isFeatured: false,
            isNew: true,
            isPopular: false,
            isVisible: true,
          },
        ],
      },
      {
        name: 'Əsas Yemeklər',
        isVisible: true,
        items: [
          {
            name: 'Lülə Kabab',
            price: 12,
            discountPrice: 10,
            isPopular: true,
            isNew: false,
            isVisible: true,
          },
        ],
      },
    ],
  }, null, 2);

  const catItems = items.filter(i => i.categoryId === activeCategory);
  const currentHeroItem = items.find(i => i.id === heroDishId) || items.find(i => i.isFeatured) || null;
  const currentHeroCategory = currentHeroItem ? categories.find(c => c.id === currentHeroItem.categoryId) : null;

  const filteredPickerItems = items.filter(it => {
    if (!heroSearchQuery.trim()) return true;
    const q = heroSearchQuery.toLowerCase();
    const cat = categories.find(c => c.id === it.categoryId);
    return it.name.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
  });

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setShowJsonModal(true); setJsonError(''); setJsonSuccess(''); }}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <FileJson size={15} /> JSON idxal
          </button>
          <button onClick={() => openCatModal()} className="dash-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Kateqoriya əlavə et
          </button>
        </div>
      </div>

      {/* Günün Sevimli Təamı (Başlıq Kartı) Bloku */}
      <div
        className="dash-card"
        style={{
          padding: '16px 20px',
          marginBottom: 24,
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(20, 22, 26, 0.95) 100%)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 260, flex: 1 }}>
          {currentHeroItem?.image ? (
            <img
              src={currentHeroItem.image}
              alt={currentHeroItem.name}
              style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(245, 158, 11, 0.4)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 60, height: 60, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={24} color="#FBBF24" />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FBBF24', background: 'rgba(251, 191, 36, 0.15)', padding: '2px 8px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={11} fill="#FBBF24" /> Günün Sevimli Təamı (Başlıq Kartı)
              </span>
              {currentHeroCategory && (
                <span style={{ fontSize: 12, color: '#8888A0' }}>· {currentHeroCategory.name}</span>
              )}
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#F7F8F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentHeroItem ? currentHeroItem.name : 'Təyin edilməyib'}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9BA3AF' }}>
              {currentHeroItem
                ? `${(currentHeroItem.discountPrice || currentHeroItem.price).toFixed(2)} ${currency} · Saytın ana səhifəsindəki başlıq kartında göstərilir`
                : 'Saytın ana səhifəsindəki başlıq kartında göstəriləcək yeməyi buradan seçin'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowHeroPickerModal(true)}
            className="dash-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              background: '#F59E0B',
              borderColor: '#D97706',
              color: '#000',
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            {currentHeroItem ? 'Yeməyi Dəyiş' : 'Yemək Seç'}
          </button>
          {currentHeroItem && (
            <button
              type="button"
              onClick={() => setAsHeroDish(null)}
              disabled={settingHero === 'clear'}
              className="dash-btn-secondary"
              style={{ padding: '8px 12px', fontSize: 13, color: '#8888A0' }}
              title="Günün təamı seçimini sıfırla"
            >
              {settingHero === 'clear' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sıfırla'}
            </button>
          )}
        </div>
      </div>

      <div className="dash-menu-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => openItemModal(undefined, true)}
                    className="dash-btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#FBBF24',
                    }}
                  >
                    🍱 + Yemək Seti yarat
                  </button>
                  <button onClick={() => openItemModal(undefined, false)} className="dash-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Plus size={14} /> Yemək əlavə et
                  </button>
                </div>
              </div>

              {/* Filter pills: Hamısı / Tək Yeməklər / Setlər */}
              {catItems.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[
                    { id: 'all', label: `Hamısı (${catItems.length})` },
                    { id: 'single', label: `Tək Yeməklər (${catItems.filter(i => !i.isSet).length})` },
                    { id: 'sets', label: `🍱 Yemək Setləri (${catItems.filter(i => i.isSet).length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMenuFilter(tab.id as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        border: menuFilter === tab.id ? '1px solid #7C5CFC' : '1px solid #2A2A3A',
                        background: menuFilter === tab.id ? 'rgba(124, 92, 252, 0.2)' : 'rgba(255,255,255,0.02)',
                        color: menuFilter === tab.id ? '#A78BFA' : '#8888A0',
                        cursor: 'pointer',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

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
                    {catItems.filter(item => {
                      if (menuFilter === 'single') return !item.isSet;
                      if (menuFilter === 'sets') return !!item.isSet;
                      return true;
                    }).map((item) => (
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
                            {item.isSet && (
                              <span style={{ background: 'rgba(245,158,11,0.2)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.4)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                🍱 YEMƏK SETİ
                              </span>
                            )}
                            {(item.id === currentHeroItem?.id || item.isFeatured) && (
                              <span style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(229,169,60,0.35))', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.5)', fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Star size={10} fill="#FBBF24" /> Başlıq Kartı
                              </span>
                            )}
                            {item.isNew && <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', fontSize: 10, padding: '1px 6px', borderRadius: 100 }}>Yeni</span>}
                            {item.isPopular && <span style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', fontSize: 10, padding: '1px 6px', borderRadius: 100 }}>Populyar</span>}
                            {item.video && <span style={{ background: 'rgba(255,159,28,0.18)', color: '#FF9F1C', fontSize: 10, padding: '1px 6px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 3 }}>🎬 Video</span>}
                          </div>
                          {item.description && <p style={{ fontSize: 12, color: '#8888A0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>}
                          {item.isSet && item.setItems && (
                            <div style={{ marginTop: 4, fontSize: 11, color: '#FCD34D', background: 'rgba(245,158,11,0.08)', padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
                              <span style={{ fontWeight: 600 }}>Tərkib:</span> {formatSetSummary(item.setItems)}
                            </div>
                          )}
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
                          {item.id === currentHeroItem?.id || item.isFeatured ? (
                            <button
                              type="button"
                              disabled
                              title="Günün Sevimli Təamı kimi seçilib"
                              style={{
                                border: '1px solid rgba(251,191,36,0.5)',
                                background: 'rgba(251,191,36,0.15)',
                                color: '#FBBF24',
                                padding: '6px 10px',
                                borderRadius: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'default',
                              }}
                            >
                              <Check size={13} /> Günün Təamı
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAsHeroDish(item.id)}
                              disabled={settingHero === item.id}
                              title="Bu yeməyi saytın başlıq kartında Günün Sevimli Təamı et"
                              style={{
                                border: '1px solid rgba(251,191,36,0.3)',
                                background: 'rgba(251,191,36,0.05)',
                                color: '#FBBF24',
                                cursor: 'pointer',
                                padding: '6px 10px',
                                borderRadius: 8,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {settingHero === item.id ? (
                                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <Star size={13} />
                              )}
                              Günün Təamı et
                            </button>
                          )}
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
                {/* Mode Selector: Tək Yemək vs Yemək Seti */}
                <div style={{ padding: 4, background: '#12141C', borderRadius: 12, border: '1px solid #2A2A3A', display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setItemForm(p => ({ ...p, isSet: false }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: !itemForm.isSet ? '#7C5CFC' : 'transparent',
                      color: !itemForm.isSet ? '#FFF' : '#8888A0',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    🍽️ Tək Yemək
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemForm(p => ({ ...p, isSet: true }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: itemForm.isSet ? 'linear-gradient(135deg, #D97706, #F59E0B)' : 'transparent',
                      color: itemForm.isSet ? '#FFF' : '#8888A0',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    🍱 Yemək Seti / Kombo
                  </button>
                </div>

                {/* Set Items Builder Section (shown only when isSet is true) */}
                {itemForm.isSet && (
                  <div
                    style={{
                      padding: 16,
                      background: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#FCD34D' }}>
                          🍱 Setə Daxil Olan Məhsullar ({currentSetList.length})
                        </span>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9BA3AF' }}>
                          Menyudakı mövcud təamlardan seçin və ya sərbəst yemək/içki adı əlavə edin.
                        </p>
                      </div>
                      {currentSetList.length > 0 && (() => {
                        const sumPrice = currentSetList.reduce((acc, cur) => acc + (cur.price ? cur.price * (Number(cur.quantity) || 1) : 0), 0);
                        return sumPrice > 0 ? (
                          <div style={{ fontSize: 11, color: '#A78BFA', textAlign: 'right' }}>
                            <span>Ayrı-ayrı: {sumPrice.toFixed(2)} {currency}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Quick Add from Existing Menu Items */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <select
                        className="dash-input"
                        style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
                        value={quickDishSelect}
                        onChange={(e) => setQuickDishSelect(e.target.value)}
                      >
                        <option value="">-- Menyudan yemək seçin --</option>
                        {items
                          .filter(it => !it.isSet && it.id !== editItem?.id)
                          .map(it => (
                            <option key={it.id} value={it.id}>
                              {it.name} {it.price ? `(${it.price.toFixed(2)} ${currency})` : ''}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!quickDishSelect) return;
                          const found = items.find(it => it.id === quickDishSelect);
                          if (found) {
                            addDishToSet(found.name, found.portionSize, 1, found.price);
                            setQuickDishSelect('');
                          }
                        }}
                        disabled={!quickDishSelect}
                        className="dash-btn-secondary"
                        style={{ padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
                      >
                        + Əlavə et
                      </button>
                    </div>

                    {/* Custom Item Quick Input (e.g. Cola 0.5L, Çörək, Sous) */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                      <input
                        className="dash-input"
                        style={{ flex: 2, fontSize: 12, padding: '7px 10px' }}
                        value={customSetDishName}
                        onChange={(e) => setCustomSetDishName(e.target.value)}
                        placeholder="və ya sərbəst: Məs: Coca-Cola 0.5L, Sous"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (customSetDishName.trim()) {
                              addDishToSet(customSetDishName, customSetDishPortion, customSetDishQty);
                              setCustomSetDishName('');
                              setCustomSetDishPortion('');
                              setCustomSetDishQty(1);
                            }
                          }
                        }}
                      />
                      <input
                        className="dash-input"
                        style={{ width: 80, fontSize: 12, padding: '7px 10px' }}
                        value={customSetDishPortion}
                        onChange={(e) => setCustomSetDishPortion(e.target.value)}
                        placeholder="Ölçü"
                      />
                      <input
                        className="dash-input"
                        type="number"
                        min="1"
                        style={{ width: 55, fontSize: 12, padding: '7px 8px', textAlign: 'center' }}
                        value={customSetDishQty}
                        onChange={(e) => setCustomSetDishQty(parseInt(e.target.value) || 1)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!customSetDishName.trim()) return;
                          addDishToSet(customSetDishName, customSetDishPortion, customSetDishQty);
                          setCustomSetDishName('');
                          setCustomSetDishPortion('');
                          setCustomSetDishQty(1);
                        }}
                        disabled={!customSetDishName.trim()}
                        className="dash-btn-secondary"
                        style={{ padding: '7px 12px', fontSize: 12 }}
                      >
                        +
                      </button>
                    </div>

                    {/* List of items currently in this Set */}
                    {currentSetList.length === 0 ? (
                      <div
                        style={{
                          padding: 14,
                          textAlign: 'center',
                          borderRadius: 8,
                          border: '1px dashed rgba(245, 158, 11, 0.3)',
                          color: '#9BA3AF',
                          fontSize: 12,
                        }}
                      >
                        Hələ heç bir təam əlavə olunmayıb. Yuxarıdakı seçimdən setə yeməklər əlavə edin.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {currentSetList.map((si, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: 'rgba(0,0,0,0.3)',
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {si.name}
                              </span>
                              {si.portion && (
                                <span style={{ fontSize: 11, color: '#8888A0' }}>({si.portion})</span>
                              )}
                              {si.price ? (
                                <span style={{ fontSize: 11, color: '#34D399' }}>({si.price.toFixed(2)} {currency})</span>
                              ) : null}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => updateSetItemQty(idx, (Number(si.quantity) || 1) - 1)}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  border: '1px solid #2A2A3A',
                                  background: 'rgba(255,255,255,0.05)',
                                  color: '#E8E8F0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#FCD34D', minWidth: 16, textAlign: 'center' }}>
                                {si.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateSetItemQty(idx, (Number(si.quantity) || 1) + 1)}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: 6,
                                  border: '1px solid #2A2A3A',
                                  background: 'rgba(255,255,255,0.05)',
                                  color: '#E8E8F0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                }}
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => removeDishFromSet(idx)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: '#F87171',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  marginLeft: 4,
                                }}
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="dash-label">{itemForm.isSet ? 'Set / Kombo adı *' : 'Yemək adı *'}</label>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: itemForm.isFeatured ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.03)',
                      border: itemForm.isFeatured ? '1px solid rgba(251,191,36,0.5)' : '1px solid #2A2A3A',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ marginTop: 3 }}
                      checked={!!itemForm.isFeatured}
                      onChange={(e) => setItemForm(p => ({ ...p, isFeatured: e.target.checked }))}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Star size={14} color="#FBBF24" fill={itemForm.isFeatured ? '#FBBF24' : 'none'} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#FBBF24' }}>Günün Sevimli Təamı (Başlıq Kartı)</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8888A0' }}>
                        Bu yemək saytın ana səhifəsindəki başlıq kartında (Hero) nümayiş etdiriləcək.
                      </p>
                    </div>
                  </label>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
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

      {/* Hero Dish Picker Modal */}
      <AnimatePresence>
        {showHeroPickerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setShowHeroPickerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#181A20',
                border: '1px solid #2A2E39',
                borderRadius: 18,
                padding: 24,
                width: '100%',
                maxWidth: 540,
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F7F8F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={18} color="#FBBF24" fill="#FBBF24" /> Günün Sevimli Təamını Seç
                  </h3>
                  <p style={{ fontSize: 12, color: '#8888A0', margin: '4px 0 0' }}>
                    Saytın ana səhifəsinin ən yuxarı kartında nümayiş etdiriləcək yemək.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHeroPickerModal(false)}
                  style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search box */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Search size={16} color="#8888A0" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="dash-input"
                  style={{ paddingLeft: 36 }}
                  placeholder="Yemək və ya kateqoriya axtar..."
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Dishes list */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                {filteredPickerItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#8888A0', fontSize: 13 }}>
                    Heç bir yemək tapılmadı
                  </div>
                ) : (
                  filteredPickerItems.map((it) => {
                    const isCurrent = it.id === currentHeroItem?.id || it.isFeatured;
                    const cat = categories.find(c => c.id === it.categoryId);
                    return (
                      <div
                        key={it.id}
                        onClick={() => setAsHeroDish(it.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          background: isCurrent ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.02)',
                          border: isCurrent ? '1px solid rgba(251,191,36,0.5)' : '1px solid #262933',
                          transition: 'all 0.15s',
                        }}
                      >
                        {it.image ? (
                          <img src={it.image} alt={it.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#252833', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <UtensilsCrossed size={18} color="#666" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#F7F8F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {it.name}
                            </span>
                            {cat && <span style={{ fontSize: 10, color: '#8888A0', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 4 }}>{cat.name}</span>}
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: 12, fontWeight: 600, color: '#FBBF24' }}>
                            {(it.discountPrice || it.price).toFixed(2)} {currency}
                          </p>
                        </div>
                        <div>
                          {isCurrent ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#FBBF24', fontSize: 12, fontWeight: 600 }}>
                              <Check size={14} /> Seçilib
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="dash-btn-secondary"
                              style={{ padding: '6px 12px', fontSize: 12, color: '#FBBF24', borderColor: 'rgba(251,191,36,0.3)' }}
                              disabled={settingHero === it.id}
                            >
                              {settingHero === it.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Seç'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTop: '1px solid #2A2E39' }}>
                <button
                  type="button"
                  onClick={() => setShowHeroPickerModal(false)}
                  className="dash-btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Bağla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JSON Import Modal */}
      <AnimatePresence>
        {showJsonModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowJsonModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#1A1A24', border: '1px solid #2A2A3A', borderRadius: 20, padding: 32, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileJson size={22} color="#7C5CFC" />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8E8F0' }}>JSON ilə Menyu İdxal</h3>
                </div>
                <button onClick={() => setShowJsonModal(false)} style={{ border: 'none', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* JSON Format Info */}
              <div style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#A78BFA', marginBottom: 8 }}>📋 JSON Quruluş Nümunəsi:</p>
                <pre style={{ fontSize: 11, color: '#9BA3AF', overflowX: 'auto', margin: 0, lineHeight: 1.6 }}>{JSON_EXAMPLE}</pre>
              </div>

              {/* Field Reference */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #2A2A3A', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#8888A0', marginBottom: 8 }}>Sahə izahları (items içində):</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: 11, color: '#8888A0' }}>
                  {[
                    ['name *', 'Yemək adı (məcburidir)'],
                    ['price', 'Qiymət (rekəm)'],
                    ['discountPrice', 'Endirimli qiymət'],
                    ['description', 'Təsvir'],
                    ['image', 'Şəkil URL'],
                    ['ingredients', 'Tərkib'],
                    ['allergens', 'Allergen məlumatı'],
                    ['portionSize', 'Porsiya ölçüsü'],
                    ['prepTime', 'Hazırlanma vaxtı'],
                    ['isNew', 'Yeni (true/false)'],
                    ['isPopular', 'Populyar (true/false)'],
                    ['isFeatured', 'Başlıq kartı (true/false)'],
                    ['isVisible', 'Görünür (default: true)'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 6 }}>
                      <code style={{ color: '#7C5CFC', fontWeight: 600 }}>{k}</code>
                      <span>— {v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode selector */}
              <div style={{ marginBottom: 16 }}>
                <label className="dash-label">İdxal rejimi</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setJsonMode('append')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: jsonMode === 'append' ? '1px solid #7C5CFC' : '1px solid #2A2A3A',
                      background: jsonMode === 'append' ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.02)',
                      color: jsonMode === 'append' ? '#A78BFA' : '#8888A0',
                    }}
                  >
                    ➕ Üstünə əlavə et
                  </button>
                  <button
                    type="button"
                    onClick={() => setJsonMode('replace')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: jsonMode === 'replace' ? '1px solid #F87171' : '1px solid #2A2A3A',
                      background: jsonMode === 'replace' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.02)',
                      color: jsonMode === 'replace' ? '#F87171' : '#8888A0',
                    }}
                  >
                    🔄 Mövcudu silib yenilə
                  </button>
                </div>
                {jsonMode === 'replace' && (
                  <p style={{ marginTop: 6, fontSize: 11, color: '#F87171' }}>⚠️ Bu rejim bütün mövcud kateqoriya və yeməkləri silir!</p>
                )}
              </div>

              {/* JSON Textarea */}
              <div style={{ marginBottom: 16 }}>
                <label className="dash-label">JSON mətn</label>
                <textarea
                  className="dash-input"
                  value={jsonText}
                  onChange={(e) => { setJsonText(e.target.value); setJsonError(''); setJsonSuccess(''); }}
                  placeholder={'{ "categories": [...] }'}
                  rows={12}
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12, marginTop: 6 }}
                />
              </div>

              {jsonError && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#F87171' }}>
                  ❌ {jsonError}
                </div>
              )}
              {jsonSuccess && (
                <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#34D399' }}>
                  {jsonSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowJsonModal(false)} className="dash-btn-secondary" style={{ flex: 1 }}>Ləğv et</button>
                <button
                  onClick={importJson}
                  disabled={jsonImporting || !jsonText.trim()}
                  className="dash-btn-primary"
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {jsonImporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
                  {jsonImporting ? 'İdxal edilir...' : 'İdxal et'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
