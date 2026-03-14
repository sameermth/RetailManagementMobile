import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProducts } from '@hooks/useProducts';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';

const ProductDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params as { productId: number };
    const { getProduct, deleteProduct, activateProduct, deactivateProduct, loading } = useProducts();

    const [product, setProduct] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadProduct();
    }, []);

    const loadProduct = async () => {
        try {
            const data = await getProduct(productId);
            setProduct(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load product details');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProduct(productId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleStatus = async () => {
        try {
            if (product.isActive) {
                await deactivateProduct(productId);
            } else {
                await activateProduct(productId);
            }
            await loadProduct();
        } catch (error) {
            Alert.alert('Error', 'Failed to update product status');
        }
    };

    const InfoRow = ({ label, value, icon }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
                <Icon name={icon} size={20} color={colors.gray[500]} />
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <Text style={styles.valueText}>{value || '-'}</Text>
        </View>
    );

    if (loading && !product) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color={colors.error} />
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header Image Placeholder */}
            <View style={styles.imageContainer}>
                <View style={styles.imagePlaceholder}>
                    <Icon name="package" size={80} color={colors.gray[300]} />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: product.isActive ? colors.success : colors.error }]}>
                    <Text style={styles.statusText}>{product.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
            </View>

            {/* Product Info */}
            <View style={styles.content}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>

                {/* Pricing Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Pricing</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceItem}>
                            <Text style={styles.priceLabel}>Unit Price</Text>
                            <Text style={styles.priceValue}>{formatCurrency(product.unitPrice)}</Text>
                        </View>
                        <View style={styles.priceDivider} />
                        <View style={styles.priceItem}>
                            <Text style={styles.priceLabel}>Cost Price</Text>
                            <Text style={styles.priceValue}>{formatCurrency(product.costPrice || 0)}</Text>
                        </View>
                    </View>
                    <View style={styles.marginContainer}>
                        <Text style={styles.marginLabel}>
                            Margin: {((product.unitPrice - (product.costPrice || 0)) / product.unitPrice * 100).toFixed(1)}%
                        </Text>
                    </View>
                </View>

                {/* Stock Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Stock Information</Text>
                    <InfoRow label="Current Stock" value={product.stockQuantity?.toString() || '0'} icon="package" />
                    <InfoRow label="Reorder Level" value={product.reorderLevel?.toString() || '-'} icon="alert" />
                    <InfoRow label="Unit of Measure" value={product.unitOfMeasure || '-'} icon="scale" />
                </View>

                {/* Category & Brand */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Classification</Text>
                    <InfoRow label="Category" value={product.categoryName || '-'} icon="shape" />
                    <InfoRow label="Brand" value={product.brandName || '-'} icon="trademark" />
                    <InfoRow label="HSN Code" value={product.hsnCode || '-'} icon="barcode" />
                    <InfoRow label="GST Rate" value={product.gstRate ? `${product.gstRate}%` : '-'} icon="percent" />
                </View>

                {/* Additional Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Additional Information</Text>
                    <InfoRow label="Manufacturer" value={product.manufacturer || '-'} icon="factory" />
                    <InfoRow label="Country of Origin" value={product.countryOfOrigin || '-'} icon="earth" />
                    <InfoRow label="Created" value={formatDate(product.createdAt)} icon="clock" />
                    <InfoRow label="Last Updated" value={formatDate(product.updatedAt)} icon="update" />
                </View>

                {/* Description */}
                {product.description && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Description</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => navigation.navigate('EditProduct', { productId: product.id })}
                    >
                        <Icon name="pencil" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, product.isActive ? styles.deactivateButton : styles.activateButton]}
                        onPress={handleToggleStatus}
                    >
                        <Icon name={product.isActive ? 'close-circle' : 'check-circle'} size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>
                            {product.isActive ? 'Deactivate' : 'Activate'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDelete}
                    >
                        <Icon name="delete" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 12,
    },
    imageContainer: {
        position: 'relative',
        backgroundColor: colors.background,
        padding: 20,
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    content: {
        padding: 16,
    },
    productName: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    productSku: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    valueText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
    },
    priceItem: {
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    priceDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    marginContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    marginLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.success,
    },
    description: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: colors.primary[500],
    },
    activateButton: {
        backgroundColor: colors.success,
    },
    deactivateButton: {
        backgroundColor: colors.warning,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
});

export default ProductDetailScreen;