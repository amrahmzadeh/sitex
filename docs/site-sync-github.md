# Saytların GitHub-da ehtiyat nüsxəsi (site → GitHub sync)

Hər saytın tam vəziyyəti (tema, səhifələr, menyu, metadata) ayrıca **private**
GitHub repository-sində saxlanılır. GitHub burada *ehtiyat nüsxə və versiya
tarixçəsi* rolunu oynayır — platformanın əsas mənbəyi yenə verilənlər bazasıdır.
Saytlar GitHub-dan işləmir; onların runtime-ı əvvəlki kimi Next.js tətbiqidir.

## 1. Arxitektura

```text
publish / yeni sayt / silmə
        │
        ├─ DB əməliyyatı (dərhal, istifadəçi cavabı)
        │
        └─ after() ──► SiteSyncJob (PENDING)
                            │
              processSyncQueue (2 paralel)
                            │
             ┌──────────────┴───────────────┐
             │ payload qurucusu + sanitizer │
             └──────────────┬───────────────┘
                            ▼
        GitHub Git Data API: blobs → tree → commit → ref
                            ▼
                TƏK commit (sayt başına 1 publish)
```

- **Publish bloklanmır.** GitHub əlçatmaz olsa da publish uğurlu sayılır;
  xəta yalnız job-un `lastError` sahəsində görünür.
- **Bir repository, hər sayt bir qovluq.** Sayt başına repository yaradılmır —
  GitHub-da limit və idarəetmə yükü artmasın.
- **Tək commit.** Bir sync-də bütün fayllar Git Data API ilə bir commit-ə
  yazılır; `PUT /contents` ilə fayl-fayl yazma yoxdur.
- **Boş repository istisnası.** Boş repo-da Git Data API (`/git/trees`,
  `/git/blobs`, `/git/commits`) `409 Git Repository is empty.` qaytarır. Ona göre
  ilk commit `PUT /contents/README.md` ilə yaradılır (branch də bununla yaranır);
  sonraki bütün yazılar yenə tək commit-li Git Data axını ilə gedir.
- **Tag yoxdur.** Minlərlə sayt üçün tag yaratmaq repository-ni şişirdərdi;
  tarixçə commit-lərlə izlənir.

### Qovluq strukturu

```text
sites/<siteId>/
├── site.json          # id, ad, slug, kateqoriya, şablon, açıq əlaqə məlumatı, SEO, sosial linklər, iş saatları
├── theme.json         # { published, draft } — allowlist-dən keçmiş tema
├── pages/<slug>.json  # hər səhifənin konfiqurasiyası (+ menyu səhifəsində məzmun)
├── content/menu.json  # yalnız menyu məlumatı varsa və menyu səhifəsi təyin olunmayıbsa
├── assets.json        # media fayllarının URL-i, metadata və fingerprint-i (binary YOX)
└── CHANGELOG.md       # avtomatik, hər sync bir sətir (son 50 sətir)
```

`pages/<slug>.json` faylları `Website.pagesConfig`-dən qurulur. Köhnə saytlarda bu
sahə JSON **mətni** kimi (bir və ya iki dəfə kodlanmış) saxlana bilər — hər iki
format oxunur, digər hallarda fayllar sadəcə yazılmır.

**Binary fayllar yazılmır.** Şəkillər/videolar `MediaAsset.data` sahəsində və
`/uploads` qovluğunda qalır; GitHub-da yalnız URL + ölçü + mime + fingerprint
saxlanılır. Ona görə disk istifadəsi artmır və repository şişmir.

### Commit mesajları

```text
site(<siteId>): publish v<N> by <userId>
site(<siteId>): soft-delete by <userId>
chore: initialize site sync repository
```

`N` = həmin sayt üçün uğurlu sync-lərin sayı + 1.

## 2. İdempotentlik

Hər job üçün faylların SHA-256 hash-i hesablanır (`CHANGELOG.md` daxil edilmir,
çünki hər dəfə dəyişir). Hash əvvəlki uğurlu job-un hash-i ilə eynidirsə **yeni
commit yaradılmır** — job `DONE` + `noChanges=true` kimi bağlanır. Publish-i
təkrar-təkrar basmaq repository-də səs-küy yaratmır.

## 3. Növbə, retry və limitlər

| Parametr | Dəyər |
|---|---|
| Paralel sync | 2 |
| Job cəhdi | 3 |
| Retry gecikməsi | ≥ 15 s (növbədə `updatedAt` ilə saxlanılır) |
| Tək fayl limiti | 1 MB |
| Ümumi sync limiti | 10 MB |
| Fayl sayı | 500 |
| Rate limit | `Retry-After` / `x-ratelimit-reset` hörmətlə qarşılanır |

Konflikt (`422`) olduqda son commit yenidən oxunur və 3 cəhdə qədər exponential
backoff (250 ms → 500 ms → 1 s + jitter) ilə təkrarlanır; blob-lar təkrar
yaradılmır.

## 4. Təhlükəsizlik

- **Token ayrıdır:** `GITHUB_SITES_TOKEN` (yazma) ≠ `GITHUB_TEMPLATE_TOKEN` (oxuma).
  Fine-grained PAT, yalnız bir repository, yalnız **Contents: Read and write**.
- **Repository private olmalıdır.** Publik olarsa sync avtomatik dayanır və
  job `FAILED` olur (cavabda aydın səbəb yazılır).
- **Data minimizasiyası:** payload qurucusu DB-dən yalnız sayt modellərini
  oxuyur — `User` cədvəli sorğuya düşmür. Sahib yalnız `ownerId` (cuid) kimi yazılır.
- **Denylist:** `sanitizer.ts` hər dəyəri yenidən yoxlayır; `passwordHash`,
  `token`, `secret`, `apikey`, `email`, `phone`, `ownerEmail`, `cardNumber`
  kimi açarlar (və `*Token`, `*Secret`, `*Password` şəkilçililəri) tamamilə atılır.
- **Açıq əlaqə məlumatı** `publicEmail` / `publicPhone` adları ilə saxlanılır —
  bunlar onsuz da dərc olunmuş saytda görünür.
- **Path təhlükəsizliyi:** `siteId` və slug yalnız `[a-z0-9-]`; `../`, mütləq yol,
  `\`, NUL və boş seqmentlər `UnsafeSyncPathError` ilə rədd olunur.
- **Token heç yerə sızmır:** nə API cavabında, nə logda, nə də `commitUrl`-dan
  başqa yerdə. İstifadəçi API-si repository adını belə qaytarmır (yalnız admin görür).
- GitHub-dan gələn məzmun bərpa zamanı **etibarsız** sayılır: tema allowlist-dən,
  slug-lar regex-dən keçir.

## 5. Environment variables

```env
SITE_GITHUB_SYNC_ENABLED=true
GITHUB_SITES_REPO="onlivecorp/website-sites"
GITHUB_SITES_BRANCH="main"
GITHUB_SITES_TOKEN="github_pat_..."
CRON_SECRET="uzun-təsadüfi-dəyər"
```

`.env.example`-da bu blok var; dəyərləri **yalnız** serverdə saxlayın.

### Token yaratma addımları

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. **Repository access:** *Only select repositories* → `website-sites`.
3. **Permissions → Repository permissions → Contents: Read and write**.
   Başqa icazə lazım deyil (metadata oxumaq üçün default `Metadata: Read` kifayətdir).
4. Token-i Hostinger → **hPanel → Environment variables** bölməsinə əlavə edin.
5. Tokeni frontend dəyişəninə (`NEXT_PUBLIC_*`), koda və ya chat-a yazmayın.

### Hostinger-də deploy

Sayt `site.onlive.az` Hostinger-in Node.js (Passenger) qurulumunda işləyir:

```text
hbuilds/current -> versions/<id>      # symlink, Passenger bunu oxuyur
hbuilds/versions/<id>/nodejs          # .next, node_modules, public, server.js, .env
hbuilds/config/.env                   # hPanel env dəyişənləri (runtime-a inject olunur)
```

Deploy skriptlə (`bash scripts/deploy-hostinger.sh`):

1. cari versiyanın hardlink surəti ilə **yeni versiya qovluğu** yaradır;
2. kodu göndərir (`tar` over SSH; `node_modules`, `.next`, `.env`, `public/uploads` göndərilmir);
3. serverdə `npm ci` → `prisma generate` → `db push` → `next build` icra edir;
4. dev paketləri silir (`npm ci --omit=dev`), Prisma client-i yenidən yaradır;
5. `current` symlink-ini yeni versiyaya keçirir və `tmp/restart.txt` ilə Passenger-i yenidən başladır;
6. `https://site.onlive.az` **200** qaytarmasa, symlink-i əvvəlki versiyaya qaytarır.

Digər rejimlər: `--check` (SSH + node/npm), `--status` (canlı versiya və son build).
Kredensialar `.deploy/hostinger.env` faylındadır (git-ə daxil deyil, ed25519 açarı ilə).

**Vacib:** production env `hbuilds/config/.env`-də saxlanılır, lakin Hostinger onu
process-ə mütləq ötürmür — ona görə sync dəyişənləri həm `config/.env`-ə, həm də
canlı qovluqdaki `current/nodejs/.env` faylına yazılır (Next.js `.env`-i özü yükləyir).
Deploy skripti bu fayl yoxdursa `config/.env`-dən kopyalayır. hPanel-dən env dəyişəndə
**hər iki yeri** yeniləyin.

**Cron** (əlavə təminat, məcburi deyil):

```bash
curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://<domain>/api/cron/site-sync?limit=20
```

Cron yalnız növbədə qalmış işləri emal edir; normal halda publish zamanı `after()`
ilə avtomatik emal olunur.

## 6. Feature flag

`SITE_GITHUB_SYNC_ENABLED=false` olduqda:

- heç bir job yaradılmır, heç bir GitHub sorğusu getmir;
- publish, sayt yaratma və silmə axını **tamamilə əvvəlki kimi** işləyir;
- admin panelində "Söndürülüb" göstərilir.

## 7. Admin paneli

**Admin → Saytlar** cədvəlində `GitHub` sütunu:

- status nişanı: `Sinxron` / `Növbədə` / `İşləyir` / `Xəta` / `Yoxdur`;
- nişana klik → detallar: son cəhd, son uğurlu vaxt, commit linki (GitHub),
  repository, xəta mətni və **"İndi sinxronlaşdır"** düyməsi.

İstifadəçi tərəfi: `GET/POST /api/organizations/<orgId>/sync` — status və manual
sync (dəqiqədə 1 dəfə; `429` + `Retry-After`).

## 8. Toplu doldurma (backfill)

Mövcud saytlar üçün ilk dəfə:

```bash
npm run site-sync:resync -- --dry-run          # yalnız göstər
npm run site-sync:resync -- --batch=50          # 50-50 emal et
npm run site-sync:resync -- --from=100 --batch=50
```

Skript resumable-dır, `--from` ilə davam edir, hər partiyadan sonra nəticəni çap edir.
`SIGINT` (Ctrl+C) cari partiyanı bitirib dayanır və davam əmrini göstərir.

## 9. Bərpa (restore)

```bash
# 1) Dry-run — heç nə yazmır
npm run site-sync:restore -- <siteId>

# 2) Müəyyən commit-dən
npm run site-sync:restore -- <siteId> <commitSha>

# 3) Tətbiq
npm run site-sync:restore -- <siteId> --apply

# 4) Sayt DB-də tamamilə yoxdursa (sahib lazımdır)
npm run site-sync:restore -- <siteId> --apply --owner=<userId>

# 5) GitHub-da soft-delete işarəli saytı bərpa etmək
npx tsx scripts/restore-site-from-github.ts <siteId> --apply --force
```

Bərpa olunanlar: sayt sahələri, `publishedTheme`/`draftTheme`, səhifələr, menyu
kateqoriyaları və məhsulları (şəkil sıraları daxil). **Media bərpa olunmur** —
binary fayllar GitHub-da saxlanmır.

## 10. Silinmə

Sayt silinəndə GitHub-dakı fayllar **silinmir**. `site.json`-a `deletedAt`
yazılır və commit edilir (`soft-delete`). Real silmə yalnız repo-dan əl ilə və ya
gələcək admin əməliyyatı ilə mümkündür — bu, səhvən silinmiş saytların bərpasını
təmin edir.

## 11. Problemlərin həlli

| Simptom | Səbəb / həll |
|---|---|
| `SITE_GITHUB_SYNC_ENABLED` söndürülüb | Flag-ı `true` edin və tətbiqi yenidən başladın. |
| `GITHUB_SITES_TOKEN təyin edilməyib` | Token yoxdur; fine-grained PAT yaradın. |
| `GitHub yazma icazəsi yoxdur (403)` | Token-də `Contents: Read and write` yoxdur və ya repo seçilməyib. |
| `GITHUB_SITES_REPO publikdir` | Repository-ni private edin; sync avtomatik dayandı. |
| `GitHub API limiti aşıldı` | Job `PENDING`-ə qayıdır, `Retry-After` gözlənilir. |
| Job `FAILED`, `noChanges` gözlənilirdi | Payload həqiqətən dəyişib (məs. `updatedAt`), yoxsa tema sanitizer-i fərqli işləyib — `contentHash`-ə baxın. |
| Manual sync `429` | Dəqiqədə 1 dəfə limiti; `Retry-After` saniyələrlə göstərilir. |
| `sayt üçün heç bir fayl tapılmadı` | Sayt heç vaxt sync olunmayıb → əvvəlcə `site-sync:resync`. |
| `GitHub ref-i dəyişdi (konflikt)` ilk sync-də | Boş repo-da Git Data API 409 verir. Kod indi ilk commit-i Contents API ilə atır — köhnə versiya ilə işləyirdinizsə yeniləyin və job-u yenidən icra edin. |
| `pages/` qovluğu repoda yoxdur | `pagesConfig` boşdur və ya gözlənilməz formatdadır; saytın səhifə konfiqurasiyasını yoxlayın. |

## 12. Məhdudiyyətlər

- Media faylları (binary) ehtiyat nüsxəyə düşmür — yalnız metadata.
- `siteId`/`slug` dəyişdirilmir; slug dəyişsə də qovluq adı `siteId`-dir.
- Repo publik olarsa sync dayanır (şüurlu qərar: sayt məlumatı public olmamalıdır).
- Bərpa `SiteSyncJob` tarixçəsini bərpa etmir; yeni sync yeni `v<N>` sayır.
