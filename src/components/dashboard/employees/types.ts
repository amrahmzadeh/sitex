export interface EmployeePermissionItem {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export interface EmployeeOrganization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

export interface EmployeeItem {
  id: string;
  userId: string;
  adminId: string;
  organizationId?: string | null;
  organization?: EmployeeOrganization | null;
  fullName: string;
  email: string;
  username?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
  notes?: string | null;
  position?: string | null;
  department?: string | null;
  workSchedule?: string | null;
  startDate?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: EmployeePermissionItem[];
  _count?: {
    activityLogs: number;
  };
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
}

export interface SystemModule {
  id: string;
  label: string;
  category: 'main' | 'content' | 'settings' | 'system';
  description: string;
  actions: ('view' | 'create' | 'edit' | 'delete' | 'manage')[];
}

export interface ActivityLogItem {
  id: string;
  action: string;
  module?: string | null;
  description?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

