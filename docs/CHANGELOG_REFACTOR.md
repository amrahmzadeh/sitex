# Refaktor və İyileştirme Jurnalı (Changelog Refactor)

Bu sənəd aparılmış audit və modernləşdirmə işləri çərçivəsində edilmiş dəyişiklikləri, silinən köhnəlmiş elementləri və qalan texniki borcları əks etdirir.

---

## 1. Həyata Keçirilmiş Dəyişikliklər (What Was Done)

### 1.1 Qlobal Xəta və Dayanıqlıq (Resilience & Error Handling)
* **Kök və Panel Səviyyəli 404 Ekranları**:
  * `src/app/not-found.tsx`: Qlobal 404 səhifəsi yaradıldı.
  * `src/app/dashboard/not-found.tsx`: Dashboard spesifik 404 səhifəsi yaradıldı.
  * `src/app/admin/not-found.tsx`: Super Admin spesifik 404 səhifəsi yaradıldı.
* **Kök və Panel Səviyyəli Xəta Ekranları (Error Boundaries)**:
  * `src/app/error.tsx`: Qlobal render xətalarını yaxalayan və bərpa düyməsi təqdim edən ekran quruldu.
  * `src/app/dashboard/error.tsx`: Dashboard paneli üçün xəta bərpa ekranı quruldu.
  * `src/app/admin/error.tsx`: Super Admin paneli üçün xəta bərpa ekranı quruldu.
  * `src/components/common/ErrorBoundary.tsx`: Reusable React Error Boundary komponenti yaradıldı və həm `dashboard/layout.tsx`, həm də `admin/layout.tsx` daxilinə inteqrasiya edildi.

### 1.2 Mərkəzləşdirilmiş Bildiriş Sistemi (Toast System)
* `src/contexts/ToastContext.tsx`:
  * Fərdi səhifələrdəki pərakəndə `const [toast, setToast] = useState('')` və `setTimeout` kodları ləğv edildi.
  * Qlobal `ToastProvider` və `useToast()` hook-u quruldu (`success`, `error`, `warning`, `info` dəstəyi ilə).
  * Dashboard və Super Admin layout-larına inteqrasiya olundu.

### 1.3 Mərkəzi HTTP Client
* `src/lib/api-client.ts`:
  * Vahid `apiClient.get`, `post`, `put`, `patch`, `delete` metodları yaradıldı.
  * Avtomatik JSON header əlavə edilməsi, FormData idarəsi, HTTP status yoxlanışı və `ApiError` formatlaşdırması təmin olundu.

### 1.4 Ortaq UI Komponent Kitabxanası (`src/components/common/`)
* `DataTable.tsx`: Tipli, axtarış/filtr uyğun, skeleton yükləməli və səhifələmə dəstəkli cədvəl komponenti.
* `PageHeader.tsx`: Vahid səhifə başlığı, təsvir, rəngli ikon və əməliyyat düymələri bloku.
* `ConfirmDialog.tsx`: Təhlükəsiz silmə və təsdiq modalı (açıq xəbərdarlıq və spinner dəstəyi ilə).
* `FormField.tsx`: Formalar üçün vahid etiket, ulduzlu məcburiyyət, validasiya xətası və ipucu sətiri.
* `LoadingState.tsx`: Skeleton və spinner yüklənmə vəziyyətləri.
* `EmptyState.tsx`: Boş cədvəl və siyahılar üçün standart vizual blok.

### 1.5 Modul Qeydiyyat Sistemi (Module Registry)
* `src/lib/module-registry/index.ts`:
  * Bütün panel modulları (22 əsas modul) tək mərkəzdə qeydiyyatdan keçirildi.
  * Route, naviqasiya menyusu, ikon, kateqoriya və əməkdaş icazələri vahid massivdə birləşdirildi.
  * Yeni modul əlavə etmək üçün tək bir qeydiyyat kifayətdir.

### 1.6 Təhlükəsizlik və İcazə Düzəlişləri
* **AUD-CRIT-01**: `src/components/themes/SplashScreen.tsx` daxilindəki `<iframe srcDoc={...} />` teqinə `sandbox="allow-scripts"` parametri əlavə edilərək XSS və cookie oğurluğu riski neytrallaşdırıldı.
* **AUD-CRIT-02**: `src/app/api/organizations/[orgId]/theme/route.ts` daxilindəki yalnız `SUPER_ADMIN` məhdudiyyəti aradan qaldırıldı; təşkilat adminlərinə və sahiblərinə öz temalarını tətbiq etmək hüququ verildi.
* **AUD-CRIT-03**: `src/app/api/themes/route.ts` endpointində `GET` sorğusu bütün autentifikasiyadan keçmiş istifadəçilərə açıldı (Yeni sayt yaratma zamanı 403 xətası aradan qaldırıldı).
* **Super Admin Səhifələri**: `/admin/audit`, `/admin/sites`, `/admin/users`, `/admin/settings` səhifələri yeni ortaq UI komponentləri və `apiClient` ilə refaktor edildi.

---

## 2. Silinən və Ləğv Edilən Resurslar (Removed Dead Code)

1. **Tema Redaktoru (Faz 2 çərçivəsində silindi)**:
   * `src/components/dashboard/theme-editor/` qovluğu və daxilindəki 10 fayl:
     - `LivePreviewEngine.tsx`
     - `STLCodeEditor.tsx`
     - `ThemeAssetsManager.tsx`
     - `ThemeCustomizerTab.tsx`
     - `ThemeManagementModal.tsx`
     - `ThemeSettingsPanel.tsx`
     - `ThemeVersionHistory.tsx`
     - `VisualThemeBuilder.tsx`
     - `index.ts`
     - `modules/RandevuCafeModules.tsx`
     - `types.ts`
   * `src/modules/stl/` qovluğu və daxilindəki 10 fayl:
     - `colorUtils.ts`, `compiler.ts`, `diagnostics.ts`, `index.ts`, `intellisense.ts`, `parser.ts`, `serializer.ts`, `tokenizer.ts`, `types.ts`, `validator.ts`.
   * STL Testləri: `tests/stl.test.ts`, `tests/stl-extended.test.ts`.
   * Ballast boş qovluqlar: `src/features/template-builder/` və `src/app/dashboard/template-builder/`.
   * **Cəmi azaldılan kod**: **10,029 sətir**.

2. **Əvəzinə yaradıldı**:
   * `src/app/dashboard/theme/page.tsx`: Müasir, sürətli və vizual "Tema Kitabxanası" modulu (önizləmə, aktivləşdirmə, JSON export/import, silmə).

---

## 3. Qalan Texniki Borc və Gələcək Tövsiyələr (Technical Debt)

1. **Dashboard Daxili Monolit Komponentlər**:
   * `src/app/dashboard/menu/page.tsx` (1600 sətir) və `src/app/dashboard/qr/page.tsx` (1250 sətir) hələ də böyükdür. Növbəti mərhələdə bu iki səhifə alt komponentlərə (`CategoryList`, `DishModal`, `HeroDishPicker`) parçalana bilər.
2. **Natamam (ComingSoon) Modullar**:
   * `/dashboard/media`, `/dashboard/analytics`, `/dashboard/billing` modulları üçün baza funksionallıq hazırlanmalıdır və ya müvəqqəti olaraq qeyri-aktiv nişanla göstərilməlidir.
3. **Məhsul və Menyu İcazələrinin `localStorage` Asılılığı**:
   * `src/modules/navigation/config.ts` daxilindəki `localStorage` yoxlamaları fallback kimi saxlanılıb. Bütün kirayəçilər üçün bu parametrlər tam olaraq Prisma `Organization` / `Website.pagesConfig` modelinə köçürülməlidir.

