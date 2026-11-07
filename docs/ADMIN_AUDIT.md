# Admin Panel Audit Hesabatı (Faz 1)

Bu sənəd SiteX platformasının bütün İdarəetmə Paneli (Dashboard və Super Admin panelləri: route-lar, səhifələr, komponentlər, state idarəetməsi, API təbəqəsi, avtorizasiya, formlar, cədvəllər və təhlükəsizlik) üzrə aparılmış dərin texniki auditin nəticəsidir.

---

## 1. İcraçı Xülasəsi (Executive Summary)

* **Ümumi Sağlamlıq Qiyməti**: **Orta / Həssas (C+)**
  * Tətbiqin əsas funksiyaları (sayt yaratma, menyu, paketlər, qalareya, iş saatları, əməkdaşlar) işlək vəziyyətdədir və möhkəm Prisma verilənlər bazası arxitekturasına əsaslanır.
  * Lakin sistemdə **kritik memarlıq və təhlükəsizlik zəiflikləri**, **3 ədəd natamam (stub) modul**, **həddindən artıq monolit komponentlər (1600+ sətir)**, **mərkəzləşdirilməmiş API/Toast/Xəta idarəetməsi** və **brauzer `localStorage`-dan asılı kritik biznes vəziyyəti** mövcuddur.
* **Kritik Bulğu Sayı**: **6**
* **Yüksək Əhəmiyyətli Bulğular**: **8**
* **Orta Əhəmiyyətli Bulğular**: **10**
* **Aşağı Əhəmiyyətli Bulğular**: **7**
* **Cəmi Bulğular**: **31**
* **Mövcud Test Vəziyyəti**: `npm test` ilə 66 test uğurla keçir (100% pass - STL parser, site-sync, tenant auth, working hours). Komponent/UI testləri yoxdur.
* **Lint Vəziyyəti**: 535 problem (240 xəta, 295 xəbərdarlıq) - əsasən `scripts/`, `modules/stl/`, `any` tipləri və `<img>` teqləri səbəbindən.

---

## 2. Mövcud Memarlıq və Qovluq Quruluşu Xülasəsi

### 2.1 İkili İdarəetmə Quruluşu
Platformada iki fərqli admin səviyyəsi mövcuddur:
1. **Kirayəçi/Təşkilat Dashboard-u (`/dashboard/*`)**:
   * Layout: `src/app/dashboard/layout.tsx` -> `src/components/dashboard/DashboardShell.tsx`
   * Kontekst: `CurrentOrgProvider` (`src/contexts/CurrentOrgContext.tsx`)
   * Naviqasiya: `src/modules/navigation/config.ts` (`dashboardNavItems`)
   * 23 fərqli marşrut (Ana Səhifə, Menyu, Sayt Redaktoru, Sosial Media, Paketlər, İş Saatları, Əməkdaşlar və s.)
2. **Super Admin Paneli (`/admin/*`)**:
   * Layout: `src/app/admin/layout.tsx` -> `src/components/admin/AdminShell.tsx`
   * Giriş: `user.role === 'SUPER_ADMIN'` yoxlanışı ilə məhdudlaşdırılıb.
   * 5 marşrut: İcmal (`/admin`), İstifadəçilər (`/admin/users`), Saytlar (`/admin/sites`), Parametrlər (`/admin/settings`), Audit Jurnalı (`/admin/audit`).

### 2.2 Mövcud Qovluq İerarxiyası
```
src/
├── app/
│   ├── admin/                # Super Admin səhifələri (tam monolit fayllar)
│   ├── api/
│   │   ├── admin/            # Super Admin API marşrutları
│   │   ├── employees/        # Əməkdaş idarəetmə API-ləri
│   │   ├── organizations/    # Kirayəçi/sayt resurs API-ləri
│   │   └── themes/           # Qlobal tema reyestri API-ləri
│   └── dashboard/            # Təşkilat admin səhifələri (23 səhifə)
├── components/
│   ├── admin/                # Yalnız AdminShell.tsx mövcuddur
│   ├── common/               # Yalnız OffHoursNotice.tsx mövcuddur (ortaq UI yoxdur)
│   ├── dashboard/            # DashboardShell, ItemCatalogManager, ThemeLibrary və s.
│   └── themes/               # Sayt render və splash komponentləri
├── contexts/                 # Yalnız CurrentOrgContext.tsx
├── features/
│   └── template-builder/     # 8 ədəd boş qovluq (ölü scaffolding)
├── lib/                      # auth, db, tenant-auth, working-hours, themes və s.
└── modules/
    ├── navigation/           # Menyu konfiqurasiyası və icazə funksiyaları
    ├── site-editor/          # Blok əsaslı vizual redaktor
    ├── stl/                  # STL compiler, parser, tokenizer (Tema Redaktoru asılılığı)
    └── themes/               # Daxili temalar və tema reyestri
```

---

## 3. Modul / Xüsusiyyət Vəziyyət Cədvəli

| Modul Adı | Marşrut / Ərazi | Vəziyyət | Qeyd / Çatışmazlıq |
| :--- | :--- | :--- | :--- |
| **Ana Səhifə** | `/dashboard` | **Çalışır** | Saytların icmalı, statuslar, sürətli keçidlər aktivdir. |
| **Veb Saytım** | `/dashboard/website` | **Çalışır** | Sayt məlumatı, domen, yayınlama, silmə işləyir. |
| **Saytı Redaktə et** | `/dashboard/site-editor` | **Çalışır** | Bloklar üzrə redaktə işləyir, `SiteEditorShell` modulu aktivdir. |
| **Tema Redaktoru** | `/dashboard/theme` | **Köhnəlmiş / Problemik** | Yalnız Super Admin üçün açıqdır, STL mürəkkəbdir, istifadəçi dostu deyil. Faz 2-də silinəcək. |
| **Sosial Media** | `/dashboard/social` | **Çalışır** | Sosial linklər və Instagram feed inteqrasiyası aktivdir. |
| **Qalareya** | `/dashboard/gallery` | **Çalışır** | Şəkil əlavə etmə, URL və fayl yükləmə, sıralama işləyir. |
| **Paketlər** | `/dashboard/packages` | **Çalışır** | Paket yaratma, redaktə, xüsusiyyət siyahısı işləyir. |
| **Sayt Modulları** | `/dashboard/site-modules` | **Çalışır** | Modulların (menyu, paketlər, qalareya, əlaqə) yandırılıb-söndürülməsi işləyir. |
| **Splash Screen** | `/dashboard/splash` | **Kismən Çalışır / Həssas** | Video və kod rejimləri var, lakin kod rejimi unsandboxed iframe istifadə edir (XSS riski). |
| **Menyu** | `/dashboard/menu` | **Çalışır (Monolit)** | 1603 sətirlik tək fayl. Qida kateqoriyalarında işləyir. Xəta idarəetməsi zəifdir. |
| **Xidmətlər** | `/dashboard/services` | **Çalışır** | `ItemCatalogManager` vasitəsilə işləyir. |
| **Məhsullar** | `/dashboard/products` | **Kismən Çalışır** | Aktivləşdirmə `localStorage`-dan oxunur; serverlə sinxronizasiya qeyri-sabitdir. |
| **Müraciətlər** | `/dashboard/inquiries` | **Çalışır** | Əlaqə formalarından daxil olan müraciətlərin idarəsi, qeydlər, statuslar işləyir. |
| **Media Kitabxanası**| `/dashboard/media` | **Çalışmır (Eksik)** | Yalnız `ComingSoon` ekranıdır. Heç bir funksionallıq yoxdur. |
| **Sifariş Ayarları** | `/dashboard/whatsapp` | **Çalışır** | WhatsApp sifariş nömrəsi, mesaj şablonu quraşdırması işləyir. |
| **İş Saatları** | `/dashboard/working-hours` | **Çalışır** | Həftənin günləri, fasilələr, vaxt zonası, avtomatik status yoxlanışı işləyir. |
| **QR Yaradıcı** | `/dashboard/qr` | **Çalışır (Monolit)** | 1257 sətirlik monolit fayl. QR generasiyası, çap, rəng tənzimləməsi işləyir. |
| **Analitika** | `/dashboard/analytics` | **Çalışmır (Eksik)** | Yalnız `ComingSoon` ekranıdır. |
| **Abunəlik** | `/dashboard/billing` | **Çalışmır (Eksik)** | Yalnız `ComingSoon` ekranıdır. |
| **Export / Import** | `/dashboard/export-import` | **Çalışır** | Sayt məlumatlarının JSON export və importu işləyir. |
| **Əməkdaşlar** | `/dashboard/employees` | **Çalışır** | Əməkdaş siyahısı, icazələr, fəaliyyət jurnalı, maliyyə qeydləri aktivdir. |
| **Parametrlər** | `/dashboard/settings` | **Çalışır** | Təşkilat məlumatları, profil, şifrə dəyişmə işləyir. |
| **Yeni Sayt** | `/dashboard/new-organization`| **Kismən Çalışır** | Kateqoriya seçimi işləyir, lakin tema picker `/api/themes` 403 verdiyi üçün daxili temalar itir. |
| **Super Admin: İcmal** | `/admin` | **Çalışır** | Qlobal statistik kartlar göstərilir. Xəta idarəetməsi yoxdur. |
| **Super Admin: İstifadəçilər** | `/admin/users` | **Çalışır** | Axtarış, filtr, abunəlik uzatma, ban, silmə işləyir. |
| **Super Admin: Saytlar** | `/admin/sites` | **Çalışır** | Bütün saytlar, sinxronizasiya statusu, GitHub inteqrasiyası, silmə işləyir. |
| **Super Admin: Parametrlər** | `/admin/settings` | **Çalışır** | Qeydiyyat və girişin qlobal dayandırılması / açılması işləyir. |
| **Super Admin: Audit** | `/admin/audit` | **Çalışır** | Sistem əməliyyatlarının qeydiyyat cədvəli və səhifələnməsi işləyir. |

---

## 4. Ətraflı Bulğu Siyahısı

### 4.1 Kritik Bulğular (Critical - Dərhal Həll Edilməli)

#### [AUD-CRIT-01] XSS Zəifliyi: SplashScreen Unsandboxed Iframe İcrası
* **Önəm**: Kritik
* **Fayl**: `src/components/themes/SplashScreen.tsx:288-330`
* **Təsvir**: İstifadəçi tərəfindən daxil edilən və ya bazada saxlanılan HTML/CSS/JavaScript kodu `<iframe srcDoc={...} />` daxilində heç bir `sandbox` parametri olmadan birbaşa icra edilir.
* **Təsir**: Əgər sayt sahibi və ya zərərverici şəxs splash konfiqurasiyasına zərərli JS skripti yerləşdirərsə, saytı ziyarət edən hər kəsin (o cümlədən daxil olmuş adminlərin) brauzerində skript işə düşür, session tokenləri və ya həssas məlumatlar ələ keçirilə bilər.
* **Tövsiyə**: `sandbox="allow-scripts"` (və ya zərurət olmadıqda heç icazə verməmək) parametri əlavə olunmalı, `allow-same-origin` qətiyyən verilməməlidir; JS skripti sanitizasiyadan keçirilməlidir və ya kod rejimi ləğv edilib təhlükəsiz şablonlarla əvəz olunmalıdır.

#### [AUD-CRIT-02] Təşkilat Sahibinin Öz Temasını Dəyişə Bilməməsi (API Bloklanması)
* **Önəm**: Kritik
* **Fayl**: `src/app/api/organizations/[orgId]/theme/route.ts:14-16`
* **Təsvir**: `PUT /api/organizations/[orgId]/theme` endpointində `if (access.userRole !== 'SUPER_ADMIN')` yoxlanışı sərt şəkildə yazılıb.
* **Təsir**: Normal sayt sahibi (`OWNER` və ya `ADMIN` rolunda olan kirayəçi) öz saytının temasını saxladıqda server 403 Forbidden ("İcazəsiz giriş") xətası qaytarır. Sayt sahibləri temalarını fərdiləşdirə və ya yeni tema seçə bilmir.
* **Tövsiyə**: `verifyTenantAccess(orgId, 'ADMIN')` istifadə edilməli, təşkilatın sahibi və adminlərinə öz saytlarının temasını dəyişməyə icazə verilməlidir.

#### [AUD-CRIT-03] Yeni Sayt Yaratmada 403 Xətası və Daxili Temaların İtməsi
* **Önəm**: Kritik
* **Fayl**: `src/app/api/themes/route.ts:6-16` və `src/components/dashboard/TemplatePicker.tsx:49-52`
* **Təsvir**: `TemplatePicker` yeni sayt yaradarkən daxili temaları almaq üçün `GET /api/themes` çağırır. Lakin həmin endpoint `requireSuperAdmin()` yoxlaması ilə qorunur. Nəticədə adi istifadəçilər üçün 403 xətası qayıdır və səhifədə bütün fərdiləşdirilmiş temalar boş qalır.
* **Təsir**: Adi istifadəçi yeni sayt qeydiyyatından keçəndə yalnız GitHub şablonları görünür, daxili sistem temaları isə yüklənmir.
* **Tövsiyə**: Temaların oxunması (`GET /api/themes`) bütün autentifikasiyadan keçmiş istifadəçilər üçün açıq olmalı; yalnız tema qeydiyyatı/dəyişdirilməsi (`POST / PUT / DELETE`) Super Admin üçün qorunmalıdır.

#### [AUD-CRIT-04] Menyu və Məhsul İcazələrinin Brauzer `localStorage`-da Saxlanması
* **Önəm**: Kritik
* **Fayl**: `src/modules/navigation/config.ts:146-155, 182-191` və `src/components/dashboard/ItemCatalogManager.tsx:92-100`
* **Təsvir**: `isMenuActive` və `isProductsActive` funksiyaları, həmçinin `ItemCatalogManager` modulu menyunun və məhsulların aktiv olub-olmamasını birbaşa brauzerin `localStorage`-ından (`site_${id}_products_enabled`) oxuyur və yazır.
* **Təsir**: Bir istifadəçi başqa cihazdan, gizli rejimdən (incognito) və ya başqa brauzerdən daxil olduqda məhsullar və menyu paneldə itir; iki fərqli admin eyni saytı idarə edərkən parametrlər desinxronizasiya olur.
* **Tövsiyə**: Bu statuslar birbaşa `Organization` və ya `Website.pagesConfig` verilənlər bazası modelində saxlanılmalı və API vasitəsilə idarə olunmalıdır. `localStorage` ehtiyat nüsxəsi ləğv edilməlidir.

#### [AUD-CRIT-05] Global ErrorBoundary və 404/403 Qoruyucu Səhifələrin Olmaması
* **Önəm**: Kritik
* **Fayl**: `src/app/` (və alt qovluqları: `admin/`, `dashboard/`)
* **Təsvir**: `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/dashboard/error.tsx`, `src/app/admin/error.tsx` faylları mövcud deyil (yalnız `src/app/site/[slug]/error.tsx` var).
* **Təsir**: İstənilən render və ya API exception baş verdikdə Next.js qara default xəta ekranı çıxarır və bütün admin interfeysi çökür. İstifadəçi nə baş verdiyini anlamır və geri qayıda bilmir.
* **Tövsiyə**: Həm kök səviyyədə, həm də `/dashboard` və `/admin` üçün müasir dizaynda qlobal `error.tsx`, `not-found.tsx` və `ErrorBoundary` komponentləri yaradılmalıdır.

#### [AUD-CRIT-06] Xəta İdarə Edilməyən API Çağırışları (Unhandled Promise Rejections)
* **Önəm**: Kritik
* **Fayl**: `src/app/admin/page.tsx:21-25`, `src/app/dashboard/menu/page.tsx:63-92`, `src/app/dashboard/settings/page.tsx:39-57`
* **Təsvir**: Səhifələr `fetch('/api/...').then(r => r.json()).then(...)` sintaksisindən istifadə edir, lakin `.catch()` blokları yoxdur və ya `if (!res.ok)` yoxlanılmır. Əgər server 500, 504 və ya 401 qaytararsa, JSON parsing xətası baş verir və `Uncaught (in promise) SyntaxError: Unexpected token <` konsolu doldurur.
* **Təsir**: Səhifə sonsuz loading (skeleton) vəziyyətində qalır, istifadəçiyə heç bir xəta bildirişi verilmir.
* **Tövsiyə**: Bütün API çağırışları mərkəzləşdirilmiş tipli HTTP client (`apiClient`) vasitəsilə aparılmalı, avtomatik status və xəta yaxalama mexanizmi qurulmalıdır.

---

### 4.2 Yüksək Əhəmiyyətli Bulğular (High Severity)

#### [AUD-HIGH-01] Nəhəng Monolit Komponentlər (Code Maintainability & Performance)
* **Önəm**: Yüksək
* **Fayllar**:
  * `src/app/dashboard/menu/page.tsx` (1603 sətir)
  * `src/app/dashboard/qr/page.tsx` (1257 sətir)
  * `src/components/dashboard/ItemCatalogManager.tsx` (1235 sətir)
  * `src/app/dashboard/theme/page.tsx` (1116 sətir)
* **Təsvir**: Bütün modal pəncərələr, formlar, validatorlar, fayl yükləmə mexanizmləri, sürüşdürmə (drag-drop) və filtrasiya tək bir nəhəng faylın daxilində yerləşdirilib.
* **Təsir**: Hər bir düymə basıldıqda bütün nəhəng səhifə re-render olunur; kodun saxlanılması, genişləndirilməsi və test edilməsi qeyri-mümkündür.
* **Tövsiyə**: Hər bir modul `features/<modül>/` strukturu altına köçürülməli, modallar, cədvəllər və formlar kiçik müstəqil alt komponentlərə parçalanmalıdır.

#### [AUD-HIGH-02] 3 Ədəd Saxta (ComingSoon Stub) Modulun Mövcudluğu
* **Önəm**: Yüksək
* **Fayllar**:
  * `src/app/dashboard/media/page.tsx:1-5`
  * `src/app/dashboard/analytics/page.tsx:1-5`
  * `src/app/dashboard/billing/page.tsx:1-5`
* **Təsvir**: Menyu siyahısında "Media Kitabxanası", "Analitika" və "Abunəlik" keçidləri aktiv şəkildə göstərilir, lakin kliklədikdə sadəcə "Tezliklə" mətni çıxır.
* **Təsir**: Müştəridə sistemin natamam və xarab olduğu təəssüratı yaranır.
* **Tövsiyə**: Ya bu modulların baza funksionallığı (məsələn: Media Kitabxanası üçün serverə yüklənmiş şəkillərin qovluğu və silinməsi; Analitika üçün ziyarət sayı və populyar məhsullar) tamamlanmalı, ya da menyuda "Tezliklə" nişanı ilə qeyd olunub deaktiv edilməlidir.

#### [AUD-HIGH-03] Mərkəzləşdirilmiş Bildiriş (Toast) Sisteminin Olmaması
* **Önəm**: Yüksək
* **Fayllar**: `src/app/dashboard/*/page.tsx` (15-dən çox fayl)
* **Təsvir**: Hər bir səhifə öz daxilində `const [toast, setToast] = useState('')` və `setTimeout(() => setToast(''), 3000)` yaradır. Bəzi səhifələrdə isə xəta baş verdikdə heç bir vizual əks-əlaqə (feedback) yoxdur.
* **Təsir**: Kod təkrarı (DRY pozuntusu), dizayn və animasiya uyğunsuzluğu, qısa müddətdə yox olan və ya üst-üstə düşən qarışıq bildirişlər.
* **Tövsiyə**: Qlobal `ToastContext` və ya standartlaşdırılmış bildiriş hook-u (`useToast()`) tətbiq olunmalıdır.

#### [AUD-HIGH-04] Reusable `DataTable` və `ConfirmDialog` Komponentlərinin Yoxluğu
* **Önəm**: Yüksək
* **Fayllar**: `src/app/admin/users/page.tsx`, `src/app/admin/sites/page.tsx`, `src/app/admin/audit/page.tsx`, `src/components/dashboard/employees/EmployeeTable.tsx`
* **Təsvir**: Hər cədvəl üçün ayrı-ayrılıqda pagination düymələri, skeleton yükləyiciləri, axtarış inputları və silmə təsdiq pəncərələri sıfırdan yazılıb.
* **Təsir**: Super Admin və Dashboard arasında fərqli cədvəl təcrübəsi, responsive problemlər, qeyri-sabit istifadəçi təcrübəsi.
* **Tövsiyə**: `components/common/DataTable` və `components/common/ConfirmDialog` komponentləri yaradılmalıdır.

#### [AUD-HIGH-05] `Tema Redaktoru` Modulunun Həddindən Artıq Texniki Borcu və Mürəkkəbliyi
* **Önəm**: Yüksək
* **Fayllar**: `src/app/dashboard/theme/page.tsx`, `src/components/dashboard/theme-editor/*`, `src/modules/stl/*`
* **Təsvir**: Bu modul daxilində STL (Site Theme Language) adlı xüsusi DSL compiler, parser, AST tokenizer, intellisense mühərriki saxlanılır. ESLint xətalarının yarıdan çoxu bu qovluqlardadır. Adi sayt istifadəçisinə bu mürəkkəblik lazım deyil, Super Admin isə bu kod redaktorundan istifadə etmir.
* **Təsir**: Böyük bundle ölçüsü, ağır re-render-lər, kod bazasında ballast.
* **Tövsiyə**: Faz 2 çərçivəsində Tema Redaktoru tam ləğv edilməli, yerinə sadə, vizual və funksional "Tema Kitabxanası" gətirilməlidir.

#### [AUD-HIGH-06] Qlobal HTTP Client və API Tip Təhlükəsizliyinin Olmaması
* **Önəm**: Yüksək
* **Fayllar**: Bütün `src/app/dashboard/**` və `src/app/admin/**` səhifələri
* **Təsvir**: Bütün sorğular xam `fetch('/api/...')` şəklində yazılıb. Base URL, auth headers, CSRF, response formatting və xəta kodları hər yerdə təkrarlanır.
* **Təsir**: API cavablarının strukturu dəyişdikdə heç bir TypeScript xətası çıxmır, runtime-da `undefined` xətaları yaranır.
* **Tövsiyə**: Mərkəzi `lib/api-client.ts` servisi və Zod ilə tipləşdirilmiş API adapterləri qurulmalıdır.

#### [AUD-HIGH-07] Təşkilat Dəyişdirilməsində (Org Switching) Səhifələrin Məlumat Yeniləməməsi
* **Önəm**: Yüksək
* **Fayl**: `src/contexts/CurrentOrgContext.tsx:89-96`
* **Təsvir**: İstifadəçi sol menyudan başqa bir saytı seçdikdə `CurrentOrgContext` `window.dispatchEvent(new CustomEvent('org-updated'))` yayır. Lakin bir çox səhifə bu hadisəni dinləmir, yalnız `[orgId]` asılılığını gözləyir. Bəzi hallarda köhnə saytın məlumatları ekranda qalır (stale closure).
* **Təsir**: Admin A saytında olduğunu zənn edib B saytının menyusunu və ya məlumatlarını redaktə edir.
* **Tövsiyə**: Sayt dəyişdirildikdə ya `router.refresh()` çağırılmalı, ya da bütün aktiv sorğular dərhal ləğv edilib yeni `orgId` ilə yenidən başladılmalıdır.

#### [AUD-HIGH-08] Ölü Kod və Boş Qovluqlar (Scaffolding Ballast)
* **Önəm**: Yüksək
* **Fayllar**: `src/features/template-builder/**` (8 boş qovluq), `src/app/dashboard/template-builder/`
* **Təsvir**: Layihədə vaxtilə başlanılmış, lakin tamamlanmamış və içi tamamilə boş olan qovluq strukturları mövcuddur.
* **Təsir**: Kod bazasında qarışıqlıq, fayl naviqasiyasında maneə.
* **Tövsiyə**: İstifadə olunmayan boş qovluqlar tamamilə silinməlidir.

---

### 4.3 Orta Əhəmiyyətli Bulğular (Medium Severity)

* **[AUD-MED-01]** `src/modules/navigation/config.ts`: Modul qeydiyyatı sistemi yoxdur. Yeni modul əlavə etmək üçün həm `config.ts`, həm `DashboardShell.tsx`, həm də `EmployeeTable.tsx` əllə dəyişdirilməlidir.
* **[AUD-MED-02]** `src/app/admin/users/page.tsx:64`: Form validasiyası çatışmır; abunəlik günləri və ya sayt limitləri üçün mənfi ədədlər və ya yanlış tarixlər göndərilə bilər.
* **[AUD-MED-03]** `src/app/dashboard/menu/page.tsx:80-82`: Qida olmayan kateqoriyaya daxil olduqda `router.replace('/dashboard/services')` çağırılır, lakin əvvəlcə qırmızı xəta ekranı yanıb-sönür (flash of invalid UI).
* **[AUD-MED-04]** `src/components/dashboard/DashboardShell.tsx:68`: Standart `<img>` teqləri istifadə olunur, Next.js `<Image />` komponenti istifadə edilmədiyi üçün LCP və şəkil optimizasiyası itirilir.
* **[AUD-MED-05]** `src/app/dashboard/working-hours/page.tsx:84-89`: Zaman zonası seçimi üçün komponent hər dəfə bütün siyahını render edir; memoizasiya çatışmır.
* **[AUD-MED-06]** `src/components/admin/AdminShell.tsx:99`: Bütün stillər inline CSS obyektləri şəklindədir (`style={{ ... }}`). Tailwind CSS və ya CSS sinifləri istifadə edilmədiyi üçün bundle böyüyür və runtime style re-calculation yaranır.
* **[AUD-MED-07]** `src/modules/stl/compiler.ts:447-466`: Onlarla `any` tipi mövcuddur; tip təhlükəsizliyi tamamilə deaktivdir.
* **[AUD-MED-08]** `src/app/dashboard/export-import/page.tsx:87-95`: Import edilən JSON faylı üçün Zod schema validasiyası aparılmır, yalnız `parsed.version` və `parsed.site` varlığına baxılır. Zədələnmiş JSON verilənlər bazasını xarab edə bilər.
* **[AUD-MED-09]** `src/app/dashboard/social/page.tsx:99-100`: Instagram feed sinxronizasiyasında timeout və retry mexanizmi yoxdur; xarici servis gecikdikdə səhifə cavabsız qalır.
* **[AUD-MED-10]** `src/app/dashboard/employees/page.tsx:42-50`: Süzgəclər və səhifələmə URL query parametrlərinə yazılmır; səhifə yeniləndikdə (F5) seçilmiş filtrlər sıfırlanır.

---

### 4.4 Aşağı Əhəmiyyətli Bulğular (Low Severity)

* **[AUD-LOW-01]** Erişilebilirlik (a11y): Bir çox düymədə `aria-label` çatışmır (məsələn, cədvəldəki qələm və zibil qutusu ikon düymələri).
* **[AUD-LOW-02]** Klaviatura Naviqasiyası: Modal pəncərələr `Escape` düyməsi ilə bağlanmır və `focus-trap` mövcud deyil.
* **[AUD-LOW-03]** Tutarsız Rəng Palitrası: Admin panelində bəzi yerlərdə `#7C5CFC`, bəzi yerlərdə `#00D37D`, bəzi yerlərdə `#F87171` kimi fərqli rəng dəyərləri xam HEX kimi yazılıb.
* **[AUD-LOW-04]** Dark Mode Standartı: Sistem tamamilə qaranlıq fondadır (`#0F0F14`), lakin bəzi köhnə stillər açıq fon üçün nəzərdə tutulub qalıb.
* **[AUD-LOW-05]** Console.log qalıqları: Bəzi komponentlərdə debug məqsədli `console.log` çağırışları qalıb.
* **[AUD-LOW-06]** Tarix Formatlaşdırması: `toLocaleDateString('az-AZ')` və `toLocaleString('az-AZ')` fərqli fayllarda fərqli parametrlərlə çağırılır.
* **[AUD-LOW-07]** Responsive Cədvəl Sürüşməsi: Mobil cihazlarda bəzi cədvəllər horizontallıqda ekranı aşır.

---

## 5. Önceliklendirilmiş Yol Xəritəsi (Roadmap)

### Mərhələ A: Təcili Düzəlişlər və Təhlükəsizlik (Quick Wins)
1. **API İcazələrinin Düzəldilməsi**:
   * `PUT /api/organizations/[orgId]/theme` endpointində Super Admin məhdudiyyətini aradan qaldırmaq, təşkilat adminlərinə icazə vermək (`AUD-CRIT-02`).
   * `GET /api/themes` endpointini autentifikasiyadan keçmiş bütün istifadəçilərə açmaq (`AUD-CRIT-03`).
2. **Splash Screen Təhlükəsizliyi**:
   * Unsandboxed iframe-ə sərt `sandbox` məhdudiyyətləri qoymaq və ya təhlükəsiz şablon sisteminə keçirmək (`AUD-CRIT-01`).
3. **Qlobal Xəta Ekranları**:
   * `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/dashboard/error.tsx` və `src/app/admin/error.tsx` yaratmaq (`AUD-CRIT-05`).

### Mərhələ B: Faz 2 - Modul Ləğvi və "Tema Kitabxanası"
1. **Tema Redaktorunun Ləğvi**:
   * `/dashboard/theme` səhifəsini, `src/components/dashboard/theme-editor/` qovluğunu, STL parser və validator asılılıqlarını tam təmizləmək.
   * `navigation/config.ts` daxilindəki köhnə menyu elementini və testləri yeniləmək.
2. **Tema Kitabxanasının Qurulması**:
   * Mövcud `ThemeLibrary.tsx` bazasında müstəqil, müasir və sürətli "Tema Kitabxanası" modulu qurmaq.
   * Funksiyalar: Temaların vizual kartlarla siyahılanması, canlı önizləmə, bir kliklə aktivləşdirmə, temanın JSON formatında export/importu, fərdi temaların silinməsi.

### Mərhələ C: Memarlıq Yenidənqurması (Faz 3 Refactor)
1. **Modul Qeydiyyat Sistemi (Module Registry)**:
   * Yeni modul əlavə edərkən tək konfiqurasiya faylından route, menyu adı, ikon və icazələri avtomatik bağlayan mexanizm.
2. **Feature-Based Struktur**:
   * Monolit səhifələri (`menu`, `qr`, `employees`) `features/<modül>/` qovluqlarına bölmək (`components`, `hooks`, `api`, `types`).
3. **Ortaq UI Kitabxanası**:
   * `components/common/`: `DataTable`, `FormField`, `ConfirmDialog`, `PageHeader`, `Toast`.
4. **Mərkəzi API Katmanı və State**:
   * `lib/api/client.ts` ilə tipləşdirilmiş HTTP client qurmaq.
   * `localStorage` biznes vəziyyətlərini DB-yə köçürmək.

---

> [!IMPORTANT]
> **Faz 1 tamamlandı.** Kod dəyişikliyinə başlamazdan əvvəl bu hesabatın təsdiqlənməsi və Faz 2-yə keçid üçün istifadəçinin təsdiqi gözlənilir.

