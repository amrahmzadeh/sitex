# SiteX Admin və Dashboard Paneli — Ətraflı Funksional Sənədləşdirmə

SiteX layihəsi iki əsas idarəetmə panelindən ibarətdir:
1. **Super Admin Paneli (`/admin`)**: Bütün platforma, istifadəçilər, təşkilatlar/saytlar, audit loqları və qlobal sistem sazlamaları üzrə idarəetmə.
2. **Müştəri / Tenant Dashboard Paneli (`/dashboard`)**: Sayt sahibləri, menecerlər və əməkdaşlar üçün müəssisə və veb-saytın fərdi idarəetmə mərkəzi.

---

## BÖLMƏ 1: SUPER ADMIN PANELİ (`/admin`)

Giriş yalnız `SUPER_ADMIN` roluna malik istifadəçilər üçün açıqdır (Digər rollar birbaşa `/dashboard`-a yönləndirilir).

### 1. Əsas İcmal Paneli (`/admin`)
- **Məqsəd**: Platformanın ümumi statistikası və dərhal nəzarət.
- **Funksiyaları**:
  - **Statistika Kartları**: Ümumi istifadəçilər, aktiv saytlar/təşkilatlar, yayınlanmış saytlar, menyu elementləri və sistem audit hadisələrinin ümumi sayı.
  - **Audit Hadisələri Xülasəsi**: Son baş vermiş 5 sistem əməliyyatının canlı siyahısı.
  - **Sürətli Keçidlər**: Saytlar, İstifadəçilər, Tənzimləmələr və Audit səhifələrinə 1 kliklə keçid.

### 2. Saytların İdarə Edilməsi (`/admin/sites`)
- **Məqsəd**: Platformada qeydiyyatdan keçmiş bütün müəssisə və saytların mərkəzi idarəsi.
- **Funksiyaları**:
  - **Cədvəl və Baxış**: Ad, URL slug, Kateqoriya/Alt kateqoriya, Sayt sahibi (User), Yayın statusu (Canlı / Qaralama), Menyu sayı, Yaradılma tarixi.
  - **Axtarış və Filtrləmə**: Sayt adına, slug-a və ya kateqoriyaya görə axtarış.
  - **Canlı Sayta Keçid**: `/site/[slug]` linkinə birbaşa baxış imkanı.
  - **GitHub / Hostinger Repozitoriya Sinxronizasiyası (Sync)**:
    - Şablon fayllarını repozitoriya ilə məcburi sinxronizasiya etmə.
    - Sinxronizasiya xətaları və status göstəricisi.
  - **Sayt Tənzimləmələrinin Yenilənməsi**: Kateqoriya, slug, ad və status dəyişdirmə.
  - **Təhlükəsiz Silmə (`ConfirmDialog`)**: Saytı və ona bağlı bütün menyu, media və əməkdaş məlumatlarını silmə.

### 3. İstifadəçilərin İdarə Edilməsi (`/admin/users`)
- **Məqsəd**: Bütün qeydiyyatdan keçmiş istifadəçilərin autentifikasiya və səlahiyyət idarəsi.
- **Funksiyaları**:
  - **Siyahı və Məlumatlar**: Ad, E-poçt, Rol (`USER`, `ADMIN`, `SUPER_ADMIN`, `EMPLOYEE`), Yaradılma tarixi, Təşkilat sayı.
  - **Axtarış və Rol Filtri**: Ada və ya e-poçta görə canlı axtarış, rollar üzrə filtrasiya.
  - **Yeni İstifadəçi Əlavə Edilməsi (`Modal`)**: E-poçt, şifrə, ad və rol seçimi ilə istifadəçi açmaq.
  - **Rol Dəyişdirilməsi**: İstifadəçini `SUPER_ADMIN` etmək və ya səlahiyyətini azaltmaq.
  - **Şifrə Sıfırlama**: İstifadəçi üçün yeni şifrə təyin etmə.
  - **İstifadəçini Silmə**: Sistemdən çıxarma və sessiyasını dayandırma.

### 4. Sistem Audit Loqları (`/admin/audit`)
- **Məqsəd**: Təhlükəsizlik, izləmə və kritik əməliyyatların qeydiyyatı.
- **Funksiyaları**:
  - **Hadisə Qeydləri**: İstifadəçi kimliyi, IP ünvanı, Tarix/Saat, Əməliyyat tipi (Məs: `SITE_CREATE`, `USER_UPDATE`, `THEME_CHANGE`, `LOGIN`).
  - **Təfərrüat Baxışı**: Hadisənin JSON metadata məlumatları.
  - **Axtarış və Filtrləmə**: Fəaliyyət növünə və ya istifadəçiyə görə axtarış.

### 5. Platforma Tənzimləmələri (`/admin/settings`)
- **Məqsəd**: Qlobal parametrlər və inteqrasiyalar.
- **Funksiyaları**:
  - **Platforma Rejimləri**: Baxım rejimi (Maintenance Mode), Qeydiyyatın açıq/qapalı olması.
  - **GitHub Şablon İnteqrasiyası**: GitHub Access Token, Təşkilat/İstifadəçi adı, Şablon repozitoriyası adı sazlamaları.
  - **Domain & CDN Parametrləri**: Server ünvanları və qlobal host konfiqurasiyaları.

---

## BÖLMƏ 2: MÜŞTƏRİ DASHBOARD PANELİ (`/dashboard`)

Çox-təşkilatlı (Multi-tenant) arxitektura. İstifadəçi yuxarı sol paneldən saytlarını seçə və dəyişə bilər.

### 1. Əsas İcmal (`/dashboard`)
- Müəssisənin saytları siyahısı, saytın yayın statusu (Yayınlanıb / Qaralama).
- Yemək/Xidmət sayı, kateqoriyalar üzrə tez statistik göstəricilər.
- Saytın publik linki (`/site/[slug]`).

### 2. Veb Saytım (`/dashboard/website`)
- **Saytın Əsas Məlumatları**: Sayt adı, slug (URL linki), loqo yükləmə, əlaqə telefonu, ünvan.
- **Sayt Növü / Kateqoriyası**: Restoran, Kafe, Gözəllik Salonu, Tibb, Təhsil, Xidmət və s. (25 əsas sahə və alt kateqoriyalar).
- **Yayınlama və Geri Çəkmə**: Saytı birbaşa canlıya çıxarma və ya yayından dayandırma düyməsi.
- **SEO & Meta Tənzimləmələri**: Axtarış sistemləri üçün başlıq və təsvir.

### 3. Tema Kitabxanası (`/dashboard/theme`)
- **Məqsəd**: Sayt üçün dizayn şablonunu seçmək, fərdiləşdirmək və tətbiq etmək.
- **Funksiyaları**:
  - **Mövcud Temalar**: `bySalmanov`, `warmGourmetPro`, `modernBistro`, `neonNightBar` və fərdi yüklənmiş temalar.
  - **Kateqoriya Filtrləri**: Restoran, Kafe, Fast Food, Bar/Lounge, Xidmət.
  - **İnteraktiv Önizləmə Modal-ı**: Sayt məlumatları ilə birlikdə temanın canlı görünüşünü modal daxilində sınaqdan keçirmə.
  - **Qaralama və ya Canlı Tətbiq**: Temanı dərhal canlı sayta vermək və ya qaralama (draft) olaraq yadda saxlamaq.
  - **JSON İxrac (Export)**: Aktiv temanın dizayn, rəng və şrift kodlarını JSON faylı kimi endirmək.
  - **JSON İdxal (Import)**: Hazır JSON faylını yükləyərək yeni tema variantı əlavə etmək.
  - **Xüsusi Temaların Silinməsi**: Sonradan əlavə olunmuş temaları təmizləmək (daxili sistem temaları qorunur).

### 4. Menyu İdarəetməsi (`/dashboard/menu`)
*(Yalnız Restoran, Kafe, Qida tipli müəssisələr üçün)*
- **Kateqoriyalar**: Şorbalar, Əsas yeməklər, İçkilər, Desertlər və s. yaratma, sıralama, gizlətmə.
- **Yeməklər / Məhsullar**:
  - Ad, qiymət, endirimli qiymət, tərkib təsviri, kalori, qrammaj.
  - Şəkil yükləmə və qalereya inteqrasiyası.
  - Statuslar: Mövcuddur / Bitib / Yeni / Şefin seçimi / Çox satılan.
- **Hero Dish**: Saytın ana səhifəsində ən öndə xüsusi animasiya ilə nümayiş olunacaq yeməyin seçimi.
- **Menyu Excel/JSON İdxal**: Məhsulları kütləvi yükləmə.

### 5. Xidmətlər (`/dashboard/services`)
*(Xidmət, klinika, salon, təhsil tipli saytlar üçün)*
- Xidmətin adı, icra müddəti, qiymət aralığı, təsviri və xidmət ikonası.

### 6. Məhsullar (`/dashboard/products`)
*(Satış və e-ticarət tipli saytlar üçün)*
- Məhsul kataloqu, qiymət, stok vəziyyəti və kateqoriyalar.

### 7. Paketlər və Tariflər (`/dashboard/packages`)
- Şadlıq sarayları, turizm, fitnes və ya abunəlik xidmətləri üçün kombo və qiymət paketləri təyini.

### 8. Veb Səhifə Redaktoru (`/dashboard/site-editor`)
- Saytın bölmələrinin blok strukturu (Hero, Haqqımızda, Menyu, Qalereya, Əlaqə, Rəylər).
- Bölmələrin sıralamasının dəyişdirilməsi və mətnlərin dərhal redaktə edilməsi.

### 9. Qalereya və Media Meneceri (`/dashboard/gallery` & `/dashboard/media`)
- **Şəkil Yükləmə**: Optimallaşdırılmış foto və banner yüklənməsi (1MB-a qədər avtomatik DB ehtiyatı, böyüklər fayl sisteminə).
- **Foto Albomlar**: İnteryer, Eksteryer, Tədbirlər, Yeməklər üzrə kateqoriyalaşdırma.

### 10. İş Qrafiki və İş Saatları (`/dashboard/working-hours`)
- Həftənin hər günü üçün açılış və bağlanış saatları (09:00 - 23:00).
- Fasilə saatları və qeyri-iş günləri təyini.
- Saytda "Hazırda Açıqdır" / "Bağlıdır" və növbəti açılış vaxtı avtomatik hesablanması.
- **Off-Hours Xəbərdarlığı**: Bağlı olan saatlarda sayt ziyarətçisinə göstərilən fərdi xəbərdarlıq mətni.

### 11. Əməkdaşlar və İcazələr (`/dashboard/employees`)
- **İşçi Heyəti İdarəsi**: Ofisiant, Menecer, Kassir, Aşpaz və s. hesablarının açılması.
- **Detallı İcazə Matrisi (RBAC)**: Hər işçiyə yalnız müəyyən bölmələrə (məs. yalnız Menyuya baxa bilsin, amma Ayarlara və Sayt Tənzimləməsinə girə bilməsin) `canView` və `canManage` icazəsi verilməsi.
- **Əməkdaş Fəaliyyət Jurnalı**: İş saatları, qeydiyyat, bonus və cərimə qeydləri.

### 12. Gələn Müraciətlər və Əlaqə (`/dashboard/inquiries`)
- Saytdakı əlaqə formasından və ya rezervasiyadan göndərilən mesajlar.
- Müştəri adı, nömrəsi, mesaj mətni, göndərilmə saatı və status (Oxunub / Cavablandı).
- Telegram Bot və Webhook inteqrasiyası ilə hər yeni müraciətdə administratorun telefonuna anlıq bildiriş gəlməsi.

### 13. QR Menyu Generatoru (`/dashboard/qr`)
- Masalar və ya giriş stendləri üçün birbaşa sayta yönləndirən dinamik QR kod generasiyası.
- Rəng, loqo inteqrasiyası və PNG/SVG formatında çap üçün endirmə imkanı.

### 14. Sosial Şəbəkələr və Canlı Feed (`/dashboard/social`)
- Instagram, TikTok, Facebook, YouTube hesablarının linkləri.
- Instagram postlarının və ya xüsusi paylaşımların saytın ana səhifəsində canlı lent şəklində çıxarılması.

### 15. WhatsApp Çat Düyməsi (`/dashboard/whatsapp`)
- Saytın sağ aşağı küncündə görünən interaktiv WhatsApp əlaqə düyməsi.
- Menecerin WhatsApp nömrəsi və avtomatik salamlaşma mətni (məs: *"Salam, menyu haqqında məlumat almaq istəyirəm"*).

### 16. Splash Screen (`/dashboard/splash`)
*(Yalnız Super Admin və xüsusi səlahiyyətli saytlar üçün)*
- Ziyarətçi sayta ilk daxil olanda açılan giriş animasiyası / açılış ekranı.
- Brend loqosu, animasiya, video və ya fərdi HTML/CSS/JS dəstəyi (təhlükəsiz sandbox daxilində).

### 17. Statistika və Analitika (`/dashboard/analytics`)
- Saytın baxış sayı, unikal ziyarətçilər, ən çox kliklənən yeməklər və saatlıq trafik qrafikləri.

### 18. Faktura və Abunəlik (`/dashboard/billing`)
- Cari tarif paketi, bitmə tarixi, fakturalar və ödəniş tarixçəsi.

### 19. İxrac və İdxal (`/dashboard/export-import`)
- Müəssisənin bütün menyu, xidmət, iş saatları və media parametrlərini tək bir faylda JSON/ZIP olaraq ehtiyat nüsxələmə (Backup) və başqa sayta köçürmə imkanı.

### 20. Sayt Tənzimləmələri (`/dashboard/settings`)
- Saytın silinməsi, domen bağlantısı tələbi, dil və valyuta tənzimləmələri.

---

## BÖLMƏ 3: MEMARLIQ VƏ TƏHLÜKƏSİZLİK XÜSUSİYYƏTLƏRİ

1. **Modul Qeydiyyat Sistemi (`src/lib/module-registry`)**: Hər bir modul menyu, icazələr, kateqoriya filtri və route-lar ilə birlikdə mərkəzi registr üzərindən idarə olunur.
2. **Rol Əsaslı Giriş İcazəsi (RBAC)**:
   - `SUPER_ADMIN`: Həm `/admin`, həm də bütün `/dashboard` resurslarına tam nəzarət.
   - `ADMIN` / `OWNER`: Öz təşkilatının bütün menyu, sayt və əməkdaş idarəetməsinə tam çıxış.
   - `EMPLOYEE`: Yalnız sayt rəhbərinin ona təyin etdiyi xüsusi bölmələrə giriş imkanı.
3. **Mərkəzi API Klienti (`src/lib/api-client`)**: Avtomatik JSON seriyalaşdırma, standart xəta idarəetməsi (`ApiError`) və sessiya mühafizəsi.
4. **Çoxqatlı Xəta İdarəetməsi**: Global, Admin və Dashboard səviyyələrində `error.tsx` və `ErrorBoundary` mexanizmləri.
5. **İkiqat Canlı Dağıtım**: Kod hər dəyişiklikdə həm **Vercel Serverless** platformasına, həm də **Hostinger VPS** serverinə avtomatlaşdırılmış skriptlərlə sinxron şəkildə deploy edilir.
