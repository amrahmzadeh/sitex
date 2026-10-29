import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Returns the super admin user if session is valid, else null
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true },
  });

  if (!user || user.role !== 'SUPER_ADMIN' || user.status !== 'ACTIVE') {
    return null;
  }

  return user;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'İcazəsiz giriş' }, { status: 403 });
}

// Check user account validity for regular operations
export async function checkUserAccess(userId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, subscriptionExpiry: true },
  });

  if (!user) return { ok: false, error: 'İstifadəçi tapılmadı' };
  if (user.status === 'BANNED') return { ok: false, error: 'Hesabınız bloklanmışdır' };
  if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
    return { ok: false, error: 'İstifadə müddətiniz bitib' };
  }

  return { ok: true };
}

// Check if user can create a new site
export async function checkSiteLimit(userId: string): Promise<{ ok: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { maxSites: true, _count: { select: { memberships: true } } },
  });

  if (!user) return { ok: false, error: 'İstifadəçi tapılmadı' };

  const maxSites = user.maxSites; // null = unlimited
  if (maxSites !== null && user._count.memberships >= maxSites) {
    return { ok: false, error: `Maksimum sayt limitinə çatmısınız (${maxSites} sayt)` };
  }

  return { ok: true };
}

// Log audit action
export async function logAudit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch {
    // Non-critical: don't fail the main operation
  }
}

// Delete organization and all related data
export async function deleteOrganizationCascade(orgId: string): Promise<void> {
  // Prisma cascade handles DB records via onDelete: Cascade on Organization relations
  // We need to delete the org; all related records cascade automatically:
  // Website, MenuCategory, MenuItem, MenuItemImage, MediaAsset,
  // WhatsAppSettings, SocialLink, WorkingHours, QRSettings, SocialFeedPost, Membership
  await prisma.organization.delete({ where: { id: orgId } });
}

// Delete all organizations for a user
export async function deleteUserOrganizations(userId: string): Promise<void> {
  const memberships = await prisma.membership.findMany({
    where: { userId, role: 'OWNER' },
    select: { organizationId: true },
  });

  for (const m of memberships) {
    await deleteOrganizationCascade(m.organizationId);
  }
}

// Get platform setting value
export async function getPlatformSetting(key: string, defaultValue = 'true'): Promise<string> {
  try {
    const setting = await prisma.platformSettings.findUnique({ where: { key } });
    return setting?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

