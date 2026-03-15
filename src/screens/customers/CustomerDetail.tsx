import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SectionList,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCustomers } from '@hooks/useCustomers';
import { useCustomerDue } from '@hooks/useCustomerDue';
import { useLoyalty } from '@hooks/useLoyalty';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate, formatPhoneNumber } from '@utils/formatters';

const CustomerDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { customerId } = route.params as { customerId: number };

    const { getCustomer, deleteCustomer, activateCustomer, deactivateCustomer, loading } = useCustomers();
    const { fetchCustomerDues, dues, recordPayment } = useCustomerDue();
    const { fetchLoyaltySummary, loyaltySummary, earnPoints } = useLoyalty();

    const [customer, setCustomer] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSection, setSelectedSection] = useState<'info' | 'dues' | 'loyalty'>('info');

    useEffect(() => {
        loadCustomerData();
    }, []);

    const loadCustomerData = async () => {
        try {
            const data = await getCustomer(customerId);
            setCustomer(data);
            await fetchCustomerDues(customerId, 0, 10);
            await fetchLoyaltySummary(customerId);
        } catch (error) {
            Alert.alert('Error', 'Failed to load customer details');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Customer',
            'Are you sure you want to delete this customer? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCustomer(customerId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete customer');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleStatus = async () => {
        try {
            if (customer.isActive) {
                await deactivateCustomer(customerId);
            } else {
                await activateCustomer(customerId);
            }
            await loadCustomerData();
        } catch (error) {
            Alert.alert('Error', 'Failed to update customer status');
        }
    };

    const handleRecordPayment = (dueId: number) => {
        Alert.prompt(
            'Record Payment',
            'Enter payment amount:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: async (amount) => {
                        if (amount && !isNaN(Number(amount))) {
                            try {
                                await recordPayment(dueId, Number(amount));
                                await loadCustomerData();
                                Alert.alert('Success', 'Payment recorded successfully');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to record payment');
                            }
                        }
                    },
                },
            ],
            'plain-text',
            '',
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

    const renderInfoSection = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EditCustomer', { customerId })}>
                    <Icon name="pencil" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
            </View>

            <View style={styles.customerHeader}>
                <View style={styles.customerAvatar}>
                    <Text style={styles.avatarText}>
                        {customer?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                    </Text>
                </View>
                <View style={styles.customerHeaderInfo}>
                    <Text style={styles.customerName}>{customer?.name}</Text>
                    <Text style={styles.customerCode}>Code: {customer?.customerCode}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: customer?.isActive ? colors.success : colors.error }]}>
                        <Text style={styles.statusText}>{customer?.isActive ? 'Active' : 'Inactive'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.card}>
                <InfoRow label="Email" value={customer?.email} icon="email" />
                <InfoRow label="Phone" value={formatPhoneNumber(customer?.phone)} icon="phone" />
                <InfoRow label="Alternate Phone" value={formatPhoneNumber(customer?.alternatePhone)} icon="phone-plus" />
                <InfoRow label="GST Number" value={customer?.gstNumber} icon="barcode" />
                <InfoRow label="PAN Number" value={customer?.panNumber} icon="card-account-details" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Address</Text>
                <InfoRow label="Address" value={customer?.address} icon="map-marker" />
                <InfoRow label="City" value={customer?.city} icon="city" />
                <InfoRow label="State" value={customer?.state} icon="map" />
                <InfoRow label="Country" value={customer?.country} icon="earth" />
                <InfoRow label="Pincode" value={customer?.pincode} icon="zip-box" />
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Business Information</Text>
                <InfoRow label="Customer Type" value={customer?.customerType} icon="account-tie" />
                <InfoRow label="Credit Limit" value={customer?.creditLimit ? formatCurrency(customer.creditLimit) : '-'} icon="credit-card" />
                <InfoRow label="Payment Terms" value={customer?.paymentTerms ? `${customer.paymentTerms} days` : '-'} icon="calendar-clock" />
            </View>
        </View>
    );

    const renderDuesSection = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dues & Payments</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CustomerDues', { customerId })}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Due</Text>
                    <Text style={[styles.statValue, { color: colors.warning }]}>
                        {formatCurrency(dues.reduce((sum, d) => sum + d.remainingAmount, 0))}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Overdue</Text>
                    <Text style={[styles.statValue, { color: colors.error }]}>
                        {formatCurrency(dues.filter(d => d.status === 'OVERDUE').reduce((sum, d) => sum + d.remainingAmount, 0))}
                    </Text>
                </View>
            </View>

            {dues.slice(0, 5).map((due) => (
                <TouchableOpacity
                    key={due.id}
                    style={styles.dueItem}
                    onPress={() => handleRecordPayment(due.id)}
                >
                    <View style={styles.dueIcon}>
                        <Icon
                            name={due.status === 'OVERDUE' ? 'alert-circle' : 'clock'}
                            size={24}
                            color={due.status === 'OVERDUE' ? colors.error : colors.warning}
                        />
                    </View>
                    <View style={styles.dueInfo}>
                        <Text style={styles.dueReference}>Ref: {due.dueReference}</Text>
                        <Text style={styles.dueDate}>Due: {formatDate(due.dueDate)}</Text>
                    </View>
                    <View style={styles.dueAmount}>
                        <Text style={styles.dueAmountText}>{formatCurrency(due.remainingAmount)}</Text>
                        <Text style={styles.dueStatus}>{due.status}</Text>
                    </View>
                </TouchableOpacity>
            ))}

            {dues.length === 0 && (
                <View style={styles.emptySection}>
                    <Icon name="check-circle" size={40} color={colors.success} />
                    <Text style={styles.emptyText}>No pending dues</Text>
                </View>
            )}
        </View>
    );

    const renderLoyaltySection = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Loyalty Program</Text>
            </View>

            <View style={styles.loyaltyCard}>
                <View style={styles.loyaltyHeader}>
                    <Icon name="star" size={32} color={colors.warning} />
                    <Text style={styles.loyaltyPoints}>{loyaltySummary?.totalPoints || 0}</Text>
                    <Text style={styles.loyaltyLabel}>Points</Text>
                </View>

                <View style={styles.tierContainer}>
                    <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>{loyaltySummary?.currentTier || 'BRONZE'}</Text>
                    </View>
                    <Text style={styles.tierProgress}>
                        {loyaltySummary?.pointsToNextTier || 0} points to {loyaltySummary?.nextTier || 'next tier'}
                    </Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.loyaltyStat}>
                        <Text style={styles.loyaltyStatLabel}>Total Spent</Text>
                        <Text style={styles.loyaltyStatValue}>
                            {formatCurrency(loyaltySummary?.totalPurchaseAmount || 0)}
                        </Text>
                    </View>
                    <View style={styles.loyaltyStat}>
                        <Text style={styles.loyaltyStatLabel}>Last Purchase</Text>
                        <Text style={styles.loyaltyStatValue}>
                            {customer?.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'Never'}
                        </Text>
                    </View>
                </View>

                {loyaltySummary?.recentTransactions?.length > 0 && (
                    <>
                        <Text style={styles.recentTitle}>Recent Transactions</Text>
                        {loyaltySummary.recentTransactions.slice(0, 3).map((tx, index) => (
                            <View key={index} style={styles.transactionItem}>
                                <Icon
                                    name={tx.transactionType === 'EARNED' ? 'plus-circle' : 'minus-circle'}
                                    size={20}
                                    color={tx.transactionType === 'EARNED' ? colors.success : colors.warning}
                                />
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionDesc}>{tx.description}</Text>
                                    <Text style={styles.transactionDate}>{formatDate(tx.createdAt)}</Text>
                                </View>
                                <Text style={[
                                    styles.transactionPoints,
                                    { color: tx.transactionType === 'EARNED' ? colors.success : colors.warning }
                                ]}>
                                    {tx.transactionType === 'EARNED' ? '+' : '-'}{tx.points}
                                </Text>
                            </View>
                        ))}
                    </>
                )}
            </View>
        </View>
    );

    const sections = [
        {
            title: 'Information',
            data: [{ key: 'info', component: renderInfoSection }],
        },
        {
            title: 'Dues',
            data: [{ key: 'dues', component: renderDuesSection }],
        },
        {
            title: 'Loyalty',
            data: [{ key: 'loyalty', component: renderLoyaltySection }],
        },
    ];

    if (loading && !customer) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {sections.map((section) => (
                    <TouchableOpacity
                        key={section.title}
                        style={[styles.tab, selectedSection === section.title.toLowerCase() && styles.tabActive]}
                        onPress={() => setSelectedSection(section.title.toLowerCase() as any)}
                    >
                        <Text style={[styles.tabText, selectedSection === section.title.toLowerCase() && styles.tabTextActive]}>
                            {section.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content}>
                {selectedSection === 'info' && renderInfoSection()}
                {selectedSection === 'dues' && renderDuesSection()}
                {selectedSection === 'loyalty' && renderLoyaltySection()}
            </ScrollView>

            <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionButton} onPress={handleToggleStatus}>
                    <Icon name={customer?.isActive ? 'close-circle' : 'check-circle'} size={20} color={colors.background} />
                    <Text style={styles.actionButtonText}>
                        {customer?.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
                    <Icon name="delete" size={20} color={colors.background} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary[500],
    },
    tabText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    tabTextActive: {
        color: colors.primary[500],
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    viewAllText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    customerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    customerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    customerHeaderInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    customerCode: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 6,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    card: {
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
    cardTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    valueText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    statsCard: {
        flexDirection: 'row',
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
    statItem: {
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
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 16,
    },
    dueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dueIcon: {
        width: 40,
        alignItems: 'center',
    },
    dueInfo: {
        flex: 1,
        marginLeft: 8,
    },
    dueReference: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    dueDate: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    dueAmount: {
        alignItems: 'flex-end',
    },
    dueAmountText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    dueStatus: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
    },
    emptySection: {
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 12,
    },
    loyaltyCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loyaltyHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    loyaltyPoints: {
        fontSize: typography.fontSize['3xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.warning,
        marginTop: 8,
    },
    loyaltyLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    tierContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    tierBadge: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    tierText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
    tierProgress: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    loyaltyStat: {
        flex: 1,
    },
    loyaltyStatLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    loyaltyStatValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    recentTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    transactionInfo: {
        flex: 1,
        marginLeft: 12,
    },
    transactionDesc: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    transactionDate: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    transactionPoints: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
    },
    actionBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.warning,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 8,
    },
});

export default CustomerDetailScreen;