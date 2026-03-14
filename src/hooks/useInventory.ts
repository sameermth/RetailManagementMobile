import { useState, useCallback } from 'react';
import {
  inventoryApi,
  InventoryItem,
  Warehouse,
  StockMovement,
  StockAdjustmentRequest,
  StockTransferRequest
} from '@api/inventory';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Warehouse methods
  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getWarehouses();
      setWarehouses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  }, []);

  const getPrimaryWarehouse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getPrimaryWarehouse();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch primary warehouse');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Inventory methods
  const fetchInventory = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getAllInventory(params);
      setInventory(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const getInventoryByProduct = useCallback(async (productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getInventoryByProduct(productId);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch product inventory');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInventoryByWarehouse = useCallback(async (warehouseId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getInventoryByWarehouse(warehouseId);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch warehouse inventory');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLowStockAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getLowStockAlerts();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch low stock alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOutOfStockAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getOutOfStockAlerts();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch out of stock alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustStock = useCallback(async (data: StockAdjustmentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.adjustStock(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const transferStock = useCallback(async (data: StockTransferRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.transferStock(data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to transfer stock');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAvailability = useCallback(async (productId: number, warehouseId: number, quantity: number) => {
    try {
      const response = await inventoryApi.checkAvailability(productId, warehouseId, quantity);
      return response.data;
    } catch (err: any) {
      return false;
    }
  }, []);

  // Stock movements
  const fetchStockMovements = useCallback(async (productId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getStockMovements(productId);
      setStockMovements(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStockMovementsByDate = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getStockMovementsByDate(startDate, endDate);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stock movements by date');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inventory,
    warehouses,
    stockMovements,
    loading,
    error,
    fetchWarehouses,
    getPrimaryWarehouse,
    fetchInventory,
    getInventoryByProduct,
    getInventoryByWarehouse,
    getLowStockAlerts,
    getOutOfStockAlerts,
    adjustStock,
    transferStock,
    checkAvailability,
    fetchStockMovements,
    fetchStockMovementsByDate,
  };
};