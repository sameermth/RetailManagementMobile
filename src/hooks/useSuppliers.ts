import { useState, useCallback } from 'react';
import { suppliersApi, Supplier, SupplierRequest, SupplierSummary } from '@api/suppliers';

export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [summaries, setSummaries] = useState<SupplierSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchSuppliers = useCallback(async (page = 0, size = 20, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            if (search) params.q = search;

            const response = search
                ? await suppliersApi.search(search, params)
                : await suppliersApi.getAll(params);

            setSuppliers(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSupplierSummaries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.getSummaries();
            setSummaries(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch supplier summaries');
        } finally {
            setLoading(false);
        }
    }, []);

    const getSupplier = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch supplier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createSupplier = useCallback(async (data: SupplierRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create supplier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSupplier = useCallback(async (id: number, data: SupplierRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update supplier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const activateSupplier = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.activate(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate supplier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateSupplier = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.deactivate(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate supplier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getWithOutstanding = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await suppliersApi.getWithOutstanding();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch suppliers with outstanding');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        suppliers,
        summaries,
        loading,
        error,
        totalPages,
        currentPage,
        fetchSuppliers,
        fetchSupplierSummaries,
        getSupplier,
        createSupplier,
        updateSupplier,
        activateSupplier,
        deactivateSupplier,
        getWithOutstanding,
    };
};