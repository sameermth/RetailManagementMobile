export const PAYMENT_METHODS = [
    { id: 'CASH', label: 'Cash', icon: 'cash' },
    { id: 'CARD', label: 'Card', icon: 'credit-card' },
    { id: 'UPI', label: 'UPI', icon: 'qrcode' },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'bank' },
    { id: 'CHEQUE', label: 'Cheque', icon: 'file-document' },
    { id: 'CREDIT', label: 'Credit', icon: 'account-clock' },
] as const;

export const CUSTOMER_TYPES = [
    { id: 'INDIVIDUAL', label: 'Individual', icon: 'account' },
    { id: 'BUSINESS', label: 'Business', icon: 'domain' },
    { id: 'WHOLESALER', label: 'Wholesaler', icon: 'cart' },
    { id: 'RETAILER', label: 'Retailer', icon: 'store' },
] as const;

export const CUSTOMER_STATUS = [
    { id: 'ACTIVE', label: 'Active', color: '#10B981' },
    { id: 'INACTIVE', label: 'Inactive', color: '#6B7280' },
    { id: 'BLOCKED', label: 'Blocked', color: '#EF4444' },
    { id: 'PENDING_VERIFICATION', label: 'Pending', color: '#F59E0B' },
] as const;

export const SALE_STATUS = [
    { id: 'PENDING', label: 'Pending', color: '#F59E0B' },
    { id: 'COMPLETED', label: 'Completed', color: '#10B981' },
    { id: 'CANCELLED', label: 'Cancelled', color: '#EF4444' },
    { id: 'REFUNDED', label: 'Refunded', color: '#6B7280' },
] as const;

export const PAYMENT_STATUS = [
    { id: 'PENDING', label: 'Pending', color: '#F59E0B' },
    { id: 'PAID', label: 'Paid', color: '#10B981' },
    { id: 'PARTIALLY_PAID', label: 'Partial', color: '#3B82F6' },
    { id: 'OVERDUE', label: 'Overdue', color: '#EF4444' },
] as const;

export const DUE_STATUS = [
    { id: 'PENDING', label: 'Pending', color: '#F59E0B' },
    { id: 'PARTIALLY_PAID', label: 'Partial', color: '#3B82F6' },
    { id: 'PAID', label: 'Paid', color: '#10B981' },
    { id: 'OVERDUE', label: 'Overdue', color: '#EF4444' },
] as const;

export const LOYALTY_TIERS = [
    { id: 'BRONZE', label: 'Bronze', color: '#CD7F32', minSpend: 0 },
    { id: 'SILVER', label: 'Silver', color: '#C0C0C0', minSpend: 10000 },
    { id: 'GOLD', label: 'Gold', color: '#FFD700', minSpend: 50000 },
    { id: 'PLATINUM', label: 'Platinum', color: '#E5E4E2', minSpend: 100000 },
] as const;

export const UNITS_OF_MEASURE = [
    { id: 'PCS', label: 'Pieces' },
    { id: 'KG', label: 'Kilogram' },
    { id: 'G', label: 'Gram' },
    { id: 'L', label: 'Liter' },
    { id: 'ML', label: 'Milliliter' },
    { id: 'M', label: 'Meter' },
    { id: 'BOX', label: 'Box' },
    { id: 'PACK', label: 'Pack' },
] as const;

export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    CART: 'cart',
    THEME: 'theme',
    LANGUAGE: 'language',
    LAST_SYNC: 'lastSync',
    NOTIFICATIONS: 'notifications',
} as const;

export const API_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const DATE_FORMATS = {
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
    API: 'YYYY-MM-DD',
    API_TIME: 'YYYY-MM-DD HH:mm:ss',
    FILE: 'YYYYMMDD_HHmmss',
} as const;