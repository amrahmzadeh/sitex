'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Phone, MapPin, Clock, Instagram, Facebook, MessageCircle, Menu, X, Star, ChevronRight, Users, Coffee, Music, Award } from 'lucide-react';
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

  const navLinks = [
    { id: 'hero', label: 'Ana Səhifə' },
    { id: 'about', label: 'Haqqımızda' },
    { id: 'menu', label: 'Menyu' },
    { id: 'offers', label: 'Təkliflər' },
    { id: 'gallery', label: 'Qalereya' },
    { id: 'reservation', label: 'Rezervasiya' },
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
          <button
            onClick={() => scrollTo('reservation')}
            style={{ background: primary, color: '#fff', border: 'none', borderRadius: 100, padding: '10px 20px', fontFamily: body, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Rezervasiya
          </button>
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
  const { organization } = data;
  const primary = theme.primaryColor || PRIMARY;
  const secondary = theme.secondaryColor || SECONDARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const mainImg = theme.heroMainImage || HERO_MAIN_IMG;
  const img2 = theme.heroImage2 || HERO_IMG2;
  const img3 = theme.heroImage3 || HERO_IMG3;
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
  const mainLabel = theme.heroMainImageLabel || 'Özel Dad Palitrası';
  const mainBadge = theme.heroMainImageBadge || 'Gündəlik Təzə';
  const img2Label = theme.heroImage2Label || 'Arabika Qəhvəsi';
  const img3Label = theme.heroImage3Label || 'Səmimi Mühit';

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

        {/* Right: bento image grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 12 }}>
          {/* Main large image */}
          <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3', position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5' }}>
            <img src={mainImg} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '8px 14px' }}>
              <span style={{ display: 'block', fontSize: 10, fontFamily: body, color: primary, fontWeight: 700, letterSpacing: '0.05em' }}>{mainBadge}</span>
              <span style={{ fontSize: 13, fontFamily: heading, fontWeight: 700, color: TEXT }}>{mainLabel}</span>
            </div>
          </div>
          {/* Top-right image */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '1/1' }}>
            <img src={img2} alt="Coffee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 12px' }}>
              <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: TEXT }}>{img2Label}</span>
            </div>
          </div>
          {/* Bottom-right image */}
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '1/1' }}>
            <img src={img3} alt="Ambiance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 12px' }}>
              <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: TEXT }}>{img3Label}</span>
            </div>
          </div>
        </div>
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
function MenuSection({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
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
              <MenuCard key={item.id} item={item} theme={theme} currency={organization.currency} />
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

function MenuCard({ item, theme, currency }: { item: MenuItem; theme: ThemeConfig; currency: string }) {
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';
  const price = item.discountPrice || item.price;

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: heading, fontWeight: 800, fontSize: 18, color: primary }}>{formatPrice(price, currency)}</span>
            {item.discountPrice && item.price > item.discountPrice && (
              <span style={{ fontFamily: body, fontSize: 13, color: `${TEXT}55`, textDecoration: 'line-through', marginLeft: 8 }}>{formatPrice(item.price, currency)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Special Offers Section ──────────────────────────────────────────────────
function OffersSection({ theme }: { theme: ThemeConfig }) {
  const primary = theme.primaryColor || PRIMARY;
  const secondary = theme.secondaryColor || SECONDARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const badge = theme.offersBadgeText || 'ÖZƏL FÜRSƏTLƏR';
  const headline = theme.offersHeadline || 'Xüsusi Təkliflər';
  const subtitle = theme.offersSubtitle || 'Eksklüziv dəyər paketləri ilə hər anınızı daha dadlı edin.';

  const offers = [
    {
      tag: theme.offer1Tag || 'HƏFTƏ İÇİ',
      time: theme.offer1Time || '12:00 - 15:00',
      title: theme.offer1Title || 'Biznes Nahar',
      desc: theme.offer1Desc || 'Günün şorbası, ləziz isti yemək, təzə mövsüm salatı və içki.',
      price: theme.offer1Price || '12.00 ₼',
      oldPrice: undefined as string | undefined,
      label: undefined as string | undefined,
      gradient: `linear-gradient(135deg, ${primary} 0%, #006040 100%)`,
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {offers.map((offer, i) => (
            <div
              key={i}
              style={{ borderRadius: 24, overflow: 'hidden', background: offer.gradient, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}
            >
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
              <p style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 }}>{offer.desc}</p>
              {(offer.price || offer.oldPrice) && (
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  {offer.price && <span style={{ fontFamily: heading, fontWeight: 800, fontSize: 28, color: '#fff' }}>{offer.price}</span>}
                  {offer.oldPrice && <span style={{ fontFamily: body, fontSize: 15, color: 'rgba(255,255,255,0.5)', textDecoration: 'line-through', marginLeft: 10 }}>{offer.oldPrice}</span>}
                </div>
              )}
              {!offer.price && (
                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100, padding: '10px 20px', fontFamily: body, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    Rezervasiya Et <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #offers .offers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ─── Gallery Section ─────────────────────────────────────────────────────────
function GallerySection({ theme }: { theme: ThemeConfig }) {
  const primary = theme.primaryColor || PRIMARY;
  const heading = theme.headingFont || 'Playfair Display';
  const body = theme.bodyFont || 'Plus Jakarta Sans';

  const images = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
    'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80',
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80',
    'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=600&q=80',
  ];

  return (
    <section id="gallery" style={{ padding: '100px 20px', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', background: `${primary}10`, color: primary, border: `1px solid ${primary}20`, borderRadius: 100, padding: '5px 14px', fontFamily: body, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>QALEREYA</span>
          <h2 style={{ fontFamily: heading, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: TEXT }}>Məkanımızdan Görüntülər</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {images.map((img, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: i === 0 || i === 4 ? '16/10' : '1/1' }}>
              <img src={img} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
              />
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
  const [submitted, setSubmitted] = useState(false);

  const badge = theme.reservationBadgeText || 'MASA REZERVASIYASI';
  const headline = theme.reservationHeadline || 'Masanızı İndi Ayırın';
  const subtitle = theme.reservationSubtitle || 'Rahat və sürətli rezervasiya sistemi ilə masanızı əvvəlcədən ayırın.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // WhatsApp redirect
    if (data.whatsapp?.isEnabled && data.whatsapp.phoneNumber) {
      const msg = `Rezervasiya tələbi:\nAd: ${form.name}\nTelefon: ${form.phone}\nTarix: ${form.date}\nSaat: ${form.time}\nQonaq sayı: ${form.guests}${form.notes ? `\nQeyd: ${form.notes}` : ''}`;
      const url = formatWhatsAppUrl(data.whatsapp.countryCode, data.whatsapp.phoneNumber, msg);
      window.open(url, '_blank');
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
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
            style={{ marginTop: 28, width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 100, padding: '16px', fontFamily: body, fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 6px 24px ${primary}40` }}
          >
            {submitted ? '✓ Rezervasiya talebi göndərildi!' : 'Masanı Ayır'}
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
            {['Haqqımızda', 'Menyu', 'Rezervasiya', 'Əlaqə'].map(l => (
              <div key={l} style={{ marginBottom: 10 }}>
                <a href="#" style={{ fontFamily: body, fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
                  onClick={e => { e.preventDefault(); document.getElementById(l === 'Haqqımızda' ? 'about' : l === 'Menyu' ? 'menu' : l === 'Rezervasiya' ? 'reservation' : 'contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                >{l}</a>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RandevuCafeSite({ data, theme }: { data: SiteData; theme: ThemeConfig }) {
  const [activeSection, setActiveSection] = useState('hero');
  const fontsUrl = getGoogleFontsUrl(theme);

  useEffect(() => {
    const sections = ['hero', 'about', 'menu', 'offers', 'gallery', 'reservation', 'contact'];
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
        <MenuSection data={data} theme={theme} />
        <OffersSection theme={theme} />
        <GallerySection theme={theme} />
        <ReservationSection data={data} theme={theme} />
        <ContactSection data={data} theme={theme} />
        <Footer data={data} theme={theme} />
        <WhatsAppFloat data={data} theme={theme} />
      </div>
    </>
  );
}
