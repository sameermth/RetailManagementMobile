import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { usePurchases } from '@hooks/usePurchases';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';
import { Picker } from '@react-native-picker/picker';

const PurchaseListScreen = () => {
    const navigation = useNavigation();
    const {
        purchases,
        loading,
        error,
        totalPages,
        currentPage,
        fetchPurchases,
    } = usePurchases();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const statusOptions = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'PENDING_APPROVAL' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Ordered', value: 'ORDERED' },
        { label: 'Received', value: 'RECEIVED' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Cancelled', value: 'CANCELLED' },
    ];

    useEffect(() => {
        loadPurchases(0);
    }, [debouncedSearch, filterStatus]);

    const loadPurchases = async (page: number) => {
        const params: any = { page, size: 20 };
        if (filterStatus !== 'all') {
            params.status = filterStatus;
        }
        if (debouncedSearch) {
            params.search = debouncedSearch;
        }

        if (page === 0) {
            await fetchPurchases(page, 20, filterStatus !== 'all' ? filterStatus : undefined);
        } else {
            setLoadingMore(true);
            await fetchPurchases(page, 20, filterStatus !== 'all' ? filterStatus : undefined);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPurchases(0);
        setRefreshing(false);
    }, [debouncedSearch, filterStatus]);

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1) {
            loadPurchases(currentPage + 1);
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

    const renderPurchase = ({ item }) => (
        <TouchableOpacity
            style={styles.purchaseCard}
            onPress={() => navigation.navigate('PurchaseDetail', { purchaseId: item.id })}
        >
            <View style={styles.purchaseHeader}>
                <View>
                    <Text style={styles.purchaseOrderNumber}>{item.purchaseOrderNumber}</Text>
                    <Text style={styles.supplierName}>{item.supplierName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Icon name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View style={styles.purchaseDetails}>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>Ordered: {formatDate(item.orderDate)}</Text>
                </View>
                {item.expectedDeliveryDate && (
                    <View style={styles.detailRow}>
                        <Icon name="truck-delivery" size={16} color={colors.gray[500]} />
                        <Text style={styles.detailText}>Expected: {formatDate(item.expectedDeliveryDate)}</Text>
                    </View>
                )}
                <View style={styles.detailRow}>
                    <Icon name="package" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.items?.length || 0} items</Text>
                </View>
            </View>

            <View style={styles.purchaseFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>{formatCurrency(item.totalAmount)}</Text>
                </View>
                <View style={styles.paymentStatus}>
                    <Icon
                        name={item.paymentStatus === 'PAID' ? 'check-circle' : 'clock-outline'}
                        size={16}
                        color={item.paymentStatus === 'PAID' ? colors.success : colors.warning}
                    />
                    <Text style={[styles.paymentText, { color: item.paymentStatus === 'PAID' ? colors.success : colors.warning }]}>
                        {item.paymentStatus}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search purchases..."
                    placeholderTextColor={colors.gray[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close" size={20} color={colors.gray[400]} />
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.filterContainer}>
                <Icon name="filter" size={20} color={colors.gray[500]} />
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={filterStatus}
                        onValueChange={(value) => setFilterStatus(value)}
                        dropdownIconColor={colors.gray[500]}
                        style={styles.picker}
                    >
                        {statusOptions.map((option) => (
                            <Picker.Item key={option.value} label={option.label} value={option.value} />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="clipboard-text-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Purchase Orders</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No purchases matching "${searchQuery}"`
                    : "Get started by creating your first purchase order"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('CreatePurchase')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Create Purchase Order</Text>
            </TouchableOpacity>
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
            {renderHeader()}

            <FlatList
                data={purchases}
                renderItem={renderPurchase}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={!loading ? renderEmptyState : null}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePurchase')}
            >
                <Icon name="plus" size={24} color={colors.background} />
            </TouchableOpacity>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        padding: 0,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickerContainer: {
        flex: 1,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    picker: {
        height: 44,
        color: colors.text.primary,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    purchaseCard: {
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
    purchaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    purchaseOrderNumber: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    supplierName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    purchaseDetails: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    purchaseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    totalValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    paymentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 4,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    addButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default PurchaseListScreen;