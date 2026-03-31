import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  AppData,
  Customer,
  CustomerReceipt,
  DashboardSummary,
  DueSummary,
  LowStockAlert,
  ProductCatalogItem,
  PurchaseOrder,
  PurchaseOrderSummary,
  PurchaseReceipt,
  PurchaseReceiptSummary,
  RecentActivity,
  SalesInvoice,
  SalesInvoiceSummary,
  SalesOrder,
  SalesOrderSummary,
  SalesQuote,
  SalesQuoteSummary,
  SessionDraft,
  SessionState,
  StoreCustomerTerms,
  StoreProduct,
  StoreSupplierTerms,
  Supplier,
  SupplierCatalog,
  SupplierPayment,
  TopProduct,
  defaultSessionDraft,
  emptyData,
} from "../data/entities";
import { authRequest, dashboardRequest, detectDefaultBaseUrl, erpRequest, normalizeBaseUrl } from "../services/api";

const STORAGE_KEY = "retail-management-backend-session";

type AppDataContextValue = {
  data: AppData;
  hydrated: boolean;
  refreshing: boolean;
  session: SessionState | null;
  sessionDraft: SessionDraft;
  error: string | null;
  updateSessionDraft: (patch: Partial<SessionDraft>) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAll: () => Promise<void>;
  createProduct: (payload: Record<string, unknown>) => Promise<void>;
  createCustomer: (payload: Record<string, unknown>) => Promise<void>;
  updateCustomer: (customerId: number, payload: Record<string, unknown>) => Promise<void>;
  loadCustomerTerms: (customerId: number) => Promise<StoreCustomerTerms | null>;
  saveCustomerTerms: (customerId: number, payload: Record<string, unknown>) => Promise<StoreCustomerTerms | null>;
  createSupplier: (payload: Record<string, unknown>) => Promise<void>;
  updateSupplier: (supplierId: number, payload: Record<string, unknown>) => Promise<void>;
  loadSupplierTerms: (supplierId: number) => Promise<StoreSupplierTerms | null>;
  saveSupplierTerms: (supplierId: number, payload: Record<string, unknown>) => Promise<StoreSupplierTerms | null>;
  loadSupplierCatalog: (supplierId: number) => Promise<SupplierCatalog | null>;
  createQuote: (payload: Record<string, unknown>) => Promise<void>;
  createOrder: (payload: Record<string, unknown>) => Promise<void>;
  createInvoice: (payload: Record<string, unknown>) => Promise<void>;
  createReceipt: (payload: Record<string, unknown>) => Promise<void>;
  loadQuote: (id: number) => Promise<SalesQuote | null>;
  loadOrder: (id: number) => Promise<SalesOrder | null>;
  loadInvoice: (id: number) => Promise<SalesInvoice | null>;
  convertQuoteToOrder: (id: number, remarks?: string) => Promise<void>;
  convertQuoteToInvoice: (id: number, remarks?: string) => Promise<void>;
  convertOrderToInvoice: (id: number, remarks?: string) => Promise<void>;
  createPurchaseOrder: (payload: Record<string, unknown>) => Promise<void>;
  createPurchaseReceipt: (payload: Record<string, unknown>) => Promise<void>;
  createSupplierPayment: (payload: Record<string, unknown>) => Promise<void>;
  loadPurchaseOrder: (id: number) => Promise<PurchaseOrder | null>;
  loadPurchaseReceipt: (id: number) => Promise<PurchaseReceipt | null>;
  apiGet: <T>(
    path: string,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) => Promise<T>;
  apiPost: <T>(
    path: string,
    body?: Record<string, unknown>,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) => Promise<T>;
  apiPut: <T>(
    path: string,
    body?: Record<string, unknown>,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) => Promise<T>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

type StoredState = {
  session: SessionState | null;
  sessionDraft: SessionDraft;
};

export function AppDataProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppData>(emptyData);
  const [session, setSession] = useState<SessionState | null>(null);
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>({
    ...defaultSessionDraft,
    baseUrl: detectDefaultBaseUrl(),
  });
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistState = useCallback(async (nextSession: SessionState | null, nextDraft: SessionDraft) => {
    const payload: StoredState = { session: nextSession, sessionDraft: nextDraft };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!stored || !active) {
          return;
        }
        const parsed = JSON.parse(stored) as StoredState;
        if (parsed.sessionDraft) {
          setSessionDraft({
            ...defaultSessionDraft,
            ...parsed.sessionDraft,
            baseUrl: normalizeBaseUrl(parsed.sessionDraft.baseUrl || detectDefaultBaseUrl()),
          });
        }
        if (parsed.session) {
          setSession(parsed.session);
        }
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const getSession = useCallback(() => {
    if (!session) {
      throw new Error("Please sign in first.");
    }
    return session;
  }, [session]);

  const refreshAll = useCallback(async () => {
    const activeSession = getSession();
    setRefreshing(true);
    setError(null);

    try {
      const baseOptions = { baseUrl: activeSession.baseUrl, token: activeSession.token };
      const [dashboardSummary, dueSummary, topProducts, lowStockAlerts, recentActivities, products, productCatalog, customers, suppliers, quotes, orders, invoices, receipts, purchaseOrders, purchaseReceipts, supplierPayments] =
        await Promise.all([
          dashboardRequest<DashboardSummary>({ ...baseOptions, path: "/api/dashboard/summary" }),
          dashboardRequest<DueSummary>({ ...baseOptions, path: "/api/dashboard/dues/summary" }),
          dashboardRequest<TopProduct[]>({ ...baseOptions, path: "/api/dashboard/products/top", query: { limit: 5 } }),
          dashboardRequest<LowStockAlert[]>({ ...baseOptions, path: "/api/dashboard/inventory/low-stock" }),
          dashboardRequest<RecentActivity[]>({ ...baseOptions, path: "/api/dashboard/activities/recent", query: { limit: 8 } }),
          erpRequest<StoreProduct[]>({
            ...baseOptions,
            path: "/api/erp/products",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<ProductCatalogItem[]>({
            ...baseOptions,
            path: "/api/erp/products/catalog",
          }),
          erpRequest<Customer[]>({
            ...baseOptions,
            path: "/api/erp/customers",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<Supplier[]>({
            ...baseOptions,
            path: "/api/erp/suppliers",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<SalesQuoteSummary[]>({
            ...baseOptions,
            path: "/api/erp/sales/quotes",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<SalesOrderSummary[]>({
            ...baseOptions,
            path: "/api/erp/sales/orders",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<SalesInvoiceSummary[]>({
            ...baseOptions,
            path: "/api/erp/sales/invoices",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<CustomerReceipt[]>({
            ...baseOptions,
            path: "/api/erp/sales/receipts",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<PurchaseOrderSummary[]>({
            ...baseOptions,
            path: "/api/erp/purchases/orders",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<PurchaseReceiptSummary[]>({
            ...baseOptions,
            path: "/api/erp/purchases/receipts",
            query: { organizationId: activeSession.organizationId },
          }),
          erpRequest<SupplierPayment[]>({
            ...baseOptions,
            path: "/api/erp/purchases/supplier-payments",
            query: { organizationId: activeSession.organizationId },
          }),
        ]);

      setData({
        dashboardSummary,
        dueSummary,
        topProducts,
        lowStockAlerts,
        recentActivities,
        products,
        productCatalog,
        customers,
        suppliers,
        quotes,
        orders,
        invoices,
        receipts,
        purchaseOrders,
        purchaseReceipts,
        supplierPayments,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to refresh backend data.");
      throw nextError;
    } finally {
      setRefreshing(false);
    }
  }, [getSession]);

  useEffect(() => {
    if (!hydrated || !session?.token) {
      return;
    }
    refreshAll().catch(() => undefined);
  }, [hydrated, refreshAll, session?.token]);

  async function updateSessionDraft(patch: Partial<SessionDraft>) {
    const nextDraft = {
      ...sessionDraft,
      ...patch,
      baseUrl: normalizeBaseUrl(patch.baseUrl ?? sessionDraft.baseUrl),
    };
    setSessionDraft(nextDraft);
    await persistState(session, nextDraft);
  }

  async function signIn() {
    setError(null);

    const baseUrl = normalizeBaseUrl(sessionDraft.baseUrl);
    const organizationId = sessionDraft.organizationId.trim() ? Number(sessionDraft.organizationId) : undefined;
    const loginResponse = await authRequest<{
      token: string;
      type?: string;
      id: number;
      organizationId?: number | null;
      organizationCode?: string | null;
      organizationName?: string | null;
      username: string;
      email: string;
      roles?: string[];
      permissions?: string[];
      memberships?: SessionState["memberships"];
    }>({
      baseUrl,
      method: "POST",
      path: "/api/auth/login",
      body: {
        username: sessionDraft.username.trim(),
        password: sessionDraft.password,
        organizationId,
      },
    });

    const membership =
      loginResponse.memberships?.find((entry) => entry.organizationId === loginResponse.organizationId) ??
      loginResponse.memberships?.[0] ??
      null;

    const nextSession: SessionState = {
      baseUrl,
      token: loginResponse.token,
      type: loginResponse.type ?? "Bearer",
      userId: loginResponse.id,
      username: loginResponse.username,
      email: loginResponse.email,
      organizationId: loginResponse.organizationId ?? membership?.organizationId ?? organizationId ?? 1,
      organizationCode: loginResponse.organizationCode ?? membership?.organizationCode ?? "ORG",
      organizationName: loginResponse.organizationName ?? membership?.organizationName ?? "Retail Workspace",
      branchId: membership?.defaultBranchId ?? null,
      warehouseId: sessionDraft.warehouseId.trim() ? Number(sessionDraft.warehouseId) : null,
      roles: loginResponse.roles ?? [],
      permissions: loginResponse.permissions ?? [],
      memberships: loginResponse.memberships ?? [],
    };

    setSession(nextSession);
    const nextDraft = {
      ...sessionDraft,
      baseUrl,
      organizationId: String(nextSession.organizationId),
    };
    setSessionDraft(nextDraft);
    await persistState(nextSession, nextDraft);
    await refreshAllWith(nextSession);
  }

  const refreshAllWith = useCallback(
    async (activeSession: SessionState) => {
      setRefreshing(true);
      setError(null);
      try {
        const baseOptions = { baseUrl: activeSession.baseUrl, token: activeSession.token };
        const [dashboardSummary, dueSummary, topProducts, lowStockAlerts, recentActivities, products, productCatalog, customers, suppliers, quotes, orders, invoices, receipts, purchaseOrders, purchaseReceipts, supplierPayments] =
          await Promise.all([
            dashboardRequest<DashboardSummary>({ ...baseOptions, path: "/api/dashboard/summary" }),
            dashboardRequest<DueSummary>({ ...baseOptions, path: "/api/dashboard/dues/summary" }),
            dashboardRequest<TopProduct[]>({ ...baseOptions, path: "/api/dashboard/products/top", query: { limit: 5 } }),
            dashboardRequest<LowStockAlert[]>({ ...baseOptions, path: "/api/dashboard/inventory/low-stock" }),
            dashboardRequest<RecentActivity[]>({ ...baseOptions, path: "/api/dashboard/activities/recent", query: { limit: 8 } }),
            erpRequest<StoreProduct[]>({ ...baseOptions, path: "/api/erp/products", query: { organizationId: activeSession.organizationId } }),
            erpRequest<ProductCatalogItem[]>({ ...baseOptions, path: "/api/erp/products/catalog" }),
            erpRequest<Customer[]>({ ...baseOptions, path: "/api/erp/customers", query: { organizationId: activeSession.organizationId } }),
            erpRequest<Supplier[]>({ ...baseOptions, path: "/api/erp/suppliers", query: { organizationId: activeSession.organizationId } }),
            erpRequest<SalesQuoteSummary[]>({ ...baseOptions, path: "/api/erp/sales/quotes", query: { organizationId: activeSession.organizationId } }),
            erpRequest<SalesOrderSummary[]>({ ...baseOptions, path: "/api/erp/sales/orders", query: { organizationId: activeSession.organizationId } }),
            erpRequest<SalesInvoiceSummary[]>({ ...baseOptions, path: "/api/erp/sales/invoices", query: { organizationId: activeSession.organizationId } }),
            erpRequest<CustomerReceipt[]>({ ...baseOptions, path: "/api/erp/sales/receipts", query: { organizationId: activeSession.organizationId } }),
            erpRequest<PurchaseOrderSummary[]>({ ...baseOptions, path: "/api/erp/purchases/orders", query: { organizationId: activeSession.organizationId } }),
            erpRequest<PurchaseReceiptSummary[]>({ ...baseOptions, path: "/api/erp/purchases/receipts", query: { organizationId: activeSession.organizationId } }),
            erpRequest<SupplierPayment[]>({ ...baseOptions, path: "/api/erp/purchases/supplier-payments", query: { organizationId: activeSession.organizationId } }),
          ]);
        setData({
          dashboardSummary,
          dueSummary,
          topProducts,
          lowStockAlerts,
          recentActivities,
          products,
          productCatalog,
          customers,
          suppliers,
          quotes,
          orders,
          invoices,
          receipts,
          purchaseOrders,
          purchaseReceipts,
          supplierPayments,
        });
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to refresh backend data.");
        throw nextError;
      } finally {
        setRefreshing(false);
      }
    },
    [],
  );

  async function signOut() {
    setSession(null);
    setData(emptyData);
    await persistState(null, sessionDraft);
  }

  async function runMutation<T>(path: string, method: "POST" | "PUT", body: Record<string, unknown>, query?: Record<string, unknown>) {
    const activeSession = getSession();
    const result = await erpRequest<T>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      method,
      path,
      query: query as Record<string, string | number | boolean | null | undefined>,
      body,
    });
    await refreshAllWith(activeSession);
    return result;
  }

  async function createProduct(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation(
      "/api/erp/products",
      "POST",
      { organizationId: activeSession.organizationId, ...payload },
    );
  }

  async function createCustomer(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation(
      "/api/erp/customers",
      "POST",
      payload,
      { organizationId: activeSession.organizationId, branchId: activeSession.branchId ?? 1 },
    );
  }

  async function updateCustomer(customerId: number, payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation(
      `/api/erp/customers/${customerId}`,
      "PUT",
      payload,
      { organizationId: activeSession.organizationId },
    );
  }

  async function loadCustomerTerms(customerId: number) {
    const activeSession = getSession();
    try {
      return await erpRequest<StoreCustomerTerms>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/customers/${customerId}/terms`,
        query: { organizationId: activeSession.organizationId },
      });
    } catch {
      return null;
    }
  }

  async function saveCustomerTerms(customerId: number, payload: Record<string, unknown>) {
    const activeSession = getSession();
    try {
      return await erpRequest<StoreCustomerTerms>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "PUT",
        path: `/api/erp/customers/${customerId}/terms`,
        query: { organizationId: activeSession.organizationId },
        body: payload,
      });
    } finally {
      await refreshAllWith(activeSession);
    }
  }

  async function createSupplier(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation(
      "/api/erp/suppliers",
      "POST",
      payload,
      { organizationId: activeSession.organizationId, branchId: activeSession.branchId ?? 1 },
    );
  }

  async function updateSupplier(supplierId: number, payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation(
      `/api/erp/suppliers/${supplierId}`,
      "PUT",
      payload,
      { organizationId: activeSession.organizationId },
    );
  }

  async function loadSupplierTerms(supplierId: number) {
    const activeSession = getSession();
    try {
      return await erpRequest<StoreSupplierTerms>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/suppliers/${supplierId}/terms`,
        query: { organizationId: activeSession.organizationId },
      });
    } catch {
      return null;
    }
  }

  async function saveSupplierTerms(supplierId: number, payload: Record<string, unknown>) {
    const activeSession = getSession();
    try {
      return await erpRequest<StoreSupplierTerms>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "PUT",
        path: `/api/erp/suppliers/${supplierId}/terms`,
        query: { organizationId: activeSession.organizationId },
        body: payload,
      });
    } finally {
      await refreshAllWith(activeSession);
    }
  }

  async function loadSupplierCatalog(supplierId: number) {
    const activeSession = getSession();
    try {
      return await erpRequest<SupplierCatalog>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/suppliers/${supplierId}/catalog`,
        query: { organizationId: activeSession.organizationId },
      });
    } catch {
      return null;
    }
  }

  async function createQuote(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/sales/quotes", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      warehouseId: activeSession.warehouseId,
      ...payload,
    });
  }

  async function createOrder(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/sales/orders", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      warehouseId: activeSession.warehouseId,
      ...payload,
    });
  }

  async function createInvoice(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/sales/invoices", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      warehouseId: activeSession.warehouseId,
      ...payload,
    });
  }

  async function createReceipt(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/sales/receipts", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      ...payload,
    });
  }

  async function loadQuote(id: number) {
    const activeSession = getSession();
    return erpRequest<SalesQuote>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      path: `/api/erp/sales/quotes/${id}`,
    });
  }

  async function loadOrder(id: number) {
    const activeSession = getSession();
    return erpRequest<SalesOrder>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      path: `/api/erp/sales/orders/${id}`,
    });
  }

  async function loadInvoice(id: number) {
    const activeSession = getSession();
    return erpRequest<SalesInvoice>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      path: `/api/erp/sales/invoices/${id}`,
    });
  }

  async function convertQuoteToOrder(id: number, remarks?: string) {
    const activeSession = getSession();
    await runMutation(`/api/erp/sales/quotes/${id}/convert-to-order`, "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      remarks,
    });
  }

  async function convertQuoteToInvoice(id: number, remarks?: string) {
    const activeSession = getSession();
    await runMutation(`/api/erp/sales/quotes/${id}/convert-to-invoice`, "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      remarks,
    });
  }

  async function convertOrderToInvoice(id: number, remarks?: string) {
    const activeSession = getSession();
    await runMutation(`/api/erp/sales/orders/${id}/convert-to-invoice`, "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      remarks,
    });
  }

  async function createPurchaseOrder(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/purchases/orders", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      ...payload,
    });
  }

  async function createPurchaseReceipt(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/purchases/receipts", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      warehouseId: activeSession.warehouseId,
      ...payload,
    });
  }

  async function createSupplierPayment(payload: Record<string, unknown>) {
    const activeSession = getSession();
    await runMutation("/api/erp/purchases/supplier-payments", "POST", {
      organizationId: activeSession.organizationId,
      branchId: activeSession.branchId,
      ...payload,
    });
  }

  async function loadPurchaseOrder(id: number) {
    const activeSession = getSession();
    return erpRequest<PurchaseOrder>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      path: `/api/erp/purchases/orders/${id}`,
    });
  }

  async function loadPurchaseReceipt(id: number) {
    const activeSession = getSession();
    return erpRequest<PurchaseReceipt>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      path: `/api/erp/purchases/receipts/${id}`,
    });
  }

  async function apiGet<T>(
    path: string,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) {
    const activeSession = getSession();
    if (options?.kind === "dashboard") {
      return dashboardRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path,
        query: options.query,
      });
    }
    if (options?.kind === "auth") {
      return authRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path,
        query: options.query,
      });
    }
    return erpRequest<T>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      path,
      query: options?.query,
    });
  }

  async function apiPost<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) {
    const activeSession = getSession();
    if (options?.kind === "dashboard") {
      return dashboardRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "POST",
        path,
        query: options.query,
        body,
      });
    }
    if (options?.kind === "auth") {
      return authRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "POST",
        path,
        query: options.query,
        body,
      });
    }
    return erpRequest<T>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      method: "POST",
      path,
      query: options?.query,
      body,
    });
  }

  async function apiPut<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) {
    const activeSession = getSession();
    if (options?.kind === "dashboard") {
      return dashboardRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "PUT",
        path,
        query: options.query,
        body,
      });
    }
    if (options?.kind === "auth") {
      return authRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "PUT",
        path,
        query: options.query,
        body,
      });
    }
    return erpRequest<T>({
      baseUrl: activeSession.baseUrl,
      token: activeSession.token,
      method: "PUT",
      path,
      query: options?.query,
      body,
    });
  }

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      hydrated,
      refreshing,
      session,
      sessionDraft,
      error,
      updateSessionDraft,
      signIn,
      signOut,
      refreshAll,
      createProduct,
      createCustomer,
      updateCustomer,
      loadCustomerTerms,
      saveCustomerTerms,
      createSupplier,
      updateSupplier,
      loadSupplierTerms,
      saveSupplierTerms,
      loadSupplierCatalog,
      createQuote,
      createOrder,
      createInvoice,
      createReceipt,
      loadQuote,
      loadOrder,
      loadInvoice,
      convertQuoteToOrder,
      convertQuoteToInvoice,
      convertOrderToInvoice,
      createPurchaseOrder,
      createPurchaseReceipt,
      createSupplierPayment,
      loadPurchaseOrder,
      loadPurchaseReceipt,
      apiGet,
      apiPost,
      apiPut,
    }),
    [data, error, hydrated, refreshing, session, sessionDraft, refreshAll],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return value;
}
