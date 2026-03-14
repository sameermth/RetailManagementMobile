import apiClient from './client';

export interface Customer {
    id: number;
    customerCode: string;
    name: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    gstNumber?: string;
    panNumber?: string;
    customerType?: string;
    status?: string;
    creditLimit?: number;
    totalDueAmount: number;
    loyaltyPoints: number;
    loyaltyTier: string;
    totalPurchaseAmount: number;
    lastPurchaseDate?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CustomerRequest {
    name: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    gstNumber?: string;
    panNumber?: string;
    customerType?: string;
    creditLimit?: number;
    notes?: string;
}

export interface CustomerSummaryResponse {
    id: number;
    customerCode: string;
    name: string;
    phone?: string;
    email?: string;
    city?: string;
    totalDueAmount: number;
    totalPurchases: number;
    averagePurchaseValue?: number;
    lastPurchaseDate?: string;
    loyaltyPoints: number;
    status: string;

    // Helper method for dropdown display
    displayName?: string;
}

export interface CustomerDue {
    id: number;
    customerId: number;
    customerName: string;
    dueReference: string;
    invoiceNumber?: string;
    dueDate: string;
    originalAmount: number;
    remainingAmount: number;
    status: string;
    daysOverdue?: number;
}

export const customersApi = {
    getAll: (params?: any) =>
        apiClient.get<{content: Customer[], totalPages: number, totalElements: number}>('/customers', {params}),

    getById: (id: number) =>
        apiClient.get<Customer>(`/customers/${id}`),

    getByCode: (code: string) =>
        apiClient.get<Customer>(`/customers/code/${code}`),

    getByEmail: (email: string) =>
        apiClient.get<Customer>(`/customers/email/${email}`),

    getByPhone: (phone: string) =>
        apiClient.get<Customer>(`/customers/phone/${phone}`),

    search: (query: string, params?: any) =>
        apiClient.get<{content: Customer[], totalPages: number}>(`/customers/search`, {
            params: {q: query, ...params}
        }),

    getByStatus: (status: string, params?: any) =>
        apiClient.get<{content: Customer[], totalPages: number}>(`/customers/status/${status}`, {params}),

    create: (data: CustomerRequest) =>
        apiClient.post<Customer>('/customers', data),

    update: (id: number, data: CustomerRequest) =>
        apiClient.put<Customer>(`/customers/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/customers/${id}`),

    activate: (id: number) =>
        apiClient.put<Customer>(`/customers/${id}/activate`, {}),

    deactivate: (id: number) =>
        apiClient.put<Customer>(`/customers/${id}/deactivate`, {}),

    block: (id: number, reason: string) =>
        apiClient.put(`/customers/${id}/block`, null, {params: {reason}}),

    getWithDue: () =>
        apiClient.get<CustomerSummaryResponse[]>('/customers/with-due'),

    getTopCustomers: (limit: number = 10) =>
        apiClient.get<CustomerSummaryResponse[]>('/customers/top', {params: {limit}}),

    getSummaries: () =>
        apiClient.get<CustomerSummaryResponse[]>('/customers/summaries'),

    getStats: () =>
        apiClient.get<{count: number, newToday: number}>('/customers/stats'),

    checkEmail: (email: string) =>
        apiClient.get<boolean>('/customers/check-email', {params: {email}}),

    checkPhone: (phone: string) =>
        apiClient.get<boolean>('/customers/check-phone', {params: {phone}}),
};