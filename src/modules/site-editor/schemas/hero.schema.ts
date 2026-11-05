// hero.schema.ts — Ana Səhifə Hero bölümü
import { registerBlock } from '../block-registry';

registerBlock({
  key: 'hero.main',
  pageKey: 'hero',
  label: 'Hero (Üst Bölüm)',
  description: 'Saytın əsas giriş bölümü — başlıq, şəkil, CTA düyməsi',
  icon: 'Sparkles',
  hasVisibilityToggle: true,
  fields: [
    {
      key: 'title',
      type: 'text',
      label: 'Baş başlıq',
      i18n: true,
      required: true,
      placeholder: 'Restoran adı və ya slogan',
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'subtitle',
      type: 'textarea',
      label: 'Alt başlıq',
      i18n: true,
      placeholder: 'Qısa təsvir, dəvətnama',
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'backgroundImage',
      type: 'image',
      label: 'Arxa fon şəkli',
      imageValidation: { maxSizeMb: 5, accept: ['image/jpeg', 'image/png', 'image/webp'] },
    },
    {
      key: 'cta',
      type: 'link',
      label: 'CTA Düyməsi',
      hint: 'Boş buraxsanız düymə göstərilmir',
    },
    {
      key: 'overlayOpacity',
      type: 'number',
      label: 'Fon qaranlığı (0–100)',
      default: 50,
    },
  ],
});

