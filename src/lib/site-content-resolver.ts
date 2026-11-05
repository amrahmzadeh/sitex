// site-content-resolver.ts — Bütün temalar üçün ortaq məzmun təyinedicisi
import { t } from '@/modules/site-editor/content-utils';

export function resolveBlock(siteContent: any, pageKey: string, blockKey: string) {
  const doc = siteContent?.[pageKey]?.[blockKey];
  return {
    fields: (doc?.fields || {}) as Record<string, any>,
    visible: doc?.visible !== false,
  };
}

export function getResolvedSiteContent(siteContent: any, organization: any) {
  // Hero
  const heroBlock = resolveBlock(siteContent, 'hero', 'hero.main');
  const heroTitle = t(heroBlock.fields.title, 'az') || organization?.name || '';
  const heroSubtitle = t(heroBlock.fields.subtitle, 'az') || organization?.description || '';
  const heroBgImage = (heroBlock.fields.backgroundImage as any)?.url || null;
  const heroCta = heroBlock.fields.cta as any;

  // About
  const aboutBlock = resolveBlock(siteContent, 'about', 'about.story');
  const aboutTitle = t(aboutBlock.fields.sectionTitle, 'az') || 'Haqqımızda';
  const aboutBody = t(aboutBlock.fields.body, 'az') || organization?.description || '';
  const aboutImage = (aboutBlock.fields.image as any)?.url || null;
  const aboutStats = Array.isArray(aboutBlock.fields.stats) ? aboutBlock.fields.stats : [];

  // Contact
  const contactBlock = resolveBlock(siteContent, 'contact', 'contact.info');
  const contactTitle = t(contactBlock.fields.sectionTitle, 'az') || 'Əlaqə';
  const contactSubtitle = t(contactBlock.fields.subtitle, 'az') || '';
  const contactPhone = contactBlock.fields.phone || organization?.phone || '';
  const contactEmail = contactBlock.fields.email || organization?.email || '';
  const contactAddress = t(contactBlock.fields.address, 'az') || organization?.address || '';
  const contactMapUrl = contactBlock.fields.mapUrl || organization?.mapEmbedUrl || organization?.mapUrl || '';
  const contactFormEnabled = contactBlock.fields.formEnabled !== false;
  const contactFormTitle = t(contactBlock.fields.formTitle, 'az') || 'Mesaj göndər';

  // Menu
  const menuBlock = resolveBlock(siteContent, 'menu', 'menu.header');
  const menuTitle = t(menuBlock.fields.sectionTitle, 'az') || 'Menyumuz';
  const menuSubtitle = t(menuBlock.fields.subtitle, 'az') || '';
  const menuHeroImage = (menuBlock.fields.heroImage as any)?.url || null;
  const menuShowSearch = menuBlock.fields.showSearch !== false;
  const menuShowFilters = menuBlock.fields.showFilters !== false;

  // Gallery
  const galleryBlock = resolveBlock(siteContent, 'gallery', 'gallery.header');
  const galleryTitle = t(galleryBlock.fields.sectionTitle, 'az') || 'Qalareya';
  const gallerySubtitle = t(galleryBlock.fields.subtitle, 'az') || '';

  // Reservation
  const resBlock = resolveBlock(siteContent, 'reservation', 'reservation.form');
  const resTitle = t(resBlock.fields.sectionTitle, 'az') || 'Masa Rezervasiyası';
  const resSubtitle = t(resBlock.fields.subtitle, 'az') || '';
  const resHeroImage = (resBlock.fields.heroImage as any)?.url || null;
  const resSubmitText = t(resBlock.fields.submitButtonText, 'az') || 'Masanı Ayır';
  const resSuccessMsg = t(resBlock.fields.successMessage, 'az') || '';

  return {
    hero: {
      visible: heroBlock.visible,
      title: heroTitle,
      subtitle: heroSubtitle,
      backgroundImage: heroBgImage,
      cta: heroCta,
    },
    about: {
      visible: aboutBlock.visible,
      title: aboutTitle,
      body: aboutBody,
      image: aboutImage,
      stats: aboutStats,
    },
    contact: {
      visible: contactBlock.visible,
      title: contactTitle,
      subtitle: contactSubtitle,
      phone: contactPhone,
      email: contactEmail,
      address: contactAddress,
      mapUrl: contactMapUrl,
      formEnabled: contactFormEnabled,
      formTitle: contactFormTitle,
    },
    menu: {
      visible: menuBlock.visible,
      title: menuTitle,
      subtitle: menuSubtitle,
      heroImage: menuHeroImage,
      showSearch: menuShowSearch,
      showFilters: menuShowFilters,
    },
    gallery: {
      visible: galleryBlock.visible,
      title: galleryTitle,
      subtitle: gallerySubtitle,
    },
    reservation: {
      visible: resBlock.visible,
      title: resTitle,
      subtitle: resSubtitle,
      heroImage: resHeroImage,
      submitButtonText: resSubmitText,
      successMessage: resSuccessMsg,
    },
  };
}

