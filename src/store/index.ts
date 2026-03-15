import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

// Import your slices (you'll need to create these)
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import saleReducer from './slices/saleSlice';
import inventoryReducer from './slices/inventorySlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth'], // only auth will be persisted
};

const rootReducer = combineReducers({
    auth: authReducer,
    products: productReducer,
    sales: saleReducer,
    inventory: inventoryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;