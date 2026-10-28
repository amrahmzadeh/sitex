import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await hash('demo123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@myrestoran.az' },
    update: {},
    create: {
      email: 'demo@myrestoran.az',
      name: 'Demo İstifadəçi',
      passwordHash,
    },
  });

  console.log('✅ User created:', user.email);

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'lezzet-restorani' },
    update: {},
    create: {
      name: 'Ləzzət Restoranı',
      slug: 'lezzet-restorani',
      description: 'Bakının ən dadlı Azərbaycan mətbəxi. Təzə məhsullar, əl işi yeməklər və mehriban xidmət.',
      phone: '+994 50 123 45 67',
      email: 'info@lezzet.az',
      address: 'Nizami küçəsi 45, Bakı',
      city: 'Bakı',
      currency: 'AZN',
      memberships: {
        create: { userId: user.id, role: 'OWNER' },
      },
      whatsappSettings: {
        create: {
          countryCode: '+994',
          phoneNumber: '501234567',
          orderMessage: 'Salam! Bu məhsulu sifariş etmək istəyirəm:\n\nMəhsul: {name}\nQiymət: {price} AZN',
          buttonText: 'WhatsApp ilə sifariş et',
          isEnabled: true,
        },
      },
      socialLinks: {
        createMany: {
          data: [
            { platform: 'instagram', url: 'https://instagram.com/lezzet.az', sortOrder: 0 },
            { platform: 'facebook', url: 'https://facebook.com/lezzet.az', sortOrder: 1 },
          ],
        },
      },
      workingHours: {
        createMany: {
          data: [
            { dayOfWeek: 0, isClosed: true },
            { dayOfWeek: 1, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 2, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 3, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 4, openTime: '10:00', closeTime: '23:00', isClosed: false },
            { dayOfWeek: 5, openTime: '10:00', closeTime: '23:00', isClosed: false },
            { dayOfWeek: 6, openTime: '11:00', closeTime: '23:00', isClosed: false },
          ],
        },
      },
    },
    include: { memberships: true },
  });

  console.log('✅ Organization created:', org.name);

  // Create website with elegant theme
  const defaultTheme = {
    id: 'elegant',
    name: 'Elegant',
    primaryColor: '#C8762A',
    secondaryColor: '#2C1810',
    accentColor: '#E8C9A0',
    backgroundColor: '#FFF8F0',
    textColor: '#1A1A1A',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    borderRadius: '12px',
    heroHeight: '85vh',
    heroOverlay: 0.45,
    templateId: 'elegant',
    buttonStyle: 'solid',
    cardStyle: 'elevated',
    headerStyle: 'transparent',
    footerStyle: 'dark',
  };

  await prisma.website.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      draftTheme: defaultTheme,
      publishedTheme: defaultTheme,
      isPublished: true,
      publishedAt: new Date(),
      seoTitle: 'Ləzzət Restoranı — Bakının ən dadlı Azərbaycan mətbəxi',
      seoDescription: 'Bakının ən dadlı Azərbaycan mətbəxi. Təzə məhsullar, əl işi yeməklər.',
      pagesConfig: JSON.parse('[{"id":"home","name":"Ana Səhifə","enabled":true,"order":0},{"id":"about","name":"Haqqımızda","enabled":true,"order":1},{"id":"menu","name":"Menyu","enabled":true,"order":2},{"id":"contact","name":"Əlaqə","enabled":true,"order":3}]'),
      publishedPages: JSON.parse('[{"id":"home","name":"Ana Səhifə","enabled":true,"order":0},{"id":"about","name":"Haqqımızda","enabled":true,"order":1},{"id":"menu","name":"Menyu","enabled":true,"order":2},{"id":"contact","name":"Əlaqə","enabled":true,"order":3}]'),
    },
  });

  console.log('✅ Website created');

  // Create menu categories
  const categories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: 'soyuq-meze' } },
      update: {},
      create: { organizationId: org.id, name: 'Soyuq Məzə', slug: 'soyuq-meze', sortOrder: 0, isVisible: true },
    }),
    prisma.menuCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: 'issiq-meze' } },
      update: {},
      create: { organizationId: org.id, name: 'İsti Məzə', slug: 'issiq-meze', sortOrder: 1, isVisible: true },
    }),
    prisma.menuCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: 'ash-novbeti' } },
      update: {},
      create: { organizationId: org.id, name: 'Aş Növbəti', slug: 'ash-novbeti', sortOrder: 2, isVisible: true },
    }),
    prisma.menuCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: 'desert' } },
      update: {},
      create: { organizationId: org.id, name: 'Desert', slug: 'desert', sortOrder: 3, isVisible: true },
    }),
    prisma.menuCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: 'icecekler' } },
      update: {},
      create: { organizationId: org.id, name: 'İçkilər', slug: 'icecekler', sortOrder: 4, isVisible: true },
    }),
  ]);

  console.log('✅ Categories created:', categories.map(c => c.name).join(', '));

  // Create menu items
  const [mezeCat, istiCat, ashCat, desertCat, iceCat] = categories;

  const items = [
    // Soyuq Məzə
    { categoryId: mezeCat.id, name: 'Bakı Salat', slug: 'baki-salat', description: 'Pomidor, xiyar, soğan, zeytun yağı ilə', price: 8.50, isFeatured: true, isNew: false, isPopular: true, sortOrder: 0, ingredients: 'Pomidor, xiyar, soğan, zeytun yağı, limon', portionSize: '250q' },
    { categoryId: mezeCat.id, name: 'Badımcan Kavurma', slug: 'badimcan-kavurma', description: 'Qızardılmış badımcan, sarımsaq, pomidor sosu', price: 7.00, isFeatured: false, isNew: true, isPopular: false, sortOrder: 1, portionSize: '200q' },
    { categoryId: mezeCat.id, name: 'Lavangi Pendir', slug: 'lavangi-pendir', description: 'Ev pendiri, zeytun, göyərti ilə', price: 9.50, isFeatured: false, isNew: false, isPopular: false, sortOrder: 2, portionSize: '180q' },
    // İsti Məzə
    { categoryId: istiCat.id, name: 'Qutab (Ətli)', slug: 'qutab-etli', description: 'Əl ilə yuğurulmuş xəmir, quzuəti, soğan', price: 6.00, isFeatured: true, isNew: false, isPopular: true, sortOrder: 0, portionSize: '2 ədəd', ingredients: 'Xəmir, quzuəti, soğan, kərə yağı' },
    { categoryId: istiCat.id, name: 'Dolma (Yarpaq)', slug: 'dolma-yarpaq', description: 'Üzüm yarpağında bişirilmiş ətli düyü', price: 11.00, isFeatured: true, isNew: false, isPopular: true, sortOrder: 1, portionSize: '5 ədəd' },
    { categoryId: istiCat.id, name: 'Küftə Bozbas', slug: 'kufte-bozbas', description: 'Noxudlu, kartoflu isti şorba', price: 9.00, isFeatured: false, isNew: false, isPopular: false, sortOrder: 2, portionSize: '400ml' },
    // Aş
    { categoryId: ashCat.id, name: 'Plov (Dəmyə)', slug: 'plov-demye', description: 'Kəsmikli, xurmalı, ərikli Azərbaycan plovu', price: 18.00, isFeatured: true, isNew: false, isPopular: true, sortOrder: 0, portionSize: '400q', ingredients: 'Düyü, kəsmik, xurma, ərik, kərə yağı' },
    { categoryId: ashCat.id, name: 'Layla Kabab', slug: 'layla-kabab', description: 'Quzuəti kabab, soğan, limon', price: 22.00, isFeatured: true, isNew: false, isPopular: false, sortOrder: 1, portionSize: '300q' },
    { categoryId: ashCat.id, name: 'Tava Kabab', slug: 'tava-kabab', description: 'Tava üzərində bişirilmiş lülə kabab', price: 19.00, discountPrice: 16.00, isFeatured: false, isNew: true, isPopular: false, sortOrder: 2, portionSize: '280q' },
    // Desert
    { categoryId: desertCat.id, name: 'Paklavanın Seçim Təbağı', slug: 'paklava-tebag', description: 'Müxtəlif növ Azərbaycan şirniyyatı', price: 14.00, isFeatured: false, isNew: false, isPopular: true, sortOrder: 0, portionSize: '12 ədəd' },
    { categoryId: desertCat.id, name: 'Şəkərbura', slug: 'sekerbura', description: 'Noğullu, fıstıqlı əl işi şirniyyat', price: 8.50, isFeatured: false, isNew: false, isPopular: false, sortOrder: 1, portionSize: '4 ədəd' },
    // İçki
    { categoryId: iceCat.id, name: 'Doşab Şərbəti', slug: 'dosab-serbeti', description: 'Ev hazırlaması nar doşabı şərbəti', price: 4.50, isFeatured: false, isNew: false, isPopular: true, sortOrder: 0, portionSize: '300ml' },
    { categoryId: iceCat.id, name: 'Limonlu Çay', slug: 'limonlu-cay', description: 'Armudu stəkanda qara çay', price: 3.00, isFeatured: false, isNew: false, isPopular: false, sortOrder: 1, portionSize: '200ml' },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: item.slug } },
      update: {},
      create: { organizationId: org.id, isVisible: true, ...item },
    });
  }

  console.log('✅ Menu items created:', items.length, 'items');
  console.log('\n🎉 Seed completed!');
  console.log('📧 Demo login: demo@myrestoran.az');
  console.log('🔑 Password: demo123');
  console.log('🌐 Published site: /site/lezzet-restorani');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
