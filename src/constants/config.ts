export const APP_CONFIG = {
    NAME: 'Retail Management',
    VERSION: '1.0.0',
    BUILD_NUMBER: '20260314',
    ENVIRONMENT: process.env.NODE_ENV || 'development',
} as const;

export const API_CONFIG = {
    BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    HEADERS: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
} as const;

export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const CACHE_CONFIG = {
    TTL: {
        PRODUCTS: 5 * 60 * 1000, // 5 minutes
        CUSTOMERS: 10 * 60 * 1000, // 10 minutes
        DASHBOARD: 2 * 60 * 1000, // 2 minutes
        REPORTS: 30 * 60 * 1000, // 30 minutes
    },
    STORAGE_PREFIX: '@RetailApp:',
} as const;

export const OFFLINE_CONFIG = {
    SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
    MAX_QUEUE_SIZE: 1000,
    RETRY_ATTEMPTS: 3,
} as const;

export const FILE_CONFIG = {
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/vnd.ms-excel', 'text/csv'],
    MAX_FILES_PER_UPLOAD: 5,
} as const;

export const DATE_CONFIG = {
    DEFAULT_FORMAT: 'DD/MM/YYYY',
    DEFAULT_TIME_FORMAT: 'HH:mm',
    DEFAULT_DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    API_FORMAT: 'YYYY-MM-DD',
    API_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    FILE_FORMAT: 'YYYYMMDD_HHmmss',
} as const;

export const CURRENCY_CONFIG = {
    DEFAULT: 'INR',
    SYMBOLS: {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£',
    },
    FORMATS: {
        INR: 'en-IN',
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
    },
} as const;

export const THEME_CONFIG = {
    DEFAULT_THEME: 'light',
    STORAGE_KEY: '@theme',
} as const;

export const LANGUAGE_CONFIG = {
    DEFAULT: 'en',
    SUPPORTED: ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn'],
    STORAGE_KEY: '@language',
} as const;