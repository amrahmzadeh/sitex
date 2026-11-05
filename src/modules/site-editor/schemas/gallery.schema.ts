// gallery.schema.ts — Qalareya səhifəsi
import { registerBlock } from '../block-registry';

registerBlock({
  key: 'gallery.header',
  pageKey: 'gallery',
  label: 'Qalareya Üst Bölümü',
  description: 'Qalareya başlığı və layout seçimi',
  icon: 'Images',
  hasVisibilityToggle: true,
  fields: [
    {
      key: 'sectionTitle',
      type: 'text',
      label: 'Bölüm başlığı',
      i18n: true,
      default: { az: 'Fotolar', en: 'Gallery', ru: 'Галерея' },
    },
    {
      key: 'subtitle',
      type: 'textarea',
      label: 'Alt başlıq',
      i18n: true,
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'layout',
      type: 'select',
      label: 'Layout',
      options: [
        { value: 'grid', label: 'Grid (bərabər)' },
        { value: 'masonry', label: 'Masonry (mozaik)' },
        { value: 'carousel', label: 'Karusel' },
      ],
      default: 'grid',
    },
    {
      key: 'columns',
      type: 'select',
      label: 'Sütun sayı',
      options: [
        { value: '2', label: '2 sütun' },
        { value: '3', label: '3 sütun' },
        { value: '4', label: '4 sütun' },
      ],
      default: '3',
    },
    {
      key: 'lightboxEnabled',
      type: 'toggle',
      label: 'Şəkil böyütmə (lightbox)',
      default: true,
    },
  ],
});

