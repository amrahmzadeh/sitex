/**
 * Sayt növü kataloqu — tək mərkəzləşdirilmiş mənbə.
 *
 * ID-lər sabit saxlanılmalıdır: verilənlər bazasında, şablon manifestində və
 * API cavablarında yalnız bu ID-lərdən istifadə olunur. Görünən adlar
 * dəyişdirilə bilər, ID-lər isə dəyişdirilməməlidir.
 */

export interface SiteSubcategory {
  id: string;
  name: string;
}

export interface SiteCategory {
  id: string;
  name: string;
  /** Qısa izah — seçim kartında göstərilir */
  description: string;
  /** UI-da lucide ikonuna uyğunlaşdırılan açar */
  icon: string;
  subcategories: SiteSubcategory[];
}

export const SITE_CATEGORIES: SiteCategory[] = [
  {
    id: 'sexsi-blog',
    name: 'Şəxsi Bloq',
    description: 'Şəxsi yazılar, gündəlik və ixtisaslaşmış bloglar',
    icon: 'pen-line',
    subcategories: [
      { id: 'sexsi-gundelik', name: 'Şəxsi Gündəlik' },
      { id: 'doktor-blogu', name: 'Doktor Bloqu' },
      { id: 'seyahat-blogu', name: 'Səyahət Bloqu' },
      { id: 'fotoqrafiya-blogu', name: 'Fotoqrafiya Bloqu' },
      { id: 'jurnalist-blogu', name: 'Jurnalist Bloqu' },
      { id: 'texnologiya-blogu', name: 'Texnologiya Bloqu' },
      { id: 'heyat-terzi-blogu', name: 'Həyat Tərzi Bloqu' },
      { id: 'influencer-blogu', name: 'Influencer Bloqu' },
    ],
  },
  {
    id: 'muessise-sayti',
    name: 'Müəssisə Saytı',
    description: 'Yerli biznes və xidmət müəssisələri üçün saytlar',
    icon: 'building-2',
    subcategories: [
      { id: 'restoran-ve-kafe', name: 'Restoran və Kafe' },
      { id: 'klinika-ve-tibb-merkezi', name: 'Klinika və Tibb Mərkəzi' },
      { id: 'xeber-ve-media', name: 'Xəbər və Media' },
      { id: 'gozellik-salonu', name: 'Gözəllik Salonu' },
      { id: 'otel-ve-turizm', name: 'Otel və Turizm' },
      { id: 'tikinti-sirketi', name: 'Tikinti Şirkəti' },
      { id: 'avtomobil-servisi', name: 'Avtomobil Servisi' },
      { id: 'dasinmaz-emlak-agentliyi', name: 'Daşınmaz Əmlak Agentliyi' },
    ],
  },
  {
    id: 'onlayn-magaza',
    name: 'Onlayn Mağaza',
    description: 'Məhsul kataloqu və onlayn satış saytları',
    icon: 'shopping-bag',
    subcategories: [
      { id: 'geyim-ve-aksesuarlar', name: 'Geyim və Aksesuarlar' },
      { id: 'elektronika', name: 'Elektronika' },
      { id: 'kosmetika-ve-gozellik', name: 'Kosmetika və Gözəllik' },
      { id: 'erzaq-ve-ickiler', name: 'Ərzaq və İçkilər' },
      { id: 'mebel-ve-ev-dekoru', name: 'Mebel və Ev Dekoru' },
      { id: 'kitab-ve-defterxana', name: 'Kitab və Dəftərxana' },
      { id: 'el-isleri-ve-hediyyeler', name: 'Əl İşləri və Hədiyyələr' },
      { id: 'idman-mallari', name: 'İdman Malları' },
      { id: 'usaq-mehsullari', name: 'Uşaq Məhsulları' },
      { id: 'reqemsal-mehsullar', name: 'Rəqəmsal Məhsullar' },
    ],
  },
  {
    id: 'tehsil-sayti',
    name: 'Təhsil Saytı',
    description: 'Kurs, məktəb və tədris platformaları',
    icon: 'graduation-cap',
    subcategories: [
      { id: 'onlayn-kurslar', name: 'Onlayn Kurslar' },
      { id: 'mekteb', name: 'Məktəb' },
      { id: 'universitet', name: 'Universitet' },
      { id: 'hazirliq-merkezi', name: 'Hazırlıq Mərkəzi' },
      { id: 'ferdi-muellim', name: 'Fərdi Müəllim' },
      { id: 'dil-kurslari', name: 'Dil Kursları' },
      { id: 'tedris-platformasi', name: 'Tədris Platforması' },
      { id: 'telim-ve-sertifikasiya', name: 'Təlim və Sertifikasiya' },
    ],
  },
  {
    id: 'portfolio-sayti',
    name: 'Portfolio Saytı',
    description: 'Yaradıcı şəxslər və peşəkarlar üçün iş nümunələri',
    icon: 'palette',
    subcategories: [
      { id: 'qrafik-dizayner', name: 'Qrafik Dizayner' },
      { id: 'veb-dizayner-ve-proqramci', name: 'Veb Dizayner və Proqramçı' },
      { id: 'fotoqraf', name: 'Fotoqraf' },
      { id: 'memar-ve-interyer-dizayneri', name: 'Memar və İnteryer Dizayneri' },
      { id: 'ressam-ve-illustrator', name: 'Rəssam və İllüstrator' },
      { id: 'videoqraf', name: 'Videoqraf' },
      { id: 'ui-ux-dizayner', name: 'UI/UX Dizayner' },
      { id: 'yaradici-portfolio', name: 'Yaradıcı Portfolio' },
    ],
  },
  {
    id: 'xidmet-sayti',
    name: 'Xidmət Saytı',
    description: 'Peşəkar xidmətlərin təqdimatı və sifarişi',
    icon: 'wrench',
    subcategories: [
      { id: 'huquq-ve-vekillik', name: 'Hüquq və Vəkillik' },
      { id: 'muhasibat-ve-audit', name: 'Mühasibat və Audit' },
      { id: 'temir-ve-tikinti', name: 'Təmir və Tikinti' },
      { id: 'gozellik-ve-baxim', name: 'Gözəllik və Baxım' },
      { id: 'avtomobil-temiri', name: 'Avtomobil Təmiri' },
      { id: 'temizlik-xidmeti', name: 'Təmizlik Xidməti' },
      { id: 'biznes-konsaltinqi', name: 'Biznes Konsaltinqi' },
      { id: 'it-xidmetleri', name: 'İT Xidmətləri' },
      { id: 'catdirilma-xidmeti', name: 'Çatdırılma Xidməti' },
    ],
  },
  {
    id: 'korporativ-sayt',
    name: 'Korporativ Sayt',
    description: 'Şirkət, holding və sənaye müəssisələri',
    icon: 'briefcase',
    subcategories: [
      { id: 'sirket-sayti', name: 'Şirkət Saytı' },
      { id: 'holding', name: 'Holding' },
      { id: 'istehsalat-muessisesi', name: 'İstehsalat Müəssisəsi' },
      { id: 'tikinti-ve-insaat-sirketi', name: 'Tikinti və İnşaat Şirkəti' },
      { id: 'it-ve-texnologiya-sirketi', name: 'İT və Texnologiya Şirkəti' },
      { id: 'logistika-ve-neqliyyat', name: 'Logistika və Nəqliyyat' },
      { id: 'dasinmaz-emlak-sirketi', name: 'Daşınmaz Əmlak Şirkəti' },
      { id: 'maliyye-sirketi', name: 'Maliyyə Şirkəti' },
      { id: 'beynelxalq-sirket', name: 'Beynəlxalq Şirkət' },
    ],
  },
  {
    id: 'xeber-ve-media-sayti',
    name: 'Xəbər və Media Saytı',
    description: 'Xəbər portalları, jurnallar və media layihələri',
    icon: 'newspaper',
    subcategories: [
      { id: 'xeber-portali', name: 'Xəbər Portalı' },
      { id: 'onlayn-jurnal', name: 'Onlayn Jurnal' },
      { id: 'idman-mediasi', name: 'İdman Mediası' },
      { id: 'texnologiya-mediasi', name: 'Texnologiya Mediası' },
      { id: 'eylence-mediasi', name: 'Əyləncə Mediası' },
      { id: 'analitik-media', name: 'Analitik Media' },
      { id: 'regional-xeberler', name: 'Regional Xəbərlər' },
      { id: 'medeniyyet-ve-incesenet-mediasi', name: 'Mədəniyyət və İncəsənət Mediası' },
    ],
  },
  {
    id: 'eylence-sayti',
    name: 'Əyləncə Saytı',
    description: 'Film, musiqi, oyun və multimedia layihələri',
    icon: 'clapperboard',
    subcategories: [
      { id: 'film-ve-seriallar', name: 'Film və Seriallar' },
      { id: 'musiqi-platformasi', name: 'Musiqi Platforması' },
      { id: 'oyun-portali', name: 'Oyun Portalı' },
      { id: 'yumor-ve-memler', name: 'Yumor və Memlər' },
      { id: 'meshurlar-ve-sou-biznes', name: 'Məşhurlar və Şou-Biznes' },
      { id: 'tedbirler-ve-konsertler', name: 'Tədbirlər və Konsertlər' },
      { id: 'video-ve-multimedia', name: 'Video və Multimedia' },
    ],
  },
  {
    id: 'icma-ve-sosial-platforma',
    name: 'İcma və Sosial Platforma',
    description: 'Forum, sosial şəbəkə və üzvlük platformaları',
    icon: 'users',
    subcategories: [
      { id: 'forum', name: 'Forum' },
      { id: 'sosial-sebeke', name: 'Sosial Şəbəkə' },
      { id: 'sual-cavab-platformasi', name: 'Sual-Cavab Platforması' },
      { id: 'is-ve-vakansiya-portali', name: 'İş və Vakansiya Portalı' },
      { id: 'pesekar-icma', name: 'Peşəkar İcma' },
      { id: 'telebe-icmasi', name: 'Tələbə İcması' },
      { id: 'elanlar-platformasi', name: 'Elanlar Platforması' },
      { id: 'uyvluk-platformasi', name: 'Üzvlük Platforması' },
    ],
  },
  {
    id: 'dasinmaz-emlak-sayti',
    name: 'Daşınmaz Əmlak Saytı',
    description: 'Əmlak elanları, kirayə və agentlik saytları',
    icon: 'home',
    subcategories: [
      { id: 'ev-ve-menzil-elanlari', name: 'Ev və Mənzil Elanları' },
      { id: 'kiraye-emlak', name: 'Kirayə Əmlak' },
      { id: 'kommersiya-emlaki', name: 'Kommersiya Əmlakı' },
      { id: 'emlak-agentliyi', name: 'Əmlak Agentliyi' },
      { id: 'yeni-tikili-layiheleri', name: 'Yeni Tikili Layihələri' },
      { id: 'torpaq-saheleri', name: 'Torpaq Sahələri' },
      { id: 'gunluk-kiraye', name: 'Günlük Kirayə' },
      { id: 'emlak-idareetmesi', name: 'Əmlak İdarəetməsi' },
    ],
  },
  {
    id: 'seyahat-ve-turizm-sayti',
    name: 'Səyahət və Turizm Saytı',
    description: 'Turizm agentlikləri, otellər və səyahət layihələri',
    icon: 'plane',
    subcategories: [
      { id: 'turizm-agentliyi', name: 'Turizm Agentliyi' },
      { id: 'otel-ve-qonaq-evi', name: 'Otel və Qonaq Evi' },
      { id: 'seyahat-blogu', name: 'Səyahət Bloqu' },
      { id: 'tur-paketleri', name: 'Tur Paketləri' },
      { id: 'turist-beledcisi', name: 'Turist Bələdçisi' },
      { id: 'bilet-rezervasiyasi', name: 'Bilet Rezervasiyası' },
      { id: 'avtomobil-icaresi', name: 'Avtomobil İcarəsi' },
      { id: 'seyahat-planlasdiricisi', name: 'Səyahət Planlaşdırıcısı' },
    ],
  },
  {
    id: 'restoran-ve-qida-sayti',
    name: 'Restoran və Qida Saytı',
    description: 'Restoran, kafe, qənnadı və yemək sifarişi saytları',
    icon: 'utensils',
    subcategories: [
      { id: 'restoran', name: 'Restoran' },
      { id: 'kafe-ve-qehvexana', name: 'Kafe və Qəhvəxana' },
      { id: 'fast-food', name: 'Fast-Food' },
      { id: 'sirniyyat-ve-corek-evi', name: 'Şirniyyat və Çörək Evi' },
      { id: 'katering-xidmeti', name: 'Katering Xidməti' },
      { id: 'onlayn-yemek-sifarisi', name: 'Onlayn Yemək Sifarişi' },
      { id: 'resept-blogu', name: 'Resept Bloqu' },
      { id: 'qida-catdirilmasi', name: 'Qida Çatdırılması' },
    ],
  },
  {
    id: 'sehiyye-ve-saglamliq-sayti',
    name: 'Səhiyyə və Sağlamlıq Saytı',
    description: 'Həkim, klinika, aptek və sağlamlıq platformaları',
    icon: 'heart-pulse',
    subcategories: [
      { id: 'hekim-sayti', name: 'Həkim Saytı' },
      { id: 'stomatoloji-klinika', name: 'Stomatoloji Klinika' },
      { id: 'tibb-merkezi', name: 'Tibb Mərkəzi' },
      { id: 'aptek', name: 'Aptek' },
      { id: 'psixoloq-ve-psixoterapevt', name: 'Psixoloq və Psixoterapevt' },
      { id: 'laboratoriya', name: 'Laboratoriya' },
      { id: 'fizioterapiya-merkezi', name: 'Fizioterapiya Mərkəzi' },
      { id: 'saglam-heyat-platformasi', name: 'Sağlam Həyat Platforması' },
    ],
  },
  {
    id: 'qeyri-kommersiya-teskilati',
    name: 'Qeyri-kommersiya Təşkilatı',
    description: 'Fond, QHT və ictimai layihələr',
    icon: 'heart-handshake',
    subcategories: [
      { id: 'xeyriyye-teskilati', name: 'Xeyriyyə Təşkilatı' },
      { id: 'fond', name: 'Fond' },
      { id: 'qht', name: 'QHT' },
      { id: 'ictimai-birlik', name: 'İctimai Birlik' },
      { id: 'ekoloji-teskilat', name: 'Ekoloji Təşkilat' },
      { id: 'konulluluk-platformasi', name: 'Könüllülük Platforması' },
      { id: 'sosial-layihe', name: 'Sosial Layihə' },
      { id: 'iane-toplama-sayti', name: 'İanə Toplama Saytı' },
    ],
  },
  {
    id: 'sexsi-brend-sayti',
    name: 'Şəxsi Brend Saytı',
    description: 'Ekspert, mentor, spiker və müəlliflər üçün',
    icon: 'sparkles',
    subcategories: [
      { id: 'ekspert-ve-mutexessis', name: 'Ekspert və Mütəxəssis' },
      { id: 'spiker', name: 'Spiker' },
      { id: 'mentor', name: 'Mentor' },
      { id: 'kouc', name: 'Kouç' },
      { id: 'meslehetci', name: 'Məsləhətçi' },
      { id: 'muellif-ve-yazici', name: 'Müəllif və Yazıçı' },
      { id: 'ictimai-sexs', name: 'İctimai Şəxs' },
      { id: 'pesekar-profil', name: 'Peşəkar Profil' },
    ],
  },
  {
    id: 'tedbir-sayti',
    name: 'Tədbir Saytı',
    description: 'Konfrans, toy, festival və bilet satışı saytları',
    icon: 'calendar-days',
    subcategories: [
      { id: 'konfrans', name: 'Konfrans' },
      { id: 'toy-ve-nisan', name: 'Toy və Nişan' },
      { id: 'festival', name: 'Festival' },
      { id: 'sergi', name: 'Sərgi' },
      { id: 'seminar-ve-telim', name: 'Seminar və Təlim' },
      { id: 'konsert', name: 'Konsert' },
      { id: 'tedbir-qeydiyyati', name: 'Tədbir Qeydiyyatı' },
      { id: 'bilet-satisi', name: 'Bilet Satışı' },
    ],
  },
  {
    id: 'idman-ve-fitness-sayti',
    name: 'İdman və Fitness Saytı',
    description: 'Fitness mərkəzləri, idman klubları və məşqçilər',
    icon: 'dumbbell',
    subcategories: [
      { id: 'fitness-merkezi', name: 'Fitness Mərkəzi' },
      { id: 'idman-klubu', name: 'İdman Klubu' },
      { id: 'yoga-ve-pilates-studiyasi', name: 'Yoga və Pilates Studiyası' },
      { id: 'sexsi-mesqci', name: 'Şəxsi Məşqçi' },
      { id: 'idman-xeberleri', name: 'İdman Xəbərləri' },
      { id: 'idman-yarislari', name: 'İdman Yarışları' },
      { id: 'idman-akademiyasi', name: 'İdman Akademiyası' },
      { id: 'onlayn-fitness-proqramlari', name: 'Onlayn Fitness Proqramları' },
    ],
  },
  {
    id: 'maliyye-ve-biznes-sayti',
    name: 'Maliyyə və Biznes Saytı',
    description: 'Mühasibat, konsaltinq, startap və maliyyə xidmətləri',
    icon: 'trending-up',
    subcategories: [
      { id: 'muhasibat-xidmeti', name: 'Mühasibat Xidməti' },
      { id: 'maliyye-mesleheti', name: 'Maliyyə Məsləhəti' },
      { id: 'biznes-konsaltinqi', name: 'Biznes Konsaltinqi' },
      { id: 'startap', name: 'Startap' },
      { id: 'fintech-platformasi', name: 'Fintech Platforması' },
      { id: 'sigorta-sirketi', name: 'Sığorta Şirkəti' },
      { id: 'investisiya-sirketi', name: 'İnvestisiya Şirkəti' },
      { id: 'biznes-telimleri', name: 'Biznes Təlimləri' },
    ],
  },
  {
    id: 'reqemsal-mehsul-ve-saas',
    name: 'Rəqəmsal Məhsul və SaaS',
    description: 'SaaS, tətbiq və rəqəmsal məhsul saytları',
    icon: 'cloud',
    subcategories: [
      { id: 'saas-platformasi', name: 'SaaS Platforması' },
      { id: 'veb-tetbiq', name: 'Veb Tətbiq' },
      { id: 'mobil-tetbiq', name: 'Mobil Tətbiq' },
      { id: 'onlayn-aletler', name: 'Onlayn Alətlər' },
      { id: 'abunelik-platformasi', name: 'Abunəlik Platforması' },
      { id: 'reqemsal-mehsullar', name: 'Rəqəmsal Məhsullar' },
      { id: 'api-xidmeti', name: 'API Xidməti' },
      { id: 'proqram-teminati', name: 'Proqram Təminatı' },
    ],
  },
  {
    id: 'sexsi-ve-resmi-sayt',
    name: 'Şəxsi və Rəsmi Sayt',
    description: 'Şəxsi tanıtım, CV və rəsmi şəxs saytları',
    icon: 'badge-check',
    subcategories: [
      { id: 'sexsi-vebsayt', name: 'Şəxsi Vebsayt' },
      { id: 'resmi-sexs-sayti', name: 'Rəsmi Şəxs Saytı' },
      { id: 'siyasetci-sayti', name: 'Siyasətçi Saytı' },
      { id: 'ictimai-xadim-sayti', name: 'İctimai Xadim Saytı' },
      { id: 'bioqrafiya-sayti', name: 'Bioqrafiya Saytı' },
      { id: 'cv-ve-resume', name: 'CV və Resume' },
      { id: 'sexsi-tanitim-sehifesi', name: 'Şəxsi Tanıtım Səhifəsi' },
    ],
  },
  {
    id: 'tikinti-ve-memarliq-sayti',
    name: 'Tikinti və Memarlıq Saytı',
    description: 'Memarlıq büroları, tikinti və təmir şirkətləri',
    icon: 'hammer',
    subcategories: [
      { id: 'memarliq-burosu', name: 'Memarlıq Bürosu' },
      { id: 'interyer-dizayni', name: 'İnteryer Dizaynı' },
      { id: 'tikinti-sirketi', name: 'Tikinti Şirkəti' },
      { id: 'temir-xidmeti', name: 'Təmir Xidməti' },
      { id: 'landshaft-dizayni', name: 'Landşaft Dizaynı' },
      { id: 'tikinti-materiallari', name: 'Tikinti Materialları' },
      { id: 'layihe-teqdimati', name: 'Layihə Təqdimatı' },
    ],
  },
  {
    id: 'avtomobil-sayti',
    name: 'Avtomobil Saytı',
    description: 'Avtomobil satışı, icarə, servis və elanlar',
    icon: 'car',
    subcategories: [
      { id: 'avtomobil-satisi', name: 'Avtomobil Satışı' },
      { id: 'avtomobil-icaresi', name: 'Avtomobil İcarəsi' },
      { id: 'avtoservis', name: 'Avtoservis' },
      { id: 'ehtiyat-hisseleri', name: 'Ehtiyat Hissələri' },
      { id: 'avtomobil-elanlari', name: 'Avtomobil Elanları' },
      { id: 'avtomobil-xeberleri', name: 'Avtomobil Xəbərləri' },
      { id: 'suruculuk-mektebi', name: 'Sürücülük Məktəbi' },
    ],
  },
  {
    id: 'huquq-ve-dovlet-xidmetleri-sayti',
    name: 'Hüquq və Dövlət Xidmətləri Saytı',
    description: 'Hüquq büroları, dövlət qurumları və elektron xidmətlər',
    icon: 'scale',
    subcategories: [
      { id: 'huquq-burosu', name: 'Hüquq Bürosu' },
      { id: 'vekil-sayti', name: 'Vəkil Saytı' },
      { id: 'huquqi-meslehet', name: 'Hüquqi Məsləhət' },
      { id: 'dovlet-qurumunun-sayti', name: 'Dövlət Qurumunun Saytı' },
      { id: 'elektron-xidmetler', name: 'Elektron Xidmətlər' },
      { id: 'sened-ve-muraciet-platformasi', name: 'Sənəd və Müraciət Platforması' },
    ],
  },
  {
    id: 'diger-sayt-novleri',
    name: 'Digər Sayt Növləri',
    description: 'Landing page, mikrosayt və digər layihələr',
    icon: 'layout-template',
    subcategories: [
      { id: 'landing-page', name: 'Landing Page' },
      { id: 'mehsul-tanitim-sehifesi', name: 'Məhsul Tanıtım Səhifəsi' },
      { id: 'mikrosayt', name: 'Mikrosayt' },
      { id: 'eksperimental-layihe', name: 'Eksperimental Layihə' },
      { id: 'coxmeqsedli-sayt', name: 'Çoxməqsədli Sayt' },
      { id: 'diger', name: 'Digər' },
    ],
  },
];

export const DEFAULT_SITE_CATEGORY_ID = 'diger-sayt-novleri';
export const DEFAULT_SITE_SUBCATEGORY_ID = 'diger';

const categoryMap = new Map(SITE_CATEGORIES.map((c) => [c.id, c]));

export function getSiteCategory(id?: string | null): SiteCategory | undefined {
  if (!id) return undefined;
  return categoryMap.get(id);
}

export function getSiteSubcategory(
  categoryId?: string | null,
  subcategoryId?: string | null
): SiteSubcategory | undefined {
  if (!subcategoryId) return undefined;
  return getSiteCategory(categoryId)?.subcategories.find((s) => s.id === subcategoryId);
}

/** Kateqoriya + alt kateqoriya cütünün kataloqda mövcud olub-olmadığını yoxlayır. */
export function isValidSiteType(
  categoryId?: string | null,
  subcategoryId?: string | null
): boolean {
  return Boolean(getSiteSubcategory(categoryId, subcategoryId));
}

/** Köhnə (kateqoriyasız) saytlar üçün təhlükəsiz görünüş adları. */
export function getSiteTypeLabel(
  categoryId?: string | null,
  subcategoryId?: string | null
): string | null {
  const category = getSiteCategory(categoryId);
  if (!category) return null;
  const subcategory = getSiteSubcategory(categoryId, subcategoryId);
  return subcategory ? `${category.name} / ${subcategory.name}` : category.name;
}
