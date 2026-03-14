import apiClient from './client';

export interface Suppliers {
    id: number;
    supplierCode: string;
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
    contactPerson?: string;
    contactPersonPhone?: string;
    contactPersonEmail?: string;
    creditLimit?: number;
    outstandingAmount: number;
    paymentTerms?: number;
    status: string;
    isActive: boolean;
    lastPurchaseDate?: string;
}

export interface SupplierRequest {
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
    contactPerson?: string;
    contactPersonPhone?: string;
    contactPersonEmail?: string;
    creditLimit?: number;
    paymentTerms?: number;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    notes?: string;
}

export interface SupplierSummary {
    id: number;
    supplierCode: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    city?: string;
    status: string;
    outstandingAmount: number;
}

export const suppliersApi = {
    getAll: (params?: any) =>
        apiClient.get<{content: Suppliers[], totalPages: number}>('/suppliers', {params}),

    getById: (id: number) =>
        apiClient.get<Suppliers>(`/suppliers/${id}`),

    getByCode: (code: string) =>
        apiClient.get<Suppliers>(`/suppliers/code/${code}`),

    getByEmail: (email: string) =>
        apiClient.get<Suppliers>(`/suppliers/email/${email}`),

    getByPhone: (phone: string) =>
        apiClient.get<Suppliers>(`/suppliers/phone/${phone}`),

    search: (query: string, params?: any) =>
        apiClient.get<{content: Suppliers[], totalPages: number}>(`/suppliers/search`, {
            params: {q: query, ...params}
        }),

    getByStatus: (status: string, params?: any) =>
        apiClient.get<{content: Suppliers[], totalPages: number}>(`/suppliers/status/${status}`, {params}),

    create: (data: SupplierRequest) =>
        apiClient.post<Suppliers>('/suppliers', data),

    update: (id: number, data: SupplierRequest) =>
        apiClient.put<Suppliers>(`/suppliers/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/suppliers/${id}`),

    activate: (id: number) =>
        apiClient.put<Suppliers>(`/suppliers/${id}/activate`, {}),

    deactivate: (id: number) =>
        apiClient.put<Suppliers>(`/suppliers/${id}/deactivate`, {}),

    blacklist: (id: number, reason: string) =>
        apiClient.put(`/suppliers/${id}/blacklist`, null, {params: {reason}}),

    getWithOutstanding: () =>
        apiClient.get<SupplierSummary[]>('/suppliers/with-outstanding'),

    getSummaries: () =>
        apiClient.get<SupplierSummary[]>('/suppliers/summaries'),

    getAverageRating: (id: number) =>
        apiClient.get<number>(`/suppliers/${id}/average-rating`),

    addRating: (id: number, rating: {quality: number, delivery: number, price: number, comments?: string}) =>
        apiClient.post(`/suppliers/${id}/ratings`, rating),
};