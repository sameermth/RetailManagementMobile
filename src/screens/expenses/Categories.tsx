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
import { useExpenses } from '@hooks/useExpenses';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';

const ExpenseCategoriesScreen = () => {
    const navigation = useNavigation();
    const { categories, loading, fetchCategories } = useExpenses();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        await fetchCategories();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCategories();
        setRefreshing(false);
    };

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'OPERATIONAL': return 'cog';
            case 'ADMINISTRATIVE': return 'account-tie';
            case 'MARKETING': return 'bullhorn';
            case 'UTILITY': return 'lightning-bolt';
            case 'SALARY': return 'cash-multiple';
            default: return 'shape';
        }
    };

    const getCategoryColor = (type: string) => {
        switch (type) {
            case 'OPERATIONAL': return colors.primary[500];
            case 'ADMINISTRATIVE': return colors.info;
            case 'MARKETING': return colors.secondary;
            case 'UTILITY': return colors.warning;
            case 'SALARY': return colors.success;
            default: return colors.gray[500];
        }
    };

    const renderCategory = ({ item }: { item: any }) => {
        const icon = getCategoryIcon(item.type);
        const color = getCategoryColor(item.type);
        const spent = item.allocatedAmount || 0;
        const budget = item.budgetAmount;
        const percentage = budget ? (spent / budget) * 100 : 0;

        return (
            <TouchableOpacity style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIcon, { backgroundColor: color + '20' }]}>
                        <Icon name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <Text style={styles.categoryType}>{item.type || 'General'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: item.isActive ? colors.success + '20' : colors.error + '20' }]}>
                        <Text style={[styles.statusText, { color: item.isActive ? colors.success : colors.error }]}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                {item.description ? (
                    <Text style={styles.categoryDescription}>{item.description}</Text>
                ) : null}

                <View style={styles.budgetContainer}>
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Budget</Text>
                        <Text style={styles.budgetValue}>{budget ? formatCurrency(budget) : 'No budget'}</Text>
                    </View>
                    <View style={styles.budgetRow}>
                        <Text style={styles.budgetLabel}>Spent</Text>
                        <Text style={[styles.budgetValue, { color: spent > (budget || 0) ? colors.error : colors.success }]}>
                            {formatCurrency(spent)}
                        </Text>
                    </View>
                </View>

                {budget && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(percentage, 100)}%`,
                                        backgroundColor: percentage > 100 ? colors.error : colors.success
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
                    </View>
                )}

                {item.parentCategoryName && (
                    <View style={styles.parentInfo}>
                        <Icon name="arrow-up" size={14} color={colors.gray[500]} />
                        <Text style={styles.parentText}>Parent: {item.parentCategoryName}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Expense Categories</Text>
            <Text style={styles.headerSubtitle}>
                Manage your expense categories and budgets
            </Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="shape" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Categories</Text>
            <Text style={styles.emptyStateText}>
                Expense categories will appear here
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                renderItem={renderCategory}
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
    categoryCard: {
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
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    categoryType: {
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
    categoryDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    budgetContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetRow: {
        flex: 1,
        alignItems: 'center',
    },
    budgetLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    budgetValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.gray[200],
        borderRadius: 3,
        marginRight: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    percentageText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        minWidth: 45,
    },
    parentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    parentText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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

export default ExpenseCategoriesScreen;