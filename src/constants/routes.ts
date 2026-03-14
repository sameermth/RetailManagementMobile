export const ROUTES = {
    // Auth Stack
    AUTH: {
        LOGIN: 'Login',
        REGISTER: 'Register',
        FORGOT_PASSWORD: 'ForgotPassword',
        RESET_PASSWORD: 'ResetPassword',
        VERIFY_EMAIL: 'VerifyEmail',
    },

    // Main Tabs
    MAIN: {
        DASHBOARD: 'Dashboard',
        POS: 'POS',
        PRODUCTS: 'Products',
        CUSTOMERS: 'Customers',
        MORE: 'More',
    },

    // Dashboard Stack
    DASHBOARD: {
        MAIN: 'DashboardMain',
        SALES_REPORT: 'SalesReport',
        INVENTORY_REPORT: 'InventoryReport',
        FINANCIAL_REPORT: 'FinancialReport',
    },

    // Products Stack
    PRODUCTS: {
        LIST: 'ProductList',
        DETAIL: 'ProductDetail',
        ADD: 'AddProduct',
        EDIT: 'EditProduct',
        CATEGORIES: 'Categories',
        BRANDS: 'Brands',
    },

    // Customers Stack
    CUSTOMERS: {
        LIST: 'CustomerList',
        DETAIL: 'CustomerDetail',
        ADD: 'AddCustomer',
        EDIT: 'EditCustomer',
        DUES: 'CustomerDues',
    },

    // Sales/POS Stack
    SALES: {
        LIST: 'SalesList',
        DETAIL: 'SaleDetail',
        POS: 'POS',
        CART: 'Cart',
        CHECKOUT: 'Checkout',
        PAYMENT: 'Payment',
        INVOICE: 'Invoice',
    },

    // Inventory Stack
    INVENTORY: {
        LIST: 'InventoryList',
        MOVEMENTS: 'StockMovements',
        LOW_STOCK: 'LowStockAlerts',
        WAREHOUSES: 'Warehouses',
        ADJUST_STOCK: 'AdjustStock',
        TRANSFER_STOCK: 'TransferStock',
    },

    // Suppliers Stack
    SUPPLIERS: {
        LIST: 'SupplierList',
        DETAIL: 'SupplierDetail',
        ADD: 'AddSupplier',
        EDIT: 'EditSupplier',
        CONTACTS: 'SupplierContacts',
        RATINGS: 'SupplierRatings',
    },

    // Purchases Stack
    PURCHASES: {
        LIST: 'PurchaseList',
        DETAIL: 'PurchaseDetail',
        CREATE: 'CreatePurchase',
        RECEIVE: 'ReceivePurchase',
    },

    // Expenses Stack
    EXPENSES: {
        LIST: 'ExpenseList',
        DETAIL: 'ExpenseDetail',
        ADD: 'AddExpense',
        CATEGORIES: 'ExpenseCategories',
        RECURRING: 'RecurringExpenses',
    },

    // Reports Stack
    REPORTS: {
        LIST: 'ReportList',
        VIEWER: 'ReportViewer',
        SALES: 'SalesReport',
        INVENTORY: 'InventoryReport',
        FINANCIAL: 'FinancialReport',
        SCHEDULED: 'ScheduledReports',
        CREATE_SCHEDULE: 'CreateSchedule',
    },

    // Distributors Stack
    DISTRIBUTORS: {
        LIST: 'DistributorList',
        DETAIL: 'DistributorDetail',
        ADD: 'AddDistributor',
        EDIT: 'EditDistributor',
        ORDERS: 'DistributorOrders',
        ORDER_DETAIL: 'DistributorOrderDetail',
        CREATE_ORDER: 'CreateDistributorOrder',
        PAYMENTS: 'DistributorPayments',
        CREATE_PAYMENT: 'CreateDistributorPayment',
    },

    // Users Stack
    USERS: {
        LIST: 'UserList',
        DETAIL: 'UserDetail',
        ADD: 'AddUser',
        EDIT: 'EditUser',
        CHANGE_PASSWORD: 'ChangePassword',
        ASSIGN_ROLES: 'AssignRoles',
    },

    // Roles Stack
    ROLES: {
        LIST: 'RoleList',
        DETAIL: 'RoleDetail',
        ADD: 'AddRole',
        EDIT: 'EditRole',
        ASSIGN_PERMISSIONS: 'AssignPermissions',
    },

    // Settings Stack
    SETTINGS: {
        MAIN: 'Settings',
        PROFILE: 'Profile',
        STORE: 'StoreSettings',
        TAX: 'TaxSettings',
        INVOICE: 'InvoiceSettings',
        PRINT: 'PrintSettings',
        BACKUP: 'BackupSettings',
        SYSTEM: 'SystemSettings',
        CHANGE_PASSWORD: 'ChangePassword',
        TWO_FACTOR: 'TwoFactorAuth',
        LOGIN_HISTORY: 'LoginHistory',
        NOTIFICATION_PREFERENCES: 'NotificationPreferences',
    },

    // Help Stack
    HELP: {
        CENTER: 'HelpCenter',
        FAQ: 'FAQ',
        CONTACT: 'ContactSupport',
        TUTORIALS: 'Tutorials',
        ABOUT: 'About',
    },

    // Notifications Stack
    NOTIFICATIONS: {
        LIST: 'NotificationList',
        DETAIL: 'NotificationDetail',
        SETTINGS: 'NotificationSettings',
    },

    // Audit Stack
    AUDIT: {
        LOGS: 'AuditLogs',
        DETAIL: 'AuditDetail',
    },

    // Backup Stack
    BACKUP: {
        LIST: 'BackupList',
        CREATE: 'CreateBackup',
        RESTORE: 'RestoreBackup',
        SCHEDULE: 'ScheduleBackup',
    },

    // Data Stack
    DATA: {
        EXPORT: 'ExportData',
        IMPORT: 'ImportData',
        MAPPING: 'DataMapping',
    },

    // More Stack
    MORE: {
        MENU: 'MoreMenu',
        SUPPLIERS: 'Suppliers',
        PURCHASES: 'Purchases',
        EXPENSES: 'Expenses',
        REPORTS: 'Reports',
        DISTRIBUTORS: 'Distributors',
        USERS: 'Users',
        ROLES: 'Roles',
        SETTINGS: 'Settings',
        HELP: 'Help',
        NOTIFICATIONS: 'Notifications',
        AUDIT: 'Audit',
        BACKUP: 'Backup',
        DATA: 'Data',
    },

    // Root
    ROOT: {
        SPLASH: 'Splash',
        AUTH: 'Auth',
        MAIN: 'Main',
    },
} as const;

export type RouteName =
    | typeof ROUTES.AUTH[keyof typeof ROUTES.AUTH]
    | typeof ROUTES.MAIN[keyof typeof ROUTES.MAIN]
    | typeof ROUTES.DASHBOARD[keyof typeof ROUTES.DASHBOARD]
    | typeof ROUTES.PRODUCTS[keyof typeof ROUTES.PRODUCTS]
    | typeof ROUTES.CUSTOMERS[keyof typeof ROUTES.CUSTOMERS]
    | typeof ROUTES.SALES[keyof typeof ROUTES.SALES]
    | typeof ROUTES.INVENTORY[keyof typeof ROUTES.INVENTORY]
    | typeof ROUTES.SUPPLIERS[keyof typeof ROUTES.SUPPLIERS]
    | typeof ROUTES.PURCHASES[keyof typeof ROUTES.PURCHASES]
    | typeof ROUTES.EXPENSES[keyof typeof ROUTES.EXPENSES]
    | typeof ROUTES.REPORTS[keyof typeof ROUTES.REPORTS]
    | typeof ROUTES.DISTRIBUTORS[keyof typeof ROUTES.DISTRIBUTORS]
    | typeof ROUTES.USERS[keyof typeof ROUTES.USERS]
    | typeof ROUTES.ROLES[keyof typeof ROUTES.ROLES]
    | typeof ROUTES.SETTINGS[keyof typeof ROUTES.SETTINGS]
    | typeof ROUTES.HELP[keyof typeof ROUTES.HELP]
    | typeof ROUTES.NOTIFICATIONS[keyof typeof ROUTES.NOTIFICATIONS]
    | typeof ROUTES.AUDIT[keyof typeof ROUTES.AUDIT]
    | typeof ROUTES.BACKUP[keyof typeof ROUTES.BACKUP]
    | typeof ROUTES.DATA[keyof typeof ROUTES.DATA]
    | typeof ROUTES.MORE[keyof typeof ROUTES.MORE]
    | typeof ROUTES.ROOT[keyof typeof ROUTES.ROOT];