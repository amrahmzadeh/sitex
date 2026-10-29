import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (!membership || membership.role !== 'OWNER') {
      return NextResponse.json({ error: 'Yalnız sayt sahibi import edə bilər' }, { status: 403 });
    }

    const body = await req.json();
    const {
      data,
      importTheme = true,
      importMenu = true,
      importSettings = true,
      importWhatsapp = true,
      importSocialLinks = true,
      importWorkingHours = true,
      clearExistingMenu = false,
    } = body;

    if (!data || !data.version) {
      return NextResponse.json({ error: 'Keçərsiz export faylı' }, { status: 400 });
    }

    const results: string[] = [];

    // Import site basic settings
    if (importSettings && data.site) {
      const updateData: Record<string, unknown> = {};
      if (data.site.name) updateData.name = data.site.name;
      if (data.site.description !== undefined) updateData.description = data.site.description;
      if (data.site.phone !== undefined) updateData.phone = data.site.phone;
      if (data.site.email !== undefined) updateData.email = data.site.email;
      if (data.site.address !== undefined) updateData.address = data.site.address;
      if (data.site.city !== undefined) updateData.city = data.site.city;
      if (data.site.mapUrl !== undefined) updateData.mapUrl = data.site.mapUrl;
      if (data.site.currency) updateData.currency = data.site.currency;

      await prisma.organization.update({ where: { id: orgId }, data: updateData });
      results.push('Əsas məlumatlar import edildi');
    }

    // Import theme
    if (importTheme && data.theme) {
      await prisma.website.upsert({
        where: { organizationId: orgId },
        update: { draftTheme: data.theme },
        create: { organizationId: orgId, draftTheme: data.theme },
      });
      results.push('Tema import edildi');
    }

    // Import pages config
    if (importTheme && data.pagesConfig) {
      await prisma.website.upsert({
        where: { organizationId: orgId },
        update: { pagesConfig: data.pagesConfig },
        create: { organizationId: orgId, pagesConfig: data.pagesConfig },
      });
    }

    // Import splash
    if (importTheme && data.splashConfig) {
      await prisma.website.upsert({
        where: { organizationId: orgId },
        update: {
          splashConfig: data.splashConfig,
          splashEnabled: data.splashEnabled ?? false,
        },
        create: {
          organizationId: orgId,
          splashConfig: data.splashConfig,
          splashEnabled: data.splashEnabled ?? false,
        },
      });
    }

    // Import whatsapp
    if (importWhatsapp && data.whatsapp) {
      await prisma.whatsAppSettings.upsert({
        where: { organizationId: orgId },
        update: {
          countryCode: data.whatsapp.countryCode ?? '+994',
          phoneNumber: data.whatsapp.phoneNumber ?? '',
          orderMessage: data.whatsapp.orderMessage ?? '',
          buttonText: data.whatsapp.buttonText ?? 'WhatsApp ilə sifariş et',
          contactNumber: data.whatsapp.contactNumber ?? null,
          isEnabled: data.whatsapp.isEnabled ?? true,
        },
        create: {
          organizationId: orgId,
          countryCode: data.whatsapp.countryCode ?? '+994',
          phoneNumber: data.whatsapp.phoneNumber ?? '',
          orderMessage: data.whatsapp.orderMessage ?? '',
          buttonText: data.whatsapp.buttonText ?? 'WhatsApp ilə sifariş et',
          contactNumber: data.whatsapp.contactNumber ?? null,
          isEnabled: data.whatsapp.isEnabled ?? true,
        },
      });
      results.push('WhatsApp ayarları import edildi');
    }

    // Import social links
    if (importSocialLinks && Array.isArray(data.socialLinks)) {
      await prisma.socialLink.deleteMany({ where: { organizationId: orgId } });
      if (data.socialLinks.length > 0) {
        await prisma.socialLink.createMany({
          data: data.socialLinks.map((s: { platform: string; url: string; sortOrder?: number }) => ({
            organizationId: orgId,
            platform: s.platform,
            url: s.url,
            sortOrder: s.sortOrder ?? 0,
          })),
        });
      }
      results.push('Sosial linklər import edildi');
    }

    // Import working hours
    if (importWorkingHours && Array.isArray(data.workingHours)) {
      await prisma.workingHours.deleteMany({ where: { organizationId: orgId } });
      if (data.workingHours.length > 0) {
        await prisma.workingHours.createMany({
          data: data.workingHours.map((w: { dayOfWeek: number; openTime?: string; closeTime?: string; isClosed?: boolean }) => ({
            organizationId: orgId,
            dayOfWeek: w.dayOfWeek,
            openTime: w.openTime ?? null,
            closeTime: w.closeTime ?? null,
            isClosed: w.isClosed ?? false,
          })),
        });
      }
      results.push('İş saatları import edildi');
    }

    // Import menu
    if (importMenu && Array.isArray(data.menuCategories)) {
      if (clearExistingMenu) {
        await prisma.menuCategory.deleteMany({ where: { organizationId: orgId } });
      }

      for (const cat of data.menuCategories) {
        const catSlug = cat.slug || slugify(cat.name);
        let category = await prisma.menuCategory.findUnique({
          where: { organizationId_slug: { organizationId: orgId, slug: catSlug } },
        });

        if (category) {
          category = await prisma.menuCategory.update({
            where: { id: category.id },
            data: {
              name: cat.name,
              description: cat.description ?? null,
              image: cat.image ?? null,
              sortOrder: cat.sortOrder ?? 0,
              isVisible: cat.isVisible ?? true,
            },
          });
        } else {
          category = await prisma.menuCategory.create({
            data: {
              organizationId: orgId,
              name: cat.name,
              slug: catSlug,
              description: cat.description ?? null,
              image: cat.image ?? null,
              sortOrder: cat.sortOrder ?? 0,
              isVisible: cat.isVisible ?? true,
            },
          });
        }

        if (Array.isArray(cat.menuItems)) {
          for (const item of cat.menuItems) {
            const itemSlug = item.slug || slugify(item.name);
            const existing = await prisma.menuItem.findUnique({
              where: { organizationId_slug: { organizationId: orgId, slug: itemSlug } },
            });

            if (existing) {
              await prisma.menuItem.update({
                where: { id: existing.id },
                data: {
                  name: item.name,
                  categoryId: category.id,
                  description: item.description ?? null,
                  longDescription: item.longDescription ?? null,
                  price: item.price ?? 0,
                  discountPrice: item.discountPrice ?? null,
                  image: item.image ?? null,
                  ingredients: item.ingredients ?? null,
                  allergens: item.allergens ?? null,
                  portionSize: item.portionSize ?? null,
                  prepTime: item.prepTime ?? null,
                  isFeatured: item.isFeatured ?? false,
                  isNew: item.isNew ?? false,
                  isPopular: item.isPopular ?? false,
                  isVisible: item.isVisible ?? true,
                  sortOrder: item.sortOrder ?? 0,
                },
              });
            } else {
              await prisma.menuItem.create({
                data: {
                  organizationId: orgId,
                  categoryId: category.id,
                  name: item.name,
                  slug: itemSlug,
                  description: item.description ?? null,
                  longDescription: item.longDescription ?? null,
                  price: item.price ?? 0,
                  discountPrice: item.discountPrice ?? null,
                  image: item.image ?? null,
                  ingredients: item.ingredients ?? null,
                  allergens: item.allergens ?? null,
                  portionSize: item.portionSize ?? null,
                  prepTime: item.prepTime ?? null,
                  isFeatured: item.isFeatured ?? false,
                  isNew: item.isNew ?? false,
                  isPopular: item.isPopular ?? false,
                  isVisible: item.isVisible ?? true,
                  sortOrder: item.sortOrder ?? 0,
                },
              });
            }
          }
        }
      }
      results.push('Menyu import edildi');
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Import zamanı xəta baş verdi' }, { status: 500 });
  }
}

