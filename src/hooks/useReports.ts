import { useState, useCallback } from 'react';
import { reportsApi, ReportRequest } from '@api/reports';

export const useReports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateReport = useCallback(async (request: ReportRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportsApi.generate(request);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadReport = useCallback(async (request: ReportRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportsApi.download(request);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to download report');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getReportFormats = useCallback(async (reportType: string) => {
        try {
            const response = await reportsApi.getFormats(reportType);
            return response.data;
        } catch (err) {
            return ['PDF', 'EXCEL', 'CSV'];
        }
    }, []);

    const getScheduledReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportsApi.getScheduled();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch scheduled reports');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createSchedule = useCallback(async (scheduleData: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportsApi.createSchedule(scheduleData);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create schedule');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteSchedule = useCallback(async (scheduleId: number) => {
        setLoading(true);
        setError(null);
        try {
            await reportsApi.deleteSchedule(scheduleId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete schedule');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        generateReport,
        downloadReport,
        getReportFormats,
        getScheduledReports,
        createSchedule,
        deleteSchedule,
    };
};