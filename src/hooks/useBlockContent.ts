// useBlockContent — Template bileşenləri üçün hook
// Server component-lərdə işləmir — yalnız 'use client' bileşenlərində istifadə edin.
// Server-tərəfdə getBlockContent() funksiyasını istifadə edin.

'use client';

import { useEffect, useState } from 'react';
import type { ContentDoc, Locale, BlockContent } from '@/modules/site-editor/types';
import { mergeWithDefaults } from '@/modules/site-editor/content-utils';
import { getBlock } from '@/modules/site-editor/block-registry';

// Schema-ları register etmək üçün
import '@/modules/site-editor/schemas/hero.schema';
import '@/modules/site-editor/schemas/about.schema';
import '@/modules/site-editor/schemas/contact.schema';
import '@/modules/site-editor/schemas/menu.schema';
import '@/modules/site-editor/schemas/gallery.schema';
import '@/modules/site-editor/schemas/reservation.schema';

interface UseBlockContentResult {
  fields: BlockContent;
  visible: boolean;
  loading: boolean;
}

/** Cache: orgId → { pageKey.blockKey → ContentDoc } */
const cache = new Map<string, Record<string, ContentDoc>>();

async function fetchPublishedContent(orgId: string): Promise<Record<string, ContentDoc>> {
  const cacheKey = orgId;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  try {
    // Public endpoint — no auth needed; server returns publishedContent
    const res = await fetch(`/api/site-content/${orgId}`);
    if (!res.ok) return {};
    const data = await res.json();
    const flat: Record<string, ContentDoc> = {};
    for (const [pageKey, blocks] of Object.entries(data.content ?? {})) {
      for (const [blockKey, doc] of Object.entries(blocks as Record<string, ContentDoc>)) {
        flat[`${pageKey}.${blockKey}`] = doc;
      }
    }
    cache.set(cacheKey, flat);
    return flat;
  } catch {
    return {};
  }
}

/**
 * Template bileşenlərində istifadə:
 * const { fields, visible } = useBlockContent(orgId, 'hero.main');
 * const title = t(fields.title, locale);
 */
export function useBlockContent(
  orgId: string | undefined,
  blockKey: string,
  locale: Locale = 'az'
): UseBlockContentResult {
  const [doc, setDoc] = useState<ContentDoc | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    fetchPublishedContent(orgId).then((flat) => {
      setDoc(flat[blockKey]);
      setLoading(false);
    });
  }, [orgId, blockKey]);

  const schema = getBlock(blockKey);
  const fields = schema
    ? mergeWithDefaults(doc?.fields, schema.fields)
    : (doc?.fields ?? {});

  return {
    fields,
    visible: doc?.visible !== false,
    loading,
  };
}

/** Cache-i invalidate et (yayımdan sonra çağırın) */
export function invalidateBlockCache(orgId: string) {
  cache.delete(orgId);
}

