export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    MANAGER: 'ROLE_MANAGER',
    CASHIER: 'ROLE_CASHIER',
    INVENTORY_MANAGER: 'ROLE_INVENTORY_MANAGER',
    PURCHASE_MANAGER: 'ROLE_PURCHASE_MANAGER',
    SALES_MANAGER: 'ROLE_SALES_MANAGER',
    ACCOUNTANT: 'ROLE_ACCOUNTANT',
    EMPLOYEE: 'ROLE_EMPLOYEE',
} as const;

export const ROLE_DISPLAY_NAMES = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.CASHIER]: 'Cashier',
    [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
    [ROLES.PURCHASE_MANAGER]: 'Purchase Manager',
    [ROLES.SALES_MANAGER]: 'Sales Manager',
    [ROLES.ACCOUNTANT]: 'Accountant',
    [ROLES.EMPLOYEE]: 'Employee',
} as const;

export const ROLE_DESCRIPTIONS = {
    [ROLES.ADMIN]: 'Full system access with all permissions',
    [ROLES.MANAGER]: 'Manage day-to-day operations with departmental access',
    [ROLES.CASHIER]: 'Handle POS operations and customer transactions',
    [ROLES.INVENTORY_MANAGER]: 'Manage inventory, stock movements, and warehouses',
    [ROLES.PURCHASE_MANAGER]: 'Handle purchase orders and supplier management',
    [ROLES.SALES_MANAGER]: 'Oversee sales operations and team performance',
    [ROLES.ACCOUNTANT]: 'Manage finances, expenses, and reports',
    [ROLES.EMPLOYEE]: 'Basic access for regular staff members',
} as const;

export const ROLE_COLORS = {
    [ROLES.ADMIN]: '#EF4444',
    [ROLES.MANAGER]: '#F59E0B',
    [ROLES.CASHIER]: '#10B981',
    [ROLES.INVENTORY_MANAGER]: '#3B82F6',
    [ROLES.PURCHASE_MANAGER]: '#8B5CF6',
    [ROLES.SALES_MANAGER]: '#EC4899',
    [ROLES.ACCOUNTANT]: '#14B8A6',
    [ROLES.EMPLOYEE]: '#6B7280',
} as const;

export const ROLE_ICONS = {
    [ROLES.ADMIN]: 'shield-crown',
    [ROLES.MANAGER]: 'account-tie',
    [ROLES.CASHIER]: 'cash-register',
    [ROLES.INVENTORY_MANAGER]: 'package-variant',
    [ROLES.PURCHASE_MANAGER]: 'truck',
    [ROLES.SALES_MANAGER]: 'chart-line',
    [ROLES.ACCOUNTANT]: 'calculator',
    [ROLES.EMPLOYEE]: 'account',
} as const;

export const DEFAULT_ROLES = [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.CASHIER,
    ROLES.INVENTORY_MANAGER,
    ROLES.PURCHASE_MANAGER,
    ROLES.SALES_MANAGER,
    ROLES.ACCOUNTANT,
    ROLES.EMPLOYEE,
] as const;

export type Role = typeof ROLES[keyof typeof ROLES];