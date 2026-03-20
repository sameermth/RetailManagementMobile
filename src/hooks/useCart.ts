// src/hooks/useCart.ts
import { useState, useCallback, useEffect } from 'react';
import { storage } from '@utils/storage';
import { Product } from '@api/products';

// Extended Product type to include tracking info
export interface ProductWithTracking extends Product {
    trackingMethod?: 'NONE' | 'BATCH' | 'SERIAL';
    warrantyPeriodDays?: number;
    defaultBinLocation?: string;
    defaultShelfNumber?: string;
}

// For SERIAL tracked products
export interface SerialItem {
    id: number;
    serialNumber: string;
    barcode?: string;
    qrCode?: string;
    status: string;
    sellingPrice: number;
    productId: number;
    productName: string;
    productSku: string;
}

// For BATCH tracked products
export interface BatchItem {
    id: number;
    batchNumber: string;
    quantityRemaining: number;
    expiryDate?: string;
    sellingPrice: number;
    productId: number;
    productName: string;
    productSku: string;
}

export interface CartItem {
    id: string; // Unique cart item ID
    product: ProductWithTracking;
    quantity: number;
    discount?: number;
    notes?: string;

    // For SERIAL tracked products
    inventoryItemId?: number;
    serialNumber?: string;
    barcode?: string;

    // For BATCH tracked products
    batchId?: number;
    batchNumber?: string;
    expiryDate?: string;

    // Tracking method (denormalized for easy access)
    trackingMethod: 'NONE' | 'BATCH' | 'SERIAL';
}

export interface CartSummary {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    itemCount: number;
    serialItemsCount: number;
    batchItemsCount: number;
    regularItemsCount: number;
}

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    customerCode?: string;
    loyaltyPoints?: number;
    creditLimit?: number;
    gstNumber?: string;
}

const CART_STORAGE_KEY = 'shopping_cart';
const CUSTOMER_STORAGE_KEY = 'selected_customer';

export const useCart = () => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomerState] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(false);

    // Load cart and customer from storage on mount
    useEffect(() => {
        loadCart();
        loadSelectedCustomer();
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

    const loadSelectedCustomer = useCallback(async () => {
        try {
            const savedCustomer = await storage.get<Customer>(CUSTOMER_STORAGE_KEY);
            if (savedCustomer) {
                setSelectedCustomerState(savedCustomer);
            }
        } catch (error) {
            console.error('Failed to load selected customer:', error);
        }
    }, []);

    const saveCart = useCallback(async (newItems: CartItem[]) => {
        try {
            await storage.set(CART_STORAGE_KEY, newItems);
        } catch (error) {
            console.error('Failed to save cart:', error);
        }
    }, []);

    const saveSelectedCustomer = useCallback(async (customer: Customer | null) => {
        try {
            if (customer) {
                await storage.set(CUSTOMER_STORAGE_KEY, customer);
            } else {
                await storage.remove(CUSTOMER_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to save selected customer:', error);
        }
    }, []);

    // Customer selection methods
    const setSelectedCustomer = useCallback((customer: Customer | null) => {
        setSelectedCustomerState(customer);
        saveSelectedCustomer(customer);
    }, [saveSelectedCustomer]);

    const clearSelectedCustomer = useCallback(() => {
        setSelectedCustomerState(null);
        saveSelectedCustomer(null);
    }, [saveSelectedCustomer]);

    // Add a regular product (NONE tracking)
    const addProduct = useCallback((product: ProductWithTracking, quantity: number = 1) => {
        setItems(prev => {
            // Check if product already exists in cart (non-serial items only)
            const existingItemIndex = prev.findIndex(
                item => item.product.id === product.id &&
                    item.trackingMethod === 'NONE'
            );

            let newItems;
            if (existingItemIndex >= 0) {
                newItems = [...prev];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
            } else {
                const newItem: CartItem = {
                    id: `item-${Date.now()}-${Math.random()}`,
                    product,
                    quantity,
                    trackingMethod: 'NONE'
                };
                newItems = [...prev, newItem];
            }

            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    // Add a serialized item (SERIAL tracking)
    const addSerialItem = useCallback((
        product: ProductWithTracking,
        inventoryItemId: number,
        serialNumber: string,
        barcode?: string,
        sellingPrice?: number
    ) => {
        setItems(prev => {
            // Serial items are always added as new items (each serial is unique)
            const newItem: CartItem = {
                id: `serial-${inventoryItemId}-${Date.now()}`,
                product,
                quantity: 1, // Serial items always quantity 1
                inventoryItemId,
                serialNumber,
                barcode,
                trackingMethod: 'SERIAL'
            };

            const newItems = [...prev, newItem];
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    // Add items from a batch (BATCH tracking)
    const addBatchItems = useCallback((
        product: ProductWithTracking,
        batchId: number,
        batchNumber: string,
        quantity: number,
        expiryDate?: string,
        sellingPrice?: number
    ) => {
        setItems(prev => {
            // Check if same batch already in cart
            const existingBatchIndex = prev.findIndex(
                item => item.batchId === batchId && item.trackingMethod === 'BATCH'
            );

            let newItems;
            if (existingBatchIndex >= 0) {
                newItems = [...prev];
                newItems[existingBatchIndex] = {
                    ...newItems[existingBatchIndex],
                    quantity: newItems[existingBatchIndex].quantity + quantity
                };
            } else {
                const newItem: CartItem = {
                    id: `batch-${batchId}-${Date.now()}`,
                    product,
                    quantity,
                    batchId,
                    batchNumber,
                    expiryDate,
                    trackingMethod: 'BATCH'
                };
                newItems = [...prev, newItem];
            }

            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    // Generic add item (auto-detects type)
    const addItem = useCallback((
        product: ProductWithTracking,
        options?: {
            quantity?: number;
            inventoryItemId?: number;
            serialNumber?: string;
            barcode?: string;
            batchId?: number;
            batchNumber?: string;
            expiryDate?: string;
        }
    ) => {
        const trackingMethod = product.trackingMethod || 'NONE';

        if (trackingMethod === 'SERIAL') {
            if (!options?.inventoryItemId || !options?.serialNumber) {
                console.error('Serial number required for SERIAL product');
                return;
            }
            addSerialItem(
                product,
                options.inventoryItemId,
                options.serialNumber,
                options.barcode,
                product.unitPrice
            );
        } else if (trackingMethod === 'BATCH') {
            if (!options?.batchId || !options?.batchNumber) {
                console.error('Batch info required for BATCH product');
                return;
            }
            addBatchItems(
                product,
                options.batchId,
                options.batchNumber,
                options.quantity || 1,
                options.expiryDate,
                product.unitPrice
            );
        } else {
            addProduct(product, options?.quantity || 1);
        }
    }, [addProduct, addSerialItem, addBatchItems]);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

        setItems(prev => {
            const item = prev.find(i => i.id === itemId);

            // Cannot update quantity of serial items (always 1)
            if (item?.trackingMethod === 'SERIAL') {
                return prev;
            }

            const newItems = prev.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            );
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const removeItem = useCallback((itemId: string) => {
        setItems(prev => {
            const newItems = prev.filter(item => item.id !== itemId);
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        saveCart([]);
        // Note: We don't clear selected customer here as it might be intentional
    }, [saveCart]);

    const clearAll = useCallback(() => {
        setItems([]);
        setSelectedCustomerState(null);
        saveCart([]);
        saveSelectedCustomer(null);
    }, [saveCart, saveSelectedCustomer]);

    const applyDiscount = useCallback((itemId: string, discount: number) => {
        setItems(prev => {
            const newItems = prev.map(item =>
                item.id === itemId ? { ...item, discount } : item
            );
            saveCart(newItems);
            return newItems;
        });
    }, [saveCart]);

    const getCartSummary = useCallback((): CartSummary => {
        let subtotal = 0;
        let discount = 0;
        let serialItemsCount = 0;
        let batchItemsCount = 0;
        let regularItemsCount = 0;

        items.forEach(item => {
            const itemSubtotal = item.product.unitPrice * item.quantity;
            subtotal += itemSubtotal;
            discount += item.discount || 0;

            if (item.trackingMethod === 'SERIAL') {
                serialItemsCount += item.quantity;
            } else if (item.trackingMethod === 'BATCH') {
                batchItemsCount += item.quantity;
            } else {
                regularItemsCount += item.quantity;
            }
        });

        const taxableAmount = subtotal - discount;

        // Calculate weighted average tax rate
        let totalTax = 0;
        items.forEach(item => {
            const itemSubtotal = item.product.unitPrice * item.quantity;
            const itemDiscount = (item.discount || 0) * (itemSubtotal / subtotal);
            const itemTaxable = itemSubtotal - itemDiscount;
            totalTax += itemTaxable * ((item.product.gstRate || 0) / 100);
        });

        const total = taxableAmount + totalTax;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            subtotal,
            discount,
            tax: totalTax,
            total,
            itemCount,
            serialItemsCount,
            batchItemsCount,
            regularItemsCount
        };
    }, [items]);

    const validateStock = useCallback(async (
        checkStock: (productId: number, quantity: number, options?: any) => Promise<boolean>
    ) => {
        for (const item of items) {
            if (item.trackingMethod === 'SERIAL') {
                // Serial items are already specific units, just verify they're still available
                const available = await checkStock(item.product.id, 1, {
                    inventoryItemId: item.inventoryItemId
                });
                if (!available) {
                    return {
                        valid: false,
                        item,
                        message: `Serial number ${item.serialNumber} is no longer available`,
                    };
                }
            } else if (item.trackingMethod === 'BATCH') {
                // Check batch quantity
                const available = await checkStock(item.product.id, item.quantity, {
                    batchId: item.batchId
                });
                if (!available) {
                    return {
                        valid: false,
                        item,
                        message: `Insufficient stock in batch ${item.batchNumber}`,
                    };
                }
            } else {
                // Regular product stock check
                const available = await checkStock(item.product.id, item.quantity);
                if (!available) {
                    return {
                        valid: false,
                        item,
                        message: `Insufficient stock for ${item.product.name}`,
                    };
                }
            }
        }
        return { valid: true };
    }, [items]);

    // Get items grouped by type for display
    const getItemsByType = useCallback(() => {
        return {
            serial: items.filter(i => i.trackingMethod === 'SERIAL'),
            batch: items.filter(i => i.trackingMethod === 'BATCH'),
            regular: items.filter(i => i.trackingMethod === 'NONE')
        };
    }, [items]);

    // Check if customer is selected (useful for checkout validation)
    const isCustomerSelected = useCallback(() => {
        return selectedCustomer !== null;
    }, [selectedCustomer]);

    return {
        // Cart items
        items,
        loading,

        // Customer selection
        selectedCustomer,
        setSelectedCustomer,
        clearSelectedCustomer,
        isCustomerSelected,

        // Add methods
        addItem,
        addProduct,
        addSerialItem,
        addBatchItems,

        // Item management
        updateQuantity,
        removeItem,
        clearCart,
        clearAll,
        applyDiscount,

        // Calculations
        getCartSummary,
        getItemsByType,
        validateStock,

        // Utility
        itemCount: items.length,
    };
};