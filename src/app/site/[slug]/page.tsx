import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RestaurantSite from '@/components/themes/RestaurantSite';
import { SplashConfig } from '@/components/themes/SplashScreen';

interface SiteData {
  organization: {
    name: string; slug: string; logo?: string; description?: string;
    phone?: string; email?: string; address?: string; city?: string; mapUrl?: string; currency: string;
  };
  website: {
    theme: Record<string, unknown>; pages: unknown; seoTitle?: string; seoDescription?: string; ogImage?: string;
    splashEnabled?: boolean; splashConfig?: SplashConfig;
  };
  whatsapp?: {
    countryCode: string; phoneNumber: string; orderMessage: string; buttonText: string; isEnabled: boolean;
  };
  socialLinks: Array<{ platform: string; url: string }>;
  workingHours: Array<{ dayOfWeek: number; openTime?: string; closeTime?: string; isClosed: boolean }>;
  menuCategories: Array<{
    id: string; name: string; slug: string; isVisible: boolean;
    menuItems: Array<{
      id: string; name: string; slug: string; description?: string; price: number; discountPrice?: number;
      image?: string; video?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
      ingredients?: string; allergens?: string; portionSize?: string;
    }>;
  }>;
}

async function getSiteData(slug: string): Promise<SiteData | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/site/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

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

  const splashEnabled = Boolean(data.website?.splashEnabled && data.website?.splashConfig);
  const splashConfig = data.website?.splashConfig as { backgroundColor?: string } | undefined;
  const splashBg = splashConfig?.backgroundColor || '#0A0A0F';

  return (
    <>
      {splashEnabled && (
        <div
          id="instant-splash-shield"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999998,
            backgroundColor: splashBg,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <RestaurantSite data={data} initialTable={initialTable} />
    </>
  );
}
