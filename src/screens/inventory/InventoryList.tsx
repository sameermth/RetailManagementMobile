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
import { useInventory } from '@hooks/useInventory';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';
import { Picker } from '@react-native-picker/picker';

const InventoryListScreen = () => {
    const navigation = useNavigation();
    const {
        inventory,
        warehouses,
        loading,
        error,
        fetchInventory,
        fetchWarehouses,
    } = useInventory();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadInventory();
        fetchWarehouses();
    }, []);

    useEffect(() => {
        loadInventory();
    }, [debouncedSearch, selectedWarehouse, filterType]);

    const loadInventory = async () => {
        const params: any = {};
        if (selectedWarehouse !== 'all') {
            params.warehouseId = selectedWarehouse;
        }
        if (filterType === 'low-stock') {
            // This would need a separate API call for low stock items
        } else if (filterType === 'out-of-stock') {
            // This would need a separate API call for out of stock items
        }
        await fetchInventory(params);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadInventory();
        setRefreshing(false);
    }, [selectedWarehouse, filterType]);

    const getStockStatus = (item: any) => {
        if (item.quantity <= 0) {
            return { label: 'Out of Stock', color: colors.error };
        } else if (item.quantity <= item.minimumStock) {
            return { label: 'Low Stock', color: colors.warning };
        } else {
            return { label: 'In Stock', color: colors.success };
        }
    };

    const renderInventoryItem = ({ item }: { item: any }) => {
        const status = getStockStatus(item);

        return (
            <TouchableOpacity
                style={styles.inventoryCard}
                onPress={() => navigation.navigate('AdjustStock', { productId: item.productId })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.productSku}>{item.productSku}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                </View>

                <View style={styles.warehouseInfo}>
                    <Icon name="warehouse" size={16} color={colors.gray[500]} />
                    <Text style={styles.warehouseName}>{item.warehouseName}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>On Hand</Text>
                        <Text style={styles.statValue}>{item.quantity}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Reserved</Text>
                        <Text style={styles.statValue}>{item.reservedQuantity || 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Available</Text>
                        <Text style={styles.statValue}>{item.availableQuantity || 0}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Min Stock</Text>
                        <Text style={styles.statValue}>{item.minimumStock || '-'}</Text>
                    </View>
                </View>

                {item.binLocation && (
                    <View style={styles.locationInfo}>
                        <Icon name="map-marker" size={14} color={colors.gray[400]} />
                        <Text style={styles.locationText}>Bin: {item.binLocation}</Text>
                    </View>
                )}

                {item.quantity <= item.minimumStock && (
                    <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={() => navigation.navigate('CreatePurchase', {
                            productId: item.productId,
                            suggestedQuantity: item.minimumStock * 2
                        })}
                    >
                        <Icon name="cart-plus" size={16} color={colors.background} />
                        <Text style={styles.reorderButtonText}>Reorder</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
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

            <View style={styles.filterRow}>
                <View style={styles.filterItem}>
                    <Icon name="warehouse" size={16} color={colors.gray[500]} />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedWarehouse}
                            onValueChange={(value) => setSelectedWarehouse(value)}
                            dropdownIconColor={colors.gray[500]}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Warehouses" value="all" />
                            {warehouses.map((w) => (
                                <Picker.Item key={w.id} label={w.name} value={w.id.toString()} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.filterItem}>
                    <Icon name="filter" size={16} color={colors.gray[500]} />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={filterType}
                            onValueChange={(value) => setFilterType(value)}
                            dropdownIconColor={colors.gray[500]}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Items" value="all" />
                            <Picker.Item label="Low Stock" value="low-stock" />
                            <Picker.Item label="Out of Stock" value="out-of-stock" />
                        </Picker>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="package-variant" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Inventory Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No items matching "${searchQuery}"`
                    : "Inventory will appear here once you add products"}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={inventory}
                renderItem={renderInventoryItem}
                keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
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
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        paddingHorizontal: 8,
        marginHorizontal: 4,
    },
    pickerContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    picker: {
        height: 40,
        color: colors.text.primary,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    inventoryCard: {
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
        marginBottom: 8,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    productSku: {
        fontSize: typography.fontSize.sm,
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
    },
    warehouseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    warehouseName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.gray[500],
        marginLeft: 4,
    },
    reorderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[500],
        paddingVertical: 8,
        borderRadius: 8,
    },
    reorderButtonText: {
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
        paddingHorizontal: 32,
    },
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default InventoryListScreen;