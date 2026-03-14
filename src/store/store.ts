import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import reducers (we have these files but need to ensure they exist)
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';
// These need to be created:
import productReducer from './slices/productSlice';
import customerReducer from './slices/customerSlice';
import saleReducer from './slices/saleSlice';
import inventoryReducer from './slices/inventorySlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth', 'cart'], // Only these will be persisted
    blacklist: ['ui'], // UI state doesn't need persistence
};

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
    products: productReducer,
    customers: customerReducer,
    sales: saleReducer,
    inventory: inventoryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;