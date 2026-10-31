# Sayt növləri və GitHub şablon idarəetməsi

Bu sənəd sayt yaradılması zamanı kateqoriya seçimini, şablon manifestini və
GitHub əsaslı şablon mənbəyini izah edir.

## 1. Axın

1. İstifadəçi `/dashboard/new-organization` səhifəsində 25 əsas kateqoriyadan birini seçir.
2. Yalnız seçilmiş kateqoriyanın alt kateqoriyaları göstərilir.
3. Seçim təsdiqlənir; uyğun şablonlar manifestdən tapılır və istəyə bağlı seçilir.
4. Mövcud yaratma prosesi (əsas məlumatlar və əlaqə) davam edir.
5. `POST /api/organizations` kateqoriya, alt kateqoriya və şablonu qəbul edir, şablonun
   temasını saytın qaralama və yayımlanmış tema konfiqurasiyasına yazır.
6. Sonradan `POST /api/templates/apply` ilə şablon yalnız qaralamaya yenidən tətbiq edilə bilər.

Köhnə (kateqoriyasız) saytlar üçün bütün yeni sahələr nullable-dir; onların
davranışı və standart `home/about/menu/contact` səhifələri dəyişmir.

## 2. Mərkəzləşdirilmiş konfiqurasiya

| Fayl | Məzmun |
| --- | --- |
| `src/config/site-categories.ts` | 25 kateqoriya və alt kateqoriyaların yeganə mənbəyi |
| `src/config/templates/manifest.json` | Şablon siyahısı, versiya, kateqoriya və GitHub yolu |
| `src/lib/templates/manifest.ts` | Manifest validasiyası və sorğular |
| `src/lib/templates/github.ts` | GitHub-dan endirmə, təhlükəsiz arxiv çıxarılması, manifest keşi |
| `src/lib/templates/installer.ts` | Şablonun tema kimi tətbiqi və müvəqqəti faylların silinməsi |
| `src/lib/site-pages.ts` | Sayt növünə uyğun standart səhifələr |

ID-lər sabitdir (`restoran-ve-qida-sayti`, `restoran` və s.). Görünən adlar
dəyişdirilə bilər, ID-lər dəyişdirilməməlidir, çünki verilənlər bazası və
manifest onlara istinad edir.

## 3. GitHub repository strukturu

Repository artıq yaradılıb: **`onlivecorp/website-templates`** (private). `main` branch-i
və `v1.0.0` tag-i mövcuddur; manifest və 15 şablon paketi içəridədir. Struktur belədir:

```text
website-templates/
├── manifest.json                 # istəyə bağlı: uzaq manifest (lokal manifesti əvəz edir)
├── README.md
└── templates/
    ├── restaurant-modern/
    │   ├── template.json         # mütləq: tema konfiqurasiyası
    │   ├── preview.png           # istəyə bağlı
    │   ├── pages/index.html
    │   └── assets/...
    ├── cafe-cozy/
    │   ├── template.json
    │   └── ...
    └── ...
```

### `template.json` nümunəsi

```json
{
  "id": "restaurant-modern",
  "version": "1.0.0",
  "theme": {
    "primaryColor": "#ffc665",
    "heroHeight": "85vh",
    "heroOverlay": 0.5,
    "isProTemplate": true
  }
}
```

`theme` yalnız məlum tema açarlarını və sadə skalyar dəyərləri qəbul edir.
HTML, `<script>`, `javascript:`, `data:` və icazəsiz URL dəyərləri atılır.

### Manifest nümunəsi

```json
{
  "schemaVersion": 1,
  "defaults": {
    "repository": "onlivecorp/website-templates",
    "ref": "v1.0.0",
    "manifestPath": "manifest.json"
  },
  "templates": [
    {
      "id": "restaurant-modern",
      "name": "Modern Restaurant",
      "category": "restoran-ve-qida-sayti",
      "subcategory": "restoran",
      "version": "1.0.0",
      "themePreset": "warmGourmetPro",
      "source": {
        "path": "templates/restaurant-modern",
        "ref": "v1.0.0"
      }
    }
  ]
}
```

- `themePreset` — GitHub əlçatmaz olduqda istifadə olunan daxili tema. Belə şablon
  GitHub konfiqurasiya edilməsə belə quraşdırıla bilər.
- `source.path` — repository daxilində şablon qovluğu.
- `source.ref` — tag və ya commit SHA. Qlobal `GITHUB_TEMPLATE_REF` bütün
  şablonları bir versiyaya pin edir.
- `source.repository` — yalnız fərqli repository lazım olduqda göstərilir; adətən
  `GITHUB_TEMPLATE_REPO` istifadə olunur.

Lokal manifest (`src/config/templates/manifest.json`) interfeys üçün əsas
mənbədir. `GITHUB_TEMPLATE_REPO` təyin edilibsə, sistem əvvəlcə repository-dəki
`manifest.json`-u oxumağa çalışır. Uzaq manifest əlçatmaz və ya etibarsız olsa,
lokal manifestə düşür və API cavabında xəbərdarlıq qaytarır.

## 4. Environment variables

Bütün dəyişənlər yalnız serverdə oxunur. `NEXT_PUBLIC_` prefiksi ilə
başlamamalıdır və frontend-ə heç vaxt göndərilmir.

| Dəyişən | Tələb | Təsvir |
| --- | --- | --- |
| `GITHUB_TEMPLATE_REPO` | İstəyə bağlı | `OWNER/REPO` formatında şablon repository-si |
| `GITHUB_TEMPLATE_REF` | İstəyə bağlı | Qlobal sabit versiya: tag və ya commit SHA (məs. `v1.0.0`) |
| `GITHUB_TEMPLATE_TOKEN` | Yalnız məxfi repo | GitHub PAT (fine-grained, `Contents: read`) |
| `GITHUB_TEMPLATE_MANIFEST` | İstəyə bağlı | Uzaq manifest yolu, standart `manifest.json` |

### Hostinger-də təyin edilməsi

1. hPanel → **Advanced → Environment variables** (və ya deployment panelində).
2. Yuxarıdakı adlarla dəyərləri əlavə edin.
3. `GITHUB_TEMPLATE_TOKEN` dəyərini yalnız burada saxlayın; GitHub-da, kodda,
   `.env` faylını commit etməklə və ya mesajda paylaşmayın.
4. Dəyişənləri əlavə etdikdən sonra tətbiqi yenidən deploy edin.

Lokal inkişaf üçün `.env` faylında eyni adlardan istifadə olunur.

## 5. Yükləmə, keş və xəta idarəetməsi

- Manifest 5 dəqiqə yaddaşda keşlənir; uğursuz cəhd 1 dəqiqə keşlənir ki, GitHub
  API limiti boş yerə xərclənməsin. Token varsa limit daha yüksəkdir.
- Şablon faylları yalnız istifadəçi şablon seçəndə endirilir. Bütün repository hər
  dəfə yüklənmir.
- Token varsa `api.github.com/repos/{repo}/tarball/{ref}`, yoxsa
  `codeload.github.com` istifadə olunur (public repo üçün API limiti xərclənmir).
- Endirmə 20 saniyə timeout, 30 MB arxiv, 60 MB açılmış arxiv, 3 MB fayl,
  20 MB ümumi həcm və 300 fayl limiti ilə məhdudlaşdırılır.
- GitHub 404/401/403/429/şəbəkə xətaları Azərbaycan dilində aydın mesajla qaytarılır.
- Şablon `themePreset`-ə malikdirsə, GitHub xətası sayt yaradılmasını dayandırmır:
  daxili tema tətbiq olunur və istifadəçiyə xəbərdarlıq göstərilir.
- Şablonun öz teması yoxdursa və GitHub əlçatmazdırsa, yaratma sorğusu xəta qaytarır.

## 6. Təhlükəsizlik yoxlamaları

- Arxivdə yalnız seçilmiş `source.path` altındakı fayllar qəbul edilir.
- Mütləq yollar, `..`, backslash, null bayt, simvolik/hard linklər və xüsusi
  fayllar rədd edilir.
- `.env*`, gizli fayllar, `.git`, `node_modules`, `__MACOSX` atlanır.
- Yalnız icazəli fayl uzantıları (json, html, css, js/ts, şəkil, şrift və s.) qəbul edilir.
- `template.json` zod ilə validasiya olunur; tema dəyərləri təmizlənir.
- Frontend yalnız `id`, `name`, `description`, `version`, `preview` və
  `installable` görür. Repository adı, yol və token API cavabına düşmür.
- `POST /api/templates/apply` autentifikasiya və üzvlük yoxlaması tələb edir;
  `EDITOR` rolu şablon tətbiq edə bilməz.

## 7. Hostinger disk istifadəsi

Şablonlar Hostinger diskində saxlanılmır:

1. Şablon faylları GitHub-da saxlanılır.
2. Tətbiq yalnız manifesti və tətbiq olunmuş temanı (JSON) verilənlər bazasında saxlayır.
3. Endirilən fayllar `os.tmpdir()` altında unikal müvəqqəti qovluğa açılır.
4. `finally` blokunda qovluq `rm(..., { recursive: true, force: true })` ilə silinir.
5. Saytın `public/uploads` qovluğuna və ya versiya qovluqlarına şablon faylı yazılmır.
6. İstifadəçinin yüklədiyi media və sayt məzmunu əvvəlki kimi DB + uploads
   mexanizmi ilə saxlanılır və avtomatik silinmir.

Yeni şablon versiyası mövcud saytları avtomatik dəyişmir: istifadəçi
`/dashboard/website` səhifəsində "Şablonu yenidən tətbiq et" düyməsini basmalı və
sonra saytı yayımlamalıdır.

## 8. Deployment yoxlama siyahısı

```bash
npm install
npx prisma generate
npm run db:push        # yeni nullable sahələri tətbiq edir
npm test
npm run build
```

- Repository hazırda **private**-dır: `GITHUB_TEMPLATE_TOKEN` mütləqdir, əks halda
  şablonlar daxili temaya düşür (sayt yaradılması davam edir, xəbərdarlıq göstərilir).
- Token `Contents: read` (fine-grained) icazəsi ilə yaradılmalıdır. Repository-ni
  ictimai etsəniz, token lazım deyil və API limiti də azalır.
- Şablon dəyişikliklərini tag ilə buraxın (`v1.0.0`), `main` branch-inə birbaşa
  istinad etməyin — beləliklə mövcud saytlar gözlənilmədən dəyişməz.
- `GITHUB_TEMPLATE_REF` ilə konkret commit SHA-ya pin edə bilərsiniz.
