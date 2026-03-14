import apiClient from './client';

export interface CustomerDue {
    id: number;
    customerId: number;
    customerName: string;
    customerPhone: string;
    dueReference: string;
    invoiceNumber?: string;
    saleId?: number;
    description?: string;
    dueDate: string;
    originalAmount: number;
    remainingAmount: number;
    paidAmount: number;
    status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
    daysOverdue?: number;
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'OVERDUE';
}

export interface CustomerDueRequest {
    customerId: number;
    invoiceNumber?: string;
    saleId?: number;
    description?: string;
    dueDate: string;
    amount: number;
    notes?: string;
}

export interface DuePaymentRequest {
    dueId: number;
    amount: number;
    paymentReference?: string;
}

export const customerDueApi = {
    // Get dues
    getByCustomer: (customerId: number, page?: number, size?: number) =>
        apiClient.get<{content: CustomerDue[]}>(`/customer-dues/customer/${customerId}`, {
            params: {page, size}
        }),

    getOverdue: () =>
        apiClient.get<CustomerDue[]>('/customer-dues/overdue'),

    getByReference: (reference: string) =>
        apiClient.get<CustomerDue>(`/customer-dues/reference/${reference}`),

    getDuesNeedingReminder: () =>
        apiClient.get<CustomerDue[]>('/customer-dues/needing-reminder'),

    // Create and manage dues
    createDue: (data: CustomerDueRequest) =>
        apiClient.post<CustomerDue>('/customer-dues', data),

    recordPayment: (dueId: number, amount: number, paymentReference?: string) =>
        apiClient.post<CustomerDue>(`/customer-dues/${dueId}/payment`, null, {
            params: {amount, paymentReference}
        }),

    updateStatus: (dueId: number, status: string) =>
        apiClient.put<CustomerDue>(`/customer-dues/${dueId}/status`, null, {
            params: {status}
        }),

    sendReminder: (dueId: number) =>
        apiClient.post(`/customer-dues/${dueId}/send-reminder`),

    // Statistics
    getTotalDueAmount: () =>
        apiClient.get<number>('/customer-dues/stats/total-due'),

    getTotalOverdueAmount: () =>
        apiClient.get<number>('/customer-dues/stats/total-overdue'),

    getOverdueCount: () =>
        apiClient.get<number>('/customer-dues/stats/overdue-count'),
};