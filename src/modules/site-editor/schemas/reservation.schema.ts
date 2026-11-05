// reservation.schema.ts — Rezervasiya bölümü
import { registerBlock } from '../block-registry';

registerBlock({
  key: 'reservation.form',
  pageKey: 'reservation',
  label: 'Rezervasiya Forması',
  description: 'Masa rezervasiyası forması ayarları',
  icon: 'CalendarDays',
  hasVisibilityToggle: true,
  fields: [
    {
      key: 'sectionTitle',
      type: 'text',
      label: 'Bölüm başlığı',
      i18n: true,
      default: { az: 'Masa Rezervasiyası', en: 'Table Reservation', ru: 'Бронирование стола' },
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
      label: 'Fon şəkli',
      imageValidation: { maxSizeMb: 5, accept: ['image/jpeg', 'image/png', 'image/webp'] },
    },
    {
      key: 'showDateField',
      type: 'toggle',
      label: 'Tarix sahəsi aktiv',
      default: true,
    },
    {
      key: 'showTimeField',
      type: 'toggle',
      label: 'Saat sahəsi aktiv',
      default: true,
    },
    {
      key: 'showGuestsField',
      type: 'toggle',
      label: 'Qonaq sayı sahəsi aktiv',
      default: true,
    },
    {
      key: 'showNotesField',
      type: 'toggle',
      label: 'Qeyd sahəsi aktiv',
      default: true,
    },
    {
      key: 'successMessage',
      type: 'textarea',
      label: 'Uğurlu göndəriş mesajı',
      i18n: true,
      default: {
        az: 'Rezervasiyanız qəbul edildi. Tezliklə sizinlə əlaqə saxlayacağıq!',
        en: 'Your reservation has been received. We will contact you shortly!',
        ru: 'Ваша бронь принята. Мы свяжемся с вами в ближайшее время!',
      },
    },
    {
      key: 'submitButtonText',
      type: 'text',
      label: 'Göndər düyməsi mətni',
      i18n: true,
      default: { az: 'Rezervasiya et', en: 'Reserve', ru: 'Забронировать' },
    },
  ],
});

