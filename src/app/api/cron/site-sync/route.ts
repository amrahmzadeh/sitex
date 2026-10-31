import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { isSiteSyncEnabled } from '@/lib/site-sync/config';
import { processSyncQueue } from '@/lib/site-sync/sync-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hostinger cron üçün növbə emalı:
 *   curl -X POST -H "x-cron-secret: $CRON_SECRET" https://<domain>/api/cron/site-sync
 *
 * Publish zamanı `after()` ilə fonda emal olunur; bu endpoint əlavə təminatdır
 * (məsələn proses yenidən başladıqda yarımçıq qalan növbə üçün).
 */
function isValidSecret(provided: string | null): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!isValidSecret(req.headers.get('x-cron-secret'))) {
    return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
  }

  if (!isSiteSyncEnabled()) {
    return NextResponse.json({ ok: true, disabled: true, result: null });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)));

  try {
    const result = await processSyncQueue(limit);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('[site-sync] cron xətası:', error);
    return NextResponse.json({ error: 'Növbə emal olunmadı' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Yalnız POST' }, { status: 405, headers: { Allow: 'POST' } });
}
