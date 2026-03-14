import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDistributors } from '@hooks/useDistributors';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDateTime } from '@utils/formatters';

const DistributorPaymentsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { distributorId } = route.params as { distributorId: number };
    const { getPayments, loading } = useDistributors();

    const [payments, setPayments] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const data = await getPayments(distributorId);
            setPayments(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load payments');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPayments();
        setRefreshing(false);
    };

    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case 'CASH': return 'cash';
            case 'BANK_TRANSFER': return 'bank';
            case 'CHEQUE': return 'file-document';
            case 'CARD': return 'credit-card';
            case 'UPI': return 'qrcode';
            default: return 'cash';
        }
    };

    const renderPayment = ({ item }: { item: any }) => (
        <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
                <View style={styles.paymentReference}>
                    <Icon name="cash" size={20} color={colors.success} />
                    <Text style={styles.referenceText}>{item.paymentReference}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'PAID' ? colors.success + '20' : colors.warning + '20' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'PAID' ? colors.success : colors.warning }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={14} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{formatDateTime(item.paymentDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name={getPaymentMethodIcon(item.paymentMethod)} size={14} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.paymentMethod}</Text>
                </View>
            </View>

            {item.orderNumber && (
                <TouchableOpacity
                    style={styles.orderLink}
                    onPress={() => navigation.navigate('DistributorOrderDetail', { orderId: item.orderId })}
                >
                    <Icon name="package" size={14} color={colors.primary[500]} />
                    <Text style={styles.orderLinkText}>Order: {item.orderNumber}</Text>
                </TouchableOpacity>
            )}

            <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
            </View>

            {item.transactionId && (
                <Text style={styles.transactionId}>Transaction ID: {item.transactionId}</Text>
            )}

            {item.notes && (
                <Text style={styles.notes}>{item.notes}</Text>
            )}
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Payment History</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateDistributorPayment', { distributorId })}
                >
                    <Icon name="plus" size={20} color={colors.background} />
                    <Text style={styles.createButtonText}>Record Payment</Text>
                </TouchableOpacity>
            </View>

            {/* Summary Stats */}
            <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Paid</Text>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                        {formatCurrency(payments.reduce((sum, p) => sum + (p.status === 'PAID' ? p.amount : 0), 0))}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Transactions</Text>
                    <Text style={styles.statValue}>{payments.length}</Text>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="cash-off" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Payments Found</Text>
            <Text style={styles.emptyStateText}>
                Record your first payment for this distributor
            </Text>
            <TouchableOpacity
                style={styles.createPaymentButton}
                onPress={() => navigation.navigate('CreateDistributorPayment', { distributorId })}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.createPaymentButtonText}>Record Payment</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={payments}
                renderItem={renderPayment}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={!loading ? renderEmptyState : null}
                ListFooterComponent={
                    loading ? (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color={colors.primary[500]} />
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
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
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    createButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
    summaryStats: {
        flexDirection: 'row',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        padding: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    paymentCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentReference: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    referenceText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
    },
    paymentDetails: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    orderLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderLinkText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 6,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amountLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    amountValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
    },
    transactionId: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    notes: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        fontStyle: 'italic',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 32,
    },
    createPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createPaymentButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
        marginLeft: 8,
    },
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default DistributorPaymentsScreen;