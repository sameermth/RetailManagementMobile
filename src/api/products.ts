import apiClient from './client';

export interface Product {
    id: number;
    sku: string;
    name: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    brandId?: number;
    brandName?: string;
    unitPrice: number;
    costPrice?: number;
    gstRate?: number;
    hsnCode?: string;
    unitOfMeasure?: string;
    reorderLevel?: number;
    stockQuantity?: number;
    isActive: boolean;
}

export interface ProductRequest {
    sku: string;
    name: string;
    description?: string;
    categoryId?: number;
    brandId?: number;
    unitPrice: number;
    costPrice?: number;
    gstRate?: number;
    hsnCode?: string;
    unitOfMeasure?: string;
    reorderLevel?: number;
}

export const productsApi = {
    getAll: (params?: any) =>
        apiClient.get<Product[]>('/products', {params}),

    getById: (id: number) =>
        apiClient.get<Product>(`/products/${id}`),

    getBySku: (sku: string) =>
        apiClient.get<Product>(`/products/sku/${sku}`),

    search: (query: string) =>
        apiClient.get<Product[]>('/products/search', {params: {q: query}}),

    create: (data: ProductRequest) =>
        apiClient.post<Product>('/products', data),

    update: (id: number, data: ProductRequest) =>
        apiClient.put<Product>(`/products/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/products/${id}`),

    activate: (id: number) =>
        apiClient.put(`/products/${id}/activate`, {}),

    deactivate: (id: number) =>
        apiClient.put(`/products/${id}/deactivate`, {}),

    getLowStock: () =>
        apiClient.get<Product[]>('/products/needing-reorder'),
};