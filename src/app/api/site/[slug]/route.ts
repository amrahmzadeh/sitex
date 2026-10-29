import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: {
        website: true,
        whatsappSettings: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        socialFeedPosts: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
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

    if (!organization || !organization.website?.isPublished) {
      return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });
    }

    return NextResponse.json({
      organization: {
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        description: organization.description,
        phone: organization.phone,
        email: organization.email,
        address: organization.address,
        city: organization.city,
        mapUrl: organization.mapUrl,
        currency: organization.currency,
      },
      website: {
        theme: organization.website.publishedTheme,
        pages: organization.website.publishedPages,
        seoTitle: organization.website.seoTitle,
        seoDescription: organization.website.seoDescription,
        ogImage: organization.website.ogImage,
        splashEnabled: organization.website.splashEnabled,
        splashConfig: organization.website.splashConfig,
      },
      whatsapp: organization.whatsappSettings,
      socialLinks: organization.socialLinks,
      socialFeedPosts: organization.socialFeedPosts,
      workingHours: organization.workingHours,
      menuCategories: organization.menuCategories,
    });
  } catch (error) {
    console.error('Public site error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
