import { useState, useCallback, useEffect } from 'react';
import { dashboardApi, DashboardSummary, TopProduct, LowStockAlert, RecentActivity, DueSummary } from '@api/dashboard';

export const useDashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [dueSummary, setDueSummary] = useState<DueSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [summaryRes, topProductsRes, lowStockRes, activitiesRes, dueRes] = await Promise.all([
                dashboardApi.getSummary(),
                dashboardApi.getTopProducts(5),
                dashboardApi.getLowStockAlerts(),
                dashboardApi.getRecentActivities(10),
                dashboardApi.getDueSummary(),
            ]);

            setSummary(summaryRes.data);
            setTopProducts(topProductsRes.data);
            setLowStockAlerts(lowStockRes.data);
            setRecentActivities(activitiesRes.data);
            setDueSummary(dueRes.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    const getTodaySales = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await dashboardApi.getTodaySales();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch today\'s sales');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSalesForPeriod = useCallback(async (startDate: string, endDate: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await dashboardApi.getSalesForPeriod(startDate, endDate);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch sales for period');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshDashboard = useCallback(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(() => {
            fetchDashboardData();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    return {
        summary,
        topProducts,
        lowStockAlerts,
        recentActivities,
        dueSummary,
        loading,
        error,
        refreshDashboard,
        getTodaySales,
        getSalesForPeriod,
    };
};