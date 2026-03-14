export const VALIDATION_RULES = {
    // User validation
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-Z0-9_]+$/,
        MESSAGE: 'Username must be 3-50 characters and contain only letters, numbers, and underscores',
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        MAX_LENGTH: 50,
        PATTERN: /^(?=.*[A-Z])(?=.*[0-9])/,
        MESSAGE: 'Password must be 6-50 characters and contain at least one uppercase letter and one number',
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        MESSAGE: 'Please enter a valid email address',
    },
    PHONE: {
        PATTERN: /^[0-9]{10}$/,
        MESSAGE: 'Phone number must be 10 digits',
    },
    PINCODE: {
        PATTERN: /^[1-9][0-9]{5}$/,
        MESSAGE: 'Pincode must be 6 digits',
    },

    // Business validation
    GST: {
        PATTERN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
        MESSAGE: 'Invalid GST number format',
    },
    PAN: {
        PATTERN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        MESSAGE: 'Invalid PAN number format',
    },
    TAN: {
        PATTERN: /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,
        MESSAGE: 'Invalid TAN number format',
    },
    CIN: {
        PATTERN: /^[L|U][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
        MESSAGE: 'Invalid CIN number format',
    },
    IFSC: {
        PATTERN: /^[A-Z]{4}0[A-Z0-9]{6}$/,
        MESSAGE: 'Invalid IFSC code format',
    },
    MICR: {
        PATTERN: /^[0-9]{9}$/,
        MESSAGE: 'Invalid MICR code format',
    },

    // Product validation
    SKU: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50,
        PATTERN: /^[A-Z0-9-]+$/,
        MESSAGE: 'SKU must be 3-50 characters and contain only uppercase letters, numbers, and hyphens',
    },
    BARCODE: {
        PATTERN: /^[0-9]{8,13}$/,
        MESSAGE: 'Barcode must be 8-13 digits',
    },
    HSN: {
        PATTERN: /^[0-9]{4,8}$/,
        MESSAGE: 'HSN code must be 4-8 digits',
    },
    PRICE: {
        MIN: 0,
        MAX: 9999999.99,
        DECIMALS: 2,
        MESSAGE: 'Price must be between 0 and 99,99,999.99',
    },
    QUANTITY: {
        MIN: 0,
        MAX: 999999,
        MESSAGE: 'Quantity must be between 0 and 999,999',
    },
    GST_RATE: {
        MIN: 0,
        MAX: 100,
        DECIMALS: 2,
        MESSAGE: 'GST rate must be between 0 and 100',
    },
    DISCOUNT: {
        MIN: 0,
        MAX: 100,
        DECIMALS: 2,
        MESSAGE: 'Discount must be between 0 and 100',
    },

    // Numeric limits
    AMOUNT: {
        MIN: 0,
        MAX: 999999999.99,
        DECIMALS: 2,
        MESSAGE: 'Amount must be between 0 and 99,99,99,999.99',
    },
    PERCENTAGE: {
        MIN: 0,
        MAX: 100,
        DECIMALS: 2,
        MESSAGE: 'Percentage must be between 0 and 100',
    },
    RATING: {
        MIN: 1,
        MAX: 5,
        MESSAGE: 'Rating must be between 1 and 5',
    },

    // Text limits
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        MESSAGE: 'Name must be 2-100 characters',
    },
    DESCRIPTION: {
        MIN_LENGTH: 0,
        MAX_LENGTH: 1000,
        MESSAGE: 'Description must be less than 1000 characters',
    },
    ADDRESS: {
        MIN_LENGTH: 0,
        MAX_LENGTH: 500,
        MESSAGE: 'Address must be less than 500 characters',
    },
    NOTES: {
        MIN_LENGTH: 0,
        MAX_LENGTH: 1000,
        MESSAGE: 'Notes must be less than 1000 characters',
    },

    // Date validation
    DATE: {
        MIN: '1900-01-01',
        MAX: '2100-12-31',
        MESSAGE: 'Invalid date',
    },
    FUTURE_DATE: {
        MESSAGE: 'Date must be in the future',
    },
    PAST_DATE: {
        MESSAGE: 'Date must be in the past',
    },

    // File validation
    FILE_SIZE: {
        MAX: 10 * 1024 * 1024, // 10MB
        MESSAGE: 'File size must be less than 10MB',
    },
    IMAGE_SIZE: {
        MAX: 5 * 1024 * 1024, // 5MB
        MESSAGE: 'Image size must be less than 5MB',
    },
    IMAGE_DIMENSIONS: {
        MIN_WIDTH: 100,
        MIN_HEIGHT: 100,
        MAX_WIDTH: 4096,
        MAX_HEIGHT: 4096,
        MESSAGE: 'Image dimensions must be between 100x100 and 4096x4096',
    },
} as const;

export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid 10-digit phone number',
    INVALID_PINCODE: 'Please enter a valid 6-digit pincode',
    INVALID_GST: 'Please enter a valid GST number',
    INVALID_PAN: 'Please enter a valid PAN number',
    INVALID_IFSC: 'Please enter a valid IFSC code',
    INVALID_SKU: 'Please enter a valid SKU',
    INVALID_BARCODE: 'Please enter a valid barcode',
    INVALID_HSN: 'Please enter a valid HSN code',
    PASSWORD_MISMATCH: 'Passwords do not match',
    PASSWORD_WEAK: 'Password must contain at least one uppercase letter and one number',
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) => `${field} must be less than ${max} characters`,
    MIN_VALUE: (field: string, min: number) => `${field} must be at least ${min}`,
    MAX_VALUE: (field: string, max: number) => `${field} must be less than ${max}`,
    INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
    ALREADY_EXISTS: (field: string) => `${field} already exists`,
    NOT_FOUND: (field: string) => `${field} not found`,
    UNAUTHORIZED: 'You are not authorized to perform this action',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
} as const;