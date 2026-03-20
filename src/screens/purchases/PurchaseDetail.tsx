import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePurchases } from '@hooks/usePurchases';
import { useSuppliers } from '@hooks/useSuppliers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate, formatDateTime } from '@utils/formatters';

const PurchaseDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { purchaseId } = route.params as { purchaseId: number };
    const { getPurchase, approvePurchase, cancelPurchase, receivePurchase, updatePaymentStatus, loading } = usePurchases();
    const { getSupplier } = useSuppliers();

    const [purchase, setPurchase] = useState<any>(null);
    const [supplier, setSupplier] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPurchaseDetails();
    }, []);

    const loadPurchaseDetails = async () => {
        try {
            const data = await getPurchase(purchaseId);
            setPurchase(data);

            if (data.supplierId) {
                const supplierData = await getSupplier(data.supplierId);
                setSupplier(supplierData);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load purchase details');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return colors.warning;
            case 'APPROVED': return colors.info;
            case 'ORDERED': return colors.primary[500];
            case 'RECEIVED': return colors.success;
            case 'COMPLETED': return colors.success;
            case 'CANCELLED': return colors.error;
            default: return colors.gray[500];
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return 'clock-outline';
            case 'APPROVED': return 'check-circle-outline';
            case 'ORDERED': return 'truck-outline';
            case 'RECEIVED': return 'package-variant';
            case 'COMPLETED': return 'check-circle';
            case 'CANCELLED': return 'close-circle';
            default: return 'help-circle';
        }
    };

    const handleApprove = () => {
        Alert.alert(
            'Approve Purchase Order',
            'Are you sure you want to approve this purchase order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            await approvePurchase(purchaseId);
                            await loadPurchaseDetails();
                            Alert.alert('Success', 'Purchase order approved');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve purchase order');
                        }
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        Alert.prompt(
            'Cancel Purchase Order',
            'Please provide a reason for cancellation:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: async (reason) => {
                        if (reason) {
                            try {
                                await cancelPurchase(purchaseId, reason);
                                await loadPurchaseDetails();
                                Alert.alert('Success', 'Purchase order cancelled');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to cancel purchase order');
                            }
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleReceive = () => {
        navigation.navigate('ReceivePurchase', { purchaseId: purchase.id });
    };

    const handleRecordPayment = () => {
        Alert.prompt(
            'Record Payment',
            `Enter payment amount (Pending: ${formatCurrency(purchase.pendingAmount)}):`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Record',
                    onPress: async (amount) => {
                        if (amount && !isNaN(Number(amount))) {
                            const paymentAmount = Number(amount);
                            if (paymentAmount > purchase.pendingAmount) {
                                Alert.alert('Error', 'Payment amount cannot exceed pending amount');
                                return;
                            }
                            try {
                                await updatePaymentStatus(purchaseId, paymentAmount);
                                await loadPurchaseDetails();
                                Alert.alert('Success', 'Payment recorded');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to record payment');
                            }
                        }
                    },
                },
            ],
            'plain-text',
            purchase.pendingAmount.toString(),
            'numeric'
        );
    };

    const InfoRow = ({ label, value, icon }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
                <Icon name={icon} size={20} color={colors.gray[500]} />
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <Text style={styles.valueText}>{value || '-'}</Text>
        </View>
    );

    const Section = ({ title, children }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    if (loading || !purchase) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    const canApprove = ['PENDING_APPROVAL'].includes(purchase.status);
    const canCancel = ['PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(purchase.status);
    const canReceive = ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(purchase.status);
    const canPay = ['RECEIVED', 'PARTIALLY_RECEIVED', 'COMPLETED'].includes(purchase.status) && purchase.pendingAmount > 0;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.orderNumber}>{purchase.purchaseOrderNumber}</Text>
                        <Text style={styles.supplierName}>{purchase.supplierName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(purchase.status) + '20' }]}>
                        <Icon name={getStatusIcon(purchase.status)} size={16} color={getStatusColor(purchase.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(purchase.status) }]}>
                            {purchase.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.dateInfo}>
                    <Icon name="calendar" size={16} color={colors.gray[500]} />
                    <Text style={styles.dateText}>Ordered: {formatDateTime(purchase.orderDate)}</Text>
                </View>
                {purchase.expectedDeliveryDate && (
                    <View style={styles.dateInfo}>
                        <Icon name="truck-delivery" size={16} color={colors.gray[500]} />
                        <Text style={styles.dateText}>Expected: {formatDate(purchase.expectedDeliveryDate)}</Text>
                    </View>
                )}
                {purchase.receivedDate && (
                    <View style={styles.dateInfo}>
                        <Icon name="package-variant" size={16} color={colors.gray[500]} />
                        <Text style={styles.dateText}>Received: {formatDate(purchase.receivedDate)}</Text>
                    </View>
                )}
            </View>

            {/* Supplier Information */}
            {supplier && (
                <Section title="Supplier Information">
                    <InfoRow label="Contact Person" value={supplier.contactPerson} icon="account-tie" />
                    <InfoRow label="Phone" value={supplier.phone} icon="phone" />
                    <InfoRow label="Email" value={supplier.email} icon="email" />
                    <InfoRow label="Payment Terms" value={supplier.paymentTerms ? `${supplier.paymentTerms} days` : '-'} icon="calendar-clock" />
                </Section>
            )}

            {/* Items */}
            <Section title="Items">
                {purchase.items?.map((item: any, index: number) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Text style={styles.itemSku}>{item.productSku}</Text>
                        </View>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemQuantity}>{item.quantity} x {formatCurrency(item.unitPrice)}</Text>
                            <Text style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</Text>
                        </View>
                        {item.receivedQuantity > 0 && (
                            <View style={styles.receivedBadge}>
                                <Icon name="check-circle" size={14} color={colors.success} />
                                <Text style={styles.receivedText}>Received: {item.receivedQuantity}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </Section>

            {/* Summary */}
            <Section title="Summary">
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(purchase.subtotal)}</Text>
                </View>
                {purchase.discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={[styles.summaryValue, styles.discountText]}>
                            -{formatCurrency(purchase.discountAmount)}
                        </Text>
                    </View>
                )}
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(purchase.taxAmount)}</Text>
                </View>
                {purchase.shippingAmount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(purchase.shippingAmount)}</Text>
                    </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(purchase.totalAmount)}</Text>
                </View>
            </Section>

            {/* Payment Status */}
            <Section title="Payment">
                <View style={styles.paymentRow}>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentLabel}>Paid Amount</Text>
                        <Text style={styles.paidAmount}>{formatCurrency(purchase.paidAmount)}</Text>
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentLabel}>Pending Amount</Text>
                        <Text style={[styles.pendingAmount, purchase.pendingAmount > 0 && styles.pendingHighlight]}>
                            {formatCurrency(purchase.pendingAmount)}
                        </Text>
                    </View>
                </View>
                <View style={[styles.paymentStatus, { backgroundColor: purchase.paymentStatus === 'PAID' ? colors.success + '10' : colors.warning + '10' }]}>
                    <Icon
                        name={purchase.paymentStatus === 'PAID' ? 'check-circle' : 'clock-outline'}
                        size={20}
                        color={purchase.paymentStatus === 'PAID' ? colors.success : colors.warning}
                    />
                    <Text style={[styles.paymentStatusText, { color: purchase.paymentStatus === 'PAID' ? colors.success : colors.warning }]}>
                        Payment Status: {purchase.paymentStatus}
                    </Text>
                </View>
            </Section>

            {/* Notes */}
            {purchase.notes && (
                <Section title="Notes">
                    <Text style={styles.notes}>{purchase.notes}</Text>
                </Section>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                {canApprove && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={handleApprove}
                    >
                        <Icon name="check-circle" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                )}

                {canReceive && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.receiveButton]}
                        onPress={handleReceive}
                    >
                        <Icon name="package-down" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Receive</Text>
                    </TouchableOpacity>
                )}

                {canPay && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.payButton]}
                        onPress={handleRecordPayment}
                    >
                        <Icon name="cash" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Record Payment</Text>
                    </TouchableOpacity>
                )}

                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Icon name="close-circle" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
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
    header: {
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderNumber: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    supplierName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 6,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    section: {
        backgroundColor: colors.background,
        padding: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    valueText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    itemRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemInfo: {
        marginBottom: 4,
    },
    itemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    itemSku: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    itemQuantity: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    itemTotal: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    receivedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: colors.success + '10',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    receivedText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.success,
        marginLeft: 4,
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
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    paymentInfo: {
        alignItems: 'center',
    },
    paymentLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    paidAmount: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
    },
    pendingAmount: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.secondary,
    },
    pendingHighlight: {
        color: colors.warning,
    },
    paymentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    paymentStatusText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 8,
    },
    notes: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    actionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        marginBottom: 8,
    },
    approveButton: {
        backgroundColor: colors.success,
    },
    receiveButton: {
        backgroundColor: colors.primary[500],
    },
    payButton: {
        backgroundColor: colors.info,
    },
    cancelButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
});

export default PurchaseDetailScreen;