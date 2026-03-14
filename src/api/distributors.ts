import apiClient from './client';

export interface Distributor {
    id: number;
    distributorCode: string;
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
    paymentMethod?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankBranch?: string;
    upiId?: string;
    region?: string;
    territory?: string;
    commissionRate?: number;
    deliveryTimeDays?: number;
    minimumOrderValue?: number;
    status: string;
    isActive: boolean;
    lastOrderDate?: string;
}

export interface DistributorRequest {
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
    paymentMethod?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankBranch?: string;
    upiId?: string;
    region?: string;
    territory?: string;
    commissionRate?: number;
    deliveryTimeDays?: number;
    minimumOrderValue?: number;
}

export interface DistributorOrder {
    id: number;
    orderNumber: string;
    distributorId: number;
    distributorName: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    deliveredDate?: string;
    status: string;
    items: DistributorOrderItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: string;
    notes?: string;
}

export interface DistributorOrderItem {
    productId: number;
    productName: string;
    productSku: string;
    quantity: number;
    shippedQuantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface DistributorOrderRequest {
    distributorId: number;
    userId: number;
    expectedDeliveryDate?: string;
    items: {
        productId: number;
        quantity: number;
        unitPrice: number;
    }[];
    discountAmount?: number;
    discountPercentage?: number;
    shippingAmount?: number;
    notes?: string;
}

export interface DistributorPayment {
    id: number;
    paymentReference: string;
    distributorId: number;
    distributorName: string;
    orderId?: number;
    orderNumber?: string;
    paymentDate: string;
    amount: number;
    paymentMethod: string;
    status: string;
    transactionId?: string;
    notes?: string;
}

export const distributorsApi = {
    // Distributor CRUD
    getAll: (params?: any) =>
        apiClient.get<{content: Distributor[], totalPages: number}>('/distributors', {params}),

    getById: (id: number) =>
        apiClient.get<Distributor>(`/distributors/${id}`),

    getByCode: (code: string) =>
        apiClient.get<Distributor>(`/distributors/code/${code}`),

    search: (query: string, params?: any) =>
        apiClient.get<{content: Distributor[], totalPages: number}>(`/distributors/search`, {
            params: {q: query, ...params}
        }),

    getByRegion: (region: string) =>
        apiClient.get<Distributor[]>(`/distributors/region/${region}`),

    getByTerritory: (territory: string) =>
        apiClient.get<Distributor[]>(`/distributors/territory/${territory}`),

    create: (data: DistributorRequest) =>
        apiClient.post<Distributor>('/distributors', data),

    update: (id: number, data: DistributorRequest) =>
        apiClient.put<Distributor>(`/distributors/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/distributors/${id}`),

    activate: (id: number) =>
        apiClient.put(`/distributors/${id}/activate`, {}),

    deactivate: (id: number) =>
        apiClient.put(`/distributors/${id}/deactivate`, {}),

    // Orders
    getOrders: (distributorId: number, params?: any) =>
        apiClient.get<{content: DistributorOrder[], totalPages: number}>(`/distributor-orders/distributor/${distributorId}`, {params}),

    getOrderById: (orderId: number) =>
        apiClient.get<DistributorOrder>(`/distributor-orders/${orderId}`),

    getOrderByNumber: (orderNumber: string) =>
        apiClient.get<DistributorOrder>(`/distributor-orders/number/${orderNumber}`),

    createOrder: (data: DistributorOrderRequest) =>
        apiClient.post<DistributorOrder>('/distributor-orders', data),

    updateOrder: (orderId: number, data: any) =>
        apiClient.put<DistributorOrder>(`/distributor-orders/${orderId}`, data),

    approveOrder: (orderId: number) =>
        apiClient.post(`/distributor-orders/${orderId}/approve`),

    shipOrder: (orderId: number, trackingNumber: string) =>
        apiClient.post(`/distributor-orders/${orderId}/ship`, null, {params: {trackingNumber}}),

    deliverOrder: (orderId: number) =>
        apiClient.post(`/distributor-orders/${orderId}/deliver`),

    cancelOrder: (orderId: number, reason: string) =>
        apiClient.post(`/distributor-orders/${orderId}/cancel`, null, {params: {reason}}),

    // Payments
    getPayments: (distributorId: number) =>
        apiClient.get<DistributorPayment[]>(`/distributor-payments/distributor/${distributorId}`),

    getPaymentsByOrder: (orderId: number) =>
        apiClient.get<DistributorPayment[]>(`/distributor-payments/order/${orderId}`),

    createPayment: (data: any) =>
        apiClient.post<DistributorPayment>('/distributor-payments', data),

    // Stats
    getWithOutstanding: () =>
        apiClient.get<Distributor[]>('/distributors/with-outstanding'),

    getSummaries: () =>
        apiClient.get<{id: number, name: string, code: string}[]>('/distributors/summaries'),
};