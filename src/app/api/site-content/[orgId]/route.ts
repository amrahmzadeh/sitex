// GET /api/site-content/[orgId] — public endpoint (no auth)
// Template bileşenləri published content-i buradan alır

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 60; // 60 saniyə ISR cache

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  try {
    const rows = await prisma.siteContent.findMany({
      where: { organizationId: orgId },
      select: { pageKey: true, blockKey: true, publishedContent: true },
    });

    // pageKey → blockKey → ContentDoc (publishedContent)
    const content: Record<string, Record<string, unknown>> = {};
    for (const row of rows) {
      if (!content[row.pageKey]) content[row.pageKey] = {};
      content[row.pageKey][row.blockKey] = row.publishedContent;
    }

    return NextResponse.json(
      { content },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch {
    return NextResponse.json({ content: {} }, { status: 200 });
  }
}

