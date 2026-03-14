export const DATE_FORMATS = {
    // Display formats
    DISPLAY: {
        DATE: 'DD/MM/YYYY',
        TIME: 'HH:mm',
        TIME_12H: 'hh:mm A',
        DATETIME: 'DD/MM/YYYY HH:mm',
        DATETIME_12H: 'DD/MM/YYYY hh:mm A',
        DATETIME_FULL: 'DD/MM/YYYY HH:mm:ss',
        DATETIME_FULL_12H: 'DD/MM/YYYY hh:mm:ss A',
        MONTH_YEAR: 'MMMM YYYY',
        YEAR: 'YYYY',
        DAY_MONTH: 'DD MMM',
        DAY_NAME: 'dddd',
        MONTH_NAME: 'MMMM',
        SHORT_DATE: 'DD/MM/YY',
        SHORT_DATETIME: 'DD/MM/YY HH:mm',
    },

    // API formats
    API: {
        DATE: 'YYYY-MM-DD',
        DATETIME: 'YYYY-MM-DD HH:mm:ss',
        DATETIME_ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
        TIME: 'HH:mm:ss',
    },

    // File formats
    FILE: {
        DATE: 'YYYYMMDD',
        DATETIME: 'YYYYMMDD_HHmmss',
        TIMESTAMP: 'YYYYMMDD_HHmmss_SSS',
        BACKUP: 'YYYY-MM-DD_HH-mm-ss',
    },

    // Report formats
    REPORT: {
        FILENAME: 'YYYYMMDD_HHmmss',
        TITLE: 'DD MMM YYYY',
        HEADER: 'DD/MM/YYYY',
        FOOTER: 'DD/MM/YYYY HH:mm',
    },

    // Invoice formats
    INVOICE: {
        DATE: 'DD/MM/YYYY',
        DUE_DATE: 'DD/MM/YYYY',
        CREATED: 'DD/MM/YYYY HH:mm',
    },

    // Log formats
    LOG: {
        TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS',
        DATE: 'YYYY-MM-DD',
        TIME: 'HH:mm:ss.SSS',
    },

    // Calendar formats
    CALENDAR: {
        DAY_HEADER: 'ddd',
        WEEK_HEADER: 'MMM D',
        MONTH_HEADER: 'MMMM YYYY',
        YEAR_HEADER: 'YYYY',
    },

    // Chart formats
    CHART: {
        HOURLY: 'HH:mm',
        DAILY: 'DD MMM',
        WEEKLY: 'MMM D',
        MONTHLY: 'MMM YYYY',
        QUARTERLY: 'MMM YYYY',
        YEARLY: 'YYYY',
    },

    // Input formats
    INPUT: {
        DATE: 'DD/MM/YYYY',
        DATE_PLACEHOLDER: 'dd/mm/yyyy',
        TIME: 'HH:mm',
        TIME_PLACEHOLDER: 'hh:mm',
        DATETIME: 'DD/MM/YYYY HH:mm',
        DATETIME_PLACEHOLDER: 'dd/mm/yyyy hh:mm',
    },
} as const;

export const DATE_PICKER_MODES = {
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
    RANGE: 'range',
} as const;

export const DATE_RANGE_PRESETS = {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    THIS_WEEK: 'this_week',
    LAST_WEEK: 'last_week',
    THIS_MONTH: 'this_month',
    LAST_MONTH: 'last_month',
    THIS_QUARTER: 'this_quarter',
    LAST_QUARTER: 'last_quarter',
    THIS_YEAR: 'this_year',
    LAST_YEAR: 'last_year',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    LAST_90_DAYS: 'last_90_days',
    CUSTOM: 'custom',
} as const;

export const DATE_RANGE_LABELS = {
    [DATE_RANGE_PRESETS.TODAY]: 'Today',
    [DATE_RANGE_PRESETS.YESTERDAY]: 'Yesterday',
    [DATE_RANGE_PRESETS.THIS_WEEK]: 'This Week',
    [DATE_RANGE_PRESETS.LAST_WEEK]: 'Last Week',
    [DATE_RANGE_PRESETS.THIS_MONTH]: 'This Month',
    [DATE_RANGE_PRESETS.LAST_MONTH]: 'Last Month',
    [DATE_RANGE_PRESETS.THIS_QUARTER]: 'This Quarter',
    [DATE_RANGE_PRESETS.LAST_QUARTER]: 'Last Quarter',
    [DATE_RANGE_PRESETS.THIS_YEAR]: 'This Year',
    [DATE_RANGE_PRESETS.LAST_YEAR]: 'Last Year',
    [DATE_RANGE_PRESETS.LAST_7_DAYS]: 'Last 7 Days',
    [DATE_RANGE_PRESETS.LAST_30_DAYS]: 'Last 30 Days',
    [DATE_RANGE_PRESETS.LAST_90_DAYS]: 'Last 90 Days',
    [DATE_RANGE_PRESETS.CUSTOM]: 'Custom Range',
} as const;

export const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
] as const;

export const MONTHS_OF_YEAR = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const;

export const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export type DateFormat = typeof DATE_FORMATS[keyof typeof DATE_FORMATS][keyof typeof DATE_FORMATS[keyof typeof DATE_FORMATS]];
export type DatePickerMode = typeof DATE_PICKER_MODES[keyof typeof DATE_PICKER_MODES];
export type DateRangePreset = typeof DATE_RANGE_PRESETS[keyof typeof DATE_RANGE_PRESETS];