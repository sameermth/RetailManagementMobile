import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productsApi, Product } from '@api/products';

interface ProductState {
    items: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
}

const initialState: ProductState = {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async ({ page = 0, size = 20, search = '' }: { page?: number; size?: number; search?: string }) => {
        const response = await productsApi.getAll({ page, size, search });
        return response.data;
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchById',
    async (id: number) => {
        const response = await productsApi.getById(id);
        return response.data;
    }
);

export const createProduct = createAsyncThunk(
    'products/create',
    async (productData: any) => {
        const response = await productsApi.create(productData);
        return response.data;
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, data }: { id: number; data: any }) => {
        const response = await productsApi.update(id, data);
        return response.data;
    }
);

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id: number) => {
        await productsApi.delete(id);
        return id;
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || action.payload;
                state.totalPages = action.payload.totalPages || 1;
                state.currentPage = action.payload.number || 0;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch products';
            })

            // Fetch Single Product
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch product';
            })

            // Create Product
            .addCase(createProduct.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })

            // Update Product
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedProduct?.id === action.payload.id) {
                    state.selectedProduct = action.payload;
                }
            })

            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter(p => p.id !== action.payload);
                if (state.selectedProduct?.id === action.payload) {
                    state.selectedProduct = null;
                }
            });
    },
});

export const { clearSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;