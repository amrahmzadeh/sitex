import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOrganizationSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import { defaultThemes } from '@/lib/themes';
import { checkUserAccess, checkSiteLimit } from '@/lib/admin';
import { isValidSiteType } from '@/config/site-categories';
import { getDefaultPagesForSite } from '@/lib/site-pages';
import { getTemplateDefinition } from '@/lib/templates/github';
import { resolveTemplateTheme } from '@/lib/templates/installer';
import { scheduleSiteSync } from '@/lib/site-sync/schedule';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            website: true,
            _count: { select: { menuItems: true, menuCategories: true } },
          },
        },
      },
    });

    return NextResponse.json({ organizations: memberships.map((m) => ({
      ...m.organization,
      role: m.role,
      menuItemCount: m.organization._count.menuItems,
      categoryCount: m.organization._count.menuCategories,
    })) });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Check user account access
    const access = await checkUserAccess(userId);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    // Check site creation limit
    const limitCheck = await checkSiteLimit(userId);
    if (!limitCheck.ok) {
      return NextResponse.json({ error: limitCheck.error }, { status: 403 });
    }

    const body = await req.json();
    const result = createOrganizationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      name, description, phone, email, address, city, mapUrl,
      siteCategory, siteSubcategory, templateId,
    } = result.data;

    // Sayt növü verilirsə, kateqoriya və alt kateqoriya birlikdə və uyğun olmalıdır.
    if (Boolean(siteCategory) !== Boolean(siteSubcategory)) {
      return NextResponse.json(
        { error: 'Sayt növü üçün həm kateqoriya, həm də alt kateqoriya seçilməlidir' },
        { status: 400 }
      );
    }
    if (siteCategory && !isValidSiteType(siteCategory, siteSubcategory)) {
      return NextResponse.json(
        { error: 'Seçilmiş kateqoriya və alt kateqoriya bir-birinə uyğun deyil' },
        { status: 400 }
      );
    }

    const selectedTemplate = templateId ? await getTemplateDefinition(templateId) : undefined;
    if (templateId && !selectedTemplate) {
      return NextResponse.json({ error: 'Seçilmiş şablon tapılmadı' }, { status: 400 });
    }
    if (
      selectedTemplate &&
      siteCategory &&
      selectedTemplate.source?.repository &&
      (selectedTemplate.category !== siteCategory || selectedTemplate.subcategory !== siteSubcategory)
    ) {
      return NextResponse.json(
        { error: 'Seçilmiş şablon bu sayt növünə aid deyil' },
        { status: 400 }
      );
    }

    // Şablon teması: GitHub əlçatmaz olsa da sayt yaradılması dayanmır.
    let selectedTheme = defaultThemes.elegant;
    let templateMeta: { id: string; name: string; version: string; source: string } | null = null;
    let templateWarning: string | undefined;

    if (selectedTemplate) {
      try {
        const resolved = await resolveTemplateTheme(selectedTemplate.id);
        selectedTheme = resolved.theme;
        templateMeta = {
          id: resolved.templateId,
          name: resolved.name,
          version: resolved.version,
          source: resolved.source,
        };
        templateWarning = resolved.warning;
      } catch (error) {
        templateWarning =
          error instanceof Error
            ? `${error.message} Standart tema tətbiq olundu.`
            : 'Şablon tətbiq olunmadı, standart tema istifadə edildi.';
      }
    }

    const effectiveCategory = siteCategory || selectedTemplate?.category || null;
    const effectiveSubcategory = siteSubcategory || selectedTemplate?.subcategory || null;

    let slug = generateSlug(name);

    // Ensure unique slug
    const existingSlug = await prisma.organization.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const defaultPages = getDefaultPagesForSite(effectiveCategory, effectiveSubcategory);

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description: description?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        mapUrl: mapUrl?.trim() || null,
        siteCategory: effectiveCategory,
        siteSubcategory: effectiveSubcategory,
        templateId: templateMeta?.id || null,
        templateVersion: templateMeta?.version || null,
        templateSource: templateMeta?.source || null,
        templateAppliedAt: templateMeta ? new Date() : null,
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        website: {
          create: {
            draftTheme: selectedTheme as object,
            publishedTheme: selectedTheme as object,
            pagesConfig: defaultPages as object,
            publishedPages: defaultPages as object,
          },
        },
        workingHours: {
          createMany: {
            data: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
              dayOfWeek: day,
              openTime: day === 0 ? null : '09:00',
              closeTime: day === 0 ? null : '22:00',
              isClosed: day === 0,
            })),
          },
        },
      },
      include: {
        website: true,
        memberships: true,
      },
    });

    // İlk GitHub snapshot-u publish-dən asılı olmayaraq (fon rejimində) yazılır.
    // Sync uğursuz olsa da sayt yaradılması uğurlu sayılır.
    scheduleSiteSync(organization.id, 'create', userId);

    return NextResponse.json(
      {
        organization,
        template: templateMeta ? { ...templateMeta, warning: templateWarning } : null,
        templateWarning,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Xəta baş verdi';
    console.error('Create organization error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

