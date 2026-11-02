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
- İstifadəçi qeydi ilə fərdi versiya yaratma (məs: *"Başlıq rəngləri dəyişdirildi"*).
- Hər versiyanın STL koduna və parametrlərinə baxış.
- `Geri Yüklə`: İstənilən əvvəlki versiyaya dərhal qayıtma imkanı.

---

### 7. İdxal və İxrac Sistemi (`ImportExportModal`)
- **İxrac (Export):**
  - `.stl` mənbə kodu faylı kimi endirmə.
  - `.sitex-theme.json` tam şablon paketi kimi endirmə.
  - Panoya kopyalama.
- **İdxal (Import):**
  - STL kodu və ya JSON paketi fayldan yükləmə.
  - Mətni yapışdırıb sintaksis və struktur təhlükəsizlik testindən keçirmə.
  - Təsdiq edilərək redaktora tətbiq olunma.

---

## 3. SiteX Theme Language (STL) Sintaksis Spesifikasiyası

STL sadə, təmiz və JSON ilə CSS-in üstünlüklərini birləşdirən deklarativ dildir.

### Nümunə STL Faylı:

```stl
theme "MyRestaurantTheme" {
  meta {
    name: "My Restaurant Theme"
    version: "1.0.0"
    author: "SiteX User"
    description: "Premium lüks restoran teması"
  }

  colors {
    primary: "#00D37D"
    secondary: "#1A1A2E"
    accent: "#D4A574"
    background: "#0F1115"
    surface: "#181B20"
    text: "#F5F5F7"
  }

  typography {
    heading: "Outfit"
    body: "Inter"
    baseSize: "16px"
  }

  layout {
    containerWidth: "1200px"
    borderRadius: "12px"
    spacing: "16px"
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

    header {
      style: "glass"
    }

    footer {
      style: "dark"
    }
  }
}
```

### STL Texniki Xüsusiyyətləri:
1. **Dəyişənlər:** `colors.primary`, `typography.heading`, `layout.borderRadius` kimi daxili dəyişənlər birbaşa istinad edilə bilir.
2. **Varislik (Inheritance):** `theme "ChildTheme" extends "BaseTheme" { ... }` vasitəsilə ana temanın xüsusiyyətləri miras alınır və üzərindən yazılır (override).
3. **Təhlükəsizlik:** Parser heç bir halda `eval` və ya `Function` icra etmir. Yalnız AST əsaslı təhlükəsiz konvertasiya aparılır. `javascript:`, `<script>` və təhlükəli URL-lər bloklanır.

---

## 4. Fayl Strukturu

```
src/modules/
├── stl/
│   ├── types.ts          # AST, Token və Diaqnostika tipləri
│   ├── tokenizer.ts      # Leksik analizator
│   ├── parser.ts         # Rekursiv AST parser
│   ├── validator.ts      # Təhlükəsizlik və sintaksis yoxlayıcı
│   ├── compiler.ts       # AST -> CSS Variables & ThemeDefinition
│   ├── serializer.ts     # ThemeDefinition / Config -> STL mətni
│   ├── intellisense.ts   # Avtotamamlama lüğəti və snippetlər
│   └── index.ts          # STL mərkəzi eksport
└── builder/
    ├── types.ts          # Builder, cihaz və token tipləri
    ├── serializer.ts     # JSON & STL serializer/deserializer
    ├── store/
    │   └── builderStore.ts # Birləşdirilmiş reaktiv state
    ├── components/
    │   ├── BuilderEditor.tsx       # Baş idarəetmə karkası
    │   ├── TopBar.tsx              # Rejim naviqasiyası və əməliyyatlar
    │   ├── VisualThemeBuilder.tsx  # No-Code vizual panel
    │   ├── STLEditor.tsx           # STL kod mühiti və konsol
    │   ├── LivePreviewEngine.tsx   # Canlı responsive nümayiş
    │   ├── ThemeManager.tsx        # Temaların idarəsi və aktivləşdirmə
    │   ├── AssetsManager.tsx       # Media və şəkil aktivləri
    │   ├── VersionHistory.tsx      # Versiyalar və snapshot bərpası
    │   └── ImportExportModal.tsx   # İdxal/İxrac pəncərəsi
    └── index.ts
```

---

## 5. Testlər və Keyfiyyət Təminatı

- Bütün STL komponentləri `tests/stl.test.ts` daxilində test olunur:
  - Tokenizasiya testi
  - AST Parsing testi
  - Dəyişən əvəzetməsi və CSS generasiyası testi
  - Serializer və Re-parsing testi
  - ThemeDefinition çevrilmə testi
- Testlərin icrası:
  ```bash
  npm test
  ```
  *(Cəmi 43 test, 100% keçir).*
