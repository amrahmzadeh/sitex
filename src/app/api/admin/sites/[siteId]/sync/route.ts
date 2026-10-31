import { NextResponse, after } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { isSiteSyncEnabled } from '@/lib/site-sync/config';
import {
  enqueueSiteSync,
  getSiteSyncStatus,
  processSyncQueue,
} from '@/lib/site-sync/sync-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin üçün tam vəziyyət (repository adı və commit linki daxil).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { siteId } = await params;

  try {
    const status = await getSiteSyncStatus(siteId, { includeRepository: true });
    return NextResponse.json({ sync: status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Admin site sync status error:', error);
    return NextResponse.json({ error: 'Sinxronizasiya vəziyyəti oxunmadı' }, { status: 500 });
  }
}

// Admin manual sinxronlaşdırma (sayt artıq silinmiş olsa da işləyir — soft-delete).
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { siteId } = await params;

  if (!isSiteSyncEnabled()) {
    return NextResponse.json(
      { error: 'Saytların GitHub sinxronizasiyası söndürülüb.' },
      { status: 503 }
    );
  }

  try {
    const site = await prisma.organization.findUnique({
      where: { id: siteId },
      select: { id: true },
    });

    const outcome = await enqueueSiteSync({
      siteId,
      trigger: 'manual',
      requestedBy: admin.id,
    });

    if (outcome.status === 'queued') {
      after(async () => {
        await processSyncQueue().catch((error) => console.error('[site-sync] drain:', error));
      });
    }

    const status = await getSiteSyncStatus(siteId, { includeRepository: true });

    return NextResponse.json(
      { outcome, siteExists: Boolean(site), sync: status },
      { status: outcome.status === 'queued' ? 202 : 200 }
    );
  } catch (error) {
    console.error('Admin site sync error:', error);
    return NextResponse.json({ error: 'Sinxronizasiya başladıla bilmədi' }, { status: 500 });
  }
}
