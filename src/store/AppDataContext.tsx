import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

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
import { clearAuthTokens, readAuthTokens, writeAuthTokens } from "../services/authStorage";
import { UnauthorizedError, authRequest, dashboardRequest, detectDefaultBaseUrl, erpRequest, normalizeBaseUrl, setRetryTokenResolver } from "../services/api";

const STORAGE_KEY = "retail-management-mobile-session";

type AuthLoginRequest = {
  username: string;
  password: string;
  organizationId?: number;
  clientType: "MOBILE";
};

type AuthLoginResponse = {
  token: string;
  refreshToken?: string | null;
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
};

type AuthRefreshResponse = {
  token?: string;
  refreshToken?: string | null;
  type?: string;
};

type AppDataContextValue = {
  data: AppData;
  hydrated: boolean;
  refreshing: boolean;
  session: SessionState | null;
  sessionDraft: SessionDraft;
  error: string | null;
  updateSessionDraft: (patch: Partial<SessionDraft>) => Promise<void>;
  signIn: () => Promise<void>;
  switchOrganization: (organizationId: number) => Promise<void>;
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
  session: Omit<SessionState, "token" | "refreshToken"> | null;
  sessionDraft: SessionDraft;
};

function unwrapAuthPayload<T>(payload: T | { data?: T } | null | undefined): T | null {
  if (!payload) {
    return null;
  }
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data?: T }).data ?? null;
  }
  return payload as T;
}

function tokenExpiresSoon(token: string | null | undefined, aheadMs = 60_000) {
  if (!token) {
    return false;
  }
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return false;
    }
    if (typeof globalThis.atob !== "function") {
      return false;
    }
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(globalThis.atob(padded)) as { exp?: number };
    if (!decoded.exp) {
      return false;
    }
    return decoded.exp * 1000 - Date.now() < aheadMs;
  } catch {
    return false;
  }
}

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
  const sessionRef = useRef<SessionState | null>(null);
  const refreshingTokenRef = useRef<Promise<SessionState | null> | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const persistState = useCallback(async (nextSession: SessionState | null, nextDraft: SessionDraft) => {
    const safeDraft: SessionDraft = {
      ...nextDraft,
      password: "",
    };
    const payload: StoredState = {
      session: nextSession
        ? {
            baseUrl: nextSession.baseUrl,
            type: nextSession.type,
            userId: nextSession.userId,
            username: nextSession.username,
            email: nextSession.email,
            organizationId: nextSession.organizationId,
            organizationCode: nextSession.organizationCode,
            organizationName: nextSession.organizationName,
            branchId: nextSession.branchId,
            warehouseId: nextSession.warehouseId,
            roles: nextSession.roles,
            permissions: nextSession.permissions,
            memberships: nextSession.memberships,
          }
        : null,
      sessionDraft: safeDraft,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const signOut = useCallback(async () => {
    const activeSession = sessionRef.current;
    if (activeSession?.token) {
      try {
        await authRequest({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "POST",
          path: "/api/auth/logout",
          body: activeSession.refreshToken ? { refreshToken: activeSession.refreshToken } : undefined,
        });
      } catch {
        // best effort logout
      }
    }
    setSession(null);
    setData(emptyData);
    await clearAuthTokens();
    await persistState(null, sessionDraft);
  }, [persistState, sessionDraft]);

  const refreshSession = useCallback(async (baseSession?: SessionState | null): Promise<SessionState | null> => {
    const currentSession = baseSession ?? sessionRef.current;
    if (!currentSession?.refreshToken) {
      throw new UnauthorizedError("Refresh token not available");
    }
    if (refreshingTokenRef.current) {
      return refreshingTokenRef.current;
    }
    const refreshPromise = (async () => {
      let payload: AuthRefreshResponse | null = null;
      try {
        const rawPayload = await authRequest<AuthRefreshResponse | { data?: AuthRefreshResponse }>({
          baseUrl: currentSession.baseUrl,
          method: "POST",
          path: "/api/auth/refresh",
          body: { refreshToken: currentSession.refreshToken },
        });
        payload = unwrapAuthPayload<AuthRefreshResponse>(rawPayload);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to refresh session";
        throw new UnauthorizedError(message);
      }
      const nextToken = payload?.token;
      if (!nextToken) {
        throw new UnauthorizedError("Unable to refresh session");
      }
      const nextSession: SessionState = {
        ...currentSession,
        token: nextToken,
        refreshToken: payload?.refreshToken ?? currentSession.refreshToken,
        type: payload?.type ?? currentSession.type,
      };
      setSession(nextSession);
      sessionRef.current = nextSession;
      await writeAuthTokens({ token: nextSession.token, refreshToken: nextSession.refreshToken });
      await persistState(nextSession, sessionDraft);
      return nextSession;
    })();
    refreshingTokenRef.current = refreshPromise;
    try {
      return await refreshPromise;
    } finally {
      refreshingTokenRef.current = null;
    }
  }, [persistState, sessionDraft]);

  useEffect(() => {
    setRetryTokenResolver(async () => {
      const refreshed = await refreshSession(sessionRef.current);
      return refreshed?.token ?? null;
    });
    return () => setRetryTokenResolver(null);
  }, [refreshSession]);

  const handleUnauthorized = useCallback(
    async (nextError: unknown) => {
      if (nextError instanceof UnauthorizedError) {
        await signOut();
      }
      throw nextError;
    },
    [signOut],
  );

  async function authenticatedRequest<T>(fn: (activeSession?: SessionState) => Promise<T>): Promise<T> {
    const currentSession = sessionRef.current;
    if (!currentSession) {
      throw new Error("Please sign in first.");
    }
    try {
      if (tokenExpiresSoon(currentSession.token)) {
        await refreshSession(currentSession);
      }
      return await fn(sessionRef.current ?? currentSession);
    } catch (nextError) {
      if (nextError instanceof UnauthorizedError) {
        try {
          const refreshedSession = await refreshSession(sessionRef.current ?? currentSession);
          if (refreshedSession) {
            return await fn(refreshedSession);
          }
        } catch {}
      }
      await handleUnauthorized(nextError);
      throw nextError;
    }
  }

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [stored, tokens] = await Promise.all([AsyncStorage.getItem(STORAGE_KEY), readAuthTokens()]);
        if (!active) return;
        if (!stored) {
          if (!tokens?.token) {
            return;
          }
        }
        const parsed = stored ? (JSON.parse(stored) as StoredState) : null;
        if (parsed?.sessionDraft) {
          setSessionDraft({
            ...defaultSessionDraft,
            ...parsed.sessionDraft,
            baseUrl: normalizeBaseUrl(parsed.sessionDraft.baseUrl || detectDefaultBaseUrl()),
          });
        }
        if (parsed?.session && tokens?.token) {
          const hydratedSession: SessionState = {
            ...parsed.session,
            token: tokens.token,
            refreshToken: tokens.refreshToken ?? null,
          };
          setSession(hydratedSession);
          sessionRef.current = hydratedSession;
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
      if (nextError instanceof UnauthorizedError) {
        setError("Session expired. Please sign in again.");
        await signOut();
      } else {
        setError(nextError instanceof Error ? nextError.message : "Unable to refresh backend data.");
      }
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

  function toOptionalNumber(value: string | undefined) {
    if (!value) {
      return null;
    }
    const next = Number(value);
    return Number.isFinite(next) ? next : null;
  }

  async function updateSessionDraft(patch: Partial<SessionDraft>) {
    const nextDraft = {
      ...sessionDraft,
      ...patch,
      baseUrl: normalizeBaseUrl(patch.baseUrl ?? sessionDraft.baseUrl),
    };
    setSessionDraft(nextDraft);
    const activeSession = sessionRef.current;
    if (activeSession && patch.warehouseId !== undefined) {
      const nextSession: SessionState = {
        ...activeSession,
        warehouseId: toOptionalNumber(nextDraft.warehouseId),
      };
      setSession(nextSession);
      sessionRef.current = nextSession;
      await persistState(nextSession, nextDraft);
      return;
    }
    await persistState(activeSession, nextDraft);
  }

async function signIn() {
    setError(null);

    const baseUrl = normalizeBaseUrl(sessionDraft.baseUrl);

    try {
      const rawLoginResponse = await authRequest<AuthLoginResponse | { data?: AuthLoginResponse }>({
        baseUrl,
        method: "POST",
        path: "/api/auth/login",
        body: {
          username: sessionDraft.username.trim(),
          password: sessionDraft.password,
          clientType: "MOBILE",
        } as AuthLoginRequest,
      });
      const loginResponse = unwrapAuthPayload<AuthLoginResponse>(rawLoginResponse);
      if (!loginResponse?.token) {
        throw new Error("Login response did not include a token.");
      }
      const refreshToken = loginResponse.refreshToken ?? null;

      const membership =
        loginResponse.memberships?.find((entry) => entry.organizationId === loginResponse.organizationId) ??
        loginResponse.memberships?.[0] ??
        null;

    const nextSession: SessionState = {
      baseUrl,
      token: loginResponse.token,
      refreshToken,
      type: loginResponse.type ?? "Bearer",
      userId: loginResponse.id,
      username: loginResponse.username,
      email: loginResponse.email,
      organizationId: loginResponse.organizationId ?? membership?.organizationId ?? 1,
      organizationCode: loginResponse.organizationCode ?? membership?.organizationCode ?? "ORG",
      organizationName: loginResponse.organizationName ?? membership?.organizationName ?? "Retail Workspace",
      branchId: membership?.defaultBranchId ?? null,
      warehouseId: sessionDraft.warehouseId.trim() ? Number(sessionDraft.warehouseId) : null,
      roles: loginResponse.roles ?? [],
      permissions: loginResponse.permissions ?? [],
      memberships: loginResponse.memberships ?? [],
    };

    setSession(nextSession);
    sessionRef.current = nextSession;
    await writeAuthTokens({ token: nextSession.token, refreshToken: nextSession.refreshToken });
    const nextDraft = {
      ...sessionDraft,
      baseUrl,
      organizationId: String(nextSession.organizationId),
    };
    setSessionDraft(nextDraft);
    await persistState(nextSession, nextDraft);
    await refreshAllWith(nextSession);
  } catch (nextError) {
    const message = nextError instanceof Error ? nextError.message : "Unable to sign in.";
    setError(message);
    throw nextError;
  }
}

  async function switchOrganization(organizationId: number) {
    const activeSession = getSession();
    if (organizationId === activeSession.organizationId) {
      return;
    }

    setError(null);
    try {
      const rawResponse = await authenticatedRequest(() =>
        authRequest<AuthLoginResponse | { data?: AuthLoginResponse }>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "POST",
          path: "/api/auth/switch-organization",
          body: { organizationId },
        }),
      );
      const response = unwrapAuthPayload<AuthLoginResponse>(rawResponse);
      if (!response?.token) {
        throw new Error("Switch organization response did not include a token.");
      }

      const memberships = response.memberships ?? activeSession.memberships;
      const membership =
        memberships.find((entry) => entry.organizationId === (response.organizationId ?? organizationId)) ??
        memberships.find((entry) => entry.organizationId === organizationId) ??
        memberships[0] ??
        null;

      const nextSession: SessionState = {
        ...activeSession,
        token: response.token,
        refreshToken: response.refreshToken ?? activeSession.refreshToken,
        type: response.type ?? activeSession.type,
        userId: response.id ?? activeSession.userId,
        username: response.username ?? activeSession.username,
        email: response.email ?? activeSession.email,
        organizationId: response.organizationId ?? membership?.organizationId ?? organizationId,
        organizationCode: response.organizationCode ?? membership?.organizationCode ?? activeSession.organizationCode,
        organizationName: response.organizationName ?? membership?.organizationName ?? activeSession.organizationName,
        branchId: membership?.defaultBranchId ?? null,
        warehouseId: null,
        roles: response.roles ?? activeSession.roles,
        permissions: response.permissions ?? activeSession.permissions,
        memberships,
      };

      const nextDraft: SessionDraft = {
        ...sessionDraft,
        organizationId: String(nextSession.organizationId),
        warehouseId: "",
      };

      setSession(nextSession);
      sessionRef.current = nextSession;
      setSessionDraft(nextDraft);
      await writeAuthTokens({ token: nextSession.token, refreshToken: nextSession.refreshToken });
      await persistState(nextSession, nextDraft);
      await refreshAllWith(nextSession);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Unable to switch organization.";
      setError(message);
      throw nextError;
    }
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
        if (nextError instanceof UnauthorizedError) {
          setError("Session expired. Please sign in again.");
          await signOut();
        } else {
          setError(nextError instanceof Error ? nextError.message : "Unable to refresh backend data.");
        }
        throw nextError;
      } finally {
        setRefreshing(false);
      }
    },
    [],
  );

  async function runMutation<T>(path: string, method: "POST" | "PUT", body: Record<string, unknown>, query?: Record<string, unknown>) {
    const activeSession = getSession();
    const result = await authenticatedRequest(() =>
      erpRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method,
        path,
        query: query as Record<string, string | number | boolean | null | undefined>,
        body,
      }),
    );
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
      return await authenticatedRequest(() =>
        erpRequest<StoreCustomerTerms>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          path: `/api/erp/customers/${customerId}/terms`,
          query: { organizationId: activeSession.organizationId },
        }),
      );
    } catch {
      return null;
    }
  }

  async function saveCustomerTerms(customerId: number, payload: Record<string, unknown>) {
    const activeSession = getSession();
    try {
      return await authenticatedRequest(() =>
        erpRequest<StoreCustomerTerms>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "PUT",
          path: `/api/erp/customers/${customerId}/terms`,
          query: { organizationId: activeSession.organizationId },
          body: payload,
        }),
      );
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
      return await authenticatedRequest(() =>
        erpRequest<StoreSupplierTerms>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          path: `/api/erp/suppliers/${supplierId}/terms`,
          query: { organizationId: activeSession.organizationId },
        }),
      );
    } catch {
      return null;
    }
  }

  async function saveSupplierTerms(supplierId: number, payload: Record<string, unknown>) {
    const activeSession = getSession();
    try {
      return await authenticatedRequest(() =>
        erpRequest<StoreSupplierTerms>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "PUT",
          path: `/api/erp/suppliers/${supplierId}/terms`,
          query: { organizationId: activeSession.organizationId },
          body: payload,
        }),
      );
    } finally {
      await refreshAllWith(activeSession);
    }
  }

  async function loadSupplierCatalog(supplierId: number) {
    const activeSession = getSession();
    try {
      return await authenticatedRequest(() =>
        erpRequest<SupplierCatalog>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          path: `/api/erp/suppliers/${supplierId}/catalog`,
          query: { organizationId: activeSession.organizationId },
        }),
      );
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
    return authenticatedRequest(() =>
      erpRequest<SalesQuote>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/sales/quotes/${id}`,
      }),
    );
  }

  async function loadOrder(id: number) {
    const activeSession = getSession();
    return authenticatedRequest(() =>
      erpRequest<SalesOrder>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/sales/orders/${id}`,
      }),
    );
  }

  async function loadInvoice(id: number) {
    const activeSession = getSession();
    return authenticatedRequest(() =>
      erpRequest<SalesInvoice>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/sales/invoices/${id}`,
      }),
    );
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
    return authenticatedRequest(() =>
      erpRequest<PurchaseOrder>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/purchases/orders/${id}`,
      }),
    );
  }

  async function loadPurchaseReceipt(id: number) {
    const activeSession = getSession();
    return authenticatedRequest(() =>
      erpRequest<PurchaseReceipt>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path: `/api/erp/purchases/receipts/${id}`,
      }),
    );
  }

  async function apiGet<T>(
    path: string,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) {
    const activeSession = getSession();
    if (options?.kind === "dashboard") {
      return authenticatedRequest(() =>
        dashboardRequest<T>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          path,
          query: options.query,
        }),
      );
    }
    if (options?.kind === "auth") {
      return authenticatedRequest(() =>
        authRequest<T>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          path,
          query: options.query,
        }),
      );
    }
    return authenticatedRequest(() =>
      erpRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        path,
        query: options?.query,
      }),
    );
  }

  async function apiPost<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) {
    const activeSession = getSession();
    if (options?.kind === "dashboard") {
      return authenticatedRequest(() =>
        dashboardRequest<T>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "POST",
          path,
          query: options.query,
          body,
        }),
      );
    }
    if (options?.kind === "auth") {
      return authenticatedRequest(() =>
        authRequest<T>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "POST",
          path,
          query: options.query,
          body,
        }),
      );
    }
    return authenticatedRequest(() =>
      erpRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "POST",
        path,
        query: options?.query,
        body,
      }),
    );
  }

  async function apiPut<T>(
    path: string,
    body?: Record<string, unknown>,
    options?: { query?: Record<string, string | number | boolean | null | undefined>; kind?: "erp" | "dashboard" | "auth" },
  ) {
    const activeSession = getSession();
    if (options?.kind === "dashboard") {
      return authenticatedRequest(() =>
        dashboardRequest<T>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "PUT",
          path,
          query: options.query,
          body,
        }),
      );
    }
    if (options?.kind === "auth") {
      return authenticatedRequest(() =>
        authRequest<T>({
          baseUrl: activeSession.baseUrl,
          token: activeSession.token,
          method: "PUT",
          path,
          query: options.query,
          body,
        }),
      );
    }
    return authenticatedRequest(() =>
      erpRequest<T>({
        baseUrl: activeSession.baseUrl,
        token: activeSession.token,
        method: "PUT",
        path,
        query: options?.query,
        body,
      }),
    );
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
      switchOrganization,
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
