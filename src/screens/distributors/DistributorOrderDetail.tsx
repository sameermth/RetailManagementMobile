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
import { useDistributors } from '@hooks/useDistributors';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate, formatDateTime } from '@utils/formatters';

const DistributorOrderDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params as { orderId: number };
    const {
        getOrder,
        approveOrder,
        shipOrder,
        deliverOrder,
        cancelOrder,
        loading,
    } = useDistributors();

    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        loadOrder();
    }, []);

    const loadOrder = async () => {
        try {
            const data = await getOrder(orderId);
            setOrder(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load order details');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return colors.warning;
            case 'APPROVED': return colors.info;
            case 'PROCESSING': return colors.primary[500];
            case 'SHIPPED': return colors.info;
            case 'DELIVERED': return colors.success;
            case 'CANCELLED': return colors.error;
            default: return colors.gray[500];
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return 'clock-outline';
            case 'APPROVED': return 'check-circle-outline';
            case 'PROCESSING': return 'progress-clock';
            case 'SHIPPED': return 'truck';
            case 'DELIVERED': return 'package-variant';
            case 'CANCELLED': return 'close-circle';
            default: return 'help-circle';
        }
    };

    const handleApprove = () => {
        Alert.alert(
            'Approve Order',
            'Are you sure you want to approve this order?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            await approveOrder(orderId);
                            await loadOrder();
                            Alert.alert('Success', 'Order approved');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve order');
                        }
                    },
                },
            ]
        );
    };

    const handleShip = () => {
        Alert.prompt(
            'Ship Order',
            'Enter tracking number:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Ship',
                    onPress: async (trackingNumber) => {
                        if (trackingNumber) {
                            try {
                                await shipOrder(orderId, trackingNumber);
                                await loadOrder();
                                Alert.alert('Success', 'Order shipped');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to ship order');
                            }
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleDeliver = () => {
        Alert.alert(
            'Mark as Delivered',
            'Confirm that this order has been delivered?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await deliverOrder(orderId);
                            await loadOrder();
                            Alert.alert('Success', 'Order marked as delivered');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to mark order as delivered');
                        }
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        Alert.prompt(
            'Cancel Order',
            'Please provide a reason for cancellation:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cancel Order',
                    onPress: async (reason) => {
                        if (reason) {
                            try {
                                await cancelOrder(orderId, reason);
                                await loadOrder();
                                Alert.alert('Success', 'Order cancelled');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to cancel order');
                            }
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const canApprove = order?.status === 'PENDING_APPROVAL';
    const canShip = order?.status === 'APPROVED' || order?.status === 'PROCESSING';
    const canDeliver = order?.status === 'SHIPPED';
    const canCancel = ['PENDING_APPROVAL', 'APPROVED', 'PROCESSING'].includes(order?.status);

    if (loading || !order) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                        <Text style={styles.distributorName}>{order.distributorName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                        <Icon name={getStatusIcon(order.status)} size={16} color={getStatusColor(order.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                            {order.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.dateInfo}>
                    <Icon name="calendar" size={16} color={colors.gray[500]} />
                    <Text style={styles.dateText}>Ordered: {formatDateTime(order.orderDate)}</Text>
                </View>
                {order.expectedDeliveryDate && (
                    <View style={styles.dateInfo}>
                        <Icon name="truck-delivery" size={16} color={colors.gray[500]} />
                        <Text style={styles.dateText}>Expected: {formatDate(order.expectedDeliveryDate)}</Text>
                    </View>
                )}
                {order.trackingNumber && (
                    <View style={styles.dateInfo}>
                        <Icon name="package-variant" size={16} color={colors.gray[500]} />
                        <Text style={styles.dateText}>Tracking: {order.trackingNumber}</Text>
                    </View>
                )}
            </View>

            {/* Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items</Text>
                {order.items?.map((item: any, index: number) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Text style={styles.itemSku}>{item.productSku}</Text>
                        </View>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemQuantity}>{item.quantity} x {formatCurrency(item.unitPrice)}</Text>
                            <Text style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</Text>
                        </View>
                        {item.shippedQuantity > 0 && (
                            <View style={styles.shippedBadge}>
                                <Text style={styles.shippedText}>Shipped: {item.shippedQuantity}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
                </View>
                {order.discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={[styles.summaryValue, styles.discountText]}>
                            -{formatCurrency(order.discountAmount)}
                        </Text>
                    </View>
                )}
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(order.taxAmount)}</Text>
                </View>
                {order.shippingAmount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(order.shippingAmount)}</Text>
                    </View>
                )}
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                </View>
            </View>

            {/* Payment Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment</Text>
                <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Status:</Text>
                    <View style={[styles.paymentStatus, { backgroundColor: order.paymentStatus === 'PAID' ? colors.success + '20' : colors.warning + '20' }]}>
                        <Icon
                            name={order.paymentStatus === 'PAID' ? 'check-circle' : 'clock-outline'}
                            size={16}
                            color={order.paymentStatus === 'PAID' ? colors.success : colors.warning}
                        />
                        <Text style={[styles.paymentStatusText, { color: order.paymentStatus === 'PAID' ? colors.success : colors.warning }]}>
                            {order.paymentStatus}
                        </Text>
                    </View>
                </View>
                <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Paid Amount:</Text>
                    <Text style={styles.paidAmount}>{formatCurrency(order.paidAmount)}</Text>
                </View>
                {order.pendingAmount > 0 && (
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Pending:</Text>
                        <Text style={[styles.pendingAmount, { color: colors.warning }]}>
                            {formatCurrency(order.pendingAmount)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Notes */}
            {order.notes && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Text style={styles.notes}>{order.notes}</Text>
                </View>
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

                {canShip && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.shipButton]}
                        onPress={handleShip}
                    >
                        <Icon name="truck" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Ship Order</Text>
                    </TouchableOpacity>
                )}

                {canDeliver && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deliverButton]}
                        onPress={handleDeliver}
                    >
                        <Icon name="package-variant" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Mark Delivered</Text>
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
        marginBottom: 2,
    },
    distributorName: {
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
    shippedBadge: {
        marginTop: 4,
        backgroundColor: colors.info + '10',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    shippedText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.info,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    paymentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paymentStatusText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 4,
    },
    paidAmount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.success,
    },
    pendingAmount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
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
    shipButton: {
        backgroundColor: colors.info,
    },
    deliverButton: {
        backgroundColor: colors.primary[500],
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

export default DistributorOrderDetailScreen;