import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { salesApi, SaleResponse } from '@api/sales';

interface SaleState {
    items: SaleResponse[];
    selectedSale: SaleResponse | null;
    loading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
}

const initialState: SaleState = {
    items: [],
    selectedSale: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
};

export const fetchSales = createAsyncThunk(
    'sales/fetchAll',
    async ({ page = 0, size = 20 }: { page?: number; size?: number }) => {
        const response = await salesApi.getAll({ page, size });
        return response.data;
    }
);

export const fetchSaleById = createAsyncThunk(
    'sales/fetchById',
    async (id: number) => {
        const response = await salesApi.getById(id);
        return response.data;
    }
);

export const createSale = createAsyncThunk(
    'sales/create',
    async (saleData: any) => {
        const response = await salesApi.create(saleData);
        return response.data;
    }
);

const saleSlice = createSlice({
    name: 'sales',
    initialState,
    reducers: {
        clearSelectedSale: (state) => {
            state.selectedSale = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSales.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSales.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || action.payload;
                state.totalPages = action.payload.totalPages || 1;
                state.currentPage = action.payload.number || 0;
            })
            .addCase(fetchSales.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch sales';
            })
            .addCase(fetchSaleById.fulfilled, (state, action) => {
                state.selectedSale = action.payload;
            })
            .addCase(createSale.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            });
    },
});

export const { clearSelectedSale } = saleSlice.actions;
export default saleSlice.reducer;