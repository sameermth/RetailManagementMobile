import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useInventory } from '@hooks/useInventory';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

const WarehousesScreen = () => {
    const navigation = useNavigation();
    const { warehouses, loading, fetchWarehouses } = useInventory();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadWarehouses();
    }, []);

    const loadWarehouses = async () => {
        await fetchWarehouses();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadWarehouses();
        setRefreshing(false);
    };

    const renderWarehouse = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.warehouseCard}>
            <View style={styles.warehouseHeader}>
                <View style={styles.warehouseIcon}>
                    <Icon name="warehouse" size={32} color={colors.primary[500]} />
                </View>
                <View style={styles.warehouseInfo}>
                    <Text style={styles.warehouseName}>{item.name}</Text>
                    <Text style={styles.warehouseCode}>Code: {item.code}</Text>
                </View>
                {item.isPrimary && (
                    <View style={styles.primaryBadge}>
                        <Text style={styles.primaryText}>Primary</Text>
                    </View>
                )}
            </View>

            <View style={styles.warehouseDetails}>
                <View style={styles.detailRow}>
                    <Icon name="map-marker" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                        {item.address || 'No address'} {item.city && `, ${item.city}`}
                    </Text>
                </View>
                {item.phone && (
                    <View style={styles.detailRow}>
                        <Icon name="phone" size={16} color={colors.gray[500]} />
                        <Text style={styles.detailText}>{item.phone}</Text>
                    </View>
                )}
                {item.manager && (
                    <View style={styles.detailRow}>
                        <Icon name="account-tie" size={16} color={colors.gray[500]} />
                        <Text style={styles.detailText}>Manager: {item.manager}</Text>
                    </View>
                )}
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{item.capacity || '-'}</Text>
                    <Text style={styles.statLabel}>Capacity</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{item.currentOccupancy || 0}</Text>
                    <Text style={styles.statLabel}>Occupied</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                        {item.capacity ? Math.round((item.currentOccupancy || 0) / item.capacity * 100) : 0}%
                    </Text>
                    <Text style={styles.statLabel}>Utilization</Text>
                </View>
            </View>

            <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? colors.success + '20' : colors.error + '20' }]}>
                    <Text style={[styles.statusText, { color: item.isActive ? colors.success : colors.error }]}>
                        {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Warehouses</Text>
            <Text style={styles.headerSubtitle}>
                Manage your storage locations
            </Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="warehouse" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Warehouses</Text>
            <Text style={styles.emptyStateText}>
                Warehouses will appear here once added
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={warehouses}
                renderItem={renderWarehouse}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
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
        padding: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    warehouseCard: {
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
    warehouseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    warehouseIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    warehouseInfo: {
        flex: 1,
    },
    warehouseName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    warehouseCode: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    primaryBadge: {
        backgroundColor: colors.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    primaryText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    warehouseDetails: {
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
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    statusContainer: {
        alignItems: 'flex-end',
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

export default WarehousesScreen;