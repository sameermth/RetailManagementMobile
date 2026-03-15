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
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '@hooks/useProducts';
import { useCart } from '@hooks/useCart';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { useDebounce } from '@hooks/useDebounce';

const POSScreen = () => {
    const navigation = useNavigation();
    const { products, loading, fetchProducts } = useProducts();
    const { items, addItem, getCartSummary } = useCart();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const debouncedSearch = useDebounce(searchQuery, 500);

    const cartSummary = getCartSummary();

    useEffect(() => {
        loadProducts();
    }, [debouncedSearch, selectedCategory]);

    useEffect(() => {
        // Extract unique categories from products
        const uniqueCategories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
    }, [products]);

    const loadProducts = async () => {
        const params: any = { page: 0, size: 50 };
        if (debouncedSearch) params.q = debouncedSearch;
        if (selectedCategory) params.category = selectedCategory;
        await fetchProducts(0, 50, debouncedSearch);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    const handleAddToCart = (product: any) => {
        addItem(product, 1);
    };

    const renderProduct = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleAddToCart(item)}
            disabled={item.stockQuantity <= 0}
        >
            <View style={[styles.productImage, !item.imageUrl && styles.placeholderImage]}>
                {item.imageUrl ? (
                    <Text>Image</Text> // Replace with actual image component
                ) : (
                    <Icon name="package" size={32} color={colors.gray[400]} />
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productSku}>{item.sku}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.unitPrice)}</Text>
                <View style={styles.stockContainer}>
                    <Icon
                        name={item.stockQuantity > 0 ? 'check-circle' : 'close-circle'}
                        size={14}
                        color={item.stockQuantity > 0 ? colors.success : colors.error}
                    />
                    <Text style={[styles.stockText, item.stockQuantity <= 0 && styles.outOfStockText]}>
                        {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Cart Summary Bar */}
            <TouchableOpacity
                style={styles.cartBar}
                onPress={() => navigation.navigate('Cart')}
            >
                <View style={styles.cartInfo}>
                    <Icon name="cart" size={24} color={colors.background} />
                    <Text style={styles.cartCount}>{cartSummary.itemCount}</Text>
                </View>
                <View style={styles.cartTotal}>
                    <Text style={styles.cartTotalLabel}>Total:</Text>
                    <Text style={styles.cartTotalValue}>{formatCurrency(cartSummary.total)}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.background} />
            </TouchableOpacity>

            {/* Search Bar */}
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

            {/* Categories Scroll */}
            {categories.length > 0 && (
                <FlatList
                    horizontal
                    data={categories}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategory === item && styles.categoryChipTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Icon name="package-variant" size={64} color={colors.gray[300]} />
                            <Text style={styles.emptyStateTitle}>No Products Found</Text>
                            <Text style={styles.emptyStateText}>
                                {searchQuery
                                    ? `No products matching "${searchQuery}"`
                                    : 'No products available for sale'}
                            </Text>
                        </View>
                    ) : null
                }
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
    },
    cartBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary[500],
        padding: 12,
        margin: 12,
        borderRadius: 12,
    },
    cartInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartCount: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.background,
        marginLeft: 8,
        backgroundColor: colors.primary[700],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cartTotal: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartTotalLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.background + 'CC',
        marginRight: 4,
    },
    cartTotalValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.background,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 44,
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
    categoriesList: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    categoryChip: {
        backgroundColor: colors.gray[100],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: colors.primary[500],
    },
    categoryChipText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    categoryChipTextActive: {
        color: colors.background,
    },
    listContent: {
        padding: 8,
        flexGrow: 1,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
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
    productImage: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: colors.gray[100],
        borderRadius: 8,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        backgroundColor: colors.gray[100],
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    productSku: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
        marginBottom: 4,
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.success,
        marginLeft: 4,
    },
    outOfStockText: {
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
    },
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default POSScreen;