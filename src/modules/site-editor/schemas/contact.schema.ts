// contact.schema.ts — Əlaqə səhifəsi
import { registerBlock } from '../block-registry';

registerBlock({
  key: 'contact.info',
  pageKey: 'contact',
  label: 'Əlaqə Məlumatları',
  description: 'Ünvan, telefon, e-poçt, iş saatları',
  icon: 'MapPin',
  hasVisibilityToggle: true,
  fields: [
    {
      key: 'sectionTitle',
      type: 'text',
      label: 'Bölüm başlığı',
      i18n: true,
      default: { az: 'Bizimlə Əlaqə', en: 'Contact Us', ru: 'Контакты' },
    },
    {
      key: 'subtitle',
      type: 'textarea',
      label: 'Alt başlıq',
      i18n: true,
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'phone',
      type: 'text',
      label: 'Telefon nömrəsi',
      placeholder: '+994 50 000 00 00',
    },
    {
      key: 'email',
      type: 'text',
      label: 'E-poçt',
      placeholder: 'info@example.com',
    },
    {
      key: 'address',
      type: 'textarea',
      label: 'Ünvan',
      i18n: true,
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'mapUrl',
      type: 'text',
      label: 'Google Maps URL',
      hint: 'Google Maps-dən "Paylaş" → "Xəritəni yerləştir" linkini yapışdırın',
      placeholder: 'https://maps.google.com/...',
    },
    {
      key: 'formEnabled',
      type: 'toggle',
      label: 'Əlaqə forması aktiv',
      default: true,
    },
    {
      key: 'formTitle',
      type: 'text',
      label: 'Forma başlığı',
      i18n: true,
      default: { az: 'Mesaj göndər', en: 'Send Message', ru: 'Отправить сообщение' },
      showIf: (fields) => fields.formEnabled === true,
    },
  ],
});

