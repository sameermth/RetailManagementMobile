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
import { useExpenses } from '@hooks/useExpenses';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';
import { Picker } from '@react-native-picker/picker';

const ExpenseListScreen = () => {
    const navigation = useNavigation();
    const {
        expenses,
        categories,
        loading,
        fetchExpenses,
        fetchCategories,
    } = useExpenses();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadExpenses();
    }, [debouncedSearch, selectedCategory, selectedStatus]);

    const loadData = async () => {
        await fetchCategories();
        await loadExpenses();
    };

    const loadExpenses = async () => {
        const params: any = { page: 0, size: 20 };
        if (selectedCategory !== 'all') {
            params.categoryId = selectedCategory;
        }
        if (selectedStatus !== 'all') {
            params.status = selectedStatus;
        }
        if (debouncedSearch) {
            params.search = debouncedSearch;
        }
        await fetchExpenses(0, 20,
            selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
            selectedStatus !== 'all' ? selectedStatus : undefined
        );
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadExpenses();
        setRefreshing(false);
    }, [selectedCategory, selectedStatus, debouncedSearch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return colors.warning;
            case 'APPROVED': return colors.info;
            case 'PAID': return colors.success;
            case 'REJECTED': return colors.error;
            case 'CANCELLED': return colors.gray[500];
            default: return colors.gray[500];
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return 'clock-outline';
            case 'APPROVED': return 'check-circle-outline';
            case 'PAID': return 'cash-check';
            case 'REJECTED': return 'close-circle';
            case 'CANCELLED': return 'cancel';
            default: return 'help-circle';
        }
    };

    const renderExpense = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.expenseCard}
            onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
        >
            <View style={styles.expenseHeader}>
                <View>
                    <Text style={styles.expenseNumber}>{item.expenseNumber}</Text>
                    <Text style={styles.expenseDescription} numberOfLines={1}>
                        {item.description}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Icon name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View style={styles.expenseDetails}>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={14} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{formatDate(item.expenseDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="shape" size={14} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.categoryName}</Text>
                </View>
                {item.vendor && (
                    <View style={styles.detailRow}>
                        <Icon name="store" size={14} color={colors.gray[500]} />
                        <Text style={styles.detailText}>{item.vendor}</Text>
                    </View>
                )}
            </View>

            <View style={styles.expenseFooter}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search expenses..."
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
                    <Icon name="shape" size={16} color={colors.gray[500]} />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={(value) => setSelectedCategory(value)}
                            dropdownIconColor={colors.gray[500]}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Categories" value="all" />
                            {categories?.map((cat) => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.filterItem}>
                    <Icon name="flag" size={16} color={colors.gray[500]} />
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedStatus}
                            onValueChange={(value) => setSelectedStatus(value)}
                            dropdownIconColor={colors.gray[500]}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Status" value="all" />
                            <Picker.Item label="Pending Approval" value="PENDING_APPROVAL" />
                            <Picker.Item label="Approved" value="APPROVED" />
                            <Picker.Item label="Paid" value="PAID" />
                            <Picker.Item label="Rejected" value="REJECTED" />
                            <Picker.Item label="Cancelled" value="CANCELLED" />
                        </Picker>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Expenses Found</Text>
            <Text style={styles.emptyStateText}>
                {searchQuery
                    ? `No expenses matching "${searchQuery}"`
                    : "Get started by adding your first expense"}
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddExpense')}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={expenses}
                renderItem={renderExpense}
                keyExtractor={(item) => item.id.toString()}
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

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddExpense')}
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
    expenseCard: {
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
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    expenseNumber: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    expenseDescription: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        maxWidth: '80%',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        marginLeft: 4,
    },
    expenseDetails: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    expenseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    amountValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.error,
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
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default ExpenseListScreen;