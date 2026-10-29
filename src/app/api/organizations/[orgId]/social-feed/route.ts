import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function verifyAccess(orgId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as { id: string }).id;
  return prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('facebook.com') || u.includes('fb.com')) return 'facebook';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  return 'other';
}

function detectIsVideo(url: string, platform: string): boolean {
  const u = url.toLowerCase();
  if (platform === 'tiktok') return true;
  if (platform === 'youtube') return true;
  if (u.includes('/reel/')) return true;
  if (u.includes('/p/') && !u.includes('/reel/')) return false;
  return false;
}

// GET - list all social feed posts for an org
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

    const posts = await prisma.socialFeedPost.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ posts });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// POST - add a new post URL
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

    const body = await req.json();
    const { postUrl, caption, thumbnailUrl, authorName, authorHandle, authorAvatar, likes, comments } = body;

    if (!postUrl) return NextResponse.json({ error: 'Post URL lazımdır' }, { status: 400 });

    const platform = detectPlatform(postUrl);
    const isVideo = detectIsVideo(postUrl, platform);

    // Auto-fetch metadata if not provided
    let finalThumb = thumbnailUrl || null;
    let finalCaption = caption || null;
    let finalAuthor = authorName || null;

    if ((!finalThumb || !finalCaption) && platform === 'youtube') {
      try {
        const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(postUrl)}&format=json`, {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const d = await res.json();
          if (!finalThumb && d.thumbnail_url) finalThumb = d.thumbnail_url;
          if (!finalCaption && d.title) finalCaption = d.title;
          if (!finalAuthor && d.author_name) finalAuthor = d.author_name;
        }
      } catch {}
    }

    // Count existing posts for sortOrder
    const count = await prisma.socialFeedPost.count({ where: { organizationId: orgId } });

    const post = await prisma.socialFeedPost.create({
      data: {
        organizationId: orgId,
        platform,
        postUrl: postUrl.trim(),
        thumbnailUrl: finalThumb,
        caption: finalCaption,
        authorName: finalAuthor,
        authorHandle: authorHandle || null,
        authorAvatar: authorAvatar || null,
        likes: likes || 0,
        comments: comments || 0,
        isVideo,
        sortOrder: count,
        isVisible: true,
      },
    });

    return NextResponse.json({ post });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}

// PUT - reorder / bulk update
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const membership = await verifyAccess(orgId);
    if (!membership) return NextResponse.json({ error: 'İcazəsiz' }, { status: 401 });

    const body = await req.json();
    const posts: Array<{ id: string; sortOrder?: number; isVisible?: boolean; caption?: string }> = body.posts || [];

    await Promise.all(
      posts.map((p) =>
        prisma.socialFeedPost.updateMany({
          where: { id: p.id, organizationId: orgId },
          data: {
            sortOrder: p.sortOrder,
            isVisible: p.isVisible,
            caption: p.caption,
          },
        })
      )
    );

    const updated = await prisma.socialFeedPost.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ posts: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Xəta' }, { status: 500 });
  }
}
