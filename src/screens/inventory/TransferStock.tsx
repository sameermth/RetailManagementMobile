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

const TransferStockScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params as { productId: number };

    const {
        warehouses,
        getInventoryByProduct,
        transferStock,
        checkAvailability,
        loading,
        fetchWarehouses,
    } = useInventory();
    const { getProduct } = useProducts();

    const [product, setProduct] = useState<any>(null);
    const [sourceWarehouses, setSourceWarehouses] = useState<any[]>([]);
    const [selectedSource, setSelectedSource] = useState<any>(null);
    const [selectedDestination, setSelectedDestination] = useState<any>(null);
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await fetchWarehouses();
            const productData = await getProduct(productId);
            setProduct(productData);

            const inventoryData = await getInventoryByProduct(productId);
            setSourceWarehouses(inventoryData);

            if (inventoryData.length > 0) {
                setSelectedSource(inventoryData[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load inventory data');
        }
    };

    const handleSourceSelect = (warehouse: any) => {
        setSelectedSource(warehouse);
        setStep(2);
    };

    const handleDestinationSelect = (warehouse: any) => {
        if (warehouse.id === selectedSource?.warehouseId) {
            Alert.alert('Error', 'Source and destination warehouses must be different');
            return;
        }
        setSelectedDestination(warehouse);
        setStep(3);
    };

    const handleTransfer = async () => {
        if (!selectedSource || !selectedDestination) {
            Alert.alert('Error', 'Please select source and destination warehouses');
            return;
        }

        const transferQuantity = parseInt(quantity);
        if (isNaN(transferQuantity) || transferQuantity <= 0) {
            Alert.alert('Error', 'Please enter a valid quantity');
            return;
        }

        if (transferQuantity > selectedSource.quantity) {
            Alert.alert('Error', `Only ${selectedSource.quantity} units available in source warehouse`);
            return;
        }

        try {
            await transferStock({
                productId,
                fromWarehouseId: selectedSource.warehouseId,
                toWarehouseId: selectedDestination.id,
                quantity: transferQuantity,
                reason: reason || undefined,
            });

            Alert.alert('Success', 'Stock transferred successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to transfer stock');
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            <View style={[styles.step, step >= 1 && styles.stepCompleted]}>
                <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberCompleted]}>1</Text>
                <Text style={styles.stepLabel}>Source</Text>
            </View>
            <View style={[styles.stepLine, step >= 2 && styles.stepLineCompleted]} />
            <View style={[styles.step, step >= 2 && styles.stepCompleted]}>
                <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberCompleted]}>2</Text>
                <Text style={styles.stepLabel}>Destination</Text>
            </View>
            <View style={[styles.stepLine, step >= 3 && styles.stepLineCompleted]} />
            <View style={[styles.step, step >= 3 && styles.stepCompleted]}>
                <Text style={[styles.stepNumber, step >= 3 && styles.stepNumberCompleted]}>3</Text>
                <Text style={styles.stepLabel}>Quantity</Text>
            </View>
        </View>
    );

    const renderSourceSelection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Source Warehouse</Text>
            {sourceWarehouses.map((item) => (
                <TouchableOpacity
                    key={item.warehouseId}
                    style={styles.warehouseCard}
                    onPress={() => handleSourceSelect(item)}
                >
                    <View style={styles.warehouseHeader}>
                        <Icon name="warehouse" size={24} color={colors.primary[500]} />
                        <View style={styles.warehouseInfo}>
                            <Text style={styles.warehouseName}>{item.warehouseName}</Text>
                            <Text style={styles.warehouseLocation}>
                                {item.binLocation || 'No location specified'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stockInfo}>
                        <Text style={styles.stockLabel}>Available Stock:</Text>
                        <Text style={[styles.stockValue, item.quantity <= (item.minimumStock || 0) && styles.lowStock]}>
                            {item.quantity} units
                        </Text>
                    </View>

                    {item.quantity <= (item.minimumStock || 0) && (
                        <View style={styles.warningBadge}>
                            <Icon name="alert" size={14} color={colors.warning} />
                            <Text style={styles.warningText}>Low Stock</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderDestinationSelection = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Select Destination Warehouse</Text>
                <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={styles.backLink}>Change Source</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sourceSummary}>
                <Icon name="arrow-right" size={16} color={colors.gray[500]} />
                <Text style={styles.sourceSummaryText}>
                    Transferring from {selectedSource?.warehouseName}
                </Text>
            </View>

            {warehouses
                .filter(w => w.id !== selectedSource?.warehouseId)
                .map((warehouse) => (
                    <TouchableOpacity
                        key={warehouse.id}
                        style={styles.warehouseCard}
                        onPress={() => handleDestinationSelect(warehouse)}
                    >
                        <View style={styles.warehouseHeader}>
                            <Icon name="warehouse" size={24} color={colors.success} />
                            <View style={styles.warehouseInfo}>
                                <Text style={styles.warehouseName}>{warehouse.name}</Text>
                                <Text style={styles.warehouseLocation}>
                                    {warehouse.city || 'No location'} {warehouse.isPrimary ? '(Primary)' : ''}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
        </View>
    );

    const renderQuantitySelection = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transfer Quantity</Text>
                <TouchableOpacity onPress={() => setStep(2)}>
                    <Text style={styles.backLink}>Change Destination</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.transferSummary}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>From:</Text>
                    <Text style={styles.summaryValue}>{selectedSource?.warehouseName}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>To:</Text>
                    <Text style={styles.summaryValue}>{selectedDestination?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Available:</Text>
                    <Text style={styles.summaryValue}>{selectedSource?.quantity} units</Text>
                </View>
            </View>

            <View style={styles.quantityContainer}>
                <Text style={styles.label}>Quantity to Transfer</Text>
                <View style={styles.quantityInputContainer}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                            const val = parseInt(quantity) || 0;
                            setQuantity(Math.max(1, val - 1).toString());
                        }}
                    >
                        <Icon name="minus" size={20} color={colors.primary[500]} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.quantityInput}
                        value={quantity}
                        onChangeText={setQuantity}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.gray[400]}
                    />

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                            const val = parseInt(quantity) || 0;
                            setQuantity((val + 1).toString());
                        }}
                    >
                        <Icon name="plus" size={20} color={colors.primary[500]} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.maxButton}
                    onPress={() => setQuantity(selectedSource?.quantity.toString())}
                >
                    <Text style={styles.maxButtonText}>Transfer All ({selectedSource?.quantity} units)</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.reasonContainer}>
                <Text style={styles.label}>Reason for Transfer (Optional)</Text>
                <TextInput
                    style={styles.reasonInput}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="e.g., Rebalancing stock, Customer order, etc."
                    placeholderTextColor={colors.gray[400]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity
                style={[styles.transferButton, loading && styles.transferButtonDisabled]}
                onPress={handleTransfer}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.background} />
                ) : (
                    <>
                        <Icon name="truck" size={20} color={colors.background} />
                        <Text style={styles.transferButtonText}>Confirm Transfer</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    if (!product) {
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

                {renderStepIndicator()}

                {step === 1 && renderSourceSelection()}
                {step === 2 && renderDestinationSelection()}
                {step === 3 && renderQuantitySelection()}
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
        marginBottom: 24,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
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
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    step: {
        alignItems: 'center',
    },
    stepCompleted: {
        opacity: 1,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray[200],
        textAlign: 'center',
        lineHeight: 32,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.gray[600],
        marginBottom: 4,
    },
    stepNumberCompleted: {
        backgroundColor: colors.success,
        color: colors.background,
    },
    stepLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.gray[300],
        marginHorizontal: 8,
    },
    stepLineCompleted: {
        backgroundColor: colors.success,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    backLink: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    warehouseCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    warehouseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    warehouseInfo: {
        marginLeft: 12,
        flex: 1,
    },
    warehouseName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    warehouseLocation: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    stockInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stockLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    stockValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    lowStock: {
        color: colors.error,
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    warningText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
        marginLeft: 6,
    },
    sourceSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[100],
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    sourceSummaryText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
    },
    transferSummary: {
        backgroundColor: colors.gray[50],
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    summaryValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    quantityContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 8,
    },
    quantityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    quantityButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityInput: {
        width: 100,
        height: 44,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginHorizontal: 16,
        textAlign: 'center',
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    maxButton: {
        alignSelf: 'center',
        padding: 8,
    },
    maxButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    reasonContainer: {
        marginBottom: 16,
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
    transferButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 8,
    },
    transferButtonDisabled: {
        opacity: 0.6,
    },
    transferButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
        marginLeft: 8,
    },
});

export default TransferStockScreen;