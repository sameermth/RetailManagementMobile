import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useReports } from '@hooks/useReports';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReportViewerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { reportType } = route.params as { reportType: string };
    const { width } = useWindowDimensions();

    const {
        loading,
        error,
        generateReport,
        downloadReport,
        getReportFormats,
    } = useReports();

    const [reportData, setReportData] = useState<any>(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)), // First day of current month
        endDate: new Date(),
    });
    const [selectedFormat, setSelectedFormat] = useState('preview');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [reportFormats, setReportFormats] = useState<string[]>(['PDF', 'EXCEL', 'CSV']);

    useEffect(() => {
        loadReportFormats();
    }, []);

    useEffect(() => {
        if (selectedFormat === 'preview') {
            generatePreview();
        }
    }, [dateRange, reportType]);

    const loadReportFormats = async () => {
        try {
            const formats = await getReportFormats(reportType);
            setReportFormats(['preview', ...formats]);
        } catch (error) {
            console.error('Failed to load report formats', error);
        }
    };

    const generatePreview = async () => {
        try {
            const data = await generateReport({
                reportType,
                startDate: dateRange.startDate.toISOString().split('T')[0],
                endDate: dateRange.endDate.toISOString().split('T')[0],
                format: 'json',
            });
            setReportData(data);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to generate report preview');
        }
    };

    const handleDownload = async () => {
        try {
            const reportBlob = await downloadReport({
                reportType,
                startDate: dateRange.startDate.toISOString().split('T')[0],
                endDate: dateRange.endDate.toISOString().split('T')[0],
                format: selectedFormat,
            });

            // Share the file
            await Share.share({
                title: `${reportType} Report`,
                url: reportBlob, // This would need proper file handling
            });
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to download report');
        }
    };

    const renderChart = () => {
        if (!reportData?.chartData) return null;

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

        switch (reportData.chartType) {
            case 'line':
                return (
                    <LineChart
                        data={reportData.chartData}
                        width={width - 64}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                );
            case 'bar':
                return (
                    <BarChart
                        data={reportData.chartData}
                        width={width - 64}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                );
            case 'pie':
                return (
                    <PieChart
                        data={reportData.pieData}
                        width={width - 64}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                    />
                );
            default:
                return null;
        }
    };

    const renderSalesReport = () => (
        <View>
            {/* Summary Cards */}
            <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Sales</Text>
                    <Text style={styles.summaryValue}>
                        {formatCurrency(reportData?.totalSales || 0)}
                    </Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Orders</Text>
                    <Text style={styles.summaryValue}>
                        {reportData?.totalOrders || 0}
                    </Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Avg. Order</Text>
                    <Text style={styles.summaryValue}>
                        {formatCurrency(reportData?.averageOrderValue || 0)}
                    </Text>
                </View>
            </View>

            {/* Chart */}
            {renderChart()}

            {/* Payment Methods Breakdown */}
            {reportData?.paymentMethods && (
                <View style={styles.tableContainer}>
                    <Text style={styles.tableTitle}>Payment Methods</Text>
                    {Object.entries(reportData.paymentMethods).map(([method, amount]) => (
                        <View key={method} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{method}</Text>
                            <Text style={styles.tableCellValue}>{formatCurrency(amount as number)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderInventoryReport = () => (
        <View>
            {/* Summary Stats */}
            <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total Products</Text>
                    <Text style={styles.summaryValue}>{reportData?.totalProducts || 0}</Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Low Stock</Text>
                    <Text style={[styles.summaryValue, { color: colors.warning }]}>
                        {reportData?.lowStockCount || 0}
                    </Text>
                </View>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Out of Stock</Text>
                    <Text style={[styles.summaryValue, { color: colors.error }]}>
                        {reportData?.outOfStockCount || 0}
                    </Text>
                </View>
            </View>

            {/* Inventory Value */}
            <View style={styles.valueCard}>
                <Text style={styles.valueLabel}>Total Inventory Value</Text>
                <Text style={styles.valueAmount}>{formatCurrency(reportData?.totalValue || 0)}</Text>
            </View>

            {/* Stock by Category */}
            {reportData?.stockByCategory && (
                <View style={styles.tableContainer}>
                    <Text style={styles.tableTitle}>Stock by Category</Text>
                    {reportData.stockByCategory.map((item: any) => (
                        <View key={item.category} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.category}</Text>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${item.percentage}%`, backgroundColor: colors.primary[500] }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.tableCellValue}>{item.count}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderProfitLossReport = () => (
        <View>
            {/* Revenue vs Expenses */}
            <View style={styles.comparisonCards}>
                <View style={[styles.comparisonCard, { backgroundColor: colors.success + '10' }]}>
                    <Icon name="arrow-up" size={24} color={colors.success} />
                    <Text style={styles.comparisonLabel}>Revenue</Text>
                    <Text style={[styles.comparisonValue, { color: colors.success }]}>
                        {formatCurrency(reportData?.revenue || 0)}
                    </Text>
                </View>
                <View style={[styles.comparisonCard, { backgroundColor: colors.error + '10' }]}>
                    <Icon name="arrow-down" size={24} color={colors.error} />
                    <Text style={styles.comparisonLabel}>Expenses</Text>
                    <Text style={[styles.comparisonValue, { color: colors.error }]}>
                        {formatCurrency(reportData?.expenses || 0)}
                    </Text>
                </View>
            </View>

            {/* Gross Profit */}
            <View style={styles.profitCard}>
                <Text style={styles.profitLabel}>Gross Profit</Text>
                <Text style={[
                    styles.profitValue,
                    { color: (reportData?.grossProfit || 0) >= 0 ? colors.success : colors.error }
                ]}>
                    {formatCurrency(reportData?.grossProfit || 0)}
                </Text>
                <Text style={styles.marginText}>
                    Margin: {reportData?.profitMargin?.toFixed(1)}%
                </Text>
            </View>

            {/* Expense Breakdown */}
            {reportData?.expensesByCategory && (
                <View style={styles.tableContainer}>
                    <Text style={styles.tableTitle}>Expense Breakdown</Text>
                    {reportData.expensesByCategory.map((item: any) => (
                        <View key={item.category} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.category}</Text>
                            <View style={styles.percentageRow}>
                                <Text style={styles.percentageText}>{item.percentage.toFixed(1)}%</Text>
                                <Text style={styles.tableCellValue}>{formatCurrency(item.amount)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderReportContent = () => {
        if (reportType.includes('sales')) return renderSalesReport();
        if (reportType.includes('inventory')) return renderInventoryReport();
        if (reportType.includes('profit') || reportType.includes('financial')) return renderProfitLossReport();

        // Default table view for other reports
        return (
            <ScrollView horizontal>
                <View>
                    {reportData?.headers && (
                        <View style={styles.dataHeader}>
                            {reportData.headers.map((header: string, index: number) => (
                                <Text key={index} style={styles.headerCell}>{header}</Text>
                            ))}
                        </View>
                    )}
                    {reportData?.rows?.map((row: any[], rowIndex: number) => (
                        <View key={rowIndex} style={styles.dataRow}>
                            {row.map((cell, cellIndex) => (
                                <Text key={cellIndex} style={styles.dataCell}>{cell}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{reportType.replace(/-/g, ' ').toUpperCase()}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
                        <Icon name="download" size={24} color={colors.primary[500]} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton}>
                        <Icon name="share" size={24} color={colors.primary[500]} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date Range Selector */}
            <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                >
                    <Text style={styles.dateLabel}>From</Text>
                    <Text style={styles.dateValue}>{formatDate(dateRange.startDate)}</Text>
                </TouchableOpacity>

                <Icon name="arrow-right" size={20} color={colors.gray[400]} />

                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                >
                    <Text style={styles.dateLabel}>To</Text>
                    <Text style={styles.dateValue}>{formatDate(dateRange.endDate)}</Text>
                </TouchableOpacity>

                <View style={styles.formatPicker}>
                    <Picker
                        selectedValue={selectedFormat}
                        onValueChange={(value) => setSelectedFormat(value)}
                        style={styles.picker}
                    >
                        {reportFormats.map((format) => (
                            <Picker.Item
                                key={format}
                                label={format.charAt(0).toUpperCase() + format.slice(1).toLowerCase()}
                                value={format}
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* Report Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={48} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {renderReportContent()}
                </ScrollView>
            )}

            {/* Date Pickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={dateRange.startDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) {
                            setDateRange({ ...dateRange, startDate: selectedDate });
                        }
                    }}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={dateRange.endDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                        setShowEndPicker(false);
                        if (selectedDate) {
                            setDateRange({ ...dateRange, endDate: selectedDate });
                        }
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
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
        flex: 1,
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerButton: {
        padding: 8,
        marginLeft: 8,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 12,
        margin: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dateButton: {
        flex: 1,
        padding: 8,
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
    formatPicker: {
        width: 100,
        marginLeft: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 40,
        color: colors.text.primary,
    },
    content: {
        flex: 1,
        padding: 16,
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
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        textAlign: 'center',
        marginTop: 12,
    },
    summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        marginHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
    chart: {
        marginVertical: 20,
        borderRadius: 16,
    },
    tableContainer: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    tableTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableCell: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    tableCellValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    dataHeader: {
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    headerCell: {
        minWidth: 100,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    dataRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dataCell: {
        minWidth: 100,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    valueCard: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    valueLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    valueAmount: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.gray[200],
        borderRadius: 4,
        marginRight: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    percentageRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginRight: 12,
    },
    comparisonCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    comparisonCard: {
        flex: 1,
        padding: 20,
        marginHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
    },
    comparisonLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginVertical: 8,
    },
    comparisonValue: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
    },
    profitCard: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    profitLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    profitValue: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        marginBottom: 4,
    },
    marginText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
});

export default ReportViewerScreen;