import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { useCustomers } from '@hooks/useCustomers';
import { useSales } from '@hooks/useSales';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { PAYMENT_METHODS } from '@utils/constants';
import { Picker } from '@react-native-picker/picker';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { items, getCartSummary, clearCart } = useCart();
    const { customers, fetchCustomers } = useCustomers();
    const { createSale, loading } = useSales();

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showCustomerPicker, setShowCustomerPicker] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const summary = getCartSummary();

    const handleCustomerSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            await fetchCustomers(0, 10, text);
        }
    };

    const handleCheckout = async () => {
        if (items.length === 0) {
            Alert.alert('Error', 'Cart is empty');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        const saleData = {
            customerId: selectedCustomer?.id,
            userId: user.id,
            items: items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.product.unitPrice,
                discountAmount: item.discount || 0,
            })),
            discountAmount: summary.discount,
            shippingAmount: 0,
            paymentMethod,
            notes,
        };

        try {
            const response = await createSale(saleData);
            clearCart();
            navigation.replace('Invoice', { saleId: response.id });
        } catch (error: any) {
            Alert.alert('Checkout Failed', error.message || 'Failed to complete checkout');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Customer Selection */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <TouchableOpacity
                    style={styles.customerSelector}
                    onPress={() => setShowCustomerPicker(!showCustomerPicker)}
                >
                    {selectedCustomer ? (
                        <View style={styles.selectedCustomer}>
                            <View style={styles.customerAvatar}>
                                <Text style={styles.avatarText}>
                                    {selectedCustomer.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.customerInfo}>
                                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                                <Text style={styles.customerDetail}>
                                    {selectedCustomer.phone || 'No phone'} • {selectedCustomer.city || 'No city'}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.walkinCustomer}>
                            <Icon name="account" size={24} color={colors.gray[400]} />
                            <Text style={styles.walkinText}>Walk-in Customer</Text>
                        </View>
                    )}
                    <Icon name="chevron-down" size={24} color={colors.gray[400]} />
                </TouchableOpacity>

                {showCustomerPicker && (
                    <View style={styles.customerPicker}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search customers..."
                            placeholderTextColor={colors.gray[400]}
                            value={searchQuery}
                            onChangeText={handleCustomerSearch}
                        />
                        <ScrollView style={styles.customerList} nestedScrollEnabled>
                            <TouchableOpacity
                                style={styles.customerOption}
                                onPress={() => {
                                    setSelectedCustomer(null);
                                    setShowCustomerPicker(false);
                                }}
                            >
                                <Icon name="account" size={20} color={colors.gray[500]} />
                                <Text style={styles.customerOptionText}>Walk-in Customer</Text>
                            </TouchableOpacity>
                            {customers.map((customer) => (
                                <TouchableOpacity
                                    key={customer.id}
                                    style={styles.customerOption}
                                    onPress={() => {
                                        setSelectedCustomer(customer);
                                        setShowCustomerPicker(false);
                                    }}
                                >
                                    <View style={styles.optionAvatar}>
                                        <Text style={styles.optionAvatarText}>{customer.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.optionInfo}>
                                        <Text style={styles.optionName}>{customer.name}</Text>
                                        <Text style={styles.optionDetail}>
                                            {customer.phone || 'No phone'} • {customer.city || 'No city'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                {items.map((item) => (
                    <View key={item.product.id} style={styles.orderItem}>
                        <View style={styles.orderItemInfo}>
                            <Text style={styles.orderItemName} numberOfLines={1}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.orderItemSku}>{item.product.sku}</Text>
                        </View>
                        <View style={styles.orderItemDetails}>
                            <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                            <Text style={styles.orderItemPrice}>
                                {formatCurrency(item.product.unitPrice * item.quantity)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethod,
                                paymentMethod === method.id && styles.paymentMethodActive,
                            ]}
                            onPress={() => setPaymentMethod(method.id)}
                        >
                            <Icon
                                name={method.icon}
                                size={24}
                                color={paymentMethod === method.id ? colors.background : colors.gray[500]}
                            />
                            <Text style={[
                                styles.paymentMethodText,
                                paymentMethod === method.id && styles.paymentMethodTextActive,
                            ]}>
                                {method.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                    style={styles.notesInput}
                    placeholder="Add any notes about this sale..."
                    placeholderTextColor={colors.gray[400]}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>{formatCurrency(summary.subtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Discount</Text>
                    <Text style={[styles.totalValue, styles.discountText]}>
                        -{formatCurrency(summary.discount)}
                    </Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax</Text>
                    <Text style={styles.totalValue}>{formatCurrency(summary.tax)}</Text>
                </View>
                <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalValue}>{formatCurrency(summary.total)}</Text>
                </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
                style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                onPress={handleCheckout}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.background} />
                ) : (
                    <>
                        <Icon name="cash-check" size={24} color={colors.background} />
                        <Text style={styles.checkoutButtonText}>Complete Sale</Text>
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    section: {
        backgroundColor: colors.background,
        padding: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    customerSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 12,
    },
    selectedCustomer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
    avatarText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    customerDetail: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    walkinCustomer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    walkinText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 12,
    },
    customerPicker: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    searchInput: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    customerList: {
        maxHeight: 200,
    },
    customerOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    optionAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionAvatarText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    optionInfo: {
        flex: 1,
    },
    optionName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    optionDetail: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    customerOptionText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        marginLeft: 12,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    orderItemSku: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    orderItemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderItemQuantity: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginRight: 12,
    },
    orderItemPrice: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        minWidth: 80,
        textAlign: 'right',
    },
    paymentMethods: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    paymentMethod: {
        flex: 1,
        minWidth: '30%',
        alignItems: 'center',
        padding: 12,
        margin: 4,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
    },
    paymentMethodActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    paymentMethodText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginTop: 4,
    },
    paymentMethodTextActive: {
        color: colors.background,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        minHeight: 80,
    },
    totalsSection: {
        backgroundColor: colors.background,
        padding: 16,
        marginBottom: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    totalValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    discountText: {
        color: colors.success,
    },
    grandTotalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    grandTotalLabel: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    grandTotalValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        padding: 16,
        margin: 16,
        borderRadius: 12,
    },
    checkoutButtonDisabled: {
        opacity: 0.6,
    },
    checkoutButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.background,
        marginLeft: 8,
    },
});

export default CheckoutScreen;