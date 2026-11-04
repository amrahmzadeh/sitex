'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, Menu, X, Star, ChevronRight, Users, Coffee, Music, Award, ShoppingCart, Plus, Minus, Trash2, Check } from 'lucide-react';
import { ThemeConfig, getGoogleFontsUrl } from '@/lib/themes';
import { formatPrice, formatWhatsAppUrl } from '@/lib/utils';
import type { SiteData, MenuItem, MenuCategory } from './RestaurantSite';

const PRIMARY = '#004527';
const SECONDARY = '#a93539';
const ACCENT = '#735c00';
const BG = '#faf9f6';
const TEXT = '#1a1c1a';

const HERO_MAIN_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';
const HERO_IMG2 = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80';
const HERO_IMG3 = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80';
const ABOUT_IMG = 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=700&q=80';

const DAY_NAMES = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];

// ─── Header ─────────────────────────────────────────────────────────────────
function Header({ data, theme, activeSection }: { data: SiteData; theme: ThemeConfig; activeSection: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { organization } = data;
  const primary = theme.primaryColor || PRIMARY;
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const heading = theme.headingFont || 'Playfair Display';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const moduleSettings = data.moduleSettings || {};
  const showMenu = moduleSettings.menu !== false;
  const showPackages = moduleSettings.packages !== false;
  const showGallery = moduleSettings.gallery !== false && Boolean(data.galleryItems && data.galleryItems.length > 0);
  const showContact = moduleSettings.contact !== false;

  const navLinks = [
    { id: 'hero', label: 'Ana Səhifə' },
    { id: 'about', label: 'Haqqımızda' },
    ...(showMenu ? [{ id: 'menu', label: 'Menyu' }] : []),
    ...(showPackages ? [{ id: 'offers', label: 'Təkliflər' }] : []),
    ...(showGallery ? [{ id: 'gallery', label: 'Qalereya' }] : []),
    ...(showContact ? [{ id: 'reservation', label: 'Rezervasiya' }] : []),
    { id: 'contact', label: 'Əlaqə' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const navBg = scrolled
    ? (theme.navbarBgColor || 'rgba(250,249,246,0.95)')
    : 'rgba(250,249,246,0.75)';

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(0,69,39,0.12)' : '1px solid rgba(0,69,39,0.06)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,69,39,0.08)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {organization.logo ? (
            <img src={organization.logo} alt={organization.name} style={{ height: 44, width: 44, objectFit: 'contain', borderRadius: 10 }} />
          ) : (
            <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${primary}, ${SECONDARY})`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coffee size={22} color="#fff" />
            </div>
          )}
          <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 20, color: primary, letterSpacing: '-0.3px' }}>{organization.name}</span>
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="randevu-desktop-nav">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: body, fontSize: 13, fontWeight: 500,
                color: activeSection === link.id ? primary : `${TEXT}CC`,
                padding: '6px 12px', borderRadius: 8,
                transition: 'all 0.2s',
                borderBottom: activeSection === link.id ? `2px solid ${primary}` : '2px solid transparent',
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {organization.phone && (
            <a
              href={`tel:${organization.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: body, fontSize: 13, fontWeight: 600, color: primary, textDecoration: 'none', padding: '8px 14px', border: `1.5px solid ${primary}20`, borderRadius: 100 }}
            >
              <Phone size={14} /> {organization.phone}
            </a>
          )}
          {showContact && (
            <button
              onClick={() => scrollTo('reservation')}
              style={{ background: primary, color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontFamily: body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Rezervasiya
            </button>
          )}
          <button
            onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', color: TEXT }}
            className="randevu-mobile-menu-btn"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ background: BG, borderTop: `1px solid ${primary}15`, padding: '12px 20px 20px' }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: body, fontSize: 15, fontWeight: 500, color: TEXT, padding: '12px 0', borderBottom: `1px solid ${primary}10` }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .randevu-desktop-nav { display: none !important; }
          .randevu-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const { organization, menuCategories } = data;
  const primary = theme.primaryColor || PRIMARY;
  const secondary = theme.secondaryColor || SECONDARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  // Menyudan seçilmiş günün yeməkləri (maksimum 4 yemək)
  const allMenuItems = menuCategories?.flatMap(c => c.menuItems) || [];

  // Günün yeməkləri: isFeatured olaraq təyin edilmiş yeməklər
  const featuredDishes = allMenuItems.filter(m => m.isFeatured);

  // Əgər ayrıca heroDishId təyin edilibsə və siyahıda yoxdursa, əlavə et
  const designatedHeroDish = theme.heroDishId
    ? allMenuItems.find(m => m.id === theme.heroDishId)
    : null;

  const combinedDishes: MenuItem[] = [];
  if (designatedHeroDish) {
    combinedDishes.push(designatedHeroDish);
  }
  featuredDishes.forEach(d => {
    if (!combinedDishes.some(x => x.id === d.id)) {
      combinedDishes.push(d);
    }
  });

  // Əgər 4-dən azdırsa, populyar və ya digər menyu təamları ilə tamamla
  if (combinedDishes.length < 4) {
    allMenuItems.forEach(d => {
      if (combinedDishes.length < 4 && !combinedDishes.some(x => x.id === d.id)) {
        combinedDishes.push(d);
      }
    });
  }

  // Maksimum 4 yemək
  const heroDishes = combinedDishes.slice(0, 4);

  const dish1 = heroDishes[0] || null;
  const dish2 = heroDishes[1] || null;
  const dish3 = heroDishes[2] || null;
  const dish4 = heroDishes[3] || null;

  const dishCount = heroDishes.length;

  const badge = theme.heroBadgeText || 'AİLƏVİ VƏ PREMIUM LOUNGE TƏCRÜBƏSİ';
  const headline = theme.heroHeadline || organization.name;
  const sub = theme.heroSubheadline || organization.description || 'Ləziz təamlar, xüsusi qəhvə çeşidləri və isti ailəvi ab-hava.';
  const feat1 = theme.heroFeature1 || 'Ailəvi Mühit';
  const feat2 = theme.heroFeature2 || 'Zəngin Menyu';
  const feat3 = theme.heroFeature3 || 'Canlı Musiqi';
  const cta1 = theme.heroCta1 || 'Menyu ilə Tanışlıq';
  const cta2 = theme.heroCta2 || 'Rezervasiya Et';
  const rating = theme.heroRatingScore || '4.9';
  const ratingLabel = theme.heroRatingLabel || 'Xoşbəxt Qonaqlar';

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="hero"
      style={{ minHeight: '100vh', background: BG, paddingTop: 72, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '10%', left: '-5%', width: 500, height: 500, background: `radial-gradient(circle, ${primary}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 400, height: 400, background: `radial-gradient(circle, ${secondary}14 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }}>
        {/* Left: text */}
        <div>
          <span style={{ display: 'inline-block', background: `${primary}12`, color: primary, border: `1px solid ${primary}25`, borderRadius: 100, padding: '6px 16px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 24 }}>
            {badge}
          </span>
          <h1 style={{ fontFamily: heading, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, color: TEXT, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-0.02em' }}>
            {headline}
          </h1>
          <p style={{ fontFamily: body, fontSize: 17, color: `${TEXT}AA`, lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>{sub}</p>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              { label: feat1, icon: <Users size={14} /> },
              { label: feat2, icon: <Coffee size={14} /> },
              { label: feat3, icon: <Music size={14} /> },
            ].map(f => (
              <span key={f.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${primary}20`, borderRadius: 100, padding: '7px 14px', fontFamily: body, fontSize: 13, fontWeight: 600, color: TEXT }}>
                <span style={{ color: primary }}>{f.icon}</span> {f.label}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => scrollTo('menu')}
              style={{ background: primary, color: '#fff', border: 'none', borderRadius: 100, padding: '14px 28px', fontFamily: body, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 6px 24px ${primary}40` }}
            >
              {cta1}
            </button>
            <button
              onClick={() => scrollTo('reservation')}
              style={{ background: 'transparent', color: primary, border: `2px solid ${primary}`, borderRadius: 100, padding: '12px 26px', fontFamily: body, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              {cta2}
            </button>
          </div>

          {/* Rating card */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 36, background: '#fff', border: `1px solid ${primary}15`, borderRadius: 16, padding: '12px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={ACCENT} color={ACCENT} />)}
            </div>
            <div>
              <span style={{ fontFamily: heading, fontWeight: 800, fontSize: 20, color: TEXT }}>{rating}</span>
              <span style={{ fontFamily: body, fontSize: 12, color: `${TEXT}88`, marginLeft: 6 }}>{ratingLabel}</span>
            </div>
          </div>
        </div>

        {/* Right: bento image grid (maksimum 4 günün təamı) */}
        {dishCount >= 4 ? (
          /* 4 yemək olduqda: 2x2 bərabər kvadrat şəbəkə */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[dish1, dish2, dish3, dish4].map((dish, idx) => {
              if (!dish) return null;
              const img = dish.image || HERO_MAIN_IMG;
              return (
                <div
                  key={dish.id || idx}
                  style={{
                    position: 'relative',
                    borderRadius: 18,
                    overflow: 'hidden',
                    aspectRatio: '1/1',
                    background: '#e9e8e5',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <img src={img} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 45%)' }} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8,
                      background: 'rgba(255,255,255,0.92)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 10,
                      padding: '7px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 13, fontFamily: heading, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dish.name}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: body, fontWeight: 700, color: primary, marginLeft: 6, flexShrink: 0 }}>
                      {formatPrice(dish.discountPrice || dish.price, organization.currency || 'AZN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 1-3 yemək olduqda: bento düzülüş */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 12 }}>
            {/* 1-ci əsas yemək */}
            <div style={{ gridColumn: dish2 ? '1 / 2' : '1 / 3', gridRow: '1 / 3', position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: dish2 ? '4/5' : '16/10', background: '#e9e8e5' }}>
              <img src={dish1?.image || theme.heroMainImage || HERO_MAIN_IMG} alt={dish1?.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 50%)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontFamily: heading, fontWeight: 700, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dish1?.name || theme.heroDishTitle || 'Təam'}
                </span>
                {dish1 && (
                  <span style={{ fontSize: 13, fontFamily: body, fontWeight: 700, color: primary, marginLeft: 8, flexShrink: 0 }}>
                    {formatPrice(dish1.discountPrice || dish1.price, organization.currency || 'AZN')}
                  </span>
                )}
              </div>
            </div>
            {/* 2-ci yemək */}
            {dish2 && (
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '1/1', background: '#e9e8e5' }}>
                <img src={dish2.image || theme.heroImage2 || HERO_IMG2} alt={dish2.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 40%)' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontFamily: heading, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dish2.name}</span>
                  <span style={{ fontSize: 11, fontFamily: body, fontWeight: 700, color: primary, marginLeft: 6, flexShrink: 0 }}>
                    {formatPrice(dish2.discountPrice || dish2.price, organization.currency || 'AZN')}
                  </span>
                </div>
              </div>
            )}
            {/* 3-cü yemək */}
            {dish3 && (
              <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '1/1', background: '#e9e8e5' }}>
                <img src={dish3.image || theme.heroImage3 || HERO_IMG3} alt={dish3.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 40%)' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontFamily: heading, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dish3.name}</span>
                  <span style={{ fontSize: 11, fontFamily: body, fontWeight: 700, color: primary, marginLeft: 6, flexShrink: 0 }}>
                    {formatPrice(dish3.discountPrice || dish3.price, organization.currency || 'AZN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #hero > div { grid-template-columns: 1fr !important; }
          #hero > div > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}

// ─── About Section ───────────────────────────────────────────────────────────
function AboutSection({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const { organization } = data;
  const primary = theme.primaryColor || PRIMARY;
  const secondary = theme.secondaryColor || SECONDARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const badge = theme.aboutBadgeText || 'BİZİM HEKAYƏMİZ';
  const headline = theme.aboutHeadline || `${organization.name} Haqqında`;
  const body1 = theme.aboutBody1 || organization.description || 'Ailəniz və dostlarınızla rahat, lüks və səmimi bir mühitdə xoş xatirələr yaratmağınız üçün qurulmuşdur.';
  const body2 = theme.aboutBody2 || '';
  const imgUrl = theme.aboutImageUrl || ABOUT_IMG;
  const overlayTitle = theme.aboutBadgeOverlayTitle || 'MƏTBƏX SƏNƏTİ';
  const overlayText = theme.aboutBadgeOverlayText || 'Yalnız təbii nemətlər';

  const stats = [
    { value: theme.aboutStat1Value || '100+', label: theme.aboutStat1Label || 'Ləziz Təam' },
    { value: theme.aboutStat2Value || '50+', label: theme.aboutStat2Label || 'İsti & Soyuq İçki' },
    { value: theme.aboutStat3Value || '100%', label: theme.aboutStat3Label || 'Razı Qonaqlar' },
    { value: theme.aboutStat4Value || '7/24', label: theme.aboutStat4Label || 'Səmimi Qonaqpərvərlik' },
  ];

  return (
    <section id="about" style={{ padding: '100px 20px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        {/* Left: image */}
        <div style={{ position: 'relative' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '4/5' }}>
            <img src={imgUrl} alt="Chef" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {/* Overlay badge */}
          <div style={{ position: 'absolute', bottom: -20, right: -20, background: `linear-gradient(135deg, ${primary}, ${ACCENT})`, borderRadius: 20, padding: '20px 24px', boxShadow: `0 12px 40px ${primary}40`, maxWidth: 220 }}>
            <span style={{ display: 'block', fontFamily: body, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', marginBottom: 6 }}>{overlayTitle}</span>
            <span style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: '#fff' }}>{overlayText}</span>
          </div>
        </div>

        {/* Right: text */}
        <div>
          <span style={{ display: 'inline-block', background: `${primary}10`, color: primary, border: `1px solid ${primary}20`, borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 20 }}>
            {badge}
          </span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: 20 }}>{headline}</h2>
          <p style={{ fontFamily: body, fontSize: 16, color: `${TEXT}AA`, lineHeight: 1.75, marginBottom: 16 }}>{body1}</p>
          {body2 && <p style={{ fontFamily: body, fontSize: 16, color: `${TEXT}AA`, lineHeight: 1.75, marginBottom: 36 }}>{body2}</p>}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: BG, borderRadius: 16, padding: '20px', border: `1px solid ${primary}12` }}>
                <div style={{ fontFamily: heading, fontSize: 28, fontWeight: 800, color: primary, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontFamily: body, fontSize: 13, color: `${TEXT}99`, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #about > div { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Menu Section ────────────────────────────────────────────────────────────
function MenuSection({ data, theme, cart, onAddToCart, onOpenCart }: { data: SiteData; theme: ThemeConfig; cart: Record<string, { item: MenuItem; quantity: number }>; onAddToCart: (item: MenuItem) => void; onOpenCart: () => void; }) {
  const { organization, menuCategories } = data;
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const allCats = menuCategories.filter(c => c.isVisible);
  const [activeId, setActiveId] = useState(allCats[0]?.id || '');
  const activeCategory = allCats.find(c => c.id === activeId);
  const items = activeCategory?.menuItems || [];

  const badge = theme.menuBadgeText || 'QASTRO-TƏCRÜBƏ';
  const headline = theme.menuHeadline || 'Ləziz Menyumuz';
  const subtitle = theme.menuSubtitle || 'Hər biri təravətli yerli inqrediyentlərlə hazırlanan kulinariya şah əsərləri.';

  return (
    <section id="menu" style={{ padding: '100px 20px', background: BG }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', background: `${primary}10`, color: primary, border: `1px solid ${primary}20`, borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: TEXT, marginBottom: 12 }}>{headline}</h2>
          <p style={{ fontFamily: body, fontSize: 16, color: `${TEXT}AA`, maxWidth: 560, margin: '0 auto' }}>{subtitle}</p>
        </div>

        {/* Category chips */}
        {allCats.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            {allCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                style={{
                  background: activeId === cat.id ? primary : '#fff',
                  color: activeId === cat.id ? '#fff' : TEXT,
                  border: `1.5px solid ${activeId === cat.id ? primary : `${primary}25`}`,
                  borderRadius: 100, padding: '9px 20px',
                  fontFamily: body, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Items grid */}
        {items.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {items.map(item => (
              <MenuCard key={item.id} item={item} theme={theme} currency={organization.currency} data={data} cart={cart} onAddToCart={onAddToCart} onOpenCart={onOpenCart} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: `${TEXT}66`, fontFamily: body }}>
            Bu kateqoriyada məhsul yoxdur.
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #menu .menu-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1024px) {
          #menu .menu-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}

function MenuCard({ item, theme, currency, data, cart, onAddToCart, onOpenCart }: { item: MenuItem; theme: ThemeConfig; currency: string; data: SiteData; cart: Record<string, { item: MenuItem; quantity: number }>; onAddToCart: (item: MenuItem) => void; onOpenCart: () => void; }) {
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const price = item.discountPrice || item.price;
  const inCart = !!cart[item.id];
  const qty = cart[item.id]?.quantity || 0;
  const whatsapp = data.whatsapp;

  const orderViaWhatsApp = () => {
    if (!whatsapp?.phoneNumber) return;
    const p = item.discountPrice || item.price;
    const msg = `Salam! 1 ədəd *${item.name}* sifariş etmək istəyirəm.\nQiymət: ${p.toFixed(2)} ${data.organization.currency || 'AZN'}`;
    const url = formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, msg);
    window.open(url, '_blank');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: `1px solid ${primary}08`, transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
    >
      {item.image ? (
        <img src={item.image} alt={item.name} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 200, background: `linear-gradient(135deg, ${primary}12, ${ACCENT}12)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Coffee size={40} color={`${primary}40`} />
        </div>
      )}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <h3 style={{ fontFamily: heading, fontWeight: 700, fontSize: 16, color: TEXT, margin: 0, flex: 1 }}>{item.name}</h3>
          {item.isFeatured && (
            <span style={{ background: `${primary}15`, color: primary, borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700, marginLeft: 8, whiteSpace: 'nowrap' }}>Seçilmiş</span>
          )}
        </div>
        {item.description && (
          <p style={{ fontFamily: body, fontSize: 13, color: `${TEXT}88`, lineHeight: 1.5, marginBottom: 12 }}>{item.description}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontFamily: heading, fontWeight: 800, fontSize: 18, color: primary }}>{formatPrice(price, currency)}</span>
            {item.discountPrice && item.price > item.discountPrice && (
              <span style={{ fontFamily: body, fontSize: 13, color: `${TEXT}55`, textDecoration: 'line-through', marginLeft: 8 }}>{formatPrice(item.price, currency)}</span>
            )}
          </div>
          {inCart && (
            <span style={{ background: `${primary}15`, color: primary, borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
              {qty} ədəd
            </span>
          )}
        </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { onAddToCart(item); onOpenCart(); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: inCart ? primary : `${primary}12`,
              color: inCart ? '#fff' : primary,
              border: `1.5px solid ${primary}30`,
              borderRadius: 10, padding: '9px 12px',
              fontFamily: body, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {inCart ? <Check size={15} /> : <ShoppingCart size={15} />}
            {inCart ? 'Səbətə əlavə edildi' : 'Səbətə əlavə et'}
          </button>
          {whatsapp?.isEnabled && whatsapp.phoneNumber && (
            <button
              onClick={orderViaWhatsApp}
              title="WhatsApp ilə sifariş et"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#25D36615', color: '#25D366',
                border: '1.5px solid #25D36630',
                borderRadius: 10, padding: '9px 12px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <MessageCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Special Offers Section ──────────────────────────────────────────────────
function OffersSection({ data, theme }: { data?: SiteData; theme: ThemeConfig }) {
  const primary = theme.primaryColor || PRIMARY;
  const secondary = theme.secondaryColor || SECONDARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const currency = data?.organization?.currency || 'AZN';

  const badge = theme.offersBadgeText || 'ÖZƏL FÜRSƏTLƏR';
  const headline = theme.offersHeadline || 'Xüsusi Təkliflər və Paketlər';
  const subtitle = theme.offersSubtitle || 'Eksklüziv dəyər paketləri ilə hər anınızı daha dadlı və sərfəli edin.';

  const defaultGradients = [
    `linear-gradient(135deg, ${primary} 0%, #006040 100%)`,
    `linear-gradient(135deg, ${secondary} 0%, #7a1a1d 100%)`,
    `linear-gradient(135deg, ${ACCENT} 0%, #4a3c00 100%)`,
  ];

  const dbPackages = data?.packages && data.packages.length > 0 ? data.packages : null;

  const offers = dbPackages
    ? dbPackages.map((pkg, i) => {
        const p = pkg.discountPrice ?? pkg.price;
        const oldP = pkg.discountPrice && pkg.price ? pkg.price : undefined;
        return {
          tag: pkg.tag || 'XÜSUSİ TƏKLİF',
          time: undefined as string | undefined,
          title: pkg.title || pkg.name,
          desc: pkg.description || '',
          price: p !== null && p !== undefined ? formatPrice(p, currency) : undefined,
          oldPrice: oldP !== null && oldP !== undefined ? formatPrice(oldP, currency) : undefined,
          label: pkg.badgeText || undefined,
          gradient: defaultGradients[i % defaultGradients.length],
          image: pkg.image || undefined,
          features: Array.isArray(pkg.features) ? pkg.features : [],
        };
      })
    : [
        {
          tag: theme.offer1Tag || 'HƏFTƏ İÇİ',
          time: theme.offer1Time || '12:00 - 15:00',
          title: theme.offer1Title || 'Biznes Nahar',
          desc: theme.offer1Desc || 'Günün şorbası, ləziz isti yemək, təzə mövsüm salatı və içki.',
          price: theme.offer1Price || '12.00 ₼',
          oldPrice: undefined as string | undefined,
          label: undefined as string | undefined,
          gradient: `linear-gradient(135deg, ${primary} 0%, #006040 100%)`,
          image: undefined as string | undefined,
          features: [] as string[],
        },
        {
          tag: theme.offer2Tag || 'HƏFTƏSONU',
          time: undefined,
          title: theme.offer2Title || 'Ailəvi Paket',
          desc: theme.offer2Desc || '4 nəfərlik zəngin süfrə: qarışıq kabab seti, çay və desert.',
          price: theme.offer2Price || '55.00 ₼',
          oldPrice: theme.offer2OldPrice,
          label: theme.offer2Label || '4 Nəfərlik',
          gradient: `linear-gradient(135deg, ${secondary} 0%, #7a1a1d 100%)`,
          image: undefined as string | undefined,
          features: [] as string[],
        },
        {
          tag: theme.offer3Tag || 'TƏNTƏNƏLİ GÜNLƏR',
          time: undefined,
          title: theme.offer3Title || 'Ad Günü & Özəl Günlər',
          desc: theme.offer3Desc || 'VIP Lounge otağı, tematik masa dekorasiyası, fotozona.',
          price: undefined as string | undefined,
          oldPrice: undefined,
          label: theme.offer3Label || 'VIP Xidmət',
          gradient: `linear-gradient(135deg, ${ACCENT} 0%, #4a3c00 100%)`,
          image: undefined as string | undefined,
          features: [] as string[],
        },
      ];

  return (
    <section id="offers" style={{ padding: '100px 20px', background: '#1a1c1a' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>{headline}</h2>
          <p style={{ fontFamily: body, fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 560, margin: '0 auto' }}>{subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {offers.map((offer, i) => (
            <div
              key={i}
              style={{ borderRadius: 24, overflow: 'hidden', background: offer.gradient, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}
            >
              {offer.image && (
                <img
                  src={offer.image}
                  alt={offer.title}
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 16, marginBottom: 4 }}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '4px 12px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>{offer.tag}</span>
                {offer.label && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8, padding: '4px 12px', fontFamily: body, fontSize: 11, fontWeight: 700 }}>{offer.label}</span>
                )}
              </div>
              {offer.time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontFamily: body, fontSize: 13 }}>
                  <Clock size={14} /> {offer.time}
                </div>
              )}
              <h3 style={{ fontFamily: heading, fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>{offer.title}</h3>
              {offer.desc && <p style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{offer.desc}</p>}

              {offer.features && offer.features.length > 0 && (
                <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {offer.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: body }}>
                      <Check size={14} color="#34D399" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  {offer.price && <span style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: '#fff' }}>{offer.price}</span>}
                  {offer.oldPrice && <span style={{ fontFamily: body, fontSize: 15, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginLeft: 10 }}>{offer.oldPrice}</span>}
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('reservation') || document.getElementById('contact');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100, padding: '10px 18px', fontFamily: body, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Rezervasiya Et <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Gallery Section ─────────────────────────────────────────────────────────
function GallerySection({ theme, items }: { theme: ThemeConfig; items?: Array<{ id?: string; url: string; title?: string | null }> }) {
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const defaultImages = [
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', title: 'Qəhvə Barı' },
    { url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80', title: 'İsti Atmosfer' },
    { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', title: 'Ləziz Təamlar' },
    { url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80', title: 'Xüsusi Qonaq Otağı' },
    { url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80', title: 'Gourmet Menyusu' },
    { url: 'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=600&q=80', title: 'Açıq Hava Terrası' },
  ];

  const displayList = items && items.length > 0 ? items : defaultImages;

  return (
    <section id="gallery" style={{ padding: '100px 20px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', background: `${primary}10`, color: primary, border: `1px solid ${primary}20`, borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>QALEREYA</span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: TEXT }}>Məkanımızdan Görüntülər</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {displayList.map((item, i) => (
            <div
              key={i}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                aspectRatio: '4/3',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                background: '#f5f5f7',
              }}
            >
              <img
                src={item.url}
                alt={item.title || `Qalereya ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
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
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                    color: '#fff',
                    fontFamily: body,
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
  );
}

// ─── Reservation Section ─────────────────────────────────────────────────────
function ReservationSection({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const [form, setForm] = useState({ name: '', phone: '', date: '', time: '', guests: '2', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const badge = theme.reservationBadgeText || 'MASA REZERVASIYASI';
  const headline = theme.reservationHeadline || 'Masanızı İndi Ayırın';
  const subtitle = theme.reservationSubtitle || 'Rahat və sürətli rezervasiya sistemi ilə masanızı əvvəlcədən ayırın.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);

    try {
      // Send reservation inquiry to dashboard Inquiries API
      await fetch(`/api/site/${data.organization.slug}/contact`, {
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

      // Optional WhatsApp redirect if enabled
      if (data.whatsapp?.isEnabled && data.whatsapp.phoneNumber) {
        const msg = `Rezervasiya tələbi:\nAd: ${form.name}\nTelefon: ${form.phone}\nTarix: ${form.date}\nSaat: ${form.time}\nQonaq sayı: ${form.guests}${form.notes ? `\nQeyd: ${form.notes}` : ''}`;
        const url = formatWhatsAppUrl(data.whatsapp.countryCode, data.whatsapp.phoneNumber, msg);
        window.open(url, '_blank');
      }

      setSubmitted(true);
      setForm({ name: '', phone: '', date: '', time: '', guests: '2', notes: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Reservation submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${primary}20`, background: '#fff',
    fontFamily: body, fontSize: 14, color: TEXT, outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: body, fontSize: 13, fontWeight: 600, color: `${TEXT}CC`, marginBottom: 6, display: 'block',
  };

  return (
    <section id="reservation" style={{ padding: '100px 20px', background: BG }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', background: `${primary}10`, color: primary, border: `1px solid ${primary}20`, borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: TEXT, marginBottom: 12 }}>{headline}</h2>
          <p style={{ fontFamily: body, fontSize: 16, color: `${TEXT}AA` }}>{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 24, padding: '40px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', border: `1px solid ${primary}10` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Ad, Soyad *</label>
              <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Adınız" />
            </div>
            <div>
              <label style={labelStyle}>Telefon *</label>
              <input required style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+994 XX XXX XX XX" />
            </div>
            <div>
              <label style={labelStyle}>Tarix *</label>
              <input required type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Saat *</label>
              <input required type="time" style={inputStyle} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Qonaq sayı</label>
              <select style={inputStyle} value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })}>
                {['1','2','3','4','5','6','7','8','10+'].map(n => <option key={n} value={n}>{n} nəfər</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Qeyd</label>
              <input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Xüsusi tələblər..." />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ marginTop: 28, width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 100, padding: '16px', fontFamily: body, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: `0 6px 24px ${primary}40`, opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Göndərilir...' : submitted ? '✓ Rezervasiya qəbul edildi!' : 'Masanı Ayır'}
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          #reservation form > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Contact Section ─────────────────────────────────────────────────────────
function ContactSection({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const { organization, workingHours } = data;
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const badge = theme.contactBadgeText || 'BİZİ ZİYARƏT EDİN';
  const headline = theme.contactHeadline || 'Ünvan və Əlaqə';
  const subtitle = theme.contactSubtitle || 'Məkanımızda sizi gözləyirik.';

  const infoCards = [
    { icon: <MapPin size={22} color={primary} />, label: 'Ünvan', value: organization.address || 'Ünvan göstərilməyib' },
    { icon: <Phone size={22} color={primary} />, label: 'Telefon', value: organization.phone || '' },
    { icon: <Clock size={22} color={primary} />, label: 'İş saatları', value: theme.workingHoursSubtitle || 'Həftəlik iş qrafiki' },
  ].filter(c => c.value);

  return (
    <section id="contact" style={{ padding: '100px 20px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', background: `${primary}10`, color: primary, border: `1px solid ${primary}20`, borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: TEXT, marginBottom: 12 }}>{headline}</h2>
          <p style={{ fontFamily: body, fontSize: 16, color: `${TEXT}AA`, maxWidth: 540, margin: '0 auto' }}>{subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {infoCards.map((card, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, background: BG, borderRadius: 16, padding: '20px 24px', border: `1px solid ${primary}12` }}>
                <div style={{ background: `${primary}12`, borderRadius: 12, padding: 12, flexShrink: 0 }}>{card.icon}</div>
                <div>
                  <div style={{ fontFamily: body, fontSize: 12, fontWeight: 700, color: `${TEXT}88`, letterSpacing: '0.06em', marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontFamily: body, fontSize: 15, fontWeight: 600, color: TEXT }}>{card.value}</div>
                </div>
              </div>
            ))}

            {/* Working hours */}
            {workingHours.length > 0 && (
              <div style={{ background: BG, borderRadius: 16, padding: '20px 24px', border: `1px solid ${primary}12` }}>
                <div style={{ fontFamily: body, fontSize: 12, fontWeight: 700, color: `${TEXT}88`, letterSpacing: '0.06em', marginBottom: 12 }}>HƏFTƏLIK QRAFIK</div>
                {workingHours.map(wh => (
                  <div key={wh.dayOfWeek} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${primary}08`, fontFamily: body, fontSize: 13 }}>
                    <span style={{ color: `${TEXT}CC` }}>{DAY_NAMES[wh.dayOfWeek]}</span>
                    <span style={{ fontWeight: 700, color: wh.isClosed ? '#e74c3c' : primary }}>{wh.isClosed ? 'Bağlı' : `${wh.openTime} – ${wh.closeTime}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map placeholder */}
          <div style={{ borderRadius: 24, overflow: 'hidden', height: 400, background: `linear-gradient(135deg, ${primary}10, ${ACCENT}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${primary}15` }}>
            {organization.mapUrl ? (
              <iframe
                src={organization.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <MapPin size={40} color={`${primary}60`} />
                <p style={{ fontFamily: body, fontSize: 14, color: `${TEXT}66`, marginTop: 12 }}>Xəritə əlavə edilməyib</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #contact > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const { organization, socialLinks } = data;
  const primary = theme.primaryColor || PRIMARY;
  const secondary = theme.secondaryColor || SECONDARY;
  const footerBg = theme.footerBgColor || '#2f312f';
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const copyright = theme.footerCopyrightText || `© ${new Date().getFullYear()} ${organization.name}. Bütün hüquqlar qorunur.`;
  const platform = theme.footerPlatformText || 'Sayt SiteX platforması ilə yaradılıb';
  const tagline = theme.footerTagline || organization.description || '';

  return (
    <footer style={{ background: footerBg, padding: '60px 20px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {organization.logo ? (
                <img src={organization.logo} alt={organization.name} style={{ height: 48, width: 48, objectFit: 'contain', borderRadius: 10 }} />
              ) : (
                <div style={{ width: 48, height: 48, background: `linear-gradient(135deg, ${primary}, ${secondary})`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coffee size={20} color="#fff" />
                </div>
              )}
              <span style={{ fontFamily: heading, fontWeight: 700, fontSize: 20, color: '#fff' }}>{organization.name}</span>
            </div>
            {tagline && <p style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 280, marginBottom: 20 }}>{tagline}</p>}
            {/* Socials */}
            <div style={{ display: 'flex', gap: 10 }}>
              {socialLinks.filter(s => ['instagram', 'facebook'].includes(s.platform.toLowerCase())).map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `rgba(${primary === '#004527' ? '0,69,39' : '255,255,255'},0.25)`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
                >
                  {s.platform.toLowerCase() === 'instagram' ? <Instagram size={18} /> : <Facebook size={18} />}
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 style={{ fontFamily: heading, fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 16 }}>Keçidlər</h4>
            {[
              { id: 'about', label: 'Haqqımızda' },
              ...(data.moduleSettings?.menu !== false ? [{ id: 'menu', label: 'Menyu' }] : []),
              ...(data.moduleSettings?.packages !== false ? [{ id: 'offers', label: 'Təkliflər' }] : []),
              ...(data.moduleSettings?.gallery !== false && Boolean(data.galleryItems && data.galleryItems.length > 0) ? [{ id: 'gallery', label: 'Qalereya' }] : []),
              ...(data.moduleSettings?.contact !== false ? [{ id: 'reservation', label: 'Rezervasiya' }] : []),
              { id: 'contact', label: 'Əlaqə' },
            ].map(l => (
              <div key={l.id} style={{ marginBottom: 10 }}>
                <a href="#" style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
                  onClick={e => { e.preventDefault(); document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                >{l.label}</a>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: heading, fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 16 }}>Əlaqə</h4>
            {organization.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Phone size={14} color="rgba(255,255,255,0.5)" />
                <a href={`tel:${organization.phone}`} style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{organization.phone}</a>
              </div>
            )}
            {organization.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                <MapPin size={14} color="rgba(255,255,255,0.5)" style={{ marginTop: 2 }} />
                <span style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{organization.address}</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: body, fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{copyright}</p>
          <p style={{ fontFamily: body, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{platform}</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}

// ─── WhatsApp Button ──────────────────────────────────────────────────────────
function WhatsAppFloat({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const whatsapp = data.whatsapp;
  if (!whatsapp?.isEnabled || !whatsapp.phoneNumber) return null;
  const url = formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, whatsapp.orderMessage || 'Salam!');
  const waBg = theme.whatsappColor || '#25D366';
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: waBg, color: '#fff', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${waBg}60`, textDecoration: 'none', transition: 'transform 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
    >
      <MessageCircle size={26} />
    </a>
  );
}

// ─── Cart Drawer ─────────────────────────────────────────────────────────────
function CartDrawer({
  isOpen, onClose, cart, onUpdateQty, onRemove, onClear,
  theme, whatsapp, currency, restaurantName,
}: {
  isOpen: boolean; onClose: () => void;
  cart: Record<string, { item: MenuItem; quantity: number }>;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  theme: ThemeConfig; whatsapp: SiteData['whatsapp'];
  currency: string; restaurantName: string;
}) {
  const primary = theme.primaryColor || PRIMARY;
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const heading = theme.headingFont || 'Playfair Display';
  const [note, setNote] = useState('');
  const entries = Object.values(cart);
  const totalCount = entries.reduce((s, e) => s + e.quantity, 0);
  const totalSum = entries.reduce((s, e) => s + (e.item.discountPrice || e.item.price) * e.quantity, 0);

  const buildWhatsAppUrl = () => {
    if (!whatsapp?.phoneNumber) return '#';
    let text = `Salam! *${restaurantName}* üçün sifariş vermek isteyirem:\n\n🍽️ *SİFARİŞİM:*\n`;
    entries.forEach((e, idx) => {
      const p = e.item.discountPrice || e.item.price;
      text += `${idx + 1}. *${e.item.name}* — ${e.quantity} ədəd x ${p.toFixed(2)} ${currency} = ${(p * e.quantity).toFixed(2)} ${currency}\n`;
    });
    text += `\n💰 *CƏMİ:* ${totalSum.toFixed(2)} ${currency}`;
    if (note.trim()) text += `\n📝 *Qeyd:* ${note.trim()}`;
    return formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, text);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', width: '100%', maxWidth: 420, height: '100%',
          display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={22} color={primary} />
            <h3 style={{ fontFamily: heading, fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Səbətiniz</h3>
            <span style={{ background: `${primary}20`, color: primary, fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{totalCount}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {entries.length > 0 && (
              <button onClick={onClear} style={{ border: 'none', background: 'transparent', color: '#F87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Təmizlə</button>
            )}
            <button onClick={onClose} style={{ border: 'none', background: '#f0f0f0', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="#555" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
              <ShoppingCart size={48} style={{ display: 'block', marginBottom: 16, opacity: 0.2 }} color={primary} />
              <p style={{ fontFamily: body, fontSize: 15, color: '#888', margin: 0 }}>Səbət boşdur</p>
              <p style={{ fontFamily: body, fontSize: 13, color: '#aaa', marginTop: 6 }}>Menyudan məhsul seçin</p>
            </div>
          ) : (
            entries.map(({ item, quantity }) => (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9f9f9', borderRadius: 12, alignItems: 'center' }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: body, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontFamily: body, fontSize: 12, color: primary, fontWeight: 700, margin: 0 }}>{((item.discountPrice || item.price) * quantity).toFixed(2)} {currency}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onUpdateQty(item.id, quantity - 1)} style={{ width: 28, height: 28, border: `1px solid ${primary}30`, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Minus size={12} color={primary} />
                  </button>
                  <span style={{ fontFamily: body, fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, quantity + 1)} style={{ width: 28, height: 28, border: 'none', background: primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={12} color="#fff" />
                  </button>
                  <button onClick={() => onRemove(item.id)} style={{ width: 28, height: 28, border: 'none', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 4 }}>
                    <Trash2 size={12} color="#EF4444" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {entries.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${primary}15`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Qeyd (isteɣe bağlı)..."
              rows={2}
              style={{ width: '100%', border: `1px solid ${primary}25`, borderRadius: 10, padding: '10px 12px', fontFamily: body, fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: body, fontSize: 14, color: '#555' }}>Cəmi</span>
              <span style={{ fontFamily: heading, fontSize: 20, fontWeight: 800, color: primary }}>{totalSum.toFixed(2)} {currency}</span>
            </div>
            {whatsapp?.isEnabled && whatsapp.phoneNumber ? (
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#25D366', color: '#fff',
                  borderRadius: 12, padding: '14px', textDecoration: 'none',
                  fontFamily: body, fontSize: 15, fontWeight: 700,
                }}
              >
                <MessageCircle size={18} />
                WhatsApp ilə sifariş et
              </a>
            ) : (
              <div style={{ textAlign: 'center', fontFamily: body, fontSize: 13, color: '#aaa', padding: '8px' }}>
                WhatsApp sifarisi aktiv deyil
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RandevuCafeSite({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [cart, setCart] = useState<Record<string, { item: MenuItem; quantity: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const fontsUrl = getGoogleFontsUrl(theme);
  const moduleSettings = data.moduleSettings || {};
  const showMenu = moduleSettings.menu !== false;
  const showPackages = moduleSettings.packages !== false;
  const showGallery = moduleSettings.gallery !== false && Boolean(data.galleryItems && data.galleryItems.length > 0);
  const showContact = moduleSettings.contact !== false;

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev[item.id];
      return { ...prev, [item.id]: { item, quantity: (existing?.quantity || 0) + 1 } };
    });
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setCart(prev => ({ ...prev, [id]: { ...prev[id], quantity: qty } }));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const clearCart = () => setCart({});
  const cartCount = Object.values(cart).reduce((s, e) => s + e.quantity, 0);

  useEffect(() => {
    const sections = ['hero', 'about', ...(showMenu ? ['menu'] : []), ...(showPackages ? ['offers'] : []), ...(showGallery ? ['gallery'] : []), ...(showContact ? ['reservation'] : []), 'contact'];
    const observers = sections.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontsUrl} rel="stylesheet" />
      </Head>

      <div style={{ background: theme.siteBgColor || BG, minHeight: '100vh' }}>
        <Header data={data} theme={theme} activeSection={activeSection} />
        <HeroSection data={data} theme={theme} />
        <AboutSection data={data} theme={theme} />
        {showMenu && <MenuSection data={data} theme={theme} cart={cart} onAddToCart={addToCart} onOpenCart={() => setIsCartOpen(true)} />}
        {showPackages && <OffersSection data={data} theme={theme} />}
        {showGallery && <GallerySection theme={theme} items={data.galleryItems} />}
        {showContact && <ReservationSection data={data} theme={theme} />}
        <ContactSection data={data} theme={theme} />
        <Footer data={data} theme={theme} />
        <WhatsAppFloat data={data} theme={theme} />
        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'fixed', bottom: 90, right: 24, zIndex: 998,
              background: theme.primaryColor || PRIMARY,
              color: '#fff', border: 'none', borderRadius: '50%',
              width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: `0 4px 20px ${(theme.primaryColor || PRIMARY)}60`,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            <ShoppingCart size={24} />
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: '#EF4444', color: '#fff',
              borderRadius: '50%', width: 20, height: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 800,
            }}>{cartCount}</span>
          </button>
        )}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
          theme={theme}
          whatsapp={data.whatsapp}
          currency={data.organization.currency || 'AZN'}
          restaurantName={data.organization.name}
        />
      </div>
    </>
  );
}
