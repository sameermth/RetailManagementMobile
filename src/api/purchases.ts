import apiClient from './client';

export interface PurchaseItem {
    productId: number;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    taxRate?: number;
}

export interface PurchaseRequest {
    supplierId: number;
    userId: number;
    expectedDeliveryDate?: string;
    items: PurchaseItem[];
    discountAmount?: number;
    discountPercentage?: number;
    shippingAmount?: number;
    paymentTerms?: string;
    notes?: string;
}

export interface PurchaseResponse {
    id: number;
    purchaseOrderNumber: string;
    supplierId: number;
    supplierName: string;
    userId: number;
    userName: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    receivedDate?: string;
    status: string;
    items: PurchaseItemResponse[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: string;
}

export interface PurchaseItemResponse {
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    receivedQuantity: number;
    unitPrice: number;
    totalPrice: number;
    status: string;
}

export interface PurchaseReceiptRequest {
    purchaseId: number;
    items: {
        purchaseItemId: number;
        quantityReceived: number;
        batchNumber?: string;
        expiryDate?: string;
    }[];
    notes?: string;
}

export const purchasesApi = {
    getAll: (params?: any) =>
        apiClient.get<{content: PurchaseResponse[], totalPages: number}>('/purchases', {params}),

    getById: (id: number) =>
        apiClient.get<PurchaseResponse>(`/purchases/${id}`),

    getByOrderNumber: (orderNumber: string) =>
        apiClient.get<PurchaseResponse>(`/purchases/order-number/${orderNumber}`),

    getBySupplier: (supplierId: number, params?: any) =>
        apiClient.get<PurchaseResponse[]>(`/purchases/supplier/${supplierId}`, {params}),

    getByStatus: (status: string, params?: any) =>
        apiClient.get<PurchaseResponse[]>(`/purchases/status/${status}`, {params}),

    create: (data: PurchaseRequest) =>
        apiClient.post<PurchaseResponse>('/purchases', data),

    update: (id: number, data: PurchaseRequest) =>
        apiClient.put<PurchaseResponse>(`/purchases/${id}`, data),

    approve: (id: number) =>
        apiClient.post(`/purchases/${id}/approve`),

    cancel: (id: number, reason: string) =>
        apiClient.post(`/purchases/${id}/cancel`, null, {params: {reason}}),

    receive: (data: PurchaseReceiptRequest) =>
        apiClient.post('/purchase-receipts', data),

    updatePaymentStatus: (id: number, paidAmount: number) =>
        apiClient.post(`/purchase-receipts/${id}/payment`, null, {params: {paidAmount}}),

    getRecent: (limit: number = 10) =>
        apiClient.get<PurchaseResponse[]>('/purchases/recent', {params: {limit}}),

    getStats: () =>
        apiClient.get<{totalAmount: number, pendingApproval: number}>('/purchases/stats'),
};