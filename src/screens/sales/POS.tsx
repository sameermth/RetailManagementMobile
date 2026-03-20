import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '@hooks/useProducts';
import { useCart } from '@hooks/useCart';
import { useCustomers } from '@hooks/useCustomers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';
import apiClient from '@api/client';

// Extend Product type to include tracking info
interface ProductWithTracking {
    id: number;
    name: string;
    sku: string;
    unitPrice: number;
    stockQuantity: number;
    categoryName?: string;
    imageUrl?: string;
    trackingMethod?: 'NONE' | 'BATCH' | 'SERIAL';
    warrantyPeriodDays?: number;
    barcode?: string;
}

interface BatchInfo {
    id: number;
    batchNumber: string;
    quantityRemaining: number;
    expiryDate?: string;
    sellingPrice: number;
    productId: number;
    productName: string;
    productSku: string;
}

interface SerialInfo {
    id: number;
    serialNumber: string;
    barcode: string;
    status: string;
    sellingPrice: number;
    productId: number;
    productName: string;
    productSku: string;
}

const POSScreen = () => {
    const navigation = useNavigation();
    const { products, loading, fetchProducts } = useProducts();
    const { items, addItem, getCartSummary, selectedCustomer, setSelectedCustomer } = useCart();
    const { customers, fetchCustomers } = useCustomers();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');

    // Batch selection
    const [selectedBatch, setSelectedBatch] = useState<BatchInfo | null>(null);
    const [batchQuantity, setBatchQuantity] = useState('1');
    const [showBatchModal, setShowBatchModal] = useState(false);

    // Serial selection
    const [showSerialModal, setShowSerialModal] = useState(false);
    const [availableSerials, setAvailableSerials] = useState<SerialInfo[]>([]);
    const [selectedProductForSerial, setSelectedProductForSerial] = useState<ProductWithTracking | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);
    const cartSummary = getCartSummary();

    useEffect(() => {
        loadProducts();
    }, [debouncedSearch, selectedCategory]);

    useEffect(() => {
        // Extract unique categories from products
        const uniqueCategories = [...new Set(products.map((p: any) => p.categoryName).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
    }, [products]);

    useEffect(() => {
        if (customerSearchQuery.length > 2) {
            loadCustomers();
        }
    }, [customerSearchQuery]);

    const loadProducts = async () => {
        await fetchProducts(0, 50, debouncedSearch);
    };

    const loadCustomers = async () => {
        await fetchCustomers(0, 20, customerSearchQuery);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    // Handle barcode scan
    const handleBarcodeScan = async (barcode: string) => {
        setShowScanner(false);
        setScanning(true);

        try {
            // Try to find as serial number first
            const serialResponse = await apiClient.get(`/inventory-items/barcode/${barcode}`);
            if (serialResponse.data) {
                const serial = serialResponse.data;
                handleAddSerialToCart(serial);
                return;
            }
        } catch (error) {
            // Not a serial item, continue
        }

        try {
            // Try as batch barcode
            const batchResponse = await apiClient.get(`/batches/barcode/${barcode}`);
            if (batchResponse.data) {
                const batch = batchResponse.data;
                setSelectedBatch(batch);
                setShowBatchModal(true);
                return;
            }
        } catch (error) {
            // Not a batch, continue
        }

        try {
            // Try as product barcode
            const productResponse = await apiClient.get(`/products/barcode/${barcode}`);
            if (productResponse.data) {
                const product = productResponse.data;
                handleProductSelection(product);
            }
        } catch (error) {
            Alert.alert('Not Found', 'No product or item found with this barcode');
        } finally {
            setScanning(false);
        }
    };

    // Handle product selection based on tracking method
    const handleProductSelection = (product: any) => {
        const trackingMethod = product.trackingMethod || 'NONE';

        if (trackingMethod === 'SERIAL') {
            // Fetch available serials for this product
            fetchAvailableSerials(product.id);
            setSelectedProductForSerial(product);
            setShowSerialModal(true);
        } else if (trackingMethod === 'BATCH') {
            // Fetch available batches for this product
            fetchAvailableBatches(product.id);
        } else {
            // Simple product - add directly
            addItem(product, {});
            Alert.alert('Success', `${product.name} added to cart`);
        }
    };

    const fetchAvailableSerials = async (productId: number) => {
        try {
            const response = await apiClient.get(`/products/${productId}/serials/available`);
            setAvailableSerials(response.data);
        } catch (error) {
            console.error('Failed to fetch serials:', error);
            Alert.alert('Error', 'Could not load available serial numbers');
        }
    };

    const fetchAvailableBatches = async (productId: number) => {
        try {
            const response = await apiClient.get(`/products/${productId}/batches/available`);
            if (response.data.length > 0) {
                // For simplicity, select the first batch
                // In a real app, you might want a batch selection modal
                setSelectedBatch(response.data[0]);
                setShowBatchModal(true);
            } else {
                Alert.alert('Out of Stock', 'No batches available for this product');
            }
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const handleAddSerialToCart = (serial: SerialInfo) => {
        addItem(
            {
                id: serial.productId,
                name: serial.productName,
                sku: serial.productSku,
                unitPrice: serial.sellingPrice,
                trackingMethod: 'SERIAL'
            } as any,
            {
                inventoryItemId: serial.id,
                serialNumber: serial.serialNumber,
                barcode: serial.barcode,
                quantity: 1
            }
        );
        setShowSerialModal(false);
        setSelectedProductForSerial(null);
        Alert.alert('Success', `Added ${serial.productName} (SN: ${serial.serialNumber})`);
    };

    const handleAddBatch = () => {
        if (selectedBatch && parseInt(batchQuantity) > 0) {
            if (parseInt(batchQuantity) > selectedBatch.quantityRemaining) {
                Alert.alert('Error', 'Quantity exceeds available stock');
                return;
            }

            addItem(
                {
                    id: selectedBatch.productId,
                    name: selectedBatch.productName,
                    sku: selectedBatch.productSku,
                    unitPrice: selectedBatch.sellingPrice,
                    trackingMethod: 'BATCH'
                } as any,
                {
                    batchId: selectedBatch.id,
                    batchNumber: selectedBatch.batchNumber,
                    quantity: parseInt(batchQuantity),
                    expiryDate: selectedBatch.expiryDate
                }
            );

            setShowBatchModal(false);
            setSelectedBatch(null);
            setBatchQuantity('1');
            Alert.alert('Success', `Added ${batchQuantity} from batch ${selectedBatch.batchNumber}`);
        }
    };

    const handleAddToCart = (product: any) => {
        handleProductSelection(product);
    };

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.productCard, item.stockQuantity <= 0 && styles.outOfStockCard]}
            onPress={() => handleAddToCart(item)}
            disabled={item.stockQuantity <= 0}
        >
            <View style={[styles.productImage, !item.imageUrl && styles.placeholderImage]}>
                {item.imageUrl ? (
                    <Text>Image</Text>
                ) : (
                    <Icon name="package" size={32} color={colors.gray[400]} />
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productSku}>{item.sku}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.unitPrice)}</Text>

                {/* Tracking Method Badge */}
                {item.trackingMethod && item.trackingMethod !== 'NONE' && (
                    <View style={[
                        styles.trackingBadge,
                        item.trackingMethod === 'SERIAL' ? styles.serialBadge : styles.batchBadge
                    ]}>
                        <Icon
                            name={item.trackingMethod === 'SERIAL' ? 'barcode' : 'package'}
                            size={10}
                            color={item.trackingMethod === 'SERIAL' ? colors.primary[500] : colors.info}
                        />
                        <Text style={[
                            styles.trackingText,
                            item.trackingMethod === 'SERIAL' ? styles.serialText : styles.batchText
                        ]}>
                            {item.trackingMethod}
                        </Text>
                    </View>
                )}

                <View style={styles.stockContainer}>
                    <Icon
                        name={item.stockQuantity > 0 ? 'check-circle' : 'close-circle'}
                        size={14}
                        color={item.stockQuantity > 0 ? colors.success : colors.error}
                    />
                    <Text style={[styles.stockText, item.stockQuantity <= 0 && styles.outOfStockText]}>
                        {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Customer Selection Bar */}
            <TouchableOpacity
                style={styles.customerBar}
                onPress={() => setShowCustomerModal(true)}
            >
                <View style={styles.customerBarLeft}>
                    <Icon
                        name={selectedCustomer ? "account-check" : "account"}
                        size={20}
                        color={selectedCustomer ? colors.success : colors.primary[500]}
                    />
                    <Text style={styles.customerBarText} numberOfLines={1}>
                        {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                    </Text>
                </View>
                <Icon name="chevron-down" size={20} color={colors.gray[400]} />
            </TouchableOpacity>

            {/* Cart Summary Bar */}
            <TouchableOpacity
                style={styles.cartBar}
                onPress={() => navigation.navigate('Cart')}
            >
                <View style={styles.cartInfo}>
                    <Icon name="cart" size={24} color={colors.background} />
                    <Text style={styles.cartCount}>{cartSummary.itemCount}</Text>
                </View>
                <View style={styles.cartTotal}>
                    <Text style={styles.cartTotalLabel}>Total:</Text>
                    <Text style={styles.cartTotalValue}>{formatCurrency(cartSummary.total)}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.background} />
            </TouchableOpacity>

            {/* Search Bar with Scanner */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products or scan barcode..."
                    placeholderTextColor={colors.gray[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={() => setShowScanner(true)}>
                    <Icon name="camera" size={24} color={colors.primary[500]} />
                </TouchableOpacity>
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Icon name="close" size={20} color={colors.gray[400]} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Categories Scroll */}
            {categories.length > 0 && (
                <FlatList
                    horizontal
                    data={categories}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategory === item && styles.categoryChipTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            )}
        </View>
    );

    // Customer Selection Modal
    const renderCustomerModal = () => (
        <Modal visible={showCustomerModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Customer</Text>
                        <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                            <Icon name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalSearch}>
                        <Icon name="magnify" size={20} color={colors.gray[400]} />
                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder="Search customers..."
                            value={customerSearchQuery}
                            onChangeText={setCustomerSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={customers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.customerItem}
                                onPress={() => {
                                    setSelectedCustomer(item);
                                    setShowCustomerModal(false);
                                    setCustomerSearchQuery('');
                                }}
                            >
                                <View style={styles.customerAvatar}>
                                    <Text style={styles.customerInitials}>
                                        {item.name?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.customerInfo}>
                                    <Text style={styles.customerName}>{item.name}</Text>
                                    <Text style={styles.customerDetail}>
                                        {item.phone || 'No phone'} • {item.email || 'No email'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.modalEmpty}>
                                <Text>No customers found</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    // Batch Quantity Modal
    const renderBatchModal = () => (
        <Modal visible={showBatchModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add from Batch</Text>

                    {selectedBatch && (
                        <>
                            <Text style={styles.batchInfoLabel}>Product</Text>
                            <Text style={styles.batchInfoValue}>{selectedBatch.productName}</Text>

                            <Text style={styles.batchInfoLabel}>Batch Number</Text>
                            <Text style={styles.batchInfoValue}>{selectedBatch.batchNumber}</Text>

                            {selectedBatch.expiryDate && (
                                <>
                                    <Text style={styles.batchInfoLabel}>Expiry Date</Text>
                                    <Text style={styles.batchInfoValue}>
                                        {new Date(selectedBatch.expiryDate).toLocaleDateString()}
                                    </Text>
                                </>
                            )}

                            <Text style={styles.batchInfoLabel}>Available</Text>
                            <Text style={styles.batchInfoValue}>{selectedBatch.quantityRemaining} units</Text>

                            <View style={styles.quantityContainer}>
                                <Text style={styles.quantityLabel}>Quantity:</Text>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => setBatchQuantity(prev =>
                                            Math.max(1, parseInt(prev) - 1).toString()
                                        )}
                                    >
                                        <Icon name="minus" size={16} color={colors.primary[500]} />
                                    </TouchableOpacity>

                                    <TextInput
                                        style={styles.qtyInput}
                                        value={batchQuantity}
                                        onChangeText={setBatchQuantity}
                                        keyboardType="numeric"
                                    />

                                    <TouchableOpacity
                                        style={styles.qtyButton}
                                        onPress={() => setBatchQuantity(prev =>
                                            (parseInt(prev) + 1).toString()
                                        )}
                                    >
                                        <Icon name="plus" size={16} color={colors.primary[500]} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setShowBatchModal(false);
                                        setSelectedBatch(null);
                                        setBatchQuantity('1');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalButton, styles.addButton]}
                                    onPress={handleAddBatch}
                                >
                                    <Text style={styles.addButtonText}>Add to Cart</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    // Serial Selection Modal
    const renderSerialModal = () => (
        <Modal visible={showSerialModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Serial Number</Text>
                        <TouchableOpacity onPress={() => {
                            setShowSerialModal(false);
                            setSelectedProductForSerial(null);
                        }}>
                            <Icon name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {selectedProductForSerial && (
                        <Text style={styles.serialProductName}>{selectedProductForSerial.name}</Text>
                    )}

                    <FlatList
                        data={availableSerials}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.serialItem}
                                onPress={() => handleAddSerialToCart(item)}
                            >
                                <View style={styles.serialInfo}>
                                    <Icon name="barcode" size={20} color={colors.primary[500]} />
                                    <Text style={styles.serialNumber}>{item.serialNumber}</Text>
                                </View>
                                <Text style={styles.serialPrice}>{formatCurrency(item.sellingPrice)}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.modalEmpty}>
                                <Text>No serial numbers available</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    // Scanner Modal (simplified for now)
    const renderScannerModal = () => (
        <Modal visible={showScanner} animationType="slide">
            <View style={styles.scannerContainer}>
                <View style={styles.scannerHeader}>
                    <Text style={styles.scannerTitle}>Scan Barcode/QR</Text>
                    <TouchableOpacity onPress={() => setShowScanner(false)}>
                        <Icon name="close" size={30} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.cameraPlaceholder}>
                    <Icon name="camera" size={64} color={colors.gray[400]} />
                    <Text style={styles.cameraPlaceholderText}>
                        Camera view would appear here
                    </Text>
                    <TouchableOpacity
                        style={styles.simulateScanButton}
                        onPress={() => handleBarcodeScan('SIMULATED-BARCODE-123')}
                    >
                        <Text style={styles.simulateScanText}>Simulate Scan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderCustomerModal()}
            {renderBatchModal()}
            {renderSerialModal()}
            {renderScannerModal()}

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Icon name="package-variant" size={64} color={colors.gray[300]} />
                            <Text style={styles.emptyStateTitle}>No Products Found</Text>
                            <Text style={styles.emptyStateText}>
                                {searchQuery
                                    ? `No products matching "${searchQuery}"`
                                    : 'No products available for sale'}
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loading ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color={colors.primary[500]} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

// Add these new styles to your existing StyleSheet
const styles = StyleSheet.create({
    customerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: 12,
        marginHorizontal: 12,
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    customerBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    customerBarText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
        flex: 1,
    },
    clearButton: {
        marginLeft: 8,
    },
    outOfStockCard: {
        opacity: 0.5,
    },
    trackingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: 4,
    },
    serialBadge: {
        backgroundColor: colors.primary[50],
    },
    batchBadge: {
        backgroundColor: colors.info + '20',
    },
    trackingText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 2,
    },
    serialText: {
        color: colors.primary[500],
    },
    batchText: {
        color: colors.info,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    modalSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    modalSearchInput: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    customerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    customerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    customerInitials: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    customerDetail: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    modalEmpty: {
        padding: 20,
        alignItems: 'center',
    },
    batchInfoLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginTop: 12,
        marginBottom: 2,
    },
    batchInfoValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    quantityContainer: {
        marginTop: 16,
        marginBottom: 20,
    },
    quantityLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyInput: {
        width: 60,
        textAlign: 'center',
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: colors.gray[100],
    },
    cancelButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    addButton: {
        backgroundColor: colors.success,
    },
    addButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
    serialProductName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    serialItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    serialInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serialNumber: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 12,
    },
    serialPrice: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
    },
    scannerContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scannerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    scannerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    cameraPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray[900],
    },
    cameraPlaceholderText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[400],
        marginTop: 16,
    },
    simulateScanButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.primary[500],
        borderRadius: 8,
    },
    simulateScanText: {
        color: colors.background,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
    },
    // Keep all your existing styles
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cartBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary[500],
        padding: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 12,
    },
    cartInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartCount: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.background,
        marginLeft: 8,
        backgroundColor: colors.primary[700],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cartTotal: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartTotalLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.background + 'CC',
        marginRight: 4,
    },
    cartTotalValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        padding: 0,
    },
    categoriesList: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    categoryChip: {
        backgroundColor: colors.gray[100],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: colors.primary[500],
    },
    categoryChipText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    categoryChipTextActive: {
        color: colors.background,
    },
    listContent: {
        padding: 8,
        flexGrow: 1,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.gray[100],
        borderRadius: 8,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        backgroundColor: colors.gray[100],
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    productSku: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
        marginBottom: 4,
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.success,
        marginLeft: 4,
    },
    outOfStockText: {
        color: colors.error,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default POSScreen;