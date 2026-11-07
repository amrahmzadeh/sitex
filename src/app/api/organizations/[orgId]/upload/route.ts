import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Beyaz listedeki MIME türleri ve karşılık gelen uzantılar.
 * file-type paketi magic-byte'tan MIME döndürür; bu haritayla uzantıya çeviririz.
 */
const ALLOWED_RASTER: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const ALLOWED_VIDEO: Record<string, string> = {
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

const ALL_ALLOWED = { ...ALLOWED_RASTER, ...ALLOWED_VIDEO };

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

function getSiteRoot(cwd: string): string {
  if (cwd.includes('versions')) return cwd.split(/versions[/\\]/)[0];
  if (cwd.includes('current')) return path.dirname(cwd);
  return cwd;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const access = await verifyTenantAccess(orgId);
    if (!access.ok) return tenantError(access);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Fayl tələb olunur' }, { status: 400 });
    }

    // --- Sunucu tarafı boyut kontrolü ---
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --- Magic-byte ile gerçek MIME tipi algılama ---
    // file-type ESM-only olduğundan dynamic import kullanıyoruz
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(buffer);

    if (!detected) {
      // SVG ve diğer text tabanlı formatlar magic-byte ile algılanamaz.
      // SVG'yi GÜVENLİK NEDENİYLE REDDEDİYORUZ — XSS vektörü.
      return NextResponse.json(
        {
          error: 'Fayl növü müəyyən edilə bilmədi. Yalnız JPEG, PNG, WebP, GIF, AVIF və video (MP4, WebM, MOV) qəbul edilir. SVG qəbul edilmir.',
        },
        { status: 400 }
      );
    }

    const detectedMime = detected.mime;
    const allowedExt = ALL_ALLOWED[detectedMime];

    if (!allowedExt) {
      return NextResponse.json(
        {
          error: `Bu fayl növü qəbul edilmir: ${detectedMime}. Yalnız JPEG, PNG, WebP, GIF, AVIF və video (MP4, WebM, MOV) icazə verilir.`,
        },
        { status: 400 }
      );
    }

    // --- Boyut limiti (gerçek MIME'ye göre) ---
    const isVideo = detectedMime.startsWith('video/');
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: `Fayl ölçüsü ${isVideo ? '100MB' : '15MB'}-dan böyük ola bilməz` },
        { status: 400 }
      );
    }

    // --- Güvenli dosya adı: istemciden ALINMAZ ---
    const filename = `${crypto.randomUUID()}${allowedExt}`;

    const cwd = process.cwd();
    const siteRoot = getSiteRoot(cwd);

    // Write to all persistent locations (primary + shared outside version dirs)
    const writeDirs = [
      path.join(cwd, 'public', 'uploads', orgId),
      path.join(siteRoot, 'shared_uploads', orgId),
      path.join(siteRoot, 'uploads', orgId),
    ];

    let written = false;
    for (const dir of writeDirs) {
      try {
        await mkdir(dir, { recursive: true });
        await writeFile(path.join(dir, filename), buffer);
        written = true;
      } catch (e) {
        console.error('[upload] write failed for', dir, e);
      }
    }

    const url = `/uploads/${orgId}/${filename}`;

    // For images or reasonably sized files, store base64 in DB for multi-instance fallback
    let mediaAsset = null;
    try {
      const base64Data = buffer.length <= 15 * 1024 * 1024 ? buffer.toString('base64') : null;
      mediaAsset = await prisma.mediaAsset.create({
        data: {
          organizationId: orgId,
          filename,
          url,
          mimeType: detectedMime,
          size: buffer.length,
          data: base64Data,
        },
      });
    } catch (dbErr) {
      console.warn('[upload] mediaAsset save to DB failed, file written to disk:', dbErr);
    }

    return NextResponse.json({ url, mediaAsset }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Yükləmə zamanı xəta baş verdi' }, { status: 500 });
  }
}
