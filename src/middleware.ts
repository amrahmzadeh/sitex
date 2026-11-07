import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global güvenlik başlıkları middleware'i.
 *
 * DİKKAT:
 * - CSP şimdilik Report-Only modunda — canlıda kırılma riski olmadan test edilebilir.
 *   Stabil olduktan sonra `Content-Security-Policy` olarak değiştirin.
 * - frame-ancestors 'self' → tema editörü iframe preview'ı bozmaz.
 * - /site/* ve /api/* yolları da dahil tüm yanıtlara eklenir.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;

  // Clickjacking koruması
  headers.set('X-Frame-Options', 'SAMEORIGIN');

  // MIME sniffing engelleme
  headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer politikası
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS — yalnızca production
  if (process.env.NODE_ENV === 'production') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // Permissions Policy (eski Feature-Policy)
  headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  );

  // CSP — Report-Only modunda başlatıyoruz.
  // Stabil olduktan sonra Content-Security-Policy olarak değiştirin.
  // frame-ancestors 'self' → iframe preview sadece kendi origin'den çalışır.
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "frame-src 'self'",
  ].join('; ');

  headers.set('Content-Security-Policy-Report-Only', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Tüm yollar EXCEPT:
     * - _next/static (static dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico
     * - Dosya uzantılı statik kaynaklar (svg, png, jpg, vb.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};

