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
import { useNavigation } from '@react-navigation/native';
import { usePurchases } from '@hooks/usePurchases';
import { useSuppliers } from '@hooks/useSuppliers';
import { useProducts } from '@hooks/useProducts';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { Picker } from '@react-native-picker/picker';

const CreatePurchaseScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { createPurchase, loading } = usePurchases();
    const { suppliers, fetchSuppliers } = useSuppliers();
    const { products, fetchProducts } = useProducts();

    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [showSupplierPicker, setShowSupplierPicker] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');

    const [items, setItems] = useState<any[]>([]);
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const [formData, setFormData] = useState({
        expectedDeliveryDate: '',
        discountAmount: '',
        discountPercentage: '',
        shippingAmount: '',
        paymentTerms: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSuppliers(0, 100);
        fetchProducts(0, 100);
    }, []);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
        s.supplierCode?.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTax = () => {
        return items.reduce((sum, item) => {
            const taxRate = item.taxRate || 0;
            const itemTotal = item.quantity * item.unitPrice;
            return sum + (itemTotal * taxRate / 100);
        }, 0);
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        const discountAmount = formData.discountAmount ? Number(formData.discountAmount) : 0;
        const discountPercentage = formData.discountPercentage ? Number(formData.discountPercentage) : 0;

        if (discountAmount > 0) return discountAmount;
        if (discountPercentage > 0) return (subtotal * discountPercentage / 100);
        return 0;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTax();
        const discount = calculateDiscount();
        const shipping = formData.shippingAmount ? Number(formData.shippingAmount) : 0;

        return subtotal + tax - discount + shipping;
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!selectedSupplier) {
            newErrors.supplier = 'Please select a supplier';
        }
        if (items.length === 0) {
            newErrors.items = 'Please add at least one item';
        }
        if (formData.expectedDeliveryDate && isNaN(Date.parse(formData.expectedDeliveryDate))) {
            newErrors.expectedDeliveryDate = 'Invalid date format (YYYY-MM-DD)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const purchaseData = {
                supplierId: selectedSupplier.id,
                userId: user?.id,
                expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                })),
                discountAmount: formData.discountAmount ? Number(formData.discountAmount) : undefined,
                discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
                shippingAmount: formData.shippingAmount ? Number(formData.shippingAmount) : undefined,
                paymentTerms: formData.paymentTerms || undefined,
                notes: formData.notes || undefined,
            };

            const response = await createPurchase(purchaseData);
            Alert.alert('Success', 'Purchase order created successfully', [
                { text: 'OK', onPress: () => navigation.replace('PurchaseDetail', { purchaseId: response.id }) }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create purchase order');
        }
    };

    const addItem = (product: any) => {
        const existingItem = items.find(i => i.id === product.id);
        if (existingItem) {
            setItems(items.map(i =>
                i.id === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setItems([...items, {
                id: product.id,
                name: product.name,
                sku: product.sku,
                quantity: 1,
                unitPrice: product.costPrice || 0,
                taxRate: product.gstRate || 0,
            }]);
        }
        setShowProductPicker(false);
    };

    const updateItemQuantity = (itemId: number, change: number) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + change;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean));
    };

    const removeItem = (itemId: number) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const updateItemPrice = (itemId: number, price: string) => {
        const numPrice = Number(price);
        if (!isNaN(numPrice) && numPrice >= 0) {
            setItems(items.map(item =>
                item.id === itemId ? { ...item, unitPrice: numPrice } : item
            ));
        }
    };

    const renderSupplierPicker = () => (
        <View style={styles.pickerOverlay}>
            <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Supplier</Text>
                <TouchableOpacity onPress={() => setShowSupplierPicker(false)}>
                    <Icon name="close" size={24} color={colors.gray[600]} />
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.pickerSearch}
                placeholder="Search suppliers..."
                placeholderTextColor={colors.gray[400]}
                value={supplierSearch}
                onChangeText={setSupplierSearch}
            />

            <ScrollView style={styles.pickerList}>
                {filteredSuppliers.map((supplier) => (
                    <TouchableOpacity
                        key={supplier.id}
                        style={styles.pickerItem}
                        onPress={() => {
                            setSelectedSupplier(supplier);
                            setShowSupplierPicker(false);
                            setSupplierSearch('');
                        }}
                    >
                        <View style={styles.pickerItemLeft}>
                            <Text style={styles.pickerItemName}>{supplier.name}</Text>
                            <Text style={styles.pickerItemDetail}>{supplier.supplierCode}</Text>
                        </View>
                        {supplier.paymentTerms && (
                            <Text style={styles.pickerItemBadge}>{supplier.paymentTerms} days</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderProductPicker = () => (
        <View style={styles.pickerOverlay}>
            <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Add Product</Text>
                <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                    <Icon name="close" size={24} color={colors.gray[600]} />
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.pickerSearch}
                placeholder="Search products..."
                placeholderTextColor={colors.gray[400]}
                value={productSearch}
                onChangeText={setProductSearch}
            />

            <ScrollView style={styles.pickerList}>
                {filteredProducts.map((product) => (
                    <TouchableOpacity
                        key={product.id}
                        style={styles.pickerItem}
                        onPress={() => addItem(product)}
                    >
                        <View style={styles.pickerItemLeft}>
                            <Text style={styles.pickerItemName}>{product.name}</Text>
                            <Text style={styles.pickerItemDetail}>{product.sku}</Text>
                        </View>
                        <Text style={styles.pickerItemPrice}>
                            {formatCurrency(product.costPrice || 0)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Supplier Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Supplier <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.selector, errors.supplier && styles.selectorError]}
                        onPress={() => setShowSupplierPicker(true)}
                    >
                        {selectedSupplier ? (
                            <View style={styles.selectedItem}>
                                <Icon name="store" size={20} color={colors.primary[500]} />
                                <View style={styles.selectedItemInfo}>
                                    <Text style={styles.selectedItemName}>{selectedSupplier.name}</Text>
                                    <Text style={styles.selectedItemDetail}>{selectedSupplier.supplierCode}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.selectorPlaceholder}>Select a supplier</Text>
                        )}
                        <Icon name="chevron-down" size={20} color={colors.gray[400]} />
                    </TouchableOpacity>
                    {errors.supplier && <Text style={styles.errorText}>{errors.supplier}</Text>}
                </View>

                {/* Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Items <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowProductPicker(true)}
                        >
                            <Icon name="plus" size={20} color={colors.primary[500]} />
                            <Text style={styles.addButtonText}>Add Item</Text>
                        </TouchableOpacity>
                    </View>

                    {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

                    {items.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemSku}>{item.sku}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeItem(item.id)}>
                                    <Icon name="delete" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.itemDetails}>
                                <View style={styles.itemQuantity}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateItemQuantity(item.id, -1)}
                                    >
                                        <Icon name="minus" size={16} color={colors.primary[500]} />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateItemQuantity(item.id, 1)}
                                    >
                                        <Icon name="plus" size={16} color={colors.primary[500]} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.itemPrice}>
                                    <Text style={styles.priceLabel}>Unit Price</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        value={item.unitPrice.toString()}
                                        onChangeText={(value) => updateItemPrice(item.id, value)}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                    />
                                </View>

                                <View style={styles.itemTotal}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>
                                        {formatCurrency(item.quantity * item.unitPrice)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Order Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Details</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Expected Delivery Date</Text>
                        <TextInput
                            style={[styles.input, errors.expectedDeliveryDate && styles.inputError]}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.expectedDeliveryDate}
                            onChangeText={(value) => setFormData({...formData, expectedDeliveryDate: value})}
                        />
                        {errors.expectedDeliveryDate && (
                            <Text style={styles.errorText}>{errors.expectedDeliveryDate}</Text>
                        )}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Discount Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.discountAmount}
                                onChangeText={(value) => setFormData({
                                    ...formData,
                                    discountAmount: value,
                                    discountPercentage: '' // Clear percentage when amount is entered
                                })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Discount %</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.discountPercentage}
                                onChangeText={(value) => setFormData({
                                    ...formData,
                                    discountPercentage: value,
                                    discountAmount: '' // Clear amount when percentage is entered
                                })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Shipping Amount</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.shippingAmount}
                            onChangeText={(value) => setFormData({...formData, shippingAmount: value})}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Payment Terms</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Net 30"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.paymentTerms}
                            onChangeText={(value) => setFormData({...formData, paymentTerms: value})}
                        />
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal())}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(calculateTax())}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={[styles.summaryValue, styles.discountText]}>
                            -{formatCurrency(calculateDiscount())}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>
                            {formatCurrency(Number(formData.shippingAmount) || 0)}
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        placeholder="Add any notes about this purchase order..."
                        placeholderTextColor={colors.gray[400]}
                        value={formData.notes}
                        onChangeText={(value) => setFormData({...formData, notes: value})}
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
                        <Text style={styles.submitButtonText}>Create Purchase Order</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Pickers */}
            {showSupplierPicker && renderSupplierPicker()}
            {showProductPicker && renderProductPicker()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    requiredStar: {
        color: colors.error,
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
        marginTop: 8,
    },
    selectorError: {
        borderColor: colors.error,
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
    errorText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 4,
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
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemQuantity: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
        marginHorizontal: 8,
        minWidth: 30,
        textAlign: 'center',
    },
    itemPrice: {
        flex: 1,
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    priceInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        width: 80,
        textAlign: 'center',
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    itemTotal: {
        flex: 1,
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    totalValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        backgroundColor: colors.surface,
    },
    inputError: {
        borderColor: colors.error,
    },
    notesInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
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
    discountText: {
        color: colors.success,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    submitButton: {
        backgroundColor: colors.primary[500],
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
    pickerSearch: {
        margin: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
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
    pickerItemBadge: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        backgroundColor: colors.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pickerItemPrice: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
});

export default CreatePurchaseScreen;