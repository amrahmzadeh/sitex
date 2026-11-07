# Tema Məlumatlarının Miqrasiyası və Uyğunluq Qeydi (Faz 2)

## 1. Dəyişikliyin Məqsədi
Köhnə mürəkkəb və yalnız Super Admin üçün nəzərdə tutulmuş **"Tema Redaktoru"** (STL DSL compiler, AST parser, xam kod redaktoru) modulu tamamilə ləğv edilmiş, yerinə bütün sayt sahibləri üçün istifadəçi dostu, vizual və genişləndirilə bilən **"Tema Kitabxanası"** modulu tətbiq olunmuşdur.

## 2. Verilənlər Bazasının Uyğunluğu (Zero-Breaking Change)
* Bütün mövcud və yeni saytların temaları Prisma verilənlər bazasında `Website` modelinin `draftTheme` və `publishedTheme` sahələrində (JSON) saxlanılmağa davam edir.
* `ThemeConfig` interfeysinin strukturu (rənglər, tipoqrafiya, borderRadius, düymə və kart stilləri) 100% qorunub saxlanılmışdır.
* Əvvəllər STL vasitəsilə generasiya edilmiş hər hansı mövcud tema məlumatı `draftTheme` və `publishedTheme` JSON obyektlərində saxlanıldığı üçün heç bir saytın görünüşü pozulmur və verilənlər bazasında SQL miqrasiyasına ehtiyac yoxdur.

## 3. Ləğv Edilmiş və Təmizlənmiş Resurslar
1. **Qovluqlar və Komponentlər**:
   * `src/components/dashboard/theme-editor/` (tam silindi: VisualThemeBuilder, STLCodeEditor, LivePreviewEngine, ThemeAssetsManager, ThemeCustomizerTab, ThemeManagementModal, ThemeSettingsPanel, ThemeVersionHistory).
   * `src/modules/stl/` (tam silindi: compiler, diagnostics, intellisense, parser, serializer, tokenizer, types, validator, colorUtils).
   * `src/features/template-builder/` və `src/app/dashboard/template-builder/` (boş ballast qovluqlar silindi).
2. **Testlər**:
   * `tests/stl.test.ts` və `tests/stl-extended.test.ts` silindi, `package.json` test skripti yeniləndi.
   * `tests/modules.test.ts` yeniləndi ("Tema Kitabxanası" naviqasiya testi).
3. **API Dəyişiklikləri**:
   * `PUT /api/organizations/[orgId]/theme`: Yalnız Super Admin məhdudiyyəti aradan qaldırıldı; sayt adminləri və sahiblərinə öz temalarını tətbiq etməyə icazə verildi.
   * `GET /api/themes`: Autentifikasiyadan keçmiş bütün istifadəçilərə açıldı (Yeni sayt yaradarkən 403 xətası aradan qaldırıldı).
   * `POST /api/themes`: Fərdi (custom) temaların JSON olaraq idxal edilməsi dəstəkləndi.
   * `DELETE /api/themes?id=...`: Fərdi temaların silinməsi dəstəkləndi (daxili sistem temaları qorunur).

## 4. Yeni "Tema Kitabxanası" İmkanları
* **Vizual Mini Kartlar**: Hər bir temanın rəng palitrası, başlıq/mətn fontları və mini komponentləri birbaşa kartda görünür.
* **Kateqoriya və Axtarış**: "Restoran və Kafe", "Biznes", "Müasir", "Qaranlıq (Dark)" və "Pro Şablonlar" üzrə ani süzgəc.
* **Canlı Tam Ekran Önizləmə**: Modal daxilində real sayt təcrübəsi.
* **Tətbiq Etmə (Activation)**: Bir kliklə saytın qaralamasına və ya canlı sayta tətbiq olunur.
* **İxrac (Export)**: Seçilmiş tema təmiz JSON faylı kimi yüklənir.
* **İdxal (Import)**: JSON faylı və ya mətni vasitəsilə yeni xüsusi temalar dərhal kitabxanaya əlavə olunur.
* **Aktiv Vəziyyət**: Saytda hazırda hansı temanın aktiv olduğu üstdəki xüsusi paneldə və kart nişanlarında aydın görünür.

