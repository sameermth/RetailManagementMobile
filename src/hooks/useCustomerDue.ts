import { useState, useCallback } from 'react';
import { customerDueApi, CustomerDue, CustomerDueRequest, DuePaymentRequest } from '@api/customerDue';

export const useCustomerDue = () => {
    const [dues, setDues] = useState<CustomerDue[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchCustomerDues = useCallback(async (customerId: number, page = 0, size = 20) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.getByCustomer(customerId, page, size);
            setDues(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customer dues');
        } finally {
            setLoading(false);
        }
    }, []);

    const getOverdueDues = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.getOverdue();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch overdue dues');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDueByReference = useCallback(async (reference: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.getByReference(reference);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch due by reference');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createDue = useCallback(async (data: CustomerDueRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.createDue(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create due');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const recordPayment = useCallback(async (dueId: number, amount: number, paymentReference?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.recordPayment(dueId, amount, paymentReference);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to record payment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateDueStatus = useCallback(async (dueId: number, status: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.updateStatus(dueId, status);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update due status');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const sendReminder = useCallback(async (dueId: number) => {
        setLoading(true);
        setError(null);
        try {
            await customerDueApi.sendReminder(dueId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reminder');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDuesNeedingReminder = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await customerDueApi.getDuesNeedingReminder();
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch dues needing reminder');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDueStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [totalResponse, overdueResponse, countResponse] = await Promise.all([
                customerDueApi.getTotalDueAmount(),
                customerDueApi.getTotalOverdueAmount(),
                customerDueApi.getOverdueCount(),
            ]);

            return {
                totalDue: totalResponse.data,
                totalOverdue: overdueResponse.data,
                overdueCount: countResponse.data,
            };
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch due stats');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        dues,
        loading,
        error,
        totalPages,
        currentPage,
        fetchCustomerDues,
        getOverdueDues,
        getDueByReference,
        createDue,
        recordPayment,
        updateDueStatus,
        sendReminder,
        getDuesNeedingReminder,
        getDueStats,
    };
};