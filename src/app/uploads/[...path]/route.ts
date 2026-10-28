import { NextResponse } from 'next/server';
import { readFile, readdir, mkdir, copyFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogg': 'video/ogg',
  '.m4v': 'video/x-m4v',
};

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAAElFTkSuQmCC',
  'base64'
);

async function locateFile(safePath: string): Promise<string | null> {
  const cwd = process.cwd();

  // 1. Direct path in cwd/public/uploads
  const p1 = path.join(cwd, 'public', 'uploads', safePath);
  if (existsSync(p1)) return p1;

  // 2. Direct path in cwd/uploads
  const p2 = path.join(cwd, 'uploads', safePath);
  if (existsSync(p2)) return p2;

  // 3. Shared uploads directory (outside version deployments)
  const siteRoot = cwd.includes('versions')
    ? cwd.split(/versions[\/\\]/)[0]
    : cwd.includes('current')
    ? path.dirname(cwd)
    : cwd;

  const shared = path.join(siteRoot, 'shared_uploads', safePath);
  if (existsSync(shared)) return shared;

  // 4. Check all older versions on Hostinger
  const versionsDir = path.join(siteRoot, 'versions');
  if (existsSync(versionsDir)) {
    try {
      const vers = await readdir(versionsDir);
      for (const ver of vers) {
        const candidate1 = path.join(versionsDir, ver, 'public', 'uploads', safePath);
        if (existsSync(candidate1)) {
          try {
            await mkdir(path.dirname(shared), { recursive: true });
            await copyFile(candidate1, shared);
            await mkdir(path.dirname(p1), { recursive: true });
            await copyFile(candidate1, p1);
          } catch {}
          return candidate1;
        }

        const candidate2 = path.join(versionsDir, ver, 'uploads', safePath);
        if (existsSync(candidate2)) return candidate2;

        const candidate3 = path.join(versionsDir, ver, '.next', 'standalone', 'public', 'uploads', safePath);
        if (existsSync(candidate3)) return candidate3;
      }
    } catch {}
  }

  // 5. Check public_html or hbuilds
  const p3 = path.join(siteRoot, 'public_html', 'uploads', safePath);
  if (existsSync(p3)) return p3;

  const p4 = path.join(siteRoot, 'hbuilds', 'source', 'public', 'uploads', safePath);
  if (existsSync(p4)) return p4;

  // 6. Check domain root
  const domainCandidates = [
    path.join('/home/u310078278/domains/onlive.az/public_html/uploads', safePath),
    path.join('/home/u310078278/domains/onlive.az/site/uploads', safePath),
    path.join('/home/u310078278/domains/onlive.az/uploads', safePath),
  ];
  for (const dc of domainCandidates) {
    if (existsSync(dc)) return dc;
  }

  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const safePath = path.normalize(segments.join('/')).replace(/^(\.\.[\/\\])+/, '');
    const filename = path.basename(safePath);
    const ext = path.extname(safePath).toLowerCase();

    // 1. Try disk first
    const filepath = await locateFile(safePath);
    if (filepath) {
      const data = await readFile(filepath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      return new NextResponse(data, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Not on disk: Fetch persistent binary from MySQL database
    try {
      const asset = await prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { url: `/uploads/${safePath}` },
            { url: { endsWith: safePath } },
            { url: { endsWith: filename } },
            { filename: filename },
          ],
        },
        select: { data: true, mimeType: true },
      });

      if (asset?.data) {
        const buffer = Buffer.from(asset.data, 'base64');
        const contentType = asset.mimeType || MIME_TYPES[ext] || 'image/jpeg';

        // Cache to disk asynchronously for instant future hits
        const cwd = process.cwd();
        const diskCache1 = path.join(cwd, 'public', 'uploads', safePath);
        const siteRoot = cwd.includes('versions')
          ? cwd.split(/versions[\/\\]/)[0]
          : cwd.includes('current')
          ? path.dirname(cwd)
          : cwd;
        const diskCache2 = path.join(siteRoot, 'shared_uploads', safePath);

        Promise.all([
          mkdir(path.dirname(diskCache1), { recursive: true }).then(() => writeFile(diskCache1, buffer)).catch(() => {}),
          mkdir(path.dirname(diskCache2), { recursive: true }).then(() => writeFile(diskCache2, buffer)).catch(() => {}),
        ]).catch(() => {});

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (dbErr) {
      console.error('[uploads] db lookup failed:', dbErr);
    }

    // 3. Fallback: return transparent 1x1 PNG with 404 instead of broken image or wrong salad bowl
    return new NextResponse(TRANSPARENT_PNG, {
      status: 404,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (e) {
    console.error('[uploads] handler error:', e);
    return new NextResponse(TRANSPARENT_PNG, {
      status: 500,
      headers: { 'Content-Type': 'image/png' },
    });
  }
}
