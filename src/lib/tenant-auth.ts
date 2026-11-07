/**
 * Merkezi tenant erişim kontrolü.
 * Tüm organization API route'ları bu fonksiyonu kullanmalıdır.
 *
 * Kontroller (sırasıyla):
 *  1. Geçerli oturum var mı
 *  2. Kullanıcı BANNED mı (DB'den, JWT'ye güvenme)
 *  3. subscriptionExpiry geçmiş mi (SUPER_ADMIN hariç)
 *  4. Organizasyon üyeliği var mı (SUPER_ADMIN tüm org'lara erişir)
 *  5. Gerekli rol yeterli mi
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

type MembershipRole = 'OWNER' | 'ADMIN' | 'EDITOR';

/** Rol hiyerarşisi: OWNER > ADMIN > EDITOR */
const ROLE_LEVEL: Record<MembershipRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  EDITOR: 1,
};

export type TenantAccessSuccess = {
  ok: true;
  userId: string;
  userRole: string;         // User.role (SUPER_ADMIN | USER | EMPLOYEE)
  membershipRole: MembershipRole | null; // Membership.role (null for SUPER_ADMIN without membership)
  membership: { id: string; role: MembershipRole; userId: string; organizationId: string } | null;
};

export type TenantAccessFailure = {
  ok: false;
  status: number;
  error: string;
};

export type TenantAccessResult = TenantAccessSuccess | TenantAccessFailure;

/**
 * Organizasyon düzeyinde erişim kontrolü.
 * @param orgId - Organizasyon ID
 * @param requiredRole - Minimum gerekli rol (opsiyonel). EDITOR < ADMIN < OWNER
 */
export async function verifyTenantAccess(
  orgId: string,
  requiredRole?: MembershipRole,
): Promise<TenantAccessResult> {
  // 1. Oturum kontrolü
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, status: 401, error: 'Giriş tələb olunur' };
  }

  const userId = (session.user as { id: string }).id;

  // 2. DB'den kullanıcı durumu (JWT'ye güvenme)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, subscriptionExpiry: true, role: true },
  });

  if (!user) {
    return { ok: false, status: 401, error: 'İstifadəçi tapılmadı' };
  }

  if (user.status === 'BANNED') {
    return { ok: false, status: 403, error: 'Hesabınız bloklanmışdır' };
  }

  // 3. Abonelik süresi (SUPER_ADMIN hariç)
  if (
    user.role !== 'SUPER_ADMIN' &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) < new Date()
  ) {
    return { ok: false, status: 403, error: 'İstifadə müddətiniz bitmişdir' };
  }

  // 4. Organizasyon üyeliği
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });

  if (!membership && user.role !== 'SUPER_ADMIN') {
    return { ok: false, status: 403, error: 'Bu təşkilata giriş icazəniz yoxdur' };
  }

  // 5. Rol kontrolü
  const membershipRole = membership?.role as MembershipRole | undefined;

  if (requiredRole && membershipRole) {
    if (ROLE_LEVEL[membershipRole] < ROLE_LEVEL[requiredRole]) {
      return {
        ok: false,
        status: 403,
        error: `Bu əməliyyat üçün minimum ${requiredRole} səlahiyyəti lazımdır`,
      };
    }
  }

  return {
    ok: true,
    userId,
    userRole: user.role,
    membershipRole: membershipRole ?? null,
    membership: membership as TenantAccessSuccess['membership'],
  };
}

/** Hata sonucunu NextResponse'a çevirir */
export function tenantError(result: TenantAccessFailure): NextResponse {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

