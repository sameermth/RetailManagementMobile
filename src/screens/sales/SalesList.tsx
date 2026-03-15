import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useSales } from '@hooks/useSales';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';

const SalesListScreen = () => {
    const navigation = useNavigation();
    const { sales, loading, fetchSales } = useSales();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        await fetchSales(0, 50);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSales();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return colors.success;
            case 'PENDING': return colors.warning;
            case 'CANCELLED': return colors.error;
            default: return colors.gray[500];
        }
    };

    const renderSale = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.saleCard}
            onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
        >
            <View style={styles.saleHeader}>
                <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.customerInfo}>
                <Icon name="account" size={14} color={colors.gray[500]} />
                <Text style={styles.customerName}>{item.customerName || 'Walk-in Customer'}</Text>
            </View>

            <View style={styles.saleDetails}>
                <View style={styles.detailRow}>
                    <Icon name="calendar" size={14} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{formatDate(item.saleDate)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Icon name="package" size={14} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.items?.length || 0} items</Text>
                </View>
            </View>

            <View style={styles.saleFooter}>
                <Text style={styles.amountLabel}>Total</Text>
                <Text style={styles.amountValue}>{formatCurrency(item.totalAmount)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sales}
                renderItem={renderSale}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    listContent: {
        padding: 16,
    },
    saleCard: {
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
    saleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    invoiceNumber: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
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
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 6,
    },
    saleDetails: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 4,
    },
    saleFooter: {
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
        color: colors.success,
    },
});

export default SalesListScreen;