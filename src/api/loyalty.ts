import apiClient from './client';

export interface LoyaltySummary {
    customerId: number;
    customerName: string;
    totalPoints: number;
    currentTier: string;
    totalPurchaseAmount: number;
    pointsToNextTier: number;
    nextTier: string;
    recentTransactions: LoyaltyTransaction[];
}

export interface LoyaltyTransaction {
    transactionReference: string;
    transactionType: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'ADJUSTED';
    points: number;
    description: string;
    createdAt: string;
}

export interface EarnPointsRequest {
    customerId: number;
    purchaseAmount: number;
    saleId?: number;
}

export interface RedeemPointsRequest {
    customerId: number;
    points: number;
    redeemedFor: string;
    saleId?: number;
}

export const loyaltyApi = {
    // Get loyalty info
    getCustomerSummary: (customerId: number) =>
        apiClient.get<LoyaltySummary>(`/loyalty/customer/${customerId}/summary`),

    getCustomerPoints: (customerId: number) =>
        apiClient.get<number>(`/loyalty/customer/${customerId}/points`),

    getCustomerTier: (customerId: number) =>
        apiClient.get<string>(`/loyalty/customer/${customerId}/tier`),

    getTransactionHistory: (customerId: number) =>
        apiClient.get<LoyaltyTransaction[]>(`/loyalty/customer/${customerId}/transactions`),

    // Points management
    earnPoints: (customerId: number, purchaseAmount: number, saleId?: number) =>
        apiClient.post(`/loyalty/customer/${customerId}/earn`, null, {
            params: {purchaseAmount, saleId}
        }),

    redeemPoints: (customerId: number, points: number, redeemedFor: string, saleId?: number) =>
        apiClient.post(`/loyalty/customer/${customerId}/redeem`, null, {
            params: {points, redeemedFor, saleId}
        }),

    adjustPoints: (customerId: number, points: number, reason: string) =>
        apiClient.post(`/loyalty/customer/${customerId}/adjust`, null, {
            params: {points, reason}
        }),

    // Calculations
    getPointsToNextTier: (customerId: number) =>
        apiClient.get<number>(`/loyalty/customer/${customerId}/points-to-next-tier`),

    calculatePointsValue: (customerId: number, points: number) =>
        apiClient.get<number>(`/loyalty/customer/${customerId}/points-value`, {
            params: {points}
        }),

    canRedeemPoints: (customerId: number, points: number) =>
        apiClient.get<boolean>(`/loyalty/customer/${customerId}/can-redeem`, {
            params: {points}
        }),
};