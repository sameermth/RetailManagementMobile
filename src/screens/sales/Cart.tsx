import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { colors } from '@theme/colors';
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
    } = useCart();

    const summary = getCartSummary();

    const handleUpdateQuantity = (productId: number, currentQty: number, change: number) => {
        const newQty = currentQty + change;
        if (newQty <= 0) {
            removeItem(productId);
        } else {
            updateQuantity(productId, newQty);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Cart Empty', 'Please add items to cart before checkout');
            return;
        }
        navigation.navigate('Checkout');
    };

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemSku}>{item.product.sku}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.product.unitPrice)}</Text>
            </View>

            <View style={styles.quantityControl}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.product.id, item.quantity, -1)}
                >
                    <Icon name="minus" size={16} color={colors.primary[500]} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.product.id, item.quantity, 1)}
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

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.product.id)}
            >
                <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    const renderEmptyCart = () => (
        <View style={styles.emptyState}>
            <Icon name="cart-off" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyStateText}>
                Add products from the POS screen to start a sale
            </Text>
            <TouchableOpacity
                style={styles.continueShoppingButton}
                onPress={() => navigation.navigate('POS')}
            >
                <Icon name="arrow-left" size={20} color={colors.background} />
                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.product.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyCart}
            />

            {items.length > 0 && (
                <View style={styles.footer}>
                    {/* Summary */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(summary.subtotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Discount</Text>
                            <Text style={[styles.summaryValue, styles.discountText]}>
                                -{formatCurrency(summary.discount)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(summary.tax)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalAmount}>{formatCurrency(summary.total)}</Text>
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
        flexGrow: 1,
    },
    cartItem: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
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
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    totalValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 4,
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
});

export default CartScreen;