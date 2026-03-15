import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert, Platform,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePurchases } from '@hooks/usePurchases';
import { useInventory } from '@hooks/useInventory';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';

const ReceivePurchaseScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { purchaseId } = route.params as { purchaseId: number };

    const { getPurchase, receivePurchase, loading } = usePurchases();
    const { warehouses, fetchWarehouses } = useInventory();

    const [purchase, setPurchase] = useState<any>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
    const [receiptItems, setReceiptItems] = useState<any[]>([]);
    const [showWarehousePicker, setShowWarehousePicker] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadData();
        fetchWarehouses();
    }, []);

    const loadData = async () => {
        try {
            const data = await getPurchase(purchaseId);
            setPurchase(data);

            // Initialize receipt items from purchase items
            const initialItems = data.items.map((item: any) => ({
                purchaseItemId: item.id,
                productId: item.productId,
                productName: item.productName,
                productSku: item.productSku,
                quantityOrdered: item.quantity,
                quantityReceived: item.receivedQuantity || 0,
                quantityToReceive: item.quantity - (item.receivedQuantity || 0),
                batchNumber: '',
                expiryDate: '',
                location: '',
            })).filter((item: any) => item.quantityToReceive > 0);

            setReceiptItems(initialItems);
        } catch (error) {
            Alert.alert('Error', 'Failed to load purchase details');
        }
    };

    const updateQuantity = (index: number, quantity: number) => {
        const newItems = [...receiptItems];
        const maxQuantity = newItems[index].quantityToReceive;
        newItems[index].quantityToReceive = Math.min(quantity, maxQuantity);
        setReceiptItems(newItems);
    };

    const updateBatchNumber = (index: number, batchNumber: string) => {
        const newItems = [...receiptItems];
        newItems[index].batchNumber = batchNumber;
        setReceiptItems(newItems);
    };

    const updateExpiryDate = (index: number, expiryDate: string) => {
        const newItems = [...receiptItems];
        newItems[index].expiryDate = expiryDate;
        setReceiptItems(newItems);
    };

    const updateLocation = (index: number, location: string) => {
        const newItems = [...receiptItems];
        newItems[index].location = location;
        setReceiptItems(newItems);
    };

    const validateForm = () => {
        if (!selectedWarehouse) {
            Alert.alert('Error', 'Please select a warehouse');
            return false;
        }

        for (const item of receiptItems) {
            if (item.quantityToReceive > item.quantityOrdered) {
                Alert.alert('Error', `Quantity for ${item.productName} exceeds ordered quantity`);
                return false;
            }
            if (item.quantityToReceive < 0) {
                Alert.alert('Error', `Invalid quantity for ${item.productName}`);
                return false;
            }
        }

        const hasItemsToReceive = receiptItems.some(item => item.quantityToReceive > 0);
        if (!hasItemsToReceive) {
            Alert.alert('Error', 'No items to receive');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const receiptData = {
                purchaseId,
                warehouseId: selectedWarehouse.id,
                items: receiptItems
                    .filter(item => item.quantityToReceive > 0)
                    .map(item => ({
                        purchaseItemId: item.purchaseItemId,
                        quantityReceived: item.quantityToReceive,
                        batchNumber: item.batchNumber || undefined,
                        expiryDate: item.expiryDate || undefined,
                        location: item.location || undefined,
                    })),
                notes: notes || undefined,
            };

            await receivePurchase(receiptData);
            Alert.alert('Success', 'Purchase order received successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to receive purchase');
        }
    };

    const renderWarehousePicker = () => (
        <View style={styles.pickerOverlay}>
            <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Warehouse</Text>
                <TouchableOpacity onPress={() => setShowWarehousePicker(false)}>
                    <Icon name="close" size={24} color={colors.gray[600]} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerList}>
                {warehouses.map((warehouse) => (
                    <TouchableOpacity
                        key={warehouse.id}
                        style={styles.pickerItem}
                        onPress={() => {
                            setSelectedWarehouse(warehouse);
                            setShowWarehousePicker(false);
                        }}
                    >
                        <View style={styles.pickerItemLeft}>
                            <Text style={styles.pickerItemName}>{warehouse.name}</Text>
                            <Text style={styles.pickerItemDetail}>{warehouse.code}</Text>
                        </View>
                        {warehouse.isPrimary && (
                            <Text style={styles.primaryBadge}>Primary</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    if (!purchase) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Warehouse Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Warehouse</Text>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowWarehousePicker(true)}
                    >
                        {selectedWarehouse ? (
                            <View style={styles.selectedItem}>
                                <Icon name="warehouse" size={20} color={colors.primary[500]} />
                                <View style={styles.selectedItemInfo}>
                                    <Text style={styles.selectedItemName}>{selectedWarehouse.name}</Text>
                                    <Text style={styles.selectedItemDetail}>{selectedWarehouse.code}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.selectorPlaceholder}>Select warehouse</Text>
                        )}
                        <Icon name="chevron-down" size={20} color={colors.gray[400]} />
                    </TouchableOpacity>
                </View>

                {/* Items to Receive */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items to Receive</Text>

                    {receiptItems.map((item, index) => (
                        <View key={item.purchaseItemId} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.productName}</Text>
                                    <Text style={styles.itemSku}>{item.productSku}</Text>
                                </View>
                                <View style={styles.itemOrdered}>
                                    <Text style={styles.orderedLabel}>Ordered:</Text>
                                    <Text style={styles.orderedValue}>{item.quantityOrdered}</Text>
                                </View>
                            </View>

                            <View style={styles.itemDetails}>
                                <View style={styles.quantityRow}>
                                    <Text style={styles.label}>Quantity to Receive</Text>
                                    <View style={styles.quantityInput}>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => updateQuantity(index, item.quantityToReceive - 1)}
                                            disabled={item.quantityToReceive <= 0}
                                        >
                                            <Icon name="minus" size={16} color={colors.primary[500]} />
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>{item.quantityToReceive}</Text>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => updateQuantity(index, item.quantityToReceive + 1)}
                                            disabled={item.quantityToReceive >= item.quantityOrdered}
                                        >
                                            <Icon name="plus" size={16} color={colors.primary[500]} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={[styles.inputWrapper, { flex: 1, marginRight: 4 }]}>
                                        <Text style={styles.label}>Batch #</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Optional"
                                            placeholderTextColor={colors.gray[400]}
                                            value={item.batchNumber}
                                            onChangeText={(value) => updateBatchNumber(index, value)}
                                        />
                                    </View>
                                    <View style={[styles.inputWrapper, { flex: 1, marginLeft: 4 }]}>
                                        <Text style={styles.label}>Expiry Date</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor={colors.gray[400]}
                                            value={item.expiryDate}
                                            onChangeText={(value) => updateExpiryDate(index, value)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Location</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Aisle 1, Shelf 2"
                                        placeholderTextColor={colors.gray[400]}
                                        value={item.location}
                                        onChangeText={(value) => updateLocation(index, value)}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        placeholder="Add any notes about this receipt..."
                        placeholderTextColor={colors.gray[400]}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <Text style={styles.submitButtonText}>Receive Items</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Warehouse Picker */}
            {showWarehousePicker && renderWarehousePicker()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        padding: 16,
    },
    section: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.surface,
    },
    selectorPlaceholder: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[400],
    },
    selectedItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedItemInfo: {
        marginLeft: 12,
    },
    selectedItemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    selectedItemDetail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    itemCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        backgroundColor: colors.surface,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    itemSku: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    itemOrdered: {
        alignItems: 'flex-end',
    },
    orderedLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    orderedValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    itemDetails: {
        marginTop: 8,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    quantityInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginHorizontal: 12,
        minWidth: 30,
        textAlign: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    inputWrapper: {
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        backgroundColor: colors.background,
        marginTop: 4,
    },
    notesInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: colors.success,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'ios' ? 50 : 0,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    pickerList: {
        flex: 1,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerItemLeft: {
        flex: 1,
    },
    pickerItemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    pickerItemDetail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    primaryBadge: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.success,
        backgroundColor: colors.success + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
});

export default ReceivePurchaseScreen;