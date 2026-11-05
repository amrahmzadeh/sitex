import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RestaurantSite from '@/components/themes/RestaurantSite';
import { SplashConfig } from '@/components/themes/SplashScreen';
import { prisma } from '@/lib/db';
import { resolveGoogleMapsEmbedUrl } from '@/lib/maps';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SiteData {
  organization: {
    name: string; slug: string; logo?: string; description?: string;
    phone?: string; email?: string; address?: string; city?: string; mapUrl?: string; mapEmbedUrl?: string; currency: string;
  };
  website: {
    theme: Record<string, unknown>; pages: unknown; seoTitle?: string; seoDescription?: string; ogImage?: string;
    splashEnabled?: boolean; splashConfig?: SplashConfig;
  };
  whatsapp?: {
    countryCode: string; phoneNumber: string; orderMessage: string; buttonText: string; isEnabled: boolean;
  };
  socialLinks: Array<{ platform: string; url: string }>;
  socialFeedPosts?: Array<{
    id: string;
    platform: string;
    postUrl: string;
    thumbnailUrl?: string | null;
    caption?: string | null;
    authorName?: string | null;
    authorHandle?: string | null;
    authorAvatar?: string | null;
    likes: number;
    comments: number;
    isVideo: boolean;
    sortOrder: number;
    isVisible: boolean;
  }>;
  galleryItems?: Array<{
    id: string;
    url: string;
    title?: string | null;
    description?: string | null;
    sortOrder: number;
    isVisible: boolean;
  }>;
  packages?: Array<{
    id: string;
    name: string;
    title?: string | null;
    description?: string | null;
    fullDescription?: string | null;
    price?: number | null;
    discountPrice?: number | null;
    image?: string | null;
    features: string[];
    tag?: string | null;
    badgeText?: string | null;
    isActive: boolean;
    sortOrder: number;
  }>;
  moduleSettings?: {
    menu?: boolean;
    packages?: boolean;
    gallery?: boolean;
    contact?: boolean;
  };
  workingHours: Array<{ dayOfWeek: number; openTime?: string; closeTime?: string; isClosed: boolean }>;
  menuCategories: Array<{
    id: string; name: string; slug: string; isVisible: boolean;
    menuItems: Array<{
      id: string; name: string; slug: string; description?: string; price: number; discountPrice?: number;
      image?: string; video?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
      ingredients?: string; allergens?: string; portionSize?: string; prepTime?: string;
    }>;
  }>;
}

const getSiteData = cache(async (slug: string): Promise<SiteData | null> => {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        website: true,
        whatsappSettings: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        socialFeedPosts: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
        galleryItems: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        menuCategories: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' },
              include: { images: { orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });

    if (!org || !org.website?.isPublished) return null;

    const mapEmbedUrl = await resolveGoogleMapsEmbedUrl(
      org.mapUrl,
      org.address,
      org.city,
      org.name
    );

    return {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo || undefined,
        description: org.description || undefined,
        phone: org.phone || undefined,
        email: org.email || undefined,
        address: org.address || undefined,
        city: org.city || undefined,
        mapUrl: org.mapUrl || undefined,
        mapEmbedUrl: mapEmbedUrl || undefined,
        currency: org.currency,
        siteCategory: org.siteCategory || undefined,
        siteSubcategory: org.siteSubcategory || undefined,
      },
      website: {
        theme: (org.website.publishedTheme as Record<string, unknown>) || {},
        pages: org.website.publishedPages,
        pagesConfig: org.website.pagesConfig,
        draftTheme: org.website.draftTheme,
        publishedTheme: org.website.publishedTheme,
        seoTitle: org.website.seoTitle || undefined,
        seoDescription: org.website.seoDescription || undefined,
        ogImage: org.website.ogImage || undefined,
        splashEnabled: org.website.splashEnabled,
        splashConfig: (org.website.splashConfig as SplashConfig) || undefined,
      },
      whatsapp: org.whatsappSettings || undefined,
      socialLinks: org.socialLinks || [],
      socialFeedPosts: org.socialFeedPosts || [],
      galleryItems: org.galleryItems || [],
      packages: org.packages || [],
      moduleSettings: (org.website.moduleSettings as Record<string, boolean>) || {},
      workingHours: org.workingHours || [],
      menuCategories: org.menuCategories || [],
    } as unknown as SiteData;
  } catch (e) {
    console.error('getSiteData error:', e);
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSiteData(slug);
  if (!data) return { title: 'Sayt tapılmadı' };

  return {
    title: data.website.seoTitle || data.organization.name,
    description: data.website.seoDescription || data.organization.description || `${data.organization.name} - menyu və sifariş`,
    openGraph: {
      title: data.website.seoTitle || data.organization.name,
      description: data.website.seoDescription || data.organization.description || '',
      images: data.website.ogImage ? [data.website.ogImage] : [],
    },
  };
}

export default async function SitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ table?: string; masa?: string; [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const rawTable = (typeof sp.table === 'string' ? sp.table : typeof sp.masa === 'string' ? sp.masa : undefined)?.trim();
  const initialTable = rawTable
    ? (rawTable.toLowerCase().startsWith('masa') ? rawTable : `Masa ${rawTable}`)
    : undefined;

  const data = await getSiteData(slug);
  if (!data) notFound();

  return <RestaurantSite data={data} initialTable={initialTable} />;
}
