'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseSetItems, formatSetSummary } from '@/lib/set-dishes';
import {
  Phone, MapPin, Clock, MessageCircle, X,
  ShoppingCart, Plus, Minus, Check, ArrowRight,
  ExternalLink, Sparkles, Utensils, Award, ChefHat, Bike, Menu, Share2,
  Camera, Images as ImagesIcon
} from 'lucide-react';
import { ThemeConfig, resolveBg } from '@/lib/themes';
import { formatPrice, formatWhatsAppUrl } from '@/lib/utils';
import { isFoodCategory, isEnterpriseServiceCategory, isMenuActive } from '@/modules/navigation';
import SplashScreen, { SplashConfig } from './SplashScreen';
import FoodVideoPlayer from './FoodVideoPlayer';
import { SocialIconsGroup } from './SocialIcons';
import SocialMediaFeed from './SocialMediaFeed';
import { useWorkingHours } from '@/hooks/useWorkingHours';
import { getResolvedSiteContent } from '@/lib/site-content-resolver';
import { OffHoursNotice } from '@/components/common/OffHoursNotice';
import type { SiteData } from './RestaurantSite';

export interface MenuItem {
  id: string;
  isSet?: boolean;
  setItems?: string | null;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  video?: string;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  ingredients?: string;
  allergens?: string;
  portionSize?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  isVisible: boolean;
  menuItems: MenuItem[];
}


const DAY_NAMES = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];

// Default food showcase image if none provided
const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80';
const FALLBACK_DISH_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

function ProReservationSection({
  organization,
  whatsapp,
  saffronGold,
  cardBackground,
  isOrdersPaused,
  offHoursNotice,
}: {
  organization: SiteData['organization'];
  whatsapp?: SiteData['whatsapp'];
  saffronGold: string;
  cardBackground: string;
  isOrdersPaused?: boolean;
  offHoursNotice?: string;
}) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', guests: '2', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);

    try {
      await fetch(`/api/site/${organization.slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.name.trim(),
          phone: form.phone.trim(),
          subject: 'Masa Rezervasiyası',
          service: `${form.guests} nəfər`,
          message: `Tarix: ${form.date || 'Təyin edilməyib'} | Saat: ${form.time || 'Təyin edilməyib'} | Qonaq sayı: ${form.guests} nəfər${form.notes ? ` | Qeyd: ${form.notes}` : ''}`,
          metadata: {
            type: 'RESERVATION',
            date: form.date,
            time: form.time,
            guests: form.guests,
            notes: form.notes,
          },
        }),
      });

      if (whatsapp?.isEnabled && whatsapp.phoneNumber) {
        const msg = `Rezervasiya tələbi:\nAd: ${form.name}\nTelefon: ${form.phone}\nTarix: ${form.date}\nSaat: ${form.time}\nQonaq sayı: ${form.guests}${form.notes ? `\nQeyd: ${form.notes}` : ''}`;
        const url = formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, msg);
        window.open(url, '_blank');
      }

      setSubmitted(true);
      setForm({ name: '', phone: '', date: '', time: '', guests: '2', notes: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Reservation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: '#16181b',
    color: '#F7F8F9',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#B0B0B8',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <section
      id="rezervasiya"
      className="pro-section-padding"
      style={{
        padding: '90px 0',
        position: 'relative',
        backgroundColor: '#111315',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(229, 169, 60, 0.1)',
              border: '1px solid rgba(229, 169, 60, 0.3)',
              padding: '6px 14px',
              borderRadius: 9999,
              marginBottom: 14,
            }}
          >
            <Clock size={14} color={saffronGold} />
            <span style={{ fontSize: 12, fontWeight: 700, color: saffronGold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              MASA REZERVASIYASI
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              color: '#F7F8F9',
              margin: '0 0 12px',
            }}
          >
            Masanızı Əvvəlcədən Ayırın
          </h2>
          <p style={{ color: '#9BA3AF', fontSize: 16, margin: 0 }}>
            Rahat və sürətli rezervasiya sistemi ilə masanızı əvvəlcədən təmin edin
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: `${cardBackground}E6`,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: 'clamp(24px, 4vw, 40px)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div>
              <label style={labelStyle}>Ad, Soyad *</label>
              <input required style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Adınız və Soyadınız" />
            </div>
            <div>
              <label style={labelStyle}>Telefon *</label>
              <input required style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+994 XX XXX XX XX" />
            </div>
            <div>
              <label style={labelStyle}>Tarix *</label>
              <input required type="date" style={inputStyle} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Saat *</label>
              <input required type="time" style={inputStyle} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Qonaq sayı</label>
              <select style={inputStyle} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '10+'].map((n) => (
                  <option key={n} value={n} style={{ background: '#16181b', color: '#F7F8F9' }}>
                    {n} nəfər
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Qeyd (İxtiyari)</label>
              <input style={inputStyle} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Xüsusi tələblər və ya istəklər" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 28,
              width: '100%',
              backgroundColor: saffronGold,
              color: '#111315',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 6px 20px ${saffronGold}40`,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Göndərilir...' : submitted ? '✓ Rezervasiya qəbul edildi!' : 'Masanı Ayır'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function ProRestaurantSite({
  data,
  theme,
  table: propTable,
}: {
  data: SiteData;
  theme: ThemeConfig;
  table?: string | null;
}) {
  const { organization, whatsapp, socialLinks, workingHours, menuCategories } = data;
  const content = getResolvedSiteContent(data.siteContent, organization);
  const currency = organization.currency || 'AZN';

  const [activeCategory, setActiveCategory] = useState<string>(menuCategories[0]?.id || 'all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<Record<string, { item: MenuItem; quantity: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartNote, setCartNote] = useState('');
  const [table, setTable] = useState<string | null>(propTable || null);

  // Capture table number from URL searchParams or prop or sessionStorage
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const urlTable = (sp.get('table') || sp.get('masa'))?.trim();
      if (urlTable) {
        const formatted = urlTable.toLowerCase().startsWith('masa') ? urlTable : `Masa ${urlTable}`;
        setTable(formatted);
        sessionStorage.setItem('active_table_' + organization.slug, formatted);
        return;
      }
      if (propTable) {
        setTable(propTable);
        sessionStorage.setItem('active_table_' + organization.slug, propTable);
        return;
      }
      const saved = sessionStorage.getItem('active_table_' + organization.slug);
      if (saved) {
        setTable(saved);
      }
    } catch {}
  }, [organization.slug, propTable]);

  // Persist cart
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pro_cart_' + organization.slug);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, [organization.slug]);

  const saveCart = (newCart: Record<string, { item: MenuItem; quantity: number }>) => {
    setCart(newCart);
    try {
      sessionStorage.setItem('pro_cart_' + organization.slug, JSON.stringify(newCart));
    } catch {}
  };

  const addToCart = (item: MenuItem, qty: number = 1) => {
    if (isOrdersPaused) return;
    const existing = cart[item.id];
    const newQty = (existing?.quantity || 0) + qty;
    const nextCart = { ...cart, [item.id]: { item, quantity: newQty } };
    saveCart(nextCart);
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      const next = { ...cart };
      delete next[id];
      saveCart(next);
    } else {
      saveCart({ ...cart, [id]: { ...cart[id], quantity: qty } });
    }
  };

  const clearCart = () => {
    saveCart({});
  };

  const cartEntries = Object.values(cart);
  const cartCount = cartEntries.reduce((s, e) => s + e.quantity, 0);
  const cartTotal = cartEntries.reduce((s, e) => s + (e.item.discountPrice || e.item.price) * e.quantity, 0);

  // Filtered dishes
  const displayedItems = useMemo(() => {
    if (activeCategory === 'all') {
      return menuCategories.flatMap(c => c.menuItems);
    }
    const cat = menuCategories.find(c => c.id === activeCategory);
    return cat ? cat.menuItems : [];
  }, [activeCategory, menuCategories]);

  // Featured dish for hero card
  const heroDish = useMemo(() => {
    if (theme.heroDishId) {
      for (const cat of menuCategories) {
        const match = cat.menuItems.find(m => m.id === theme.heroDishId);
        if (match) return match;
      }
    }
    for (const cat of menuCategories) {
      const feat = cat.menuItems.find(m => m.isFeatured);
      if (feat) return feat;
    }
    return menuCategories[0]?.menuItems[0] || null;
  }, [menuCategories, theme.heroDishId]);

  // Real-time open & order status via central hook
  const workingStatus = useWorkingHours({
    workingHours,
    settings: data.workingHoursSettings,
  });
  const isOpenNow = workingStatus.isOpen;
  const isOrdersPaused = workingStatus.isOrdersPaused;

  const defaultWaUrl = whatsapp?.phoneNumber
    ? formatWhatsAppUrl(
        whatsapp.countryCode,
        whatsapp.phoneNumber,
        table ? `Salam! *${table}*-dən sifariş vermək istəyirəm.` : 'Salam! Sifariş vermək istəyirəm.'
      )
    : '#';

  const checkoutViaWhatsapp = () => {
    if (cartEntries.length === 0) return;
    let text = `Salam! *${organization.name}* üçün sifariş vermək istəyirəm:\n`;
    if (table) {
      text += `📍 *MASA:* ${table}\n`;
    }
    text += `\n🍽️ *SİFARİŞİM:* (${cartCount} ədəd)\n`;
    cartEntries.forEach((e, idx) => {
      const p = e.item.discountPrice || e.item.price;
      const sub = p * e.quantity;
      text += `${idx + 1}. *${e.item.name}* — ${e.quantity} ədəd x ${p.toFixed(2)} ${currency} = ${sub.toFixed(2)} ${currency}\n`;
    });
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💰 *ÜMUMİ MƏBLƏĞ:* ${cartTotal.toFixed(2)} ${currency}\n`;
    if (cartNote.trim()) {
      text += `📝 *Qeyd:* ${cartNote.trim()}\n`;
    }
    const url = formatWhatsAppUrl(whatsapp?.countryCode || '994', whatsapp?.phoneNumber || '', text);
    window.open(url, '_blank');
  };

  const saffronGold = theme.primaryColor || '#E5A93C';
  const amberTone = theme.secondaryColor || '#F59E0B';
  const siteBackground = theme.siteBgColor || '#121416';
  const navbarBackground = theme.navbarBgColor || '#111315';
  const cardBackground = theme.formBgColor || '#181B1E';
  const footerBackground = theme.footerBgColor || '#0c0e10';
  const waColor = theme.whatsappColor || '#25D366';

  const orgAny = organization as any;
  const isFood = isFoodCategory(orgAny.siteCategory, orgAny.siteSubcategory);
  const isEnterprise = isEnterpriseServiceCategory(orgAny.siteCategory, orgAny.siteSubcategory);
  const isMenuOn = isFood || isMenuActive({
    id: orgAny.id,
    category: orgAny.siteCategory,
    subcategory: orgAny.siteSubcategory,
    website: data.website as any,
  });
  const hasGallery = Boolean(data.galleryItems && data.galleryItems.length > 0);
  const _ms = (data.moduleSettings || {}) as Record<string, boolean>;
  const showGallery = _ms.gallery !== false && hasGallery;
  const showContact = _ms.contact !== false;
  const showMenu = _ms.menu !== false;

  return (
    <>
      {data.website.splashEnabled && data.website.splashConfig && (
        <SplashScreen config={data.website.splashConfig} siteSlug={organization.slug} />
      )}

      {/* Fonts injection for Playfair Display & Plus Jakarta Sans */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
      />
      {theme.brandFont && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.brandFont).replace(/%20/g, '+')}:wght@400;500;600;700;800;900&display=swap`}
        />
      )}

      {/* Responsive Stylesheet */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .pro-restaurant-site {
          container-type: inline-size;
          container-name: proSiteRoot;
          width: 100%;
        }
        .pro-mobile-nav-btn {
          display: none !important;
        }
        .pro-navbar-cart-mobile { display: none !important; }
        .pro-header-spacer { display: none; }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .pro-mobile-nav-btn { display: flex !important; }
          .pro-navbar-cart { display: none !important; }
          .pro-header-spacer { display: block !important; }
          .pro-header-inner {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            padding: 0 16px !important;
            height: 64px !important;
          }
          .pro-header-brand {
            grid-column: 2 !important;
            justify-self: center !important;
            flex: none !important;
          }
          .pro-header-right {
            grid-column: 3 !important;
            justify-self: end !important;
          }
          .pro-hero-section { padding-top: 32px !important; padding-bottom: 50px !important; }
          .pro-hero-content {
            align-items: center !important;
            text-align: center !important;
          }
          .pro-hero-badge {
            margin: 0 auto !important;
            align-self: center !important;
          }
          .pro-hero-title {
            text-align: center !important;
          }
          .pro-hero-desc {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .pro-hero-pills {
            justify-content: center !important;
            align-self: center !important;
          }
          .pro-hero-actions {
            justify-content: center !important;
            align-self: center !important;
          }
          .pro-hero-btn {
            margin: 0 auto !important;
          }
          .pro-about-content {
            align-items: center !important;
            text-align: center !important;
          }
          .pro-about-badge {
            margin: 0 auto !important;
            justify-content: center !important;
          }
          .pro-about-title {
            text-align: center !important;
          }
          .pro-about-desc {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .pro-about-feature-card {
            text-align: center !important;
          }
          .pro-about-feature-header {
            justify-content: center !important;
            text-align: center !important;
          }
          .pro-section-padding { padding: 48px 0 !important; }
          .pro-cart-drawer { max-width: 100% !important; }
        }
        @container proSiteRoot (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .pro-mobile-nav-btn { display: flex !important; }
          .pro-navbar-cart { display: none !important; }
          .pro-header-spacer { display: block !important; }
          .pro-header-inner {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            padding: 0 16px !important;
            height: 64px !important;
          }
          .pro-header-brand {
            grid-column: 2 !important;
            justify-self: center !important;
            flex: none !important;
          }
          .pro-header-right {
            grid-column: 3 !important;
            justify-self: end !important;
          }
          .pro-hero-section { padding-top: 32px !important; padding-bottom: 50px !important; }
          .pro-hero-content {
            align-items: center !important;
            text-align: center !important;
          }
          .pro-hero-badge {
            margin: 0 auto !important;
            align-self: center !important;
          }
          .pro-hero-title {
            text-align: center !important;
          }
          .pro-hero-desc {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .pro-hero-pills {
            justify-content: center !important;
            align-self: center !important;
          }
          .pro-hero-actions {
            justify-content: center !important;
            align-self: center !important;
          }
          .pro-hero-btn {
            margin: 0 auto !important;
          }
          .pro-about-content {
            align-items: center !important;
            text-align: center !important;
          }
          .pro-about-badge {
            margin: 0 auto !important;
            justify-content: center !important;
          }
          .pro-about-title {
            text-align: center !important;
          }
          .pro-about-desc {
            text-align: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .pro-about-feature-card {
            text-align: center !important;
          }
          .pro-about-feature-header {
            justify-content: center !important;
            text-align: center !important;
          }
          .pro-section-padding { padding: 48px 0 !important; }
          .pro-cart-drawer { max-width: 100% !important; }
        }
        @media (max-width: 640px) {
          .pro-floating-cart {
            bottom: 16px !important;
            left: 14px !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            max-width: calc(100vw - 86px) !important;
          }
          .pro-floating-wa {
            bottom: 16px !important;
            right: 14px !important;
            padding: 11px !important;
            border-radius: 50% !important;
          }
        }
        @container proSiteRoot (max-width: 640px) {
          .pro-floating-cart {
            bottom: 16px !important;
            left: 14px !important;
            padding: 10px 14px !important;
            font-size: 13px !important;
            max-width: calc(100% - 86px) !important;
          }
          .pro-floating-wa {
            bottom: 16px !important;
            right: 14px !important;
            padding: 11px !important;
            border-radius: 50% !important;
          }
        }
        `,
        }}
      />

      <div
        className="pro-restaurant-site"
        style={{
          backgroundColor: siteBackground,
          color: '#e2e2e5',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          minHeight: '100vh',
          position: 'relative',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* ===================== TOP NAVBAR ===================== */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: navbarBackground,
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="pro-header-inner"
            style={{
              maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 76,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}
          >
            {/* Left spacer: hidden on desktop, col-1 on mobile grid for centering */}
            <div className="pro-header-spacer" style={{ display: 'none' }} />

            {/* Center: Brand */}
            <a
              href="#hero"
              className="pro-header-brand"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', color: '#F7F8F9', flexShrink: 0,
              }}
            >
              {organization.logo ? (
                <img
                  src={organization.logo}
                  alt={organization.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
                    border: `1.5px solid ${saffronGold}60`,
                    boxShadow: `0 0 12px ${saffronGold}30`, flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: '#1e2022',
                  border: `1px solid ${saffronGold}60`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: saffronGold, flexShrink: 0,
                }}>
                  <Utensils size={18} />
                </div>
              )}
              <span style={{
                fontFamily: theme.brandFont ? `'${theme.brandFont}', serif` : "'Playfair Display', serif",
                fontSize: 'clamp(17px, 3.5vw, 22px)', fontWeight: 700,
                letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '40vw',
              }}>
                {organization.name}
              </span>
            </a>

            {/* Right: Desktop nav + cart (hidden mobile) + WhatsApp (hidden mobile) + burger */}
            <div className="pro-header-right" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
              {/* Desktop Navigation */}
              <nav className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <a href="#hero" style={{ color: saffronGold, fontWeight: 600, fontSize: 14, textDecoration: 'none', borderBottom: `2px solid ${saffronGold}`, paddingBottom: 2 }}>Ana Səhifə</a>
                {isEnterprise && (
                  <a href="#menyu" style={{ color: '#9BA3AF', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA3AF')}>Xidmətlər</a>
                )}
                {(isMenuOn || !isEnterprise) && (
                  <a href="#menyu" style={{ color: '#9BA3AF', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA3AF')}>Menyu</a>
                )}
                <a href="#haqqimizda" style={{ color: '#9BA3AF', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA3AF')}>Haqqımızda</a>
                {showGallery && (
                  <a href="#qalereya" style={{ color: '#9BA3AF', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA3AF')}>Qalareya</a>
                )}
                {showContact && <a href="#rezervasiya" style={{ color: '#9BA3AF', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA3AF')}>Rezervasiya</a>}
                <a href="#elaqe" style={{ color: '#9BA3AF', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#F7F8F9')} onMouseLeave={(e) => (e.currentTarget.style.color = '#9BA3AF')}>Əlaqə</a>
              </nav>

              {/* Cart — hidden on mobile, shown in burger drawer */}
              <button
                type="button"
                className="pro-navbar-cart"
                onClick={() => setIsCartOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  backgroundColor: '#1e2022', color: '#F7F8F9',
                  padding: '8px 14px', borderRadius: 9999,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  transition: 'transform 0.15s, border-color 0.15s',
                  marginLeft: 14,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = saffronGold; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <ShoppingCart size={18} color={saffronGold} />
                <span className="hidden-mobile">Səbət</span>
                <span style={{ backgroundColor: saffronGold, color: '#111315', fontSize: 12, fontWeight: 700, padding: '1px 7px', borderRadius: 9999, minWidth: 18, textAlign: 'center' }}>
                  {cartCount}
                </span>
              </button>

              {/* Burger — mobile only */}
              <button
                type="button"
                className="pro-mobile-nav-btn"
                onClick={() => setMobileMenuOpen((p) => !p)}
                aria-label="Menyu"
                style={{
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                  width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e2022',
                  border: `1px solid ${mobileMenuOpen ? saffronGold : 'rgba(255,255,255,0.1)'}`,
                  color: mobileMenuOpen ? saffronGold : '#F7F8F9',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 99,
                backgroundColor: 'rgba(17, 19, 21, 0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(229, 169, 60, 0.3)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {[
                { href: '#hero', label: 'Ana Səhifə', icon: <Utensils size={16} color={saffronGold} /> },
                ...(isEnterprise && showMenu ? [{ href: '#menyu', label: 'Xidmətlər', icon: <Utensils size={16} color={saffronGold} /> }] : []),
                ...((isMenuOn || !isEnterprise) && showMenu ? [{ href: '#menyu', label: 'Menyu', icon: <Utensils size={16} color={saffronGold} /> }] : []),
                { href: '#haqqimizda', label: 'Haqqımızda', icon: <Award size={16} color={saffronGold} /> },
                ...(showGallery ? [{ href: '#qalereya', label: 'Qalareya', icon: <Camera size={16} color={saffronGold} /> }] : []),
                ...(showContact ? [{ href: '#rezervasiya', label: 'Rezervasiya', icon: <Clock size={16} color={saffronGold} /> }] : []),
                { href: '#elaqe', label: 'Əlaqə & İş Saatları', icon: <MapPin size={16} color={saffronGold} /> },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#F7F8F9',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  <span style={{ fontSize: 16, color: '#9BA3AF' }}>→</span>
                </a>
              ))}

              {/* Cart button in mobile drawer */}
              <button
                type="button"
                onClick={() => { setIsCartOpen(true); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 12,
                  backgroundColor: cartCount > 0 ? saffronGold + '22' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${cartCount > 0 ? saffronGold + '60' : 'rgba(255,255,255,0.06)'}`,
                  color: '#F7F8F9', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingCart size={16} color={saffronGold} />
                  <span>Səbət</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {cartCount > 0 && (
                    <span style={{ backgroundColor: saffronGold, color: '#111315', fontSize: 12, fontWeight: 700, padding: '1px 8px', borderRadius: 9999 }}>
                      {cartCount}
                    </span>
                  )}
                  <span style={{ fontSize: 16, color: '#9BA3AF' }}>→</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== HERO SECTION ===================== */}
        <section
          id="hero"
          className="pro-hero-section"
          style={{
            position: 'relative',
            paddingTop: '48px',
            paddingBottom: '80px',
            overflow: 'hidden',
          }}
        >
          {/* Atmospheric Ambient Saffron Glows */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 580,
              height: 360,
              backgroundColor: `${saffronGold}18`,
              borderRadius: '50%',
              filter: 'blur(130px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              width: 320,
              height: 320,
              backgroundColor: `${amberTone}12`,
              borderRadius: '50%',
              filter: 'blur(100px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div
            style={{
              maxWidth: 1240,
              margin: '0 auto',
              padding: '0 24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: 40,
                alignItems: 'center',
              }}
            >
              {/* Left Column Text */}
              <div className="pro-hero-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Eyebrow Badge */}
                <div
                  className="pro-hero-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    backgroundColor: cardBackground,
                    border: '1px solid rgba(229, 169, 60, 0.35)',
                    width: 'fit-content',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: saffronGold,
                      display: 'inline-block',
                      boxShadow: `0 0 8px ${saffronGold}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: saffronGold,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {theme.heroBadgeText || 'ORİJİNAL STREET FOOD DADI'}
                  </span>
                </div>

                {/* Main Headline */}
                <h1
                  className="pro-hero-title"
                  style={{
                    fontFamily: theme.brandFont ? `'${theme.brandFont}', serif` : "'Playfair Display', serif",
                    fontSize: 'clamp(34px, 5vw, 52px)',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color: '#F7F8F9',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  {organization.name}
                </h1>

                {/* Description */}
                <p
                  className="pro-hero-desc"
                  style={{
                    fontSize: 16,
                    lineHeight: '26px',
                    color: '#9BA3AF',
                    maxWidth: 540,
                    margin: 0,
                  }}
                >
                  {organization.description ||
                    `${organization.name} — ənənəvi dadı və keyfiyyəti bir araya gətirən street food məkanıdır. Ləzzətli yeməklərimizlə sizə unudulmaz dad təcrübəsi təqdim edirik.`}
                </p>

                {/* Core Value Micro-Pills */}
                <div className="pro-hero-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 4 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: `${cardBackground}CC`,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: 13,
                      color: '#F7F8F9',
                    }}
                  >
                    <Award size={15} color={saffronGold} />
                    <span>{theme.heroFeature1 || 'Təbii inqrediyentlər'}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: `${cardBackground}CC`,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: 13,
                      color: '#F7F8F9',
                    }}
                  >
                    <ChefHat size={15} color={saffronGold} />
                    <span>{theme.heroFeature2 || 'Gündəlik təzə bişirilir'}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: `${cardBackground}CC`,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: 13,
                      color: '#F7F8F9',
                    }}
                  >
                    <Bike size={15} color={saffronGold} />
                    <span>{theme.heroFeature3 || 'Sürətli çatdırılma'}</span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="pro-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, paddingTop: 10 }}>
                  <a
                    href="#menyu"
                    className="pro-hero-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '14px 32px',
                      borderRadius: 9999,
                      background: `linear-gradient(135deg, ${saffronGold}, ${amberTone})`,
                      color: '#111315',
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: 'none',
                      boxShadow: `0 8px 24px ${saffronGold}40`,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 12px 30px ${saffronGold}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${saffronGold}40`;
                    }}
                  >
                    <Utensils size={18} />
                    <span>Menyuya bax</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Dish Card Frame */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 24,
                    padding: 14,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4 / 3',
                      borderRadius: 18,
                      overflow: 'hidden',
                      backgroundColor: '#1e2022',
                    }}
                  >
                    <img
                      src={heroDish?.image || theme.heroDishImage || theme.headerImageUrl || FALLBACK_HERO_IMAGE}
                      alt={heroDish?.name || theme.heroDishTitle || organization.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== FALLBACK_HERO_IMAGE) {
                          target.src = FALLBACK_HERO_IMAGE;
                        }
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, #111315 0%, transparent 60%)',
                        opacity: 0.85,
                      }}
                    />
                    {/* Badge on image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        backgroundColor: 'rgba(17, 19, 21, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: '6px 14px',
                        borderRadius: 9999,
                        border: '1px solid rgba(229, 169, 60, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <Sparkles size={14} color={saffronGold} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#F7F8F9' }}>
                        {theme.heroDishBadge || 'Günün Sevimli Təamı'}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Bar Info */}
                  <div
                    style={{
                      padding: '16px 8px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 17,
                          fontWeight: 700,
                          color: '#F7F8F9',
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        {heroDish?.name || theme.heroDishTitle || 'Ənənəvi Xüsusi Resept'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9BA3AF' }}>
                        {heroDish?.description || heroDish?.ingredients || theme.heroDishSubtitle || 'Ənənəvi kərə yağı və xüsusi ədviyyatlarla'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 18,
                          fontWeight: 700,
                          color: saffronGold,
                        }}
                      >
                        {heroDish ? formatPrice(heroDish.discountPrice || heroDish.price, currency) : 'Təzə & İsti'}
                      </span>
                      <span style={{ fontSize: 11, color: '#9BA3AF' }}>{theme.heroDishPriceNote || 'təzə və isti'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== MENU SECTION ===================== */}
        <section
          id="menyu"
          className="pro-section-padding"
          style={{
            padding: '80px 0',
            backgroundColor: '#0c0e10',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            {/* Section Header */}
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 40px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Utensils size={18} color={saffronGold} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: saffronGold,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  TAM MENYU
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: '#F7F8F9',
                  letterSpacing: '-0.015em',
                  margin: 0,
                }}
              >
                Yeməklərimiz
              </h2>
              <p style={{ margin: '12px 0 0', fontSize: 15, color: '#9BA3AF' }}>
                {theme.menuSubtitle || 'Hər gün sevgi və ənənəvi reseptlərlə təzə bişirilən street food ləzzətləri.'}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                overflowX: 'auto',
                paddingBottom: 14,
                marginBottom: 36,
                scrollbarWidth: 'none',
              }}
            >
              {/* All Category Pill */}
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 9999,
                  border:
                    activeCategory === 'all'
                      ? `1px solid ${saffronGold}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: activeCategory === 'all' ? saffronGold : cardBackground,
                  color: activeCategory === 'all' ? '#111315' : '#9BA3AF',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <span>Bütün Yeməklər</span>
                <span
                  style={{
                    backgroundColor: activeCategory === 'all' ? 'rgba(0,0,0,0.2)' : '#282a2c',
                    color: activeCategory === 'all' ? '#111315' : '#9BA3AF',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {menuCategories.reduce((sum, c) => sum + c.menuItems.length, 0)}
                </span>
              </button>

              {menuCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 9999,
                      border: isActive
                        ? `1px solid ${saffronGold}`
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isActive ? saffronGold : cardBackground,
                      color: isActive ? '#111315' : '#9BA3AF',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>{cat.name}</span>
                    <span
                      style={{
                        backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : '#282a2c',
                        color: isActive ? '#111315' : '#9BA3AF',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {cat.menuItems.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 24,
              }}
            >
              {displayedItems.map((item) => {
                const price = item.discountPrice || item.price;
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: cardBackground,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 18,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedItem(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(229, 169, 60, 0.4)';
                      e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(229, 169, 60, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      {/* Image Frame */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '16 / 10',
                          borderRadius: 12,
                          overflow: 'hidden',
                          backgroundColor: '#1e2022',
                          marginBottom: 14,
                        }}
                      >
                        <img
                          src={item.image || FALLBACK_DISH_IMAGE}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src !== FALLBACK_DISH_IMAGE) {
                              target.src = FALLBACK_DISH_IMAGE;
                            }
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />

                        {/* Top Badge */}
                        {(item.portionSize || item.isFeatured || item.isNew) && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              backgroundColor: 'rgba(17, 19, 21, 0.85)',
                              backdropFilter: 'blur(6px)',
                              padding: '4px 10px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 600,
                              color: saffronGold,
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                            }}
                          >
                            {item.portionSize || (item.isFeatured ? 'Seçilmiş' : 'Yeni')}
                          </span>
                        )}
                        {item.isSet && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#FCD34D',
                              background: 'rgba(217, 119, 6, 0.25)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              padding: '2px 8px',
                              borderRadius: 6,
                            }}
                          >
                            🍱 SET
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3
                        style={{
                          margin: '0 0 6px',
                          fontSize: 17,
                          fontWeight: 700,
                          color: '#F7F8F9',
                        }}
                      >
                        {item.name}
                      </h3>
                      {item.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 13,
                            lineHeight: '20px',
                            color: '#9BA3AF',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                      {item.isSet && item.setItems && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '6px 10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 6,
                            border: '1px dashed rgba(245, 158, 11, 0.3)',
                            fontSize: 11,
                            color: '#FCD34D',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>Tərkibi:</span> {formatSetSummary(item.setItems)}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Price & Add Button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 14,
                        marginTop: 12,
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: saffronGold }}>
                          {formatPrice(price, currency)}
                        </span>
                        {item.discountPrice && (
                          <span
                            style={{
                              fontSize: 13,
                              color: '#9BA3AF',
                              textDecoration: 'line-through',
                            }}
                          >
                            {formatPrice(item.price, currency)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isOrdersPaused}
                        aria-label="Səbətə əlavə et"
                        title={isOrdersPaused ? (workingStatus.noticeMessage || 'Qeyri-iş saatıdır. Sifariş qəbul edilmir.') : 'Səbətə əlavə et'}
                        onClick={() => addToCart(item, 1)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          backgroundColor: isOrdersPaused ? '#383334' : saffronGold,
                          color: isOrdersPaused ? '#8888A0' : '#111315',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isOrdersPaused ? 'not-allowed' : 'pointer',
                          opacity: isOrdersPaused ? 0.65 : 1,
                          boxShadow: isOrdersPaused ? 'none' : `0 3px 10px ${saffronGold}40`,
                          transition: 'transform 0.15s, background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (isOrdersPaused) return;
                          e.currentTarget.style.transform = 'scale(1.08)';
                          e.currentTarget.style.backgroundColor = amberTone;
                        }}
                        onMouseLeave={(e) => {
                          if (isOrdersPaused) return;
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.backgroundColor = saffronGold;
                        }}
                      >
                        <Plus size={20} strokeWidth={2.8} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== ABOUT SECTION ===================== */}
        <section
          id="haqqimizda"
          className="pro-section-padding"
          style={{
            padding: '90px 0',
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div
              style={{
                backgroundColor: `${cardBackground}B3`,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 28,
                padding: 'clamp(24px, 5vw, 56px)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                  gap: 40,
                  alignItems: 'center',
                }}
              >
                {/* Left Description */}
                <div className="pro-about-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div
                    className="pro-about-badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Award size={18} color={saffronGold} />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: saffronGold,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      BİZ KİMİK?
                    </span>
                  </div>

                  <h2
                    className="pro-about-title"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(28px, 4vw, 38px)',
                      fontWeight: 700,
                      color: '#F7F8F9',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Haqqımızda
                  </h2>

                  <p
                    className="pro-about-desc"
                    style={{
                      fontSize: 16,
                      lineHeight: '28px',
                      color: '#9BA3AF',
                      margin: 0,
                    }}
                  >
                    {organization.description ||
                      `${organization.name} — ənənəvi dadı və keyfiyyəti bir araya gətirən street food məkanıdır. Ləzzətli yeməklərimiz və xüsusi reseptlərimizlə sizə unudulmaz dad təcrübəsi təqdim edirik.`}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                      gap: 16,
                      paddingTop: 10,
                    }}
                  >
                    <div
                      className="pro-about-feature-card"
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        backgroundColor: '#1e2022',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div
                        className="pro-about-feature-header"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <Sparkles size={18} color={saffronGold} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9' }}>
                          {theme.aboutFeature1Title || 'Müştəri Məmnuniyyəti'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#9BA3AF', lineHeight: '18px' }}>
                        {theme.aboutFeature1Desc || 'Hər bir qonağımıza səmimi münasibət və yüksək keyfiyyət zəmanəti.'}
                      </p>
                    </div>

                    <div
                      className="pro-about-feature-card"
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        backgroundColor: '#1e2022',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div
                        className="pro-about-feature-header"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <ChefHat size={18} color={saffronGold} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9' }}>
                          {theme.aboutFeature2Title || 'Gündəlik Təzəlik'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#9BA3AF', lineHeight: '18px' }}>
                        {theme.aboutFeature2Desc || 'Yeməklər yalnız gün ərzində sifarişlə təzə şəkildə hazırlanır.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Image Frame */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: 20,
                      overflow: 'hidden',
                      aspectRatio: '4 / 3',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
                    }}
                  >
                    <img
                      src={theme.aboutImageUrl || theme.backgroundImageUrl || theme.headerImageUrl || FALLBACK_HERO_IMAGE}
                      alt={organization.name}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== FALLBACK_HERO_IMAGE) {
                          target.src = FALLBACK_HERO_IMAGE;
                        }
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(17,19,21,0.9) 0%, transparent 60%)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        padding: '12px 16px',
                        backgroundColor: 'rgba(34, 38, 43, 0.85)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 14,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#9BA3AF' }}>
                        {theme.aboutBadgeLeft || (organization.city ? `Məkan: ${organization.city}` : 'Orijinal Street Food')}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: saffronGold }}>
                        {theme.aboutBadgeRight || 'Sürətli Çatdırılma'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== GALLERY SECTION ===================== */}
        {showGallery && (
          <section
            id="qalereya"
            className="pro-section-padding"
            style={{
              padding: '90px 0',
              position: 'relative',
              backgroundColor: '#0e1012',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(229, 169, 60, 0.1)',
                    border: '1px solid rgba(229, 169, 60, 0.3)',
                    padding: '6px 14px',
                    borderRadius: 9999,
                    marginBottom: 14,
                  }}
                >
                  <Camera size={14} color={saffronGold} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: saffronGold, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    QALEREYA
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(28px, 4vw, 42px)',
                    fontWeight: 700,
                    color: '#F7F8F9',
                    margin: '0 0 12px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Məkanımız və Təamlarımız
                </h2>
                <p style={{ color: '#9BA3AF', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
                  Ləzzət və estetikanın bir araya gəldiyi anlardan foto görüntülər
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 20,
                }}
              >
                {(data.galleryItems || []).map((item: { id?: string; url: string; title?: string | null }, idx: number) => (
                  <div
                    key={item.id || idx}
                    style={{
                      borderRadius: 20,
                      overflow: 'hidden',
                      aspectRatio: '4/3',
                      position: 'relative',
                      backgroundColor: '#16181b',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src={item.url}
                      alt={item.title || `Qalareya ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    {item.title && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '24px 16px 12px',
                          background: 'linear-gradient(transparent, rgba(14,16,18,0.9))',
                          color: '#F7F8F9',
                          fontSize: 14,
                          fontWeight: 600,
                          pointerEvents: 'none',
                        }}
                      >
                        {item.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================== RESERVATION SECTION ===================== */}
        {showContact && (
          <ProReservationSection
            organization={organization}
            whatsapp={whatsapp}
            saffronGold={saffronGold}
            cardBackground={cardBackground}
          />
        )}

        {/* ===================== CONTACT & HOURS SECTION ===================== */}
        <section
          id="elaqe"
          className="pro-section-padding"
          style={{
            padding: '80px 0',
            backgroundColor: '#0c0e10',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <MapPin size={18} color={saffronGold} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: saffronGold,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  BİZİMLƏ ƏLAQƏ
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: 700,
                  color: '#F7F8F9',
                  margin: 0,
                }}
              >
                Əlaqə & İş Saatları
              </h2>
              <p style={{ margin: '10px 0 0', fontSize: 15, color: '#9BA3AF' }}>
                {theme.contactSubtitle || 'Sualınız var və ya sifariş vermək istəyirsiniz? Bizimlə dərhal əlaqə saxlayın.'}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: 32,
                alignItems: 'start',
              }}
            >
              {/* Left Column: Phone, Address, WhatsApp Banner */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Phone Card */}
                {organization.phone && (
                  <div
                    style={{
                      backgroundColor: cardBackground,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 18,
                      padding: 22,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: '#282a2c',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: saffronGold,
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={22} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#9BA3AF',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Telefon
                      </span>
                      <a
                        href={`tel:${organization.phone}`}
                        style={{
                          display: 'block',
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#F7F8F9',
                          textDecoration: 'none',
                          marginTop: 2,
                        }}
                      >
                        {organization.phone}
                      </a>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9BA3AF' }}>
                        Zəng və ya WhatsApp vasitəsilə əlaqə
                      </p>
                    </div>
                  </div>
                )}

                {/* Address Card */}
                {organization.address && (
                  <div
                    style={{
                      backgroundColor: cardBackground,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 18,
                      padding: 22,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: '#282a2c',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: saffronGold,
                        flexShrink: 0,
                      }}
                    >
                      <MapPin size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#9BA3AF',
                          letterSpacing: '0.08em',
                        }}
                      >
                        Ünvan
                      </span>
                      <p
                        style={{
                          margin: '2px 0 0',
                          fontSize: 16,
                          fontWeight: 600,
                          color: '#F7F8F9',
                        }}
                      >
                        {organization.address}
                      </p>
                      {organization.city && (
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#9BA3AF' }}>
                          {organization.city}, Azərbaycan
                        </p>
                      )}
                      {organization.mapUrl && (
                        <a
                          href={organization.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: saffronGold,
                            fontSize: 13,
                            fontWeight: 600,
                            marginTop: 10,
                            textDecoration: 'none',
                          }}
                        >
                          <span>Xəritədə göstər</span>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* WhatsApp Order Banner */}
                {whatsapp?.isEnabled && whatsapp.phoneNumber && (
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${cardBackground}, #1e2022)`,
                      borderRadius: 18,
                      padding: 22,
                      border: '1px solid rgba(37, 211, 102, 0.35)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: waColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                        }}
                      >
                        <MessageCircle size={22} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#F7F8F9' }}>
                          Onlayn WhatsApp Sifariş
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9BA3AF' }}>
                          Bir toxunuşla menyudakı istənilən yeməyi sifariş edin
                        </p>
                      </div>
                    </div>
                    <a
                      href={defaultWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: waColor,
                        color: '#fff',
                        padding: '12px 20px',
                        borderRadius: 9999,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                        transition: 'filter 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                    >
                      <MessageCircle size={18} />
                      <span>WhatsApp ilə sifariş et</span>
                    </a>
                  </div>
                )}

                {/* Social Media Card */}
                {socialLinks && socialLinks.length > 0 && (
                  <div
                    style={{
                      backgroundColor: cardBackground,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 18,
                      padding: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          backgroundColor: '#282a2c',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: saffronGold,
                          flexShrink: 0,
                        }}
                      >
                        <Share2 size={22} />
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#9BA3AF',
                            letterSpacing: '0.08em',
                          }}
                        >
                          Sosial Şəbəkələr
                        </span>
                        <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 600, color: '#F7F8F9' }}>
                          Bizi izləyin
                        </p>
                      </div>
                    </div>
                    <SocialIconsGroup
                      links={socialLinks}
                      styleType={theme.socialIconStyle}
                      iconColor={theme.socialIconColor}
                      iconBgColor={theme.socialIconBgColor}
                      size={theme.socialIconSize ? Math.min(theme.socialIconSize, 40) : 38}
                      align="flex-start"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Working Hours Timetable Card */}
              <div
                style={{
                  backgroundColor: cardBackground,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 20,
                  padding: '24px 28px',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
                }}
              >
                {/* Header with status badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 20,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: '#282a2c',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: saffronGold,
                      }}
                    >
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#F7F8F9' }}>
                        {theme.workingHoursTitle || 'İş saatları'}
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9BA3AF' }}>
                        {theme.workingHoursSubtitle || 'Həftəlik iş qrafiki'}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 9999,
                      backgroundColor: isOpenNow
                        ? 'rgba(73, 235, 123, 0.15)'
                        : 'rgba(255, 180, 171, 0.15)',
                      border: `1px solid ${
                        isOpenNow ? 'rgba(73, 235, 123, 0.35)' : 'rgba(255, 180, 171, 0.35)'
                      }`,
                      color: isOpenNow ? '#49eb7b' : '#ffb4ab',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: isOpenNow ? '#49eb7b' : '#ffb4ab',
                      }}
                    />
                    <span>{isOpenNow ? 'İndi Açıqdır' : 'Bağlıdır'}</span>
                  </div>
                </div>

                {/* Days timetable */}
                <div style={{ marginTop: 14 }}>
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const sched = workingHours?.find((w) => w.dayOfWeek === d);
                    const dayName = DAY_NAMES[d];
                    const isToday = new Date().getDay() === d;
                    return (
                      <div
                        key={d}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 0',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            color: isToday ? saffronGold : '#9BA3AF',
                            fontWeight: isToday ? 700 : 500,
                          }}
                        >
                          {dayName} {isToday && '(Bugün)'}
                        </span>
                        {sched && !sched.isClosed ? (
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: isToday ? saffronGold : '#F7F8F9',
                            }}
                          >
                            {sched.openTime || '09:00'} — {sched.closeTime || '22:00'}{sched.breakStart && sched.breakEnd ? ` (Fasilə: ${sched.breakStart}-${sched.breakEnd})` : ''}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'rgba(147, 0, 10, 0.3)',
                              color: '#ffb4ab',
                            }}
                          >
                            Bağlı
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ===================== FOOTER ===================== */}
        <footer
          style={{
            backgroundColor: footerBackground,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '50px 24px 30px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: '#1e2022',
                  border: `1px solid ${saffronGold}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: saffronGold,
                }}
              >
                <Utensils size={16} />
              </div>
              <span
                style={{
                  fontFamily: theme.brandFont ? `'${theme.brandFont}', serif` : "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#F7F8F9',
                }}
              >
                {organization.name}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: 14, color: '#9BA3AF', lineHeight: '22px' }}>
              {organization.description ||
                `${organization.name} — ənənəvi dadı və keyfiyyəti bir araya gətirən street food məkanıdır.`}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
              <a href="#hero" style={{ color: '#9BA3AF', fontSize: 13, textDecoration: 'none' }}>
                Ana Səhifə
              </a>
              <a href="#menyu" style={{ color: '#9BA3AF', fontSize: 13, textDecoration: 'none' }}>
                Menyu
              </a>
              <a href="#haqqimizda" style={{ color: '#9BA3AF', fontSize: 13, textDecoration: 'none' }}>
                Haqqımızda
              </a>
              {showGallery && (
                <a href="#qalereya" style={{ color: '#9BA3AF', fontSize: 13, textDecoration: 'none' }}>
                  Qalareya
                </a>
              )}
              {showContact && <a href="#rezervasiya" style={{ color: '#9BA3AF', fontSize: 13, textDecoration: 'none' }}>Rezervasiya</a>}
              <a href="#elaqe" style={{ color: '#9BA3AF', fontSize: 13, textDecoration: 'none' }}>
                Əlaqə
              </a>
              {whatsapp?.isEnabled && whatsapp.phoneNumber && (
                <a
                  href={defaultWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: saffronGold, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}
                >
                  WhatsApp Sifariş
                </a>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: 20,
                width: '100%',
                fontSize: 12,
                color: '#9BA3AF',
              }}
            >
              <p style={{ margin: 0 }}>
                {theme.footerCopyrightText || `© ${new Date().getFullYear()} ${organization.name}. Bütün hüquqlar qorunur.`}
              </p>
              <p style={{ margin: '4px 0 0', opacity: 0.6 }}>
                {theme.footerPlatformText || 'Sayt SiteX platforması ilə yaradılıb'}
              </p>
            </div>
          </div>
        </footer>



        {/* ===================== FLOATING CART BUTTON (BOTTOM LEFT) ===================== */}
        {cartCount > 0 && (
          <button
            type="button"
            className="pro-floating-cart"
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              zIndex: 400,
              backgroundColor: saffronGold,
              color: '#111315',
              padding: '12px 20px',
              borderRadius: 9999,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `0 8px 30px ${saffronGold}66`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <ShoppingCart size={20} />
            <span>Səbət ({cartCount})</span>
            <span
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: 12,
              }}
            >
              {formatPrice(cartTotal, currency)}
            </span>
          </button>
        )}

        {/* ===================== CART SLIDE-OVER DRAWER ===================== */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
              onClick={() => setIsCartOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                onClick={(e) => e.stopPropagation()}
                className="pro-cart-drawer"
                style={{
                  width: '100%',
                  maxWidth: 440,
                  height: '100%',
                  backgroundColor: '#22262B',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 24,
                  boxSizing: 'border-box',
                  boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 16,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShoppingCart size={22} color={saffronGold} />
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F7F8F9' }}>
                      Səbətiniz
                    </h3>
                    <span
                      style={{
                        backgroundColor: saffronGold,
                        color: '#111315',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '1px 8px',
                        borderRadius: 9999,
                      }}
                    >
                      {cartCount}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {cartEntries.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffb4ab',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Təmizlə
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        color: '#F7F8F9',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Active Table Badge in Cart Header */}
                  {table && (
                    <div
                      style={{
                        marginTop: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'rgba(229, 169, 60, 0.12)',
                        border: '1px solid rgba(229, 169, 60, 0.35)',
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📍</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#F7F8F9' }}>{table}</div>
                          <div style={{ fontSize: 11, color: '#9BA3AF' }}>Sifariş bu masaya yönləndiriləcək</div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: saffronGold,
                          backgroundColor: 'rgba(229, 169, 60, 0.18)',
                          padding: '3px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        QR Skan
                      </span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {cartEntries.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#9BA3AF',
                        width: '100%',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 16,
                          margin: '0 auto 16px',
                        }}
                      >
                        <ShoppingCart size={36} strokeWidth={1.3} style={{ display: 'block', margin: '0 auto', opacity: 0.5 }} />
                      </div>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#F7F8F9', textAlign: 'center' }}>
                        Səbətiniz hələ boşdur
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.7, textAlign: 'center', maxWidth: 260 }}>
                        Menyudan sevdiyiniz yeməkləri əlavə edin
                      </p>
                    </div>
                  ) : (
                    cartEntries.map(({ item, quantity }) => {
                      const itemPrice = item.discountPrice || item.price;
                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#1e2022',
                            padding: 12,
                            borderRadius: 14,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: 10 }}>
                            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#F7F8F9' }}>
                              {item.name}
                            </h4>
                            <span style={{ fontSize: 13, fontWeight: 700, color: saffronGold }}>
                              {formatPrice(itemPrice * quantity, currency)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, quantity - 1)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#282a2c',
                                color: '#F7F8F9',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(item.id, quantity + 1)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                backgroundColor: '#282a2c',
                                color: '#F7F8F9',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Drawer */}
                {cartEntries.length > 0 && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <textarea
                      placeholder="Sifariş üçün əlavə qeydlər (ünvan, çatdırılma vaxtı və s.)..."
                      value={cartNote}
                      onChange={(e) => setCartNote(e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        backgroundColor: '#1e2022',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 10,
                        padding: 10,
                        color: '#F7F8F9',
                        fontSize: 13,
                        resize: 'none',
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, color: '#9BA3AF' }}>Ümumi Məbləğ:</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: saffronGold }}>
                        {formatPrice(cartTotal, currency)}
                      </span>
                    </div>

                    {isOrdersPaused && (
                      <OffHoursNotice message={workingStatus.noticeMessage} variant="inline" style={{ marginBottom: 12 }} />
                    )}
                    <button
                      type="button"
                      disabled={isOrdersPaused}
                      onClick={checkoutViaWhatsapp}
                      style={{
                        backgroundColor: isOrdersPaused ? '#383334' : waColor,
                        cursor: isOrdersPaused ? 'not-allowed' : 'pointer',
                        opacity: isOrdersPaused ? 0.65 : 1,
                        color: '#fff',
                        padding: '14px',
                        borderRadius: 9999,
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)',
                      }}
                    >
                      <MessageCircle size={18} />
                      <span>WhatsApp ilə sifarişi tamamla</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================== DISH DETAIL MODAL ===================== */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1100,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
              }}
              onClick={() => setSelectedItem(null)}
            >
              <div
                className="food-popup-wrapper"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedItem.video && (
                  <FoodVideoPlayer
                    videoUrl={selectedItem.video}
                    itemName={selectedItem.name}
                    borderRadius={24}
                  />
                )}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: 500,
                    backgroundColor: '#1e2022',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 24,
                    overflow: 'hidden',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  {selectedItem.image && (
                    <div style={{ width: '100%', height: 240, overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src !== FALLBACK_DISH_IMAGE) {
                            target.src = FALLBACK_DISH_IMAGE;
                          }
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedItem(null)}
                        style={{
                          position: 'absolute',
                          top: 14,
                          right: 14,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          color: '#fff',
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          color: '#F7F8F9',
                        }}
                      >
                        {selectedItem.name}
                      </h3>
                      <span style={{ fontSize: 20, fontWeight: 700, color: saffronGold }}>
                        {formatPrice(selectedItem.discountPrice || selectedItem.price, currency)}
                      </span>
                    </div>

                    {selectedItem.description && (
                      <p style={{ margin: '12px 0 0', fontSize: 14, color: '#9BA3AF', lineHeight: '22px' }}>
                        {selectedItem.description}
                      </p>
                    )}

                    {selectedItem.isSet && selectedItem.setItems && (() => {
                      const setItems = parseSetItems(selectedItem.setItems);
                      if (setItems.length === 0) return null;
                      return (
                        <div
                          style={{
                            marginTop: 16,
                            padding: 14,
                            background: 'rgba(217, 119, 6, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            borderRadius: 12,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              marginBottom: 10,
                              fontWeight: 700,
                              fontSize: 13,
                              color: '#FCD34D',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            🍱 Setə daxil olan yemək və içkilər
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {setItems.map((si, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '6px 10px',
                                  background: 'rgba(0,0,0,0.3)',
                                  borderRadius: 8,
                                  fontSize: 13,
                                  color: '#F7F8F9',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: 22,
                                      height: 22,
                                      padding: '0 6px',
                                      borderRadius: 11,
                                      background: 'rgba(245, 158, 11, 0.2)',
                                      color: '#FCD34D',
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {si.quantity || 1}x
                                  </span>
                                  <span style={{ fontWeight: 500 }}>{si.name}</span>
                                  {si.portion && (
                                    <span style={{ fontSize: 11, color: '#9BA3AF' }}>({si.portion})</span>
                                  )}
                                </div>
                                {si.note && (
                                  <span style={{ fontSize: 11, color: '#9BA3AF', fontStyle: 'italic' }}>
                                    {si.note}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {(selectedItem.portionSize || selectedItem.ingredients || selectedItem.allergens) && (
                      <div
                        style={{
                          backgroundColor: '#121416',
                          borderRadius: 12,
                          padding: 12,
                          marginTop: 16,
                          fontSize: 13,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        {selectedItem.portionSize && (
                          <div>
                            <strong style={{ color: '#F7F8F9' }}>Porsiya: </strong>
                            <span style={{ color: '#9BA3AF' }}>{selectedItem.portionSize}</span>
                          </div>
                        )}
                        {selectedItem.ingredients && (
                          <div>
                            <strong style={{ color: '#F7F8F9' }}>Tərkib: </strong>
                            <span style={{ color: '#9BA3AF' }}>{selectedItem.ingredients}</span>
                          </div>
                        )}
                        {selectedItem.allergens && (
                          <div>
                            <strong style={{ color: '#ffb4ab' }}>Allergen: </strong>
                            <span style={{ color: '#9BA3AF' }}>{selectedItem.allergens}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                      <button
                        type="button"
                        disabled={isOrdersPaused}
                        onClick={() => {
                          addToCart(selectedItem, 1);
                          setSelectedItem(null);
                          setIsCartOpen(true);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: isOrdersPaused ? '#383334' : saffronGold,
                          color: isOrdersPaused ? '#8888A0' : '#111315',
                          padding: '12px',
                          borderRadius: 9999,
                          border: 'none',
                          fontWeight: 700,
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: isOrdersPaused ? 'not-allowed' : 'pointer',
                          opacity: isOrdersPaused ? 0.65 : 1,
                        }}
                      >
                        {isOrdersPaused ? <Clock size={18} /> : <ShoppingCart size={18} />}
                        <span>{isOrdersPaused ? 'Sifariş qəbul edilmir' : 'Səbətə əlavə et'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
