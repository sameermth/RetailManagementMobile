import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    FlatList,
    Modal,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { useCustomers } from '@hooks/useCustomers';
import { useSales } from '@hooks/useSales';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { PAYMENT_METHODS } from '@utils/constants';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();
    const { items, getCartSummary, clearCart, selectedCustomer, setSelectedCustomer } = useCart();
    const { customers, fetchCustomers } = useCustomers();
    const { createSale, loading } = useSales();
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');
    const [customerLoading, setCustomerLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notes, setNotes] = useState('');

    const summary = getCartSummary();

    // If no customer is selected, show modal immediately
    useEffect(() => {
        if (!selectedCustomer) {
            setShowCustomerModal(true);
        }
    }, []);

    const handleCustomerSearch = async (text: string) => {
        setCustomerSearchQuery(text);
        if (text.length > 2) {
            setCustomerLoading(true);
            await fetchCustomers(0, 20, text);
            setCustomerLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (items.length === 0) {
            Alert.alert('Error', 'Cart is empty');
            return;
        }

        if (!selectedCustomer) {
            Alert.alert(
                'Customer Required',
                'A registered customer is required for warranty tracking',
                [{ text: 'OK', onPress: () => setShowCustomerModal(true) }]
            );
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        const saleData = {
            customerId: selectedCustomer.id,
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

    const renderCustomerModal = () => (
        <Modal
            visible={showCustomerModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
                if (!selectedCustomer) {
                    Alert.alert(
                        'Customer Required',
                        'You must select a customer to continue. All sales require a registered customer for warranty tracking.',
                        [{ text: 'OK' }]
                    );
                } else {
                    setShowCustomerModal(false);
                }
            }}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Customer</Text>
                        {selectedCustomer && (
                            <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                                <Icon name="close" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.modalSearch}>
                        <Icon name="magnify" size={20} color={colors.gray[400]} />
                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder="Search customers by name, phone or email..."
                            placeholderTextColor={colors.gray[400]}
                            value={customerSearchQuery}
                            onChangeText={handleCustomerSearch}
                            autoFocus={true}
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
                                        {item.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                                    </Text>
                                </View>
                                <View style={styles.customerInfo}>
                                    <Text style={styles.customerName}>{item.name}</Text>
                                    <Text style={styles.customerDetail}>
                                        {item.phone || 'No phone'} • {item.email || 'No email'}
                                    </Text>
                                    {item.gstNumber && (
                                        <Text style={styles.customerGst}>GST: {item.gstNumber}</Text>
                                    )}
                                </View>
                                <Icon name="chevron-right" size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            customerLoading ? (
                                <ActivityIndicator size="large" color={colors.primary[500]} />
                            ) : (
                                <View style={styles.modalEmpty}>
                                    <Icon name="account-question" size={48} color={colors.gray[300]} />
                                    <Text style={styles.modalEmptyTitle}>No Customers Found</Text>
                                    <Text style={styles.modalEmptyText}>
                                        {customerSearchQuery
                                            ? `No customers matching "${customerSearchQuery}"`
                                            : 'No customers in the system'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.modalAddButton}
                                        onPress={() => {
                                            setShowCustomerModal(false);
                                            navigation.navigate('AddCustomer', {
                                                onGoBack: () => {
                                                    setShowCustomerModal(true);
                                                }
                                            });
                                        }}
                                    >
                                        <Icon name="plus" size={20} color={colors.background} />
                                        <Text style={styles.modalAddButtonText}>Add New Customer</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <ScrollView style={styles.container}>
            {renderCustomerModal()}

            {/* Customer Section - Required */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Customer <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                    style={[styles.customerSelector, !selectedCustomer && styles.customerSelectorRequired]}
                    onPress={() => setShowCustomerModal(true)}
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
                                    {selectedCustomer.phone || 'No phone'} • {selectedCustomer.email || 'No email'}
                                </Text>
                                {selectedCustomer.gstNumber && (
                                    <Text style={styles.customerGst}>GST: {selectedCustomer.gstNumber}</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.requiredCustomer}>
                            <Icon name="account-alert" size={24} color={colors.warning} />
                            <Text style={styles.requiredText}>Customer Required - Select to continue</Text>
                        </View>
                    )}
                    <Icon name="chevron-down" size={24} color={colors.gray[400]} />
                </TouchableOpacity>
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
                style={[
                    styles.checkoutButton,
                    (loading || !selectedCustomer) && styles.checkoutButtonDisabled
                ]}
                onPress={handleCheckout}
                disabled={loading || !selectedCustomer}
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
    requiredStar: {
        color: colors.error,
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
    customerSelectorRequired: {
        borderColor: colors.warning,
        borderWidth: 2,
        backgroundColor: colors.warning + '10',
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
    customerGst: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.primary[500],
        marginTop: 2,
    },
    requiredCustomer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    requiredText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
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
        textAlignVertical: 'top',
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
        backgroundColor: colors.gray[500],
    },
    checkoutButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.background,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    modalSearchInput: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        fontSize: typography.fontSize.base,
        color: colors.text.primary,
    },
    customerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    customerInitials: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    modalEmpty: {
        padding: 32,
        alignItems: 'center',
    },
    modalEmptyTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    modalEmptyText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    modalAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    modalAddButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 8,
    },
});

export default CheckoutScreen;