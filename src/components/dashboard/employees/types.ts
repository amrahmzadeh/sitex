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
  baseSalary?: number | null;
  salaryType?: string | null;
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

// ========== Finance & Performance Types ==========

export type BonusType = 'CASH' | 'GIFT' | 'EXTRA_LEAVE' | 'OTHER';
export type PenaltyType = 'FINE' | 'WARNING' | 'SUSPENSION' | 'OTHER';
export type SalaryStatus = 'PENDING' | 'APPROVED' | 'PAID';
export type WorkLogStatus = 'PENDING' | 'APPROVED' | 'PAID';

export interface EmployeeRating {
  id: string;
  employeeId: string;
  stars: number;
  note?: string | null;
  ratedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeBonus {
  id: string;
  employeeId: string;
  name: string;
  reason?: string | null;
  amount: number;
  bonusType: BonusType;
  givenAt: string;
  description?: string | null;
  approvedById?: string | null;
  createdAt: string;
}

export interface EmployeePenalty {
  id: string;
  employeeId: string;
  reason: string;
  amount: number;
  penaltyType: PenaltyType;
  incidentAt: string;
  description?: string | null;
  decidedById?: string | null;
  createdAt: string;
}

export interface EmployeeSalary {
  id: string;
  employeeId: string;
  periodYear: number;
  periodMonth: number;
  baseSalary: number;
  workLogTotal: number;
  bonusTotal: number;
  penaltyTotal: number;
  totalGross: number;
  totalDeduction: number;
  totalNet: number;
  paidAmount: number;
  balance: number;
  status: SalaryStatus;
  note?: string | null;
  approvedById?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface EmployeeWorkLog {
  id: string;
  employeeId: string;
  title: string;
  description?: string | null;
  amount: number;
  completedAt: string;
  status: WorkLogStatus;
  createdAt: string;
}


