// menu.schema.ts — Menyu səhifəsi
import { registerBlock } from '../block-registry';

registerBlock({
  key: 'menu.header',
  pageKey: 'menu',
  label: 'Menyu Üst Bölümü',
  description: 'Menyu başlığı, təsviri və hero şəkli',
  icon: 'UtensilsCrossed',
  hasVisibilityToggle: true,
  fields: [
    {
      key: 'sectionTitle',
      type: 'text',
      label: 'Bölüm başlığı',
      i18n: true,
      default: { az: 'Menyumuz', en: 'Our Menu', ru: 'Меню' },
    },
    {
      key: 'subtitle',
      type: 'textarea',
      label: 'Alt başlıq',
      i18n: true,
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'heroImage',
      type: 'image',
      label: 'Hero şəkil',
      imageValidation: { maxSizeMb: 5, accept: ['image/jpeg', 'image/png', 'image/webp'] },
    },
    {
      key: 'showSearch',
      type: 'toggle',
      label: 'Axtarış çubuğu aktiv',
      default: true,
    },
    {
      key: 'showFilters',
      type: 'toggle',
      label: 'Kateqoriya filterləri aktiv',
      default: true,
    },
    {
      key: 'currency',
      type: 'text',
      label: 'Valyuta simvolu',
      default: '₼',
      placeholder: '₼ / $ / €',
    },
    {
      key: 'emptyMessage',
      type: 'text',
      label: 'Boş menyu mesajı',
      i18n: true,
      default: { az: 'Menyu yüklənir...', en: 'Menu loading...', ru: 'Меню загружается...' },
    },
  ],
});

