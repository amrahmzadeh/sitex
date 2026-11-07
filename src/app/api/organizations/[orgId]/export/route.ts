import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        website: true,
        whatsappSettings: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        menuCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              orderBy: { sortOrder: 'asc' },
              include: { images: { orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      site: {
        name: org.name,
        description: org.description,
        phone: org.phone,
        email: org.email,
        address: org.address,
        city: org.city,
        mapUrl: org.mapUrl,
        logo: org.logo,
        currency: org.currency,
        slug: org.slug,
      },
      theme: org.website?.draftTheme ?? {},
      pagesConfig: org.website?.pagesConfig ?? [],
      splashConfig: org.website?.splashConfig ?? {},
      splashEnabled: org.website?.splashEnabled ?? false,
      seo: {
        seoTitle: org.website?.seoTitle,
        seoDescription: org.website?.seoDescription,
        ogImage: org.website?.ogImage,
      },
      whatsapp: org.whatsappSettings
        ? {
            countryCode: org.whatsappSettings.countryCode,
            phoneNumber: org.whatsappSettings.phoneNumber,
            orderMessage: org.whatsappSettings.orderMessage,
            buttonText: org.whatsappSettings.buttonText,
            contactNumber: org.whatsappSettings.contactNumber,
            isEnabled: org.whatsappSettings.isEnabled,
          }
        : null,
      socialLinks: org.socialLinks.map((s) => ({
        platform: s.platform,
        url: s.url,
        sortOrder: s.sortOrder,
      })),
      workingHours: org.workingHours.map((w) => ({
        dayOfWeek: w.dayOfWeek,
        openTime: w.openTime,
        closeTime: w.closeTime,
        isClosed: w.isClosed,
      })),
      menuCategories: org.menuCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isVisible: cat.isVisible,
        menuItems: cat.menuItems.map((item) => ({
          name: item.name,
          slug: item.slug,
          description: item.description,
          longDescription: item.longDescription,
          price: item.price,
          discountPrice: item.discountPrice,
          image: item.image,
          ingredients: item.ingredients,
          allergens: item.allergens,
          portionSize: item.portionSize,
          prepTime: item.prepTime,
          isFeatured: item.isFeatured,
          isNew: item.isNew,
          isPopular: item.isPopular,
          isVisible: item.isVisible,
          sortOrder: item.sortOrder,
          images: item.images.map((img) => ({ url: img.url, alt: img.alt, sortOrder: img.sortOrder })),
        })),
      })),
    };

    const filename = `site-export-${org.slug}-${Date.now()}.json`;
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
