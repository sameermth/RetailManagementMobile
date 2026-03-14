import { useState, useCallback } from 'react';
import { customersApi, Customer, CustomerRequest, CustomerSummaryResponse } from '@api/customers';

export const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchCustomers = useCallback(async (page = 0, size = 20, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            if (search) params.q = search;

            const response = search
                ? await customersApi.search(search)
                : await customersApi.getAll(params);

            // Handle both paginated and non-paginated responses
            if (Array.isArray(response.data)) {
                setCustomers(response.data);
            } else {
                setCustomers(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.number);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    }, []);

    const getCustomer = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customer');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createCustomer = useCallback(async (data: CustomerRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create customer');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCustomer = useCallback(async (id: number, data: CustomerRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update customer');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCustomer = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await customersApi.delete(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete customer');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const activateCustomer = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.activate(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate customer');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateCustomer = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.deactivate(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate customer');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCustomersWithDue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.getWithDue();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customers with due');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTopCustomers = useCallback(async (limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customersApi.getTopCustomers(limit);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch top customers');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        customers,
        loading,
        error,
        totalPages,
        currentPage,
        fetchCustomers,
        getCustomer,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        activateCustomer,
        deactivateCustomer,
        getCustomersWithDue,
        getTopCustomers,
    };
};