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

  // 1. If iframe HTML
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

  // 3. Direct coords in url
  const coordsMatch = cleanUrl.match(/([-+]?\d{1,2}\.\d+)[,\s+]+([-+]?\d{1,3}\.\d+)/);
  if (coordsMatch && !cleanUrl.includes('goo.gl')) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2].replace('+', '');
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }

  // 4. Short URL (maps.app.goo.gl or goo.gl/maps) - follow redirect on server
  if (/goo\.gl/i.test(cleanUrl)) {
    try {
      const res = await fetch(cleanUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.url) {
        // Coords in redirected URL
        const redirectCoords = res.url.match(/([-+]?\d{1,2}\.\d+)[,\s+]+([-+]?\d{1,3}\.\d+)/);
        if (redirectCoords) {
          const lat = redirectCoords[1];
          const lng = redirectCoords[2].replace('+', '');
          return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
        }
        // Place in redirected URL
        const placeMatch = res.url.match(/\/place\/([^/@?]+)/);
        if (placeMatch && placeMatch[1]) {
          const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
          return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
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
    return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=16&output=embed`;
  }

  // 6. Fallback to address + city or orgName
  const queryParts = [address, city, orgName].filter(Boolean);
  if (queryParts.length > 0) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(queryParts.join(', '))}&z=16&output=embed`;
  }

  return null;
}

