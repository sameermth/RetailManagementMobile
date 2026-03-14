import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCustomerDue } from '@hooks/useCustomerDue';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';

const CustomerDuesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { customerId } = route.params as { customerId: number };

    const {
        dues,
        loading,
        error,
        totalPages,
        currentPage,
        fetchCustomerDues,
        recordPayment,
        sendReminder,
    } = useCustomerDue();

    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedDue, setSelectedDue] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadDues(0);
    }, []);

    const loadDues = async (page: number) => {
        if (page === 0) {
            await fetchCustomerDues(customerId, page, 20);
        } else {
            setLoadingMore(true);
            await fetchCustomerDues(customerId, page, 20);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDues(0);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1) {
            loadDues(currentPage + 1);
        }
    };

    const handleRecordPayment = (due: any) => {
        Alert.prompt(
            'Record Payment',
            `Enter payment amount for ${formatCurrency(due.remainingAmount)} remaining:`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pay',
                    onPress: async (amount) => {
                        if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
                            if (Number(amount) > due.remainingAmount) {
                                Alert.alert('Error', 'Payment amount cannot exceed remaining amount');
                                return;
                            }
                            try {
                                await recordPayment(due.id, Number(amount));
                                Alert.alert('Success', 'Payment recorded successfully');
                                loadDues(0);
                            } catch (error) {
                                Alert.alert('Error', 'Failed to record payment');
                            }
                        }
                    },
                },
            ],
            'plain-text',
            due.remainingAmount.toString(),
            'numeric'
        );
    };

    const handleSendReminder = (due: any) => {
        Alert.alert(
            'Send Reminder',
            `Send payment reminder for due of ${formatCurrency(due.remainingAmount)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        try {
                            await sendReminder(due.id);
                            Alert.alert('Success', 'Reminder sent successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to send reminder');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return colors.success;
            case 'PARTIALLY_PAID': return colors.warning;
            case 'OVERDUE': return colors.error;
            default: return colors.info;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return 'check-circle';
            case 'PARTIALLY_PAID': return 'clock';
            case 'OVERDUE': return 'alert-circle';
            default: return 'clock-outline';
        }
    };

    const renderDueItem = ({ item }: { item: any }) => (
        <View style={styles.dueCard}>
            <View style={styles.dueHeader}>
                <View style={styles.dueReference}>
                    <Icon name="file-document" size={20} color={colors.primary[500]} />
                    <Text style={styles.dueReferenceText}>{item.dueReference}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Icon name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {item.invoiceNumber && (
                <Text style={styles.invoiceText}>Invoice: {item.invoiceNumber}</Text>
            )}

            {item.description && (
                <Text style={styles.descriptionText}>{item.description}</Text>
            )}

            <View style={styles.amountContainer}>
                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Original Amount:</Text>
                    <Text style={styles.amountValue}>{formatCurrency(item.originalAmount)}</Text>
                </View>
                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Paid Amount:</Text>
                    <Text style={[styles.amountValue, styles.paidAmount]}>{formatCurrency(item.paidAmount)}</Text>
                </View>
                <View style={[styles.amountRow, styles.remainingRow]}>
                    <Text style={styles.remainingLabel}>Remaining:</Text>
                    <Text style={[
                        styles.remainingValue,
                        item.status === 'OVERDUE' && styles.overdueText
                    ]}>
                        {formatCurrency(item.remainingAmount)}
                    </Text>
                </View>
            </View>

            <View style={styles.dueFooter}>
                <View style={styles.dateContainer}>
                    <Icon name="calendar" size={16} color={colors.gray[500]} />
                    <Text style={styles.dateText}>Due: {formatDate(item.dueDate)}</Text>
                </View>
                {item.daysOverdue > 0 && (
                    <View style={styles.overdueDays}>
                        <Text style={styles.overdueDaysText}>{item.daysOverdue} days overdue</Text>
                    </View>
                )}
            </View>

            {item.status !== 'PAID' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.payButton]}
                        onPress={() => handleRecordPayment(item)}
                    >
                        <Icon name="cash" size={18} color={colors.background} />
                        <Text style={styles.actionButtonText}>Record Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.reminderButton]}
                        onPress={() => handleSendReminder(item)}
                    >
                        <Icon name="bell" size={18} color={colors.background} />
                        <Text style={styles.actionButtonText}>Send Reminder</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderHeader = () => {
        const totalDue = dues.reduce((sum, d) => sum + d.remainingAmount, 0);
        const overdueCount = dues.filter(d => d.status === 'OVERDUE').length;

        return (
            <View style={styles.header}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Due</Text>
                        <Text style={[styles.statValue, { color: colors.warning }]}>
                            {formatCurrency(totalDue)}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Overdue</Text>
                        <Text style={[styles.statValue, { color: colors.error }]}>
                            {overdueCount}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="check-circle" size={64} color={colors.success} />
            <Text style={styles.emptyStateTitle}>No Dues</Text>
            <Text style={styles.emptyStateText}>
                This customer has no pending payments
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={dues}
                renderItem={renderDueItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={!loading ? renderEmptyState : null}
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
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    dueCard: {
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
    dueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dueReference: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueReferenceText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 4,
    },
    invoiceText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 12,
    },
    amountContainer: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    amountLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    amountValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    paidAmount: {
        color: colors.success,
    },
    remainingRow: {
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    remainingLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    remainingValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.warning,
    },
    overdueText: {
        color: colors.error,
    },
    dueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[500],
        marginLeft: 4,
    },
    overdueDays: {
        backgroundColor: colors.error + '10',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    overdueDaysText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.error,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    payButton: {
        backgroundColor: colors.success,
    },
    reminderButton: {
        backgroundColor: colors.warning,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
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
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default CustomerDuesScreen;