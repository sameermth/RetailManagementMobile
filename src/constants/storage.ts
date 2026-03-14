export const STORAGE_KEYS = {
    // Auth
    AUTH: {
        TOKEN: '@auth_token',
        REFRESH_TOKEN: '@refresh_token',
        USER: '@user',
        SESSION: '@session',
    },

    // Settings
    SETTINGS: {
        THEME: '@settings_theme',
        LANGUAGE: '@settings_language',
        CURRENCY: '@settings_currency',
        NOTIFICATIONS: '@settings_notifications',
    },

    // App Data
    DATA: {
        CART: '@cart',
        RECENT_SEARCHES: '@recent_searches',
        BOOKMARKS: '@bookmarks',
        DRAFT_ORDERS: '@draft_orders',
    },

    // Cache
    CACHE: {
        PRODUCTS: '@cache_products',
        CUSTOMERS: '@cache_customers',
        CATEGORIES: '@cache_categories',
        BRANDS: '@cache_brands',
        WAREHOUSES: '@cache_warehouses',
        DASHBOARD: '@cache_dashboard',
    },

    // Offline
    OFFLINE: {
        QUEUE: '@offline_queue',
        PENDING_UPLOADS: '@pending_uploads',
        LAST_SYNC: '@last_sync',
    },

    // User Preferences
    PREFERENCES: {
        RECENT_PRODUCTS: '@prefs_recent_products',
        FAVORITE_PRODUCTS: '@prefs_favorite_products',
        DEFAULT_WAREHOUSE: '@prefs_default_warehouse',
        DEFAULT_PAYMENT_METHOD: '@prefs_default_payment',
        PRINT_SETTINGS: '@prefs_print_settings',
        REPORT_SETTINGS: '@prefs_report_settings',
        DASHBOARD_LAYOUT: '@prefs_dashboard_layout',
        COLUMN_VISIBILITY: '@prefs_column_visibility',
        TABLE_PAGE_SIZE: '@prefs_table_page_size',
    },

    // Temporary
    TEMP: {
        DRAFT: '@temp_draft',
        SEARCH_FILTERS: '@temp_search_filters',
        REPORT_PARAMS: '@temp_report_params',
        EXPORT_DATA: '@temp_export_data',
        IMPORT_MAPPING: '@temp_import_mapping',
    },
} as const;

export const STORAGE_EXPIRY = {
    TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
    REFRESH_TOKEN: 30 * 24 * 60 * 60 * 1000, // 30 days
    CACHE: {
        PRODUCTS: 5 * 60 * 1000, // 5 minutes
        CUSTOMERS: 10 * 60 * 1000, // 10 minutes
        DASHBOARD: 2 * 60 * 1000, // 2 minutes
        CATEGORIES: 30 * 60 * 1000, // 30 minutes
        BRANDS: 30 * 60 * 1000, // 30 minutes
        WAREHOUSES: 30 * 60 * 1000, // 30 minutes
    },
    OFFLINE_QUEUE: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const STORAGE_PREFIX = '@RetailApp:';
export const STORAGE_VERSION = '1.0.0';