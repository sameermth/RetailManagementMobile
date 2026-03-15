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
import { useSuppliers } from '@hooks/useSuppliers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatPhoneNumber } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';

const SupplierListScreen = () => {
    const navigation = useNavigation();
    const {
        suppliers,
        loading,
        error,
        totalPages,
        currentPage,
        fetchSuppliers,
    } = useSuppliers();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadSuppliers(0);
    }, [debouncedSearch, filterStatus]);

    const loadSuppliers = async (page: number) => {
        const params: any = { page, size: 20 };
        if (filterStatus !== 'all') {
            params.status = filterStatus === 'active' ? 'ACTIVE' : 'INACTIVE';
        }

        if (page === 0) {
            await fetchSuppliers(page, 20, debouncedSearch);
        } else {
            setLoadingMore(true);
            await fetchSuppliers(page, 20, debouncedSearch);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadSuppliers(0);
        setRefreshing(false);
    }, [debouncedSearch, filterStatus]);

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1) {
            loadSuppliers(currentPage + 1);
        }
    };

    const renderSupplier = ({ item }) => (
        <TouchableOpacity
            style={styles.supplierCard}
            onPress={() => navigation.navigate('SupplierDetail', { supplierId: item.id })}
        >
            <View style={styles.supplierHeader}>
                <View style={styles.supplierAvatar}>
                    <Text style={styles.avatarText}>
                        {item.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <View style={styles.supplierInfo}>
                    <Text style={styles.supplierName}>{item.name}</Text>
                    <Text style={styles.supplierCode}>Code: {item.supplierCode}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? colors.success : colors.error }]}>
                    <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
            </View>

            <View style={styles.supplierDetails}>
                <View style={styles.detailRow}>
                    <Icon name="account-tie" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.contactPerson || 'No contact'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="phone" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                        {item.phone ? formatPhoneNumber(item.phone) : 'No phone'}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="email" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText} numberOfLines={1}>
                        {item.email || 'No email'}
                    </Text>
                </View>
                {item.outstandingAmount > 0 && (
                    <View style={styles.outstandingBadge}>
                        <Text style={styles.outstandingText}>
                            Outstanding: {formatCurrency(item.outstandingAmount)}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search suppliers..."
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
                    style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('all')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'all' && styles.filterTabTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterStatus === 'active' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('active')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'active' && styles.filterTabTextActive]}>
                        Active
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterStatus === 'inactive' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('inactive')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'inactive' && styles.filterTabTextActive]}>
                        Inactive
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="truck" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Suppliers Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No suppliers matching "${searchQuery}"`
                    : "Get started by adding your first supplier"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddSupplier')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add Supplier</Text>
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
                data={suppliers}
                renderItem={renderSupplier}
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
                onPress={() => navigation.navigate('AddSupplier')}
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
    supplierCard: {
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
    supplierHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    supplierAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    supplierInfo: {
        flex: 1,
    },
    supplierName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    supplierCode: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    supplierDetails: {
        marginTop: 8,
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
        flex: 1,
    },
    outstandingBadge: {
        backgroundColor: colors.warning + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    outstandingText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
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

export default SupplierListScreen;