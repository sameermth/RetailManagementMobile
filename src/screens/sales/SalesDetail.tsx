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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSales } from '@hooks/useSales';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDateTime } from '@utils/formatters';

const SaleDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { saleId } = route.params as { saleId: number };
    const { getSale, cancelSale, loading } = useSales();

    const [sale, setSale] = useState<any>(null);

    useEffect(() => {
        loadSale();
    }, []);

    const loadSale = async () => {
        try {
            const data = await getSale(saleId);
            setSale(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load sale details');
        }
    };

    const handleCancel = () => {
        Alert.prompt(
            'Cancel Sale',
            'Please provide a reason for cancellation:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cancel Sale',
                    onPress: async (reason) => {
                        if (reason) {
                            try {
                                await cancelSale(saleId, reason);
                                await loadSale();
                                Alert.alert('Success', 'Sale cancelled');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to cancel sale');
                            }
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handlePrintInvoice = () => {
        navigation.navigate('Invoice', { saleId });
    };

    const handleProcessPayment = () => {
        navigation.navigate('Payment', {
            saleId,
            totalAmount: sale.pendingAmount
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return colors.success;
            case 'PENDING': return colors.warning;
            case 'CANCELLED': return colors.error;
            default: return colors.gray[500];
        }
    };

    if (loading || !sale) {
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
                <Text style={styles.invoiceNumber}>{sale.invoiceNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sale.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(sale.status) }]}>
                        {sale.status}
                    </Text>
                </View>
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <Text style={styles.customerName}>
                    {sale.customerName || 'Walk-in Customer'}
                </Text>
                {sale.customerPhone && (
                    <Text style={styles.customerDetail}>Phone: {sale.customerPhone}</Text>
                )}
            </View>

            {/* Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items</Text>
                {sale.items?.map((item: any, index: number) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Text style={styles.itemSku}>{item.productSku}</Text>
                        </View>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                            <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(sale.subtotal)}</Text>
                </View>
                {sale.discountAmount > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Discount</Text>
                        <Text style={[styles.summaryValue, styles.discountText]}>
                            -{formatCurrency(sale.discountAmount)}
                        </Text>
                    </View>
                )}
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(sale.taxAmount)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(sale.totalAmount)}</Text>
                </View>
            </View>

            {/* Payment Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment</Text>
                <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Paid:</Text>
                    <Text style={styles.paidAmount}>{formatCurrency(sale.paidAmount)}</Text>
                </View>
                {sale.pendingAmount > 0 && (
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Pending:</Text>
                        <Text style={[styles.pendingAmount, { color: colors.warning }]}>
                            {formatCurrency(sale.pendingAmount)}
                        </Text>
                    </View>
                )}
                <Text style={styles.paymentMethod}>Method: {sale.paymentMethod}</Text>
            </View>

            {/* Dates */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Timeline</Text>
                <Text style={styles.dateText}>Created: {formatDateTime(sale.saleDate)}</Text>
                {sale.updatedAt && (
                    <Text style={styles.dateText}>Updated: {formatDateTime(sale.updatedAt)}</Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actionContainer}>
                {sale.status !== 'CANCELLED' && (
                    <>
                        {sale.pendingAmount > 0 && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.paymentButton]}
                                onPress={handleProcessPayment}
                            >
                                <Icon name="cash" size={20} color={colors.background} />
                                <Text style={styles.actionButtonText}>Process Payment</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, styles.invoiceButton]}
                            onPress={handlePrintInvoice}
                        >
                            <Icon name="file-pdf-box" size={20} color={colors.background} />
                            <Text style={styles.actionButtonText}>View Invoice</Text>
                        </TouchableOpacity>

                        {sale.status !== 'COMPLETED' && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={handleCancel}
                            >
                                <Icon name="close-circle" size={20} color={colors.background} />
                                <Text style={styles.actionButtonText}>Cancel Sale</Text>
                            </TouchableOpacity>
                        )}
                    </>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    invoiceNumber: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
    },
    section: {
        backgroundColor: colors.background,
        padding: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    customerName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 4,
    },
    customerDetail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: typography.fontSize.sm,
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
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginRight: 12,
    },
    itemPrice: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
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
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    paymentMethod: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 8,
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    actionContainer: {
        padding: 16,
        marginBottom: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    paymentButton: {
        backgroundColor: colors.success,
    },
    invoiceButton: {
        backgroundColor: colors.info,
    },
    cancelButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 8,
    },
});

export default SaleDetailScreen;