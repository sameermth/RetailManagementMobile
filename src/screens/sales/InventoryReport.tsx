import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { PieChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';

const InventoryReportScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        setLoading(true);
        try {
            // Mock data - replace with actual API call
            setReportData({
                totalProducts: 1250,
                totalValue: 875000,
                lowStockCount: 23,
                outOfStockCount: 5,
                stockByCategory: [
                    { name: 'Electronics', count: 450, value: 450000 },
                    { name: 'Clothing', count: 380, value: 190000 },
                    { name: 'Food', count: 220, value: 110000 },
                    { name: 'Furniture', count: 120, value: 85000 },
                    { name: 'Other', count: 80, value: 40000 },
                ],
                topMovingProducts: [
                    { name: 'Product A', quantity: 150 },
                    { name: 'Product B', quantity: 135 },
                    { name: 'Product C', quantity: 120 },
                    { name: 'Product D', quantity: 98 },
                    { name: 'Product E', quantity: 85 },
                ],
            });
        } catch (error) {
            console.error('Failed to load report data', error);
        } finally {
            setLoading(false);
        }
    };

    const pieData = reportData?.stockByCategory.map((item: any, index: number) => ({
        name: item.name,
        population: item.value,
        color: index === 0 ? colors.primary[500] :
            index === 1 ? colors.success :
                index === 2 ? colors.warning :
                    index === 3 ? colors.info : colors.secondary,
        legendFontColor: colors.text.primary,
        legendFontSize: 12,
    })) || [];

    const chartConfig = {
        backgroundColor: colors.background,
        backgroundGradientFrom: colors.background,
        backgroundGradientTo: colors.background,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Inventory Report</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Products</Text>
                    <Text style={styles.summaryValue}>{reportData.totalProducts}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Value</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(reportData.totalValue)}</Text>
                </View>
            </View>

            <View style={styles.alertCards}>
                <View style={[styles.alertCard, { backgroundColor: colors.warning + '10' }]}>
                    <Icon name="alert" size={24} color={colors.warning} />
                    <Text style={styles.alertLabel}>Low Stock</Text>
                    <Text style={[styles.alertValue, { color: colors.warning }]}>
                        {reportData.lowStockCount}
                    </Text>
                </View>
                <View style={[styles.alertCard, { backgroundColor: colors.error + '10' }]}>
                    <Icon name="alert-circle" size={24} color={colors.error} />
                    <Text style={styles.alertLabel}>Out of Stock</Text>
                    <Text style={[styles.alertValue, { color: colors.error }]}>
                        {reportData.outOfStockCount}
                    </Text>
                </View>
            </View>

            {/* Inventory Distribution */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Inventory Value by Category</Text>
                <PieChart
                    data={pieData}
                    width={width - 48}
                    height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </View>

            {/* Category Breakdown */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Category Breakdown</Text>
                {reportData.stockByCategory.map((category: any, index: number) => (
                    <View key={index} style={styles.categoryRow}>
                        <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryCount}>{category.count} items</Text>
                        </View>
                        <Text style={styles.categoryValue}>{formatCurrency(category.value)}</Text>
                    </View>
                ))}
            </View>

            {/* Top Moving Products */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Top Moving Products</Text>
                {reportData.topMovingProducts.map((product: any, index: number) => (
                    <View key={index} style={styles.productRow}>
                        <View style={styles.productRank}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productQuantity}>{product.quantity} sold</Text>
                    </View>
                ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    headerRight: {
        width: 32,
    },
    summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        marginHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    alertCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginVertical: 12,
    },
    alertCard: {
        flex: 1,
        padding: 16,
        marginHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    alertLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
        flex: 1,
    },
    alertValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
    },
    chartCard: {
        backgroundColor: colors.background,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    chartTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    sectionCard: {
        backgroundColor: colors.background,
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    categoryCount: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    categoryValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.success,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    productRank: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    productName: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    productQuantity: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.info,
    },
});

export default InventoryReportScreen;