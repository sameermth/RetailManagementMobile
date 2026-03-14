import { useState, useCallback } from 'react';
import { salesApi, SaleResponse, SaleRequest, PaymentRequest } from '@api/sales';

export const useSales = () => {
    const [sales, setSales] = useState<SaleResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchSales = useCallback(async (page = 0, size = 20, customerId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            let response;

            if (customerId) {
                response = await salesApi.getByCustomer(customerId);
            } else {
                response = await salesApi.getAll(params);
            }

            if (Array.isArray(response.data)) {
                setSales(response.data);
            } else {
                setSales(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.number);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch sales');
        } finally {
            setLoading(false);
        }
    }, []);

    const getSale = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch sale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSaleByInvoice = useCallback(async (invoiceNumber: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.getByInvoice(invoiceNumber);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch sale by invoice');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createSale = useCallback(async (data: SaleRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create sale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelSale = useCallback(async (id: number, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            await salesApi.cancel(id, reason);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel sale');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPayment = useCallback(async (data: PaymentRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.createPayment(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create payment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPaymentsForSale = useCallback(async (saleId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.getPaymentsBySale(saleId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch payments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const generateInvoice = useCallback(async (saleId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.generateInvoice(saleId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate invoice');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getRecentSales = useCallback(async (limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await salesApi.getRecent(limit);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch recent sales');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        sales,
        loading,
        error,
        totalPages,
        currentPage,
        fetchSales,
        getSale,
        getSaleByInvoice,
        createSale,
        cancelSale,
        createPayment,
        getPaymentsForSale,
        generateInvoice,
        getRecentSales,
    };
};