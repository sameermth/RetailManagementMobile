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
import { formatCurrency } from '@utils/formatters';
import { BarChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';

const FinancialReportScreen = () => {
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
                revenue: 450000,
                expenses: 325000,
                grossProfit: 125000,
                profitMargin: 27.8,
                monthlyData: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    revenue: [65000, 72000, 78000, 82000, 88000, 95000],
                    expenses: [48000, 52000, 54000, 56000, 58000, 62000],
                },
                expenseBreakdown: [
                    { category: 'Salaries', amount: 120000 },
                    { category: 'Rent', amount: 45000 },
                    { category: 'Utilities', amount: 18000 },
                    { category: 'Marketing', amount: 35000 },
                    { category: 'Supplies', amount: 22000 },
                    { category: 'Other', amount: 25000 },
                ],
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
        barPercentage: 0.7,
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    const barData = {
        labels: reportData.monthlyData.labels,
        datasets: [
            {
                data: reportData.monthlyData.revenue,
                color: () => colors.success,
            },
            {
                data: reportData.monthlyData.expenses,
                color: () => colors.error,
            },
        ],
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Financial Report</Text>
                <View style={styles.headerRight} />
            </View>

            {/* P&L Summary */}
            <View style={styles.profitCard}>
                <Text style={styles.profitTitle}>Profit & Loss Summary</Text>

                <View style={styles.profitRow}>
                    <Text style={styles.profitLabel}>Revenue</Text>
                    <Text style={[styles.profitValue, { color: colors.success }]}>
                        {formatCurrency(reportData.revenue)}
                    </Text>
                </View>
                <View style={styles.profitRow}>
                    <Text style={styles.profitLabel}>Expenses</Text>
                    <Text style={[styles.profitValue, { color: colors.error }]}>
                        {formatCurrency(reportData.expenses)}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.profitRow}>
                    <Text style={styles.grossProfitLabel}>Gross Profit</Text>
                    <Text style={[styles.grossProfitValue, { color: reportData.grossProfit >= 0 ? colors.success : colors.error }]}>
                        {formatCurrency(reportData.grossProfit)}
                    </Text>
                </View>
                <View style={styles.profitRow}>
                    <Text style={styles.marginLabel}>Profit Margin</Text>
                    <Text style={[styles.marginValue, { color: reportData.profitMargin >= 0 ? colors.success : colors.error }]}>
                        {reportData.profitMargin}%
                    </Text>
                </View>
            </View>

            {/* Monthly Comparison Chart */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Monthly Revenue vs Expenses</Text>
                <BarChart
                    data={barData}
                    width={width - 48}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    fromZero
                    showValuesOnTopOfBars
                />
            </View>

            {/* Expense Breakdown */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Expense Breakdown</Text>
                {reportData.expenseBreakdown.map((item: any, index: number) => {
                    const percentage = (item.amount / reportData.expenses) * 100;
                    return (
                        <View key={index} style={styles.expenseRow}>
                            <View style={styles.expenseInfo}>
                                <Text style={styles.expenseCategory}>{item.category}</Text>
                                <Text style={styles.expensePercentage}>{percentage.toFixed(1)}%</Text>
                            </View>
                            <View style={styles.expenseBar}>
                                <View
                                    style={[
                                        styles.expenseFill,
                                        {
                                            width: `${percentage}%`,
                                            backgroundColor: index === 0 ? colors.primary[500] :
                                                index === 1 ? colors.success :
                                                    index === 2 ? colors.warning :
                                                        index === 3 ? colors.info : colors.secondary
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Key Metrics */}
            <View style={styles.metricsCard}>
                <Text style={styles.metricsTitle}>Key Metrics</Text>

                <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Operating Margin</Text>
                        <Text style={styles.metricValue}>24.5%</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Net Profit Ratio</Text>
                        <Text style={styles.metricValue}>18.2%</Text>
                    </View>
                </View>

                <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Current Ratio</Text>
                        <Text style={styles.metricValue}>2.4</Text>
                    </View>
                    <View style={styles.metricDivider} />
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Quick Ratio</Text>
                        <Text style={styles.metricValue}>1.8</Text>
                    </View>
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
    profitCard: {
        backgroundColor: colors.background,
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    profitTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    profitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    profitLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    profitValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    grossProfitLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    grossProfitValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
    },
    marginLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    marginValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
    },
    chartCard: {
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
        marginBottom: 16,
    },
    expenseRow: {
        marginBottom: 12,
    },
    expenseInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    expenseCategory: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    expensePercentage: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    expenseBar: {
        height: 8,
        backgroundColor: colors.gray[200],
        borderRadius: 4,
        marginBottom: 4,
        overflow: 'hidden',
    },
    expenseFill: {
        height: '100%',
        borderRadius: 4,
    },
    expenseAmount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        textAlign: 'right',
    },
    metricsCard: {
        backgroundColor: colors.background,
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    metricsTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    metricRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    metricDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: 12,
    },
});

export default FinancialReportScreen;