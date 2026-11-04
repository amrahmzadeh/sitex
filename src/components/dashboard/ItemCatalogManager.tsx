'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Loader2,
  Tag, DollarSign, Eye, EyeOff, Star, Flame, Sparkles, Upload, ChevronDown, Film,
  Search, Check, Briefcase, Package, ArrowRight, ToggleLeft, ToggleRight, UtensilsCrossed
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  isVisible: boolean;
  sortOrder: number;
  _count?: { menuItems: number };
}

interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  image?: string;
  video?: string;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  isVisible: boolean;
  portionSize?: string;
  prepTime?: string;
}

interface ItemCatalogManagerProps {
  type: 'services' | 'products';
}

function useCurrentOrg() {
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) {
      setOrgId(saved);
      return;
    }
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.[0]) {
          setOrgId(d.organizations[0].id);
          localStorage.setItem('currentOrgId', d.organizations[0].id);
        }
      });
  }, []);
  return orgId;
}

export default function ItemCatalogManager({ type }: ItemCatalogManagerProps) {
  const router = useRouter();
  const orgId = useCurrentOrg();
  const isServices = type === 'services';

  const title = isServices ? 'Xidmətlər' : 'Məhsullar';
  const itemSingular = isServices ? 'Xidmət' : 'Məhsul';
  const Icon = isServices ? Briefcase : Package;

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currency, setCurrency] = useState('AZN');
  const [searchQuery, setSearchQuery] = useState('');

  // Products enabled state
  const [productsActive, setProductsActive] = useState(false);
  const [togglingProducts, setTogglingProducts] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [togglingMenu, setTogglingMenu] = useState(false);

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);

  const [catForm, setCatForm] = useState({ name: '', description: '', isVisible: true });
  const [itemForm, setItemForm] = useState<Partial<Item> & { categoryId: string }>({
    name: '',
    price: 0,
    categoryId: '',
    isVisible: true,
    isFeatured: false,
    isNew: false,
    isPopular: false,
    video: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Check product activation state
  useEffect(() => {
    if (!orgId) return;
    const local = localStorage.getItem(`site_${orgId}_products_enabled`);
    if (local === 'true') {
      setProductsActive(true);
    } else if (local === 'false') {
      setProductsActive(false);
    }
    const localMenu = localStorage.getItem(`site_${orgId}_menu_enabled`);
    if (localMenu === 'true') {
      setMenuActive(true);
    } else if (localMenu === 'false') {
      setMenuActive(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/organizations/${orgId}/menu/categories`).then((r) => r.json()),
      fetch(`/api/organizations/${orgId}/menu/items`).then((r) => r.json()),
      fetch(`/api/organizations/${orgId}`).then((r) => r.json()),
    ])
      .then(([cats, its, org]) => {
        const orgData = org.organization;
        if (orgData) {
          if (orgData.currency) setCurrency(orgData.currency);
          const draft = orgData.website?.draftTheme as any;
          const isProd =
            draft?.productsEnabled === true ||
            draft?.hasProducts === true ||
            localStorage.getItem(`site_${orgId}_products_enabled`) === 'true';
          setProductsActive(Boolean(isProd));
          const isMenu =
            draft?.menuEnabled === true ||
            draft?.hasMenu === true ||
            localStorage.getItem(`site_${orgId}_menu_enabled`) === 'true';
          setMenuActive(Boolean(isMenu));
        }
        setCategories(cats.categories || []);
        setItems(its.items || []);
        if (cats.categories?.[0]) setActiveCategory(cats.categories[0].id);
      })
      .finally(() => setLoading(false));
  }, [orgId]);

  const toggleProductsModule = async () => {
    if (!orgId) return;
    setTogglingProducts(true);
    const nextState = !productsActive;
    try {
      localStorage.setItem(`site_${orgId}_products_enabled`, nextState ? 'true' : 'false');
      localStorage.setItem(`products_enabled_${orgId}`, nextState ? 'true' : 'false');
      setProductsActive(nextState);

      // Save to organization theme
      await fetch(`/api/organizations/${orgId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productsEnabled: nextState,
          hasProducts: nextState,
        }),
      }).catch(() => {});

      window.dispatchEvent(new Event('org-updated'));
      window.dispatchEvent(new Event('storage'));
      router.refresh();
    } finally {
      setTogglingProducts(false);
    }
  };

  const seedTemplateServices = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      // 1. Create or find category
      let catId = categories[0]?.id;
      if (!catId) {
        const catRes = await fetch(`/api/organizations/${orgId}/menu/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Əsas Xidmətlər',
            description: 'Peşəkar fərdi və korporativ xidmətlər',
            isVisible: true,
          }),
        });
        const catData = await catRes.json();
        if (catData?.category?.id) {
          catId = catData.category.id;
          setCategories([catData.category]);
          setActiveCategory(catId);
        }
      }

      if (!catId) return;

      const templateServices = [
        {
          name: 'Diksiya təlimləri',
          description: 'Düzgün tənəffüs, aydın artikulyasiya, nitq qüsurlarının aradan qaldırılması və səhnə qorxusuna qalib gəlmək texnikaları.',
          price: 150,
          portionSize: 'Tədris proqramı',
          prepTime: 'Fərdi və korporativ səviyyədə',
          isPopular: true,
          isFeatured: true,
          categoryId: catId,
        },
        {
          name: 'Tədbir aparıcılığı',
          description: 'Beynəlxalq forumlar, dövlət səviyyəli konfranslar, korporativ qala gecələri və nüfuzlu təqdimatların zərif idarə olunması.',
          price: 300,
          portionSize: 'Protokol və moderatorluq',
          prepTime: 'Dövlət və özəl tədbirlər, brend təqdimatları',
          isPopular: true,
          categoryId: catId,
        },
        {
          name: 'Peşəkar səsləndirmə',
          description: 'Radio və TV reklamları, korporativ imic filmləri, audio kitablar və sənədli layihələr üçün unikal tembr və diksiya.',
          price: 200,
          portionSize: 'Studiya keyfiyyəti',
          prepTime: 'Reklam çarxları, korporativ videolar və layihələr',
          isPopular: true,
          categoryId: catId,
        },
        {
          name: 'Brend siması',
          description: 'Nüfuzlu brendlərin imic çəkilişləri, sosial çarxlar və ictimaiyyətlə əlaqələr layihələrində estetik və inamlı təmsilçilik.',
          price: 500,
          portionSize: 'Brend əməkdaşlığı',
          prepTime: 'Yaradıcı vizual layihələr və reklam kampaniyaları',
          isNew: true,
          categoryId: catId,
        },
      ];

      for (const s of templateServices) {
        await fetch(`/api/organizations/${orgId}/menu/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
        });
      }

      // Reload
      const [catsRes, itemsRes] = await Promise.all([
        fetch(`/api/organizations/${orgId}/menu/categories`).then((r) => r.json()),
        fetch(`/api/organizations/${orgId}/menu/items`).then((r) => r.json()),
      ]);
      setCategories(catsRes.categories || []);
      setItems(itemsRes.items || []);
      if (catsRes.categories?.[0]) setActiveCategory(catsRes.categories[0].id);
    } finally {
      setSaving(false);
    }
  };

  const toggleMenuModule = async () => {
    if (!orgId) return;
    setTogglingMenu(true);
    const nextState = !menuActive;
    try {
      localStorage.setItem(`site_${orgId}_menu_enabled`, nextState ? 'true' : 'false');
      localStorage.setItem(`menu_enabled_${orgId}`, nextState ? 'true' : 'false');
      setMenuActive(nextState);

      await fetch(`/api/organizations/${orgId}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuEnabled: nextState,
          hasMenu: nextState,
        }),
      }).catch(() => {});

      window.dispatchEvent(new Event('org-updated'));
      window.dispatchEvent(new Event('storage'));
      router.refresh();
    } finally {
      setTogglingMenu(false);
    }
  };

  const openCatModal = (cat?: Category) => {
    setEditCategory(cat || null);
    setCatForm(
      cat
        ? { name: cat.name, description: cat.description || '', isVisible: cat.isVisible }
        : { name: '', description: '', isVisible: true }
    );
    setShowCatModal(true);
  };

  const saveCat = async () => {
    if (!orgId || !catForm.name) return;
    setSaving(true);
    try {
      const url = editCategory
        ? `/api/organizations/${orgId}/menu/categories/${editCategory.id}`
        : `/api/organizations/${orgId}/menu/categories`;
      const method = editCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      const data = await res.json();
      if (res.ok) {
        if (editCategory) {
          setCategories((c) =>
            c.map((x) => (x.id === editCategory.id ? { ...x, ...data.category } : x))
          );
        } else {
          setCategories((c) => [...c, { ...data.category, _count: { menuItems: 0 } }]);
          setActiveCategory(data.category.id);
        }
        setShowCatModal(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteCat = async (id: string) => {
    if (!orgId || !confirm(`Kateqoriya silinsin? Bütün ${itemSingular.toLowerCase()}lər də silinəcək.`))
      return;
    await fetch(`/api/organizations/${orgId}/menu/categories/${id}`, { method: 'DELETE' });
    setCategories((c) => c.filter((x) => x.id !== id));
    if (activeCategory === id) setActiveCategory(categories.find((x) => x.id !== id)?.id || null);
  };

  const openItemModal = (item?: Item) => {
    setEditItem(item || null);
    setItemForm(
      item
        ? {
            ...item,
            video: item.video || '',
            portionSize: item.portionSize || '',
            prepTime: item.prepTime || '',
          }
        : {
            name: '',
            price: 0,
            categoryId: activeCategory || (categories[0]?.id || ''),
            isVisible: true,
            isFeatured: false,
            isNew: false,
            isPopular: false,
            portionSize: '',
            prepTime: '',
            video: '',
          }
    );
    setShowItemModal(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`/api/organizations/${orgId}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setItemForm((p) => ({ ...p, image: data.url }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploadingVideo(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`/api/organizations/${orgId}/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setItemForm((p) => ({ ...p, video: data.url }));
    } finally {
      setUploadingVideo(false);
    }
  };

  const saveItem = async () => {
    if (!orgId || !itemForm.name || !itemForm.categoryId) return;
    setSaving(true);
    try {
      const url = editItem
        ? `/api/organizations/${orgId}/menu/items/${editItem.id}`
        : `/api/organizations/${orgId}/menu/items`;
      const method = editItem ? 'PATCH' : 'POST';
      const payload = {
        name: itemForm.name,
        description: itemForm.description || null,
        price: Number(itemForm.price) || 0,
        discountPrice: itemForm.discountPrice ? Number(itemForm.discountPrice) : null,
        categoryId: itemForm.categoryId,
        image: itemForm.image || null,
        video: itemForm.video || null,
        isFeatured: itemForm.isFeatured || false,
        isNew: itemForm.isNew || false,
        isPopular: itemForm.isPopular || false,
        isVisible: itemForm.isVisible !== false,
        portionSize: itemForm.portionSize || null,
        prepTime: itemForm.prepTime || null,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (editItem) {
          setItems((its) => its.map((x) => (x.id === editItem.id ? { ...x, ...data.item } : x)));
        } else {
          setItems((its) => [...its, data.item]);
        }
        setShowItemModal(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!orgId || !confirm(`${itemSingular} silinsin?`)) return;
    await fetch(`/api/organizations/${orgId}/menu/items/${id}`, { method: 'DELETE' });
    setItems((its) => its.filter((x) => x.id !== id));
  };

  const filteredItems = items.filter((it) => {
    const matchesCat = activeCategory ? it.categoryId === activeCategory : true;
    const matchesSearch = searchQuery
      ? it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (it.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#E8E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Icon size={28} color="#00D37D" /> {title}
          </h1>
          <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>
            {isServices
              ? 'Saytınızın təklif etdiyi xidmətlər və kateqoriyalar'
              : 'Satış və ya təqdimat üçün məhsullarınız'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Toggle Products Button */}
          {isServices && (
            <button
              onClick={toggleProductsModule}
              disabled={togglingProducts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: productsActive ? 'rgba(0,211,125,0.15)' : '#231F20',
                border: productsActive ? '1px solid rgba(0,211,125,0.4)' : '1px solid #383334',
                color: productsActive ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title="Sidebar-da Məhsullar bölməsini aktiv və ya deaktiv edin"
            >
              {productsActive ? <ToggleRight size={18} color="#00D37D" /> : <ToggleLeft size={18} />}
              {productsActive ? 'Məhsullar Aktivdir' : '+ Məhsullar Bölməsini Aktiv Et'}
            </button>
          )}

          {/* Toggle Menu Button (Müəssisə / Otel saytlarında menyu) */}
          {isServices && (
            <button
              onClick={toggleMenuModule}
              disabled={togglingMenu}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: menuActive ? 'rgba(0,211,125,0.15)' : '#231F20',
                border: menuActive ? '1px solid rgba(0,211,125,0.4)' : '1px solid #383334',
                color: menuActive ? '#00D37D' : '#8888A0',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title="Sidebar-da və saytda Menyu bölməsini aktiv və ya deaktiv edin"
            >
              {menuActive ? <ToggleRight size={18} color="#00D37D" /> : <ToggleLeft size={18} />}
              {menuActive ? 'Menyu Aktivdir' : '+ Menyu Bölməsini Aktiv Et'}
            </button>
          )}

          {isServices && menuActive && (
            <button
              onClick={() => router.push('/dashboard/menu')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: '#231F20',
                border: '1px solid #383334',
                color: '#E8E8F0',
                cursor: 'pointer',
              }}
            >
              <UtensilsCrossed size={16} color="#00D37D" /> Menyuya Keç
            </button>
          )}

          {!isServices && (
            <button
              onClick={() => router.push('/dashboard/services')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 14px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: '#231F20',
                border: '1px solid #383334',
                color: '#E8E8F0',
                cursor: 'pointer',
              }}
            >
              <Briefcase size={16} color="#00D37D" /> Xidmətlərə Keç
            </button>
          )}

          <button
            onClick={() => openCatModal()}
            className="dash-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Plus size={16} /> Kateqoriya əlavə et
          </button>

          {isServices && (
            <button
              onClick={seedTemplateServices}
              disabled={saving}
              className="dash-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, borderColor: '#E5A93C' }}
              title="Şablon xidmətlərini (Diksiya təlimləri, Tədbir aparıcılığı, Peşəkar səsləndirmə, Brend siması) əlavə et"
            >
              <Sparkles size={16} color="#E5A93C" /> Şablon Xidmətlərini Yüklə
            </button>
          )}

          <button
            onClick={() => openItemModal()}
            className="dash-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
          >
            <Plus size={16} /> Yeni {itemSingular.toLowerCase()}
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: activeCategory === null ? '#00D37D' : '#231F20',
              color: activeCategory === null ? '#000000' : '#E8E8F0',
              transition: 'all 0.15s',
            }}
          >
            Hamısı ({items.length})
          </button>

          {categories.map((cat) => {
            const count = items.filter((x) => x.categoryId === cat.id).length;
            const isSelected = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: isSelected ? 'rgba(0,211,125,0.15)' : '#231F20',
                  border: isSelected ? '1px solid rgba(0,211,125,0.4)' : '1px solid #383334',
                  borderRadius: 20,
                  padding: '2px 6px 2px 12px',
                  gap: 6,
                }}
              >
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 13,
                    color: isSelected ? '#00D37D' : '#E8E8F0',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                    padding: '5px 0',
                  }}
                >
                  {cat.name} <span style={{ opacity: 0.6, fontSize: 11 }}>({count})</span>
                </button>
                <button
                  onClick={() => openCatModal(cat)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8888A0',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title="Redaktə et"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteCat(cat.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#F87171',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                  title="Sil"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: 200 }}>
          <Search
            size={16}
            color="#8888A0"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dash-input"
            style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#8888A0' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p>Yüklənir...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className="dash-card"
          style={{ padding: 48, textAlign: 'center', color: '#8888A0', borderRadius: 16 }}
        >
          <Icon size={48} color="#383334" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 17, color: '#E8E8F0', marginBottom: 6 }}>
            Heç bir {itemSingular.toLowerCase()} tapılmadı
          </h3>
          <p style={{ fontSize: 13, marginBottom: 20 }}>
            {categories.length === 0
              ? `Başlamaq üçün əvvəlcə bir kateqoriya əlavə edin, sonra ${itemSingular.toLowerCase()}lərinizi daxil edin.`
              : `Bu kateqoriyaya yeni ${itemSingular.toLowerCase()} əlavə edin.`}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {categories.length === 0 && (
              <button onClick={() => openCatModal()} className="dash-btn-secondary">
                <Plus size={16} /> Kateqoriya əlavə et
              </button>
            )}
            <button onClick={() => openItemModal()} className="dash-btn-primary">
              <Plus size={16} /> Yeni {itemSingular.toLowerCase()}
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="dash-card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 14,
                position: 'relative',
              }}
            >
              {item.image && (
                <div
                  style={{
                    height: 160,
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 12,
                    background: '#231F20',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  {item.name}
                </h4>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#00D37D', margin: 0 }}>
                    {item.price} {currency}
                  </p>
                  {item.discountPrice && (
                    <p style={{ fontSize: 12, color: '#8888A0', textDecoration: 'line-through', margin: 0 }}>
                      {item.discountPrice} {currency}
                    </p>
                  )}
                </div>
              </div>

              {item.description && (
                <p
                  style={{
                    fontSize: 13,
                    color: '#8888A0',
                    margin: '8px 0 12px',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>
              )}

              {/* Badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
                {item.isFeatured && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(251,191,36,0.15)',
                      color: '#FBBF24',
                    }}
                  >
                    ★ Xüsusi
                  </span>
                )}
                {item.isPopular && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(239,68,68,0.15)',
                      color: '#EF4444',
                    }}
                  >
                    🔥 Populyar
                  </span>
                )}
                {item.isNew && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(59,130,246,0.15)',
                      color: '#3B82F6',
                    }}
                  >
                    ✦ Yeni
                  </span>
                )}
                {!item.isVisible && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(136,136,160,0.15)',
                      color: '#8888A0',
                    }}
                  >
                    Gizli
                  </span>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid #2E292A',
                }}
              >
                <button
                  onClick={() => openItemModal(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: '#231F20',
                    border: '1px solid #383334',
                    color: '#E8E8F0',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Pencil size={12} /> Redaktə
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#F87171',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} /> Sil
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {showCatModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: 16,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="dash-card"
              style={{ width: '100%', maxWidth: 440, padding: 24, borderRadius: 16 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  {editCategory ? 'Kateqoriyanı redaktə et' : 'Yeni kateqoriya'}
                </h3>
                <button
                  onClick={() => setShowCatModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="dash-label">Kateqoriya adı *</label>
                  <input
                    type="text"
                    value={catForm.name}
                    onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Məsələn: Əsas xidmətlər"
                    className="dash-input"
                  />
                </div>
                <div>
                  <label className="dash-label">Təsvir (istəyə bağlı)</label>
                  <textarea
                    rows={3}
                    value={catForm.description}
                    onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                    className="dash-input"
                    placeholder="Qısa məlumat..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    onClick={() => setShowCatModal(false)}
                    className="dash-btn-secondary"
                    type="button"
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={saveCat}
                    disabled={saving || !catForm.name}
                    className="dash-btn-primary"
                    type="button"
                  >
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    Saxla
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: 16,
              overflowY: 'auto',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="dash-card"
              style={{ width: '100%', maxWidth: 540, padding: 24, borderRadius: 16 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  {editItem ? `${itemSingular} redaktə et` : `Yeni ${itemSingular.toLowerCase()}`}
                </h3>
                <button
                  onClick={() => setShowItemModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="dash-label">{itemSingular} adı *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder={`Məsələn: ${isServices ? 'Diaqnostika və konsultasiya' : 'Standart dəst'}`}
                    className="dash-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">Qiymət ({currency}) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.price || ''}
                      onChange={(e) => setItemForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">Endirimli Qiymət</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.discountPrice || ''}
                      onChange={(e) =>
                        setItemForm((p) => ({
                          ...p,
                          discountPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        }))
                      }
                      className="dash-input"
                      placeholder="İstəyə bağlı"
                    />
                  </div>
                </div>

                <div>
                  <label className="dash-label">Kateqoriya *</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="dash-input"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="dash-label">Təsvir</label>
                  <textarea
                    rows={3}
                    value={itemForm.description || ''}
                    onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))}
                    className="dash-input"
                    placeholder="Qısa məlumat..."
                  />
                </div>

                {/* Service Tag & Badge (portionSize & prepTime) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label">{isServices ? 'Alt Qeyd / Teq' : 'Porsiya / Çəki'}</label>
                    <input
                      type="text"
                      value={itemForm.portionSize || ''}
                      onChange={(e) => setItemForm((p) => ({ ...p, portionSize: e.target.value }))}
                      placeholder={isServices ? 'Məsələn: Tədris proqramı' : 'Məsələn: 350 qr'}
                      className="dash-input"
                    />
                  </div>
                  <div>
                    <label className="dash-label">{isServices ? 'Üst Nişan / Mətn' : 'Hazırlanma Vaxtı'}</label>
                    <input
                      type="text"
                      value={itemForm.prepTime || ''}
                      onChange={(e) => setItemForm((p) => ({ ...p, prepTime: e.target.value }))}
                      placeholder={isServices ? 'Məsələn: Fərdi və korporativ səviyyədə' : 'Məsələn: 20 dəq'}
                      className="dash-input"
                    />
                  </div>
                </div>

                {/* Image upload */}
                <div>
                  <label className="dash-label">Şəkil</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadImage}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="dash-btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                    >
                      {uploadingImage ? (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <Upload size={14} />
                      )}
                      {itemForm.image ? 'Şəkli dəyiş' : 'Şəkil yüklə'}
                    </button>
                    {itemForm.image && (
                      <img
                        src={itemForm.image}
                        alt="Preview"
                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                      />
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#E8E8F0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemForm.isFeatured || false}
                      onChange={(e) => setItemForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    />
                    Xüsusi
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#E8E8F0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemForm.isPopular || false}
                      onChange={(e) => setItemForm((p) => ({ ...p, isPopular: e.target.checked }))}
                    />
                    Populyar
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#E8E8F0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemForm.isNew || false}
                      onChange={(e) => setItemForm((p) => ({ ...p, isNew: e.target.checked }))}
                    />
                    Yeni
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#E8E8F0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemForm.isVisible !== false}
                      onChange={(e) => setItemForm((p) => ({ ...p, isVisible: e.target.checked }))}
                    />
                    Aktivdir
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                  <button
                    onClick={() => setShowItemModal(false)}
                    className="dash-btn-secondary"
                    type="button"
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={saveItem}
                    disabled={saving || !itemForm.name || !itemForm.categoryId}
                    className="dash-btn-primary"
                    type="button"
                  >
                    {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                    Saxla
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
