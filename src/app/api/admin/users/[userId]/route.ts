import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse, logAudit, deleteUserOrganizations } from '@/lib/admin';
import { prisma } from '@/lib/db';

// GET /api/admin/users/[userId] — get single user detail
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      role: true,
      subscriptionExpiry: true,
      maxSites: true,
      memberships: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              createdAt: true,
              website: { select: { isPublished: true } },
            },
          },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 });

  return NextResponse.json({ user });
}

// PATCH /api/admin/users/[userId] — update user (ban, subscription, maxSites, name, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { userId } = await params;

  const body = await req.json();
  const { status, subscriptionExpiry, maxSites, name } = body;

  // Protect: cannot ban/delete the last super admin
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!targetUser) return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 });

  if (targetUser.role === 'SUPER_ADMIN' && status === 'BANNED') {
    // Check if this is the last active super admin
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
    });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: 'Son aktiv Super Admin bloklanıla bilməz' },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (status !== undefined) updateData.status = status;
  if (subscriptionExpiry !== undefined) {
    updateData.subscriptionExpiry = subscriptionExpiry ? new Date(subscriptionExpiry) : null;
  }
  if (maxSites !== undefined) updateData.maxSites = maxSites === null ? null : Number(maxSites);
  if (name !== undefined) updateData.name = name;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true, name: true, email: true, status: true,
      subscriptionExpiry: true, maxSites: true, role: true,
    },
  });

  // Log
  await logAudit(admin.id, 'UPDATE_USER', 'USER', userId, {
    changes: Object.keys(updateData),
  });

  return NextResponse.json({ user: updated });
}

// DELETE /api/admin/users/[userId] — permanently delete user
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const { userId } = await params;

  // Prevent self-deletion
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Öz hesabınızı silə bilməzsiniz' }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  if (!targetUser) return NextResponse.json({ error: 'İstifadəçi tapılmadı' }, { status: 404 });

  // Protect last super admin
  if (targetUser.role === 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' },
    });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: 'Son Super Admin hesabı silinə bilməz' },
        { status: 400 }
      );
    }
  }

  // Delete all organizations owned by this user (cascades all related data)
  await deleteUserOrganizations(userId);

  // Delete user (memberships cascade)
  await prisma.user.delete({ where: { id: userId } });

  // Log (actor is the admin; target user already deleted)
  await logAudit(admin.id, 'DELETE_USER', 'USER', userId, { email: targetUser.email });

  return NextResponse.json({ success: true });
}

