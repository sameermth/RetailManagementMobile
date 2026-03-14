import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customersApi, Customer } from '@api/customers';

interface CustomerState {
    items: Customer[];
    selectedCustomer: Customer | null;
    loading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
}

const initialState: CustomerState = {
    items: [],
    selectedCustomer: null,
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
};

export const fetchCustomers = createAsyncThunk(
    'customers/fetchAll',
    async ({ page = 0, size = 20, search = '' }: { page?: number; size?: number; search?: string }) => {
        const response = await customersApi.getAll({ page, size, search });
        return response.data;
    }
);

export const fetchCustomerById = createAsyncThunk(
    'customers/fetchById',
    async (id: number) => {
        const response = await customersApi.getById(id);
        return response.data;
    }
);

export const createCustomer = createAsyncThunk(
    'customers/create',
    async (customerData: any) => {
        const response = await customersApi.create(customerData);
        return response.data;
    }
);

export const updateCustomer = createAsyncThunk(
    'customers/update',
    async ({ id, data }: { id: number; data: any }) => {
        const response = await customersApi.update(id, data);
        return response.data;
    }
);

const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || action.payload;
                state.totalPages = action.payload.totalPages || 1;
                state.currentPage = action.payload.number || 0;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch customers';
            })
            .addCase(fetchCustomerById.fulfilled, (state, action) => {
                state.selectedCustomer = action.payload;
            })
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                const index = state.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedCustomer?.id === action.payload.id) {
                    state.selectedCustomer = action.payload;
                }
            });
    },
});

export const { clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;