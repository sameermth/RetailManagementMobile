import React, { useState, useEffect } from 'react';
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
import { useInventory } from '@hooks/useInventory';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDateTime } from '@utils/formatters';
import DateTimePicker from '@react-native-community/datetimepicker';

const StockMovementsScreen = () => {
    const navigation = useNavigation();
    const {
        stockMovements,
        loading,
        fetchStockMovements,
        fetchStockMovementsByDate,
    } = useInventory();

    const [refreshing, setRefreshing] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('all');

    useEffect(() => {
        loadMovements();
    }, []);

    const loadMovements = async () => {
        await fetchStockMovements();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMovements();
        setRefreshing(false);
    };

    const filterByDate = async () => {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        await fetchStockMovementsByDate(start, end);
    };

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'PURCHASE_RECEIVED': return 'package-down';
            case 'SALES_ISSUED': return 'cart';
            case 'TRANSFER_OUT': return 'truck-outline';
            case 'TRANSFER_IN': return 'truck-check';
            case 'ADJUSTMENT_ADD': return 'plus-circle';
            case 'ADJUSTMENT_REMOVE': return 'minus-circle';
            default: return 'swap-horizontal';
        }
    };

    const getMovementColor = (type: string) => {
        switch (type) {
            case 'PURCHASE_RECEIVED':
            case 'TRANSFER_IN':
            case 'ADJUSTMENT_ADD':
                return colors.success;
            case 'SALES_ISSUED':
            case 'TRANSFER_OUT':
            case 'ADJUSTMENT_REMOVE':
                return colors.warning;
            default:
                return colors.info;
        }
    };

    const renderMovement = ({ item }: { item: any }) => {
        const icon = getMovementIcon(item.movementType);
        const color = getMovementColor(item.movementType);
        const isIncrease = ['PURCHASE_RECEIVED', 'TRANSFER_IN', 'ADJUSTMENT_ADD'].includes(item.movementType);

        return (
            <View style={styles.movementCard}>
                <View style={styles.movementHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Icon name={icon} size={24} color={color} />
                    </View>
                    <View style={styles.movementInfo}>
                        <Text style={styles.movementType}>{item.movementType.replace(/_/g, ' ')}</Text>
                        <Text style={styles.movementRef}>Ref: {item.referenceNumber}</Text>
                    </View>
                    <View style={[styles.quantityBadge, { backgroundColor: isIncrease ? colors.success + '10' : colors.warning + '10' }]}>
                        <Text style={[styles.quantityText, { color: isIncrease ? colors.success : colors.warning }]}>
                            {isIncrease ? '+' : '-'}{item.quantity}
                        </Text>
                    </View>
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.productSku}>{item.productSku}</Text>
                </View>

                <View style={styles.movementDetails}>
                    <View style={styles.detailRow}>
                        <Icon name="calendar" size={14} color={colors.gray[500]} />
                        <Text style={styles.detailText}>{formatDateTime(item.movementDate)}</Text>
                    </View>

                    {item.fromWarehouse && (
                        <View style={styles.detailRow}>
                            <Icon name="arrow-up-bold" size={14} color={colors.error} />
                            <Text style={styles.detailText}>From: {item.fromWarehouse}</Text>
                        </View>
                    )}

                    {item.toWarehouse && (
                        <View style={styles.detailRow}>
                            <Icon name="arrow-down-bold" size={14} color={colors.success} />
                            <Text style={styles.detailText}>To: {item.toWarehouse}</Text>
                        </View>
                    )}

                    {item.reason && (
                        <View style={styles.detailRow}>
                            <Icon name="note" size={14} color={colors.gray[500]} />
                            <Text style={styles.detailText}>Reason: {item.reason}</Text>
                        </View>
                    )}

                    <View style={styles.stockInfo}>
                        <Text style={styles.stockChange}>
                            Stock: {item.previousStock || 0} → {item.newStock || 0}
                        </Text>
                    </View>
                </View>

                {item.unitCost && (
                    <View style={styles.costInfo}>
                        <Text style={styles.costLabel}>Unit Cost:</Text>
                        <Text style={styles.costValue}>{formatCurrency(item.unitCost)}</Text>
                        <Text style={styles.costLabel}>Total:</Text>
                        <Text style={styles.costValue}>{formatCurrency(item.totalCost)}</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Movements</Text>

            <View style={styles.dateFilter}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                >
                    <Text style={styles.dateLabel}>From:</Text>
                    <Text style={styles.dateValue}>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                >
                    <Text style={styles.dateLabel}>To:</Text>
                    <Text style={styles.dateValue}>{endDate.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applyButton} onPress={filterByDate}>
                    <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                    }}
                />
            )}
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="swap-horizontal" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Stock Movements</Text>
            <Text style={styles.emptyStateText}>
                Stock movements will appear here when inventory changes
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={stockMovements}
                renderItem={renderMovement}
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
        backgroundColor: colors.background,
        padding: 16,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    dateFilter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 10,
        marginRight: 8,
    },
    dateLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    dateValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    applyButton: {
        backgroundColor: colors.primary[500],
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    applyButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    movementCard: {
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
    movementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    movementInfo: {
        flex: 1,
    },
    movementType: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
        textTransform: 'capitalize',
    },
    movementRef: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    quantityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    quantityText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
    },
    productInfo: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    productName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    productSku: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    movementDetails: {
        marginBottom: 12,
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
        marginLeft: 6,
        flex: 1,
    },
    stockInfo: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    stockChange: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    costInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    costLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginRight: 4,
    },
    costValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginRight: 12,
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

export default StockMovementsScreen;