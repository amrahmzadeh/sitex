import test from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_MODULES, checkPermission } from '../src/lib/permissions';
import { isNavItemVisible } from '../src/modules/navigation/guards';
import { employeeCreateSchema, employeeUpdateSchema } from '../src/lib/validations';
import { dashboardNavItems } from '../src/modules/navigation/config';

test('Employees: SYSTEM_MODULES holds complete catalog with actions', () => {
  assert.ok(SYSTEM_MODULES.length >= 15, 'Should have at least 15 system modules');
  const menuModule = SYSTEM_MODULES.find((m) => m.id === 'menu');
  assert.ok(menuModule, 'Menu module should exist');
  assert.deepEqual(menuModule?.actions, ['view', 'create', 'edit', 'delete', 'manage']);

  const employeeModule = SYSTEM_MODULES.find((m) => m.id === 'employees');
  assert.ok(employeeModule, 'Employees module should exist');
});

test('Employees: Navigation visibility respects employee permissions', () => {
  const menuItem = dashboardNavItems.find((i) => i.id === 'menu');
  assert.ok(menuItem, 'Menu nav item must exist');

  const siteContext = {
    category: 'restoran-ve-qida-sayti',
    subcategory: 'restoran',
  };

  // 1. Employee with menu view permission can see menu
  const canSeeMenu = isNavItemVisible(
    menuItem,
    siteContext,
    'EMPLOYEE',
    { menu: { canView: true } }
  );
  assert.equal(canSeeMenu, true, 'Employee with menu:canView should see menu in sidebar');

  // 2. Employee without menu view permission cannot see menu
  const cannotSeeMenu = isNavItemVisible(
    menuItem,
    siteContext,
    'EMPLOYEE',
    { menu: { canView: false } }
  );
  assert.equal(cannotSeeMenu, false, 'Employee with menu:canView=false should not see menu');

  // 3. Employee cannot see admin-only items (e.g. theme) even if granted in perms
  const themeItem = dashboardNavItems.find((i) => i.id === 'theme');
  assert.ok(themeItem, 'Theme item exists');
  const cannotSeeTheme = isNavItemVisible(
    themeItem,
    siteContext,
    'EMPLOYEE',
    { theme: { canView: true } }
  );
  assert.equal(cannotSeeTheme, false, 'Employee should never see adminOnly items like theme');

  // 4. Employees module is hidden from employee by default unless explicitly granted
  const empItem = dashboardNavItems.find((i) => i.id === 'employees');
  assert.ok(empItem, 'Employees item exists');
  const defaultEmpHidden = isNavItemVisible(
    empItem,
    siteContext,
    'EMPLOYEE',
    {}
  );
  assert.equal(defaultEmpHidden, false, 'Employees module should be hidden by default from employee');

  const empGranted = isNavItemVisible(
    empItem,
    siteContext,
    'EMPLOYEE',
    { employees: { canView: true } }
  );
  assert.equal(empGranted, true, 'Employees module should be visible when canView granted');
});

test('Employees: Validation schema enforces required fields', () => {
  // Invalid: missing required fullName and password
  const invalidResult = employeeCreateSchema.safeParse({
    fullName: '',
    email: 'not-an-email',
    password: '123',
  });
  assert.equal(invalidResult.success, false, 'Empty or invalid data must fail validation');

  // Valid employee creation payload
  const validResult = employeeCreateSchema.safeParse({
    fullName: 'Rəşad Əliyev',
    email: 'rashad@example.com',
    username: 'rashad_a',
    password: 'securePassword123',
    position: 'Baş Menecer',
    department: 'İdarəetmə',
    workSchedule: 'Tam iş günü',
    status: 'ACTIVE',
    permissions: [
      { module: 'menu', canView: true, canCreate: true, canEdit: true, canDelete: false, canManage: false },
      { module: 'products', canView: true, canCreate: false, canEdit: false, canDelete: false, canManage: false },
    ],
  });
  assert.equal(validResult.success, true, 'Valid payload must succeed');
  if (validResult.success) {
    assert.equal(validResult.data.fullName, 'Rəşad Əliyev');
    assert.equal(validResult.data.permissions.length, 2);
  }
});

