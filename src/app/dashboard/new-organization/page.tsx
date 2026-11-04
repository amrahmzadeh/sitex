'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Cloud,
  Dumbbell,
  GraduationCap,
  Hammer,
  HeartHandshake,
  HeartPulse,
  Home,
  Layers,
  LayoutTemplate,
  Loader2,
  MapPin,
  Newspaper,
  Palette,
  PenLine,
  Plane,
  Scale,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  SITE_CATEGORIES,
  getSiteCategory,
  getSiteSubcategory,
} from '@/config/site-categories';
import TemplatePicker from '@/components/dashboard/TemplatePicker';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'pen-line': PenLine,
  'building-2': Building2,
  'shopping-bag': ShoppingBag,
  'graduation-cap': GraduationCap,
  palette: Palette,
  wrench: Wrench,
  briefcase: Briefcase,
  newspaper: Newspaper,
  clapperboard: Clapperboard,
  users: Users,
  home: Home,
  plane: Plane,
  utensils: UtensilsCrossed,
  'heart-pulse': HeartPulse,
  'heart-handshake': HeartHandshake,
  sparkles: Sparkles,
  'calendar-days': CalendarDays,
  dumbbell: Dumbbell,
  'trending-up': TrendingUp,
  cloud: Cloud,
  'badge-check': BadgeCheck,
  hammer: Hammer,
  car: Car,
  scale: Scale,
  'layout-template': LayoutTemplate,
};

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Sayt növü', 'Alt kateqoriya', 'Təsdiq', 'Əsas məlumatlar', 'Əlaqə'];

interface CreatedSite {
  name: string;
  warning?: string;
  template?: { name: string; version: string; source: string } | null;
}

export default function NewOrganizationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    mapUrl: '',
  });
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [templateId, setTemplateId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [created, setCreated] = useState<CreatedSite | null>(null);

  const category = getSiteCategory(categoryId);
  const subcategory = getSiteSubcategory(categoryId, subcategoryId);
  const CategoryIcon = useMemo(
    () => (category ? CATEGORY_ICONS[category.icon] || Layers : Layers),
    [category]
  );

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const selectCategory = (id: string) => {
    setCategoryId(id);
    setSubcategoryId('');
    setTemplateId('');
    setError('');
  };

  const selectSubcategory = (id: string) => {
    setSubcategoryId(id);
    setTemplateId('');
    setError('');
  };

  const canContinue =
    (step === 1 && Boolean(categoryId)) ||
    (step === 2 && Boolean(subcategoryId)) ||
    (step === 3 && Boolean(categoryId) && Boolean(subcategoryId)) ||
    step === 4 ||
    step === 5;

  const goNext = () => {
    if (!canContinue) return;

    if (step === 1 && !categoryId) {
      setError('Davam etmək üçün sayt kateqoriyası seçin');
      return;
    }
    if (step === 2 && !subcategoryId) {
      setError('Davam etmək üçün alt kateqoriya seçin');
      return;
    }
    if (step === 4 && !form.name.trim()) {
      setError('Sayt adı tələb olunur');
      return;
    }

    setError('');
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Sayt adı tələb olunur');
      setStep(4);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          siteCategory: categoryId || null,
          siteSubcategory: subcategoryId || null,
          templateId: templateId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sayt yaradılarkən xəta baş verdi');
        return;
      }
      if (data.organization?.id) {
        localStorage.setItem('currentOrgId', data.organization.id);
      }

      if (data.templateWarning) {
        setCreated({
          name: form.name,
          warning: data.templateWarning,
          template: data.template || null,
        });
        setStep(6);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Şəbəkə xətası baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const maxWidth = step <= 3 ? 920 : 640;

  return (
    <div style={{ maxWidth, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', marginBottom: 6 }}>
          Yeni sayt yarat
        </h1>
        <p style={{ color: '#8888A0', margin: 0 }}>
          Sayt növünü seçin, sonra məlumatları doldurun
        </p>
      </div>

      {/* Addım göstəricisi */}
      <div style={{ marginBottom: 28 }}>
        <div className="wizard-steps" style={{ marginBottom: 8 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className="wizard-step-bar"
              data-active={step > index}
            />
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#8888A0', margin: 0 }}>
          {step <= TOTAL_STEPS
            ? `Addım ${step}/${TOTAL_STEPS} · ${STEP_LABELS[step - 1]}`
            : 'Tamamlandı'}
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', color: '#F87171', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="dash-card"
        style={{ padding: 28 }}
      >
        {step === 1 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,211,125,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} color="#00D37D" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  Sayt hansı məqsəd üçündür?
                </h2>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>
                  Kateqoriya saytın quruluşunu və tövsiyə olunan şablonları müəyyən edir
                </p>
              </div>
            </div>

            <div className="site-type-grid">
              {SITE_CATEGORIES.map((item) => {
                const Icon = CATEGORY_ICONS[item.icon] || LayoutTemplate;
                const selected = item.id === categoryId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="site-type-card"
                    data-selected={selected}
                    aria-pressed={selected}
                    onClick={() => selectCategory(item.id)}
                  >
                    <span className="site-type-card-icon">
                      <Icon size={18} />
                    </span>
                    <span className="site-type-card-title">{item.name}</span>
                    <span className="site-type-card-desc">{item.description}</span>
                    <span className="site-type-card-count">
                      {item.subcategories.length} alt kateqoriya
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: canContinue ? 1 : 0.5, cursor: canContinue ? 'pointer' : 'not-allowed' }}
              >
                Davam et <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 2 && category && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div className="site-type-card-icon" style={{ width: 40, height: 40 }}>
                <CategoryIcon size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  {category.name}
                </h2>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>
                  Bu kateqoriyaya ən uyğun alt növü seçin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', color: '#8888A0', fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 18 }}
            >
              <ChevronLeft size={14} /> Kateqoriyanı dəyiş
            </button>

            <div className="site-sub-grid" role="listbox" aria-label="Alt kateqoriyalar">
              {category.subcategories.map((item) => {
                const selected = item.id === subcategoryId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className="site-sub-chip"
                    data-selected={selected}
                    onClick={() => selectSubcategory(item.id)}
                  >
                    <span>{item.name}</span>
                    {selected && <Check size={15} />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={() => setStep(1)} className="dash-btn-secondary" style={{ flex: 1 }}>
                Geri
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className="dash-btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: canContinue ? 1 : 0.5, cursor: canContinue ? 'pointer' : 'not-allowed' }}
              >
                Seçimi təsdiqlə <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 3 && category && subcategory && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BadgeCheck size={20} color="#22D3EE" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  Seçimi təsdiqləyin
                </h2>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>
                  Seçilmiş sayt növü və şablon növbəti addımlara ötürüləcək
                </p>
              </div>
            </div>

            <div className="site-type-summary" style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="site-type-card-icon">
                  <CategoryIcon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: '#8888A0', margin: 0 }}>Kateqoriya</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                    {category.name}
                  </p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(0,211,125,0.2)', paddingTop: 10 }}>
                <p style={{ fontSize: 11, color: '#8888A0', margin: 0 }}>Alt kateqoriya</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>
                  {subcategory.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ alignSelf: 'flex-start', border: '1px solid rgba(0,211,125,0.35)', background: 'transparent', color: '#00D37D', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
              >
                Seçimi dəyiş
              </button>
            </div>

            <TemplatePicker
              key={`${categoryId}/${subcategoryId}`}
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              value={templateId}
              onChange={setTemplateId}
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setStep(2)} className="dash-btn-secondary" style={{ flex: 1 }}>
                Geri
              </button>
              <button
                type="button"
                onClick={goNext}
                className="dash-btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Təsdiqlə və davam et <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color="#00D37D" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>Əsas məlumatlar</h2>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>Sayt adı və təsviri</p>
              </div>
            </div>

            {category && subcategory && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,211,125,0.1)', border: '1px solid rgba(0,211,125,0.25)', borderRadius: 100, padding: '4px 10px', fontSize: 11, color: '#00D37D', marginBottom: 18 }}>
                <CategoryIcon size={12} />
                {category.name} / {subcategory.name}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="dash-label">Sayt adı *</label>
                <input className="dash-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Məs: Mənim Saytım" />
              </div>
              <div>
                <label className="dash-label">Qısa təsvir</label>
                <textarea
                  className="dash-input"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Saytınız haqqında qısa məlumat..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div>
                <label className="dash-label">E-poçt</label>
                <input className="dash-input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="sayt@example.com" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={() => setStep(3)} className="dash-btn-secondary" style={{ flex: 1 }}>
                Geri
              </button>
              <button
                type="button"
                onClick={goNext}
                className="dash-btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Növbəti <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="#22D3EE" />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#E8E8F0', margin: 0 }}>Əlaqə &amp; Ünvan</h2>
                <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>İstəyə bağlı, sonra da doldura bilərsiniz</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label className="dash-label">Telefon</label>
                  <input className="dash-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+994 50 000 00 00" />
                </div>
                <div>
                  <label className="dash-label">Şəhər</label>
                  <input className="dash-input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Bakı" />
                </div>
              </div>
              <div>
                <label className="dash-label">Ünvan</label>
                <input className="dash-input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Küçə, ev, mənzil..." />
              </div>
              <div>
                <label className="dash-label">Google Maps linki</label>
                <input className="dash-input" value={form.mapUrl} onChange={(e) => set('mapUrl', e.target.value)} placeholder="https://maps.google.com/..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={() => setStep(4)} className="dash-btn-secondary" style={{ flex: 1 }}>
                Geri
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="dash-btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
              >
                {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                Saytı yarat
              </button>
            </div>
          </>
        )}

        {step === 6 && created && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} color="#34D399" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#E8E8F0', margin: 0 }}>
                “{created.name}” yaradıldı
              </h2>
              <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>
                Seçilmiş sayt növü və tema yeni sayta tətbiq olundu.
              </p>
              {created.warning && (
                <div style={{ width: '100%', textAlign: 'left', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '10px 14px', color: '#FBBF24', fontSize: 12 }}>
                  {created.warning}
                </div>
              )}
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="dash-btn-primary"
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                Davam et <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
