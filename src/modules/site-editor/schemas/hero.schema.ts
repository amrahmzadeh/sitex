// hero.schema.ts — Ana Səhifə Hero bölümü
import type { BlockSchema } from '../types';
import { registerBlock } from '../block-registry';

export const heroBlockSchema: BlockSchema = {
  key: 'hero.main',
  pageKey: 'hero',
  label: 'Hero (Üst Bölüm)',
  description: 'Saytın əsas giriş bölümü — başlıq, şəkil, statistika kartları və rozetkalar',
  icon: 'Sparkles',
  hasVisibilityToggle: true,
  fields: [
    // ==========================================
    // BÖLMƏ 1: Əsas Başlıq və Üst Rozetka
    // ==========================================
    {
      key: 'badgeText',
      type: 'text',
      section: '🍕 Əsas Başlıq və Üst Rozetka',
      label: 'Başlıq üstü Rozetka / Etiket (Məs: 🍕 Odun sobasında hazırlanır)',
      i18n: true,
      placeholder: 'Odun sobasında hazırlanır',
      default: { az: 'Odun sobasında hazırlanır', en: 'Prepared in wood-fired oven', ru: 'Приготовлено в дровяной печи' },
    },
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
      label: 'Alt başlıq / Qısa təsvir',
      i18n: true,
      placeholder: 'Qısa təsvir, dəvətnamə',
      default: { az: '', en: '', ru: '' },
    },
    {
      key: 'backgroundImage',
      type: 'image',
      label: 'Arxa fon / Əsas şəkil',
      imageValidation: { maxSizeMb: 5, accept: ['image/jpeg', 'image/png', 'image/webp'] },
    },
    {
      key: 'cta',
      type: 'link',
      label: 'CTA Düyməsi (Menyuya bax)',
      hint: 'Boş buraxsanız standart menyu düyməsi göstərilir',
    },
    {
      key: 'overlayOpacity',
      type: 'number',
      label: 'Fon qaranlığı (0–100)',
      default: 50,
    },

    // ==========================================
    // BÖLMƏ 2: Hero Statistika Kartları (3 Ədəd)
    // ==========================================
    {
      key: 'stat1Value',
      type: 'text',
      section: '📊 Hero Statistika Kartları (3 Ədəd)',
      label: 'Statistika 1 - Rəqəm / Dəyər (Məs: 10+ il)',
      placeholder: '10+ il',
      default: '10+ il',
    },
    {
      key: 'stat1Label',
      type: 'text',
      label: 'Statistika 1 - Mətn / Etiket (Məs: Təcrübə)',
      i18n: true,
      placeholder: 'Təcrübə',
      default: { az: 'Təcrübə', en: 'Experience', ru: 'Опыт' },
    },
    {
      key: 'stat2Value',
      type: 'text',
      label: 'Statistika 2 - Rəqəm / Dəyər (Məs: 30+)',
      placeholder: '30+',
      default: '30+',
    },
    {
      key: 'stat2Label',
      type: 'text',
      label: 'Statistika 2 - Mətn / Etiket (Məs: Pizza növü)',
      i18n: true,
      placeholder: 'Pizza növü',
      default: { az: 'Pizza növü', en: 'Pizza Varieties', ru: 'Видов пиццы' },
    },
    {
      key: 'stat3Value',
      type: 'text',
      label: 'Statistika 3 - Rəqəm / Dəyər (Məs: 5000+)',
      placeholder: '5000+',
      default: '5000+',
    },
    {
      key: 'stat3Label',
      type: 'text',
      label: 'Statistika 3 - Mətn / Etiket (Məs: Məmnun qonaq)',
      i18n: true,
      placeholder: 'Məmnun qonaq',
      default: { az: 'Məmnun qonaq', en: 'Happy Guests', ru: 'Довольных гостей' },
    },
    {
      key: 'stats',
      type: 'repeater',
      label: 'Əlavə Statistika qutuları (İstəyə görə)',
      hint: 'Yuxarıdakı 3 əsas qutudan əlavə qutular əlavə etmək istəsəniz',
      repeaterFields: [
        { key: 'value', type: 'text', label: 'Rəqəm / Dəyər', required: true },
        { key: 'label', type: 'text', label: 'Etiket / Başlıq', i18n: true },
      ],
      default: [],
    },

    // ==========================================
    // BÖLMƏ 3: Şəkil Üzərindəki Üzən Rozetkalar
    // ==========================================
    {
      key: 'ratingScore',
      type: 'text',
      section: '⭐ Şəkil Üzərindəki Üzən Rozetkalar (Badges)',
      label: 'Üzən Rozetka 1 (Reytinq) - Dəyər / Xal',
      placeholder: '4.9',
      default: '4.9',
    },
    {
      key: 'ratingLabel',
      type: 'text',
      label: 'Üzən Rozetka 1 (Reytinq) - Alt mətn / Etiket',
      i18n: true,
      placeholder: 'Reytinq (2.4k+)',
      default: { az: 'Reytinq (2.4k+)', en: 'Rating (2.4k+)', ru: 'Рейтинг (2.4k+)' },
    },
    {
      key: 'badge2Text',
      type: 'text',
      label: 'Üzən Rozetka 2 (Sürət) - Başlıq',
      i18n: true,
      placeholder: '15 Dəqiqəyə',
      default: { az: '15 Dəqiqəyə', en: 'In 15 Mins', ru: 'За 15 минут' },
    },
    {
      key: 'badge2Desc',
      type: 'text',
      label: 'Üzən Rozetka 2 (Sürət) - Alt mətn / Təsvir',
      i18n: true,
      placeholder: 'Süfrənizdə hazır',
      default: { az: 'Süfrənizdə hazır', en: 'Ready at table', ru: 'Готово на столе' },
    },
    {
      key: 'badge1Text',
      type: 'text',
      label: 'Üzən Rozetka 3 (Keyfiyyət / Təbii) - Başlıq',
      i18n: true,
      placeholder: '100% Təbii',
      default: { az: '100% Təbii', en: '100% Natural', ru: '100% Натурально' },
    },
    {
      key: 'badge1Desc',
      type: 'text',
      label: 'Üzən Rozetka 3 (Keyfiyyət / Təbii) - Alt mətn / Təsvir',
      i18n: true,
      placeholder: 'Pendir & Xəmir',
      default: { az: 'Pendir & Xəmir', en: 'Cheese & Dough', ru: 'Сыр и Тесто' },
    },

    // ==========================================
    // BÖLMƏ 4: "Niyə biz?" Xüsusiyyət Kartları (3 Ədəd)
    // ==========================================
    {
      key: 'feature1Title',
      type: 'text',
      section: '✨ "Niyə biz?" Xüsusiyyət Kartları (3 Ədəd)',
      label: 'Xüsusiyyət 1 - Başlıq (Məs: Təzə inqrediyentlər)',
      i18n: true,
      placeholder: 'Təzə inqrediyentlər',
      default: { az: 'Təzə inqrediyentlər', en: 'Fresh Ingredients', ru: 'Свежие ингредиенты' },
    },
    {
      key: 'feature1Desc',
      type: 'textarea',
      label: 'Xüsusiyyət 1 - Təsvir / Açıqlama',
      i18n: true,
      placeholder: 'Hər gün seçilmiş təbii tərəvəzlər və xalis pendir növləri.',
      default: {
        az: 'Hər gün seçilmiş təbii tərəvəzlər və xalis pendir növləri.',
        en: 'Daily selected natural vegetables and cheeses.',
        ru: 'Ежедневно отобранные свежие овощи и сыры.',
      },
    },
    {
      key: 'feature2Title',
      type: 'text',
      label: 'Xüsusiyyət 2 - Başlıq (Məs: Sürətli xidmət)',
      i18n: true,
      placeholder: 'Sürətli xidmət',
      default: { az: 'Sürətli xidmət', en: 'Fast Service', ru: 'Быстрый сервис' },
    },
    {
      key: 'feature2Desc',
      type: 'textarea',
      label: 'Xüsusiyyət 2 - Təsvir / Açıqlama',
      i18n: true,
      placeholder: 'Sifarişiniz isti və xırçıltılı şəkildə masanıza operativ çatdırılır.',
      default: {
        az: 'Sifarişiniz isti və xırçıltılı şəkildə masanıza operativ çatdırılır.',
        en: 'Hot and crispy straight to your table.',
        ru: 'Горячая и хрустящая пицца быстро к столу.',
      },
    },
    {
      key: 'feature3Title',
      type: 'text',
      label: 'Xüsusiyyət 3 - Başlıq (Məs: Rahat atmosfer)',
      i18n: true,
      placeholder: 'Rahat atmosfer',
      default: { az: 'Rahat atmosfer', en: 'Cozy Atmosphere', ru: 'Уютная атмосфера' },
    },
    {
      key: 'feature3Desc',
      type: 'textarea',
      label: 'Xüsusiyyət 3 - Təsvir / Açıqlama',
      i18n: true,
      placeholder: 'Ailəniz və dostlarınızla xoş xatirələr yaratmaq üçün isti və səmimi məkan.',
      default: {
        az: 'Ailəniz və dostlarınızla xoş xatirələr yaratmaq üçün isti və səmimi məkan.',
        en: 'A warm and friendly place to create sweet memories.',
        ru: 'Теплое и душевное место для приятных воспоминаний.',
      },
    },
  ],
};

registerBlock(heroBlockSchema);
