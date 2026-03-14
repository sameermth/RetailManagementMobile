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
import { useDistributors } from '@hooks/useDistributors';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatPhoneNumber } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';

const DistributorListScreen = () => {
    const navigation = useNavigation();
    const {
        distributors,
        loading,
        error,
        totalPages,
        currentPage,
        fetchDistributors,
    } = useDistributors();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterRegion, setFilterRegion] = useState<string>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadDistributors(0);
    }, [debouncedSearch, filterRegion]);

    const loadDistributors = async (page: number) => {
        if (page === 0) {
            await fetchDistributors(page, 20, debouncedSearch);
        } else {
            setLoadingMore(true);
            await fetchDistributors(page, 20, debouncedSearch);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDistributors(0);
        setRefreshing(false);
    }, [debouncedSearch, filterRegion]);

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1) {
            loadDistributors(currentPage + 1);
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

    const renderDistributor = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.distributorCard}
            onPress={() => navigation.navigate('DistributorDetail', { distributorId: item.id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.distributorInfo}>
                    <Text style={styles.distributorName}>{item.name}</Text>
                    <Text style={styles.distributorCode}>Code: {item.distributorCode}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.contactInfo}>
                {item.contactPerson && (
                    <View style={styles.infoRow}>
                        <Icon name="account-tie" size={14} color={colors.gray[500]} />
                        <Text style={styles.infoText}>{item.contactPerson}</Text>
                    </View>
                )}
                {item.phone && (
                    <View style={styles.infoRow}>
                        <Icon name="phone" size={14} color={colors.gray[500]} />
                        <Text style={styles.infoText}>{formatPhoneNumber(item.phone)}</Text>
                    </View>
                )}
                {item.region && (
                    <View style={styles.infoRow}>
                        <Icon name="map-marker" size={14} color={colors.gray[500]} />
                        <Text style={styles.infoText}>{item.region} {item.territory ? `- ${item.territory}` : ''}</Text>
                    </View>
                )}
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Commission</Text>
                    <Text style={styles.statValue}>{item.commissionRate || 0}%</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Outstanding</Text>
                    <Text style={[styles.statValue, { color: colors.warning }]}>
                        {formatCurrency(item.outstandingAmount || 0)}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Orders</Text>
                    <Text style={styles.statValue}>{item.totalOrders || 0}</Text>
                </View>
            </View>

            {item.minimumOrderValue && (
                <View style={styles.minOrder}>
                    <Text style={styles.minOrderText}>
                        Min Order: {formatCurrency(item.minimumOrderValue)}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search distributors..."
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
                    style={[styles.filterTab, filterRegion === 'all' && styles.filterTabActive]}
                    onPress={() => setFilterRegion('all')}
                >
                    <Text style={[styles.filterTabText, filterRegion === 'all' && styles.filterTabTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterRegion === 'north' && styles.filterTabActive]}
                    onPress={() => setFilterRegion('north')}
                >
                    <Text style={[styles.filterTabText, filterRegion === 'north' && styles.filterTabTextActive]}>
                        North
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterRegion === 'south' && styles.filterTabActive]}
                    onPress={() => setFilterRegion('south')}
                >
                    <Text style={[styles.filterTabText, filterRegion === 'south' && styles.filterTabTextActive]}>
                        South
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterRegion === 'east' && styles.filterTabActive]}
                    onPress={() => setFilterRegion('east')}
                >
                    <Text style={[styles.filterTabText, filterRegion === 'east' && styles.filterTabTextActive]}>
                        East
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filterRegion === 'west' && styles.filterTabActive]}
                    onPress={() => setFilterRegion('west')}
                >
                    <Text style={[styles.filterTabText, filterRegion === 'west' && styles.filterTabTextActive]}>
                        West
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="truck-delivery" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Distributors Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No distributors matching "${searchQuery}"`
                    : "Get started by adding your first distributor"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddDistributor')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add Distributor</Text>
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
                data={distributors}
                renderItem={renderDistributor}
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
                onPress={() => navigation.navigate('AddDistributor')}
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
    filterTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
        marginHorizontal: 2,
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
    distributorCard: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    distributorInfo: {
        flex: 1,
    },
    distributorName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    distributorCode: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    contactInfo: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    minOrder: {
        alignItems: 'flex-end',
    },
    minOrderText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.info,
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

export default DistributorListScreen;