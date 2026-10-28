import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-m4v',
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
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
    const membership = await verifyAccess(orgId);
    if (!membership) {
      return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Fayl tələb olunur' }, { status: 400 });
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type) || file.type.startsWith('video/');
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Yalnız şəkil (JPEG, PNG, WebP) və video (MP4, WebM, MOV) faylları qəbul edilir' },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fayl ölçüsü ${isVideo ? '100MB' : '15MB'}-dan böyük ola bilməz` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = path.extname(file.name) || (isVideo ? '.mp4' : '.jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;

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
          filename: file.name,
          url,
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          size: file.size,
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
