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

export function getResolvedSiteContent(siteContent: any, organization?: any, theme?: any) {
  const orgTheme = theme || organization?.website?.theme || {};

  // Hero
  const heroBlock = resolveBlock(siteContent, 'hero', 'hero.main');
  const heroBadgeText = (heroBlock.fields.badgeText !== undefined)
    ? (t(heroBlock.fields.badgeText, 'az') || (typeof heroBlock.fields.badgeText === 'string' ? heroBlock.fields.badgeText : ''))
    : (orgTheme?.heroBadgeText || 'Odun sobasında hazırlanır');
  const heroTitle = t(heroBlock.fields.title, 'az');
  const heroSubtitle = t(heroBlock.fields.subtitle, 'az');
  const heroBgImage = (heroBlock.fields.backgroundImage as any)?.url || (typeof heroBlock.fields.backgroundImage === 'string' ? heroBlock.fields.backgroundImage : null);
  const heroCta = heroBlock.fields.cta as any;

  const stat1Val = (heroBlock.fields.stat1Value !== undefined && heroBlock.fields.stat1Value !== '')
    ? heroBlock.fields.stat1Value
    : (orgTheme?.heroStat1Value || '10+ il');
  const stat1Lbl = (heroBlock.fields.stat1Label !== undefined)
    ? (t(heroBlock.fields.stat1Label, 'az') || (typeof heroBlock.fields.stat1Label === 'string' ? heroBlock.fields.stat1Label : ''))
    : (orgTheme?.heroStat1Label || 'Təcrübə');

  const stat2Val = (heroBlock.fields.stat2Value !== undefined && heroBlock.fields.stat2Value !== '')
    ? heroBlock.fields.stat2Value
    : (orgTheme?.heroStat2Value || '30+');
  const stat2Lbl = (heroBlock.fields.stat2Label !== undefined)
    ? (t(heroBlock.fields.stat2Label, 'az') || (typeof heroBlock.fields.stat2Label === 'string' ? heroBlock.fields.stat2Label : ''))
    : (orgTheme?.heroStat2Label || 'Pizza növü');

  const stat3Val = (heroBlock.fields.stat3Value !== undefined && heroBlock.fields.stat3Value !== '')
    ? heroBlock.fields.stat3Value
    : (orgTheme?.heroStat3Value || '5000+');
  const stat3Lbl = (heroBlock.fields.stat3Label !== undefined)
    ? (t(heroBlock.fields.stat3Label, 'az') || (typeof heroBlock.fields.stat3Label === 'string' ? heroBlock.fields.stat3Label : ''))
    : (orgTheme?.heroStat3Label || 'Məmnun qonaq');

  let heroStats: Array<{ value: string; label: string }> = [
    { value: stat1Val, label: stat1Lbl || 'Təcrübə' },
    { value: stat2Val, label: stat2Lbl || 'Pizza növü' },
    { value: stat3Val, label: stat3Lbl || 'Məmnun qonaq' },
  ];
  if (Array.isArray(heroBlock.fields.stats) && heroBlock.fields.stats.length > 0) {
    heroStats = heroBlock.fields.stats.map((s: any) => ({
      value: s?.value || '',
      label: t(s?.label, 'az') || (typeof s?.label === 'string' ? s.label : ''),
    }));
  }

  const heroRatingScore = (heroBlock.fields.ratingScore !== undefined && heroBlock.fields.ratingScore !== '')
    ? String(heroBlock.fields.ratingScore)
    : (orgTheme?.heroRatingScore || '4.9');
  const heroRatingLabel = (heroBlock.fields.ratingLabel !== undefined)
    ? (t(heroBlock.fields.ratingLabel, 'az') || (typeof heroBlock.fields.ratingLabel === 'string' ? heroBlock.fields.ratingLabel : ''))
    : (orgTheme?.heroRatingLabel || 'Reytinq (2.4k+)');

  const heroBadge1Text = (heroBlock.fields.badge1Text !== undefined)
    ? (t(heroBlock.fields.badge1Text, 'az') || (typeof heroBlock.fields.badge1Text === 'string' ? heroBlock.fields.badge1Text : ''))
    : (orgTheme?.heroBadgeFeature1 || '100% Təbii');
  const heroBadge1Desc = (heroBlock.fields.badge1Desc !== undefined)
    ? (t(heroBlock.fields.badge1Desc, 'az') || (typeof heroBlock.fields.badge1Desc === 'string' ? heroBlock.fields.badge1Desc : ''))
    : (orgTheme?.heroBadgeFeature1Desc || 'Pendir & Xəmir');

  const heroBadge2Text = (heroBlock.fields.badge2Text !== undefined)
    ? (t(heroBlock.fields.badge2Text, 'az') || (typeof heroBlock.fields.badge2Text === 'string' ? heroBlock.fields.badge2Text : ''))
    : (orgTheme?.heroBadgeFeature2 || '15 Dəqiqəyə');
  const heroBadge2Desc = (heroBlock.fields.badge2Desc !== undefined)
    ? (t(heroBlock.fields.badge2Desc, 'az') || (typeof heroBlock.fields.badge2Desc === 'string' ? heroBlock.fields.badge2Desc : ''))
    : (orgTheme?.heroBadgeFeature2Desc || 'Süfrənizdə hazır');

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

  const feature1Title = (aboutBlock.fields.feature1Title !== undefined)
    ? (t(aboutBlock.fields.feature1Title, 'az') || (typeof aboutBlock.fields.feature1Title === 'string' ? aboutBlock.fields.feature1Title : ''))
    : (orgTheme?.aboutFeature1Title || 'Təzə inqrediyentlər');
  const feature1Desc = (aboutBlock.fields.feature1Desc !== undefined)
    ? (t(aboutBlock.fields.feature1Desc, 'az') || (typeof aboutBlock.fields.feature1Desc === 'string' ? aboutBlock.fields.feature1Desc : ''))
    : (orgTheme?.aboutFeature1Desc || 'Hər gün seçilmiş təbii tərəvəzlər və xalis pendir növləri.');

  const feature2Title = (aboutBlock.fields.feature2Title !== undefined)
    ? (t(aboutBlock.fields.feature2Title, 'az') || (typeof aboutBlock.fields.feature2Title === 'string' ? aboutBlock.fields.feature2Title : ''))
    : (orgTheme?.aboutFeature2Title || 'Sürətli xidmət');
  const feature2Desc = (aboutBlock.fields.feature2Desc !== undefined)
    ? (t(aboutBlock.fields.feature2Desc, 'az') || (typeof aboutBlock.fields.feature2Desc === 'string' ? aboutBlock.fields.feature2Desc : ''))
    : (orgTheme?.aboutFeature2Desc || 'Sifarişiniz isti və xırçıltılı şəkildə masanıza operativ çatdırılır.');

  const feature3Title = (aboutBlock.fields.feature3Title !== undefined)
    ? (t(aboutBlock.fields.feature3Title, 'az') || (typeof aboutBlock.fields.feature3Title === 'string' ? aboutBlock.fields.feature3Title : ''))
    : (orgTheme?.aboutFeature3Title || 'Rahat atmosfer');
  const feature3Desc = (aboutBlock.fields.feature3Desc !== undefined)
    ? (t(aboutBlock.fields.feature3Desc, 'az') || (typeof aboutBlock.fields.feature3Desc === 'string' ? aboutBlock.fields.feature3Desc : ''))
    : (orgTheme?.aboutFeature3Desc || 'Ailəniz və dostlarınızla xoş xatirələr yaratmaq üçün isti və səmimi məkan.');

  let aboutFeatures: Array<{ title: string; description: string; icon: string }> = [
    {
      title: feature1Title || 'Təzə inqrediyentlər',
      description: feature1Desc || 'Hər gün seçilmiş təbii tərəvəzlər və xalis pendir növləri.',
      icon: aboutBlock.fields.feature1Icon || 'Sparkles',
    },
    {
      title: feature2Title || 'Sürətli xidmət',
      description: feature2Desc || 'Sifarişiniz isti və xırçıltılı şəkildə masanıza operativ çatdırılır.',
      icon: aboutBlock.fields.feature2Icon || 'Clock',
    },
    {
      title: feature3Title || 'Rahat atmosfer',
      description: feature3Desc || 'Ailəniz və dostlarınızla xoş xatirələr yaratmaq üçün isti və səmimi məkan.',
      icon: aboutBlock.fields.feature3Icon || 'Users',
    },
  ];

  if (Array.isArray(aboutBlock.fields.features) && aboutBlock.fields.features.length > 0) {
    aboutFeatures = aboutBlock.fields.features.map((f: any) => ({
      title: t(f?.title, 'az') || (typeof f?.title === 'string' ? f.title : ''),
      description: t(f?.description, 'az') || (typeof f?.description === 'string' ? f.description : ''),
      icon: f?.icon || 'Sparkles',
    }));
  }

  // Contact
  const contactBlock = resolveBlock(siteContent, 'contact', 'contact.info');
  const contactTitle = t(contactBlock.fields.sectionTitle, 'az');
  const contactSubtitle = t(contactBlock.fields.subtitle, 'az');
  const contactPhone = contactBlock.fields.phone || organization?.phone || '';
  const contactEmail = contactBlock.fields.email || organization?.email || '';
  const contactAddress = t(contactBlock.fields.address, 'az') || (typeof contactBlock.fields.address === 'string' ? contactBlock.fields.address : '') || organization?.address || '';
  const contactMapUrl = contactBlock.fields.mapUrl || organization?.mapEmbedUrl || '';
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
  const galleryLayout = galleryBlock.fields.layout || 'grid';
  const galleryColumns = parseInt(galleryBlock.fields.columns || '4', 10) || 4;
  const galleryLightbox = galleryBlock.fields.lightboxEnabled !== false;

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
      badgeText: heroBadgeText,
      title: heroTitle,
      subtitle: heroSubtitle,
      backgroundImage: heroBgImage,
      cta: heroCta,
      stats: heroStats,
      ratingScore: heroRatingScore,
      ratingLabel: heroRatingLabel,
      badge1Text: heroBadge1Text,
      badge1Desc: heroBadge1Desc,
      badge2Text: heroBadge2Text,
      badge2Desc: heroBadge2Desc,
    },
    about: {
      visible: aboutBlock.visible,
      hasContent: aboutBlock.hasContent,
      title: aboutTitle,
      body: aboutBody,
      image: aboutImage,
      imagePosition: aboutImagePosition,
      stats: aboutStats,
      features: aboutFeatures,
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
      layout: galleryLayout,
      columns: galleryColumns,
      lightboxEnabled: galleryLightbox,
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
