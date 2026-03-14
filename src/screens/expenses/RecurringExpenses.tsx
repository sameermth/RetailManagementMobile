import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useExpenses } from '@hooks/useExpenses';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';

const RecurringExpensesScreen = () => {
    const navigation = useNavigation();
    const {
        recurringExpenses,
        loading,
        fetchRecurringExpenses,
        createRecurringExpense,
    } = useExpenses();

    const [refreshing, setRefreshing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadRecurringExpenses();
    }, []);

    const loadRecurringExpenses = async () => {
        await fetchRecurringExpenses();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadRecurringExpenses();
        setRefreshing(false);
    };

    const getFrequencyIcon = (frequency: string) => {
        switch (frequency) {
            case 'DAILY': return 'calendar-today';
            case 'WEEKLY': return 'calendar-week';
            case 'MONTHLY': return 'calendar-month';
            case 'QUARTERLY': return 'calendar-clock';
            case 'YEARLY': return 'calendar';
            default: return 'calendar-repeat';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return colors.success;
            case 'PAUSED': return colors.warning;
            case 'COMPLETED': return colors.info;
            case 'CANCELLED': return colors.error;
            default: return colors.gray[500];
        }
    };

    const renderRecurringItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.recurringCard}
            onPress={() => {
                // Navigate to recurring expense detail/edit screen
            }}
        >
            <View style={styles.cardHeader}>
                <View style={styles.frequencyIcon}>
                    <Icon name={getFrequencyIcon(item.frequency)} size={24} color={colors.primary[500]} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.expenseDescription}>{item.description}</Text>
                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
            </View>

            <View style={styles.datesContainer}>
                <View style={styles.dateItem}>
                    <Icon name="calendar-start" size={14} color={colors.gray[500]} />
                    <Text style={styles.dateText}>Start: {formatDate(item.startDate)}</Text>
                </View>
                {item.endDate && (
                    <View style={styles.dateItem}>
                        <Icon name="calendar-end" size={14} color={colors.gray[500]} />
                        <Text style={styles.dateText}>End: {formatDate(item.endDate)}</Text>
                    </View>
                )}
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>
                        Occurrences: {item.occurrencesGenerated} / {item.occurrenceCount || '∞'}
                    </Text>
                    <Text style={styles.nextDate}>
                        Next: {item.nextGenerationDate ? formatDate(item.nextGenerationDate) : 'N/A'}
                    </Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: item.occurrenceCount
                                    ? `${(item.occurrencesGenerated / item.occurrenceCount) * 100}%`
                                    : '0%'
                            }
                        ]}
                    />
                </View>
            </View>

            {item.vendor && (
                <View style={styles.vendorInfo}>
                    <Icon name="store" size={14} color={colors.gray[500]} />
                    <Text style={styles.vendorText}>{item.vendor}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderAddForm = () => (
        <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add Recurring Expense</Text>
            <Text style={styles.formNote}>
                This feature is coming soon. You'll be able to set up recurring expenses like rent, salaries, etc.
            </Text>
            <TouchableOpacity
                style={styles.closeFormButton}
                onPress={() => setShowAddForm(false)}
            >
                <Text style={styles.closeFormButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="calendar-repeat" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Recurring Expenses</Text>
            <Text style={styles.emptyStateText}>
                Set up recurring expenses like rent, salaries, or monthly subscriptions
            </Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddForm(true)}
            >
                <Icon name="plus" size={20} color={colors.background} />
                <Text style={styles.addButtonText}>Add Recurring Expense</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>Recurring Expenses</Text>
                <Text style={styles.headerSubtitle}>
                    Manage your regular, repeating expenses
                </Text>
            </View>
            <TouchableOpacity
                style={styles.addIconButton}
                onPress={() => setShowAddForm(true)}
            >
                <Icon name="plus" size={24} color={colors.background} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            {showAddForm ? (
                renderAddForm()
            ) : (
                <FlatList
                    data={recurringExpenses}
                    renderItem={renderRecurringItem}
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
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
    addIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    recurringCard: {
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
        alignItems: 'center',
        marginBottom: 12,
    },
    frequencyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    categoryName: {
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
    amountContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    amountLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.error,
    },
    datesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    nextDate: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.gray[200],
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.success,
    },
    vendorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    vendorText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    addForm: {
        backgroundColor: colors.background,
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    formNote: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 20,
        lineHeight: 22,
    },
    closeFormButton: {
        backgroundColor: colors.primary[500],
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeFormButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
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
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default RecurringExpensesScreen;