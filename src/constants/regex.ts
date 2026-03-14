export const REGEX = {
    // Basic validation
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[0-9]{10}$/,
    PINCODE: /^[1-9][0-9]{5}$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,

    // Tax and business
    GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    TAN: /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,
    CIN: /^[L|U][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
    IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    MICR: /^[0-9]{9}$/,
    GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
    HSN: /^[0-9]{4,8}$/,
    SAC: /^[0-9]{6,8}$/,

    // Product and inventory
    SKU: /^[A-Z0-9-]+$/,
    BARCODE: {
        EAN8: /^[0-9]{8}$/,
        EAN13: /^[0-9]{13}$/,
        UPC: /^[0-9]{12}$/,
        ISBN: /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/,
    },

    // Names and text
    ALPHABETS: /^[A-Za-z]+$/,
    ALPHANUMERIC: /^[A-Za-z0-9]+$/,
    ALPHANUMERIC_WITH_SPACE: /^[A-Za-z0-9\s]+$/,
    ALPHABETS_WITH_SPACE: /^[A-Za-z\s]+$/,
    USERNAME: /^[a-zA-Z0-9_]+$/,
    PASSWORD: /^(?=.*[A-Z])(?=.*[0-9])/,
    NAME: /^[A-Za-z\s]+$/,
    CITY: /^[A-Za-z\s]+$/,
    STATE: /^[A-Za-z\s]+$/,
    COUNTRY: /^[A-Za-z\s]+$/,

    // Numbers
    NUMBER: /^[0-9]+$/,
    DECIMAL: /^\d+(\.\d{1,2})?$/,
    POSITIVE_INTEGER: /^[1-9][0-9]*$/,
    NEGATIVE_INTEGER: /^-[1-9][0-9]*$/,
    INTEGER: /^-?[0-9]+$/,
    PERCENTAGE: /^(100|[1-9]?[0-9])$/,

    // Dates
    DATE_YYYY_MM_DD: /^\d{4}-\d{2}-\d{2}$/,
    DATE_DD_MM_YYYY: /^\d{2}\/\d{2}\/\d{4}$/,
    DATE_MM_DD_YYYY: /^\d{2}\/\d{2}\/\d{4}$/,
    TIME_HH_MM: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    TIME_HH_MM_SS: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
    DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,

    // Files
    IMAGE_EXTENSION: /\.(jpg|jpeg|png|gif|bmp|webp)$/i,
    DOCUMENT_EXTENSION: /\.(pdf|doc|docx|xls|xlsx|csv|txt)$/i,
    EXCEL_EXTENSION: /\.(xls|xlsx|csv)$/i,
    PDF_EXTENSION: /\.pdf$/i,

    // Colors
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    RGB_COLOR: /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/,
    RGBA_COLOR: /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/,

    // Credit cards
    VISA: /^4[0-9]{12}(?:[0-9]{3})?$/,
    MASTERCARD: /^5[1-5][0-9]{14}$/,
    AMEX: /^3[47][0-9]{13}$/,
    DISCOVER: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    RUPAY: /^6[0-9]{15}$/,

    // UPI
    UPI_ID: /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/,

    // Social media
    YOUTUBE_URL: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    TWITTER_URL: /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/,
    FACEBOOK_URL: /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
    INSTAGRAM_URL: /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
    LINKEDIN_URL: /^(https?:\/\/)?(www\.)?linkedin\.com\/(company|in)\/[a-zA-Z0-9-]+\/?$/,
} as const;