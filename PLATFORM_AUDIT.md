# SiteX Platforma və Dashboard Dərin Texniki Analiz Hesabatı

**Tarix:** 2026-11-07  
**Rol:** Senior Full-Stack Developer & React / Next.js Arxitektor  
**Ümumi Qiymət:** 6.8 / 10  

---

## 1. İcraçı Xülasəsi və Ümumi Qiymətləndirmə

SiteX layihəsi restoran, kafe və xidmət müəssisələri üçün nəzərdə tutulmuş çoxfunksiyalı veb-sayt qurma və idarəetmə platformasıdır. Layihənin təməlində müasir texnoloji stack (Next.js 16.4.3, React 19.3.0, Prisma 6.9.0, Tailwind CSS v4, TypeScript 5) dayanır. Ən güclü tərəfləri ətraflı Prisma məlumat sxemi (20-dən çox əlaqəli model), unikal daxili Style Token Language (STL) sintaktik analizator və kompilyator mühərriki, habelə qida sahəsi üçün ixtisaslaşmış geniş biznes modullarıdır (menyu, iş saatları, masalar üçün dinamik QR kod generatoru, əməkdaşların icazə və maaş uçotu).

Bununla belə, sistemin arxitekturasında təcili müdaxilə tələb edən ciddi təhlükəsizlik, məntiq və performans qüsurları mövcuddur:
- **Kritik Məntiq Xətası:** `Site Editor` modulunda qaralama (draft) avtomatik yadda saxlanılarkən canlı `publishedContent` sahəsini birbaşa əzir və `EDITOR` rolunun yayım məhdudiyyətini ləğv edir.
- **Təhlükəsizlik:** Autentifikasiyasız ictimai `GET /api/debug-uploads` endpoint-i hostinq daxili fayl yollarını və qovluq strukturlarını sızdırır. JWT sessiya tokeni yenilənmədiyi üçün bloklanmış (BANNED) və abunəliyi bitmiş istifadəçilər API əməliyyatlarına maneəsiz davam edir.
- **Vəziyyət İdarəsi (State Management):** Dashboard daxilində vahid qlobal state (Zustand / Context) yoxdur. 18-dən çox səhifə hər naviqasiyada `localStorage.getItem('currentOrgId')` və təkrar `/api/organizations` fetch çağırışları edir.
- **Komponent Monolitliyi və Performans:** Tema redaktoru (`src/app/dashboard/theme/page.tsx`) 2943 sətirlik tək bir React müştəri komponentində toplanıb; QR modulunda `jspdf` və `qrcode` kitabxanaları klient bundle-nı şişirdir; ictimai sayt görünüşü (`/site/[slug]`) hər ziyarətçi üçün sıfır keşləmə ilə (`revalidate: 0`) 6 böyük DB cədvəlini oxuyur.

---

## 2. Funksiyaların Tam İnventarı

| Modul / Səhifə | Təyinatı və Əhatə Dairəsi | Status | Əlaqəli Əsas Fayllar |
| :--- | :--- | :--- | :--- |
| **Site Editor** | Blok əsaslı canlı məzmun redaktoru (Hero, About, Contact, Menu, Gallery, Reservation) | **Qismən işləyir** | `src/app/dashboard/site-editor/page.tsx`<br>`src/modules/site-editor/*` |
| **Theme Editor** | STL kod və vizual tema qurucusu, canlı iframe preview | **Qismən işləyir** | `src/app/dashboard/theme/page.tsx`<br>`src/modules/stl/*` |
| **Builder v1** | Köhnə vizual blok dizayneri | **İşləmir (Dead)** | `src/app/dashboard/builder/page.tsx`<br>`src/modules/builder/*` (15 fayl istifadəsizdir) |
| **Menyu İdarəsi** | Kateqoriyalar, yeməklər, inqrediyentlər, qiymət, video | **İşləyir** | `src/app/dashboard/menu/page.tsx`<br>`src/app/api/organizations/[orgId]/menu/*` |
| **Məhsul / Xidmətlər** | Qeyri-qida müəssisələri üçün dinamik kataloq meneceri | **İşləyir** | `src/components/dashboard/ItemCatalogManager.tsx` |
| **QR Menyu Generator** | Masa sayına uyğun QR kod dizaynı, şablonlar, PDF ixracı | **İşləyir** | `src/app/dashboard/qr/page.tsx` |
| **Qalereya** | Şəkillərin yüklənməsi, sıralanması və görünüş filtrləri | **İşləyir** | `src/app/dashboard/gallery/page.tsx` |
| **Paketlər / Tariflər** | Xidmət paketləri, endirimli qiymət və funksiyalar | **İşləyir** | `src/app/dashboard/packages/page.tsx` |
| **Müraciətlər (Inquiries)** | Sayt formalarından daxil olan müştəri ismarışları | **İşləyir** | `src/app/dashboard/inquiries/page.tsx` |
| **İş Saatları** | Həftəlik qrafik, fasilələr, gecə növbəsi və real-vaxt statusu | **İşləyir** | `src/app/dashboard/working-hours/page.tsx`<br>`src/hooks/useWorkingHours.ts` |
| **Əməkdaşlar Sistemi** | Rol əsaslı icazələr, maaş cədvəli, bonus, cəza və audit log | **İşləyir** | `src/app/dashboard/employees/page.tsx`<br>`src/app/api/employees/*` |
| **Sosial və Feed** | Sosial platforma linkləri və Instagram/TikTok feed sinxronizasiyası | **İşləyir** | `src/app/dashboard/social/page.tsx` |
| **Splash Screen** | Açılış animasiyasının konfiqurasiyası | **İşləyir** | `src/app/dashboard/splash/page.tsx` (Yalnız SUPER_ADMIN) |
| **Eksport / İdxal** | Sayt məlumatlarının bütöv JSON ixracı və bərpası | **İşləyir** | `src/app/dashboard/export-import/page.tsx` |
| **Sayt Göstəricisi (SSR)** | Ziyarətçilər üçün ictimai veb-sayt təqdimatı | **İşləyir** | `src/app/site/[slug]/page.tsx`<br>`src/components/themes/RestaurantSite.tsx` |
| **Super Admin Paneli** | Qlobal platforma tənzimləmələri, istifadəçi və sayt idarəsi | **İşləyir** | `src/app/admin/*` |
| **Analitika** | Ziyarətçi, baxış və klik statistikası | **İşləmir** | `src/app/dashboard/analytics/page.tsx` (`ComingSoon` stub) |
| **Abunəlik və Ödənişlər** | Plan seçimi, fakturalar və ödəniş şlüzü | **İşləmir** | `src/app/dashboard/billing/page.tsx` (`ComingSoon` stub) |

---

## 3. Aşkarlanan Texniki Problemlər Cədvəli

| № | Problem | Yer (fayl / sətir) | Ciddilik | Səbəb | Təsir və Həll Yolu |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | Draft auto-save canlı saytı əzir və RBAC-ı pozur | `src/app/api/organizations/[orgId]/site-content/route.ts:52-65` | **Kritik** | `PUT` sorğusu həm `draftContent`, həm də `publishedContent` sahələrinə eyni JSON-u yazır. | `EDITOR` rolu `publish` səlahiyyəti olmadan redaktə etdiyi an canlı sayt dəyişir. Həll: `PUT`-da yalnız `draftContent` yazılmalıdır. |
| **2** | Açıq debug endpoint server fayl strukturunu sızdırır | `src/app/api/debug-uploads/route.ts:25-60` | **Kritik** | Autentifikasiyasız ictimai `GET` sorğusu hostinq daxili yollarını və ana qovluqları skan edir. | Hakerlər server qovluq arxitekturasını öyrənə bilir. Həll: Endpoint silinməli və ya yalnız lokal rejimə bağlanmalıdır. |
| **3** | Bloklanmış və vaxtı bitmiş istifadəçilər API əməliyyatlarına davam edir | `src/lib/auth.ts:108-125` və `src/app/api/organizations/*` | **Kritik** | JWT callback DB statusunu yeniləmir; `checkUserAccess` əksər API-lərdə çağırılmır. | Banned istifadəçi 30 gün boyunca API-ləri çağıra bilir. Həll: API-lərdə DB status yoxlanışı (`verifyTenantAccess`) tətbiq edilməlidir. |
| **4** | SVG Stored XSS və yoxlanılmamış MIME-type | `src/app/api/organizations/[orgId]/upload/route.ts:40-65` | **Yüksək** | `file.type.startsWith('image/')` SVG skriptlərini buraxır. Klient fayl uzantısı birbaşa götürülür. | Zərərli SVG skript icra edə bilər. Həll: `sharp` ilə təsdiqləmə, SVG sanitarizasiyası və təhlükəsiz adlandırma. |
| **5** | MySQL DB şişməsi (Base64 faylların `MediaAsset.data`-ya yazılması) | `src/app/api/organizations/[orgId]/upload/route.ts:88-98` | **Yüksək** | 15MB-a qədər fayllar Base64 kimi MySQL `LongText` sütununa yazılır. | DB backup-ları, RAM və cavab müddəti eksponensial pisləşir. Həll: Faylları yalnız disk/S3-də saxlamaq, bazada yalnız URL saxlamaq. |
| **6** | Qlobal state çatışmazlığı və `localStorage` dublikasiyası | `DashboardShell.tsx` və 18 ayrı səhifə | **Yüksək** | Hər naviqasiyada təkrar fetch və pəncərə hadisələri (`org-updated`) istifadə olunur. | Komponentlər arasında yarış vəziyyətləri və artıq şəbəkə trafiki. Həll: `CurrentOrgContext` və ya Zustand tətbiqi. |
| **7** | `SiteEditorShell` timer-də Stale Closure və yarış vəziyyəti | `src/modules/site-editor/components/SiteEditorShell.tsx:125-145` | **Yüksək** | `setTimeout` daxilindəki `saveDraft` reaktiv asılılıqlar səbəbilə köhnə state-i göndərə bilir. | Redaktə zamanı bəzi simvolların itməsi riski. Həll: `useRef` ilə son vəziyyəti saxlamaq və debounced hook istifadə etmək. |
| **8** | 2943 sətirlik monolit tema komponenti | `src/app/dashboard/theme/page.tsx` | **Orta** | Bütün redaktor, STL analizatoru, preview və modal eyni faylda render olunur. | Hər düymə basıldıqda minlərlə DOM xətti re-render olur. Həll: Tablar üzrə `next/dynamic` ilə parçalamaq. |
| **9** | İctimai saytda keşləmənin olmaması (`revalidate = 0`) | `src/app/site/[slug]/page.tsx:8-9` | **Orta** | Hər ictimai sorğuda 6 böyük DB cədvəli birləşmə ilə oxunur. | Sayt trafik aldıqda verilənlər bazası çökə bilər. Həll: `revalidate = 60` və ya `revalidateTag` ilə ISR. |
| **10** | İctimai saytda çoxdilliliyin itirilməsi | `src/lib/site-content-resolver.ts:30-55` | **Orta** | Redaktorda 3 dil olsa da, render funksiyası dili `'az'` olaraq sabitləyib. | Digər dillərdə daxil edilmiş mətnlər ziyarətçiyə görünmür. Həll: Dinamik dil arqumenti ötürmək. |
| **11** | Dead Code: `src/modules/builder` modulu | `src/modules/builder/*` | **Aşağı** | 15 fayldan ibarət köhnə builder modulu layihədə heç yerdə istifadə edilmir. | Kod bazasını ağırlaşdırır və çaşqınlıq yaradır. Həll: Tamamilə silmək. |
| **12** | Qlobal təhlükəsizlik qatının (`middleware.ts`) yoxluğu | Layihə kökü | **Yüksək** | Təhlükəsizlik başlıqları (CSP, HSTS, X-Frame-Options) və qlobal qoruma yoxdur. | Klikcekinq və skript injeksiyalarına qarşı zəiflik. Həll: `middleware.ts` əlavə etmək. |

---

## 4. Kritik Problemlər Üçün Düzəldilmiş Kod Nümunələri

### 4.1. Draft və Publish Məntiqinin Düzəldilməsi
**Fayl:** `src/app/api/organizations/[orgId]/site-content/route.ts`

```typescript
// YALNIZ draftContent yenilənir! publishedContent toxunulmaz qalır.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const membership = await verifyAccess(orgId);
  if (!membership) return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });

  const body = await req.json();
  const contentMap = body.content as Record<string, Record<string, unknown>>;

  if (typeof contentMap !== 'object' || contentMap === null) {
    return NextResponse.json({ error: 'Yanlış məlumat formatı' }, { status: 400 });
  }

  const ops = [];
  for (const [pageKey, blocks] of Object.entries(contentMap)) {
    if (!blocks || typeof blocks !== 'object') continue;
    for (const [blockKey, doc] of Object.entries(blocks)) {
      ops.push(
        prisma.siteContent.upsert({
          where: { organizationId_pageKey_blockKey: { organizationId: orgId, pageKey, blockKey } },
          create: {
            organizationId: orgId,
            pageKey,
            blockKey,
            draftContent: (doc as object) ?? {},
            publishedContent: {}, // İlkin boş saxlanılır
          },
          update: {
            draftContent: (doc as object) ?? {},
            // publishedContent BURADA DƏYİŞDİRİLMİR!
          },
        })
      );
    }
  }

  await prisma.$transaction(ops);
  return NextResponse.json({ success: true, mode: 'draft_saved' });
}
```

### 4.2. Təhlükəli Debug Endpoint-in Neytrallaşdırılması
**Fayl:** `src/app/api/debug-uploads/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse } from '@/lib/admin';

export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  // Production mühitində qəti şəkildə bloklanır
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Bu əməliyyat yalnız lokal test üçün nəzərdə tutulub' }, { status: 403 });
  }

  return NextResponse.json({ status: 'ok', message: 'Təhlükəsiz rejim' });
}
```

### 4.3. Banned və Vaxtı Keçmiş İstifadəçilər Üçün Qoruma
**Fayl:** `src/lib/tenant-auth.ts`

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function verifyTenantAccess(orgId: string, requiredRole?: 'OWNER' | 'ADMIN' | 'EDITOR') {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, status: 401, error: 'İcazəsiz giriş' };

  const userId = (session.user as { id: string }).id;

  // DB-dən cari statusu yoxla (JWT-yə güvənmə)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, subscriptionExpiry: true, role: true },
  });

  if (!user || user.status === 'BANNED') {
    return { ok: false, status: 403, error: 'Hesab bloklanmışdır' };
  }

  if (user.role !== 'SUPER_ADMIN' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
    return { ok: false, status: 403, error: 'İstifadə müddətiniz bitmişdir' };
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });

  if (!membership && user.role !== 'SUPER_ADMIN') {
    return { ok: false, status: 403, error: 'Bu təşkilata giriş icazəniz yoxdur' };
  }

  if (requiredRole === 'ADMIN' && membership?.role === 'EDITOR') {
    return { ok: false, status: 403, error: 'Bu əməliyyat üçün admin səlahiyyəti lazımdır' };
  }

  return { ok: true, userId, userRole: user.role, membership };
}
```

---

## 5. Rəqiblərlə Müqayisə və Çatışmayan Funksiyalar (Wix / Webflow / WordPress)

1. **Versiya Tarixçəsi və Geri Qaytarma (Rollback):**
   - *Status:* Prisma-da `SiteContentHistory` modeli var, lakin UI səviyyəsində keçmiş versiyaların siyahısı, fərq müqayisəsi və "Geri qaytar" düyməsi mövcud deyil.
2. **Xüsusi Domenlər (Custom Domains):**
   - *Status:* Saytlar yalnız `site/[slug]` formatında açılır. CNAME / A qeydləri vasitəsilə fərdi domenlərin qoşulması və avtomatlaşdırılmış SSL (Let's Encrypt / Cloudflare for SaaS) infrastrukturu yoxdur.
3. **Forma Bildiriş İnteqrasiyaları:**
   - *Status:* Əlaqə forması göndəriləndə yalnız bazaya yazılır. Sayt sahibinə ani Telegram bildirişi və ya SMTP e-poçt getmir.
4. **Fayl Saxlama Quotaları (Storage Limits):**
   - *Status:* İstifadəçilər limitsiz 100MB video və 15MB şəkil yükləyə bilirlər. Hər sayt/təşkilat üçün maksimum disk həcmi təyin edilməyib.
5. **SEO Qabaqcıl Alətləri:**
   - *Status:* Sadə başlıq və təsvir var; lakin avtomatik `sitemap.xml`, `robots.txt`, OpenGraph şəkil generatoru və `Schema.org` JSON-LD zəngin nəticələri mövcud deyil.

---

## 6. Prioritetləşdirilmiş Fəaliyyət Planı

### Mərhələ 1: Təcili Düzəlişlər (1 - 3 Gün)
- [ ] `PUT /api/organizations/[orgId]/site-content` daxilindən `publishedContent` yenilənməsini ayırmaq; draft və publish axınını bərpa etmək.
- [ ] `/api/debug-uploads` faylını silmək və ya sərt autentifikasiya altına almaq.
- [ ] Bütün təşkilat API sorğularına `verifyTenantAccess` funksiyasını tətbiq etmək (bloklanmış istifadəçilərin qarşısını almaq).
- [ ] `upload/route.ts` faylında SVG fayllarını sanitarizasiya etmək və fayl adlarını təhlükəsiz generasiya etmək.

### Mərhələ 2: Qısamüddətli Arxitektura Təkmilləşdirməsi (1 - 2 Həftə)
- [ ] Dashboard üçün mərkəzləşdirilmiş `CurrentOrgContext` yaratmaq; 18 səhifədəki `localStorage` kodlarını təmizləmək.
- [ ] `SiteEditorShell` timer-ini `useRef` və təhlükəsiz debounced hook ilə əvəzləmək.
- [ ] İstifadəsiz `src/modules/builder` qovluğunu repozitoriyadan silmək.
- [ ] `theme/page.tsx` və `qr/page.tsx` komponentlərini tablar üzrə ayrı fayllara bölmək; `jspdf`-i dinamik `await import()` ilə yükləmək.

### Mərhələ 3: Uzunmüddətli Miqyaslanma və İnkişaf (1 Ay+)
- [ ] Şəkil və media fayllarını MySQL bazasından çıxarıb Cloudflare R2 / AWS S3 obyekt yaddaşına köçürmək.
- [ ] İctimai sayt (`/site/[slug]`) üçün `revalidate = 60` və ya On-Demand Revalidation (`revalidateTag`) aktiv etmək.
- [ ] Əlaqə formaları üçün Telegram bot və SMTP bildiriş xidməti qurmaq.
- [ ] `/dashboard/analytics` və `/dashboard/billing` modullarını Stripe/yerli ödəniş sistemləri və sadə analitika ilə təmin etmək.
