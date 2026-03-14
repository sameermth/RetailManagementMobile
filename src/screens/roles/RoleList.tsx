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
import { useRoles } from '@hooks/useRoles';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { useDebounce } from '@hooks/useDebounce';

const RoleListScreen = () => {
    const navigation = useNavigation();
    const {
        roles,
        loading,
        error,
        totalPages,
        currentPage,
        fetchRoles,
    } = useRoles();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadRoles(0);
    }, [debouncedSearch]);

    const loadRoles = async (page: number) => {
        if (page === 0) {
            await fetchRoles(page, 20, debouncedSearch);
        } else {
            setLoadingMore(true);
            await fetchRoles(page, 20, debouncedSearch);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRoles(0);
        setRefreshing(false);
    }, [debouncedSearch]);

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1) {
            loadRoles(currentPage + 1);
        }
    };

    const renderRole = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.roleCard}
            onPress={() => navigation.navigate('RoleDetail', { roleId: item.id })}
        >
            <View style={styles.roleHeader}>
                <View style={styles.roleIcon}>
                    <Icon name="shield-account" size={24} color={colors.primary[500]} />
                </View>
                <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>{item.name}</Text>
                    {item.description && (
                        <Text style={styles.roleDescription} numberOfLines={1}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View style={styles.userCountBadge}>
                    <Text style={styles.userCountText}>{item.userCount || 0} users</Text>
                </View>
            </View>

            <View style={styles.permissionPreview}>
                {item.permissions && item.permissions.slice(0, 3).map((perm: any) => (
                    <View key={perm.id} style={styles.permissionChip}>
                        <Text style={styles.permissionChipText}>{perm.name}</Text>
                    </View>
                ))}
                {item.permissions && item.permissions.length > 3 && (
                    <View style={styles.permissionChip}>
                        <Text style={styles.permissionChipText}>+{item.permissions.length - 3}</Text>
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
                    placeholder="Search roles..."
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

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{roles.length}</Text>
                    <Text style={styles.statLabel}>Total Roles</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                        {roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Users</Text>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="shield-off" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Roles Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No roles matching "${searchQuery}"`
                    : "Create your first role to manage permissions"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddRole')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Create Role</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={roles}
                renderItem={renderRole}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator size="small" color={colors.primary[500]} />
                        </View>
                    ) : null
                }
                ListEmptyComponent={!loading ? renderEmptyState : null}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddRole')}
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
        marginBottom: 16,
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
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.primary[50],
        borderRadius: 8,
        padding: 12,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
        marginBottom: 2,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.primary[200],
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    roleCard: {
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
    roleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    roleIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    roleInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    roleDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    userCountBadge: {
        backgroundColor: colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    userCountText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    permissionPreview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    permissionChip: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    permissionChipText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
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

export default RoleListScreen;