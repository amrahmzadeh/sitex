import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { organizationSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import { defaultThemes } from '@/lib/themes';
import { checkUserAccess, checkSiteLimit } from '@/lib/admin';

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
    const result = organizationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, phone, email, address, city, mapUrl } = result.data;
    let slug = generateSlug(name);

    // Ensure unique slug
    const existingSlug = await prisma.organization.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const defaultTheme = defaultThemes.elegant;
    const defaultPages = [
      { id: 'home', name: 'Ana Səhifə', enabled: true, order: 0 },
      { id: 'about', name: 'Haqqımızda', enabled: true, order: 1 },
      { id: 'menu', name: 'Menyu', enabled: true, order: 2 },
      { id: 'contact', name: 'Əlaqə', enabled: true, order: 3 },
    ];

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
        memberships: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        website: {
          create: {
            draftTheme: defaultTheme as object,
            publishedTheme: defaultTheme as object,
            pagesConfig: defaultPages,
            publishedPages: defaultPages,
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

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Xəta baş verdi';
    console.error('Create organization error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

