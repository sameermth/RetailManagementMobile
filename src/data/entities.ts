export type MembershipSummary = {
  userId: number;
  organizationId: number;
  organizationCode: string;
  organizationName: string;
  defaultBranchId: number | null;
  roleCode: string;
  roleName: string;
  active: boolean;
};

export type SessionState = {
  baseUrl: string;
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  organizationId: number;
  organizationCode: string;
  organizationName: string;
  branchId: number | null;
  warehouseId: number | null;
  roles: string[];
  permissions: string[];
  memberships: MembershipSummary[];
};

export type SessionDraft = {
  organizationId: string;
  warehouseId: string;
  username: string;
  password: string;
};

export type SalesSummary = {
  totalAmount?: number;
  totalTransactions?: number;
  averageTransactionValue?: number;
  cashAmount?: number;
  cardAmount?: number;
  upiAmount?: number;
  creditAmount?: number;
};

export type GstStatus = {
  organizationId?: number;
  financialYearTurnover?: number;
  gstThresholdAmount?: number;
  utilizationRatio?: number;
  alertLevel?: string;
  gstRegistered?: boolean;
  thresholdReached?: boolean;
  alertEnabled?: boolean;
  message?: string;
};

export type DashboardSummary = {
  todaySales?: SalesSummary;
  weeklySales?: SalesSummary;
  monthlySales?: SalesSummary;
  totalProducts?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  totalCustomers?: number;
  newCustomersToday?: number;
  totalDueAmount?: number;
  overdueCount?: number;
  pendingOrders?: number;
  completedOrdersToday?: number;
  gstStatus?: GstStatus | null;
};

export type UpcomingDue = {
  customerId: number;
  customerName: string;
  customerPhone?: string;
  dueAmount: number;
  dueDate?: string;
  daysRemaining?: number;
  status?: string;
};

export type DueSummary = {
  totalDueAmount?: number;
  totalDueCustomers?: number;
  overdueAmount?: number;
  overdueCount?: number;
  dueThisWeek?: number;
  dueNextWeek?: number;
  upcomingDues?: UpcomingDue[];
};

export type TopProduct = {
  productId: number;
  productName: string;
  sku?: string;
  category?: string;
  quantitySold?: number;
  totalRevenue?: number;
  averagePrice?: number;
};

export type LowStockAlert = {
  productId: number;
  productName: string;
  sku?: string;
  category?: string;
  currentStock?: number;
  reorderLevel?: number;
  recommendedOrder?: number;
  status?: string;
};

export type RecentActivity = {
  activityType?: string;
  title?: string;
  description?: string;
  referenceNumber?: string;
  activityDate?: string;
};

export type StoreProduct = {
  id: number;
  organizationId: number;
  productId?: number | null;
  categoryId?: number | null;
  brandId?: number | null;
  baseUomId?: number | null;
  taxGroupId?: number | null;
  sku: string;
  name: string;
  description?: string | null;
  inventoryTrackingMode?: string | null;
  serialTrackingEnabled?: boolean | null;
  batchTrackingEnabled?: boolean | null;
  expiryTrackingEnabled?: boolean | null;
  fractionalQuantityAllowed?: boolean | null;
  minStockBaseQty?: number | null;
  reorderLevelBaseQty?: number | null;
  defaultSalePrice?: number | null;
  isServiceItem?: boolean | null;
  isActive?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductCatalogItem = {
  id: number;
  name: string;
  description?: string | null;
  categoryName?: string | null;
  brandName?: string | null;
  hsnCode?: string | null;
  baseUomId?: number | null;
  inventoryTrackingMode?: string | null;
  serialTrackingEnabled?: boolean | null;
  batchTrackingEnabled?: boolean | null;
  expiryTrackingEnabled?: boolean | null;
  fractionalQuantityAllowed?: boolean | null;
  isServiceItem?: boolean | null;
  isActive?: boolean | null;
};

export type Customer = {
  id: number;
  organizationId: number;
  branchId?: number | null;
  linkedOrganizationId?: number | null;
  customerCode: string;
  fullName: string;
  customerType?: string | null;
  legalName?: string | null;
  tradeName?: string | null;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  state?: string | null;
  stateCode?: string | null;
  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
  contactPersonEmail?: string | null;
  isPlatformLinked?: boolean | null;
  creditLimit?: number | null;
  notes?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreCustomerTerms = {
  id?: number;
  organizationId?: number;
  customerId?: number;
  customerSegment?: string | null;
  creditLimit?: number | null;
  creditDays?: number | null;
  loyaltyEnabled?: boolean | null;
  loyaltyPointsBalance?: number | null;
  priceTier?: string | null;
  discountPolicy?: string | null;
  isPreferred?: boolean | null;
  isActive?: boolean | null;
  contractStart?: string | null;
  contractEnd?: string | null;
  remarks?: string | null;
};

export type Supplier = {
  id: number;
  organizationId: number;
  branchId?: number | null;
  linkedOrganizationId?: number | null;
  supplierCode: string;
  name: string;
  legalName?: string | null;
  tradeName?: string | null;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  state?: string | null;
  stateCode?: string | null;
  contactPersonName?: string | null;
  contactPersonPhone?: string | null;
  contactPersonEmail?: string | null;
  paymentTerms?: string | null;
  isPlatformLinked?: boolean | null;
  notes?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreSupplierTerms = {
  id?: number;
  organizationId?: number;
  supplierId?: number;
  paymentTerms?: string | null;
  creditLimit?: number | null;
  creditDays?: number | null;
  isPreferred?: boolean | null;
  isActive?: boolean | null;
  contractStart?: string | null;
  contractEnd?: string | null;
  orderViaEmail?: boolean | null;
  orderViaWhatsapp?: boolean | null;
  remarks?: string | null;
};

export type PurchasableStoreProduct = {
  storeProductId: number;
  productId: number;
  supplierProductId?: number | null;
  sku?: string | null;
  name?: string | null;
  supplierProductCode?: string | null;
  supplierProductName?: string | null;
  supplierPreferred?: boolean | null;
  supplierPriority?: number | null;
};

export type SupplierCatalog = {
  supplier: Supplier;
  terms?: StoreSupplierTerms | null;
  products: PurchasableStoreProduct[];
};

export type SalesDocumentLine = {
  id?: number;
  productId: number;
  uomId: number;
  hsnCode?: string | null;
  quantity: number;
  baseQuantity: number;
  unitPrice?: number | null;
  discountAmount?: number | null;
  taxableAmount?: number | null;
  taxRate?: number | null;
  cgstRate?: number | null;
  cgstAmount?: number | null;
  sgstRate?: number | null;
  sgstAmount?: number | null;
  igstRate?: number | null;
  igstAmount?: number | null;
  cessRate?: number | null;
  cessAmount?: number | null;
  lineAmount?: number | null;
  remarks?: string | null;
};

export type SalesQuoteSummary = {
  id: number;
  organizationId?: number;
  branchId?: number;
  warehouseId?: number;
  customerId: number;
  quoteType?: string | null;
  quoteNumber: string;
  quoteDate?: string | null;
  validUntil?: string | null;
  totalAmount?: number | null;
  convertedSalesOrderId?: number | null;
  convertedSalesInvoiceId?: number | null;
  status?: string | null;
};

export type SalesQuote = SalesQuoteSummary & {
  sellerGstin?: string | null;
  customerGstin?: string | null;
  placeOfSupplyStateCode?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  remarks?: string | null;
  lines: SalesDocumentLine[];
};

export type SalesOrderSummary = {
  id: number;
  organizationId?: number;
  branchId?: number;
  warehouseId?: number;
  customerId: number;
  sourceQuoteId?: number | null;
  orderNumber: string;
  orderDate?: string | null;
  totalAmount?: number | null;
  convertedSalesInvoiceId?: number | null;
  status?: string | null;
};

export type SalesOrder = SalesOrderSummary & {
  sellerGstin?: string | null;
  customerGstin?: string | null;
  placeOfSupplyStateCode?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  remarks?: string | null;
  lines: SalesDocumentLine[];
};

export type SalesInvoiceLine = SalesDocumentLine & {
  priceOverrideReason?: string | null;
  serialNumberIds?: number[] | null;
  batchSelections?: { batchId: number; quantity: number; baseQuantity: number }[] | null;
  warrantyMonths?: number | null;
};

export type SalesInvoiceSummary = {
  id: number;
  organizationId?: number;
  branchId?: number;
  warehouseId?: number;
  customerId: number;
  invoiceNumber: string;
  invoiceDate?: string | null;
  dueDate?: string | null;
  sellerGstin?: string | null;
  customerGstin?: string | null;
  placeOfSupplyStateCode?: string | null;
  subtotal?: number | null;
  discountAmount?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  allocatedAmount?: number | null;
  outstandingAmount?: number | null;
  status?: string | null;
};

export type SalesInvoice = SalesInvoiceSummary & {
  lines: SalesInvoiceLine[];
};

export type CustomerReceipt = {
  id: number;
  organizationId?: number;
  branchId?: number;
  customerId: number;
  receiptNumber: string;
  receiptDate?: string | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  amount?: number | null;
  status?: string | null;
  remarks?: string | null;
};

export type PurchaseLine = {
  id?: number;
  productId: number;
  supplierProductId?: number | null;
  productMasterId?: number | null;
  sku?: string | null;
  productName?: string | null;
  hsnCode?: string | null;
  supplierProductCode?: string | null;
  uomId: number;
  quantity: number;
  baseQuantity: number;
  unitValue?: number | null;
  taxableAmount?: number | null;
  taxRate?: number | null;
  cgstRate?: number | null;
  cgstAmount?: number | null;
  sgstRate?: number | null;
  sgstAmount?: number | null;
  igstRate?: number | null;
  igstAmount?: number | null;
  cessRate?: number | null;
  cessAmount?: number | null;
  lineAmount?: number | null;
};

export type PurchaseOrderSummary = {
  id: number;
  organizationId?: number;
  branchId?: number;
  supplierId: number;
  poNumber: string;
  poDate?: string | null;
  sellerGstin?: string | null;
  supplierGstin?: string | null;
  placeOfSupplyStateCode?: string | null;
  subtotal?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  status?: string | null;
};

export type PurchaseOrder = PurchaseOrderSummary & {
  lines: PurchaseLine[];
};

export type PurchaseReceiptSummary = {
  id: number;
  organizationId?: number;
  branchId?: number;
  warehouseId?: number;
  supplierId: number;
  receiptNumber: string;
  receiptDate?: string | null;
  dueDate?: string | null;
  sellerGstin?: string | null;
  supplierGstin?: string | null;
  placeOfSupplyStateCode?: string | null;
  subtotal?: number | null;
  taxAmount?: number | null;
  totalAmount?: number | null;
  allocatedAmount?: number | null;
  outstandingAmount?: number | null;
  status?: string | null;
};

export type PurchaseReceipt = PurchaseReceiptSummary & {
  lines: PurchaseLine[];
};

export type SupplierPayment = {
  id: number;
  organizationId?: number;
  branchId?: number;
  supplierId: number;
  paymentNumber: string;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  amount?: number | null;
  status?: string | null;
  remarks?: string | null;
};

export type AppData = {
  dashboardSummary: DashboardSummary | null;
  dueSummary: DueSummary | null;
  topProducts: TopProduct[];
  lowStockAlerts: LowStockAlert[];
  recentActivities: RecentActivity[];
  products: StoreProduct[];
  productCatalog: ProductCatalogItem[];
  customers: Customer[];
  suppliers: Supplier[];
  quotes: SalesQuoteSummary[];
  orders: SalesOrderSummary[];
  invoices: SalesInvoiceSummary[];
  receipts: CustomerReceipt[];
  purchaseOrders: PurchaseOrderSummary[];
  purchaseReceipts: PurchaseReceiptSummary[];
  supplierPayments: SupplierPayment[];
};

export const emptyData: AppData = {
  dashboardSummary: null,
  dueSummary: null,
  topProducts: [],
  lowStockAlerts: [],
  recentActivities: [],
  products: [],
  productCatalog: [],
  customers: [],
  suppliers: [],
  quotes: [],
  orders: [],
  invoices: [],
  receipts: [],
  purchaseOrders: [],
  purchaseReceipts: [],
  supplierPayments: [],
};

export const defaultSessionDraft: SessionDraft = {
  organizationId: "",
  warehouseId: "",
  username: "",
  password: "",
};
