import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useInventory } from '@hooks/useInventory';
import { useProducts } from '@hooks/useProducts';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';

const AdjustStockScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params as { productId: number };

    const { getInventoryByProduct, adjustStock, loading } = useInventory();
    const { getProduct } = useProducts();

    const [product, setProduct] = useState<any>(null);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [newQuantity, setNewQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'remove'>('set');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const productData = await getProduct(productId);
            setProduct(productData);

            const inventoryData = await getInventoryByProduct(productId);
            setInventoryItems(inventoryData);

            if (inventoryData.length > 0) {
                setSelectedItem(inventoryData[0]);
                setNewQuantity(inventoryData[0].quantity.toString());
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load inventory data');
        }
    };

    const handleAdjust = async () => {
        if (!selectedItem) {
            Alert.alert('Error', 'Please select a warehouse');
            return;
        }

        const quantity = parseInt(newQuantity);
        if (isNaN(quantity) || quantity < 0) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }

        if (!reason.trim()) {
            Alert.alert('Error', 'Please provide a reason for adjustment');
            return;
        }

        let finalQuantity = quantity;
        if (adjustmentType === 'add') {
            finalQuantity = selectedItem.quantity + quantity;
        } else if (adjustmentType === 'remove') {
            finalQuantity = Math.max(0, selectedItem.quantity - quantity);
            if (finalQuantity === selectedItem.quantity - quantity && finalQuantity < 0) {
                Alert.alert('Error', 'Cannot remove more than current stock');
                return;
            }
        }

        try {
            await adjustStock({
                productId,
                warehouseId: selectedItem.warehouseId,
                newQuantity: finalQuantity,
                reason,
            });

            Alert.alert('Success', 'Stock adjusted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to adjust stock');
        }
    };

    const getSuggestedQuantity = () => {
        if (!selectedItem || !product) return 0;

        const minStock = selectedItem.minimumStock || product.reorderLevel || 10;
        return Math.max(minStock, minStock * 2 - selectedItem.quantity);
    };

    if (!product || inventoryItems.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Product Info */}
                <View style={styles.productCard}>
                    <View style={styles.productHeader}>
                        <View style={styles.productIcon}>
                            <Icon name="package" size={32} color={colors.primary[500]} />
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productSku}>SKU: {product.sku}</Text>
                        </View>
                    </View>
                </View>

                {/* Warehouse Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Warehouse</Text>
                    {inventoryItems.map((item) => (
                        <TouchableOpacity
                            key={item.warehouseId}
                            style={[
                                styles.warehouseItem,
                                selectedItem?.warehouseId === item.warehouseId && styles.warehouseItemSelected,
                            ]}
                            onPress={() => {
                                setSelectedItem(item);
                                setNewQuantity(item.quantity.toString());
                            }}
                        >
                            <View style={styles.warehouseInfo}>
                                <Icon name="warehouse" size={20} color={selectedItem?.warehouseId === item.warehouseId ? colors.primary[500] : colors.gray[500]} />
                                <Text style={[styles.warehouseName, selectedItem?.warehouseId === item.warehouseId && styles.selectedText]}>
                                    {item.warehouseName}
                                </Text>
                            </View>
                            <View style={styles.warehouseStock}>
                                <Text style={styles.currentStockLabel}>Current Stock:</Text>
                                <Text style={[styles.currentStockValue, item.quantity <= (item.minimumStock || 0) && styles.lowStock]}>
                                    {item.quantity}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedItem && (
                    <>
                        {/* Current Stock Summary */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Current Stock</Text>
                                    <Text style={[styles.summaryValue, { color: colors.primary[500] }]}>
                                        {selectedItem.quantity}
                                    </Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Minimum Stock</Text>
                                    <Text style={styles.summaryValue}>
                                        {selectedItem.minimumStock || product.reorderLevel || '-'}
                                    </Text>
                                </View>
                                <View style={styles.summaryDivider} />
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Suggested</Text>
                                    <Text style={[styles.summaryValue, { color: colors.success }]}>
                                        {getSuggestedQuantity()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Adjustment Type */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Adjustment Type</Text>
                            <View style={styles.typeButtons}>
                                <TouchableOpacity
                                    style={[styles.typeButton, adjustmentType === 'set' && styles.typeButtonActive]}
                                    onPress={() => setAdjustmentType('set')}
                                >
                                    <Icon name="pencil" size={20} color={adjustmentType === 'set' ? colors.background : colors.primary[500]} />
                                    <Text style={[styles.typeButtonText, adjustmentType === 'set' && styles.typeButtonTextActive]}>
                                        Set Exact
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.typeButton, adjustmentType === 'add' && styles.typeButtonActive]}
                                    onPress={() => setAdjustmentType('add')}
                                >
                                    <Icon name="plus" size={20} color={adjustmentType === 'add' ? colors.background : colors.success} />
                                    <Text style={[styles.typeButtonText, adjustmentType === 'add' && styles.typeButtonTextActive]}>
                                        Add Stock
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.typeButton, adjustmentType === 'remove' && styles.typeButtonActive]}
                                    onPress={() => setAdjustmentType('remove')}
                                >
                                    <Icon name="minus" size={20} color={adjustmentType === 'remove' ? colors.background : colors.error} />
                                    <Text style={[styles.typeButtonText, adjustmentType === 'remove' && styles.typeButtonTextActive]}>
                                        Remove Stock
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Quantity */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {adjustmentType === 'set' ? 'New Quantity' :
                                    adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Remove'}
                            </Text>

                            <View style={styles.quantityInputContainer}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => {
                                        const val = parseInt(newQuantity) || 0;
                                        setNewQuantity(Math.max(0, val - 1).toString());
                                    }}
                                >
                                    <Icon name="minus" size={20} color={colors.primary[500]} />
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.quantityInput}
                                    value={newQuantity}
                                    onChangeText={setNewQuantity}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.gray[400]}
                                />

                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => {
                                        const val = parseInt(newQuantity) || 0;
                                        setNewQuantity((val + 1).toString());
                                    }}
                                >
                                    <Icon name="plus" size={20} color={colors.primary[500]} />
                                </TouchableOpacity>
                            </View>

                            {adjustmentType !== 'set' && (
                                <Text style={styles.resultText}>
                                    Result: {adjustmentType === 'add'
                                    ? selectedItem.quantity + (parseInt(newQuantity) || 0)
                                    : Math.max(0, selectedItem.quantity - (parseInt(newQuantity) || 0))
                                } units
                                </Text>
                            )}
                        </View>

                        {/* Reason */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Reason for Adjustment</Text>
                            <TextInput
                                style={styles.reasonInput}
                                value={reason}
                                onChangeText={setReason}
                                placeholder="e.g., Stock count correction, Damaged goods, etc."
                                placeholderTextColor={colors.gray[400]}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.submitButton, loading && styles.submitButtonDisabled]}
                                onPress={handleAdjust}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.background} />
                                ) : (
                                    <Text style={styles.submitButtonText}>Confirm Adjustment</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
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
    productCard: {
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
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    productSku: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    warehouseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 8,
    },
    warehouseItemSelected: {
        borderColor: colors.primary[500],
        backgroundColor: colors.primary[50],
    },
    warehouseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    warehouseName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
    },
    selectedText: {
        color: colors.primary[500],
    },
    warehouseStock: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentStockLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginRight: 6,
    },
    currentStockValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    lowStock: {
        color: colors.error,
    },
    summaryCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    typeButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    typeButtonActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    typeButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    typeButtonTextActive: {
        color: colors.background,
    },
    quantityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityInput: {
        width: 100,
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginHorizontal: 16,
        textAlign: 'center',
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    resultText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.success,
        textAlign: 'center',
        marginTop: 12,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        minHeight: 80,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: colors.gray[200],
    },
    cancelButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    submitButton: {
        backgroundColor: colors.success,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
});

export default AdjustStockScreen;