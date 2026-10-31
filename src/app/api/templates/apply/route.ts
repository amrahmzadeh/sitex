import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/admin';
import { resolveTemplateTheme, TemplateUnavailableError } from '@/lib/templates/installer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const applySchema = z.object({
  organizationId: z.string().min(1, 'Müəssisə tələb olunur'),
  templateId: z.string().min(1, 'Şablon tələb olunur'),
});

/**
 * Mövcud sayta şablon tətbiq edir. Yalnız qaralama tema yenilənir; yayımlanmış
 * sayt istifadəçi "Yayınla" düyməsini basana qədər dəyişmir.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { organizationId, templateId } = parsed.data;

    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!membership || membership.role === 'EDITOR') {
      return NextResponse.json({ error: 'Bu əməliyyat üçün icazəniz yoxdur' }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, website: { select: { id: true } } },
    });
    if (!organization) {
      return NextResponse.json({ error: 'Sayt tapılmadı' }, { status: 404 });
    }

    const resolved = await resolveTemplateTheme(templateId);

    // Şablon öz kateqoriyasını da təyin edir (kateqoriyanı sonradan dəyişmək üçün).
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        siteCategory: resolved.category,
        siteSubcategory: resolved.subcategory,
        templateId: resolved.templateId,
        templateVersion: resolved.version,
        templateSource: resolved.source,
        templateAppliedAt: new Date(),
      },
    });

    if (organization.website) {
      await prisma.website.update({
        where: { organizationId },
        data: { draftTheme: resolved.theme as object },
      });
    }

    await logAudit(userId, 'TEMPLATE_APPLIED', 'SITE', organizationId, {
      templateId: resolved.templateId,
      version: resolved.version,
      source: resolved.source,
    });

    return NextResponse.json({
      template: {
        id: resolved.templateId,
        name: resolved.name,
        version: resolved.version,
        source: resolved.source,
        fileCount: resolved.fileCount,
        warning: resolved.warning,
      },
      appliedTo: organization.website ? 'draft' : 'none',
    });
  } catch (error) {
    if (error instanceof TemplateUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Apply template error:', error);
    return NextResponse.json(
      { error: 'Şablon tətbiq edilərkən xəta baş verdi. Saytınızın mövcud vəziyyəti dəyişmədi.' },
      { status: 500 }
    );
  }
}
