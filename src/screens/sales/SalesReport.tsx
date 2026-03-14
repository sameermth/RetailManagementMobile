import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';

const SalesReportScreen = () => {
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
                totalSales: 125000,
                totalOrders: 450,
                averageOrderValue: 277.78,
                salesByDay: [15000, 18000, 22000, 19000, 25000, 30000, 28000],
                topProducts: [
                    { name: 'Product A', sales: 45000 },
                    { name: 'Product B', sales: 38000 },
                    { name: 'Product C', sales: 32000 },
                    { name: 'Product D', sales: 28000 },
                    { name: 'Product E', sales: 22000 },
                ],
                paymentMethods: {
                    CASH: 45000,
                    CARD: 52000,
                    UPI: 28000,
                },
            });
        } catch (error) {
            console.error('Failed to load report data', error);
        } finally {
            setLoading(false);
        }
    };

    const chartConfig = {
        backgroundColor: colors.background,
        backgroundGradientFrom: colors.background,
        backgroundGradientTo: colors.background,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
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
                <Text style={styles.headerTitle}>Sales Report</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Date Range */}
            <View style={styles.dateRangeCard}>
                <Icon name="calendar-range" size={20} color={colors.primary[500]} />
                <Text style={styles.dateRangeText}>
                    {formatDate(new Date(new Date().setDate(1)))} - {formatDate(new Date())}
                </Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Sales</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(reportData.totalSales)}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Orders</Text>
                    <Text style={styles.summaryValue}>{reportData.totalOrders}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Avg. Order</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(reportData.averageOrderValue)}</Text>
                </View>
            </View>

            {/* Sales Trend Chart */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Sales Trend</Text>
                <LineChart
                    data={{
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            data: reportData.salesByDay,
                        }],
                    }}
                    width={width - 48}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                />
            </View>

            {/* Top Products */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Top Products</Text>
                {reportData.topProducts.map((product: any, index: number) => (
                    <View key={index} style={styles.productRow}>
                        <View style={styles.productRank}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productSales}>{formatCurrency(product.sales)}</Text>
                    </View>
                ))}
            </View>

            {/* Payment Methods */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>
                {Object.entries(reportData.paymentMethods).map(([method, amount], index) => (
                    <View key={index} style={styles.paymentRow}>
                        <Text style={styles.paymentMethod}>{method}</Text>
                        <View style={styles.paymentBar}>
                            <View
                                style={[
                                    styles.paymentFill,
                                    {
                                        width: `${(amount as number / reportData.totalSales) * 100}%`,
                                        backgroundColor: index === 0 ? colors.success : index === 1 ? colors.info : colors.warning
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.paymentAmount}>{formatCurrency(amount as number)}</Text>
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
    dateRangeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        margin: 16,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateRangeText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
    },
    summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 16,
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
    chart: {
        marginVertical: 8,
        borderRadius: 16,
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
    productSales: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.success,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    paymentMethod: {
        width: 80,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    paymentBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.gray[200],
        borderRadius: 4,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    paymentFill: {
        height: '100%',
        borderRadius: 4,
    },
    paymentAmount: {
        width: 80,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        textAlign: 'right',
    },
});

export default SalesReportScreen;