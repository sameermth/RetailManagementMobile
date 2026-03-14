import { useState, useCallback } from 'react';
import { loyaltyApi, LoyaltySummary, LoyaltyTransaction } from '@api/loyalty';

export const useLoyalty = () => {
    const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummary | null>(null);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLoyaltySummary = useCallback(async (customerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.getCustomerSummary(customerId);
            setLoyaltySummary(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch loyalty summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransactionHistory = useCallback(async (customerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.getTransactionHistory(customerId);
            setTransactions(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch transaction history');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCustomerPoints = useCallback(async (customerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.getCustomerPoints(customerId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customer points');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getCustomerTier = useCallback(async (customerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.getCustomerTier(customerId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch customer tier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const earnPoints = useCallback(async (customerId: number, purchaseAmount: number, saleId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.earnPoints(customerId, purchaseAmount, saleId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to earn points');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const redeemPoints = useCallback(async (customerId: number, points: number, redeemedFor: string, saleId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.redeemPoints(customerId, points, redeemedFor, saleId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to redeem points');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPointsToNextTier = useCallback(async (customerId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.getPointsToNextTier(customerId);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to calculate points to next tier');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const calculatePointsValue = useCallback(async (customerId: number, points: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await loyaltyApi.calculatePointsValue(customerId, points);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to calculate points value');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const canRedeemPoints = useCallback(async (customerId: number, points: number) => {
        try {
            const response = await loyaltyApi.canRedeemPoints(customerId, points);
            return response.data;
        } catch (err: any) {
            return false;
        }
    }, []);

    return {
        loyaltySummary,
        transactions,
        loading,
        error,
        fetchLoyaltySummary,
        fetchTransactionHistory,
        getCustomerPoints,
        getCustomerTier,
        earnPoints,
        redeemPoints,
        getPointsToNextTier,
        calculatePointsValue,
        canRedeemPoints,
    };
};