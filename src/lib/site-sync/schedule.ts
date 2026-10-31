import { after } from 'next/server';
import { isSiteSyncEnabled } from './config';
import { enqueueSiteSync, processSyncQueue, type SiteSyncTrigger } from './sync-service';

/**
 * Sync-i istifadəçi sorğusundan AYIRIR.
 *
 * `after()` Next-in cavabı göndərdikdən sonra işləyən fon tapşırığıdır — publish
 * sorğusu GitHub-ı heç vaxt gözləmir. Funksiya request kontekstindən kənarda
 * (məsələn skriptdən) çağırılarsa, `after` xəta verir və iş birbaşa icra olunur.
 */
export function scheduleSiteSync(
  siteId: string,
  trigger: SiteSyncTrigger,
  requestedBy?: string | null
): void {
  if (!isSiteSyncEnabled()) return;

  const task = async () => {
    try {
      const outcome = await enqueueSiteSync({ siteId, trigger, requestedBy });
      if (outcome.status === 'queued') {
        await processSyncQueue();
      }
    } catch (error) {
      // Sync xətası əsas əməliyyata (publish/delete) təsir etməməlidir.
      console.error('[site-sync] növbəyə atma xətası:', error);
    }
  };

  try {
    after(task);
  } catch {
    void task();
  }
}
