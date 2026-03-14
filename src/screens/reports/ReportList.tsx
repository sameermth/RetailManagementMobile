import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

const ReportListScreen = () => {
    const navigation = useNavigation();

    const reportCategories = [
        {
            title: 'Sales Reports',
            icon: 'chart-line',
            color: colors.success,
            reports: [
                { id: 'sales-summary', name: 'Sales Summary', icon: 'chart-line' },
                { id: 'sales-by-product', name: 'Sales by Product', icon: 'package' },
                { id: 'sales-by-category', name: 'Sales by Category', icon: 'shape' },
                { id: 'sales-by-customer', name: 'Sales by Customer', icon: 'account-group' },
                { id: 'top-products', name: 'Top Products', icon: 'trophy' },
            ],
        },
        {
            title: 'Inventory Reports',
            icon: 'package-variant',
            color: colors.info,
            reports: [
                { id: 'inventory-summary', name: 'Inventory Summary', icon: 'clipboard-text' },
                { id: 'low-stock-report', name: 'Low Stock Report', icon: 'alert' },
                { id: 'stock-movement', name: 'Stock Movement', icon: 'swap-horizontal' },
                { id: 'inventory-valuation', name: 'Inventory Valuation', icon: 'currency-usd' },
            ],
        },
        {
            title: 'Financial Reports',
            icon: 'finance',
            color: colors.warning,
            reports: [
                { id: 'profit-loss', name: 'Profit & Loss', icon: 'chart-areaspline' },
                { id: 'expense-summary', name: 'Expense Summary', icon: 'file-document' },
                { id: 'expense-by-category', name: 'Expense by Category', icon: 'shape' },
                { id: 'tax-report', name: 'Tax Report', icon: 'file-certificate' },
            ],
        },
        {
            title: 'Customer Reports',
            icon: 'account-group',
            color: colors.secondary,
            reports: [
                { id: 'customer-dues', name: 'Customer Dues', icon: 'account-clock' },
                { id: 'customer-payments', name: 'Customer Payments', icon: 'cash' },
                { id: 'customer-lifetime-value', name: 'Customer LTV', icon: 'star' },
            ],
        },
        {
            title: 'Purchase Reports',
            icon: 'truck',
            color: colors.primary[500],
            reports: [
                { id: 'purchase-summary', name: 'Purchase Summary', icon: 'clipboard-text' },
                { id: 'purchase-by-supplier', name: 'Purchase by Supplier', icon: 'store' },
                { id: 'supplier-performance', name: 'Supplier Performance', icon: 'chart-bar' },
            ],
        },
    ];

    const quickReports = [
        {
            id: 'today-sales',
            name: 'Today\'s Sales',
            icon: 'cash-fast',
            color: colors.success,
        },
        {
            id: 'low-stock',
            name: 'Low Stock Alert',
            icon: 'alert',
            color: colors.warning,
        },
        {
            id: 'overdue-dues',
            name: 'Overdue Dues',
            icon: 'account-alert',
            color: colors.error,
        },
        {
            id: 'monthly-profit',
            name: 'Monthly Profit',
            icon: 'chart-bar',
            color: colors.info,
        },
    ];

    const renderQuickReport = ({ id, name, icon, color }: any) => (
        <TouchableOpacity
            key={id}
            style={[styles.quickReportCard, { backgroundColor: color + '10' }]}
            onPress={() => navigation.navigate('ReportViewer', { reportType: id })}
        >
            <Icon name={icon} size={28} color={color} />
            <Text style={styles.quickReportName}>{name}</Text>
        </TouchableOpacity>
    );

    const renderReportCategory = (category: any) => (
        <View key={category.title} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Icon name={category.icon} size={20} color={category.color} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            <View style={styles.reportGrid}>
                {category.reports.map((report: any) => (
                    <TouchableOpacity
                        key={report.id}
                        style={styles.reportItem}
                        onPress={() => navigation.navigate('ReportViewer', { reportType: report.id })}
                    >
                        <View style={[styles.reportIcon, { backgroundColor: category.color + '10' }]}>
                            <Icon name={report.icon} size={24} color={category.color} />
                        </View>
                        <Text style={styles.reportName}>{report.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Reports & Analytics</Text>
                <Text style={styles.headerSubtitle}>
                    Generate and view business reports
                </Text>
            </View>

            {/* Quick Reports */}
            <View style={styles.quickReportsSection}>
                <Text style={styles.sectionTitle}>Quick Reports</Text>
                <View style={styles.quickReportsGrid}>
                    {quickReports.map(renderQuickReport)}
                </View>
            </View>

            {/* Report Categories */}
            <View style={styles.categoriesContainer}>
                {reportCategories.map(renderReportCategory)}
            </View>

            {/* Custom Report Generator */}
            <TouchableOpacity style={styles.customReportCard}>
                <Icon name="file-plus" size={32} color={colors.primary[500]} />
                <View style={styles.customReportText}>
                    <Text style={styles.customReportTitle}>Custom Report Builder</Text>
                    <Text style={styles.customReportDescription}>
                        Create custom reports with your own parameters
                    </Text>
                </View>
                <Icon name="chevron-right" size={24} color={colors.gray[400]} />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        backgroundColor: colors.background,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    quickReportsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
    },
    quickReportsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    quickReportCard: {
        width: '48%',
        margin: '1%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    quickReportName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginTop: 8,
        textAlign: 'center',
    },
    categoriesContainer: {
        padding: 16,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    reportGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    reportItem: {
        width: '48%',
        margin: '1%',
        padding: 12,
        backgroundColor: colors.background,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    reportIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    reportName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        textAlign: 'center',
    },
    customReportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    customReportText: {
        flex: 1,
        marginLeft: 12,
    },
    customReportTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    customReportDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
});

export default ReportListScreen;