import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSales } from '@hooks/useSales';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDateTime } from '@utils/formatters';

const InvoiceScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { saleId } = route.params as { saleId: number };
    const { getSale, generateInvoice, loading } = useSales();

    const [sale, setSale] = useState<any>(null);

    useEffect(() => {
        loadSale();
    }, []);

    const loadSale = async () => {
        try {
            const data = await getSale(saleId);
            setSale(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load invoice details');
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Invoice ${sale?.invoiceNumber}\nTotal: ${formatCurrency(sale?.totalAmount)}`,
                title: 'Share Invoice',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share invoice');
        }
    };

    const handleDownload = async () => {
        try {
            await generateInvoice(saleId);
            Alert.alert('Success', 'Invoice PDF generated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to generate invoice PDF');
        }
    };

    const handleNewSale = () => {
        navigation.popToTop();
        navigation.navigate('POS');
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
            {/* Success Header */}
            <View style={styles.successHeader}>
                <View style={styles.successIcon}>
                    <Icon name="check-circle" size={60} color={colors.success} />
                </View>
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successMessage}>
                    Your sale has been completed successfully
                </Text>
            </View>

            {/* Invoice Card */}
            <View style={styles.invoiceCard}>
                {/* Header */}
                <View style={styles.invoiceHeader}>
                    <View>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>#{sale.invoiceNumber}</Text>
                    </View>
                    <View style={styles.invoiceDate}>
                        <Icon name="calendar" size={16} color={colors.gray[500]} />
                        <Text style={styles.dateText}>{formatDateTime(sale.saleDate)}</Text>
                    </View>
                </View>

                {/* Business Info */}
                <View style={styles.businessInfo}>
                    <Text style={styles.businessName}>Retail Management Store</Text>
                    <Text style={styles.businessAddress}>123 Business Park, Commercial Street</Text>
                    <Text style={styles.businessContact}>City - 400001, GST: 27AAABC1234A1Z5</Text>
                    <Text style={styles.businessContact}>Tel: +91 98765 43210</Text>
                </View>

                <View style={styles.divider} />

                {/* Customer Info */}
                <View style={styles.customerInfo}>
                    <Text style={styles.customerLabel}>Bill To:</Text>
                    <Text style={styles.customerName}>
                        {sale.customerName || 'Walk-in Customer'}
                    </Text>
                    {sale.customerPhone && (
                        <Text style={styles.customerDetail}>Phone: {sale.customerPhone}</Text>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Items */}
                <View style={styles.itemsHeader}>
                    <Text style={[styles.itemColumn, { flex: 3 }]}>Item</Text>
                    <Text style={[styles.itemColumn, { flex: 1, textAlign: 'right' }]}>Qty</Text>
                    <Text style={[styles.itemColumn, { flex: 2, textAlign: 'right' }]}>Price</Text>
                    <Text style={[styles.itemColumn, { flex: 2, textAlign: 'right' }]}>Total</Text>
                </View>

                {sale.items.map((item: any, index: number) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={[styles.itemText, { flex: 3 }]} numberOfLines={1}>
                            {item.productName}
                        </Text>
                        <Text style={[styles.itemText, { flex: 1, textAlign: 'right' }]}>
                            {item.quantity}
                        </Text>
                        <Text style={[styles.itemText, { flex: 2, textAlign: 'right' }]}>
                            {formatCurrency(item.unitPrice)}
                        </Text>
                        <Text style={[styles.itemText, { flex: 2, textAlign: 'right' }]}>
                            {formatCurrency(item.totalPrice)}
                        </Text>
                    </View>
                ))}

                <View style={styles.divider} />

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>{formatCurrency(sale.subtotal)}</Text>
                    </View>
                    {sale.discountAmount > 0 && (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Discount</Text>
                            <Text style={[styles.totalValue, styles.discountText]}>
                                -{formatCurrency(sale.discountAmount)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tax</Text>
                        <Text style={styles.totalValue}>{formatCurrency(sale.taxAmount)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                        <Text style={styles.grandTotalLabel}>Grand Total</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(sale.totalAmount)}</Text>
                    </View>
                </View>

                {/* Payment Status */}
                <View style={styles.paymentStatus}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={styles.paymentStatusText}>Paid via {sale.paymentMethod}</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thank you for your business!</Text>
                    <Text style={styles.footerNote}>This is a computer generated invoice</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
                    <Icon name="share" size={20} color={colors.primary[500]} />
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.downloadButton]} onPress={handleDownload}>
                    <Icon name="download" size={20} color={colors.primary[500]} />
                    <Text style={styles.downloadButtonText}>PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.newSaleButton]} onPress={handleNewSale}>
                    <Icon name="cart-plus" size={20} color={colors.primary[500]} />
                    <Text style={styles.newSaleButtonText}>New Sale</Text>
                </TouchableOpacity>
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
    successHeader: {
        alignItems: 'center',
        padding: 24,
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
        marginBottom: 8,
    },
    successMessage: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    invoiceCard: {
        backgroundColor: colors.background,
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    invoiceTitle: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    invoiceNumber: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    invoiceDate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 4,
    },
    businessInfo: {
        marginBottom: 16,
    },
    businessName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    businessAddress: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    businessContact: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    customerInfo: {
        marginBottom: 8,
    },
    customerLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    customerName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    customerDetail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    itemsHeader: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemColumn: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    itemText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    totals: {
        marginTop: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    totalValue: {
        fontSize: typography.fontSize.sm,
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
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    grandTotalValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    paymentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        padding: 12,
        backgroundColor: colors.success + '10',
        borderRadius: 8,
    },
    paymentStatusText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.success,
        marginLeft: 8,
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 4,
    },
    footerNote: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.primary[500],
        borderRadius: 8,
    },
    shareButton: {
        backgroundColor: colors.background,
    },
    shareButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 6,
    },
    downloadButton: {
        backgroundColor: colors.background,
    },
    downloadButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 6,
    },
    newSaleButton: {
        backgroundColor: colors.background,
    },
    newSaleButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 6,
    },
});

export default InvoiceScreen;