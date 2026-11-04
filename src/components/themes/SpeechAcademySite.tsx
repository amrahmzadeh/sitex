'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, MapPin, Send, ArrowRight, ArrowUpRight,
  Menu, X, Mic, Award, Headphones, Star, Radio,
  Sparkles, CheckCircle2, ChevronDown, Check
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { SiteData } from './RestaurantSite';
import { formatPrice, formatWhatsAppUrl } from '@/lib/utils';
import SplashScreen from './SplashScreen';
import SocialMediaFeed from './SocialMediaFeed';

interface SpeechAcademySiteProps {
  data: SiteData;
  theme: ThemeConfig;
}

export default function SpeechAcademySite({ data, theme }: SpeechAcademySiteProps) {
  const { organization, whatsapp, socialLinks, menuCategories } = data;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('diksiya');
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    service: 'diksiya',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Theme Colors & Accents
  const primaryColor = theme.primaryColor || '#765a26';
  const secondaryColor = theme.secondaryColor || '#101c2e';
  const accentColor = theme.accentColor || '#e6c184';
  const bgColor = theme.backgroundColor || '#fcf9f8';
  const textColor = theme.textColor || '#1b1b1c';
  const headingFont = theme.headingFont || 'Playfair Display';
  const bodyFont = theme.bodyFont || 'Manrope';
  const brandFont = theme.brandFont || 'Playfair Display';

  // Content Customizations
  const heroBadge = theme.heroBadgeText || 'PEŞƏKAR NİTQ MƏDƏNİYYƏTİ VƏ NATİQLİK';
  const heroStat1 = theme.heroFeature1 || '10+ illik təcrübə';
  const heroStat2 = theme.heroFeature2 || '500+ məzun';
  const heroStat3 = theme.heroFeature3 || '100+ mötəbər tədbir';

  const defaultHeroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuANbKfhgJiJaQWxonyHpqyiuG_8xAtkaGR4HdgzZ80RfKLoxVjufA75yQcMh9pZqg-fZ4Mf9ajAlgBZKh30jO1_qqzx792KT0mIeLS6EMBWwqiHi85CS-8G-5cke5HuI2J5jP_EyClESq0krSvpbhMnm0MfH3Pm7J5Du7Oik6ZqD9h2eGT7u8dTZaqQDPAN3TJBObTLD-pU2feANU47-TQedwn5H7V49Ha1kXxaR2E';
  const heroImage = theme.headerImageUrl || theme.heroDishImage || defaultHeroImage;

  const defaultAboutImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnu2hiAntH63v2-yVMg5PySCayGVDJSgPW0_n1XznNqOgmyV-_fg7ons8J3zhMEIXv1VzX1Ixuqki2z86OvRilCqI9BL1FoQpg7zZz7qzXb0bD1oDsamo85mGdR-cc9LdKaDunFcLBa1wzNcfwkeWLJRsLrqTC6ZUijoXKXO3cs8UfO-cqSq6fswqshjrHKO32b2IJ-7d1eQeD6GS9bnTYV03HaadlquLYjkJOkuA';
  const aboutImage = theme.aboutImageUrl || defaultAboutImage;

  const pillar1Title = theme.aboutFeature1Title || '01 / TƏLİM';
  const pillar1Desc = theme.aboutFeature1Desc || 'Fərdi və korporativ təlimlər: dəqiq artikulyasiya və inamlı səhnə duruşu.';
  const pillar2Title = theme.aboutFeature2Title || '02 / SƏHNƏ';
  const pillar2Desc = theme.aboutFeature2Desc || 'Dövlət və özəl tədbirlər: yüksək səviyyəli rəsmi protokola uyğun aparıcılıq.';
  const pillar3Title = theme.heroDishTitle || '03 / SƏS';
  const pillar3Desc = theme.heroDishSubtitle || 'Reklam və korporativ səsləndirmə: emosional dərinlik və kristal təmiz səs tonu.';

  const contactDesc = theme.contactSubtitle || 'Təlimlərə yazılmaq, tədbirlərin aparıcılığı və ya səsləndirmə layihələri üçün müraciət edin. Sizinlə unikal layihələr yaratmağa şadıq.';
  const copyrightText = theme.footerCopyrightText || `© ${new Date().getFullYear()} ${organization.name}. Bütün hüquqlar qorunur.`;
  const platformText = theme.footerPlatformText || 'Sayt SiteX platforması ilə yaradılıb';

  const hasGallery = Boolean(data.galleryItems && data.galleryItems.length > 0);
  const _ms = (data.moduleSettings || {}) as Record<string, boolean>;
  const showGallery = _ms.gallery !== false && hasGallery;
  const showContact = _ms.contact !== false;

  // Navigation Items (Menyu yerinə Xidmətlər)
  const navItems = [
    { href: '#hero', label: 'Ana səhifə' },
    { href: '#haqqimda', label: 'Haqqımda' },
    { href: '#xidmetler', label: 'Xidmətlər' },
    ...(showGallery ? [{ href: '#qalereya', label: 'Qalereya' }] : []),
    ...(showContact ? [{ href: '#elaqe', label: 'Əlaqə' }] : []),
  ];

  // Real or Fallback Services
  const defaultServices = [
    {
      id: 'diksiya',
      badge: 'Fərdi və korporativ səviyyədə',
      title: 'Diksiya təlimləri',
      description: 'Düzgün tənəffüs, aydın artikulyasiya, nitq qüsurlarının aradan qaldırılması və səhnə qorxusuna qalib gəlmək texnikaları.',
      tag: 'Tədris proqramı',
      icon: Mic,
    },
    {
      id: 'apariciliq',
      badge: 'Dövlət və özəl tədbirlər, brend təqdimatları',
      title: 'Tədbir aparıcılığı',
      description: 'Beynəlxalq forumlar, dövlət səviyyəli konfranslar, korporativ qala gecələri və nüfuzlu təqdimatların zərif idarə olunması.',
      tag: 'Protokol və moderatorluq',
      icon: Award,
    },
    {
      id: 'seslendirme',
      badge: 'Reklam çarxları, korporativ videolar və layihələr',
      title: 'Peşəkar səsləndirmə',
      description: 'Radio və TV reklamları, korporativ imic filmləri, audio kitablar və sənədli layihələr üçün unikal tembr və diksiya.',
      tag: 'Studiya keyfiyyəti',
      icon: Headphones,
    },
    {
      id: 'brend',
      badge: 'Yaradıcı vizual layihələr və reklam kampaniyaları',
      title: 'Brend siması',
      description: 'Nüfuzlu brendlərin imic çəkilişləri, sosial çarxlar və ictimaiyyətlə əlaqələr layihələrində estetik və inamlı təmsilçilik.',
      tag: 'Brend əməkdaşlığı',
      icon: Star,
    },
  ];

  const getItemIcon = (name: string, idx: number) => {
    const n = (name || '').toLowerCase();
    if (n.includes('diksiya') || n.includes('nitq') || n.includes('təlim')) return Mic;
    if (n.includes('aparıcı') || n.includes('tədbir') || n.includes('konfrans')) return Award;
    if (n.includes('səs') || n.includes('audio') || n.includes('radio')) return Headphones;
    if (n.includes('brend') || n.includes('sima') || n.includes('reklam')) return Star;
    const fallbackIcons = [Mic, Award, Headphones, Star];
    return fallbackIcons[idx % fallbackIcons.length];
  };

  // Map real catalog items to service cards if present
  const allCatalogItems = useMemo(() => {
    return menuCategories.flatMap((cat) =>
      cat.menuItems.map((item) => ({
        ...item,
        categoryName: cat.name,
      }))
    );
  }, [menuCategories]);

  const hasCatalogItems = allCatalogItems.length > 0;

  const scrollTo = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`/api/site/${organization.slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formState.fullName,
          phone: formState.phone,
          email: formState.email || (formState.phone.includes('@') ? formState.phone : undefined),
          service: formState.service,
          message: formState.message,
        }),
      });
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
    if (whatsapp?.isEnabled && whatsapp.phoneNumber) {
      const msg = `Salam! Saytınızdan müraciət edirəm:\n👤 *Ad:* ${formState.fullName}\n📱 *Əlaqə:* ${formState.phone}\n💼 *Xidmət:* ${formState.service}\n💬 *Mesaj:* ${formState.message}`;
      const url = formatWhatsAppUrl(whatsapp.countryCode || '994', whatsapp.phoneNumber, msg);
      window.open(url, '_blank');
    }
    setSubmitted(true);
  };

  return (
    <div
      className="speech-academy-root"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: bodyFont,
        position: 'relative',
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Splash Screen Support */}
      {data.website.splashEnabled && data.website.splashConfig && (
        <SplashScreen config={data.website.splashConfig} siteSlug={organization.slug} />
      )}

      {/* Embedded Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href={`https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap`}
        rel="stylesheet"
      />

      {/* Scoped CSS */}
      <style>{`
        .speech-academy-root a { text-decoration: none; }
        .gold-glow {
          box-shadow: 0 8px 30px -4px rgba(230, 193, 132, 0.4);
        }
        .editorial-shadow {
          box-shadow: 0 20px 48px -8px rgba(16, 28, 46, 0.12);
        }
        .subtle-card-shadow {
          box-shadow: 0 4px 20px -2px rgba(16, 28, 46, 0.05);
        }
        @media (max-width: 768px) {
          .sa-hide-mobile { display: none !important; }
          .sa-show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sa-show-mobile { display: none !important; }
        }
      `}</style>

      {/* 1. STICKY MINIMAL HEADER */}
      <header
        data-theme-header="true"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'rgba(252, 249, 248, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(197, 198, 205, 0.35)',
          boxShadow: '0 4px 20px -2px rgba(16, 28, 46, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 24px',
            height: 76,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo Anchor */}
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}
            style={{ display: 'flex', flexDirection: 'column', color: secondaryColor }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontFamily: brandFont,
                  fontSize: 22,
                  fontWeight: 700,
                  color: secondaryColor,
                  letterSpacing: '-0.02em',
                }}
              >
                {organization.name}
              </span>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: accentColor,
                  display: 'inline-block',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: 11,
                color: primaryColor,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Nitq & Səhnə Sənəti
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="sa-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                style={{
                  fontFamily: bodyFont,
                  fontSize: 14,
                  fontWeight: 600,
                  color: item.href === '#hero' ? primaryColor : '#44474c',
                  borderBottom: item.href === '#hero' ? `2px solid ${primaryColor}` : '2px solid transparent',
                  paddingBottom: 2,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = item.href === '#hero' ? primaryColor : '#44474c')}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action Button & Mobile Burger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <a
              href="#elaqe"
              onClick={(e) => { e.preventDefault(); scrollTo('#elaqe'); }}
              className="sa-hide-mobile"
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                backgroundColor: accentColor,
                color: secondaryColor,
                fontFamily: bodyFont,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(230, 193, 132, 0.35)',
              }}
            >
              Əlaqə saxla
            </a>

            <button
              type="button"
              className="sa-show-mobile"
              onClick={() => setMobileMenuOpen((p) => !p)}
              aria-label="Menyu"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid rgba(117, 119, 125, 0.3)',
                background: 'transparent',
                color: secondaryColor,
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

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
                backgroundColor: bgColor,
                borderBottom: '1px solid rgba(197, 198, 205, 0.4)',
                boxShadow: '0 12px 32px rgba(16, 28, 46, 0.08)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 15,
                    fontWeight: 600,
                    color: item.href === '#hero' ? primaryColor : textColor,
                    padding: '8px 0',
                  }}
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#elaqe"
                onClick={(e) => { e.preventDefault(); scrollTo('#elaqe'); }}
                style={{
                  marginTop: 8,
                  padding: '12px',
                  borderRadius: 10,
                  backgroundColor: accentColor,
                  color: secondaryColor,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Əlaqə saxla
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section
        id="hero"
        style={{
          position: 'relative',
          paddingTop: '60px',
          paddingBottom: '80px',
          overflow: 'hidden',
          backgroundColor: bgColor,
        }}
      >
        {/* Ambient Gold Radial Glows */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: 0,
            width: 550,
            height: 550,
            borderRadius: '50%',
            background: 'rgba(255, 222, 169, 0.25)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: -100,
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: 'rgba(230, 193, 132, 0.2)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 48,
              alignItems: 'center',
            }}
          >
            {/* Left Column: Editorial Headline & Actions */}
            <div>
              {/* Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 100,
                  backgroundColor: '#f6f3f2',
                  border: '1px solid rgba(230, 193, 132, 0.6)',
                  marginBottom: 24,
                }}
              >
                <Radio size={16} color={primaryColor} />
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12,
                    fontWeight: 700,
                    color: primaryColor,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {heroBadge}
                </span>
              </div>

              {/* Massive Editorial Headline */}
              <h1
                style={{
                  fontFamily: headingFont,
                  fontSize: 'clamp(36px, 5.5vw, 64px)',
                  lineHeight: 1.15,
                  fontWeight: 700,
                  color: secondaryColor,
                  letterSpacing: '-0.02em',
                  margin: '0 0 20px 0',
                }}
              >
                Düzgün nitq. <br />
                <span style={{ fontStyle: 'italic', fontWeight: 400, color: primaryColor }}>
                  Güclü təsir.
                </span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: 'clamp(16px, 2vw, 18px)',
                  lineHeight: 1.7,
                  color: '#44474c',
                  maxWidth: 560,
                  marginBottom: 36,
                }}
              >
                {organization.description ||
                  'Nitq mədəniyyəti və natiqlik sənətinin inkişafı üçün diksiya təlimləri, tədbir aparıcılığı və peşəkar səsləndirmə.'}
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 44 }}>
                <a
                  href="#xidmetler"
                  onClick={(e) => { e.preventDefault(); scrollTo('#xidmetler'); }}
                  className="gold-glow"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 32px',
                    borderRadius: 12,
                    backgroundColor: accentColor,
                    color: secondaryColor,
                    fontFamily: bodyFont,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Xidmətlərlə tanış ol</span>
                  <ArrowRight size={18} />
                </a>

                <a
                  href="#elaqe"
                  onClick={(e) => { e.preventDefault(); scrollTo('#elaqe'); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '16px 32px',
                    borderRadius: 12,
                    border: `1.5px solid rgba(16, 28, 46, 0.3)`,
                    backgroundColor: 'transparent',
                    color: secondaryColor,
                    fontFamily: bodyFont,
                    fontSize: 15,
                    fontWeight: 700,
                    transition: 'all 0.2s',
                  }}
                >
                  Əlaqə saxla
                </a>
              </div>

              {/* Metrics / Stats Pill */}
              <div
                style={{
                  paddingTop: 24,
                  borderTop: '1px solid rgba(197, 198, 205, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: headingFont, fontSize: 24, fontWeight: 700, color: secondaryColor }}>
                    10+
                  </span>
                  <span style={{ fontSize: 13, color: '#44474c', fontWeight: 500 }}>
                    {heroStat1}
                  </span>
                </div>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accentColor }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: headingFont, fontSize: 24, fontWeight: 700, color: secondaryColor }}>
                    500+
                  </span>
                  <span style={{ fontSize: 13, color: '#44474c', fontWeight: 500 }}>
                    {heroStat2}
                  </span>
                </div>
                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accentColor }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: headingFont, fontSize: 24, fontWeight: 700, color: secondaryColor }}>
                    100+
                  </span>
                  <span style={{ fontSize: 13, color: '#44474c', fontWeight: 500 }}>
                    {heroStat3}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Framed Portrait */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {/* Outer Decorative Gold Border */}
              <div
                style={{
                  position: 'absolute',
                  inset: -12,
                  borderRadius: 28,
                  border: '1.5px dashed rgba(230, 193, 132, 0.6)',
                  pointerEvents: 'none',
                }}
              />

              <div
                className="editorial-shadow"
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 420,
                  aspectRatio: '3 / 4',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '1.5px solid rgba(230, 193, 132, 0.7)',
                  backgroundColor: '#f0eded',
                }}
              >
                <img
                  src={heroImage}
                  alt={organization.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    transition: 'transform 0.6s ease',
                  }}
                />

                {/* Vignette Layer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(16, 28, 46, 0.75) 0%, transparent 55%)',
                  }}
                />

                {/* Floating Badge Card */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    padding: '14px 18px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(252, 249, 248, 0.96)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(230, 193, 132, 0.8)',
                    boxShadow: '0 8px 24px rgba(16, 28, 46, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      color: secondaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mic size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontFamily: headingFont, fontSize: 16, fontWeight: 700, color: secondaryColor, margin: 0 }}>
                      {organization.name}
                    </h4>
                    <p style={{ fontFamily: bodyFont, fontSize: 12, color: '#44474c', margin: '2px 0 0 0' }}>
                      Diksiya Mütəxəssisi & Aparıcı
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Down Hint */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <a
              href="#haqqimda"
              onClick={(e) => { e.preventDefault(); scrollTo('#haqqimda'); }}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                color: '#44474c',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ marginBottom: 4 }}>Aşağı sürüşdürün</span>
              <ChevronDown size={20} color={primaryColor} />
            </a>
          </div>
        </div>
      </section>

      {/* 3. HAQQIMDA SECTION */}
      <section
        id="haqqimda"
        style={{
          padding: '90px 0',
          backgroundColor: '#f6f3f2',
          borderTop: '1px solid rgba(197, 198, 205, 0.3)',
          borderBottom: '1px solid rgba(197, 198, 205, 0.3)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 56,
              alignItems: 'center',
            }}
          >
            {/* Left Column: Stage Image & Floating Quote */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 18,
                  overflow: 'hidden',
                  border: '1.5px solid rgba(230, 193, 132, 0.5)',
                  boxShadow: '0 16px 40px -6px rgba(16, 28, 46, 0.1)',
                  backgroundColor: '#ffffff',
                }}
              >
                <img
                  src={aboutImage}
                  alt={`${organization.name} çıxış edərkən`}
                  style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover' }}
                />
                {/* Gold Corner Accents */}
                <div style={{ position: 'absolute', top: 14, left: 14, width: 28, height: 28, borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
                <div style={{ position: 'absolute', bottom: 14, right: 14, width: 28, height: 28, borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
              </div>

              {/* Floating Quote Dossier Card */}
              <div
                style={{
                  marginTop: -30,
                  marginLeft: 24,
                  position: 'relative',
                  zIndex: 2,
                  maxWidth: 340,
                  borderRadius: 14,
                  padding: 24,
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(230, 193, 132, 0.7)',
                  boxShadow: '0 12px 32px rgba(16, 28, 46, 0.08)',
                }}
              >
                <p
                  style={{
                    fontFamily: headingFont,
                    fontSize: 18,
                    fontStyle: 'italic',
                    color: secondaryColor,
                    margin: '0 0 12px 0',
                    lineHeight: 1.5,
                  }}
                >
                  "Sözləriniz sizin vizit kartınızdır."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 24, height: 2, backgroundColor: accentColor }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Peşəkar fəlsəfə
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative & 3 Key Pillars */}
            <div>
              <span
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12,
                  fontWeight: 700,
                  color: primaryColor,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 12,
                }}
              >
                HAQQIMDA
              </span>

              <h2
                style={{
                  fontFamily: headingFont,
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  lineHeight: 1.25,
                  fontWeight: 600,
                  color: secondaryColor,
                  margin: '0 0 24px 0',
                }}
              >
                Hər kəlmədə inam, hər çıxışda zəriflik və peşəkarlıq
              </h2>

              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: '#44474c',
                  marginBottom: 36,
                }}
              >
                Azərbaycanda düzgün nitq mədəniyyətinin və natiqlik sənətinin inkişafı istiqamətində fəaliyyət göstərən {organization.name}, fərdi və korporativ səviyyədə diksiya təlimləri təşkil edir, dövlət və özəl tədbirlərin rəsmi aparıcısı kimi çıxış edir, reklam çarxlarının və korporativ videoların peşəkar səsləndirməsini həyata keçirir.
              </p>

              {/* 3 Pillars */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 24,
                  paddingTop: 24,
                  borderTop: '1px solid rgba(230, 193, 132, 0.4)',
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: primaryColor, display: 'block', marginBottom: 6 }}>
                    {pillar1Title}
                  </span>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#44474c', margin: 0 }}>
                    {pillar1Desc}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: primaryColor, display: 'block', marginBottom: 6 }}>
                    {pillar2Title}
                  </span>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#44474c', margin: 0 }}>
                    {pillar2Desc}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: primaryColor, display: 'block', marginBottom: 6 }}>
                    {pillar3Title}
                  </span>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: '#44474c', margin: 0 }}>
                    {pillar3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. XİDMƏTLƏR SECTION (Menyu yerinə Xidmətlər) */}
      <section id="xidmetler" style={{ padding: '90px 0', backgroundColor: bgColor }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px auto' }}>
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: 12,
                fontWeight: 700,
                color: primaryColor,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: 10,
              }}
            >
              İXTİSASLAŞMIŞ XİDMƏTLƏR
            </span>
            <h2
              style={{
                fontFamily: headingFont,
                fontSize: 'clamp(30px, 4.5vw, 44px)',
                fontWeight: 600,
                color: secondaryColor,
                margin: '0 0 16px 0',
              }}
            >
              Xidmətlər
            </h2>
            <p style={{ fontFamily: bodyFont, fontSize: 17, color: '#44474c', margin: 0 }}>
              Nitqinizin gücünü kəşf edin və auditoriyanı valeh edin
            </p>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 28,
            }}
          >
            {hasCatalogItems ? (
              // Real Services from Catalog
              allCatalogItems.map((item, idx) => {
                const IconComponent = getItemIcon(item.name, idx);
                return (
                  <div
                    key={item.id}
                    className="subtle-card-shadow"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 16,
                      border: '1px solid rgba(230, 193, 132, 0.45)',
                      padding: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: primaryColor,
                            backgroundColor: '#f6f3f2',
                            padding: '6px 14px',
                            borderRadius: 100,
                            maxWidth: '75%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.prepTime || item.categoryName}
                        </span>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 222, 169, 0.35)',
                            color: primaryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconComponent size={22} />
                        </div>
                      </div>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 16 }}
                        />
                      )}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, margin: '0 0 10px 0' }}>
                        <h3 style={{ fontFamily: headingFont, fontSize: 22, fontWeight: 600, color: secondaryColor, margin: 0 }}>
                          {item.name}
                        </h3>
                        {item.price > 0 && (
                          <span style={{ fontFamily: headingFont, fontSize: 18, fontWeight: 700, color: primaryColor, whiteSpace: 'nowrap' }}>
                            {formatPrice(item.discountPrice || item.price, organization.currency)}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 15, lineHeight: 1.6, color: '#44474c', margin: 0 }}>
                        {item.description || 'Yüksək səviyyəli peşəkar xidmət.'}
                      </p>
                    </div>

                    <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(197, 198, 205, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: primaryColor }}>
                        {item.portionSize || 'Fərdi yanaşma'}
                      </span>
                      <a
                        href="#elaqe"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormState((p) => ({ ...p, service: item.name }));
                          scrollTo('#elaqe');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 14,
                          fontWeight: 700,
                          color: secondaryColor,
                        }}
                      >
                        <span>Müraciət et</span>
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              // Default 4 Editorial Service Cards from code.html
              defaultServices.map((svc) => {
                const IconComponent = svc.icon;
                return (
                  <div
                    key={svc.id}
                    className="subtle-card-shadow"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 16,
                      border: '1px solid rgba(230, 193, 132, 0.45)',
                      padding: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: primaryColor,
                            backgroundColor: '#f6f3f2',
                            padding: '6px 14px',
                            borderRadius: 100,
                          }}
                        >
                          {svc.badge}
                        </span>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255, 222, 169, 0.35)',
                            color: primaryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent size={22} />
                        </div>
                      </div>
                      <h3 style={{ fontFamily: headingFont, fontSize: 24, fontWeight: 600, color: secondaryColor, margin: '0 0 12px 0' }}>
                        {svc.title}
                      </h3>
                      <p style={{ fontSize: 15, lineHeight: 1.65, color: '#44474c', margin: 0 }}>
                        {svc.description}
                      </p>
                    </div>

                    <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(197, 198, 205, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: primaryColor }}>
                        {svc.tag}
                      </span>
                      <a
                        href="#elaqe"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormState((p) => ({ ...p, service: svc.id }));
                          scrollTo('#elaqe');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 14,
                          fontWeight: 700,
                          color: secondaryColor,
                        }}
                      >
                        <span>Müraciət et</span>
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Social Media Feed Support */}
      {data.socialFeedPosts && data.socialFeedPosts.length > 0 && (
        <SocialMediaFeed
          socialLinks={socialLinks}
          posts={data.socialFeedPosts}
          theme={theme}
          organization={organization}
        />
      )}

      {/* 4.5 QALEREYA SECTION */}
      {showGallery && (
        <section id="qalereya" style={{ padding: '90px 0', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 56px auto' }}>
              <span
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12,
                  fontWeight: 700,
                  color: primaryColor,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 10,
                }}
              >
                FOTO VƏ VİDEOLAR
              </span>
              <h2
                style={{
                  fontFamily: headingFont,
                  fontSize: 'clamp(30px, 4.5vw, 44px)',
                  fontWeight: 600,
                  color: secondaryColor,
                  margin: '0 0 16px 0',
                }}
              >
                Qalareya
              </h2>
              <p style={{ fontFamily: bodyFont, fontSize: 17, color: '#44474c', margin: 0 }}>
                Təlimlərimizdən, çıxışlarımızdan və xüsusi anlarımızdan fotolar
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {(data.galleryItems || []).map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    backgroundColor: '#f1f1f4',
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
                        background: 'linear-gradient(transparent, rgba(18,20,22,0.85))',
                        color: '#ffffff',
                        fontFamily: bodyFont,
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

      {/* 5. ƏLAQƏ SECTION */}
      {showContact && <section
        id="elaqe"
        style={{
          padding: '90px 0',
          backgroundColor: secondaryColor,
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Atmospheric Glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(230, 193, 132, 0.12)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 56,
              alignItems: 'start',
            }}
          >
            {/* Left Column: Details */}
            <div>
              <span
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12,
                  fontWeight: 700,
                  color: accentColor,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginBottom: 10,
                }}
              >
                BİRGƏ UĞURA DOĞRU
              </span>

              <h2
                style={{
                  fontFamily: headingFont,
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: '0 0 20px 0',
                }}
              >
                Gəlin əməkdaşlıq edək
              </h2>

              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: 36,
                }}
              >
                {contactDesc}
              </p>

              {/* Contact Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
                {organization.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(230, 193, 132, 0.4)',
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Phone size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
                        Telefon
                      </span>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                        {organization.phone}
                      </p>
                    </div>
                  </div>
                )}

                {organization.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(230, 193, 132, 0.4)',
                        color: accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Mail size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
                        E-poçt
                      </span>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                        {organization.email}
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(230, 193, 132, 0.4)',
                      color: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>
                      Məkan
                    </span>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '2px 0 0 0' }}>
                      {organization.address || 'Bakı, Azərbaycan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              {socialLinks && socialLinks.length > 0 && (
                <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: 14 }}>
                    Sosial Şəbəkələr
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {socialLinks.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 14px',
                          borderRadius: 100,
                          border: '1px solid rgba(230, 193, 132, 0.4)',
                          color: '#ffffff',
                          fontSize: 13,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {s.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Inquiry Form */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 20,
                border: '1px solid rgba(230, 193, 132, 0.35)',
                padding: '36px 32px',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 211, 125, 0.15)',
                      color: '#00D37D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontFamily: headingFont, fontSize: 24, color: '#ffffff', margin: '0 0 10px 0' }}>
                    Müraciətiniz qəbul edildi!
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, margin: 0 }}>
                    Təşəkkür edirik. Tezliklə sizinlə əlaqə saxlayacağıq.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                      Ad və Soyad
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Adınızı və soyadınızı daxil edin"
                      value={formState.fullName}
                      onChange={(e) => setFormState((p) => ({ ...p, fullName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                      E-poçt və ya Əlaqə Nömrəsi
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="+994 (50) 000-00-00 və ya e-poçt"
                      value={formState.phone}
                      onChange={(e) => setFormState((p) => ({ ...p, phone: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                      Xidmət seçimi
                    </label>
                    <select
                      value={formState.service}
                      onChange={(e) => setFormState((p) => ({ ...p, service: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        backgroundColor: secondaryColor,
                        border: '1px solid rgba(230, 193, 132, 0.5)',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    >
                      <option value="Diksiya təlimləri">Diksiya təlimləri</option>
                      <option value="Tədbir aparıcılığı">Tədbir aparıcılığı</option>
                      <option value="Peşəkar səsləndirmə">Peşəkar səsləndirmə</option>
                      <option value="Brend siması">Brend siması</option>
                      <option value="Digər">Digər əməkdaşlıq</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: accentColor, textTransform: 'uppercase', marginBottom: 8 }}>
                      Mesajınız
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tədbirinizin detalları və ya təlim barədə qeydləriniz..."
                      value={formState.message}
                      onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="gold-glow"
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 12,
                      backgroundColor: accentColor,
                      color: secondaryColor,
                      fontFamily: bodyFont,
                      fontSize: 15,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    <span>{submitting ? "Göndərilir..." : "Göndər"}</span>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>}

      {/* 6. FOOTER */}
      <footer
        id="footer"
        style={{
          backgroundColor: secondaryColor,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); scrollTo('#hero'); }}
            style={{
              fontFamily: brandFont,
              fontSize: 20,
              fontWeight: 700,
              color: accentColor,
            }}
          >
            {organization.name}
          </a>

          <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
            {copyrightText} • {platformText}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

