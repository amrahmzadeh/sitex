import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { menuCategorySchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';
import { verifyOrgPermission } from '@/lib/permissions';

async function verifyAccess(orgId: string, action: 'view' | 'create' = 'view') {
  const perm = await verifyOrgPermission(orgId, 'menu', action);
  return perm.ok ? perm : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId, 'view');
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    let categories = await prisma.menuCategory.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          orderBy: { sortOrder: 'asc' },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        },
        _count: { select: { menuItems: true } },
      },
    });

    // Əgər heç bir xidmət/kateqoriya yoxdursa və sayt Mehin İsmayılova və ya şəxsi/xidmət kateqoriyasıdırsa, nümunə xidmətləri avtomatik başlat
    if (categories.length === 0) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: { website: true },
      });
      const draftTheme = (org?.website?.draftTheme as any) || {};
      const isSpeechAcademy =
        org?.templateId === 'mehin-ismayilova-pro' ||
        org?.templateId === 'speech-academy' ||
        draftTheme?.id === 'mehinIsmayilova' ||
        draftTheme?.proTemplateId === 'speech-academy' ||
        draftTheme?.proTemplateId === 'mehin-ismayilova' ||
        org?.siteCategory === 'sexsi-ve-resmi-sayt' ||
        org?.siteCategory === 'sexsi-blog' ||
        (org?.name && org.name.toLowerCase().includes('mehin'));

      if (isSpeechAcademy) {
        const catSlug = `esas-xidmetler-${Date.now().toString(36)}`;
        const category = await prisma.menuCategory.create({
          data: {
            organizationId: orgId,
            name: 'Əsas Xidmətlər',
            slug: catSlug,
            description: 'Peşəkar fərdi və korporativ xidmətlər',
            isVisible: true,
            sortOrder: 0,
          },
        });

        const defaultItems = [
          {
            name: 'Diksiya təlimləri',
            slug: `diksiya-telimleri-${Date.now().toString(36)}`,
            description: 'Düzgün tənəffüs, aydın artikulyasiya, nitq qüsurlarının aradan qaldırılması və səhnə qorxusuna qalib gəlmək texnikaları.',
            price: 150,
            portionSize: 'Tədris proqramı',
            prepTime: 'Fərdi və korporativ səviyyədə',
            isPopular: true,
            isFeatured: true,
            isVisible: true,
            sortOrder: 0,
          },
          {
            name: 'Tədbir aparıcılığı',
            slug: `tedbir-apariciligi-${Date.now().toString(36)}`,
            description: 'Beynəlxalq forumlar, dövlət səviyyəli konfranslar, korporativ qala gecələri və nüfuzlu təqdimatların zərif idarə olunması.',
            price: 300,
            portionSize: 'Protokol və moderatorluq',
            prepTime: 'Dövlət və özəl tədbirlər, brend təqdimatları',
            isPopular: true,
            isFeatured: false,
            isVisible: true,
            sortOrder: 1,
          },
          {
            name: 'Peşəkar səsləndirmə',
            slug: `pesekar-seslendirme-${Date.now().toString(36)}`,
            description: 'Radio və TV reklamları, korporativ imic filmləri, audio kitablar və sənədli layihələr üçün unikal tembr və diksiya.',
            price: 200,
            portionSize: 'Studiya keyfiyyəti',
            prepTime: 'Reklam çarxları, korporativ videolar və layihələr',
            isPopular: true,
            isFeatured: false,
            isVisible: true,
            sortOrder: 2,
          },
          {
            name: 'Brend siması',
            slug: `brend-simasi-${Date.now().toString(36)}`,
            description: 'Nüfuzlu brendlərin imic çəkilişləri, sosial çarxlar və ictimaiyyətlə əlaqələr layihələrində estetik və inamlı təmsilçilik.',
            price: 500,
            portionSize: 'Brend əməkdaşlığı',
            prepTime: 'Yaradıcı vizual layihələr və reklam kampaniyaları',
            isNew: true,
            isFeatured: false,
            isVisible: true,
            sortOrder: 3,
          },
        ];

        for (const it of defaultItems) {
          await prisma.menuItem.create({
            data: {
              organizationId: orgId,
              categoryId: category.id,
              ...it,
            },
          });
        }

        categories = await prisma.menuCategory.findMany({
          where: { organizationId: orgId },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              orderBy: { sortOrder: 'asc' },
              include: { images: { orderBy: { sortOrder: 'asc' } } },
            },
            _count: { select: { menuItems: true } },
          },
        });
      }
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId, 'create');
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const body = await req.json();
    const result = menuCategorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, ...rest } = result.data;
    let slug = generateSlug(name);

    const existingSlug = await prisma.menuCategory.findUnique({
      where: { organizationId_slug: { organizationId: orgId, slug } },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Get max sort order
    const maxOrder = await prisma.menuCategory.findFirst({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const { sortOrder: _unused, ...restWithoutOrder } = rest;
    const category = await prisma.menuCategory.create({
      data: {
        organizationId: orgId,
        name,
        slug,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        ...restWithoutOrder,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Xəta baş verdi' }, { status: 500 });
  }
}
