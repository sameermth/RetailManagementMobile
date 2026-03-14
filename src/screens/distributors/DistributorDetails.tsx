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
import { useDistributors } from '@hooks/useDistributors';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate, formatPhoneNumber } from '@utils/formatters';

const DistributorDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { distributorId } = route.params as { distributorId: number };
    const {
        getDistributor,
        deleteDistributor,
        activateDistributor,
        deactivateDistributor,
        fetchOrders,
        orders,
        loading,
    } = useDistributors();

    const [distributor, setDistributor] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'payments'>('info');

    useEffect(() => {
        loadDistributor();
    }, []);

    useEffect(() => {
        if (activeTab === 'orders' && distributor) {
            loadOrders();
        }
    }, [activeTab, distributor]);

    const loadDistributor = async () => {
        try {
            const data = await getDistributor(distributorId);
            setDistributor(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load distributor details');
        }
    };

    const loadOrders = async () => {
        try {
            await fetchOrders(distributorId, 0, 10);
        } catch (error) {
            console.error('Failed to load orders', error);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Distributor',
            'Are you sure you want to delete this distributor?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDistributor(distributorId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete distributor');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleStatus = async () => {
        try {
            if (distributor.isActive) {
                await deactivateDistributor(distributorId);
            } else {
                await activateDistributor(distributorId);
            }
            await loadDistributor();
        } catch (error) {
            Alert.alert('Error', 'Failed to update distributor status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return colors.success;
            case 'INACTIVE': return colors.error;
            case 'BLACKLISTED': return colors.error;
            default: return colors.gray[500];
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

    const renderInfoTab = () => (
        <ScrollView>
            {/* Basic Information */}
            <Section title="Basic Information">
                <InfoRow label="Distributor Code" value={distributor?.distributorCode} icon="barcode" />
                <InfoRow label="Name" value={distributor?.name} icon="store" />
                <InfoRow label="Region" value={distributor?.region} icon="map-marker" />
                <InfoRow label="Territory" value={distributor?.territory} icon="map" />
                <InfoRow label="Commission Rate" value={distributor?.commissionRate ? `${distributor.commissionRate}%` : '-'} icon="percent" />
                <InfoRow label="Delivery Time" value={distributor?.deliveryTimeDays ? `${distributor.deliveryTimeDays} days` : '-'} icon="truck-delivery" />
            </Section>

            {/* Contact Information */}
            <Section title="Contact Information">
                <InfoRow label="Contact Person" value={distributor?.contactPerson} icon="account-tie" />
                <InfoRow label="Email" value={distributor?.email} icon="email" />
                <InfoRow label="Phone" value={formatPhoneNumber(distributor?.phone)} icon="phone" />
                <InfoRow label="Alternate Phone" value={formatPhoneNumber(distributor?.alternatePhone)} icon="phone-plus" />
            </Section>

            {/* Address */}
            <Section title="Address">
                <InfoRow label="Address" value={distributor?.address} icon="map-marker" />
                <InfoRow label="City" value={distributor?.city} icon="city" />
                <InfoRow label="State" value={distributor?.state} icon="map" />
                <InfoRow label="Country" value={distributor?.country} icon="earth" />
                <InfoRow label="Pincode" value={distributor?.pincode} icon="zip-box" />
            </Section>

            {/* Tax Information */}
            <Section title="Tax Information">
                <InfoRow label="GST Number" value={distributor?.gstNumber} icon="barcode" />
                <InfoRow label="PAN Number" value={distributor?.panNumber} icon="card-account-details" />
            </Section>

            {/* Business Terms */}
            <Section title="Business Terms">
                <InfoRow label="Credit Limit" value={distributor?.creditLimit ? formatCurrency(distributor.creditLimit) : '-'} icon="credit-card" />
                <InfoRow label="Outstanding Amount" value={formatCurrency(distributor?.outstandingAmount || 0)} icon="cash" />
                <InfoRow label="Payment Terms" value={distributor?.paymentTerms ? `${distributor.paymentTerms} days` : '-'} icon="calendar-clock" />
                <InfoRow label="Minimum Order" value={distributor?.minimumOrderValue ? formatCurrency(distributor.minimumOrderValue) : '-'} icon="cart" />
            </Section>

            {/* Bank Details */}
            <Section title="Bank Details">
                <InfoRow label="Bank Name" value={distributor?.bankName} icon="bank" />
                <InfoRow label="Account Number" value={distributor?.bankAccountNumber} icon="credit-card" />
                <InfoRow label="IFSC Code" value={distributor?.bankIfscCode} icon="barcode" />
                <InfoRow label="UPI ID" value={distributor?.upiId} icon="qrcode" />
            </Section>

            {/* Additional Info */}
            <Section title="Additional Information">
                <InfoRow label="Last Order" value={distributor?.lastOrderDate ? formatDate(distributor.lastOrderDate) : 'Never'} icon="calendar" />
                <InfoRow label="Notes" value={distributor?.notes} icon="note" />
            </Section>
        </ScrollView>
    );

    const renderOrdersTab = () => (
        <View style={styles.tabContent}>
            <TouchableOpacity
                style={styles.createOrderButton}
                onPress={() => navigation.navigate('CreateDistributorOrder', { distributorId })}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.createOrderButtonText}>Create New Order</Text>
            </TouchableOpacity>

            {orders.length === 0 ? (
                <View style={styles.emptyOrders}>
                    <Icon name="clipboard-text-outline" size={48} color={colors.gray[300]} />
                    <Text style={styles.emptyOrdersText}>No orders found</Text>
                </View>
            ) : (
                orders.map((order: any) => (
                    <TouchableOpacity
                        key={order.id}
                        style={styles.orderCard}
                        onPress={() => navigation.navigate('DistributorOrderDetail', { orderId: order.id })}
                    >
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                            <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                                    {order.status}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.orderDate}>Date: {formatDate(order.orderDate)}</Text>
                        <Text style={styles.orderAmount}>Amount: {formatCurrency(order.totalAmount)}</Text>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );

    const renderPaymentsTab = () => (
        <View style={styles.tabContent}>
            <TouchableOpacity
                style={styles.createPaymentButton}
                onPress={() => navigation.navigate('CreateDistributorPayment', { distributorId })}
            >
                <Icon name="cash" size={20} color={colors.background} />
                <Text style={styles.createPaymentButtonText}>Record Payment</Text>
            </TouchableOpacity>

            <View style={styles.emptyPayments}>
                <Icon name="cash-off" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyPaymentsText}>Payment history will appear here</Text>
            </View>
        </View>
    );

    if (loading || !distributor) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {distributor.name?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.distributorName}>{distributor.name}</Text>
                        <Text style={styles.distributorCode}>Code: {distributor.distributorCode}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(distributor.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(distributor.status) }]}>
                                {distributor.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Summary Stats */}
                <View style={styles.summaryStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Outstanding</Text>
                        <Text style={[styles.statValue, { color: colors.warning }]}>
                            {formatCurrency(distributor.outstandingAmount || 0)}
                        </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Commission</Text>
                        <Text style={styles.statValue}>{distributor.commissionRate || 0}%</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Credit Limit</Text>
                        <Text style={styles.statValue}>{formatCurrency(distributor.creditLimit || 0)}</Text>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'info' && styles.tabActive]}
                    onPress={() => setActiveTab('info')}
                >
                    <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Info</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
                    onPress={() => setActiveTab('orders')}
                >
                    <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'payments' && styles.tabActive]}
                    onPress={() => setActiveTab('payments')}
                >
                    <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>Payments</Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'orders' && renderOrdersTab()}
            {activeTab === 'payments' && renderPaymentsTab()}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('EditDistributor', { distributorId: distributor.id })}
                >
                    <Icon name="pencil" size={20} color={colors.background} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, distributor.isActive ? styles.deactivateButton : styles.activateButton]}
                    onPress={handleToggleStatus}
                >
                    <Icon name={distributor.isActive ? 'close-circle' : 'check-circle'} size={20} color={colors.background} />
                    <Text style={styles.actionButtonText}>
                        {distributor.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                >
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
    header: {
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
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
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    headerInfo: {
        flex: 1,
    },
    distributorName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    distributorCode: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    statItem: {
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
    tabContent: {
        flex: 1,
        padding: 16,
    },
    createOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[500],
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    createOrderButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 8,
    },
    createPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    createPaymentButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 8,
    },
    orderCard: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    orderStatus: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    orderStatusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
    },
    orderDate: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    orderAmount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    emptyOrders: {
        alignItems: 'center',
        padding: 32,
    },
    emptyOrdersText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 8,
    },
    emptyPayments: {
        alignItems: 'center',
        padding: 32,
    },
    emptyPaymentsText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 8,
    },
    actionButtons: {
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
        paddingVertical: 10,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: colors.primary[500],
    },
    activateButton: {
        backgroundColor: colors.success,
    },
    deactivateButton: {
        backgroundColor: colors.warning,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
});

export default DistributorDetailScreen;