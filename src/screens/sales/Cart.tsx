// src/screens/sales/CartScreen.tsx
import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    SectionList,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';

const CartScreen = () => {
    const navigation = useNavigation();
    const {
        items,
        updateQuantity,
        removeItem,
        clearCart,
        getCartSummary,
        getItemsByType,
    } = useCart();

    const summary = getCartSummary();
    const groupedItems = getItemsByType();

    const handleUpdateQuantity = (item: any, change: number) => {
        if (item.trackingMethod === 'SERIAL') {
            // Serial items cannot change quantity
            Alert.alert('Info', 'Serial items can only be added or removed');
            return;
        }

        const newQty = item.quantity + change;
        if (newQty <= 0) {
            removeItem(item.id);
        } else {
            updateQuantity(item.id, newQty);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Cart Empty', 'Please add items to cart before checkout');
            return;
        }
        navigation.navigate('Checkout');
    };

    const renderSerialItem = ({ item }: { item: any }) => (
        <View style={[styles.cartItem, styles.serialItem]}>
            <View style={styles.itemHeader}>
                <View style={styles.trackingBadge}>
                    <Icon name="barcode" size={12} color={colors.primary[500]} />
                    <Text style={styles.trackingBadgeText}>SERIAL</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Icon name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemSku}>{item.product.sku}</Text>

                <View style={styles.serialInfo}>
                    <Icon name="barcode" size={14} color={colors.gray[500]} />
                    <Text style={styles.serialText}>SN: {item.serialNumber}</Text>
                </View>
            </View>

            <View style={styles.itemTotal}>
                <Text style={styles.totalLabel}>Price:</Text>
                <Text style={styles.totalValue}>{formatCurrency(item.product.unitPrice)}</Text>
            </View>
        </View>
    );

    const renderBatchItem = ({ item }: { item: any }) => (
        <View style={[styles.cartItem, styles.batchItem]}>
            <View style={styles.itemHeader}>
                <View style={[styles.trackingBadge, styles.batchBadge]}>
                    <Icon name="package" size={12} color={colors.info} />
                    <Text style={[styles.trackingBadgeText, styles.batchBadgeText]}>BATCH</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Icon name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemSku}>{item.product.sku}</Text>

                <View style={styles.batchInfo}>
                    <View style={styles.batchDetail}>
                        <Icon name="package-variant" size={14} color={colors.gray[500]} />
                        <Text style={styles.batchText}>Batch: {item.batchNumber}</Text>
                    </View>

                    {item.expiryDate && (
                        <View style={styles.batchDetail}>
                            <Icon name="calendar" size={14} color={colors.gray[500]} />
                            <Text style={styles.batchText}>
                                Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.quantityControl}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item, -1)}
                >
                    <Icon name="minus" size={16} color={colors.primary[500]} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item, 1)}
                >
                    <Icon name="plus" size={16} color={colors.primary[500]} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemTotal}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                    {formatCurrency(item.product.unitPrice * item.quantity)}
                </Text>
            </View>
        </View>
    );

    const renderRegularItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemHeader}>
                <View style={[styles.trackingBadge, styles.regularBadge]}>
                    <Text style={[styles.trackingBadgeText, styles.regularBadgeText]}>ITEM</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Icon name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemSku}>{item.product.sku}</Text>
            </View>

            <View style={styles.quantityControl}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item, -1)}
                >
                    <Icon name="minus" size={16} color={colors.primary[500]} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item, 1)}
                >
                    <Icon name="plus" size={16} color={colors.primary[500]} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemTotal}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                    {formatCurrency(item.product.unitPrice * item.quantity)}
                </Text>
            </View>
        </View>
    );

    const renderSectionHeader = ({ section }: { section: any }) => {
        if (section.data.length === 0) return null;

        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionCount}>{section.data.length} items</Text>
            </View>
        );
    };

    const sections = [
        {
            title: 'Serial Items',
            data: groupedItems.serial,
            renderItem: renderSerialItem,
        },
        {
            title: 'Batch Items',
            data: groupedItems.batch,
            renderItem: renderBatchItem,
        },
        {
            title: 'Regular Items',
            data: groupedItems.regular,
            renderItem: renderRegularItem,
        },
    ].filter(section => section.data.length > 0);

    const renderEmptyCart = () => (
        <View style={styles.emptyState}>
            <Icon name="cart-off" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyStateText}>
                Add products from the Create Sale screen to start a sale
            </Text>
            <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => navigation.navigate('POS')}
            >
                <Icon name="arrow-left" size={20} color={colors.background} />
                <Text style={styles.continueShoppingText}>Create Sale</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {items.length > 0 ? (
                <>
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        renderSectionHeader={renderSectionHeader}
                        contentContainerStyle={styles.listContent}
                        stickySectionHeadersEnabled={true}
                    />

                    <View style={styles.footer}>
                        {/* Summary */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(summary.subtotal)}</Text>
                            </View>

                            {summary.discount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Discount</Text>
                                    <Text style={[styles.summaryValue, styles.discountText]}>
                                        -{formatCurrency(summary.discount)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tax</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(summary.tax)}</Text>
                            </View>

                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalAmount}>{formatCurrency(summary.total)}</Text>
                            </View>

                            {/* Item Count Breakdown */}
                            <View style={styles.itemBreakdown}>
                                {summary.serialItemsCount > 0 && (
                                    <View style={styles.breakdownItem}>
                                        <View style={[styles.breakdownDot, { backgroundColor: colors.primary[500] }]} />
                                        <Text style={styles.breakdownText}>
                                            Serial: {summary.serialItemsCount}
                                        </Text>
                                    </View>
                                )}
                                {summary.batchItemsCount > 0 && (
                                    <View style={styles.breakdownItem}>
                                        <View style={[styles.breakdownDot, { backgroundColor: colors.info }]} />
                                        <Text style={styles.breakdownText}>
                                            Batch: {summary.batchItemsCount}
                                        </Text>
                                    </View>
                                )}
                                {summary.regularItemsCount > 0 && (
                                    <View style={styles.breakdownItem}>
                                        <View style={[styles.breakdownDot, { backgroundColor: colors.success }]} />
                                        <Text style={styles.breakdownText}>
                                            Regular: {summary.regularItemsCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.clearButton]}
                                onPress={() => {
                                    Alert.alert(
                                        'Clear Cart',
                                        'Are you sure you want to clear all items?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Clear', onPress: clearCart, style: 'destructive' }
                                        ]
                                    );
                                }}
                            >
                                <Icon name="cart-off" size={20} color={colors.error} />
                                <Text style={[styles.actionButtonText, styles.clearButtonText]}>
                                    Clear Cart
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.checkoutButton]}
                                onPress={handleCheckout}
                            >
                                <Icon name="cash" size={20} color={colors.background} />
                                <Text style={[styles.actionButtonText, styles.checkoutButtonText]}>
                                    Checkout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                renderEmptyCart()
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    listContent: {
        padding: 16,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    sectionCount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    cartItem: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    serialItem: {
        borderLeftWidth: 3,
        borderLeftColor: colors.primary[500],
    },
    batchItem: {
        borderLeftWidth: 3,
        borderLeftColor: colors.info,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    trackingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trackingBadgeText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 4,
    },
    batchBadge: {
        backgroundColor: colors.info + '20',
    },
    batchBadgeText: {
        color: colors.info,
    },
    regularBadge: {
        backgroundColor: colors.success + '20',
    },
    regularBadgeText: {
        color: colors.success,
    },
    itemInfo: {
        marginBottom: 12,
    },
    itemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    itemSku: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 6,
    },
    serialInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    serialText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 4,
    },
    batchInfo: {
        marginTop: 4,
    },
    batchDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    batchText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 4,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginHorizontal: 16,
        minWidth: 30,
        textAlign: 'center',
    },
    itemTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
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
    continueShoppingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    continueShoppingText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
        marginLeft: 8,
    },
    footer: {
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: 16,
    },
    summaryCard: {
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    summaryValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    discountText: {
        color: colors.success,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    totalAmount: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    itemBreakdown: {
        flexDirection: 'row',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    breakdownDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    breakdownText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    clearButton: {
        backgroundColor: colors.error + '10',
        borderWidth: 1,
        borderColor: colors.error,
    },
    clearButtonText: {
        color: colors.error,
        marginLeft: 8,
    },
    checkoutButton: {
        backgroundColor: colors.success,
    },
    checkoutButtonText: {
        color: colors.background,
        marginLeft: 8,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
});

export default CartScreen;