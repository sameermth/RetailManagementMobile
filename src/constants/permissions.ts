export const PERMISSIONS = {
    // Product permissions
    PRODUCT: {
        VIEW: 'PRODUCT_VIEW',
        CREATE: 'PRODUCT_CREATE',
        EDIT: 'PRODUCT_EDIT',
        DELETE: 'PRODUCT_DELETE',
        IMPORT: 'PRODUCT_IMPORT',
        EXPORT: 'PRODUCT_EXPORT',
    },

    // Category permissions
    CATEGORY: {
        VIEW: 'CATEGORY_VIEW',
        CREATE: 'CATEGORY_CREATE',
        EDIT: 'CATEGORY_EDIT',
        DELETE: 'CATEGORY_DELETE',
    },

    // Brand permissions
    BRAND: {
        VIEW: 'BRAND_VIEW',
        CREATE: 'BRAND_CREATE',
        EDIT: 'BRAND_EDIT',
        DELETE: 'BRAND_DELETE',
    },

    // Inventory permissions
    INVENTORY: {
        VIEW: 'INVENTORY_VIEW',
        ADJUST: 'INVENTORY_ADJUST',
        TRANSFER: 'INVENTORY_TRANSFER',
        COUNT: 'INVENTORY_COUNT',
        REPORT: 'INVENTORY_REPORT',
    },

    // Warehouse permissions
    WAREHOUSE: {
        VIEW: 'WAREHOUSE_VIEW',
        CREATE: 'WAREHOUSE_CREATE',
        EDIT: 'WAREHOUSE_EDIT',
        DELETE: 'WAREHOUSE_DELETE',
    },

    // Sales permissions
    SALE: {
        VIEW: 'SALE_VIEW',
        CREATE: 'SALE_CREATE',
        EDIT: 'SALE_EDIT',
        DELETE: 'SALE_DELETE',
        CANCEL: 'SALE_CANCEL',
        REFUND: 'SALE_REFUND',
        DISCOUNT: 'SALE_DISCOUNT',
    },

    // Payment permissions
    PAYMENT: {
        VIEW: 'PAYMENT_VIEW',
        CREATE: 'PAYMENT_CREATE',
        EDIT: 'PAYMENT_EDIT',
        DELETE: 'PAYMENT_DELETE',
        REFUND: 'PAYMENT_REFUND',
    },

    // Invoice permissions
    INVOICE: {
        VIEW: 'INVOICE_VIEW',
        CREATE: 'INVOICE_CREATE',
        EDIT: 'INVOICE_EDIT',
        DELETE: 'INVOICE_DELETE',
        PRINT: 'INVOICE_PRINT',
        EMAIL: 'INVOICE_EMAIL',
    },

    // Customer permissions
    CUSTOMER: {
        VIEW: 'CUSTOMER_VIEW',
        CREATE: 'CUSTOMER_CREATE',
        EDIT: 'CUSTOMER_EDIT',
        DELETE: 'CUSTOMER_DELETE',
        IMPORT: 'CUSTOMER_IMPORT',
        EXPORT: 'CUSTOMER_EXPORT',
        MANAGE_DUES: 'CUSTOMER_MANAGE_DUES',
        MANAGE_LOYALTY: 'CUSTOMER_MANAGE_LOYALTY',
    },

    // Supplier permissions
    SUPPLIER: {
        VIEW: 'SUPPLIER_VIEW',
        CREATE: 'SUPPLIER_CREATE',
        EDIT: 'SUPPLIER_EDIT',
        DELETE: 'SUPPLIER_DELETE',
        IMPORT: 'SUPPLIER_IMPORT',
        EXPORT: 'SUPPLIER_EXPORT',
        RATE: 'SUPPLIER_RATE',
    },

    // Purchase permissions
    PURCHASE: {
        VIEW: 'PURCHASE_VIEW',
        CREATE: 'PURCHASE_CREATE',
        EDIT: 'PURCHASE_EDIT',
        DELETE: 'PURCHASE_DELETE',
        APPROVE: 'PURCHASE_APPROVE',
        CANCEL: 'PURCHASE_CANCEL',
        RECEIVE: 'PURCHASE_RECEIVE',
    },

    // Distributor permissions
    DISTRIBUTOR: {
        VIEW: 'DISTRIBUTOR_VIEW',
        CREATE: 'DISTRIBUTOR_CREATE',
        EDIT: 'DISTRIBUTOR_EDIT',
        DELETE: 'DISTRIBUTOR_DELETE',
        MANAGE_ORDERS: 'DISTRIBUTOR_MANAGE_ORDERS',
        MANAGE_PAYMENTS: 'DISTRIBUTOR_MANAGE_PAYMENTS',
    },

    // Expense permissions
    EXPENSE: {
        VIEW: 'EXPENSE_VIEW',
        CREATE: 'EXPENSE_CREATE',
        EDIT: 'EXPENSE_EDIT',
        DELETE: 'EXPENSE_DELETE',
        APPROVE: 'EXPENSE_APPROVE',
        REJECT: 'EXPENSE_REJECT',
    },

    // Report permissions
    REPORT: {
        VIEW: 'REPORT_VIEW',
        GENERATE: 'REPORT_GENERATE',
        EXPORT: 'REPORT_EXPORT',
        SCHEDULE: 'REPORT_SCHEDULE',
        VIEW_SALES: 'REPORT_VIEW_SALES',
        VIEW_INVENTORY: 'REPORT_VIEW_INVENTORY',
        VIEW_FINANCIAL: 'REPORT_VIEW_FINANCIAL',
        VIEW_CUSTOMER: 'REPORT_VIEW_CUSTOMER',
    },

    // User permissions
    USER: {
        VIEW: 'USER_VIEW',
        CREATE: 'USER_CREATE',
        EDIT: 'USER_EDIT',
        DELETE: 'USER_DELETE',
        MANAGE_ROLES: 'USER_MANAGE_ROLES',
        MANAGE_PERMISSIONS: 'USER_MANAGE_PERMISSIONS',
        RESET_PASSWORD: 'USER_RESET_PASSWORD',
    },

    // Role permissions
    ROLE: {
        VIEW: 'ROLE_VIEW',
        CREATE: 'ROLE_CREATE',
        EDIT: 'ROLE_EDIT',
        DELETE: 'ROLE_DELETE',
        ASSIGN_PERMISSIONS: 'ROLE_ASSIGN_PERMISSIONS',
    },

    // Settings permissions
    SETTINGS: {
        VIEW: 'SETTINGS_VIEW',
        EDIT_STORE: 'SETTINGS_EDIT_STORE',
        EDIT_TAX: 'SETTINGS_EDIT_TAX',
        EDIT_INVOICE: 'SETTINGS_EDIT_INVOICE',
        EDIT_PRINT: 'SETTINGS_EDIT_PRINT',
        EDIT_BACKUP: 'SETTINGS_EDIT_BACKUP',
        EDIT_SYSTEM: 'SETTINGS_EDIT_SYSTEM',
        MANAGE_BACKUP: 'SETTINGS_MANAGE_BACKUP',
        VIEW_AUDIT: 'SETTINGS_VIEW_AUDIT',
    },

    // Dashboard permissions
    DASHBOARD: {
        VIEW: 'DASHBOARD_VIEW',
        CUSTOMIZE: 'DASHBOARD_CUSTOMIZE',
        EXPORT: 'DASHBOARD_EXPORT',
    },

    // Notification permissions
    NOTIFICATION: {
        VIEW: 'NOTIFICATION_VIEW',
        SEND: 'NOTIFICATION_SEND',
        MANAGE_TEMPLATES: 'NOTIFICATION_MANAGE_TEMPLATES',
        MANAGE_SETTINGS: 'NOTIFICATION_MANAGE_SETTINGS',
    },

    // System permissions
    SYSTEM: {
        VIEW_LOGS: 'SYSTEM_VIEW_LOGS',
        CLEAR_CACHE: 'SYSTEM_CLEAR_CACHE',
        PERFORM_BACKUP: 'SYSTEM_PERFORM_BACKUP',
        RESTORE_BACKUP: 'SYSTEM_RESTORE_BACKUP',
        UPDATE_SETTINGS: 'SYSTEM_UPDATE_SETTINGS',
    },

    // Data permissions
    DATA: {
        EXPORT: 'DATA_EXPORT',
        IMPORT: 'DATA_IMPORT',
        MIGRATE: 'DATA_MIGRATE',
        CLEAR: 'DATA_CLEAR',
    },
} as const;

export const PERMISSION_GROUPS = {
    PRODUCTS: 'Products',
    CATEGORIES: 'Categories',
    BRANDS: 'Brands',
    INVENTORY: 'Inventory',
    WAREHOUSES: 'Warehouses',
    SALES: 'Sales',
    PAYMENTS: 'Payments',
    INVOICES: 'Invoices',
    CUSTOMERS: 'Customers',
    SUPPLIERS: 'Suppliers',
    PURCHASES: 'Purchases',
    DISTRIBUTORS: 'Distributors',
    EXPENSES: 'Expenses',
    REPORTS: 'Reports',
    USERS: 'Users',
    ROLES: 'Roles',
    SETTINGS: 'Settings',
    DASHBOARD: 'Dashboard',
    NOTIFICATIONS: 'Notifications',
    SYSTEM: 'System',
    DATA: 'Data',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];
export type PermissionGroup = typeof PERMISSION_GROUPS[keyof typeof PERMISSION_GROUPS];