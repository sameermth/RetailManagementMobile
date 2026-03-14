import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { inventoryApi, InventoryItem } from '@api/inventory';

interface InventoryState {
    items: InventoryItem[];
    lowStockItems: InventoryItem[];
    loading: boolean;
    error: string | null;
}

const initialState: InventoryState = {
    items: [],
    lowStockItems: [],
    loading: false,
    error: null,
};

export const fetchInventory = createAsyncThunk(
    'inventory/fetchAll',
    async (params?: any) => {
        const response = await inventoryApi.getAllInventory(params);
        return response.data;
    }
);

export const fetchLowStockAlerts = createAsyncThunk(
    'inventory/fetchLowStock',
    async () => {
        const response = await inventoryApi.getLowStockAlerts();
        return response.data;
    }
);

export const adjustStock = createAsyncThunk(
    'inventory/adjust',
    async (data: any) => {
        const response = await inventoryApi.adjustStock(data);
        return response.data;
    }
);

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInventory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInventory.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchInventory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch inventory';
            })
            .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
                state.lowStockItems = action.payload;
            })
            .addCase(adjustStock.fulfilled, (state, action) => {
                // Update the specific item in the list
                const index = state.items.findIndex(i => i.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    },
});

export const { clearError } = inventorySlice.actions;
export default inventorySlice.reducer;