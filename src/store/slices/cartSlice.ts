import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    productId: number;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    maxQuantity: number;
    discount?: number;
}

interface CartState {
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    customerId?: number;
    notes: string;
}

const initialState: CartState = {
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    notes: '',
};

const calculateTotals = (state: CartState) => {
    state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    state.total = state.subtotal - state.discount + state.tax;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
            const existingItem = state.items.find(item => item.productId === action.payload.productId);
            if (existingItem) {
                existingItem.quantity += action.payload.quantity || 1;
            } else {
                state.items.push({
                    ...action.payload,
                    quantity: action.payload.quantity || 1,
                });
            }
            calculateTotals(state);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
            const item = state.items.find(i => i.productId === action.payload.productId);
            if (item) {
                item.quantity = Math.min(action.payload.quantity, item.maxQuantity);
                if (item.quantity <= 0) {
                    state.items = state.items.filter(i => i.productId !== action.payload.productId);
                }
            }
            calculateTotals(state);
        },
        removeItem: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.productId !== action.payload);
            calculateTotals(state);
        },
        applyDiscount: (state, action: PayloadAction<number>) => {
            state.discount = action.payload;
            calculateTotals(state);
        },
        setCustomer: (state, action: PayloadAction<number>) => {
            state.customerId = action.payload;
        },
        setNotes: (state, action: PayloadAction<string>) => {
            state.notes = action.payload;
        },
        clearCart: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const {
    addItem,
    updateQuantity,
    removeItem,
    applyDiscount,
    setCustomer,
    setNotes,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;