import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton, BackButton, GlassCard, Pill, SearchableSelect, SectionHeader } from "../../components/Ui";
import { PurchaseOrder, PurchaseReceipt } from "../../data/entities";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { hasAnyPermission, hasPermission } from "../../utils/access";
import { formatCurrency } from "../../utils/formatters";

type MoreView = "workspace" | "purchases" | "returns" | "service" | "finance" | "system" | "platform";
type PurchaseDraft = "order" | "receipt" | "payment";

type PurchaseLineDraft = {
  productId: string;
  supplierProductId: string;
  uomId: string;
  quantity: string;
  baseQuantity: string;
  unitValue: string;
  taxRate: string;
};

type SalesReturn = { id: number; returnNumber?: string; returnDate?: string; totalAmount?: number; status?: string };
type PurchaseReturn = { id: number; returnNumber?: string; returnDate?: string; totalAmount?: number; status?: string };
type ServiceTicket = { id: number; ticketNumber?: string; complaintSummary?: string; status?: string; priority?: string };
type WarrantyClaim = { id: number; claimNumber?: string; claimType?: string; status?: string };
type ServiceReplacement = { id: number; replacementNumber?: string; replacementType?: string; status?: string };
type Account = { id: number; code?: string; name?: string; accountType?: string };
type Voucher = { id: number; voucherNumber?: string; voucherType?: string; voucherDate?: string; status?: string };
type Expense = { id: number; expenseNumber?: string; amount?: number; status?: string; expenseDate?: string };
type BankReconciliationSummary = { unmatchedCount?: number; reconciledCount?: number; statementBalance?: number; bookBalance?: number };
type Organization = { id: number; name?: string; code?: string; gstin?: string; isActive?: boolean };
type Subscription = { planCode?: string; planName?: string; status?: string; startsOn?: string; endsOn?: string };
type TaxRegistration = { id: number; registrationName?: string; gstin?: string; registrationStateCode?: string; isActive?: boolean };
type TaxRegistrationListResponse = { registrations?: TaxRegistration[] };
type ThresholdStatus = { financialYearTurnover?: number; gstThresholdAmount?: number; alertLevel?: string; message?: string };
type UserRecord = { id: number; username?: string; email?: string; active?: boolean; roles?: string[] };
type HealthResponse = { success?: boolean; message?: string; data?: Record<string, unknown>; error?: string; timestamp?: string };
type NotificationTemplate = { id: number; templateCode?: string; name?: string; type?: string; channel?: string; isActive?: boolean };
type NotificationResponse = { notificationId?: string; status?: string; channel?: string; recipient?: string; title?: string };
type ReportSchedule = { id: number; scheduleName?: string; reportType?: string; format?: string; nextRunDate?: string; isActive?: boolean };
type BranchRecord = { id: number; code?: string; name?: string; city?: string; state?: string; isActive?: boolean };
type EmployeeRecord = { id: number; username?: string; fullName?: string; email?: string; roleCode?: string; defaultBranchId?: number; active?: boolean; branchAccess?: { branchId?: number; isDefault?: boolean }[] };
type WarehouseRecord = { id: number; branchId?: number; code?: string; name?: string; isPrimary?: boolean; isActive?: boolean };
type ExpenseCategoryRecord = { id: number; code?: string; name?: string; expenseAccountId?: number; isActive?: boolean };

const emptyPurchaseLine: PurchaseLineDraft = {
  productId: "",
  supplierProductId: "",
  uomId: "",
  quantity: "1",
  baseQuantity: "1",
  unitValue: "",
  taxRate: "",
};

export function SettingsScreen({
  initialView = "workspace",
  allowedViews,
  title = "System",
  subtitle = "Organization, service, finance, automation, and platform operations from the latest backend flows.",
  onDirtyChange,
  onRegisterBackHandler,
}: {
  initialView?: MoreView;
  allowedViews?: MoreView[];
  title?: string;
  subtitle?: string;
  onDirtyChange?: (dirty: boolean) => void;
  onRegisterBackHandler?: (handler: (() => boolean) | null) => void;
}) {
  const {
    apiGet,
    apiPost,
    apiPut,
    createPurchaseOrder,
    createPurchaseReceipt,
    createSupplierPayment,
    data,
    error,
    loadPurchaseOrder,
    loadPurchaseReceipt,
    refreshAll,
    session,
    signOut,
    updateSessionDraft,
  } = useAppData();
  const [viewHistory, setViewHistory] = useState<MoreView[]>([initialView]);
  const [draftType, setDraftType] = useState<PurchaseDraft>("order");
  const [supplierId, setSupplierId] = useState("");
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [placeOfSupplyStateCode, setPlaceOfSupplyStateCode] = useState("27");
  const [remarks, setRemarks] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [lines, setLines] = useState<PurchaseLineDraft[]>([{ ...emptyPurchaseLine }]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchaseReceipt | null>(null);
  const [saving, setSaving] = useState(false);

  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [returnForm, setReturnForm] = useState({ kind: "sales", originalId: "", productLineId: "", quantity: "1", baseQuantity: "1", reason: "" });

  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [replacements, setReplacements] = useState<ServiceReplacement[]>([]);
  const [serviceForm, setServiceForm] = useState({ customerId: "", productId: "", complaintSummary: "", priority: "HIGH", sourceType: "WALK_IN", claimType: "WARRANTY", replacementProductId: "", warehouseId: String(session?.warehouseId ?? "") });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryRecord[]>([]);
  const [bankSummary, setBankSummary] = useState<BankReconciliationSummary | null>(null);
  const [financeForm, setFinanceForm] = useState({ accountCode: "", accountName: "", accountType: "BANK", voucherAccountId: "", voucherDebit: "", voucherCredit: "", expenseCategoryId: "", expenseAmount: "", bankAccountId: "", fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10), toDate: new Date().toISOString().slice(0, 10) });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [taxRegistrations, setTaxRegistrations] = useState<TaxRegistration[]>([]);
  const [thresholdStatus, setThresholdStatus] = useState<ThresholdStatus | null>(null);
  const [systemForm, setSystemForm] = useState({
    organizationName: "",
    organizationCode: "",
    organizationGstin: "",
    branchCode: "",
    branchName: "",
    taxName: "",
    taxGstin: "",
    taxStateCode: "27",
    thresholdAmount: "",
    employeeUsername: "",
    employeePassword: "",
    employeeFullName: "",
    employeeEmail: "",
    employeePhone: "",
    employeeRoleCode: "MANAGER",
    employeeDefaultBranchId: "",
  });
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [platformForm, setPlatformForm] = useState({
    emailTo: "",
    emailSubject: "",
    emailContent: "",
    smsPhone: "",
    smsMessage: "",
    templateCode: "",
    templateName: "",
    templateType: "SYSTEM_ALERT",
    templateChannel: "EMAIL",
    scheduleName: "",
    scheduleReportType: "SALES_SUMMARY",
    scheduleFormat: "PDF",
    scheduleFrequency: "DAILY",
    scheduleCron: "0 0 9 * * *",
    scheduleRecipients: "",
  });
  const [moduleMessage, setModuleMessage] = useState("");
  const activeView = viewHistory[viewHistory.length - 1] ?? initialView;
  const canManageSettings = hasPermission(session, "settings.manage");
  const canManageUsers = hasPermission(session, "users.manage");
  const canManageApprovals = hasPermission(session, "approvals.manage");
  const canViewPurchases = hasPermission(session, "purchases.view");
  const canCreatePurchases = hasPermission(session, "purchases.create");
  const canReceivePurchases = hasPermission(session, "purchases.receive");
  const canPaySuppliers = hasPermission(session, "payments.supplier");
  const canViewReturns = hasAnyPermission(session, ["sales.return", "purchases.view"]);
  const canCreateReturns = hasAnyPermission(session, ["sales.return", "purchases.create", "purchases.receive"]);
  const canViewService = hasPermission(session, "service.view");
  const canManageService = hasPermission(session, "service.manage");
  const canManageClaims = hasPermission(session, "service.claims");
  const canViewFinance = hasAnyPermission(session, ["expenses.view", "payments.customer", "payments.supplier", "reports.view"]);
  const canCreateExpenses = hasPermission(session, "expenses.create");
  const canApproveExpenses = hasPermission(session, "expenses.approve");
  const canMutateFinanceRecords = hasAnyPermission(session, ["expenses.create", "expenses.approve", "settings.manage"]);
  const canViewSystem = hasAnyPermission(session, ["settings.manage", "users.manage", "approvals.manage"]);
  const canMutateSystem = hasAnyPermission(session, ["settings.manage", "users.manage"]);
  const canPlatformManage = hasPermission(session, "platform.manage");
  const requestedViews: MoreView[] = allowedViews ?? ["workspace", "purchases", "returns", "service", "finance", "system", "platform"];
  const visibleViews: MoreView[] = requestedViews.filter((view) => {
    if (view === "workspace") return true;
    if (view === "purchases") return canViewPurchases || canCreatePurchases || canReceivePurchases || canPaySuppliers;
    if (view === "returns") return canViewReturns;
    if (view === "service") return canViewService || canManageService || canManageClaims;
    if (view === "finance") return canViewFinance || canMutateFinanceRecords;
    if (view === "system") return canViewSystem;
    if (view === "platform") return canPlatformManage;
    return false;
  });
  const purchaseDraftOptions: PurchaseDraft[] = [
    ...(canCreatePurchases ? (["order"] as const) : []),
    ...(canReceivePurchases ? (["receipt"] as const) : []),
    ...(canPaySuppliers ? (["payment"] as const) : []),
  ];
  const supplierMap = new Map(data.suppliers.map((supplier) => [supplier.id, supplier]));
  const productMap = new Map(data.products.map((product) => [product.id, product]));
  const customerMap = new Map(data.customers.map((customer) => [customer.id, customer]));
  const branchMap = new Map(branches.map((branch) => [branch.id, branch]));
  const warehouseMap = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));
  const accountMap = new Map(accounts.map((account) => [account.id, account]));
  const supplierOptions = data.suppliers.map((supplier) => ({
    id: String(supplier.id),
    label: supplier.name,
    meta: `${supplier.supplierCode}${supplier.phone ? ` • ${supplier.phone}` : ""}${supplier.state ? ` • ${supplier.state}` : ""}`,
  }));
  const productOptions = data.products.map((product) => ({
    id: String(product.id),
    label: product.name,
    meta: `${product.sku || ""}${product.baseUomId ? ` • UOM ${product.baseUomId}` : ""}${product.inventoryTrackingMode ? ` • ${product.inventoryTrackingMode}` : ""}`,
  }));
  const branchOptions = branches.map((branch) => ({
    id: String(branch.id),
    label: branch.name || branch.code || `Branch ${branch.id}`,
    meta: branch.code || branch.state || undefined,
  }));
  const warehouseOptions = warehouses.map((warehouse) => ({
    id: String(warehouse.id),
    label: warehouse.name || warehouse.code || `Warehouse ${warehouse.id}`,
    meta: `${warehouse.code || ""}${branchMap.get(warehouse.branchId ?? 0)?.name ? ` • ${branchMap.get(warehouse.branchId ?? 0)?.name}` : ""}${warehouse.isPrimary ? " • Primary" : ""}`,
  }));
  const expenseCategoryOptions = expenseCategories.map((category) => ({
    id: String(category.id),
    label: category.name || category.code || `Category ${category.id}`,
    meta: category.code || undefined,
  }));
  const salesInvoiceOptions = data.invoices.map((invoice) => ({
    id: String(invoice.id),
    label: invoice.invoiceNumber || `Invoice ${invoice.id}`,
    meta: `${customerMap.get(invoice.customerId)?.fullName || `Customer ${invoice.customerId}`}${invoice.invoiceDate ? ` • ${invoice.invoiceDate}` : ""}`,
  }));
  const purchaseOrderOptions = data.purchaseOrders.map((order) => ({
    id: String(order.id),
    label: order.poNumber || `PO ${order.id}`,
    meta: `${supplierMap.get(order.supplierId)?.name || `Supplier ${order.supplierId}`}${order.poDate ? ` • ${order.poDate}` : ""}`,
  }));
  const purchaseReceiptOptions = data.purchaseReceipts.map((receipt) => ({
    id: String(receipt.id),
    label: receipt.receiptNumber || `Receipt ${receipt.id}`,
    meta: `${supplierMap.get(receipt.supplierId)?.name || `Supplier ${receipt.supplierId}`}${receipt.receiptDate ? ` • ${receipt.receiptDate}` : ""}`,
  }));
  const paymentMethodOptions = [
    { id: "BANK", label: "Bank transfer" },
    { id: "CASH", label: "Cash" },
    { id: "UPI", label: "UPI" },
    { id: "CARD", label: "Card" },
    { id: "CHEQUE", label: "Cheque" },
  ];
  const servicePriorityOptions = [
    { id: "LOW", label: "Low" },
    { id: "MEDIUM", label: "Medium" },
    { id: "HIGH", label: "High" },
    { id: "CRITICAL", label: "Critical" },
  ];
  const claimTypeOptions = [
    { id: "WARRANTY", label: "Warranty" },
    { id: "OUT_OF_WARRANTY", label: "Out of warranty" },
    { id: "DOA", label: "Dead on arrival" },
  ];
  const accountTypeOptions = [
    { id: "ASSET", label: "Asset" },
    { id: "LIABILITY", label: "Liability" },
    { id: "INCOME", label: "Income" },
    { id: "EXPENSE", label: "Expense" },
    { id: "BANK", label: "Bank" },
    { id: "CASH", label: "Cash" },
  ];
  const employeeRoleOptions = [
    { id: "OWNER", label: "Owner" },
    { id: "ADMIN", label: "Admin" },
    { id: "ACCOUNTANT", label: "Accountant" },
    { id: "STORE_MANAGER", label: "Store Manager" },
    { id: "CASHIER", label: "Cashier" },
    { id: "PURCHASE_OPERATOR", label: "Purchase Operator" },
    { id: "TECHNICIAN", label: "Technician" },
    { id: "VIEWER", label: "Viewer" },
  ];
  const templateTypeOptions = [
    { id: "SYSTEM_ALERT", label: "System alert" },
    { id: "REPORT_DELIVERED", label: "Report delivered" },
    { id: "LOW_STOCK_ALERT", label: "Low stock alert" },
    { id: "PAYMENT_RECEIVED", label: "Payment received" },
  ];
  const templateChannelOptions = [
    { id: "EMAIL", label: "Email" },
    { id: "SMS", label: "SMS" },
    { id: "PUSH_NOTIFICATION", label: "Push notification" },
    { id: "IN_APP", label: "In-app" },
    { id: "WEBHOOK", label: "Webhook" },
  ];
  const reportTypeOptions = [
    { id: "SALES_SUMMARY", label: "Sales summary" },
    { id: "PURCHASE_SUMMARY", label: "Purchase summary" },
    { id: "INVENTORY_SUMMARY", label: "Inventory summary" },
    { id: "TAX_REPORT", label: "Tax report" },
    { id: "PROFIT_LOSS", label: "Profit and loss" },
  ];
  const scheduleFormatOptions = [
    { id: "PDF", label: "PDF" },
    { id: "EXCEL", label: "Excel" },
    { id: "CSV", label: "CSV" },
    { id: "HTML", label: "HTML" },
    { id: "JSON", label: "JSON" },
  ];
  const scheduleFrequencyOptions = [
    { id: "DAILY", label: "Daily" },
    { id: "WEEKLY", label: "Weekly" },
    { id: "MONTHLY", label: "Monthly" },
  ];
  const isPurchasesDirty =
    activeView === "purchases" &&
    (
      supplierId.trim().length > 0 ||
      dueDate.trim().length > 0 ||
      purchaseOrderId.trim().length > 0 ||
      remarks.trim().length > 0 ||
      referenceNumber.trim().length > 0 ||
      paymentAmount.trim().length > 0 ||
      lines.some((line) =>
        line.productId.trim().length > 0 ||
        line.supplierProductId.trim().length > 0 ||
        line.uomId.trim().length > 0 ||
        line.quantity !== "1" ||
        line.baseQuantity !== "1" ||
        line.unitValue.trim().length > 0 ||
        line.taxRate.trim().length > 0,
      )
    );
  const isReturnsDirty =
    activeView === "returns" &&
    (
      returnForm.originalId.trim().length > 0 ||
      returnForm.productLineId.trim().length > 0 ||
      returnForm.quantity !== "1" ||
      returnForm.baseQuantity !== "1" ||
      returnForm.reason.trim().length > 0
    );
  const isServiceDirty =
    activeView === "service" &&
    Object.values(serviceForm).some((value) => value.trim().length > 0);
  const isFinanceDirty =
    activeView === "finance" &&
    (
      financeForm.accountCode.trim().length > 0 ||
      financeForm.accountName.trim().length > 0 ||
      financeForm.voucherAccountId.trim().length > 0 ||
      financeForm.voucherDebit.trim().length > 0 ||
      financeForm.voucherCredit.trim().length > 0 ||
      financeForm.expenseCategoryId.trim().length > 0 ||
      financeForm.expenseAmount.trim().length > 0 ||
      financeForm.bankAccountId.trim().length > 0
    );
  const isSystemDirty =
    activeView === "system" &&
    Object.values(systemForm).some((value) => value.trim().length > 0);
  const isPlatformDirty =
    activeView === "platform" &&
    Object.values(platformForm).some((value) => value.trim().length > 0);

  useEffect(() => {
    setViewHistory([initialView]);
  }, [initialView]);

  useEffect(() => {
    if (!visibleViews.includes(activeView)) {
      setViewHistory([visibleViews[0] ?? "workspace"]);
    }
  }, [activeView, visibleViews]);

  useEffect(() => {
    if (!purchaseDraftOptions.includes(draftType)) {
      setDraftType(purchaseDraftOptions[0] ?? "order");
    }
  }, [draftType, purchaseDraftOptions]);

  function navigateView(view: MoreView) {
    setViewHistory((current) => (current[current.length - 1] === view ? current : [...current, view]));
  }

  function confirmDiscard(onConfirm: () => void) {
    const thing = isPurchasesDirty
      ? "purchase form changes"
      : isReturnsDirty
        ? "return form changes"
        : isServiceDirty
          ? "service form changes"
          : isFinanceDirty
            ? "finance form changes"
            : isSystemDirty
              ? "system setup changes"
              : "platform tooling changes";
    Alert.alert("Discard changes?", `You have unsaved ${thing} in this module.`, [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: onConfirm },
    ]);
  }

  function resetDirtyState() {
    setSupplierId("");
    setDueDate("");
    setPurchaseOrderId("");
    setRemarks("");
    setReferenceNumber("");
    setPaymentAmount("");
    setLines([{ ...emptyPurchaseLine }]);
    setReturnForm({ kind: "sales", originalId: "", productLineId: "", quantity: "1", baseQuantity: "1", reason: "" });
    setServiceForm({ customerId: "", productId: "", complaintSummary: "", priority: "HIGH", sourceType: "WALK_IN", claimType: "WARRANTY", replacementProductId: "", warehouseId: String(session?.warehouseId ?? "") });
    setFinanceForm((current) => ({ ...current, accountCode: "", accountName: "", voucherAccountId: "", voucherDebit: "", voucherCredit: "", expenseCategoryId: "", expenseAmount: "", bankAccountId: "" }));
    setSystemForm({
      organizationName: "",
      organizationCode: "",
      organizationGstin: "",
      branchCode: "",
      branchName: "",
      taxName: "",
      taxGstin: "",
      taxStateCode: "27",
      thresholdAmount: "",
      employeeUsername: "",
      employeePassword: "",
      employeeFullName: "",
      employeeEmail: "",
      employeePhone: "",
      employeeRoleCode: "MANAGER",
      employeeDefaultBranchId: "",
    });
    setPlatformForm({
      emailTo: "",
      emailSubject: "",
      emailContent: "",
      smsPhone: "",
      smsMessage: "",
      templateCode: "",
      templateName: "",
      templateType: "SYSTEM_ALERT",
      templateChannel: "EMAIL",
      scheduleName: "",
      scheduleReportType: "SALES_SUMMARY",
      scheduleFormat: "PDF",
      scheduleFrequency: "DAILY",
      scheduleCron: "0 0 9 * * *",
      scheduleRecipients: "",
    });
  }

  function navigateViewWithGuard(view: MoreView) {
    if (view === activeView) {
      return;
    }
    if (isPurchasesDirty || isReturnsDirty || isServiceDirty || isFinanceDirty || isSystemDirty || isPlatformDirty) {
      confirmDiscard(() => {
        resetDirtyState();
        navigateView(view);
      });
      return;
    }
    navigateView(view);
  }

  React.useEffect(() => {
    onDirtyChange?.(isPurchasesDirty || isReturnsDirty || isServiceDirty || isFinanceDirty || isSystemDirty || isPlatformDirty);
    return () => onDirtyChange?.(false);
  }, [isFinanceDirty, isPlatformDirty, isPurchasesDirty, isReturnsDirty, isServiceDirty, isSystemDirty, onDirtyChange]);

  const canHandleBack =
    selectedOrder != null ||
    selectedReceipt != null ||
    viewHistory.length > 1 ||
    isPurchasesDirty ||
    isReturnsDirty ||
    isServiceDirty ||
    isFinanceDirty ||
    isSystemDirty ||
    isPlatformDirty;
  useEffect(() => {
    if (!onRegisterBackHandler) {
      return;
    }
    if (!canHandleBack) {
      onRegisterBackHandler(null);
      return;
    }
    onRegisterBackHandler(() => {
      goBack();
      return true;
    });
    return () => onRegisterBackHandler(null);
  }, [canHandleBack, isFinanceDirty, isPlatformDirty, isPurchasesDirty, isReturnsDirty, isServiceDirty, isSystemDirty, onRegisterBackHandler, selectedOrder, selectedReceipt, viewHistory.length]);

  function goBack() {
    if (selectedOrder || selectedReceipt) {
      setSelectedOrder(null);
      setSelectedReceipt(null);
      return;
    }
    if (isPurchasesDirty || isReturnsDirty || isServiceDirty || isFinanceDirty || isSystemDirty || isPlatformDirty) {
      confirmDiscard(() => {
        resetDirtyState();
        setViewHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
      });
      return;
    }
    setViewHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  useEffect(() => {
    if (!session?.organizationId) return;
    if (activeView === "returns") {
      apiGet<SalesReturn[]>("/api/erp/returns/sales", { query: { organizationId: session.organizationId } }).then(setSalesReturns).catch(() => setSalesReturns([]));
      apiGet<PurchaseReturn[]>("/api/erp/returns/purchases", { query: { organizationId: session.organizationId } }).then(setPurchaseReturns).catch(() => setPurchaseReturns([]));
    }
    if (activeView === "service") {
      apiGet<ServiceTicket[]>("/api/erp/service/tickets", { query: { organizationId: session.organizationId } }).then(setTickets).catch(() => setTickets([]));
      apiGet<WarrantyClaim[]>("/api/erp/service/warranty-claims", { query: { organizationId: session.organizationId } }).then(setClaims).catch(() => setClaims([]));
      apiGet<ServiceReplacement[]>("/api/erp/service/replacements", { query: { organizationId: session.organizationId } }).then(setReplacements).catch(() => setReplacements([]));
    }
    if (activeView === "workspace" || activeView === "service" || activeView === "finance" || activeView === "system") {
      apiGet<WarehouseRecord[]>("/api/erp/warehouses", { query: { organizationId: session.organizationId } }).then(setWarehouses).catch(() => setWarehouses([]));
    }
    if (activeView === "finance") {
      apiGet<Account[]>("/api/erp/finance/accounts", { query: { organizationId: session.organizationId } }).then(setAccounts).catch(() => setAccounts([]));
      apiGet<Voucher[]>("/api/erp/finance/vouchers", { query: { organizationId: session.organizationId } }).then(setVouchers).catch(() => setVouchers([]));
      apiGet<Expense[]>("/api/erp/expenses", { query: { organizationId: session.organizationId } }).then(setExpenses).catch(() => setExpenses([]));
      apiGet<ExpenseCategoryRecord[]>("/api/erp/expenses/categories", { query: { organizationId: session.organizationId } }).then(setExpenseCategories).catch(() => setExpenseCategories([]));
      apiPost<BankReconciliationSummary>("/api/erp/finance/bank-reconciliation/summary", {
        accountId: financeForm.bankAccountId ? Number(financeForm.bankAccountId) : 0,
        fromDate: financeForm.fromDate,
        toDate: financeForm.toDate,
      }, { query: { organizationId: session.organizationId } }).then(setBankSummary).catch(() => setBankSummary(null));
    }
    if (activeView === "system") {
      apiGet<Organization[]>("/api/erp/organizations").then(setOrganizations).catch(() => setOrganizations([]));
      apiGet<BranchRecord[]>("/api/erp/branches", { query: { organizationId: session.organizationId } }).then(setBranches).catch(() => setBranches([]));
      apiGet<EmployeeRecord[]>("/api/erp/employees", { query: { organizationId: session.organizationId } }).then(setEmployees).catch(() => setEmployees([]));
      apiGet<UserRecord[]>("/api/users", { kind: "auth" }).then(setUsers).catch(() => setUsers([]));
      apiGet<Subscription>("/api/erp/subscriptions/current", { query: { organizationId: session.organizationId } }).then(setSubscription).catch(() => setSubscription(null));
      apiGet<TaxRegistrationListResponse>("/api/erp/tax/registrations", { query: { organizationId: session.organizationId } }).then((response) => setTaxRegistrations(response.registrations ?? [])).catch(() => setTaxRegistrations([]));
      apiGet<ThresholdStatus>("/api/erp/tax/threshold-status", { query: { organizationId: session.organizationId } }).then(setThresholdStatus).catch(() => setThresholdStatus(null));
    }
    if (activeView === "platform") {
      apiGet<HealthResponse>("/api/health", { kind: "auth" }).then(setHealth).catch(() => setHealth(null));
      apiGet<NotificationTemplate[]>("/api/notification-templates/active", { kind: "auth" }).then(setTemplates).catch(async () => {
        try {
          const activeTemplates = await apiGet<NotificationTemplate[]>("/api/notification-templates", { kind: "auth" });
          setTemplates(activeTemplates);
        } catch {
          setTemplates([]);
        }
      });
      apiGet<ReportSchedule[]>("/api/report-schedules/active", { kind: "auth" }).then(setSchedules).catch(() => setSchedules([]));
    }
  }, [activeView, apiGet, apiPost, financeForm.bankAccountId, financeForm.fromDate, financeForm.toDate, session?.organizationId]);

  async function handleCreatePurchase() {
    if (!(canCreatePurchases || canReceivePurchases || canPaySuppliers)) {
      return;
    }
    setSaving(true);
    try {
      if (draftType === "payment") {
        await createSupplierPayment({
          supplierId: Number(supplierId),
          paymentDate: documentDate,
          paymentMethod,
          referenceNumber: referenceNumber || null,
          amount: Number(paymentAmount),
          remarks: remarks || null,
        });
      } else {
        const mappedLines = lines.map((line) => ({
          productId: Number(line.productId),
          supplierProductId: line.supplierProductId ? Number(line.supplierProductId) : null,
          uomId: Number(line.uomId),
          quantity: Number(line.quantity),
          baseQuantity: Number(line.baseQuantity),
          unitPrice: Number(line.unitValue),
          unitCost: Number(line.unitValue),
          taxRate: line.taxRate ? Number(line.taxRate) : null,
        }));
        if (draftType === "order") {
          await createPurchaseOrder({
            supplierId: Number(supplierId),
            poDate: documentDate,
            placeOfSupplyStateCode,
            remarks: remarks || null,
            lines: mappedLines.map((line) => ({
              productId: line.productId,
              supplierProductId: line.supplierProductId,
              uomId: line.uomId,
              quantity: line.quantity,
              baseQuantity: line.baseQuantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
            })),
          });
        } else {
          await createPurchaseReceipt({
            purchaseOrderId: purchaseOrderId ? Number(purchaseOrderId) : null,
            supplierId: Number(supplierId),
            receiptDate: documentDate,
            dueDate: dueDate || null,
            placeOfSupplyStateCode,
            remarks: remarks || null,
            lines: mappedLines.map((line) => ({
              purchaseOrderLineId: null,
              productId: line.productId,
              supplierProductId: line.supplierProductId,
              uomId: line.uomId,
              quantity: line.quantity,
              baseQuantity: line.baseQuantity,
              unitCost: line.unitCost,
              taxRate: line.taxRate,
              serialNumbers: [],
              batchEntries: [],
            })),
          });
        }
      }
      setModuleMessage("Purchase flow saved.");
      await refreshAll();
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateReturn() {
    if (!canCreateReturns) return;
    if (!session?.organizationId || !session?.branchId) return;
    if (returnForm.kind === "sales") {
      await apiPost("/api/erp/returns/sales", {
        organizationId: session.organizationId,
        branchId: session.branchId,
        originalSalesInvoiceId: Number(returnForm.originalId),
        returnDate: documentDate,
        reason: returnForm.reason,
        lines: [{
          originalSalesInvoiceLineId: Number(returnForm.productLineId),
          quantity: Number(returnForm.quantity),
          baseQuantity: Number(returnForm.baseQuantity),
          reason: returnForm.reason,
        }],
      });
    } else {
      await apiPost("/api/erp/returns/purchases", {
        organizationId: session.organizationId,
        branchId: session.branchId,
        originalPurchaseReceiptId: Number(returnForm.originalId),
        returnDate: documentDate,
        reason: returnForm.reason,
        lines: [{
          originalPurchaseReceiptLineId: Number(returnForm.productLineId),
          quantity: Number(returnForm.quantity),
          baseQuantity: Number(returnForm.baseQuantity),
          reason: returnForm.reason,
        }],
      });
    }
    setModuleMessage("Return created.");
  }

  async function handleCreateServiceTicket() {
    if (!canManageService) return;
    if (!session?.organizationId || !session?.branchId) return;
    await apiPost("/api/erp/service/tickets", {
      organizationId: session.organizationId,
      branchId: session.branchId,
      customerId: Number(serviceForm.customerId),
      sourceType: serviceForm.sourceType,
      priority: serviceForm.priority,
      complaintSummary: serviceForm.complaintSummary,
      items: [{ productId: Number(serviceForm.productId) }],
    });
    setModuleMessage("Service ticket created.");
  }

  async function handleCreateClaim() {
    if (!(canManageService || canManageClaims)) return;
    if (!session?.organizationId || !session?.branchId) return;
    await apiPost("/api/erp/service/warranty-claims", {
      organizationId: session.organizationId,
      branchId: session.branchId,
      customerId: Number(serviceForm.customerId),
      productId: Number(serviceForm.productId),
      claimType: serviceForm.claimType,
    });
    setModuleMessage("Warranty claim created.");
  }

  async function handleCreateReplacement() {
    if (!canManageService) return;
    if (!session?.organizationId || !session?.branchId) return;
    await apiPost("/api/erp/service/replacements", {
      organizationId: session.organizationId,
      branchId: session.branchId,
      warehouseId: Number(serviceForm.warehouseId),
      customerId: Number(serviceForm.customerId),
      originalProductId: Number(serviceForm.productId),
      replacementProductId: Number(serviceForm.replacementProductId),
      replacementUomId: 1,
      replacementQuantity: 1,
      replacementBaseQuantity: 1,
      replacementType: "WARRANTY",
    });
    setModuleMessage("Service replacement issued.");
  }

  async function handleCreateFinanceRecords() {
    if (!canMutateFinanceRecords) return;
    if (!session?.organizationId || !session?.branchId) return;
    if (financeForm.accountCode && financeForm.accountName) {
      await apiPost("/api/erp/finance/accounts", {
        organizationId: session.organizationId,
        code: financeForm.accountCode,
        name: financeForm.accountName,
        accountType: financeForm.accountType,
      });
    }
    if (financeForm.voucherAccountId && (financeForm.voucherDebit || financeForm.voucherCredit)) {
      await apiPost("/api/erp/finance/vouchers", {
        organizationId: session.organizationId,
        branchId: session.branchId,
        voucherType: "JOURNAL",
        voucherDate: documentDate,
        lines: [{
          accountId: Number(financeForm.voucherAccountId),
          debitAmount: financeForm.voucherDebit ? Number(financeForm.voucherDebit) : 0,
          creditAmount: financeForm.voucherCredit ? Number(financeForm.voucherCredit) : 0,
        }],
      });
    }
    if (financeForm.expenseCategoryId && financeForm.expenseAmount) {
      await apiPost("/api/erp/expenses", {
        organizationId: session.organizationId,
        branchId: session.branchId,
        expenseCategoryId: Number(financeForm.expenseCategoryId),
        amount: Number(financeForm.expenseAmount),
      });
    }
    setModuleMessage("Finance records submitted.");
  }

  async function handleCreateSystemRecords() {
    if (!canMutateSystem) return;
    if (!session?.organizationId) return;
    if (systemForm.organizationName && systemForm.organizationCode) {
      await apiPost("/api/erp/organizations", {
        name: systemForm.organizationName,
        code: systemForm.organizationCode,
        gstin: systemForm.organizationGstin || null,
      });
    }
    if (systemForm.branchCode && systemForm.branchName) {
      await apiPost("/api/erp/branches", {
        organizationId: session.organizationId,
        code: systemForm.branchCode,
        name: systemForm.branchName,
        isActive: true,
      });
    }
    if (systemForm.taxName && systemForm.taxGstin) {
      await apiPost("/api/erp/tax/registrations", {
        registrationName: systemForm.taxName,
        gstin: systemForm.taxGstin,
        registrationStateCode: systemForm.taxStateCode,
        effectiveFrom: documentDate,
      }, {
        query: { organizationId: session.organizationId },
      });
    }
    if (systemForm.thresholdAmount) {
      await apiPut("/api/erp/tax/threshold-settings", {
        gstThresholdAmount: Number(systemForm.thresholdAmount),
        gstThresholdAlertEnabled: true,
      }, {
        query: { organizationId: session.organizationId },
      });
    }
    if (
      systemForm.employeeUsername &&
      systemForm.employeePassword &&
      systemForm.employeeFullName &&
      systemForm.employeeDefaultBranchId
    ) {
      await apiPost("/api/erp/employees", {
        organizationId: session.organizationId,
        username: systemForm.employeeUsername,
        password: systemForm.employeePassword,
        fullName: systemForm.employeeFullName,
        email: systemForm.employeeEmail || null,
        phone: systemForm.employeePhone || null,
        roleCode: systemForm.employeeRoleCode,
        defaultBranchId: Number(systemForm.employeeDefaultBranchId),
        branchIds: [Number(systemForm.employeeDefaultBranchId)],
        active: true,
      });
    }
    setModuleMessage("System records updated.");
  }

  async function handlePlatformActions() {
    if (!canPlatformManage) return;
    if (platformForm.emailTo && platformForm.emailSubject && platformForm.emailContent) {
      const emailResult = await apiPost<NotificationResponse>("/api/notifications/email/send", {
        to: platformForm.emailTo,
        subject: platformForm.emailSubject,
        content: platformForm.emailContent,
      }, { kind: "auth" });
      setNotifications((current) => [emailResult, ...current].slice(0, 6));
    }
    if (platformForm.smsPhone && platformForm.smsMessage) {
      const smsResult = await apiPost<NotificationResponse>("/api/notifications/sms/send", {
        phoneNumber: platformForm.smsPhone,
        message: platformForm.smsMessage,
      }, { kind: "auth" });
      setNotifications((current) => [smsResult, ...current].slice(0, 6));
    }
    if (platformForm.templateCode && platformForm.templateName) {
      await apiPost("/api/notification-templates", {
        templateCode: platformForm.templateCode,
        name: platformForm.templateName,
        type: platformForm.templateType,
        channel: platformForm.templateChannel,
        subject: platformForm.emailSubject || platformForm.templateName,
        content: platformForm.emailContent || "Template body",
        isActive: true,
      }, { kind: "auth" });
    }
    if (platformForm.scheduleName && platformForm.scheduleRecipients) {
      await apiPost("/api/report-schedules", {
        scheduleName: platformForm.scheduleName,
        reportType: platformForm.scheduleReportType,
        format: platformForm.scheduleFormat,
        frequency: platformForm.scheduleFrequency,
        cronExpression: platformForm.scheduleCron,
        recipients: platformForm.scheduleRecipients,
      }, { kind: "auth" });
    }
    setModuleMessage("Platform tooling actions submitted.");
  }

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subheading}>{subtitle}</Text>
      </View>

      {canHandleBack ? <BackButton label={selectedOrder || selectedReceipt ? "Back to list" : "Back"} onPress={goBack} /> : null}

      <View style={styles.segmentRow}>
        {visibleViews.map((view) => {
          const active = view === activeView;
          return (
            <Pressable key={view} onPress={() => navigateViewWithGuard(view)} style={[styles.segment, active && styles.segmentActive]}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{view[0].toUpperCase() + view.slice(1)}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {moduleMessage ? <Text style={styles.helperText}>{moduleMessage}</Text> : null}

      {activeView === "workspace" ? (
        <>
          <SectionHeader title="Session" action={session?.organizationCode || "No org"} />
          <GlassCard style={styles.cardStack}>
            <Text style={styles.entityTitle}>{session?.organizationName || "Retail workspace"}</Text>
            <Text style={styles.entityMeta}>User: {session?.username || "-"}</Text>
            <Text style={styles.entityMeta}>Organization: {session?.organizationId || "-"}</Text>
            <Text style={styles.entityMeta}>Branch: {session?.branchId || "-"}</Text>
            <Text style={styles.entityMeta}>Warehouse: {session?.warehouseId || "Unset"}</Text>
            <View style={styles.pillRow}>
              {(session?.roles || []).slice(0, 3).map((role) => <Pill key={role} label={role} tone="blue" />)}
            </View>
            <Text style={styles.entityMeta}>Permissions loaded: {session?.permissions.length ?? 0}</Text>
          </GlassCard>
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find default warehouse"
              placeholder="Search warehouses"
              selectedLabel={warehouses.find((warehouse) => String(warehouse.id) === String(session?.warehouseId ?? ""))?.name}
              options={warehouseOptions}
              onSelect={(id) => updateSessionDraft({ warehouseId: id })}
            />
            <ActionButton label="Refresh backend data" icon="refresh" onPress={refreshAll} />
            <ActionButton label="Sign out" icon="log-out" inverted onPress={signOut} />
          </GlassCard>
        </>
      ) : null}

      {activeView === "purchases" ? (
        <>
          <SectionHeader title="Purchase documents" action={`${data.purchaseOrders.length + data.purchaseReceipts.length + data.supplierPayments.length} flows`} />
          <GlassCard style={styles.formCard}>
            <View style={styles.choiceRow}>
              {purchaseDraftOptions.map((type) => {
                const active = draftType === type;
                return (
                  <Pressable key={type} onPress={() => setDraftType(type)} style={[styles.choiceChip, active && styles.choiceChipActive]}>
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{type.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
            <SearchableSelect
              label="Find supplier"
              placeholder="Search suppliers"
              selectedLabel={data.suppliers.find((supplier) => String(supplier.id) === supplierId)?.name}
              options={supplierOptions}
              onSelect={setSupplierId}
            />
            <View style={styles.quickPickWrap}>
              {data.suppliers.slice(0, 6).map((supplier) => {
                const active = supplierId === String(supplier.id);
                return (
                  <Pressable key={supplier.id} onPress={() => setSupplierId(String(supplier.id))} style={[styles.quickPick, active && styles.quickPickActive]}>
                    <Text style={[styles.quickPickText, active && styles.quickPickTextActive]} numberOfLines={1}>{supplier.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.helperText}>Selected supplier: {supplierMap.get(Number(supplierId))?.name || "Pick a supplier to link documents and lines."}</Text>
            <TextInput value={documentDate} onChangeText={setDocumentDate} placeholder="Document date" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            {draftType === "receipt" ? (
              <SearchableSelect
                label="Link purchase order"
                placeholder="Search purchase orders"
                selectedLabel={data.purchaseOrders.find((order) => String(order.id) === purchaseOrderId)?.poNumber}
                options={purchaseOrderOptions}
                onSelect={setPurchaseOrderId}
              />
            ) : null}
            {draftType === "receipt" ? <TextInput value={dueDate} onChangeText={setDueDate} placeholder="Due date" placeholderTextColor={theme.colors.textMuted} style={styles.input} /> : null}
            <TextInput value={placeOfSupplyStateCode} onChangeText={setPlaceOfSupplyStateCode} placeholder="Place of supply state code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={remarks} onChangeText={setRemarks} placeholder="Remarks" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            {draftType === "payment" ? (
              <>
                <SearchableSelect
                  label="Payment method"
                  placeholder="Choose payment method"
                  selectedLabel={paymentMethodOptions.find((option) => option.id === paymentMethod)?.label}
                  options={paymentMethodOptions}
                  onSelect={setPaymentMethod}
                />
                <TextInput value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Reference number" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
                <TextInput value={paymentAmount} onChangeText={setPaymentAmount} placeholder="Payment amount" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
              </>
            ) : (
              <>
                {lines.map((line, index) => (
                  <GlassCard key={`purchase-line-${index}`} style={styles.lineCard}>
                    <Text style={styles.entityTitle}>Line {index + 1}</Text>
                    <SearchableSelect
                      label={`Find product for line ${index + 1}`}
                      placeholder="Search products"
                      selectedLabel={data.products.find((product) => String(product.id) === line.productId)?.name}
                      options={productOptions}
                      onSelect={(id) => {
                        updateLine(index, "productId", id, setLines);
                        const product = data.products.find((entry) => String(entry.id) === id);
                        if (product?.baseUomId) {
                          updateLine(index, "uomId", String(product.baseUomId), setLines);
                        }
                      }}
                    />
                    <View style={styles.quickPickWrap}>
                      {data.products.slice(0, 6).map((product) => {
                        const active = line.productId === String(product.id);
                        return (
                          <Pressable
                            key={`${index}-${product.id}`}
                            onPress={() => {
                              updateLine(index, "productId", String(product.id), setLines);
                              if (product.baseUomId) {
                                updateLine(index, "uomId", String(product.baseUomId), setLines);
                              }
                            }}
                            style={[styles.quickPick, active && styles.quickPickActive]}
                          >
                            <Text style={[styles.quickPickText, active && styles.quickPickTextActive]} numberOfLines={1}>{product.name}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <TextInput value={line.supplierProductId} onChangeText={(value) => updateLine(index, "supplierProductId", value, setLines)} placeholder="Supplier product code (optional)" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
                    <Text style={styles.helperText}>UOM: {line.uomId || "auto from product selection"}</Text>
                    <View style={styles.rowBetween}>
                      <TextInput value={line.quantity} onChangeText={(value) => updateLine(index, "quantity", value, setLines)} placeholder="Qty" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
                      <TextInput value={line.baseQuantity} onChangeText={(value) => updateLine(index, "baseQuantity", value, setLines)} placeholder="Base qty" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
                    </View>
                    <TextInput value={line.unitValue} onChangeText={(value) => updateLine(index, "unitValue", value, setLines)} placeholder="Unit value" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
                  </GlassCard>
                ))}
                <ActionButton label="Add line" icon="add" inverted onPress={() => setLines((current) => [...current, { ...emptyPurchaseLine }])} />
              </>
            )}
            <ActionButton label={saving ? "Saving..." : `Create ${draftType}`} icon="bag" onPress={saving || !(canCreatePurchases || canReceivePurchases || canPaySuppliers) ? undefined : handleCreatePurchase} />
          </GlassCard>
          <SectionHeader title="Purchase orders" action={`${data.purchaseOrders.length} docs`} />
          <View style={styles.list}>
            {data.purchaseOrders.map((order) => (
              <Pressable key={order.id} onPress={async () => setSelectedOrder(await loadPurchaseOrder(order.id))}>
                <DocCard title={order.poNumber || `PO ${order.id}`} subtitle={`${supplierMap.get(order.supplierId)?.name || `Supplier ${order.supplierId}`} • ${order.poDate || "No date"}`} amount={order.totalAmount ?? 0} status={order.status || "OPEN"} />
              </Pressable>
            ))}
          </View>
          <SectionHeader title="Purchase receipts" action={`${data.purchaseReceipts.length} docs`} />
          <View style={styles.list}>
            {data.purchaseReceipts.map((receipt) => (
              <Pressable key={receipt.id} onPress={async () => setSelectedReceipt(await loadPurchaseReceipt(receipt.id))}>
                <DocCard title={receipt.receiptNumber || `PR ${receipt.id}`} subtitle={`${supplierMap.get(receipt.supplierId)?.name || `Supplier ${receipt.supplierId}`} • ${receipt.receiptDate || "No date"}`} amount={receipt.totalAmount ?? 0} status={receipt.status || "OPEN"} />
              </Pressable>
            ))}
          </View>
          <SectionHeader title="Supplier payments" action={`${data.supplierPayments.length} docs`} />
          <View style={styles.list}>
            {data.supplierPayments.map((payment) => (
              <DocCard key={payment.id} title={payment.paymentNumber || `PAY ${payment.id}`} subtitle={`${supplierMap.get(payment.supplierId)?.name || `Supplier ${payment.supplierId}`} • ${payment.paymentDate || "No date"}`} amount={payment.amount ?? 0} status={payment.status || "POSTED"} />
            ))}
          </View>
          {selectedOrder ? <PurchaseDetail title={selectedOrder.poNumber || `PO ${selectedOrder.id}`} lines={selectedOrder.lines} total={selectedOrder.totalAmount ?? 0} productMap={productMap} /> : null}
          {selectedReceipt ? <PurchaseDetail title={selectedReceipt.receiptNumber || `PR ${selectedReceipt.id}`} lines={selectedReceipt.lines} total={selectedReceipt.totalAmount ?? 0} productMap={productMap} /> : null}
        </>
      ) : null}

      {activeView === "returns" ? (
        <>
          <SectionHeader title="Create return" action="Sales or purchase" />
          <GlassCard style={styles.formCard}>
            <View style={styles.choiceRow}>
              {["sales", "purchase"].map((kind) => {
                const active = returnForm.kind === kind;
                return (
                  <Pressable key={kind} onPress={() => setReturnForm((current) => ({ ...current, kind }))} style={[styles.choiceChip, active && styles.choiceChipActive]}>
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{kind.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
            {returnForm.kind === "sales" ? (
              <SearchableSelect
                label="Find original sales invoice"
                placeholder="Search invoices"
                selectedLabel={data.invoices.find((invoice) => String(invoice.id) === returnForm.originalId)?.invoiceNumber}
                options={salesInvoiceOptions}
                onSelect={(id) => setReturnForm((current) => ({ ...current, originalId: id }))}
              />
            ) : (
              <SearchableSelect
                label="Find original purchase receipt"
                placeholder="Search purchase receipts"
                selectedLabel={data.purchaseReceipts.find((receipt) => String(receipt.id) === returnForm.originalId)?.receiptNumber}
                options={purchaseReceiptOptions}
                onSelect={(id) => setReturnForm((current) => ({ ...current, originalId: id }))}
              />
            )}
            <TextInput value={returnForm.productLineId} onChangeText={(value) => setReturnForm((current) => ({ ...current, productLineId: value }))} placeholder="Original line id" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
            <View style={styles.rowBetween}>
              <TextInput value={returnForm.quantity} onChangeText={(value) => setReturnForm((current) => ({ ...current, quantity: value }))} placeholder="Quantity" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
              <TextInput value={returnForm.baseQuantity} onChangeText={(value) => setReturnForm((current) => ({ ...current, baseQuantity: value }))} placeholder="Base quantity" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
            </View>
            <TextInput value={returnForm.reason} onChangeText={(value) => setReturnForm((current) => ({ ...current, reason: value }))} placeholder="Reason" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <Text style={styles.helperText}>
              {returnForm.kind === "sales"
                ? `Selected invoice: ${data.invoices.find((invoice) => String(invoice.id) === returnForm.originalId)?.invoiceNumber || "Choose a source invoice"}`
                : `Selected receipt: ${data.purchaseReceipts.find((receipt) => String(receipt.id) === returnForm.originalId)?.receiptNumber || "Choose a source receipt"}`}
            </Text>
            <ActionButton label="Create return" icon="return-up-back" onPress={canCreateReturns ? handleCreateReturn : undefined} />
          </GlassCard>
          <SectionHeader title="Sales returns" action={`${salesReturns.length} docs`} />
          <View style={styles.list}>{salesReturns.map((item) => <DocCard key={item.id} title={item.returnNumber || `SR ${item.id}`} subtitle={item.returnDate || "No date"} amount={item.totalAmount ?? 0} status={item.status || "OPEN"} />)}</View>
          <SectionHeader title="Purchase returns" action={`${purchaseReturns.length} docs`} />
          <View style={styles.list}>{purchaseReturns.map((item) => <DocCard key={item.id} title={item.returnNumber || `PR ${item.id}`} subtitle={item.returnDate || "No date"} amount={item.totalAmount ?? 0} status={item.status || "OPEN"} />)}</View>
        </>
      ) : null}

      {activeView === "service" ? (
        <>
          <SectionHeader title="Service actions" action="Tickets, claims, replacements" />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find customer"
              placeholder="Search customers"
              selectedLabel={data.customers.find((customer) => String(customer.id) === serviceForm.customerId)?.fullName}
              options={data.customers.map((customer) => ({
                id: String(customer.id),
                label: customer.fullName,
                meta: customer.customerCode,
              }))}
              onSelect={(id) => setServiceForm((current) => ({ ...current, customerId: id }))}
            />
            <SearchableSelect
              label="Find product"
              placeholder="Search products"
              selectedLabel={data.products.find((product) => String(product.id) === serviceForm.productId)?.name}
              options={data.products.map((product) => ({
                id: String(product.id),
                label: product.name,
                meta: product.sku,
              }))}
              onSelect={(id) => setServiceForm((current) => ({ ...current, productId: id }))}
            />
            <SearchableSelect
              label="Find replacement product"
              placeholder="Search products"
              selectedLabel={data.products.find((product) => String(product.id) === serviceForm.replacementProductId)?.name}
              options={productOptions}
              onSelect={(id) => setServiceForm((current) => ({ ...current, replacementProductId: id }))}
            />
            <SearchableSelect
              label="Find warehouse"
              placeholder="Search warehouses"
              selectedLabel={warehouses.find((warehouse) => String(warehouse.id) === serviceForm.warehouseId)?.name}
              options={warehouseOptions}
              onSelect={(id) => setServiceForm((current) => ({ ...current, warehouseId: id }))}
            />
            <View style={styles.quickPickWrap}>
              {data.customers.slice(0, 6).map((customer) => (
                <Pressable key={customer.id} onPress={() => setServiceForm((current) => ({ ...current, customerId: String(customer.id) }))} style={styles.quickPick}>
                  <Text style={styles.quickPickText} numberOfLines={1}>{customer.fullName}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.quickPickWrap}>
              {data.products.slice(0, 6).map((product) => (
                <Pressable key={`svc-${product.id}`} onPress={() => setServiceForm((current) => ({ ...current, productId: String(product.id) }))} style={styles.quickPick}>
                  <Text style={styles.quickPickText} numberOfLines={1}>{product.name}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput value={serviceForm.complaintSummary} onChangeText={(value) => setServiceForm((current) => ({ ...current, complaintSummary: value }))} placeholder="Complaint summary" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <SearchableSelect
              label="Priority"
              placeholder="Choose priority"
              selectedLabel={servicePriorityOptions.find((option) => option.id === serviceForm.priority)?.label}
              options={servicePriorityOptions}
              onSelect={(id) => setServiceForm((current) => ({ ...current, priority: id }))}
            />
            <SearchableSelect
              label="Claim type"
              placeholder="Choose claim type"
              selectedLabel={claimTypeOptions.find((option) => option.id === serviceForm.claimType)?.label}
              options={claimTypeOptions}
              onSelect={(id) => setServiceForm((current) => ({ ...current, claimType: id }))}
            />
            <Text style={styles.helperText}>
              Customer {customerMap.get(Number(serviceForm.customerId))?.fullName || "not selected"} • Product {productMap.get(Number(serviceForm.productId))?.name || "not selected"} • Replacement {productMap.get(Number(serviceForm.replacementProductId))?.name || "not selected"} • Warehouse {warehouseMap.get(Number(serviceForm.warehouseId))?.name || "not selected"}
            </Text>
            <ActionButton label="Create ticket" icon="construct" onPress={canManageService ? handleCreateServiceTicket : undefined} />
            <ActionButton label="Create claim" icon="shield-checkmark" inverted onPress={canManageService || canManageClaims ? handleCreateClaim : undefined} />
            <ActionButton label="Issue replacement" icon="repeat" inverted onPress={canManageService ? handleCreateReplacement : undefined} />
          </GlassCard>
          <SectionHeader title="Tickets" action={`${tickets.length} docs`} />
          <View style={styles.list}>{tickets.map((ticket) => <DocCard key={ticket.id} title={ticket.ticketNumber || `TKT ${ticket.id}`} subtitle={ticket.complaintSummary || "No summary"} amount={0} status={ticket.status || ticket.priority || "OPEN"} hideAmount />)}</View>
          <SectionHeader title="Warranty claims" action={`${claims.length} docs`} />
          <View style={styles.list}>{claims.map((claim) => <DocCard key={claim.id} title={claim.claimNumber || `CLM ${claim.id}`} subtitle={claim.claimType || "Claim"} amount={0} status={claim.status || "OPEN"} hideAmount />)}</View>
          <SectionHeader title="Replacements" action={`${replacements.length} docs`} />
          <View style={styles.list}>{replacements.map((item) => <DocCard key={item.id} title={item.replacementNumber || `REP ${item.id}`} subtitle={item.replacementType || "Replacement"} amount={0} status={item.status || "OPEN"} hideAmount />)}</View>
        </>
      ) : null}

      {activeView === "finance" ? (
        <>
          <SectionHeader title="Finance actions" action="Accounts, vouchers, expenses, bank rec" />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find voucher account"
              placeholder="Search accounts"
              selectedLabel={accounts.find((account) => String(account.id) === financeForm.voucherAccountId)?.name}
              options={accounts.map((account) => ({
                id: String(account.id),
                label: account.name || account.code || `Account ${account.id}`,
                meta: `${account.code || ""}${account.accountType ? ` • ${account.accountType}` : ""}`,
              }))}
              onSelect={(id) => setFinanceForm((current) => ({ ...current, voucherAccountId: id }))}
            />
            <SearchableSelect
              label="Find bank account"
              placeholder="Search bank or cash accounts"
              selectedLabel={accounts.find((account) => String(account.id) === financeForm.bankAccountId)?.name}
              options={accounts.map((account) => ({
                id: String(account.id),
                label: account.name || account.code || `Account ${account.id}`,
                meta: `${account.code || ""}${account.accountType ? ` • ${account.accountType}` : ""}`,
              }))}
              onSelect={(id) => setFinanceForm((current) => ({ ...current, bankAccountId: id }))}
            />
            <SearchableSelect
              label="Find expense category"
              placeholder="Search expense categories"
              selectedLabel={expenseCategories.find((category) => String(category.id) === financeForm.expenseCategoryId)?.name}
              options={expenseCategoryOptions}
              onSelect={(id) => setFinanceForm((current) => ({ ...current, expenseCategoryId: id }))}
            />
            <TextInput value={financeForm.accountCode} onChangeText={(value) => setFinanceForm((current) => ({ ...current, accountCode: value }))} placeholder="New account code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={financeForm.accountName} onChangeText={(value) => setFinanceForm((current) => ({ ...current, accountName: value }))} placeholder="New account name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <SearchableSelect
              label="Account type"
              placeholder="Choose account type"
              selectedLabel={accountTypeOptions.find((option) => option.id === financeForm.accountType)?.label}
              options={accountTypeOptions}
              onSelect={(id) => setFinanceForm((current) => ({ ...current, accountType: id }))}
            />
            <View style={styles.rowBetween}>
              <TextInput value={financeForm.voucherDebit} onChangeText={(value) => setFinanceForm((current) => ({ ...current, voucherDebit: value }))} placeholder="Debit" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
              <TextInput value={financeForm.voucherCredit} onChangeText={(value) => setFinanceForm((current) => ({ ...current, voucherCredit: value }))} placeholder="Credit" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
            </View>
            <TextInput value={financeForm.expenseAmount} onChangeText={(value) => setFinanceForm((current) => ({ ...current, expenseAmount: value }))} placeholder="Expense amount" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
            <Text style={styles.helperText}>
              Voucher account {accountMap.get(Number(financeForm.voucherAccountId))?.name || "not selected"} • Expense category {expenseCategories.find((category) => String(category.id) === financeForm.expenseCategoryId)?.name || "not selected"} • Bank account {accountMap.get(Number(financeForm.bankAccountId))?.name || "not selected"}
            </Text>
            <ActionButton label="Submit finance records" icon="cash" onPress={canMutateFinanceRecords ? handleCreateFinanceRecords : undefined} />
          </GlassCard>
          <View style={styles.cardStack}>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.entityTitle}>Bank reconciliation</Text>
              <Text style={styles.entityMeta}>Unmatched {bankSummary?.unmatchedCount ?? 0} • Reconciled {bankSummary?.reconciledCount ?? 0}</Text>
              <Text style={styles.entityMeta}>Statement {formatCurrency(bankSummary?.statementBalance ?? 0)} • Book {formatCurrency(bankSummary?.bookBalance ?? 0)}</Text>
            </GlassCard>
          </View>
          <SectionHeader title="Accounts" action={`${accounts.length} records`} />
          <View style={styles.list}>{accounts.map((item) => <DocCard key={item.id} title={item.name || item.code || `ACC ${item.id}`} subtitle={`${item.code || "-"} • ${item.accountType || "-"}`} amount={0} status="ACTIVE" hideAmount />)}</View>
          <SectionHeader title="Vouchers" action={`${vouchers.length} records`} />
          <View style={styles.list}>{vouchers.map((item) => <DocCard key={item.id} title={item.voucherNumber || `VCH ${item.id}`} subtitle={`${item.voucherType || "-"} • ${item.voucherDate || "-"}`} amount={0} status={item.status || "POSTED"} hideAmount />)}</View>
          <SectionHeader title="Expenses" action={`${expenses.length} records`} />
          <View style={styles.list}>{expenses.map((item) => <DocCard key={item.id} title={item.expenseNumber || `EXP ${item.id}`} subtitle={item.expenseDate || "-"} amount={item.amount ?? 0} status={item.status || "OPEN"} />)}</View>
        </>
      ) : null}

      {activeView === "system" ? (
        <>
          <SectionHeader title="System actions" action="Organizations, subscription, tax" />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find branch"
              placeholder="Search branches"
              selectedLabel={branches.find((branch) => String(branch.id) === systemForm.employeeDefaultBranchId)?.name}
              options={branchOptions}
              onSelect={(id) => setSystemForm((current) => ({ ...current, employeeDefaultBranchId: id }))}
            />
            <Text style={styles.helperText}>Default branch: {branchMap.get(Number(systemForm.employeeDefaultBranchId))?.name || "Choose the employee's home branch"}</Text>
            <TextInput value={systemForm.organizationName} onChangeText={(value) => setSystemForm((current) => ({ ...current, organizationName: value }))} placeholder="New organization name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.organizationCode} onChangeText={(value) => setSystemForm((current) => ({ ...current, organizationCode: value }))} placeholder="New organization code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.organizationGstin} onChangeText={(value) => setSystemForm((current) => ({ ...current, organizationGstin: value }))} placeholder="Organization GSTIN" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.branchCode} onChangeText={(value) => setSystemForm((current) => ({ ...current, branchCode: value }))} placeholder="New branch code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.branchName} onChangeText={(value) => setSystemForm((current) => ({ ...current, branchName: value }))} placeholder="New branch name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.taxName} onChangeText={(value) => setSystemForm((current) => ({ ...current, taxName: value }))} placeholder="Tax registration name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.taxGstin} onChangeText={(value) => setSystemForm((current) => ({ ...current, taxGstin: value }))} placeholder="Tax GSTIN" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.taxStateCode} onChangeText={(value) => setSystemForm((current) => ({ ...current, taxStateCode: value }))} placeholder="Tax state code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.thresholdAmount} onChangeText={(value) => setSystemForm((current) => ({ ...current, thresholdAmount: value }))} placeholder="GST threshold amount" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
            <TextInput value={systemForm.employeeUsername} onChangeText={(value) => setSystemForm((current) => ({ ...current, employeeUsername: value }))} placeholder="Employee username" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.employeePassword} onChangeText={(value) => setSystemForm((current) => ({ ...current, employeePassword: value }))} placeholder="Employee password" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.employeeFullName} onChangeText={(value) => setSystemForm((current) => ({ ...current, employeeFullName: value }))} placeholder="Employee full name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.employeeEmail} onChangeText={(value) => setSystemForm((current) => ({ ...current, employeeEmail: value }))} placeholder="Employee email" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={systemForm.employeePhone} onChangeText={(value) => setSystemForm((current) => ({ ...current, employeePhone: value }))} placeholder="Employee phone" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <SearchableSelect
              label="Employee role"
              placeholder="Choose role"
              selectedLabel={employeeRoleOptions.find((option) => option.id === systemForm.employeeRoleCode)?.label}
              options={employeeRoleOptions}
              onSelect={(id) => setSystemForm((current) => ({ ...current, employeeRoleCode: id }))}
            />
            <View style={styles.quickPickWrap}>
              {branches.slice(0, 6).map((branch) => {
                const active = systemForm.employeeDefaultBranchId === String(branch.id);
                return (
                  <Pressable key={branch.id} onPress={() => setSystemForm((current) => ({ ...current, employeeDefaultBranchId: String(branch.id) }))} style={[styles.quickPick, active && styles.quickPickActive]}>
                    <Text style={[styles.quickPickText, active && styles.quickPickTextActive]} numberOfLines={1}>{branch.name || branch.code || `Branch ${branch.id}`}</Text>
                  </Pressable>
                );
              })}
            </View>
            <ActionButton label="Submit system updates" icon="settings" onPress={canMutateSystem ? handleCreateSystemRecords : undefined} />
          </GlassCard>
          <View style={styles.cardStack}>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.entityTitle}>Subscription</Text>
              <Text style={styles.entityMeta}>{subscription?.planName || subscription?.planCode || "No plan"} • {subscription?.status || "-"}</Text>
              <Text style={styles.entityMeta}>{subscription?.startsOn || "-"} to {subscription?.endsOn || "-"}</Text>
            </GlassCard>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.entityTitle}>GST threshold</Text>
              <Text style={styles.entityMeta}>{formatCurrency(thresholdStatus?.financialYearTurnover ?? 0)} / {formatCurrency(thresholdStatus?.gstThresholdAmount ?? 0)}</Text>
              <Text style={styles.entityMeta}>{thresholdStatus?.alertLevel || "-"} • {thresholdStatus?.message || "-"}</Text>
            </GlassCard>
          </View>
          <SectionHeader title="Organizations" action={`${organizations.length} records`} />
          <View style={styles.list}>{organizations.map((item) => <DocCard key={item.id} title={item.name || item.code || `ORG ${item.id}`} subtitle={`${item.code || "-"} • GST ${item.gstin || "-"}`} amount={0} status={item.isActive ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
          <SectionHeader title="Branches" action={`${branches.length} records`} />
          <View style={styles.list}>{branches.map((item) => <DocCard key={item.id} title={item.name || item.code || `BR ${item.id}`} subtitle={`${item.code || "-"} • ${item.city || item.state || "Branch"}`} amount={0} status={item.isActive ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
          <SectionHeader title="Employees" action={`${employees.length} records`} />
          <View style={styles.list}>{employees.map((item) => <DocCard key={item.id} title={item.fullName || item.username || `EMP ${item.id}`} subtitle={`${item.username || "-"} • ${item.roleCode || "-"} • ${branchMap.get(item.defaultBranchId ?? 0)?.name || `${item.branchAccess?.length ?? 0} branches`}`} amount={0} status={item.active ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
          <SectionHeader title="Tax registrations" action={`${taxRegistrations.length} records`} />
          <View style={styles.list}>{taxRegistrations.map((item) => <DocCard key={item.id} title={item.registrationName || `REG ${item.id}`} subtitle={`${item.registrationStateCode || "-"} • ${item.gstin || "-"}`} amount={0} status={item.isActive ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
          <SectionHeader title="Users" action={`${users.length} records`} />
          <View style={styles.list}>{users.map((item) => <DocCard key={item.id} title={item.username || `USER ${item.id}`} subtitle={`${item.email || "-"} • ${(item.roles || []).join(", ")}`} amount={0} status={item.active ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
        </>
      ) : null}

      {activeView === "platform" ? (
        <>
          <SectionHeader title="Platform tools" action="Health, notifications, templates, schedules" />
          <GlassCard style={styles.formCard}>
            <TextInput value={platformForm.emailTo} onChangeText={(value) => setPlatformForm((current) => ({ ...current, emailTo: value }))} placeholder="Email recipient" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.emailSubject} onChangeText={(value) => setPlatformForm((current) => ({ ...current, emailSubject: value }))} placeholder="Email subject" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.emailContent} onChangeText={(value) => setPlatformForm((current) => ({ ...current, emailContent: value }))} placeholder="Email/template content" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.smsPhone} onChangeText={(value) => setPlatformForm((current) => ({ ...current, smsPhone: value }))} placeholder="SMS phone" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.smsMessage} onChangeText={(value) => setPlatformForm((current) => ({ ...current, smsMessage: value }))} placeholder="SMS message" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.templateCode} onChangeText={(value) => setPlatformForm((current) => ({ ...current, templateCode: value }))} placeholder="Template code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.templateName} onChangeText={(value) => setPlatformForm((current) => ({ ...current, templateName: value }))} placeholder="Template name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <SearchableSelect
              label="Template type"
              placeholder="Choose template type"
              selectedLabel={templateTypeOptions.find((option) => option.id === platformForm.templateType)?.label}
              options={templateTypeOptions}
              onSelect={(id) => setPlatformForm((current) => ({ ...current, templateType: id }))}
            />
            <SearchableSelect
              label="Template channel"
              placeholder="Choose template channel"
              selectedLabel={templateChannelOptions.find((option) => option.id === platformForm.templateChannel)?.label}
              options={templateChannelOptions}
              onSelect={(id) => setPlatformForm((current) => ({ ...current, templateChannel: id }))}
            />
            <TextInput value={platformForm.scheduleName} onChangeText={(value) => setPlatformForm((current) => ({ ...current, scheduleName: value }))} placeholder="Schedule name" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <SearchableSelect
              label="Schedule report type"
              placeholder="Choose report type"
              selectedLabel={reportTypeOptions.find((option) => option.id === platformForm.scheduleReportType)?.label}
              options={reportTypeOptions}
              onSelect={(id) => setPlatformForm((current) => ({ ...current, scheduleReportType: id }))}
            />
            <SearchableSelect
              label="Schedule format"
              placeholder="Choose file format"
              selectedLabel={scheduleFormatOptions.find((option) => option.id === platformForm.scheduleFormat)?.label}
              options={scheduleFormatOptions}
              onSelect={(id) => setPlatformForm((current) => ({ ...current, scheduleFormat: id }))}
            />
            <SearchableSelect
              label="Schedule frequency"
              placeholder="Choose frequency"
              selectedLabel={scheduleFrequencyOptions.find((option) => option.id === platformForm.scheduleFrequency)?.label}
              options={scheduleFrequencyOptions}
              onSelect={(id) => setPlatformForm((current) => ({ ...current, scheduleFrequency: id }))}
            />
            <TextInput value={platformForm.scheduleCron} onChangeText={(value) => setPlatformForm((current) => ({ ...current, scheduleCron: value }))} placeholder="Cron expression" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={platformForm.scheduleRecipients} onChangeText={(value) => setPlatformForm((current) => ({ ...current, scheduleRecipients: value }))} placeholder="Schedule recipients" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <ActionButton label="Submit platform actions" icon="rocket" onPress={canPlatformManage ? handlePlatformActions : undefined} />
          </GlassCard>
          <View style={styles.cardStack}>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.entityTitle}>Health</Text>
              <Text style={styles.entityMeta}>{health?.message || (health?.success ? "Healthy" : "Unknown")}</Text>
              <Text style={styles.entityMeta}>{health?.timestamp || "-"}</Text>
            </GlassCard>
          </View>
          <SectionHeader title="Templates" action={`${templates.length} records`} />
          <View style={styles.list}>{templates.slice(0, 8).map((item) => <DocCard key={item.id} title={item.name || item.templateCode || `TPL ${item.id}`} subtitle={`${item.templateCode || "-"} • ${item.channel || "-"}`} amount={0} status={item.isActive ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
          <SectionHeader title="Recent notification sends" action={`${notifications.length} records`} />
          <View style={styles.list}>{notifications.map((item, index) => <DocCard key={`${item.notificationId || item.recipient}-${index}`} title={item.title || item.notificationId || "Notification"} subtitle={`${item.channel || "-"} • ${item.recipient || "-"}`} amount={0} status={item.status || "SENT"} hideAmount />)}</View>
          <SectionHeader title="Report schedules" action={`${schedules.length} records`} />
          <View style={styles.list}>{schedules.slice(0, 8).map((item) => <DocCard key={item.id} title={item.scheduleName || `SCH ${item.id}`} subtitle={`${item.reportType || "-"} • next ${item.nextRunDate || "-"}`} amount={0} status={item.isActive ? "ACTIVE" : "INACTIVE"} hideAmount />)}</View>
        </>
      ) : null}
    </View>
  );
}

function PurchaseDetail({
  title,
  lines,
  total,
  productMap,
}: {
  title: string;
  lines: PurchaseOrder["lines"] | PurchaseReceipt["lines"];
  total: number;
  productMap: Map<number, { name: string; sku: string }>;
}) {
  return (
    <GlassCard style={styles.formCard}>
      <Text style={styles.entityTitle}>{title}</Text>
      {lines.map((line, index) => (
        <Text key={`${title}-${index}`} style={styles.entityMeta}>
          {productMap.get(line.productId)?.name || `Product ${line.productId}`} {productMap.get(line.productId)?.sku ? `(${productMap.get(line.productId)?.sku})` : ""} • Qty {line.quantity} • {formatCurrency(line.lineAmount ?? line.unitValue ?? 0)}
        </Text>
      ))}
      <Text style={styles.entityValue}>{formatCurrency(total)}</Text>
    </GlassCard>
  );
}

function DocCard({
  title,
  subtitle,
  amount,
  status,
  hideAmount,
}: {
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  hideAmount?: boolean;
}) {
  return (
    <GlassCard style={styles.docCard}>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.entityTitle}>{title}</Text>
          <Text style={styles.entityMeta}>{subtitle}</Text>
        </View>
        <Pill label={status} tone={status === "ACTIVE" || status === "POSTED" || status === "APPROVED" ? "green" : "orange"} />
      </View>
      {!hideAmount ? <Text style={styles.entityValue}>{formatCurrency(amount)}</Text> : null}
    </GlassCard>
  );
}

function updateLine(index: number, key: keyof PurchaseLineDraft, value: string, setLines: React.Dispatch<React.SetStateAction<PurchaseLineDraft[]>>) {
  setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)));
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  heading: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 6 },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  segment: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  segmentActive: { backgroundColor: theme.colors.accent },
  segmentText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: "#FFFFFF" },
  formCard: { gap: 12 },
  input: { minHeight: 54, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600", backgroundColor: theme.colors.surfaceMuted },
  cardStack: { gap: 8 },
  entityTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  entityMeta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  entityValue: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choiceChip: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 9 },
  choiceChipActive: { backgroundColor: theme.colors.surfaceStrong },
  choiceText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700" },
  choiceTextActive: { color: "#FFFFFF" },
  list: { gap: 12 },
  docCard: { gap: 10 },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  lineCard: { gap: 10 },
  halfInput: { flex: 1 },
  errorText: { color: "#B42318", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  helperText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  reportCard: { gap: 8 },
  quickPickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickPick: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  quickPickActive: { backgroundColor: theme.colors.surfaceStrong },
  quickPickText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700", maxWidth: 120 },
  quickPickTextActive: { color: "#FFFFFF" },
});
