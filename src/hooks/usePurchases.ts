import { useState, useCallback } from 'react';
import { purchasesApi, PurchaseResponse, PurchaseRequest, PurchaseReceiptRequest } from '@api/purchases';

export const usePurchases = () => {
    const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchPurchases = useCallback(async (page = 0, size = 20, status?: string, supplierId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            let response;

            if (supplierId) {
                response = await purchasesApi.getBySupplier(supplierId, params);
            } else if (status) {
                response = await purchasesApi.getByStatus(status, params);
            } else {
                response = await purchasesApi.getAll(params);
            }

            if (Array.isArray(response.data)) {
                setPurchases(response.data);
                setTotalPages(1);
            } else {
                setPurchases(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.number);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch purchases');
        } finally {
            setLoading(false);
        }
    }, []);

    const getPurchase = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch purchase');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPurchaseByOrderNumber = useCallback(async (orderNumber: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.getByOrderNumber(orderNumber);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch purchase by order number');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPurchase = useCallback(async (data: PurchaseRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create purchase');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePurchase = useCallback(async (id: number, data: PurchaseRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update purchase');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const approvePurchase = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await purchasesApi.approve(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to approve purchase');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelPurchase = useCallback(async (id: number, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            await purchasesApi.cancel(id, reason);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel purchase');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const receivePurchase = useCallback(async (data: PurchaseReceiptRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.receive(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to receive purchase');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePaymentStatus = useCallback(async (id: number, paidAmount: number) => {
        setLoading(true);
        setError(null);
        try {
            await purchasesApi.updatePaymentStatus(id, paidAmount);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update payment status');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRecentPurchases = useCallback(async (limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.getRecent(limit);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch recent purchases');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPurchaseStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await purchasesApi.getStats();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch purchase stats');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        purchases,
        loading,
        error,
        totalPages,
        currentPage,
        fetchPurchases,
        getPurchase,
        getPurchaseByOrderNumber,
        createPurchase,
        updatePurchase,
        approvePurchase,
        cancelPurchase,
        receivePurchase,
        updatePaymentStatus,
        getRecentPurchases,
        getPurchaseStats,
    };
};