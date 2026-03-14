import { useState, useCallback, useEffect } from 'react';
import { storage } from '@utils/storage';
import { Product } from '@api/products';

export interface CartItem {
    product: Product;
    quantity: number;
    discount?: number;
    notes?: string;
}

export interface CartSummary {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    itemCount: number;
}

const CART_STORAGE_KEY = 'shopping_cart';

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Load cart from storage on mount
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = useCallback(async () => {
        setLoading(true);
        try {
            const savedCart = await storage.get<CartItem[]>(CART_STORAGE_KEY);
            if (savedCart) {
                setItems(savedCart);
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveCart = useCallback(async (newItems: CartItem[]) => {
        try {
            await storage.set(CART_STORAGE_KEY, newItems);
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }, []);

    const addItem = useCallback((product: Product, quantity: number = 1) => {
        setItems(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);

            let newItems;
            if (existingItem) {
                newItems = prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...prev, { product, quantity }];
            }

            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }

        setItems(prev => {
            const newItems = prev.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            );
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const removeItem = useCallback((productId: number) => {
        setItems(prev => {
            const newItems = prev.filter(item => item.product.id !== productId);
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        saveCart([]);
    }, [saveCart]);

    const applyDiscount = useCallback((productId: number, discount: number) => {
        setItems(prev => {
            const newItems = prev.map(item =>
                item.product.id === productId ? { ...item, discount } : item
            );
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const getCartSummary = useCallback((): CartSummary => {
        const subtotal = items.reduce(
            (sum, item) => sum + item.product.unitPrice * item.quantity,
            0
        );

        const discount = items.reduce(
            (sum, item) => sum + (item.discount || 0),
            0
        );

        const taxableAmount = subtotal - discount;
        const tax = items.reduce(
            (sum, item) => sum + (taxableAmount * (item.product.gstRate || 0) / 100),
            0
        );

        const total = taxableAmount + tax;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return { subtotal, discount, tax, total, itemCount };
    }, [items]);

    const validateStock = useCallback(async (checkStock: (productId: number, quantity: number) => Promise<boolean>) => {
        for (const item of items) {
            const available = await checkStock(item.product.id, item.quantity);
            if (!available) {
                return {
                    valid: false,
                    product: item.product.name,
                    message: `Insufficient stock for ${item.product.name}`,
                };
            }
        }
        return { valid: true };
    }, [items]);

    return {
        items,
        loading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyDiscount,
        getCartSummary,
        validateStock,
        itemCount: items.length,
    };
};