// site-content-resolver.ts — Bütün temalar üçün ortaq məzmun təyinedicisi
import { t } from '@/modules/site-editor/content-utils';

export function resolveBlock(siteContent: any, pageKey: string, blockKey: string) {
  const page = siteContent?.[pageKey];
  const doc = page?.[blockKey];
  if (!doc) {
    return {
      fields: {},
      visible: true,
      hasContent: false,
    };
  }
  const fields = (typeof doc === 'object' && 'fields' in doc && doc.fields && typeof doc.fields === 'object')
    ? (doc.fields as Record<string, any>)
    : (typeof doc === 'object' ? (doc as Record<string, any>) : {});
  const visible = typeof doc === 'object' && 'visible' in doc ? doc.visible !== false : true;
  return {
    fields,
    visible,
    hasContent: Object.keys(fields).length > 0,
  };
}

export function getResolvedSiteContent(siteContent: any, organization?: any) {
  // Hero
  const heroBlock = resolveBlock(siteContent, 'hero', 'hero.main');
  const heroTitle = t(heroBlock.fields.title, 'az');
  const heroSubtitle = t(heroBlock.fields.subtitle, 'az');
  const heroBgImage = (heroBlock.fields.backgroundImage as any)?.url || (typeof heroBlock.fields.backgroundImage === 'string' ? heroBlock.fields.backgroundImage : null);
  const heroCta = heroBlock.fields.cta as any;

  // About
  const aboutBlock = resolveBlock(siteContent, 'about', 'about.story');
  const aboutTitle = t(aboutBlock.fields.sectionTitle, 'az');
  const aboutBody = t(aboutBlock.fields.body, 'az');
  const aboutImage = (aboutBlock.fields.image as any)?.url || (typeof aboutBlock.fields.image === 'string' ? aboutBlock.fields.image : null);
  const aboutImagePosition = aboutBlock.fields.imagePosition || 'right';
  const aboutStats = Array.isArray(aboutBlock.fields.stats)
    ? aboutBlock.fields.stats.map((s: any) => ({
        value: s?.value || '',
        label: t(s?.label, 'az') || (typeof s?.label === 'string' ? s.label : ''),
      }))
    : [];

  // Contact
  const contactBlock = resolveBlock(siteContent, 'contact', 'contact.info');
  const contactTitle = t(contactBlock.fields.sectionTitle, 'az');
  const contactSubtitle = t(contactBlock.fields.subtitle, 'az');
  const contactPhone = contactBlock.fields.phone || '';
  const contactEmail = contactBlock.fields.email || '';
  const contactAddress = t(contactBlock.fields.address, 'az') || (typeof contactBlock.fields.address === 'string' ? contactBlock.fields.address : '');
  const contactMapUrl = contactBlock.fields.mapUrl || '';
  const contactFormEnabled = contactBlock.fields.formEnabled !== false;
  const contactFormTitle = t(contactBlock.fields.formTitle, 'az');

  // Menu
  const menuBlock = resolveBlock(siteContent, 'menu', 'menu.header');
  const menuTitle = t(menuBlock.fields.sectionTitle, 'az');
  const menuSubtitle = t(menuBlock.fields.subtitle, 'az');
  const menuHeroImage = (menuBlock.fields.heroImage as any)?.url || (typeof menuBlock.fields.heroImage === 'string' ? menuBlock.fields.heroImage : null);
  const menuShowSearch = menuBlock.fields.showSearch !== false;
  const menuShowFilters = menuBlock.fields.showFilters !== false;

  // Gallery
  const galleryBlock = resolveBlock(siteContent, 'gallery', 'gallery.header');
  const galleryTitle = t(galleryBlock.fields.sectionTitle, 'az');
  const gallerySubtitle = t(galleryBlock.fields.subtitle, 'az');

  // Reservation
  const resBlock = resolveBlock(siteContent, 'reservation', 'reservation.form');
  const resTitle = t(resBlock.fields.sectionTitle, 'az');
  const resSubtitle = t(resBlock.fields.subtitle, 'az');
  const resHeroImage = (resBlock.fields.heroImage as any)?.url || (typeof resBlock.fields.heroImage === 'string' ? resBlock.fields.heroImage : null);
  const resSubmitText = t(resBlock.fields.submitButtonText, 'az');
  const resSuccessMsg = t(resBlock.fields.successMessage, 'az');

  return {
    hero: {
      visible: heroBlock.visible,
      hasContent: heroBlock.hasContent,
      title: heroTitle,
      subtitle: heroSubtitle,
      backgroundImage: heroBgImage,
      cta: heroCta,
    },
    about: {
      visible: aboutBlock.visible,
      hasContent: aboutBlock.hasContent,
      title: aboutTitle,
      body: aboutBody,
      image: aboutImage,
      imagePosition: aboutImagePosition,
      stats: aboutStats,
    },
    contact: {
      visible: contactBlock.visible,
      hasContent: contactBlock.hasContent,
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
      hasContent: menuBlock.hasContent,
      title: menuTitle,
      subtitle: menuSubtitle,
      heroImage: menuHeroImage,
      showSearch: menuShowSearch,
      showFilters: menuShowFilters,
    },
    gallery: {
      visible: galleryBlock.visible,
      hasContent: galleryBlock.hasContent,
      title: galleryTitle,
      subtitle: gallerySubtitle,
    },
    reservation: {
      visible: resBlock.visible,
      hasContent: resBlock.hasContent,
      title: resTitle,
      subtitle: resSubtitle,
      heroImage: resHeroImage,
      submitButtonText: resSubmitText,
      successMessage: resSuccessMsg,
    },
  };
}
