import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RestaurantSite from '@/components/themes/RestaurantSite';

interface SiteData {
  organization: {
    name: string; slug: string; logo?: string; description?: string;
    phone?: string; email?: string; address?: string; city?: string; mapUrl?: string; currency: string;
  };
  website: {
    theme: Record<string, unknown>; pages: unknown; seoTitle?: string; seoDescription?: string; ogImage?: string;
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
      image?: string; isFeatured: boolean; isNew: boolean; isPopular: boolean;
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

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSiteData(slug);
  if (!data) notFound();
  return <RestaurantSite data={data} />;
}
