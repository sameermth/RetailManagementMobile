import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useDashboard } from '@hooks/useDashboard';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate } from '@utils/formatters';
import { LineChart } from 'react-native-chart-kit';
import { useWindowDimensions } from 'react-native';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const {
        summary,
        topProducts,
        lowStockAlerts,
        recentActivities,
        dueSummary,
        loading,
        error,
        refreshDashboard,
    } = useDashboard();

    const StatCard = ({ title, value, icon, color, onPress }: any) => (
        <TouchableOpacity style={styles.statCard} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </TouchableOpacity>
    );

    const ActivityItem = ({ activity }: any) => (
        <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                <Icon name={getActivityIcon(activity.type)} size={20} color={getActivityColor(activity.type)} />
            </View>
            <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTime}>{formatDate(activity.timestamp)}</Text>
            </View>
            <Text style={styles.activityAmount}>{formatCurrency(activity.amount)}</Text>
        </View>
    );

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'SALE': return 'cash';
            case 'PURCHASE': return 'cart';
            case 'PAYMENT': return 'credit-card';
            case 'CUSTOMER': return 'account';
            case 'EXPENSE': return 'file-document';
            default: return 'bell';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'SALE': return colors.success;
            case 'PURCHASE': return colors.info;
            case 'PAYMENT': return colors.primary[500];
            case 'CUSTOMER': return colors.secondary;
            case 'EXPENSE': return colors.warning;
            default: return colors.gray[500];
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refreshDashboard} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Good {getGreeting()}!</Text>
                    <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}</Text>
                </View>
                <TouchableOpacity style={styles.profileButton}>
                    <Icon name="account-circle" size={40} color={colors.primary[500]} />
                </TouchableOpacity>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={40} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={refreshDashboard}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Today's Sales"
                            value={formatCurrency(summary?.todaySales?.totalAmount || 0)}
                            icon="cash"
                            color={colors.primary[500]}
                            onPress={() => navigation.navigate('SalesReport')}
                        />
                        <StatCard
                            title="Orders"
                            value={summary?.todaySales?.totalTransactions || 0}
                            icon="shopping"
                            color={colors.success}
                            onPress={() => navigation.navigate('SalesList')}
                        />
                        <StatCard
                            title="Low Stock"
                            value={summary?.lowStockCount || 0}
                            icon="alert"
                            color={colors.warning}
                            onPress={() => navigation.navigate('LowStockAlerts')}
                        />
                        <StatCard
                            title="Pending Dues"
                            value={formatCurrency(dueSummary?.totalDueAmount || 0)}
                            icon="account-clock"
                            color={colors.error}
                            onPress={() => navigation.navigate('CustomerDues', { customerId: 0 })}
                        />
                    </View>

                    {/* Sales Chart */}
                    {summary?.weeklySales && (
                        <View style={styles.chartCard}>
                            <Text style={styles.chartTitle}>Weekly Sales</Text>
                            <LineChart
                                data={{
                                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                    datasets: [{
                                        data: [
                                            summary.weeklySales?.totalAmount || 0,
                                            // You'd need actual daily data here
                                        ],
                                    }],
                                }}
                                width={width - 32}
                                height={220}
                                chartConfig={{
                                    backgroundColor: colors.background,
                                    backgroundGradientFrom: colors.background,
                                    backgroundGradientTo: colors.background,
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                    },
                                }}
                                bezier
                                style={styles.chart}
                            />
                        </View>
                    )}

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('POS')}>
                            <Icon name="cash-register" size={32} color={colors.primary[500]} />
                            <Text style={styles.actionText}>New Sale</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddProduct')}>
                            <Icon name="package-plus" size={32} color={colors.success} />
                            <Text style={styles.actionText}>Add Product</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddCustomer')}>
                            <Icon name="account-plus" size={32} color={colors.info} />
                            <Text style={styles.actionText}>Add Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreatePurchase')}>
                            <Icon name="truck-plus" size={32} color={colors.warning} />
                            <Text style={styles.actionText}>New Order</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Top Products */}
                    {topProducts && topProducts.length > 0 && (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Top Products</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            {topProducts.slice(0, 5).map((product, index) => (
                                <TouchableOpacity
                                    key={product.productId}
                                    style={styles.productItem}
                                    onPress={() => navigation.navigate('ProductDetail', { productId: product.productId })}
                                >
                                    <View style={styles.productRank}>
                                        <Text style={styles.productRankText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{product.productName}</Text>
                                        <Text style={styles.productSku}>{product.productSku}</Text>
                                    </View>
                                    <View style={styles.productStats}>
                                        <Text style={styles.productQuantity}>Qty: {product.quantitySold}</Text>
                                        <Text style={styles.productRevenue}>{formatCurrency(product.totalRevenue)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Low Stock Alerts */}
                    {lowStockAlerts && lowStockAlerts.length > 0 && (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('LowStockAlerts')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            {lowStockAlerts.slice(0, 3).map((alert) => (
                                <TouchableOpacity
                                    key={alert.productId}
                                    style={styles.alertItem}
                                    onPress={() => navigation.navigate('ProductDetail', { productId: alert.productId })}
                                >
                                    <View style={styles.alertIcon}>
                                        <Icon name="alert-circle" size={24} color={colors.warning} />
                                    </View>
                                    <View style={styles.alertInfo}>
                                        <Text style={styles.alertName}>{alert.productName}</Text>
                                        <Text style={styles.alertDetails}>
                                            Stock: {alert.currentStock} | Min: {alert.reorderLevel}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.orderButton}>
                                        <Text style={styles.orderButtonText}>Order</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Recent Activities */}
                    {recentActivities && recentActivities.length > 0 && (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Recent Activities</Text>
                                <TouchableOpacity>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            {recentActivities.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </View>
                    )}

                    {/* Due Summary */}
                    {dueSummary && dueSummary.upcomingDues && dueSummary.upcomingDues.length > 0 && (
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Upcoming Dues</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('CustomerDues', { customerId: 0 })}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            {dueSummary.upcomingDues.slice(0, 3).map((due) => (
                                <TouchableOpacity
                                    key={due.customerId}
                                    style={styles.dueItem}
                                    onPress={() => navigation.navigate('CustomerDetail', { customerId: due.customerId })}
                                >
                                    <View style={styles.dueIcon}>
                                        <Icon name="account-clock" size={24} color={due.daysRemaining < 0 ? colors.error : colors.warning} />
                                    </View>
                                    <View style={styles.dueInfo}>
                                        <Text style={styles.dueName}>{due.customerName}</Text>
                                        <Text style={styles.dueDate}>Due: {formatDate(due.dueDate)}</Text>
                                    </View>
                                    <View style={styles.dueAmount}>
                                        <Text style={[styles.dueAmountText, due.daysRemaining < 0 && styles.overdueText]}>
                                            {formatCurrency(due.dueAmount)}
                                        </Text>
                                        <Text style={styles.dueDays}>
                                            {due.daysRemaining < 0 ? `${Math.abs(due.daysRemaining)}d overdue` : `${due.daysRemaining}d left`}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    );
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    greeting: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    date: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
        marginTop: 4,
    },
    profileButton: {
        padding: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    statCard: {
        width: '50%',
        padding: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    statTitle: {
        fontSize: typography.fontSize.sm,
        color: colors.text.secondary,
    },
    chartCard: {
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
    chartTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        backgroundColor: colors.background,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    actionButton: {
        width: '25%',
        alignItems: 'center',
        padding: 12,
    },
    actionText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 4,
        textAlign: 'center',
    },
    sectionCard: {
        backgroundColor: colors.background,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    productRank: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productRankText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    productSku: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    productStats: {
        alignItems: 'flex-end',
    },
    productQuantity: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    productRevenue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.success,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    alertIcon: {
        width: 40,
        alignItems: 'center',
    },
    alertInfo: {
        flex: 1,
        marginLeft: 8,
    },
    alertName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    alertDetails: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    orderButton: {
        backgroundColor: colors.warning + '20',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    orderButtonText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    activityIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityDescription: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    activityTime: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    activityAmount: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    dueItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dueIcon: {
        width: 40,
        alignItems: 'center',
    },
    dueInfo: {
        flex: 1,
        marginLeft: 8,
    },
    dueName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    dueDate: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    dueAmount: {
        alignItems: 'flex-end',
    },
    dueAmountText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    overdueText: {
        color: colors.error,
    },
    dueDays: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    retryButton: {
        height: 44,
        backgroundColor: colors.primary[500],
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    retryButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
});

export default DashboardScreen;