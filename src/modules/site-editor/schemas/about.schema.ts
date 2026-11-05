// about.schema.ts — Haqqımızda səhifəsi
import { registerBlock } from '../block-registry';

registerBlock({
  key: 'about.story',
  pageKey: 'about',
  label: 'Bizim Hekayəmiz',
  description: 'Şirkət / restoran haqqında məlumat',
  icon: 'BookOpen',
  hasVisibilityToggle: true,
  fields: [
    {
      key: 'sectionTitle',
      type: 'text',
      label: 'Bölüm başlığı',
      i18n: true,
      default: { az: 'Haqqımızda', en: 'About Us', ru: 'О нас' },
    },
    {
      key: 'body',
      type: 'richtext',
      label: 'Mətn',
      i18n: true,
      allowedTags: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br'],
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'image',
      type: 'image',
      label: 'Şəkil',
      imageValidation: { maxSizeMb: 4, accept: ['image/jpeg', 'image/png', 'image/webp'] },
    },
    {
      key: 'imagePosition',
      type: 'select',
      label: 'Şəkil mövqeyi',
      options: [
        { value: 'left', label: 'Sol' },
        { value: 'right', label: 'Sağ' },
      ],
      default: 'right',
    },
    {
      key: 'stats',
      type: 'repeater',
      label: 'Statistika (say, il, heyət vb.)',
      hint: 'Hər sıra: rəqəm + etiket',
      repeaterFields: [
        { key: 'value', type: 'text', label: 'Dəyər', required: true, placeholder: '15+' },
        { key: 'label', type: 'text', label: 'Etiket', i18n: true, placeholder: 'İl Təcrübə' },
      ],
      default: [],
    },
  ],
});

