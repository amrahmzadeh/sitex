/**
 * Synchronous client-safe helper to convert various Google Maps inputs into an embeddable URL.
 */
export function getGoogleMapsEmbedUrl(
  mapUrl?: string | null,
  address?: string | null,
  city?: string | null,
  orgName?: string | null
): string | null {
  const cleanUrl = (mapUrl || '').trim();

  // 1. If user pasted iframe HTML, extract src
  if (cleanUrl.includes('<iframe')) {
    const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }

  // 2. Already an embed URL
  if (cleanUrl.includes('/maps/embed') || cleanUrl.includes('output=embed')) {
    return cleanUrl;
  }

  // 3. Direct coordinates in URL (e.g., @39.597418,48.981908 or search/39.597418,+48.981908)
  const coordsMatch = cleanUrl.match(/([-+]?\d{1,2}\.\d+)[,\s+]+([-+]?\d{1,3}\.\d+)/);
  if (coordsMatch && !cleanUrl.includes('goo.gl')) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2].replace('+', '');
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }

  // 4. Place name in URL (/place/Name)
  const placeMatch = cleanUrl.match(/\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
  }

  // 5. Fallback to address + city or orgName
  const queryParts = [address, city, orgName].filter(Boolean);
  if (queryParts.length > 0) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(queryParts.join(', '))}&z=16&output=embed`;
  }

  if (cleanUrl && !cleanUrl.startsWith('http')) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(cleanUrl)}&z=16&output=embed`;
  }

  return null;
}

// In-memory cache to prevent repeated external network calls on every SSR request
const mapsEmbedCache = new Map<string, string | null>();

/**
 * Server-side async resolver for Google Maps URL. Follows redirects for short links.
 */
export async function resolveGoogleMapsEmbedUrl(
  mapUrl?: string | null,
  address?: string | null,
  city?: string | null,
  orgName?: string | null
): Promise<string | null> {
  const cleanUrl = (mapUrl || '').trim();
  const cacheKey = `${cleanUrl}|${address || ''}|${city || ''}|${orgName || ''}`;

  if (mapsEmbedCache.has(cacheKey)) {
    return mapsEmbedCache.get(cacheKey) || null;
  }

  // 1. If iframe HTML
  if (cleanUrl.includes('<iframe')) {
    const srcMatch = cleanUrl.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      mapsEmbedCache.set(cacheKey, srcMatch[1]);
      return srcMatch[1];
    }
  }

  // 2. Already an embed URL
  if (cleanUrl.includes('/maps/embed') || cleanUrl.includes('output=embed')) {
    mapsEmbedCache.set(cacheKey, cleanUrl);
    return cleanUrl;
  }

  // 3. Direct coords in url
  const coordsMatch = cleanUrl.match(/([-+]?\d{1,2}\.\d+)[,\s+]+([-+]?\d{1,3}\.\d+)/);
  if (coordsMatch && !cleanUrl.includes('goo.gl')) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2].replace('+', '');
    const result = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    mapsEmbedCache.set(cacheKey, result);
    return result;
  }

  // 4. Short URL (maps.app.goo.gl or goo.gl/maps) - fast redirect resolution
  if (/goo\.gl/i.test(cleanUrl)) {
    try {
      let targetUrl = '';
      try {
        const headRes = await fetch(cleanUrl, {
          method: 'HEAD',
          redirect: 'manual',
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(2000),
        });
        targetUrl = headRes.headers.get('location') || '';
      } catch {}

      if (!targetUrl) {
        try {
          const getRes = await fetch(cleanUrl, {
            method: 'GET',
            redirect: 'manual',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(2000),
          });
          targetUrl = getRes.headers.get('location') || '';
        } catch {}
      }

      if (targetUrl) {
        const redirectCoords = targetUrl.match(/([-+]?\d{1,2}\.\d+)[,\s+]+([-+]?\d{1,3}\.\d+)/);
        if (redirectCoords) {
          const lat = redirectCoords[1];
          const lng = redirectCoords[2].replace('+', '');
          const result = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
          mapsEmbedCache.set(cacheKey, result);
          return result;
        }

        const placeMatch = targetUrl.match(/\/place\/([^/@?]+)/);
        if (placeMatch && placeMatch[1]) {
          const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          const result = `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
          mapsEmbedCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 5. Standard place URL
  const placeMatch = cleanUrl.match(/\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    const result = `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
    mapsEmbedCache.set(cacheKey, result);
    return result;
  }

  // 6. Fallback to address + city or orgName
  const queryParts = [address, city, orgName].filter(Boolean);
  if (queryParts.length > 0) {
    const result = `https://maps.google.com/maps?q=${encodeURIComponent(queryParts.join(', '))}&z=16&output=embed`;
    mapsEmbedCache.set(cacheKey, result);
    return result;
  }

  const fallback = getGoogleMapsEmbedUrl(mapUrl, address, city, orgName);
  mapsEmbedCache.set(cacheKey, fallback);
  return fallback;
}

