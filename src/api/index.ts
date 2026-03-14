export * from './auth';
export * from './products';
export * from './customers';
export * from './customerDue';
export * from './loyalty';
export * from './sales';
export * from './inventory';

// Re-export types
export type { LoginRequest, RegisterRequest, AuthResponse } from './auth';
export type { Product, ProductRequest } from './products';
export type { Customer, CustomerRequest, CustomerSummaryResponse, CustomerDue} from './customers';  // Now CustomerSummaryResponse is properly exported
export type { CustomerDue as Due, CustomerDueRequest, DuePaymentRequest } from './customerDue';
export type { LoyaltySummary, LoyaltyTransaction, EarnPointsRequest, RedeemPointsRequest } from './loyalty';
export type { SaleRequest, SaleResponse, SaleItemRequest, PaymentRequest } from './sales';
export type { InventoryItem, Warehouse, StockMovement, StockAdjustmentRequest, StockTransferRequest } from './inventory';