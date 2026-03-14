export const SUCCESS_MESSAGES = {
    // Auth
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_CHANGED: 'Password changed successfully',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
    EMAIL_VERIFIED: 'Email verified successfully',

    // CRUD
    CREATE_SUCCESS: (entity: string) => `${entity} created successfully`,
    UPDATE_SUCCESS: (entity: string) => `${entity} updated successfully`,
    DELETE_SUCCESS: (entity: string) => `${entity} deleted successfully`,
    ACTIVATE_SUCCESS: (entity: string) => `${entity} activated successfully`,
    DEACTIVATE_SUCCESS: (entity: string) => `${entity} deactivated successfully`,

    // Business operations
    SALE_COMPLETED: 'Sale completed successfully',
    PAYMENT_RECORDED: 'Payment recorded successfully',
    INVOICE_GENERATED: 'Invoice generated successfully',
    STOCK_ADJUSTED: 'Stock adjusted successfully',
    STOCK_TRANSFERRED: 'Stock transferred successfully',
    ORDER_PLACED: 'Order placed successfully',
    ORDER_RECEIVED: 'Order received successfully',
    EXPENSE_APPROVED: 'Expense approved',
    EXPENSE_REJECTED: 'Expense rejected',
    EXPENSE_PAID: 'Expense marked as paid',
    REPORT_GENERATED: 'Report generated successfully',
    BACKUP_CREATED: 'Backup created successfully',
    BACKUP_RESTORED: 'Backup restored successfully',
    DATA_EXPORTED: 'Data exported successfully',
    DATA_IMPORTED: 'Data imported successfully',

    // Actions
    CHANGES_SAVED: 'Changes saved successfully',
    OPERATION_SUCCESSFUL: 'Operation completed successfully',
    REQUEST_SUBMITTED: 'Request submitted successfully',
    EMAIL_SENT: 'Email sent successfully',
    NOTIFICATION_SENT: 'Notification sent successfully',
    REMINDER_SENT: 'Reminder sent successfully',
} as const;

export const ERROR_MESSAGES = {
    // Auth
    INVALID_CREDENTIALS: 'Invalid username or password',
    ACCOUNT_LOCKED: 'Account is locked. Please contact support',
    ACCOUNT_DISABLED: 'Account is disabled',
    ACCOUNT_EXPIRED: 'Account has expired',
    SESSION_EXPIRED: 'Session expired. Please login again',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'Access denied',
    TOKEN_EXPIRED: 'Token expired',
    TOKEN_INVALID: 'Invalid token',

    // Validation
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_FORMAT: (field: string) => `Invalid ${field} format`,
    MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,
    MAX_LENGTH: (field: string, max: number) => `${field} must be less than ${max} characters`,
    MIN_VALUE: (field: string, min: number) => `${field} must be at least ${min}`,
    MAX_VALUE: (field: string, max: number) => `${field} must be less than ${max}`,
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_PINCODE: 'Please enter a valid pincode',
    PASSWORD_MISMATCH: 'Passwords do not match',
    PASSWORD_WEAK: 'Password is too weak',

    // Resource errors
    NOT_FOUND: (entity: string) => `${entity} not found`,
    ALREADY_EXISTS: (entity: string) => `${entity} already exists`,
    IN_USE: (entity: string) => `${entity} is in use and cannot be deleted`,
    DEPENDENCY_EXISTS: (entity: string, dependency: string) =>
        `Cannot delete ${entity} because it has associated ${dependency}`,

    // Business errors
    INSUFFICIENT_STOCK: (product: string) => `Insufficient stock for ${product}`,
    INSUFFICIENT_FUNDS: 'Insufficient funds',
    PAYMENT_EXCEEDS_DUE: 'Payment amount exceeds due amount',
    CANNOT_CANCEL: (entity: string) => `Cannot cancel ${entity} in current state`,
    CANNOT_MODIFY: (entity: string) => `Cannot modify ${entity} in current state`,
    DUPLICATE_ENTRY: (field: string) => `${field} already exists`,
    INVALID_OPERATION: 'Invalid operation',
    OPERATION_FAILED: 'Operation failed',

    // Network errors
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    TIMEOUT_ERROR: 'Request timeout. Please try again',
    CONNECTION_REFUSED: 'Could not connect to server',

    // File errors
    FILE_TOO_LARGE: 'File size exceeds limit',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_UPLOAD_FAILED: 'File upload failed',
    FILE_DOWNLOAD_FAILED: 'File download failed',

    // Generic
    UNKNOWN_ERROR: 'An unknown error occurred',
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again',
    PLEASE_TRY_AGAIN: 'Please try again',
    CONTACT_SUPPORT: 'Please contact support if the issue persists',
} as const;

export const WARNING_MESSAGES = {
    UNSAVED_CHANGES: 'You have unsaved changes. Do you want to leave?',
    DELETE_CONFIRMATION: (entity: string) => `Are you sure you want to delete this ${entity}?`,
    DEACTIVATE_CONFIRMATION: (entity: string) => `Are you sure you want to deactivate this ${entity}?`,
    ACTIVATE_CONFIRMATION: (entity: string) => `Are you sure you want to activate this ${entity}?`,
    CANCEL_CONFIRMATION: (entity: string) => `Are you sure you want to cancel this ${entity}?`,
    REFUND_CONFIRMATION: (entity: string) => `Are you sure you want to refund this ${entity}?`,
    CLEAR_CART: 'Are you sure you want to clear your cart?',
    CLEAR_HISTORY: 'Are you sure you want to clear history?',
    RESET_SETTINGS: 'Are you sure you want to reset all settings?',
    DISABLE_2FA: 'Are you sure you want to disable two-factor authentication?',
    LOGOUT: 'Are you sure you want to logout?',
} as const;

export const INFO_MESSAGES = {
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    PROCESSING: 'Processing...',
    WAITING: 'Please wait...',
    NO_DATA: 'No data available',
    NO_RESULTS: 'No results found',
    EMPTY_LIST: 'List is empty',
    SELECT_ITEM: 'Please select an item',
    SELECT_DATE: 'Please select a date',
    SELECT_FILE: 'Please select a file',
    REQUIRED_FIELDS: 'Please fill all required fields',
    VALIDATING: 'Validating...',
    SYNCING: 'Syncing data...',
    UPLOADING: 'Uploading...',
    DOWNLOADING: 'Downloading...',
    GENERATING: 'Generating...',
    PRINTING: 'Printing...',
} as const;

export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type WarningMessage = typeof WARNING_MESSAGES[keyof typeof WARNING_MESSAGES];
export type InfoMessage = typeof INFO_MESSAGES[keyof typeof INFO_MESSAGES];