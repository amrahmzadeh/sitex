# SiteX Professional Theme Editor & SiteX Theme Language (STL) Sənədləşməsi

## 1. Ümumi Baxış

SiteX Professional Theme Editor platformanın veb sayt dizaynı və fərdiləşdirmə sistemidir. Wix Studio, Webflow və Framer səviyyəsində qurulmuş həm vizual (No-Code), həm də kod (SiteX Theme Language - STL) əsaslı iki istiqamətli iş mühitini təmin edir.

Mərkəzi giriş ünvanı:
- URL: `/dashboard/builder` (və `/dashboard/theme` üzərindən birbaşa keçid düyməsi)
- Menyu: Sidebar -> **Tema Redaktoru**

---

## 2. Əsas Modullar və Arayüz Strukturu

TopBar vasitəsilə 6 əsas rejim arasında keçid təmin olunur:

### 1. Vizual Redaktor (`VisualThemeBuilder`)
Kodu əllə yazmadan tam interaktiv qrafik dizayn imkanı.
- **Qlobal Dizayn Parametrləri:**
  - *Rənglər:* Primary, Secondary, Accent, Background, Surface (kart/səth), Text (əsas mətn). Hər rəng üçün canlı rəng seçici və Hex daxiletmə sahəsi.
  - *Tipoqrafiya:* Başlıq şrifti (Heading), Mətn şrifti (Body), Baza ölçü slayderi (12px - 20px). Inter, Outfit, Playfair Display, Poppins, Merriweather və s. dəstəyi.
  - *Forma və Künc Yuvarlaqlığı:* 0px - 24px künc radiusu slayderi.
  - *Konteyner Eni:* Kompakt (1024px), Standart (1200px), Geniş (1320px), Tam Ekran (100%).
- **Tərtibat Qurucusu (Layout Builder):**
  - *Header Növləri:* Şəffaf (Transparent), Şüşə (Glass / Backdrop blur), Bütöv (Solid), Yapışqan (Sticky).
  - *Footer Strukturu:* Qaranlıq (Dark), Açıq (Light), Vurğu (Accent), Minimal.
  - *Boşluqlar (Spacing):* Seksiyalararası 8px - 32px dinamik aralıqlar.
- **Komponent Stilləri (Component Styling):**
  - *Düymələr (Buttons):* Solid, Outline, Ghost, Soft, Pill; dinamik radius tənzimlənməsi.
  - *Kartlar (Cards):* Elevated (kölgəli), Flat (düz), Bordered (sərhədli); daxili dolğu (padding) və radius.
  - *Form və Daxiletmə (Inputs):* Solid, Subtle, Pill haşiyələri.
  - *Nişanlar (Badges):* Dinamik radius və vurğu rəngləri.
- **Bölmələr (Sections & Canvas Nodes):**
  - Mövcud bölmələrin iyerarxik siyahısı.
  - Seksiyaların yerini dəyişmə (Yuxarı / Aşağı).
  - Bölmənin kopyasını çıxarma (Duplicate).
  - Bölməni silmə (Delete).
  - `+ Bölmə Əlavə Et` modalı: Navbar, Hero, Mətn, Şəkil, Düymə, Menyu Siyahısı, Xüsusiyyətlər, Rəylər, Əlaqə Forması, Xəritə, Qalereya və s.

---

### 2. Kod Redaktoru (`STLEditor`)
Platformanın özünəməxsus **SiteX Theme Language (STL)** dilli peşəkar mühit.
- **Fayl Naviqatoru (Theme File Explorer):**
  - `main.stl` – Ana tema bəyannaməsi və metadata.
  - `colors.stl` – Rəng palitraları və dəyişənlər.
  - `typography.stl` – Şrift ailələri və ölçülər.
  - `layout.stl` – Konteyner, boşluq və künc qaydaları.
  - `components.stl` – Fərdi komponent stilləri.
- **Sintaksis Vurğulanması və Xəta Yoxlanışı:**
  - Real-vaxt AST analizi və leksik yoxlama.
  - Dəqiq sətir və sütun göstəriciləri ilə Gutter indikatorları.
  - Aşağı Status & Diagnostics Konsolu (Xətaların ətraflı siyahısı).
- **Axtar və Dəyişdir (Search & Replace):**
  - Koddakı açar və dəyərləri bir toxunuşla axtarma və toplu əvəzetmə.
- **Avtotamamlama (IntelliSense):**
  - `Ctrl + Space` və ya yazma zamanı açılan kontekstual təkliflər paneli.
  - Açar sözlər (`theme`, `meta`, `colors`, `typography`, `layout`, `components`).
  - Dəyişən təklifləri (`colors.primary`, `colors.secondary`, `layout.borderRadius`).
  - Hazır snippetlər (Düymə, kart, rəng blokları).
- **Formatla (Beautify):**
  - Kodu avtomatik olaraq standart STL indentasiyasına gətirən mühərrik.
- **İkitərəfli Sinxronizasiya (Bidirectional Sync):**
  - Kodda edilən dəyişiklik avtomatik Vizual Builder-ə və canlı baxışa ötürülür.
  - Vizual Builder-də dəyişən rəng/şrift avtomatik STL kodunda yenilənir.

---

### 3. Canlı Önizləmə Mühərriki (`LivePreviewEngine`)
- **Dinamik Ekran Rejimləri (Responsive Viewports):**
  - Desktop (100% en)
  - Planşet (768px cihaz çərçivəsi)
  - Mobil (375px smartfon çərçivəsi)
- **Səhifə Növü Seçimi:**
  - *Ana Səhifə:* Hero banner, şüarlar, CTA düymələri, üstünlüklər kartları.
  - *Menyu & Məhsullar:* Real yemək/məhsul kartları, qiymətlər, təsvirlər, sifariş düymələri.
  - *Dizayn Sistemi (Showcase):* Bütün düymə formaları (Primary, Outline, Secondary, Accent), form elementləri, daxiletmə sahələri, status nişanları.
  - *Əlaqə & Rezervasiya:* İnteraktiv forma, seçim sahələri, təsdiq düyməsi.
- **Yadda Saxlanılmamış Dəyişikliklər İndikatoru:**
  - Canlı rejimdə istifadəçini xəbərdar edən status vizualı.

---

### 4. Tema İdarəetmə Mərkəzi (`ThemeManager`)
- **Bütün Temaların Siyahısı:**
  - Rəsmi hazır şablonlar (Elegant, Modern, Classic, Warm Gourmet Pro).
  - İstifadəçinin yaratdığı fərdi temalar.
- **Əməliyyatlar:**
  - *Yeni Tema Yarat:* Sıfırdan və ya mövcud şablonu baza götürərək unikal tema təyini.
  - *Aktivləşdir:* Seçilmiş temanı cari veb sayta tətbiq edir (`/api/organizations/[orgId]/theme` vasitəsilə).
  - *Kopyasını Çıxar (Duplicate):* Bir kliklə nüsxə hazırlama.
  - *Düzəlt / STL:* Birbaşa Vizual və ya Kod redaktoruna yönləndirmə.

---

### 5. Aktivlər və Media İdarəedicisi (`AssetsManager`)
- Şəkil, loqo, banner və qrafiklərin mərkəzi idarəsi.
- Şəkilləri kompüterdən yükləmə (`/api/organizations/[orgId]/upload`).
- Xarici URL keçidi ilə aktiv əlavə etmə.
- Tək kliklə keçidi panoya kopyalama (`Copy URL`).

---

### 6. Versiya Tarixçəsi və Bərpa (`VersionHistory`)
- Hər yadda saxlama zamanı avtomatik snapshot yaradılması.
- İstifadəçi qeydi və etiket ilə versiya yaratma (məs: `[Stabil]`, `[Buraxılış]`, `[Qaralama]`).
- İki versiya arasında **müqayisəli line-by-line Diff** baxışı (əlavə olunan və silinən sətirlər).
- Snapshot təmizlənməsi (Son 10 versiyanı saxla).
- `Geri Yüklə`: İstənilən əvvəlki versiyaya dərhal qayıtma imkanı.

---

### 7. İdxal və İxrac Sistemi (`ImportExportModal`)
- **İxrac (Export):**
  - `.stl` mənbə kodu faylı kimi endirmə.
  - `.sitex-theme.json` tam şablon paketi kimi endirmə (Schema v2).
  - `tailwind.theme.config.js` Tailwind konfiqurasiya faylı kimi endirmə.
  - Panoya kopyalama.
- **İdxal (Import):**
  - STL kodu və ya JSON paketi fayldan yükləmə (Maksimum 2MB limit).
  - SchemaVersion yoxlanışı və köhnə versiyalardan avtomatik miqrasiya.
  - Öncədən baxış xülasəsi (Tema adı, versiya, rənglərin və blokların sayı).
  - Təsdiq edilərək redaktora tətbiq olunma.

---

## 3. SiteX Theme Language (STL v2.0) Sintaksis Spesifikasiyası

STL sadə, təmiz və JSON ilə CSS-in üstünlüklərini birləşdirən deklarativ dildir.

### Nümunə Qabaqcıl STL Faylı:

```stl
// Əsas tema şərhi
import "colors.stl"

theme "MyRestaurantTheme" extends "Elegant" {
  meta {
    name: "My Restaurant Theme"
    version: "2.0.0"
    author: "SiteX User"
    description: "Premium lüks restoran teması"
  }

  tokens {
    spacing {
      sm: "8px"
      md: "16px"
      lg: "24px"
    }
    radius {
      sm: "4px"
      md: "8px"
      lg: "16px"
    }
  }

  colors {
    primary: "#00D37D"
    secondary: "#1A1A2E"
    accent: "#D4A574"
    background: "#0F1115"
    surface: "#181B20"
    text: "#F5F5F7"
    primaryLighter: lighten(colors.primary, 15%)
    primaryFaded: alpha(colors.primary, 0.5)
  }

  modes {
    dark {
      colors {
        background: "#0D0E11"
        surface: "#181B20"
        text: "#F5F5F7"
      }
    }
  }

  responsive {
    mobile {
      layout {
        containerWidth: "100%"
        spacing: "12px"
      }
    }
  }

  typography {
    heading: "Outfit"
    body: "Inter"
    baseSize: "16px"
  }

  layout {
    containerWidth: "1200px"
    borderRadius: {tokens.radius.md}
    spacing: tokens.spacing.md
  }

  components {
    button {
      background: colors.primary
      color: "#000000"
      radius: "8px"
      style: "solid"
    }

    card {
      background: colors.surface
      radius: "12px"
      style: "elevated"
    }
  }
}
```

### STL Texniki Xüsusiyyətləri:
1. **Dizayn Tokenləri (`tokens { }`):** Spacing, radius, shadow və font şkalaları təyin edilir və `{tokens.spacing.md}` şəklində istinad olunur.
2. **Rejimlər (`modes { dark { } }`):** `prefers-color-scheme` və `[data-theme="dark"]` CSS dəyişənləri avtomatik generasiya olunur.
3. **Responsivlik (`responsive { mobile { } }`):** Breakpoint-lərə görə media query override-ları təmin edilir.
4. **Təhlükəsiz Rəng Funksiyaları:** `lighten()`, `darken()`, `alpha()`, `mix()` whitelist əsasında təhlükəsiz riyazi hesablamalarla işləyir.
5. **Varislik və Çoxfayllı Import:** `extends` və `import` vasitəsilə dövri asılılıq aşkarlanması ilə modullu iş axını.
6. **WCAG Kontrast Auditi:** Mətn/fon və düymə/fon cütləri üçün WCAG 2.2 AA / AAA yoxlaması aparılır.
7. **Diaqnostika və Levenshtein Fuzzy Matching:** `STL1001`-`STL1008` kodları ilə "Bunu demək istəyirdiniz: ...?" təklifləri və Error Recovery.
8. **Təhlükəsizlik:** `javascript:`, `<script>`, `expression()`, `url(data:...)` qəti bloklanır; `eval` və `Function` istifadə olunmur.

---

## 4. Fayl Strukturu

```
src/modules/
├── stl/
│   ├── types.ts          # AST, Token və Diaqnostika tipləri
│   ├── tokenizer.ts      # Leksik analizator və koordinat izləmə
│   ├── parser.ts         # Rekursiv AST parser və Error Recovery
│   ├── validator.ts      # WCAG kontrast və təhlükəsizlik auditləri
│   ├── compiler.ts       # AST -> CSS, Tailwind Config və ThemeDefinition
│   ├── serializer.ts     # İdempotent və şərhləri qoruyan Formatter
│   ├── intellisense.ts   # Kontekstual avtotamamlama lüğəti
│   ├── colorUtils.ts     # Riyazi rəng funksiyaları və WCAG lüminans
│   ├── diagnostics.ts    # Diaqnostika kodları və Levenshtein fuzzy matching
│   └── index.ts          # STL mərkəzi eksport
```

---

## 5. Testlər və Keyfiyyət Təminatı

- Bütün STL və Builder testləri `tests/stl.test.ts` və `tests/stl-extended.test.ts` vasitəsilə icra edilir:
  - Tokenizasiya və AST Parsing
  - Dizayn tokenləri və token istinadları
  - Light/Dark rejimlər və media query generasiyası
  - Responsiv breakpoint override-ları
  - Rəng funksiyaları (`lighten`, `darken`, `alpha`, `mix`)
  - Parser Error Recovery və Levenshtein fuzzy təklifləri
  - WCAG Kontrast yoxlanışı
  - XSS və təhlükəsizlik filtrləri
  - Dövri asılılıq və çoxfayllı import
  - İdempotent Formatter və şərhlərin qorunması
  - Fuzz & Resilience testi (Parser qəzasızlığı)
- Testlərin icrası:
  ```bash
  npm test
  ```
  *(54 test, 100% keçir).*

