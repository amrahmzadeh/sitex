import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Ad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır'),
});

export const loginSchema = z.object({
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  password: z.string().min(1, 'Şifrə tələb olunur'),
});

export const organizationSchema = z.object({
  name: z.string().min(2, 'İşletmə adı ən azı 2 simvol olmalıdır'),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('Düzgün e-poçt daxil edin').nullable().optional().or(z.literal('')).or(z.null()),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  mapUrl: z.string().nullable().optional(),
  siteCategory: z.string().max(80).nullable().optional(),
  siteSubcategory: z.string().max(80).nullable().optional(),
});

// Sayt yaratma sorğusu: sayt növü və şablon seçimi əlavə olunur.
// Sahələr nullable-dir ki, köhnə klientlər və mövcud saytlar sıradan çıxmasın.
export const createOrganizationSchema = organizationSchema.extend({
  siteCategory: z.string().max(80).nullable().optional(),
  siteSubcategory: z.string().max(80).nullable().optional(),
  templateId: z.string().max(80).nullable().optional(),
});

export const menuCategorySchema = z.object({
  name: z.string().min(1, 'Kateqoriya adı tələb olunur'),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Yemək adı tələb olunur'),
  description: z.string().nullable().optional(),
  longDescription: z.string().nullable().optional(),
  price: z.number().min(0, 'Qiymət mənfi ola bilməz'),
  discountPrice: z.number().min(0, 'Endirimli qiymət mənfi ola bilməz').nullable().optional(),
  categoryId: z.string().min(1, 'Kateqoriya seçin'),
  image: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
  ingredients: z.string().nullable().optional(),
  allergens: z.string().nullable().optional(),
  portionSize: z.string().nullable().optional(),
  prepTime: z.string().nullable().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  isSet: z.boolean().default(false),
  setItems: z.string().nullable().optional(),
});

export const whatsappSchema = z.object({
  countryCode: z.string().default('+994'),
  phoneNumber: z.string().min(7, 'Telefon nömrəsi tələb olunur'),
  orderMessage: z.string().optional(),
  buttonText: z.string().optional(),
  contactNumber: z.string().optional(),
  isEnabled: z.boolean().default(true),
});

export const themeSchema = z.object({
  primaryColor: z.string().default('#D4A574'),
  secondaryColor: z.string().default('#2C1810'),
  accentColor: z.string().default('#E8C9A0'),
  backgroundColor: z.string().default('#FFF8F0'),
  textColor: z.string().default('#1A1A1A'),
  headingFont: z.string().default('Playfair Display'),
  bodyFont: z.string().default('Inter'),
  borderRadius: z.string().default('12px'),
  heroHeight: z.string().default('80vh'),
  heroOverlay: z.number().min(0).max(1).default(0.4),
  templateId: z.string().default('elegant'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrganizationInput = z.infer<typeof organizationSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type MenuCategoryInput = z.infer<typeof menuCategorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type WhatsAppInput = z.infer<typeof whatsappSchema>;
export type ThemeConfig = z.infer<typeof themeSchema>;

export const employeePermissionSchema = z.object({
  module: z.string().min(1),
  canView: z.boolean().default(true),
  canCreate: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
  canManage: z.boolean().default(false),
});

export const employeeCreateSchema = z.object({
  fullName: z.string().min(2, 'Ad və soyad ən azı 2 simvol olmalıdır'),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  username: z.string().min(3, 'İstifadəçi adı ən azı 3 simvol olmalıdır').regex(/^[a-zA-Z0-9._-]+$/, 'İstifadəçi adı yalnız hərf, rəqəm, nöqtə və tire ola bilər').optional().or(z.literal('')),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır'),
  phone: z.string().optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable().or(z.literal('')),
  avatarUrl: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
  position: z.string().optional().nullable().or(z.literal('')),
  department: z.string().optional().nullable().or(z.literal('')),
  workSchedule: z.string().default('Tam iş günü'),
  startDate: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).default('ACTIVE'),
  organizationId: z.string().optional().nullable().or(z.literal('')),
  permissions: z.array(employeePermissionSchema).default([]),
});

export const employeeUpdateSchema = z.object({
  fullName: z.string().min(2, 'Ad və soyad ən azı 2 simvol olmalıdır').optional(),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin').optional(),
  username: z.string().min(3, 'İstifadəçi adı ən azı 3 simvol olmalıdır').regex(/^[a-zA-Z0-9._-]+$/, 'İstifadəçi adı yalnız hərf, rəqəm, nöqtə və tire ola bilər').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable().or(z.literal('')),
  avatarUrl: z.string().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable().or(z.literal('')),
  notes: z.string().optional().nullable().or(z.literal('')),
  position: z.string().optional().nullable().or(z.literal('')),
  department: z.string().optional().nullable().or(z.literal('')),
  workSchedule: z.string().optional(),
  startDate: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']).optional(),
  organizationId: z.string().optional().nullable().or(z.literal('')),
  baseSalary: z.number().optional().nullable(),
  salaryType: z.string().optional().nullable(),
  permissions: z.array(employeePermissionSchema).optional(),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
export type EmployeePermissionInput = z.infer<typeof employeePermissionSchema>;
