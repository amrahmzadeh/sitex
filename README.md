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
├── config/
│   ├── site-categories.ts   # 25 sayt kateqoriyası və alt kateqoriyalar
│   └── templates/manifest.json # GitHub şablon manifesti
├── lib/
│   ├── db.ts                # Prisma client
│   ├── auth.ts              # NextAuth konfiqurasiyası
│   ├── themes.ts            # Tema sistemi
│   ├── site-pages.ts        # Sayt növünə uyğun standart səhifələr
│   ├── templates/           # GitHub şablon mənbəyi və tətbiqi
│   ├── validations.ts       # Zod şemaları
│   └── utils.ts             # Yardımçı funksiyalar
prisma/
├── schema.prisma            # Veritabanı sxemi
└── seed.ts                  # Demo məlumatlar
```

---

## 🧩 Sayt növləri və GitHub şablonları

Yeni sayt yaradılarkən (`/dashboard/new-organization`) əvvəlcə **25 əsas kateqoriya**
və onların alt kateqoriyaları göstərilir, seçim təsdiqlənir və yalnız sonra mövcud
yaratma prosesi davam edir. Seçilmiş növ `Organization.siteCategory` /
`Organization.siteSubcategory` sahələrində saxlanılır; köhnə saytlar üçün bu sahələr
nullable-dir.

Şablonlar layihədə saxlanılmır — ayrıca GitHub repository-dən yalnız ehtiyac yarandıqda
endirilir. Manifest: [`src/config/templates/manifest.json`](src/config/templates/manifest.json).
Ətraflı təlimat: [`docs/templates-github.md`](docs/templates-github.md).

```bash
# Şablon repository-si (server tərəfində; private repo üçün token tələb olunur)
GITHUB_TEMPLATE_REPO="onlivecorp/website-templates"
# Tag və ya commit SHA ilə sabit versiya
GITHUB_TEMPLATE_REF="v1.0.0"
# Yalnız məxfi repository üçün
GITHUB_TEMPLATE_TOKEN=""
```

GitHub əlçatmaz olsa belə sayt yaradılması dayanmır: şablonun daxili teması tətbiq
olunur və istifadəçiyə xəbərdarlıq göstərilir. Şablon faylları Hostinger diskində
saxlanılmır — müvəqqəti qovluq iş bitdikdən sonra silinir.

---

## 🛠️ Komandalar

```bash
npm run dev          # Geliştirme serveri
npm run build        # Production build
npm test             # Kateqoriya, manifest və şablon təhlükəsizliyi testləri
npm run db:push      # DB şeması tətbiq et
npm run db:seed      # Demo məlumatlar yüklə
npm run db:studio    # Prisma Studio (DB görüntüləyici)
bash scripts/deploy-hostinger.sh            # site.onlive.az-a deploy (SSH)
bash scripts/deploy-hostinger.sh --check    # SSH/Node yoxlaması
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
