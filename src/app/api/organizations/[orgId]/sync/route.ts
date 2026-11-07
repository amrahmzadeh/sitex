import { NextResponse, after } from 'next/server';
import { prisma } from '@/lib/db';
import { isSiteSyncEnabled } from '@/lib/site-sync/config';
import {
  enqueueSiteSync,
  getManualSyncCooldown,
  getSiteSyncStatus,
  processSyncQueue,
} from '@/lib/site-sync/sync-service';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Saytın GitHub sinxronizasiya vəziyyəti (repository adı və token qaytarılmır).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId);
  if (!access.ok) return tenantError(access);

  try {
    const status = await getSiteSyncStatus(orgId);
    return NextResponse.json({ sync: status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Site sync status error:', error);
    return NextResponse.json({ error: 'Sinxronizasiya vəziyyəti oxunmadı' }, { status: 500 });
  }
}

// Manual sinxronlaşdırma — dəqiqədə 1 dəfə.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId, 'ADMIN');
  if (!access.ok) return tenantError(access);

  if (!isSiteSyncEnabled()) {
    return NextResponse.json(
      { error: 'Saytların GitHub sinxronizasiyası söndürülüb.' },
      { status: 503 }
    );
  }

  try {
    const cooldown = await getManualSyncCooldown(orgId);
    if (cooldown > 0) {
      return NextResponse.json(
        {
          error: `Manual sinxronlaşdırma üçün ${Math.ceil(cooldown / 1000)} saniyə gözləmək lazımdır.`,
          retryAfterMs: cooldown,
        },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(cooldown / 1000)) } }
      );
    }

    const outcome = await enqueueSiteSync({
      siteId: orgId,
      trigger: 'manual',
      requestedBy: access.userId,
    });

    if (outcome.status === 'queued') {
      after(async () => {
        await processSyncQueue().catch((error) => console.error('[site-sync] drain:', error));
      });
    }

    const status = await getSiteSyncStatus(orgId);

    return NextResponse.json(
      { outcome, sync: status },
      { status: outcome.status === 'queued' ? 202 : 200 }
    );
  } catch (error) {
    console.error('Manual site sync error:', error);
    return NextResponse.json({ error: 'Sinxronizasiya başladıla bilmədi' }, { status: 500 });
  }
}
