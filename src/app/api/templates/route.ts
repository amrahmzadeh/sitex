import { NextResponse } from 'next/server';
import { getSiteCategory, getSiteSubcategory } from '@/config/site-categories';
import {
  getLocalManifest,
  TemplateManifestError,
  toPublicTemplate,
} from '@/lib/templates/manifest';
import { fetchRemoteManifest } from '@/lib/templates/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Seçilmiş sayt növünə uyğun şablonların siyahısı.
 * Frontend-ə repository adı və token heç vaxt göndərilmir.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.trim() || null;
    const subcategory = searchParams.get('subcategory')?.trim() || null;

    if (category && !getSiteCategory(category)) {
      return NextResponse.json({ error: 'Naməlum sayt kateqoriyası' }, { status: 400 });
    }
    if (subcategory && category && !getSiteSubcategory(category, subcategory)) {
      return NextResponse.json({ error: 'Alt kateqoriya seçilmiş kateqoriyaya aid deyil' }, { status: 400 });
    }

    const remote = await fetchRemoteManifest();
    const manifest = remote.manifest || getLocalManifest();

    const matches = (list: typeof manifest.templates) =>
      list.filter((template) => {
        if (category && template.category !== category) return false;
        if (subcategory && template.subcategory !== subcategory) return false;
        return true;
      });

    let templates = matches(manifest.templates);
    let source = remote.source;

    // Uzaq manifestdə bu növ üçün şablon yoxdursa, daxili manifestə düşürük.
    if (templates.length === 0 && remote.source === 'github') {
      templates = matches(getLocalManifest().templates);
      source = 'local';
    }

    return NextResponse.json(
      {
        templates: templates.map(toPublicTemplate),
        meta: {
          source,
          cached: remote.cached,
          githubConfigured: Boolean(process.env.GITHUB_TEMPLATE_REPO?.trim()),
          warning: remote.error,
        },
      },
      { headers: { 'Cache-Control': 'public, max-age=30' } }
    );
  } catch (error) {
    console.error('Get templates error:', error);
    const message =
      error instanceof TemplateManifestError
        ? error.message
        : 'Şablon siyahısı yüklənə bilmədi. Mövcud sayt funksiyaları işləməyə davam edir.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
