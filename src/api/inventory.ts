import apiClient from './client';

export interface Warehouse {
    id: number;
    code: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    isPrimary: boolean;
    isActive: boolean;
}

export interface InventoryItem {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    warehouseId: number;
    warehouseName: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    minimumStock: number;
    reorderPoint: number;
    binLocation?: string;
    lastMovementDate?: string;
}

export interface StockMovement {
    id: number;
    referenceNumber: string;
    productId: number;
    productName: string;
    fromWarehouse?: string;
    toWarehouse?: string;
    movementType: string;
    quantity: number;
    movementDate: string;
    notes?: string;
}

export interface StockAdjustmentRequest {
    productId: number;
    warehouseId: number;
    newQuantity: number;
    reason: string;
}

export interface StockTransferRequest {
    productId: number;
    fromWarehouseId: number;
    toWarehouseId: number;
    quantity: number;
    reason?: string;
}

export const inventoryApi = {
    // Warehouse endpoints
    getWarehouses: () =>
        apiClient.get<Warehouse[]>('/warehouses'),

    getPrimaryWarehouse: () =>
        apiClient.get<Warehouse>('/warehouses/primary'),

    // Inventory endpoints
    getAllInventory: (params?: any) =>
        apiClient.get<InventoryItem[]>('/inventory', {params}),

    getInventoryByProduct: (productId: number) =>
        apiClient.get<InventoryItem[]>(`/inventory/product/${productId}`),

    getInventoryByWarehouse: (warehouseId: number) =>
        apiClient.get<InventoryItem[]>(`/inventory/warehouse/${warehouseId}`),

    getLowStockAlerts: () =>
        apiClient.get<InventoryItem[]>('/inventory/alerts/low-stock'),

    getOutOfStockAlerts: () =>
        apiClient.get<InventoryItem[]>('/inventory/alerts/out-of-stock'),

    adjustStock: (data: StockAdjustmentRequest) =>
        apiClient.post('/inventory/adjust', data),

    transferStock: (data: StockTransferRequest) =>
        apiClient.post('/inventory/transfer', data),

    checkAvailability: (productId: number, warehouseId: number, quantity: number) =>
        apiClient.get<boolean>('/inventory/check-availability', {
            params: {productId, warehouseId, quantity}
        }),

    // Stock movements
    getStockMovements: (productId?: number) =>
        apiClient.get<StockMovement[]>('/stock-movements', {params: {productId}}),

    getStockMovementsByDate: (startDate: string, endDate: string) =>
        apiClient.get<StockMovement[]>('/stock-movements/date-range', {
            params: {startDate, endDate}
        }),
};