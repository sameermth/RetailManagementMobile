import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

const BrandsScreen = () => {
    const navigation = useNavigation();
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API call
            setBrands([
                { id: 1, name: 'Nike', productCount: 45, logo: null },
                { id: 2, name: 'Apple', productCount: 32, logo: null },
                { id: 3, name: 'Samsung', productCount: 28, logo: null },
                { id: 4, name: 'Adidas', productCount: 38, logo: null },
                { id: 5, name: 'Sony', productCount: 21, logo: null },
            ]);
        } catch (error) {
            console.error('Failed to load brands', error);
        } finally {
            setLoading(false);
        }
    };

    const renderBrand = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.brandCard}>
            <View style={styles.brandLogo}>
                {item.logo ? (
                    <Image source={{ uri: item.logo }} style={styles.logoImage} />
                ) : (
                    <Icon name="trademark" size={32} color={colors.primary[500]} />
                )}
            </View>
            <View style={styles.brandInfo}>
                <Text style={styles.brandName}>{item.name}</Text>
                <Text style={styles.productCount}>{item.productCount} products</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Brands</Text>
            <Text style={styles.headerSubtitle}>
                Manage your product brands
            </Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="trademark" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Brands</Text>
            <Text style={styles.emptyStateText}>
                Brands will appear here once added
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={brands}
                renderItem={renderBrand}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
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
    brandCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    brandLogo: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    brandInfo: {
        flex: 1,
    },
    brandName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    productCount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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

export default BrandsScreen;