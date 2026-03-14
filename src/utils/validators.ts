export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\D/g, ''));
};

export const validateGST = (gst: string): boolean => {
    const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return re.test(gst);
};

export const validatePAN = (pan: string): boolean => {
    const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return re.test(pan);
};

export const validatePinCode = (pincode: string): boolean => {
    const re = /^[1-9][0-9]{5}$/;
    return re.test(pincode);
};

export const validateRequired = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

export const validateMinLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};

export const validatePositiveNumber = (value: number): boolean => {
    return value > 0;
};

export const validatePositiveOrZero = (value: number): boolean => {
    return value >= 0;
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
    return startDate <= endDate;
};

export const validateFutureDate = (date: Date): boolean => {
    return date >= new Date();
};

export const validatePastDate = (date: Date): boolean => {
    return date <= new Date();
};