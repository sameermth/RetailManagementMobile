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
import { useUsers } from '@hooks/useUsers';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { useDebounce } from '@hooks/useDebounce';

const UserListScreen = () => {
    const navigation = useNavigation();
    const {
        users,
        loading,
        error,
        totalPages,
        currentPage,
        fetchUsers,
    } = useUsers();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadUsers(0);
    }, [debouncedSearch, filterStatus]);

    const loadUsers = async (page: number) => {
        if (page === 0) {
            await fetchUsers(page, 20, debouncedSearch);
        } else {
            setLoadingMore(true);
            await fetchUsers(page, 20, debouncedSearch);
            setLoadingMore(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUsers(0);
        setRefreshing(false);
    }, [debouncedSearch, filterStatus]);

    const loadMore = () => {
        if (!loadingMore && currentPage < totalPages - 1) {
            loadUsers(currentPage + 1);
        }
    };

    const filteredUsers = users.filter(user => {
        if (filterStatus === 'all') return true;
        return filterStatus === 'active' ? user.active : !user.active;
    });

    const renderUser = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('UserDetail', { userId: item.id })}
        >
            <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {item.firstName?.charAt(0)}{item.lastName?.charAt(0)}
                    </Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.active ? colors.success + '20' : colors.error + '20' }]}>
                    <Text style={[styles.statusText, { color: item.active ? colors.success : colors.error }]}>
                        {item.active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>

            <View style={styles.userDetails}>
                <Text style={styles.userRole}>Username: {item.username}</Text>
                {item.roles && item.roles.length > 0 && (
                    <View style={styles.roleContainer}>
                        {item.roles.map((role: any) => (
                            <View key={role.id} style={styles.roleBadge}>
                                <Text style={styles.roleText}>{role.name.replace('ROLE_', '')}</Text>
                            </View>
                        ))}
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
                    placeholder="Search users..."
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
            <Icon name="account-group" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Users Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No users matching "${searchQuery}"`
                    : "Get started by creating your first user"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddUser')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add User</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
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
                onPress={() => navigation.navigate('AddUser')}
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
    userCard: {
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
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarContainer: {
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
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    userEmail: {
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
    userDetails: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    userRole: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    roleBadge: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    roleText: {
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

export default UserListScreen;