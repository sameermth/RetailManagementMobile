import { useState, useCallback } from 'react';
import { distributorsApi, Distributor, DistributorRequest, DistributorOrder, DistributorOrderRequest } from '@api/distributors';

export const useDistributors = () => {
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [orders, setOrders] = useState<DistributorOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    // Distributor CRUD
    const fetchDistributors = useCallback(async (page = 0, size = 20, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            if (search) params.q = search;

            const response = search
                ? await distributorsApi.search(search, params)
                : await distributorsApi.getAll(params);

            setDistributors(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch distributors');
        } finally {
            setLoading(false);
        }
    }, []);

    const getDistributor = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch distributor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createDistributor = useCallback(async (data: DistributorRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create distributor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateDistributor = useCallback(async (id: number, data: DistributorRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update distributor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteDistributor = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.delete(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete distributor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const activateDistributor = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.activate(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate distributor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateDistributor = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.deactivate(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate distributor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Orders
    const fetchOrders = useCallback(async (distributorId: number, page = 0, size = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.getOrders(distributorId, { page, size });
            setOrders(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrder = useCallback(async (orderId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.getOrderById(orderId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch order');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = useCallback(async (data: DistributorOrderRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.createOrder(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create order');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const approveOrder = useCallback(async (orderId: number) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.approveOrder(orderId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to approve order');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const shipOrder = useCallback(async (orderId: number, trackingNumber: string) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.shipOrder(orderId, trackingNumber);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to ship order');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deliverOrder = useCallback(async (orderId: number) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.deliverOrder(orderId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deliver order');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId: number, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            await distributorsApi.cancelOrder(orderId, reason);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel order');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Payments
    const getPayments = useCallback(async (distributorId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.getPayments(distributorId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch payments');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPayment = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await distributorsApi.createPayment(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create payment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        distributors,
        orders,
        loading,
        error,
        totalPages,
        currentPage,
        fetchDistributors,
        getDistributor,
        createDistributor,
        updateDistributor,
        deleteDistributor,
        activateDistributor,
        deactivateDistributor,
        fetchOrders,
        getOrder,
        createOrder,
        approveOrder,
        shipOrder,
        deliverOrder,
        cancelOrder,
        getPayments,
        createPayment,
    };
};