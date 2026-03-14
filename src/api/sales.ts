import apiClient from './client';

export interface SaleItemRequest {
    productId: number;
    quantity: number;
    unitPrice?: number;
    discountAmount?: number;
    discountPercentage?: number;
}

export interface SaleRequest {
    customerId?: number;
    userId: number;
    items: SaleItemRequest[];
    discountAmount?: number;
    discountPercentage?: number;
    shippingAmount?: number;
    paymentMethod: string;
    notes?: string;
}

export interface SaleItemResponse {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxAmount: number;
    totalPrice: number;
}

export interface SaleResponse {
    id: number;
    invoiceNumber: string;
    customerId?: number;
    customerName?: string;
    userId: number;
    userName: string;
    saleDate: string;
    items: SaleItemResponse[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: string;
    paymentStatus: string;
}

export interface PaymentRequest {
    saleId: number;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
}

export const salesApi = {
    // Sales endpoints
    create: (data: SaleRequest) =>
        apiClient.post<SaleResponse>('/sales', data),

    getAll: (params?: any) =>
        apiClient.get<SaleResponse[]>('/sales', {params}),

    getById: (id: number) =>
        apiClient.get<SaleResponse>(`/sales/${id}`),

    getByInvoice: (invoiceNumber: string) =>
        apiClient.get<SaleResponse>(`/sales/invoice/${invoiceNumber}`),

    getByCustomer: (customerId: number) =>
        apiClient.get<SaleResponse[]>(`/sales/customer/${customerId}`),

    getByDateRange: (startDate: string, endDate: string) =>
        apiClient.get<SaleResponse[]>('/sales/date-range', {params: {startDate, endDate}}),

    getRecent: (limit: number = 10) =>
        apiClient.get<SaleResponse[]>('/sales/recent', {params: {limit}}),

    cancel: (id: number, reason: string) =>
        apiClient.post(`/sales/${id}/cancel`, null, {params: {reason}}),

    // Payment endpoints
    createPayment: (data: PaymentRequest) =>
        apiClient.post('/payments', data),

    getPaymentsBySale: (saleId: number) =>
        apiClient.get(`/payments/sale/${saleId}`),

    // Invoice endpoints
    generateInvoice: (saleId: number) =>
        apiClient.post(`/invoices/generate/${saleId}`),

    getInvoice: (invoiceNumber: string) =>
        apiClient.get(`/invoices/number/${invoiceNumber}`),

    downloadInvoicePdf: (invoiceId: number) =>
        apiClient.get(`/invoices/${invoiceId}/pdf`, {responseType: 'blob'}),
};