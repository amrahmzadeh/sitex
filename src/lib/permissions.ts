import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export interface SystemModuleDefinition {
  id: string;
  label: string;
  category: 'main' | 'content' | 'settings' | 'system';
  description: string;
  actions: PermissionAction[];
}

export const SYSTEM_MODULES: SystemModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Ana Səhifə',
    category: 'main',
    description: 'Ümumi statistika və sistem məlumatları',
    actions: ['view'],
  },
  {
    id: 'website',
    label: 'Veb Saytım',
    category: 'main',
    description: 'Saytın əsas tənzimləmələri və önizləməsi',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'site-editor',
    label: 'Saytı Redaktə et',
    category: 'content',
    description: 'Saytın blokları və mətnlərinin redaktəsi',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'theme',
    label: 'Tema Kitabxanası',
    category: 'settings',
    description: 'Saytın dizayn temasının seçilməsi və idarəsi',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'menu',
    label: 'Menyu',
    category: 'content',
    description: 'Menyu kateqoriyaları və təamların idarəsi',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'services',
    label: 'Xidmətlər',
    category: 'content',
    description: 'Təqdim olunan xidmətlərin idarəsi',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'products',
    label: 'Məhsullar',
    category: 'content',
    description: 'Məhsulların kataloqu və qiymətlər',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'packages',
    label: 'Paketlər',
    category: 'content',
    description: 'Xidmət və qiymət paketlərinin idarəsi',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'gallery',
    label: 'Qalareya',
    category: 'content',
    description: 'Foto və video qalareyanın idarəsi',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'social',
    label: 'Sosial Media',
    category: 'content',
    description: 'Sosial şəbəkə hesabları və paylaşımlar',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  {
    id: 'inquiries',
    label: 'Müraciətlər',
    category: 'main',
    description: 'Saytdan daxil olan əlaqə və sifariş müraciətləri',
    actions: ['view', 'edit', 'delete', 'manage'],
  },
  {
    id: 'media',
    label: 'Media Kitabxanası',
    category: 'content',
    description: 'Şəkil və fayl yükləmələri',
    actions: ['view', 'create', 'delete', 'manage'],
  },
  {
    id: 'whatsapp',
    label: 'Sifariş Ayarları',
    category: 'settings',
    description: 'WhatsApp və əlaqə nömrələri tənzimləmələri',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'working-hours',
    label: 'İş Saatları',
    category: 'settings',
    description: 'İş qrafiki və fasilələrin idarəsi',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'qr',
    label: 'QR Yaradıcı',
    category: 'settings',
    description: 'QR kodların dizaynı və generasiyası',
    actions: ['view', 'create', 'edit', 'manage'],
  },
  {
    id: 'site-modules',
    label: 'Sayt Modulları',
    category: 'content',
    description: 'Saytın aktiv bloklarının və modullarının idarəsi',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'analytics',
    label: 'Analitika',
    category: 'main',
    description: 'Baxış və ziyarətçi statistikaları',
    actions: ['view'],
  },
  {
    id: 'export-import',
    label: 'Export / Import',
    category: 'settings',
    description: 'Məlumatların ehtiyat nüsxəsi və bərpası',
    actions: ['view', 'create', 'manage'],
  },
  {
    id: 'settings',
    label: 'Parametrlər',
    category: 'settings',
    description: 'Müəssisə və saytın əsas parametrləri',
    actions: ['view', 'edit', 'manage'],
  },
  {
    id: 'employees',
    label: 'Əməkdaşlar',
    category: 'system',
    description: 'Əməkdaşların və onların hüquqlarının idarəsi',
    actions: ['view', 'create', 'edit', 'delete', 'manage'],
  },
];

export interface ModulePermissionMap {
  [moduleId: string]: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManage: boolean;
  };
}

/**
 * Get all permissions for an employee as a dictionary
 */
export async function getEmployeePermissionsMap(employeeId: string): Promise<ModulePermissionMap> {
  const permissions = await prisma.employeePermission.findMany({
    where: { employeeId },
  });

  const map: ModulePermissionMap = {};
  for (const perm of permissions) {
    map[perm.module] = {
      canView: perm.canView,
      canCreate: perm.canCreate,
      canEdit: perm.canEdit,
      canDelete: perm.canDelete,
      canManage: perm.canManage,
    };
  }

  return map;
}

/**
 * Check if a user has permission to perform an action on a module
 */
export async function checkPermission(
  userId: string,
  userRole: string | undefined,
  module: string,
  action: PermissionAction = 'view'
): Promise<boolean> {
  // Super Admin has unrestricted access to everything
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // Normal USER (Site owner/admin) has full access to their modules
  if (userRole === 'USER') {
    return true;
  }

  // Only EMPLOYEE role is evaluated against specific permissions
  if (userRole === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        permissions: {
          where: { module },
        },
      },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      return false;
    }

    const perm = employee.permissions[0];
    if (!perm) {
      return false;
    }

    if (perm.canManage) {
      return true;
    }

    switch (action) {
      case 'view':
        return perm.canView;
      case 'create':
        return perm.canCreate;
      case 'edit':
        return perm.canEdit;
      case 'delete':
        return perm.canDelete;
      case 'manage':
        return perm.canManage;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Log employee activity in audit log
 */
export async function logEmployeeActivity(
  employeeId: string,
  action: string,
  module?: string,
  description?: string,
  req?: Request,
  metadata?: any
) {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (req) {
      ipAddress =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        null;
      userAgent = req.headers.get('user-agent') || null;
    }

    await prisma.employeeActivityLog.create({
      data: {
        employeeId,
        action,
        module,
        description,
        ipAddress,
        userAgent,
        metadata: metadata ? metadata : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log employee activity:', error);
  }
}

/**
 * Verify organization access and check real-time employee permissions
 */
export async function verifyOrgPermission(
  orgId: string,
  module: string,
  action: PermissionAction = 'view'
): Promise<
  | { ok: true; userId: string; role: string; employeeId?: string }
  | { ok: false; error: string; status: number }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, error: 'İcazəsiz giriş', status: 401 };
  }

  const userId = (session.user as { id: string }).id;
  const userRole = (session.user as { role?: string }).role;

  // DB'den kullanıcı durumunu kontrol et (JWT'ye güvenme)
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, subscriptionExpiry: true },
  });

  if (!dbUser || dbUser.status === 'BANNED') {
    return { ok: false, error: 'Hesabınız bloklanmışdır', status: 403 };
  }

  if (
    userRole !== 'SUPER_ADMIN' &&
    dbUser.subscriptionExpiry &&
    new Date(dbUser.subscriptionExpiry) < new Date()
  ) {
    return { ok: false, error: 'İstifadə müddətiniz bitmişdir', status: 403 };
  }

  // Super Admin has all access
  if (userRole === 'SUPER_ADMIN') {
    return { ok: true, userId, role: userRole };
  }

  // Check membership in organization
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });

  if (!membership) {
    return { ok: false, error: 'Bu sayta çıxış hüququnuz yoxdur', status: 403 };
  }

  // If user is owner / admin
  if (userRole === 'USER') {
    return { ok: true, userId, role: membership.role };
  }

  // If user is employee: check real-time DB permissions
  if (userRole === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        permissions: {
          where: { module },
        },
      },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      return { ok: false, error: 'Əməkdaş hesabı deaktivdir və ya mövcud deyil', status: 403 };
    }

    // Ensure employee belongs to this organization if assigned
    if (employee.organizationId && employee.organizationId !== orgId) {
      return { ok: false, error: 'Bu sayt üçün icazəniz yoxdur', status: 403 };
    }

    const perm = employee.permissions[0];
    if (!perm) {
      return { ok: false, error: `"${module}" moduluna icazəniz yoxdur`, status: 403 };
    }

    if (perm.canManage) {
      return { ok: true, userId, role: 'EMPLOYEE', employeeId: employee.id };
    }

    let allowed = false;
    if (action === 'view') allowed = perm.canView;
    else if (action === 'create') allowed = perm.canCreate;
    else if (action === 'edit') allowed = perm.canEdit;
    else if (action === 'delete') allowed = perm.canDelete;
    else if (action === 'manage') allowed = perm.canManage;

    if (!allowed) {
      return {
        ok: false,
        error: `Bu əməliyyatı (${action}) icra etmək icazəniz yoxdur`,
        status: 403,
      };
    }

    return { ok: true, userId, role: 'EMPLOYEE', employeeId: employee.id };
  }

  return { ok: false, error: 'İcazəsiz giriş', status: 403 };
}
