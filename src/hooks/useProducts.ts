import { useState, useCallback } from 'react';
import { productsApi, Product, ProductRequest } from '@api/products';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchProducts = useCallback(async (page = 0, size = 20, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            if (search) params.q = search;

            const response = search
                ? await productsApi.search(search, params)
                : await productsApi.getAll(params);

            // Handle both paginated and non-paginated responses
            if (Array.isArray(response.data)) {
                setProducts(response.data);
                setTotalPages(1);
                setTotalElements(response.data.length);
            } else {
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.number);
                setTotalElements(response.data.totalElements);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, []);

    const getProduct = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch product');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getProductBySku = useCallback(async (sku: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.getBySku(sku);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch product by SKU');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = useCallback(async (data: ProductRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create product');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (id: number, data: ProductRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update product');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await productsApi.delete(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete product');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const activateProduct = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.activate(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate product');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateProduct = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.deactivate(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate product');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getLowStockProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await productsApi.getLowStock();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch low stock products');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const checkSkuUnique = useCallback(async (sku: string) => {
        try {
            const response = await productsApi.checkSku(sku);
            return response.data;
        } catch (err: any) {
            return false;
        }
    }, []);

    return {
        products,
        loading,
        error,
        totalPages,
        currentPage,
        totalElements,
        fetchProducts,
        getProduct,
        getProductBySku,
        createProduct,
        updateProduct,
        deleteProduct,
        activateProduct,
        deactivateProduct,
        getLowStockProducts,
        checkSkuUnique,
    };
};