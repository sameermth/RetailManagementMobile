export const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatPhoneNumber = (phone: string | undefined | null): string => {
    if (!phone) return '';
    // Format: 12345 67890
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
};

export const formatGST = (gst: string | undefined | null): string => {
    if (!gst) return '';
    // Format: 22AAAAA0000A1Z5
    return gst.replace(/(\d{2})([A-Z]{5})(\d{4})([A-Z]{1})(\d{1})([A-Z]{1})(\d{1})/, '$1 $2 $3 $4$5$6$7');
};

export const truncateText = (text: string | undefined | null, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getInitials = (name: string | undefined | null): string => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export const formatPercentage = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(1)}%`;
};

export const formatQuantity = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('en-IN');
};