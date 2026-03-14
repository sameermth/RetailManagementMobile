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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useCustomers } from '@hooks/useCustomers';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatPhoneNumber } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';

const CustomerListScreen = () => {
    const navigation = useNavigation();
    const {
        customers,
        loading,
        error,
        totalPages,
        currentPage,
        fetchCustomers,
    } = useCustomers();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'with-due'>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadCustomers(0);
    }, [debouncedSearch, filterType]);

    const loadCustomers = async (page: number) => {
        if (filterType === 'with-due') {
            // Handle special case for customers with due
            setLoadingMore(true);
            const dueCustomers = await getCustomersWithDue();
            // You'd need to handle this specially
            setLoadingMore(false);
        } else {
            if (page === 0) {
                await fetchCustomers(page, 20, debouncedSearch);
            } else {
                setLoadingMore(true);
                await fetchCustomers(page, 20, debouncedSearch);
                setLoadingMore(false);
            }
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadCustomers(0);
        setRefreshing(false);
    }, [debouncedSearch, filterType]);

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1 && filterType === 'all') {
            loadCustomers(currentPage + 1);
        }
    };

    const renderCustomer = ({ item }) => (
        <TouchableOpacity
            style={styles.customerCard}
            onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
        >
            <View style={styles.customerAvatar}>
                <Text style={styles.avatarText}>
                    {item.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                </Text>
            </View>
            <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerContact}>
                    {item.phone ? formatPhoneNumber(item.phone) : 'No phone'}
                </Text>
                <View style={styles.customerDetails}>
                    {item.totalDueAmount > 0 && (
                        <View style={styles.dueBadge}>
                            <Text style={styles.dueText}>Due: {formatCurrency(item.totalDueAmount)}</Text>
                        </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: item.isActive ? colors.success + '20' : colors.error + '20' }]}>
                        <Text style={[styles.statusText, { color: item.isActive ? colors.success : colors.error }]}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>
            </View>
            <Icon name="chevron-right" size={24} color={colors.gray[400]} />
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search customers..."
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

            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
                    onPress={() => setFilterType('all')}
                >
                    <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>
                        All Customers
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterType === 'with-due' && styles.filterTabActive]}
                    onPress={() => setFilterType('with-due')}
                >
                    <Text style={[styles.filterTabText, filterType === 'with-due' && styles.filterTabTextActive]}>
                        With Due
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="account-group" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Customers Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No customers matching "${searchQuery}"`
                    : filterType === 'with-due'
                        ? 'No customers with pending dues'
                        : "Get started by adding your first customer"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddCustomer')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add Customer</Text>
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
                data={customers}
                renderItem={renderCustomer}
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
                onPress={() => navigation.navigate('AddCustomer')}
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
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        margin: 16,
        paddingHorizontal: 12,
        height: 44,
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
    filterTabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    filterTabActive: {
        backgroundColor: colors.primary[50],
    },
    filterTabText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    filterTabTextActive: {
        color: colors.primary[500],
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    customerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    customerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    customerContact: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 6,
    },
    customerDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueBadge: {
        backgroundColor: colors.warning + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    dueText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
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

export default CustomerListScreen;