# MyRestoran — Multi-Tenant Restaurant SaaS Platform

Restoran, kafe və yemək işletmələri üçün professional veb sayt yaratma platforması.

## 🚀 Sürətli Başlanğıc

### 1. PostgreSQL qurun

Əgər PostgreSQL qurulmayıbsa:
- [PostgreSQL-i yükləyin](https://www.postgresql.org/download/windows/)
- Yükləmə zamanı şifrəni yadda saxlayın

**Veritabanı yaradın:**
```sql
-- psql-də icra edin:
CREATE DATABASE myrestoran;
```

### 2. Environment konfiqurasiyası

`.env` faylını redaktə edin:
```
DATABASE_URL="postgresql://postgres:SIZIN_SIFRENIZ@localhost:5432/myrestoran?schema=public"
NEXTAUTH_SECRET="burada-uzun-tesadüfi-bir-string-yazin"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Asılılıqları yükləyin

```bash
npm install
```

### 4. Veritabanını qurun

```bash
# Prisma şeması tətbiq edin
npm run db:push

# Demo məlumatları yükləyin
npm run db:seed
```

### 5. Geliştirme serverini başladın

```bash
npm run dev
```

🌐 http://localhost:3000 ünvanına daxil olun

---

## 🔑 Demo Giriş

Seed işlədikdən sonra:
- **E-poçt:** `demo@myrestoran.az`
- **Şifrə:** `demo123`
- **Demo sayt:** http://localhost:3000/site/lezzet-restorani

---

## 📁 Layihə Quruluşu

```
src/
├── app/
│   ├── (auth)/              # Giriş, Qeydiyyat
│   │   ├── giris/           # Login
│   │   └── qeydiyyat/       # Register
│   ├── dashboard/           # Admin Panel
│   │   ├── page.tsx         # Dashboard əsas səhifə
│   │   ├── menu/            # Menyu idarəetməsi
│   │   ├── theme/           # Tema redaktoru
│   │   ├── whatsapp/        # WhatsApp ayarları
│   │   ├── website/         # Sayt idarəetməsi
│   │   ├── settings/        # Parametrlər
│   │   └── new-organization/# Yeni işletmə
│   ├── site/[slug]/         # Yayınlanmış restoran saytı
│   └── api/
│       ├── auth/            # NextAuth + Register
│       ├── organizations/   # Tenant CRUD
│       └── site/[slug]/     # Public API
├── components/
│   ├── dashboard/           # Admin UI bileşenləri
│   └── themes/              # Restoran sayt bileşeni
├── lib/
│   ├── db.ts                # Prisma client
│   ├── auth.ts              # NextAuth konfiqurasiyası
│   ├── themes.ts            # Tema sistemi
│   ├── validations.ts       # Zod şemaları
│   └── utils.ts             # Yardımçı funksiyalar
prisma/
├── schema.prisma            # Veritabanı sxemi
└── seed.ts                  # Demo məlumatlar
```

---

## 🛠️ Komandalar

```bash
npm run dev          # Geliştirme serveri
npm run build        # Production build
npm run db:push      # DB şeması tətbiq et
npm run db:seed      # Demo məlumatlar yüklə
npm run db:studio    # Prisma Studio (DB görüntüləyici)
```

---

## 🎯 Faza 1 — MVP Xüsusiyyətlər

- ✅ Qeydiyyat / Giriş / Oturum
- ✅ İşletmə yaratma sihirbazı
- ✅ Dashboard
- ✅ Menyu kateqoriyaları + yemək CRUD
- ✅ Şəkil yükləmə
- ✅ 3 hazır tema + rəng/font redaktoru
- ✅ Qaralama saxla + Saytı yayınla
- ✅ WhatsApp sifariş linki
- ✅ Yayınlanmış restoran saytı (hero, menyu, əlaqə, iş saatları)
- ✅ Çox kiracılı (tenant) izolasiya
- ✅ Responsiv dizayn

---

## 🔜 Faza 2-dən

- Canlı önizlə redaktoru
- Bölmə əlavə et / sil / yenidən sırala
- Çoklu şəkil qalereyası
- Analitika
- Özel domain
- Abunəlik / ödəniş

---

## 🔒 Təhlükəsizlik

- Hər sorğuda server tərəfli tenant yoxlaması
- Bcrypt şifrə hash
- JWT oturum
- Fayl yükləmədə MIME + ölçü yoxlaması
- SQL injection — Prisma ORM ilə qorunur
