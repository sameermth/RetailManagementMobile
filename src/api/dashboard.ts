import apiClient from './client';

export interface DashboardSummary {
    todaySales: SalesSummary;
    weeklySales: SalesSummary;
    monthlySales: SalesSummary;
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalCustomers: number;
    newCustomersToday: number;
    totalDueAmount: number;
    overdueCount: number;
    pendingOrders: number;
    completedOrdersToday: number;
}

export interface SalesSummary {
    totalAmount: number;
    totalTransactions: number;
    averageTransactionValue: number;
    cashAmount: number;
    cardAmount: number;
    upiAmount: number;
}

export interface TopProduct {
    productId: number;
    productName: string;
    productSku: string;
    category: string;
    quantitySold: number;
    totalRevenue: number;
}

export interface LowStockAlert {
    productId: number;
    productName: string;
    productSku: string;
    currentStock: number;
    reorderLevel: number;
    recommendedOrder: number;
}

export interface RecentActivity {
    id: number;
    type: 'SALE' | 'PURCHASE' | 'PAYMENT' | 'CUSTOMER' | 'EXPENSE';
    description: string;
    reference: string;
    user: string;
    timestamp: string;
    amount: number;
}

export interface DueSummary {
    totalDueAmount: number;
    totalDueCustomers: number;
    overdueAmount: number;
    overdueCount: number;
    dueThisWeek: number;
    dueNextWeek: number;
    upcomingDues: UpcomingDue[];
}

export interface UpcomingDue {
    customerId: number;
    customerName: string;
    dueAmount: number;
    dueDate: string;
    daysRemaining: number;
}

export const dashboardApi = {
    getSummary: () =>
        apiClient.get<DashboardSummary>('/dashboard/summary'),

    getTodaySales: () =>
        apiClient.get<SalesSummary>('/dashboard/sales/today'),

    getSalesForPeriod: (startDate: string, endDate: string) =>
        apiClient.get<SalesSummary>('/dashboard/sales/period', {params: {startDate, endDate}}),

    getTopProducts: (limit: number = 10) =>
        apiClient.get<TopProduct[]>('/dashboard/products/top', {params: {limit}}),

    getLowStockAlerts: () =>
        apiClient.get<LowStockAlert[]>('/dashboard/inventory/low-stock'),

    getRecentActivities: (limit: number = 10) =>
        apiClient.get<RecentActivity[]>('/dashboard/activities/recent', {params: {limit}}),

    getDueSummary: () =>
        apiClient.get<DueSummary>('/dashboard/dues/summary'),

    getUpcomingDues: (days: number = 7) =>
        apiClient.get<UpcomingDue[]>('/dashboard/dues/upcoming', {params: {days}}),
};