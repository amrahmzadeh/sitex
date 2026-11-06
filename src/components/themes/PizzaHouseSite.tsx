'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  Menu,
  X,
  Star,
  Check,
  CheckCircle,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Flame,
  Calendar,
  Users,
  UtensilsCrossed,
  ZoomIn,
  Send,
  Navigation,
} from 'lucide-react';
import type { SiteData, MenuItem, MenuCategory, GalleryItem } from './RestaurantSite';
import { ThemeConfig, getGoogleFontsUrl } from '@/lib/themes';
import { formatPrice, formatWhatsAppUrl } from '@/lib/utils';
import { useWorkingHours } from '@/hooks/useWorkingHours';
import { getResolvedSiteContent } from '@/lib/site-content-resolver';
import { OffHoursNotice } from '@/components/common/OffHoursNotice';

// --- Fallback assets matching code.html exactly ---
const DEFAULT_LOGO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuACB0mAksM3aRPhjsT8OxLfp7adGNG-ZMTtcWiad_Wb35YCaS7dSWGxgU2jDhX5zvKlBhOCKXebmEH7rtRQ8pjyxl_8BQByRau-fZtWdwhqMWWus-glqZPm22yDUU7j6LMeNHFmSqbxj5GyzkfUthaY7PLlvKNwn-DQlOXX-m0-NbwzoLoNrE64AwObC0jPWRbTnHylbv9TpRcpeQVxjmm5inNoXkcrjx4u9sAcjMQ';

const HERO_PIZZA_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRo2I5hR5P2Ed1OTmJzkWtMGU0i_uR0qwSdmeG2oWLVEgxNAW1po47QBNuSxj1dAU_lfTqeZPXc5ilHkEEYLreE3nWUTbCO65kOVvo6XV5FnQfof074aAhxxo-naGWW7RQGd-M5tGhDO3vsS3x-BN4Mh0ipkW5AUoAQ-z77BEigw-TjbaZrcQ8Tb7B1xNfBBknUp-wiZQBTi2lizPQY69cZRFQa1-CJI1GW9TEC4c';

const ABOUT_COLLAGE_1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDThHB2uam72P5rdDpCCIlhnaXCEZ0UEw9-mduJxZhEt73TekdKOESBPcFVu3k2Bf4dYYLL0KHZvQ25vZRUNDbHvzxcRai2dhxqVWRL3eP9bbt8jzGZDaI0p9eLvMfKZYwdrKyU-fhNzrIRBgHXfaoPzLYLjywxgCaZOn-IS7oYazuOeRpfSbBPOqwoa6HyAjEM6RiEHw04m-k9yxY5A5w2OiJ0ecla8vj20fDUOgM';
const ABOUT_COLLAGE_2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWYSMKAEU2SXFCul0CJpIcf7OND873yIQjOVfv0sjRXM6PpuOK5Cm06kZwNzr26FkZfYdBMnmYyHyB_mzO6Fyv-FNwKRZjQ_W6HJ9xCBZj9dyE3VZQKIuGrKt2_vAPs-NnwHt9R8fzfrIOC2eY9iM8tw14CVEXza_TDYpPlx-CbFMrkFZyvQd3Js2wLOOVVM-umKvScMRS6GWii6JLTBkytCkABDW1Uvkhw7x5mFk';
const ABOUT_COLLAGE_3 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCs1ITLDuq_HymG0ik10t9YbJXfWh3CmzHhYNh7ounC9YCN6tX0HJL-tYseGT-73UMKhwK5uPncMLMtPbbxyhod0EoJEM23NxBQucnsUjJvYl_lmAsunHhRTmpE9IRjN7vSmKL1nRz71R2lsaFOTpHui5m_DBxRHNgpA-57uYOk1s_EEXdcXlPnfOJI4VU826vzmr-pQNtu4KLVwjPgF4wcXBZTxR3tMGeN5yrr9lQ';
const ABOUT_COLLAGE_4 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDDb2G0cjJP5XWCbnsUMR0aTqMoJMl1Phiy4lvq__V3Rgk10nGXQuWDD0i3ABcmC1PeaWOey8WCYvDgk_QobjI3mrlxDRPdG7MwbC89L9F5QA25Iq4NrKKLDB2ce2WZrc8bEZCaUXJUB80MGCmn4r3awctVVtXTzbZo-2gV9I_wTq98fEPtenXqHzGE4IpRxHJaN2fpkoj1IKmBe50HWip-6BSuTxlRjGa2z7plaNU';

const MAP_BG_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAygsD9wwQJq7H2v-k5iAip-wM3k8SPj-Wf-QFSEiAe4ee1c5PE_UPbjUQY_CA6uNVMkBTvJZIbjqmOh32yEi-Nu8sVL_ekgyJbW0lk8rXLAWpoDweu3HxU9YbYl4EKjXfKaePXYZQnPGg50MtWXHzXZeDvytKYuyVWqEjy0sz_t8JGWMxtod_g24DHc-GvVciULS8_z3oBAJeue9TeaC-Z_5F0cBVWIjX21gnXfA0';
const MAP_STORE_THUMB =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-ZGa3gGujBS7w5xs3xLsRlqteQtTm3XqzKRPrqlxdYd5TcAPmcrC8EjxBVrxVHqfm1WG3EjFkbbpYFuckImffvpZVAo8yGSsmTfjlOYb4VK7pmJ6KumE6LL5Vv8CHBuAE-BPKfQRZaTZDYsDQOiP_iS1qKNK2rY0V5ak3BUJdpZHGQOUb6qEuX72tRHBu3gkiprrkPZf4sSzqBBuW-J1IGQSFPiskWnkImrsZeVE';

const DEFAULT_GALLERY = [
  {
    id: 'gal-1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-qdpTsuzMwGIwaIB7dtKmEw6qTN2_qBrw3qCOZQI4s8OS3iId4kQbTpyOXrlxt0CXrKBzypITRCAS4VKdYTvvTtqi0dzhhvhLwHKtzouQQcSK2AV1CjDAagyja76li9-GszdJZbJJthmjMeBQeke-qj_75a16xaRBWPHp3F1Fqe5af14Xq7ttzJ3UePVFk9uQEVA-iLKNIcWyxl21FSskr5nHAc-M9Mit3qWsPXI',
    title: 'Odun Sobası',
    description: '450 dərəcə istilikdə təbii bişmə',
  },
  {
    id: 'gal-2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXMC477BRbf-XTTIvqgv5A8DE76aFLulPCrGIbuoqxwnwSa6nn9aXVysg5rhDHnvGVDUcwinx7pASuIEVrzm6qufTDNl8wEYNpQUVyTPZE3Owy4NDoihX9ceaJQ7rE_NRQ0YDqEOlMREwlbOnLF_8JCPD5bts-6u1KYPTZfvBUCkHZWkJl9_qselZ8NVsbu_UUW8gaxD_Uk869wGacZz1gGbnLL6T8HOhiLbozDFA',
    title: 'Usta Əli',
    description: '72 saat mayalanmış xüsusi xəmir',
  },
  {
    id: 'gal-3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC61X2ua1FUb_HfD5YvZCtb2aUVJXYkwdiXU-bNePnVEGDVuissDk8Cb3Tg7KKMmkabbSsaV5UqnXCHVnIcBdLBDJ9fn2LfrvxPUNEd273YSJC9lchaFyErYIv9JiNV4L9x5NLLQVprcP5pLB9CrI_JYsdqQn3mVHVO_aRQLnAv6Q6oP6NR-nvE4SsjBYJAjnJdTZNKV1sLLvL6sXi2ItPzsoehULs5mtN8UdIabnE',
    title: 'Klassik Margherita',
    description: 'Təbii İtalyan pomidor sousu',
  },
  {
    id: 'gal-4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4CgYh5qwfoEBG1xt31hWtcC0BdG_WSzyD7tSVosUeg-3d5qw9HZMH5YYO5ZK4wqoR9ZTDPLJSKKc2koerrepIMfzCNqTFSgn9DwpUn48L0bjHxpybqMGN9612Watf6Z7BvSi0HqGv-9bDYrYx7Kt1RuGC4jSRmgzmykN0Fd609OdQggpGcTD9_iM8oTBXXGo74opjdSIDjbw_Q-R6YQxMvqgyMyW2doCdyG8nAg0',
    title: 'Rahat Zal',
    description: 'Ailəniz üçün isti ocaq',
  },
  {
    id: 'gal-5',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH4kW4bn4UF1wrBCdRsIm6OTrTd2JDlEY1FZQzLOYbvhsCzGsHn3fqK0I7FNce9Ptwl8DpZYMo9eT7J6Mo3km1_5M98SAVxQIZZS13I_ygNZuEQcjRXx1YJLmGwl0eqp5lnW09kJ5mb4ih6fLK-0E9p_YdCKO6IhF2KLCv__cYhPWhyInwTmEvqG3YAoInHZwSZEcXgdeLuewL82aowqjxdwnDPI9aGrVUuE0kRUY',
    title: 'Ən Çox Sevilən',
    description: 'Xırçıltılı pepperoni ləzzəti',
  },
  {
    id: 'gal-6',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh0_oiFSlhwGXhssUa_Ax-Pa5lFmzdUBHyX08E8W46sYSuDA_v-cbHI7k4kv6ToYDSB4mWhGviKdhVjV43yk4ErTFz2wfMIQqlphOVA7MDwhAOSPbjg9F4sFwkzKqqkrGipW2z4KGvk2tfClPEEcOuYfxmfwX-xLtmtQlUTjXKpRLg96G58Afcr3oJOx5dWdk_u0uy6FK8nXfPZv_bvWBQI3w4HngXYO0DZB5_lpo',
    title: 'Xoş Xatirələr',
    description: 'Bir süfrə arxasında birlik',
  },
  {
    id: 'gal-7',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCllCdx3ur9wElZUyiWPWWrUw80UyHwM6D5D5y77eN25TXk281dM6DWTi-KmV3H6BY6kHtk6s4zMrPkARVobN7cux7s3N0mHsIEkMXxSgS_Ak2oPgDk0WvPlTpkyALuAIssHmN8DJZvs0NC3FHkHg5pwtGPwD0wD10X9EyYyZMlEGzbA8aDCiGuXokKLIU7BxlTQ3WrvqZUcmVrHUd6W160E6OSJ98H2zPXZJUsipo',
    title: 'Təbii Məhsullar',
    description: 'Yerli fermerlərdən təzə tədarük',
  },
  {
    id: 'gal-8',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlO0dS3F-Uux2wvNv7ZqA7ydRajgBi_odvfojErjQU2cbRZAj6904WQyYMMzJTZxlXPwLxYQvGKdoG8VIqki65tfIn2HseaWYEjqAfbpmrGTNLbQDB7zXXs3a4ktTPOXT9iTSW4XxGAHz7vnB_nKxYqXZBIGVGuVDrPWoJWuMMDxHgikOy5KNtWjiA0LW82lj0J52G4iHm4HKgHGQiv6I7fmdxoIL7ZMjlpVwy0-g',
    title: 'Şef İmzası',
    description: 'Pizza House xüsusi reseptləri',
  },
];

const DEFAULT_MENU_ITEMS = [
  {
    id: 'p-1',
    name: 'Margherita',
    price: 12,
    badge: null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9VzKu9XJYWTzbduzK9C2KfndAWmdqy4pwFwsJumiO3sjWGUbOHHWlUE-NN4C1I8dLOS3N4n7Sn_SAUXX7rT63spfnJQpWnWF4ewt3pBXamIUOVfLHktSR5rXthxRg8dti32jRzZFYWgwj8PE3qXTrna0vh6BozyaUiUeFcFYucyEC5NSn7sEKr9FrJ2c7U2b-dJjKKEPVyYa8yCqHbTLCSe91d6URpPmLSTHBPYI',
    description: 'Klassik pomidor sousu, təbii mozzarella, təzə reyhan və soyuq sıxım zeytun yağı.',
  },
  {
    id: 'p-2',
    name: 'Pepperoni',
    price: 15,
    badge: 'Ən çox satılan',
    badgeColor: '#914d00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCf3Uf30aiYnF-gfNaXyq9MNoSAoLC6IQIeArP--FFzAoGQ9N9uMkCKw2mhFMWlGP49VxXwSDjhU7Dlm21bZ2TM65TlG_AzgUEq_X2ujDiRpJZmuRwS8Hfn4UWL2kndQ8JuFGgpdqvmojNAIhvsUGe4Lgfay5KPPVd7S3a53QHhIYcGDLISE3BvwTWMWDbY9pBJuk3yuhH0O8QdK9GI__4Q1bOJV8FfuTryJtox60c',
    description: 'Hisə verilmiş acılı pepperoni, bol mozzarella pendiri və xüsusi tomat sousu.',
  },
  {
    id: 'p-3',
    name: 'Dörd Pendir',
    price: 17,
    badge: null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC6ZiIBSqD1fQa2Qyu6t7z-wSP1Cua-eBE81b1giGveSOFas421v35RqHvzX9ckwlQ99OSmwDL_q5DTg4T7AQXbQo0Xsxu98lSVRrKsot9jpYP4fx88sCfc_LxPl35DxjS-jUb5wsel_85SdbojAx8q66a_l-Gy2mrmsSEh4-SNFkX8Azi4SWwm-gh-7SYuOW6d9fNuT8DCAF2wXob3K7SRhNVZtbqCGnu-hxDQyVg',
    description: 'Mozzarella, gorgonzola, parmesan və dorblu pendirlərinin möhtəşəm harmoniyası.',
  },
  {
    id: 'p-4',
    name: 'Tavuklu BBQ',
    price: 16,
    badge: 'Ən çox satılan',
    badgeColor: '#914d00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBADMwtK5iT18BdtW6lk7Xw4lKDMLwFOAptPFvnPbsQT-g8txTC1H5OGgZvp4PTIcLBMc3dRxhsMnrOI0mGv-ZyK-79nGTirGi0zORgjW-RhYUl06LD3vv2EFq0T2sv6o6joYH2ZkHdq7EEsAHapCR-u71jbXgGbZPcpdrjLow4uHWVNXlFypcKfYxPlY0Z9pe-7oX2ewiIcutkUV7IKwq7aN3cAvuKNDQA3fsbd4s',
    description: 'Qızardılmış toyuq filesi, karamelizə olunmuş soğan, BBQ sousu və mozzarella.',
  },
  {
    id: 'p-5',
    name: 'Göbələkli',
    price: 14,
    badge: null,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOTABoeHVt8UagrvmnGWBTben88X_MdR5lX-Hpy2mqcAcKBiyq_C14Snz955ILxcdltE6EYj0j4O56q0jPeCsUo0Z084ctM2j2YFwzvXiWekx-JB1O0ct94n-J-s11oWa-QieDIBsmoWz3iJr3V9GG1o6fvcYaaua0mJ2uPdewDbgtle10p0ANSaErvlQLqVzzskq-cABvZ9GATNBRFyLs18H-uqtDOMpXUEK6_P0',
    description: 'Təzə şampinyon göbələkləri, sarımsaq yağı, dağ kəklikotu və mozzarella pendiri.',
  },
  {
    id: 'p-6',
    name: 'Pizza House Xüsusi',
    price: 19,
    badge: 'Şefin Seçimi',
    badgeColor: '#8f6a00',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAT8G3TV4FF7lGJCjyVu81aIDDz9rqwJYZtmJV_sNj5LECHxP4_YS1uBxn-Wf7im1FOYC4CMpEebv6YXG7R6FXgf_5d7QR0KkExs61Im-UQ_sKy6dGhuSmp2wFkbuxSgCsrz6wMAxPsldkAIGwyJfTrKyTLt5_ccByjneNSBLV3B9gDetLgK8_cwYuQLgdZI845O1JOgMKoP24RxTP3LDCs8pyArrC-X4Jhy03jNME',
    description: 'Dana basdırması, xüsusi sous, zeytun, çeri pomidor, parmesan və təravətli arugula.',
  },
];

interface PizzaHouseSiteProps {
  data: SiteData;
  theme: ThemeConfig;
  table?: string | null;
}

export default function PizzaHouseSite({ data, theme, table }: PizzaHouseSiteProps) {
  const { organization, whatsapp, socialLinks, workingHours, menuCategories, galleryItems } = data;
  const content = getResolvedSiteContent(data.siteContent, organization);
  const { isOrdersPaused, noticeMessage: offHoursNotice } = useWorkingHours({
    workingHours: data.workingHours,
    settings: data.workingHoursSettings,
  });

  // Fonts & styles
  const headingFont = theme.headingFont || 'Epilogue';
  const bodyFont = theme.bodyFont || 'Inter';
  const fontsUrl = getGoogleFontsUrl(theme);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Gallery Lightbox state
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; caption: string }>({
    open: false,
    src: '',
    caption: '',
  });

  // Menu active category
  const categoriesList = useMemo(() => {
    if (menuCategories && menuCategories.length > 0) {
      return menuCategories.map((c) => ({
        id: c.id,
        name: c.name,
        items: c.menuItems || [],
      }));
    }
    return [
      { id: 'pizzalar', name: 'Pizzalar', items: [] },
      { id: 'makaronlar', name: 'Makaronlar', items: [] },
      { id: 'salatlar', name: 'Salatlar', items: [] },
      { id: 'qelyanaltilar', name: 'Qəlyanaltılar', items: [] },
      { id: 'desertler', name: 'Desertlər', items: [] },
      { id: 'ickiler', name: 'İçkilər', items: [] },
    ];
  }, [menuCategories]);

  const [selectedCatId, setSelectedCatId] = useState<string>(categoriesList[0]?.id || 'pizzalar');

  // Active items to display
  const activeMenuItems = useMemo(() => {
    if (menuCategories && menuCategories.length > 0) {
      const found = menuCategories.find((c) => c.id === selectedCatId);
      if (found && found.menuItems && found.menuItems.length > 0) {
        return found.menuItems;
      }
    }
    return DEFAULT_MENU_ITEMS;
  }, [menuCategories, selectedCatId]);

  // Gallery items to display
  const effectiveGalleryItems = useMemo(() => {
    if (galleryItems && galleryItems.length > 0) {
      return galleryItems.map((g, idx) => ({
        id: g.id || `gal-item-${idx}`,
        url: g.url,
        title: g.title || 'Pizza House',
        description: g.description || 'Xüsusi qastronomik kadr',
      }));
    }
    return DEFAULT_GALLERY;
  }, [galleryItems]);

  // Cart & Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (itemName: string, priceStr: string) => {
    setCartCount((c) => c + 1);
    showToast(`${itemName} (${priceStr}) əlavə edildi!`);
  };

  // Reservation form state
  const [booking, setBooking] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '3-4 nəfər',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking.name || !booking.phone) return;
    setBookingLoading(true);

    try {
      await fetch(`/api/site/${organization.slug}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: booking.name.trim(),
          phone: booking.phone.trim(),
          subject: 'Masa Rezervasiyası',
          service: `${booking.guests}`,
          message: `Tarix: ${booking.date || 'Təyin edilməyib'} | Saat: ${booking.time || 'Təyin edilməyib'} | Qonaq sayı: ${booking.guests}${booking.notes ? ` | Qeyd: ${booking.notes}` : ''}`,
          metadata: {
            type: 'RESERVATION',
            date: booking.date,
            time: booking.time,
            guests: booking.guests,
            notes: booking.notes,
          },
        }),
      });

      // Send to WhatsApp if enabled
      if (whatsapp?.isEnabled && whatsapp.phoneNumber) {
        const msg = `🍕 Masa Rezervasiyası:\nAd: ${booking.name}\nTelefon: ${booking.phone}\nTarix: ${booking.date}\nSaat: ${booking.time}\nQonaq sayı: ${booking.guests}${booking.notes ? `\nQeyd: ${booking.notes}` : ''}`;
        const url = formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, msg);
        window.open(url, '_blank');
      }

      setBookingSuccess(true);
      setBooking({ name: '', phone: '', date: '', time: '', guests: '3-4 nəfər', notes: '' });
    } catch (err) {
      console.error('Reservation error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Scroll section spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'qalareya', 'menyu', 'haqqimizda', 'rezervasiya', 'elaqe'];
      const scrollPos = window.scrollY + 200;
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Social link helper
  const getSocialUrl = (platformName: string): string | null => {
    const found = socialLinks?.find(
      (s) => s.platform.toLowerCase() === platformName.toLowerCase() && s.url
    );
    return found ? found.url : null;
  };

  // Navigation Items
  const navItems = [
    { id: 'hero', label: 'Ana Səhifə' },
    { id: 'qalareya', label: 'Qalareya' },
    { id: 'menyu', label: 'Menyu' },
    { id: 'haqqimizda', label: 'Haqqımızda' },
    { id: 'rezervasiya', label: 'Rezervasiya' },
    { id: 'elaqe', label: 'Əlaqə' },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileDrawerOpen(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      className="pizza-house-root w-full min-h-screen text-[#1c1b1b] antialiased selection:bg-[#ffdad9] selection:text-[#410008]"
      style={{
        backgroundColor: theme.siteBgColor || '#fcf9f8',
        fontFamily: `"${bodyFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      }}
    >
      {/* Dynamic Google Fonts Header */}
      <link rel="stylesheet" href={fontsUrl} />
      <style>{`
        .font-display-hero {
          font-family: "${headingFont}", sans-serif;
          font-size: 56px;
          line-height: 64px;
          letter-spacing: -0.03em;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .font-display-hero {
            font-size: 38px;
            line-height: 44px;
            letter-spacing: -0.02em;
          }
        }
        .font-headline-xl {
          font-family: "${headingFont}", sans-serif;
          font-size: 40px;
          line-height: 48px;
          letter-spacing: -0.02em;
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .font-headline-xl {
            font-size: 30px;
            line-height: 36px;
            letter-spacing: -0.01em;
          }
        }
        .font-headline-lg {
          font-family: "${headingFont}", sans-serif;
          font-size: 28px;
          line-height: 34px;
          letter-spacing: -0.01em;
          font-weight: 700;
        }
        .font-headline-md {
          font-family: "${headingFont}", sans-serif;
          font-size: 22px;
          line-height: 28px;
          font-weight: 600;
        }
        .font-headline-sm {
          font-family: "${headingFont}", sans-serif;
          font-size: 18px;
          line-height: 24px;
          font-weight: 600;
        }
        .font-body-lg {
          font-family: "${bodyFont}", sans-serif;
          font-size: 18px;
          line-height: 28px;
        }
        .font-body-md {
          font-family: "${bodyFont}", sans-serif;
          font-size: 16px;
          line-height: 24px;
        }
        .font-body-sm {
          font-family: "${bodyFont}", sans-serif;
          font-size: 14px;
          line-height: 20px;
        }
        .font-label-lg {
          font-family: "${bodyFont}", sans-serif;
          font-size: 15px;
          line-height: 20px;
          letter-spacing: 0.01em;
          font-weight: 600;
        }
        .font-label-md {
          font-family: "${bodyFont}", sans-serif;
          font-size: 13px;
          line-height: 18px;
          letter-spacing: 0.02em;
          font-weight: 600;
        }
        .font-label-sm {
          font-family: "${bodyFont}", sans-serif;
          font-size: 11px;
          line-height: 14px;
          letter-spacing: 0.04em;
          font-weight: 700;
        }
      `}</style>

      {/* ========================================================
          HEADER / NAVBAR
          ======================================================== */}
      <header
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all"
        style={{
          backgroundColor: theme.navbarBgColor || 'rgba(252, 249, 248, 0.88)',
        }}
      >
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo & Name */}
          <a
            onClick={(e) => {
              e.preventDefault();
              scrollTo('hero');
            }}
            href="#hero"
            className="flex items-center gap-2 group cursor-pointer"
          >
            {organization.logo ? (
              <img
                src={organization.logo}
                alt={organization.name}
                className="h-9 w-auto object-contain rounded"
              />
            ) : (
              <img
                src={DEFAULT_LOGO}
                alt="Pizza House Logo"
                className="h-8 w-auto object-contain"
              />
            )}
            <span
              className="font-headline-sm text-headline-sm text-[#1c1b1b] tracking-tight group-hover:text-[#b20028] transition-colors"
              style={{ fontFamily: `"${headingFont}", sans-serif` }}
            >
              {organization.name || 'Pizza House'}
            </span>
          </a>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`transition-colors py-1 px-3 rounded-xl cursor-pointer ${
                    isActive
                      ? 'bg-[#d7263d] text-white font-bold'
                      : 'text-[#5b403f] hover:text-[#b20028] font-label-lg text-label-lg'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Table badge if accessed via QR / table query */}
            {table && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#2f1500] font-label-sm text-label-sm font-bold shadow-sm">
                <span>🍽️</span>
                <span>{table}</span>
              </span>
            )}

            {/* CTA Button */}
            <button
              onClick={() => scrollTo('rezervasiya')}
              className="hidden sm:inline-flex items-center justify-center bg-[#d7263d] hover:bg-[#b20028] text-white font-label-lg text-label-lg px-6 py-2.5 rounded-xl shadow-[0_4px_16px_-2px_rgba(26,26,26,0.05),0_2px_6px_-1px_rgba(215,38,61,0.03)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Rezervasiya et
            </button>

            {/* Cart Counter badge if items added */}
            {cartCount > 0 && (
              <button
                onClick={() => scrollTo('menyu')}
                className="relative w-8 h-8 rounded-full bg-[#d7263d] flex items-center justify-center text-white cursor-pointer"
                title={`${cartCount} sifariş var`}
              >
                <ShoppingBag size={17} />
                <span className="absolute -top-1 -right-1 bg-[#fc9430] text-[#663500] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              aria-label="Menyunu aç"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              className="lg:hidden flex items-center justify-center p-1 text-[#1c1b1b] hover:text-[#b20028] focus:outline-none cursor-pointer"
            >
              {mobileDrawerOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden bg-[#f6f3f2] px-6 py-6 shadow-lg border-t border-[#e5e2e1]">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`py-2 px-4 rounded-xl text-left cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#d7263d] text-white font-bold'
                        : 'text-[#5b403f] hover:text-[#b20028] font-label-lg text-label-lg'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2">
                <button
                  onClick={() => scrollTo('rezervasiya')}
                  className="w-full flex items-center justify-center bg-[#d7263d] hover:bg-[#b20028] text-white font-label-lg text-label-lg py-3 rounded-xl transition-all cursor-pointer"
                >
                  Rezervasiya et
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-[#fcf9f8]">
        <div className="flex flex-col w-full">
          {/* ========================================================
              1. HERO SECTION (Ana Səhifə)
              ======================================================== */}
          <section
            className="relative overflow-hidden bg-[#fcf9f8] py-10 lg:py-28 px-6 lg:px-12"
            id="hero"
          >
            {/* Culinary warm blur spots */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ffdcc3]/40 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#ffdad9]/40 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Copy & Actions */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-4">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffdcc3] text-[#2f1500] shadow-sm">
                  <span className="text-lg">🍕</span>
                  <span className="font-label-lg text-label-lg tracking-wide">
                    {theme.heroBadgeText || 'Odun sobasında hazırlanır'}
                  </span>
                </div>

                {/* H1 Heading */}
                <h1 className="font-display-hero text-display-hero text-[#1c1b1b] tracking-tight leading-tight">
                  {content.hero?.title || (
                    <>
                      Əsl Pizza Zövqü, <br />
                      <span className="text-[#d7263d]">Hər Dilimdə</span>
                    </>
                  )}
                </h1>

                {/* Subtext */}
                <p className="font-body-lg text-body-lg text-[#5b403f] max-w-xl leading-relaxed">
                  {content.hero?.subtitle ||
                    theme.heroSubheadline ||
                    'Təzə inqrediyentlər, əl ilə açılmış xəmir və isti ailə atmosferi. Pizza House-da hər qonaq xüsusidir və hər dilim sevgi ilə yoğrulur.'}
                </p>

                {/* Off-hours Banner if paused */}
                {isOrdersPaused && offHoursNotice && (
                  <div className="w-full max-w-lg mb-2">
                    <OffHoursNotice message={offHoursNotice} />
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-1 w-full sm:w-auto">
                  <button
                    onClick={() => scrollTo('menyu')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d7263d] hover:bg-[#b20028] text-white font-label-lg text-label-lg px-8 py-3.5 rounded-xl shadow-lg shadow-[#d7263d]/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>{theme.heroCta1 || 'Menyuya bax'}</span>
                    <UtensilsCrossed size={19} />
                  </button>

                  <button
                    onClick={() => scrollTo('rezervasiya')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f0eded] hover:bg-[#e5e2e1] text-[#1c1b1b] font-label-lg text-label-lg px-8 py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    <span>{theme.heroCta2 || 'Masa rezerv et'}</span>
                    <Calendar size={19} />
                  </button>
                </div>

                {/* 3 Stats Chips */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 w-full max-w-lg">
                  <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border border-[#f0eded]">
                    <div className="flex items-center gap-1 text-[#715300] font-bold mb-1">
                      <Star size={18} className="fill-[#fbbc0c] text-[#fbbc0c]" />
                      <span className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.heroStat1Value || '10+ il'}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat1Label || 'Təcrübə'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border border-[#f0eded]">
                    <div className="flex items-center gap-1 text-[#b20028] font-bold mb-1">
                      <Flame size={18} className="fill-[#b20028] text-[#b20028]" />
                      <span className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.heroStat2Value || '30+'}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat2Label || 'Pizza növü'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border border-[#f0eded]">
                    <div className="flex items-center gap-1 text-[#914d00] font-bold mb-1">
                      <Users size={18} className="text-[#914d00]" />
                      <span className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.heroStat3Value || '5000+'}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat3Label || 'Məmnun qonaq'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Pizza Showcase */}
              <div className="lg:col-span-6 relative flex justify-center items-center">
                {/* Ambient Glowing Disc */}
                <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#fc9430]/20 blur-2xl -z-10" />

                {/* Large Featured Pizza Image Container */}
                <div className="relative w-full max-w-md sm:max-w-lg aspect-square rounded-[2.5rem] p-3 bg-white shadow-2xl flex items-center justify-center border border-[#f0eded]">
                  <img
                    className="w-full h-full object-cover rounded-[2rem] shadow-inner"
                    alt={organization.name || 'Pizza House'}
                    src={theme.headerImageUrl || HERO_PIZZA_IMG}
                  />

                  {/* Floating Badge 1: Rating */}
                  <div
                    className="absolute -top-3 -left-3 sm:top-4 sm:-left-6 bg-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce border border-[#f0eded]"
                    style={{ animationDuration: '4s' }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#ffdea0] flex items-center justify-center text-[#261a00]">
                      <Star size={18} className="fill-[#261a00] text-[#261a00]" />
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm leading-tight text-[#1c1b1b]">
                        {theme.heroRatingScore || '4.9'}
                      </p>
                      <p className="font-label-sm text-label-sm text-[#5b403f]">
                        {theme.heroRatingLabel || 'Reytinq (2.4k+)'}
                      </p>
                    </div>
                  </div>

                  {/* Floating Badge 2: 100% Mozzarella */}
                  <div className="absolute -bottom-4 -left-2 sm:bottom-6 sm:-left-4 bg-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#f0eded]">
                    <div className="w-8 h-8 rounded-xl bg-[#ffdad9] flex items-center justify-center text-[#b20028]">
                      <Flame size={18} className="fill-[#b20028] text-[#b20028]" />
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm leading-tight text-[#1c1b1b]">
                        {theme.heroBadgeFeature1 || '100% Təbii'}
                      </p>
                      <p className="font-label-sm text-label-sm text-[#5b403f]">
                        {theme.heroBadgeFeature1Desc || 'Pendir & Xəmir'}
                      </p>
                    </div>
                  </div>

                  {/* Floating Badge 3: Fast baking */}
                  <div className="absolute -top-3 -right-2 sm:top-10 sm:-right-6 bg-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#f0eded]">
                    <div className="w-8 h-8 rounded-xl bg-[#ffdcc3] flex items-center justify-center text-[#914d00]">
                      <Clock size={18} className="text-[#914d00]" />
                    </div>
                    <div>
                      <p className="font-headline-sm text-headline-sm leading-tight text-[#1c1b1b]">
                        {theme.heroBadgeFeature2 || '15 Dəqiqəyə'}
                      </p>
                      <p className="font-label-sm text-label-sm text-[#5b403f]">
                        {theme.heroBadgeFeature2Desc || 'Süfrənizdə hazır'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              2. QALAREYA SECTION
              ======================================================== */}
          <section className="py-16 lg:py-24 px-6 lg:px-12 bg-[#fcf9f8]" id="qalareya">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              {/* Section Header */}
              <div className="text-center max-w-xl mb-12 flex flex-col items-center">
                <span className="px-4 py-1.5 rounded-full bg-[#ffdcc3] text-[#2f1500] font-label-md text-label-md uppercase tracking-wider mb-3">
                  {theme.galleryBadgeText || 'Foto Qalareya'}
                </span>
                <h2 className="font-headline-xl text-headline-xl text-[#1c1b1b] tracking-tight">
                  {content.gallery?.title || theme.galleryHeadline || 'Dadlı Anlarımızdan Kadrlar'}
                </h2>
                <p className="font-body-md text-body-md text-[#5b403f] mt-2">
                  {content.gallery?.subtitle ||
                    theme.gallerySubtitle ||
                    'Odun sobasının hərarəti, təzə xəmir sənəti və restoranımızın unikal abu-havası.'}
                </p>
              </div>

              {/* 8-item Interactive Gallery Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {effectiveGalleryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setLightbox({
                        open: true,
                        src: item.url,
                        caption: item.title || 'Pizza House',
                      })
                    }
                    className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer bg-[#eae7e7] shadow-md"
                  >
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={item.url}
                      alt={item.title || 'Foto'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b]/80 via-[#1c1b1b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                      <ZoomIn size={28} className="mb-1 text-[#fbbc0c]" />
                      <p className="font-headline-sm text-headline-sm text-white">{item.title}</p>
                      {item.description && (
                        <p className="font-label-sm text-label-sm text-[#e5e2e1]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Lightbox Modal */}
          {lightbox.open && (
            <div
              className="fixed inset-0 z-50 bg-[#313030]/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setLightbox({ open: false, src: '', caption: '' })}
            >
              <div
                className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label="Bağla"
                  onClick={() => setLightbox({ open: false, src: '', caption: '' })}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#1c1b1b]/60 hover:bg-[#1c1b1b] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={22} />
                </button>
                <div className="w-full h-96 sm:h-[480px] bg-[#1c1b1b] flex items-center justify-center">
                  <img
                    alt={lightbox.caption}
                    className="w-full h-full object-cover"
                    src={lightbox.src}
                  />
                </div>
                <div className="p-6 bg-white flex items-center justify-between">
                  <h4 className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                    {lightbox.caption}
                  </h4>
                  <span className="px-3 py-1 bg-[#ffdcc3] text-[#2f1500] rounded-full font-label-sm text-label-sm font-bold">
                    {organization.name || 'Pizza House'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              3. MENYU SECTION
              ======================================================== */}
          <section className="py-16 lg:py-24 px-6 lg:px-12 bg-[#fcf9f8]" id="menyu">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              {/* Section Header */}
              <div className="text-center max-w-xl mb-10 flex flex-col items-center">
                <span className="px-4 py-1.5 rounded-full bg-[#ffdad9] text-[#b20028] font-label-md text-label-md uppercase tracking-wider mb-3">
                  {theme.menuBadgeText || 'Zərif Dadlar'}
                </span>
                <h2 className="font-headline-xl text-headline-xl text-[#1c1b1b] tracking-tight">
                  {content.menu?.title || theme.menuHeadline || 'Menyumuz'}
                </h2>
                <p className="font-body-md text-body-md text-[#5b403f] mt-2">
                  {content.menu?.subtitle ||
                    theme.menuSubtitle ||
                    'Hər zövqə uyğun seçimlər: ənənəvi İtalyan reseptləri və müasir çalarla hazırlanmış təamlar.'}
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-4 mb-10 no-scrollbar">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`px-6 py-2.5 rounded-full font-label-lg text-label-lg transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#d7263d] text-white shadow-md'
                          : 'bg-[#e5e2e1] text-[#1c1b1b] hover:bg-[#dcd9d9]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* 3-Column Menu Grid */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeMenuItems.map((item: any) => {
                  const priceFormatted =
                    typeof item.price === 'number'
                      ? formatPrice(item.price, organization.currency || 'AZN')
                      : `${item.price} ₼`;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border border-[#f0eded]"
                    >
                      <div>
                        {/* Image Container with Badges */}
                        <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-5 bg-[#eae7e7]">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={item.image || HERO_PIZZA_IMG}
                            alt={item.name}
                          />
                          {(item.badge || item.isPopular || item.isFeatured) && (
                            <span
                              className="absolute top-3 left-3 px-3 py-1 rounded-full font-label-sm text-label-sm font-bold shadow-md text-white"
                              style={{
                                backgroundColor:
                                  item.badgeColor ||
                                  (item.isPopular ? '#914d00' : '#8f6a00'),
                              }}
                            >
                              {item.badge || (item.isPopular ? 'Ən çox satılan' : 'Şefin Seçimi')}
                            </span>
                          )}
                        </div>

                        {/* Title & Price */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-headline-md text-headline-md text-[#1c1b1b]">
                            {item.name}
                          </h3>
                          <span className="inline-block px-3 py-1 rounded-full bg-[#ffdea0] text-[#261a00] font-headline-sm text-headline-sm font-bold shrink-0">
                            {priceFormatted}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="font-body-sm text-body-sm text-[#5b403f] mb-6 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Add to Order Button */}
                      <button
                        onClick={() => handleAddToCart(item.name, priceFormatted)}
                        disabled={isOrdersPaused}
                        className={`w-full py-3 px-4 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                          isOrdersPaused
                            ? 'bg-[#e5e2e1] text-[#5b403f] cursor-not-allowed'
                            : 'bg-[#d7263d] hover:bg-[#b20028] text-white hover:-translate-y-0.5'
                        }`}
                      >
                        <span className="text-lg font-bold">+</span>
                        <span>{isOrdersPaused ? 'Sifariş bağlıdır' : 'Əlavə et'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Toast Feedback */}
              {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#313030] text-[#f3f0ef] px-6 py-3 rounded-full font-label-lg text-label-lg shadow-2xl flex items-center gap-2 z-50 animate-fade-in border border-white/10">
                  <CheckCircle size={20} className="text-[#fbbc0c]" />
                  <span>{toastMessage}</span>
                </div>
              )}
            </div>
          </section>

          {/* ========================================================
              4. HAQQIMIZDA SECTION
              ======================================================== */}
          <section className="py-16 lg:py-24 px-6 lg:px-12 bg-[#fcf9f8]" id="haqqimizda">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Visual Artisan Collage */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
                <div className="flex flex-col gap-4">
                  <div className="h-64 sm:h-72 rounded-3xl overflow-hidden bg-[#eae7e7] shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      src={theme.aboutImageUrl || ABOUT_COLLAGE_1}
                      alt="Usta xəmir açılışı"
                    />
                  </div>
                  <div className="h-44 sm:h-52 rounded-3xl overflow-hidden bg-[#eae7e7] shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      src={ABOUT_COLLAGE_2}
                      alt="Odun sobası"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-8">
                  <div className="h-44 sm:h-52 rounded-3xl overflow-hidden bg-[#eae7e7] shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      src={ABOUT_COLLAGE_3}
                      alt="Təbii inqrediyentlər"
                    />
                  </div>
                  <div className="h-64 sm:h-72 rounded-3xl overflow-hidden bg-[#eae7e7] shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      src={ABOUT_COLLAGE_4}
                      alt="Peşəkar şef"
                    />
                  </div>
                </div>

                {/* Decorative Center Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#d7263d] text-white flex flex-col items-center justify-center p-2 text-center shadow-xl border-4 border-white">
                  <span className="font-headline-sm text-headline-sm leading-none font-bold">
                    {theme.aboutEstablishedYear || '2014'}
                  </span>
                  <span className="font-label-sm text-label-sm mt-1">
                    {theme.aboutEstablishedText || 'İldən bəri sevgiylə'}
                  </span>
                </div>
              </div>

              {/* Right Column: Story & Features */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-6">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ffdcc3] text-[#2f1500] font-label-md text-label-md uppercase tracking-wider">
                  <span>{theme.aboutBadgeText || 'Tariximiz və Dəyərlərimiz'}</span>
                </div>

                <h2 className="font-headline-xl text-headline-xl text-[#1c1b1b] tracking-tight">
                  {content.about?.title || theme.aboutHeadline || 'Bizim Hekayəmiz'}
                </h2>

                <p className="font-body-lg text-body-lg text-[#5b403f] leading-relaxed">
                  {content.about?.body ||
                    theme.aboutBody1 ||
                    'Pizza House ailə ocağının istiliyini italyan dadı ilə birləşdirir. Hər gün təzə xəmir yoğurur, yerli və keyfiyyətli məhsullardan istifadə edirik ki, hər dilim sizə ev rahatlığı hiss etdirsin. Bakının mərkəzində əsl Neapolitan ləzzətini süfrənizə daşıyırıq.'}
                </p>

                {/* 3 Feature Cards */}
                <div className="w-full flex flex-col gap-4 pt-2">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-[#f0eded]">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdcc3] flex items-center justify-center text-[#914d00] shrink-0">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.aboutFeature1Title || 'Təzə inqrediyentlər'}
                      </h4>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        {theme.aboutFeature1Desc ||
                          'Hər gün seçilmiş təbii tərəvəzlər və xalis pendir növləri.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-[#f0eded]">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdad9] flex items-center justify-center text-[#b20028] shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.aboutFeature2Title || 'Sürətli xidmət'}
                      </h4>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        {theme.aboutFeature2Desc ||
                          'Sifarişiniz isti və xırçıltılı şəkildə masanıza operativ çatdırılır.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-[#f0eded]">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdea0] flex items-center justify-center text-[#715300] shrink-0">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.aboutFeature3Title || 'Rahat atmosfer'}
                      </h4>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        {theme.aboutFeature3Desc ||
                          'Ailəniz və dostlarınızla xoş xatirələr yaratmaq üçün isti və səmimi məkan.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              5. REZERVASİYA SECTION
              ======================================================== */}
          <section
            className="py-16 lg:py-24 px-6 lg:px-12 bg-[#1c1b1b] text-[#f3f0ef] relative overflow-hidden"
            id="rezervasiya"
          >
            {/* Atmospheric Ambient Glows */}
            <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-[#b20028]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-[#fc9430]/20 blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
              {/* Elevated Form Card */}
              <div className="bg-[#313030] rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/5">
                <div className="text-center max-w-lg mx-auto mb-10">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ffdad9]/20 text-[#ffb3b2] font-label-md text-label-md uppercase tracking-wider mb-3">
                    <Calendar size={16} />
                    <span>{theme.reservationBadgeText || 'Online Qeydiyyat'}</span>
                  </div>
                  <h2 className="font-headline-xl text-headline-xl text-white tracking-tight">
                    {content.reservation?.title ||
                      theme.reservationHeadline ||
                      'Masanı İndi Rezerv Et'}
                  </h2>
                  <p className="font-body-md text-body-md text-[#dcd9d9] mt-2">
                    {content.reservation?.subtitle ||
                      theme.reservationSubtitle ||
                      'Bir neçə saniyəyə yerinizi təmin edin, ləzzətli axşamdan zövq alın.'}
                  </p>
                </div>

                {!bookingSuccess ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Ad və Soyad */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Ad və soyad *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={booking.name}
                            onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                            placeholder="Məs: Elvin Məmmədov"
                            className="w-full bg-[#1c1b1b] text-[#f3f0ef] px-4 py-3.5 rounded-xl placeholder:text-[#dcd9d9]/60 focus:outline-none focus:ring-2 focus:ring-[#b20028] font-body-md text-body-md border border-white/10"
                          />
                        </div>
                      </div>

                      {/* Telefon Nömrəsi */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Telefon nömrəsi *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={booking.phone}
                            onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                            placeholder="+994 50 123 45 67"
                            className="w-full bg-[#1c1b1b] text-[#f3f0ef] px-4 py-3.5 rounded-xl placeholder:text-[#dcd9d9]/60 focus:outline-none focus:ring-2 focus:ring-[#b20028] font-body-md text-body-md border border-white/10"
                          />
                        </div>
                      </div>

                      {/* Tarix */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Tarix *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={booking.date}
                            onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                            className="w-full bg-[#1c1b1b] text-[#f3f0ef] px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b20028] font-body-md text-body-md border border-white/10"
                          />
                        </div>
                      </div>

                      {/* Saat */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Saat *
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={booking.time}
                            onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                            className="w-full bg-[#1c1b1b] text-[#f3f0ef] px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b20028] font-body-md text-body-md appearance-none border border-white/10"
                          >
                            <option disabled value="">
                              Saat seçin
                            </option>
                            <option value="12:00">12:00 - Günorta</option>
                            <option value="13:30">13:30</option>
                            <option value="15:00">15:00</option>
                            <option value="18:00">18:00 - Axşam</option>
                            <option value="19:30">19:30</option>
                            <option value="21:00">21:00</option>
                            <option value="22:00">22:00</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Nəfər Sayı */}
                    <div className="flex flex-col space-y-2">
                      <label className="font-label-md text-label-md text-[#dcd9d9]">
                        Nəfər sayı *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={booking.guests}
                          onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                          className="w-full bg-[#1c1b1b] text-[#f3f0ef] px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#b20028] font-body-md text-body-md appearance-none border border-white/10"
                        >
                          <option value="2 nəfər">2 nəfər (Romantik masa)</option>
                          <option value="3-4 nəfər">3-4 nəfər (Ailəvi masa)</option>
                          <option value="5-6 nəfər">5-6 nəfər (Dost masası)</option>
                          <option value="7+ nəfər">7+ nəfər (Böyük qrup / Ad günü)</option>
                        </select>
                      </div>
                    </div>

                    {/* Əlavə Qeyd */}
                    <div className="flex flex-col space-y-2">
                      <label className="font-label-md text-label-md text-[#dcd9d9]">
                        Əlavə qeyd
                      </label>
                      <textarea
                        rows={3}
                        value={booking.notes}
                        onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                        placeholder="Xüsusi istək və ya pəhriz tələbləriniz varsa qeyd edin..."
                        className="w-full bg-[#1c1b1b] text-[#f3f0ef] px-4 py-3.5 rounded-xl placeholder:text-[#dcd9d9]/60 focus:outline-none focus:ring-2 focus:ring-[#b20028] font-body-md text-body-md border border-white/10 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-4 rounded-xl bg-[#d7263d] hover:bg-[#b20028] text-white font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#d7263d]/30 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                    >
                      <Calendar size={22} />
                      <span>
                        {bookingLoading ? 'Göndərilir...' : 'Rezervasiyanı təsdiqlə'}
                      </span>
                    </button>
                  </form>
                ) : (
                  /* Success Confirmation State */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[#ffdea0] text-[#261a00] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={36} />
                    </div>
                    <h3 className="font-headline-md text-headline-md text-white mb-2">
                      Rezervasiyanız qəbul edildi!
                    </h3>
                    <p className="font-body-md text-body-md text-[#dcd9d9] max-w-md mx-auto">
                      Tezliklə menecerimiz sizinlə əlaqə saxlayaraq masanızı təsdiq edəcək. Sizi
                      görməyə şad olarıq!
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookingSuccess(false)}
                      className="mt-6 px-6 py-2.5 rounded-xl bg-[#e5e2e1]/20 hover:bg-[#e5e2e1]/40 text-white font-label-md text-label-md transition-all cursor-pointer"
                    >
                      Yeni rezervasiya et
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ========================================================
              6. ƏLAQƏ SECTION
              ======================================================== */}
          <section className="py-16 lg:py-24 px-6 lg:px-12 bg-[#fcf9f8]" id="elaqe">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: 4 Contact Cards & Socials */}
              <div className="lg:col-span-6 flex flex-col space-y-6">
                <div>
                  <span className="px-4 py-1.5 rounded-full bg-[#ffdcc3] text-[#2f1500] font-label-md text-label-md uppercase tracking-wider">
                    {theme.contactBadgeText || 'Ünvan & Əlaqə'}
                  </span>
                  <h2 className="font-headline-xl text-headline-xl text-[#1c1b1b] tracking-tight mt-3">
                    {content.contact?.title || theme.contactHeadline || 'Bizimlə Əlaqə'}
                  </h2>
                  <p className="font-body-md text-body-md text-[#5b403f] mt-1">
                    {content.contact?.subtitle ||
                      theme.contactSubtitle ||
                      'Sualınız var və ya sifariş vermək istəyirsiniz? Hər zaman xidmətinizdəyik.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ünvan */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdad9] text-[#b20028] flex items-center justify-center mb-3">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        Ünvan
                      </p>
                      <p className="font-headline-sm text-headline-sm text-[#1c1b1b] mt-1 leading-snug">
                        {organization.address || 'Bakı şəhəri, Nizami küçəsi 45'}
                      </p>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        {organization.city || 'Fəvvarələr meydanı yaxınlığı'}
                      </p>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] text-[#914d00] flex items-center justify-center mb-3">
                      <Phone size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        Telefon
                      </p>
                      <a
                        className="block font-headline-sm text-headline-sm text-[#1c1b1b] hover:text-[#b20028] transition-colors mt-1"
                        href={`tel:${organization.phone || '+994125980000'}`}
                      >
                        {organization.phone || '+994 12 598 00 00'}
                      </a>
                      {whatsapp?.phoneNumber && (
                        <a
                          className="block font-body-sm text-body-sm text-[#5b403f] hover:text-[#b20028] transition-colors"
                          href={`tel:+${whatsapp.countryCode}${whatsapp.phoneNumber}`}
                        >
                          +{whatsapp.countryCode} {whatsapp.phoneNumber}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* E-poçt */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdea0] text-[#715300] flex items-center justify-center mb-3">
                      <Mail size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        E-poçt
                      </p>
                      <a
                        className="block font-headline-sm text-headline-sm text-[#1c1b1b] hover:text-[#b20028] transition-colors mt-1"
                        href={`mailto:${organization.email || 'info@pizzahouse.az'}`}
                      >
                        {organization.email || 'info@pizzahouse.az'}
                      </a>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        Dərhal cavablandırılır
                      </p>
                    </div>
                  </div>

                  {/* İş saatları */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdad9] text-[#b20028] flex items-center justify-center mb-3">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        İş saatları
                      </p>
                      <p className="font-headline-sm text-headline-sm text-[#1c1b1b] mt-1">
                        Hər gün
                      </p>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        {workingHours && workingHours.length > 0 && workingHours[0].openTime
                          ? `${workingHours[0].openTime} – ${workingHours[0].closeTime}`
                          : '10:00 – 23:00 fasiləsiz'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media Badges */}
                <div className="pt-2">
                  <p className="font-label-md text-label-md text-[#5b403f] mb-3">
                    Sosial şəbəkələrdə bizi izləyin:
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Instagram */}
                    <a
                      className="w-12 h-12 rounded-2xl bg-white hover:bg-[#d7263d] text-[#1c1b1b] hover:text-white flex items-center justify-center shadow-sm transition-all border border-[#f0eded]"
                      href={getSocialUrl('instagram') || 'https://instagram.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <Instagram size={22} />
                    </a>

                    {/* Facebook */}
                    <a
                      className="w-12 h-12 rounded-2xl bg-white hover:bg-[#d7263d] text-[#1c1b1b] hover:text-white flex items-center justify-center shadow-sm transition-all border border-[#f0eded]"
                      href={getSocialUrl('facebook') || 'https://facebook.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <Facebook size={22} />
                    </a>

                    {/* WhatsApp */}
                    {whatsapp?.phoneNumber ? (
                      <a
                        className="w-12 h-12 rounded-2xl bg-white hover:bg-[#25D366] text-[#1c1b1b] hover:text-white flex items-center justify-center shadow-sm transition-all border border-[#f0eded]"
                        href={formatWhatsAppUrl(
                          whatsapp.countryCode,
                          whatsapp.phoneNumber,
                          whatsapp.orderMessage || 'Salam, menyu haqqında məlumat almaq istəyirəm.'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle size={22} />
                      </a>
                    ) : (
                      <a
                        className="w-12 h-12 rounded-2xl bg-white hover:bg-[#25D366] text-[#1c1b1b] hover:text-white flex items-center justify-center shadow-sm transition-all border border-[#f0eded]"
                        href={getSocialUrl('whatsapp') || 'https://whatsapp.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp"
                      >
                        <MessageCircle size={22} />
                      </a>
                    )}

                    {/* TikTok / External */}
                    <a
                      className="w-12 h-12 rounded-2xl bg-white hover:bg-[#d7263d] text-[#1c1b1b] hover:text-white flex items-center justify-center shadow-sm transition-all border border-[#f0eded]"
                      href={getSocialUrl('tiktok') || 'https://tiktok.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                    >
                      <Send size={20} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Map Preview Card */}
              <div className="lg:col-span-6 flex flex-col">
                <div className="bg-white rounded-3xl p-4 shadow-xl overflow-hidden relative border border-[#f0eded]">
                  {/* Map Component */}
                  <div className="w-full h-80 rounded-2xl bg-[#eae7e7] relative overflow-hidden">
                    {organization.mapEmbedUrl ? (
                      <iframe
                        src={organization.mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Xəritə"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${MAP_BG_IMG}')` }}
                      >
                        {/* Pin Marker */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-[#d7263d] text-white flex items-center justify-center shadow-xl animate-bounce">
                            <span className="text-xl">🍕</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#1c1b1b] text-white font-label-sm text-label-sm mt-1 shadow whitespace-nowrap">
                            {organization.name || 'Pizza House'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Card Inside Map */}
                  <div className="mt-4 p-4 rounded-2xl bg-[#f0eded] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#eae7e7]">
                        <img
                          className="w-full h-full object-cover"
                          src={MAP_STORE_THUMB}
                          alt={organization.name || 'Pizza House Baku'}
                        />
                      </div>
                      <div>
                        <p className="font-headline-sm text-headline-sm text-[#1c1b1b] leading-tight">
                          {organization.name || 'Pizza House Baku'}
                        </p>
                        <p className="font-body-sm text-body-sm text-[#5b403f]">
                          {organization.address || 'Nizami küçəsi 45, Bakı'}
                        </p>
                      </div>
                    </div>

                    <a
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#d7263d] hover:bg-[#b20028] text-white font-label-md text-label-md transition-all shadow-sm"
                      href={
                        organization.mapUrl ||
                        `https://maps.google.com/?q=${encodeURIComponent(
                          organization.address || 'Nizami street 45, Baku, Azerbaijan'
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation size={17} />
                      <span>Xəritədə aç</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FLOATING ACTION: Bottom Right WhatsApp Pill with Pulse */}
          {whatsapp?.phoneNumber && (
            <aside aria-label="Sürətli Əlaqə" className="fixed bottom-6 right-6 z-40">
              <a
                className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#d7263d] text-white shadow-2xl hover:scale-110 transition-transform"
                href={formatWhatsAppUrl(
                  whatsapp.countryCode,
                  whatsapp.phoneNumber,
                  whatsapp.orderMessage || 'Salam! Masa rezerv etmək və ya sifariş vermək istəyirəm.'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Pulsing ring effect */}
                <span className="absolute inset-0 rounded-full bg-[#d7263d] opacity-75 animate-ping" />
                <MessageCircle size={28} className="relative z-10" />

                {/* Hover Tooltip */}
                <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#1c1b1b] text-white font-label-sm text-label-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
                  Bizə yazın (WhatsApp)
                </span>
              </a>
            </aside>
          )}
        </div>
      </main>

      {/* ========================================================
          FOOTER
          ======================================================== */}
      <footer className="w-full bg-[#313030] text-[#f3f0ef] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            {/* Col 1: Brand & Slogan */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt={organization.name}
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                ) : (
                  <img
                    src={DEFAULT_LOGO}
                    alt="Logo"
                    className="h-8 w-auto object-contain brightness-0 invert"
                  />
                )}
                <span className="font-headline-sm text-headline-sm text-white font-bold tracking-tight">
                  {organization.name || 'Pizza House'}
                </span>
              </div>
              <p className="font-body-md text-body-md text-[#dcd9d9] italic">
                {theme.footerSlogan || 'Hər dilimdə sevgi'}
              </p>
              <p className="font-body-sm text-body-sm text-[#dcd9d9] leading-relaxed">
                {theme.footerDescription ||
                  'Odun sobasında xüsusi reseptlə bişirilən Neapolitan pizzaları və zərif qəhvə ənənəsi.'}
              </p>
            </div>

            {/* Col 2: Nav links */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-headline-sm text-white">Naviqasiya</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollTo('hero')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Ana Səhifə
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('menyu')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Menyu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('qalareya')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Qalareya
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('haqqimizda')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Haqqımızda
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Services */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-headline-sm text-white">Xidmətlər</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollTo('rezervasiya')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Masa Rezervasiyası
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('elaqe')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Əlaqə və Ünvan
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('menyu')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Çatdırılma Xidməti
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo('haqqimizda')}
                    className="font-body-sm text-body-sm text-[#dcd9d9] hover:text-white transition-colors cursor-pointer"
                  >
                    Özəl Tədbirlər
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Follow Us */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-headline-sm text-white">Bizi İzləyin</h3>
              <p className="font-body-sm text-body-sm text-[#dcd9d9]">
                Yeniliklərdən və kampaniyalardan xəbərdar olmaq üçün sosial şəbəkələrdə izləyin:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#d7263d] text-white flex items-center justify-center transition-all"
                  href={getSocialUrl('instagram') || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={19} />
                </a>
                <a
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#d7263d] text-white flex items-center justify-center transition-all"
                  href={getSocialUrl('facebook') || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={19} />
                </a>
                <a
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-all"
                  href={
                    whatsapp?.phoneNumber
                      ? formatWhatsAppUrl(whatsapp.countryCode, whatsapp.phoneNumber, 'Salam!')
                      : getSocialUrl('whatsapp') || 'https://whatsapp.com'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={19} />
                </a>
                <a
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#d7263d] text-white flex items-center justify-center transition-all"
                  href={getSocialUrl('tiktok') || 'https://tiktok.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body-sm text-body-sm text-[#dcd9d9] text-center sm:text-left">
              {theme.footerCopyrightText || `© ${currentYear} Pizza House. Bütün hüquqlar qorunur.`}
            </p>
            <div className="flex items-center gap-4 text-[#dcd9d9] font-body-sm text-body-sm">
              <span className="text-xs text-white/50">
                {theme.footerPlatformText || 'Sayt SiteX platforması ilə yaradılıb'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

