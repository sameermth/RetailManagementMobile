import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useExpenses } from '@hooks/useExpenses';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDateTime } from '@utils/formatters';

const ExpenseDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { expenseId } = route.params as { expenseId: number };
    const { user } = useAuth();
    const {
        getExpense,
        approveExpense,
        rejectExpense,
        markAsPaid,
        cancelExpense,
        loading,
    } = useExpenses();

    const [expense, setExpense] = useState<any>(null);

    useEffect(() => {
        loadExpense();
    }, []);

    const loadExpense = async () => {
        try {
            const data = await getExpense(expenseId);
            setExpense(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load expense details');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return colors.warning;
            case 'APPROVED': return colors.info;
            case 'PAID': return colors.success;
            case 'REJECTED': return colors.error;
            case 'CANCELLED': return colors.gray[500];
            default: return colors.gray[500];
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return 'clock-outline';
            case 'APPROVED': return 'check-circle-outline';
            case 'PAID': return 'cash-check';
            case 'REJECTED': return 'close-circle';
            case 'CANCELLED': return 'cancel';
            default: return 'help-circle';
        }
    };

    const handleApprove = () => {
        Alert.alert(
            'Approve Expense',
            'Are you sure you want to approve this expense?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            await approveExpense(expenseId);
                            await loadExpense();
                            Alert.alert('Success', 'Expense approved');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve expense');
                        }
                    },
                },
            ]
        );
    };

    const handleReject = () => {
        Alert.prompt(
            'Reject Expense',
            'Please provide a reason for rejection:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    onPress: async (reason) => {
                        if (reason) {
                            try {
                                await rejectExpense(expenseId, reason);
                                await loadExpense();
                                Alert.alert('Success', 'Expense rejected');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to reject expense');
                            }
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleMarkPaid = () => {
        Alert.alert(
            'Mark as Paid',
            'Confirm that this expense has been paid?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await markAsPaid(expenseId);
                            await loadExpense();
                            Alert.alert('Success', 'Expense marked as paid');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to mark expense as paid');
                        }
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        Alert.prompt(
            'Cancel Expense',
            'Please provide a reason for cancellation:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cancel Expense',
                    onPress: async (reason) => {
                        if (reason) {
                            try {
                                await cancelExpense(expenseId, reason);
                                await loadExpense();
                                Alert.alert('Success', 'Expense cancelled');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to cancel expense');
                            }
                        }
                    },
                },
            ],
            'plain-text'
        );
    };

    const handleViewReceipt = () => {
        if (expense.receiptUrl) {
            Linking.openURL(expense.receiptUrl);
        }
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

    if (loading || !expense) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    const canApprove = expense.status === 'PENDING_APPROVAL' && user?.roles?.includes('ROLE_MANAGER' || 'ROLE_ADMIN');
    const canReject = expense.status === 'PENDING_APPROVAL' && user?.roles?.includes('ROLE_MANAGER' || 'ROLE_ADMIN');
    const canMarkPaid = expense.status === 'APPROVED' && user?.roles?.includes('ROLE_ACCOUNTANT' || 'ROLE_ADMIN');
    const canCancel = expense.status !== 'PAID' && expense.status !== 'CANCELLED' && expense.status !== 'REJECTED';

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.expenseNumber}>{expense.expenseNumber}</Text>
                        <Text style={styles.expenseDescription}>{expense.description}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '20' }]}>
                        <Icon name={getStatusIcon(expense.status)} size={16} color={getStatusColor(expense.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                            {expense.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.dateInfo}>
                    <Icon name="calendar" size={16} color={colors.gray[500]} />
                    <Text style={styles.dateText}>Expense Date: {formatDateTime(expense.expenseDate)}</Text>
                </View>
            </View>

            {/* Amount Card */}
            <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>{formatCurrency(expense.amount)}</Text>
                <Text style={styles.paymentMethod}>Payment: {expense.paymentMethod || 'Not specified'}</Text>
            </View>

            {/* Category & Vendor */}
            <Section title="Details">
                <InfoRow label="Category" value={expense.categoryName} icon="shape" />
                <InfoRow label="Vendor" value={expense.vendor} icon="store" />
                <InfoRow label="Invoice Number" value={expense.vendorInvoiceNumber} icon="file-document" />
                <InfoRow label="Reference Number" value={expense.referenceNumber} icon="barcode" />
            </Section>

            {/* Dates */}
            <Section title="Dates">
                <InfoRow label="Created" value={formatDateTime(expense.createdAt)} icon="clock-outline" />
                {expense.approvedAt && (
                    <InfoRow label="Approved" value={formatDateTime(expense.approvedAt)} icon="check-circle" />
                )}
                {expense.paidAt && (
                    <InfoRow label="Paid" value={formatDateTime(expense.paidAt)} icon="cash" />
                )}
            </Section>

            {/* User Info */}
            <Section title="Created By">
                <InfoRow label="User" value={expense.userName || 'System'} icon="account" />
                {expense.paidTo && (
                    <InfoRow label="Paid To" value={expense.paidTo} icon="account" />
                )}
            </Section>

            {/* Receipt */}
            {expense.receiptUrl && (
                <Section title="Receipt">
                    <TouchableOpacity style={styles.receiptButton} onPress={handleViewReceipt}>
                        <Icon name="file-image" size={24} color={colors.primary[500]} />
                        <Text style={styles.receiptButtonText}>View Receipt</Text>
                    </TouchableOpacity>
                </Section>
            )}

            {/* Notes */}
            {expense.notes && (
                <Section title="Notes">
                    <Text style={styles.notes}>{expense.notes}</Text>
                </Section>
            )}

            {/* Rejection Reason */}
            {expense.rejectionReason && (
                <Section title="Rejection Reason">
                    <Text style={[styles.notes, styles.rejectionText]}>{expense.rejectionReason}</Text>
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

                {canReject && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={handleReject}
                    >
                        <Icon name="close-circle" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                )}

                {canMarkPaid && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.paidButton]}
                        onPress={handleMarkPaid}
                    >
                        <Icon name="cash" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Mark Paid</Text>
                    </TouchableOpacity>
                )}

                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Icon name="cancel" size={20} color={colors.background} />
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
    expenseNumber: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    expenseDescription: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
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
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    amountCard: {
        backgroundColor: colors.background,
        padding: 16,
        marginTop: 8,
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    amountValue: {
        fontSize: typography.fontSize['3xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.error,
        marginBottom: 4,
    },
    paymentMethod: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    receiptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: colors.primary[500],
        borderRadius: 8,
    },
    receiptButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 8,
    },
    notes: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    rejectionText: {
        color: colors.error,
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
    rejectButton: {
        backgroundColor: colors.error,
    },
    paidButton: {
        backgroundColor: colors.info,
    },
    cancelButton: {
        backgroundColor: colors.warning,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
});

export default ExpenseDetailScreen;