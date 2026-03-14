// Auth Stack
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
    Dashboard: undefined;
    POS: undefined;
    Products: undefined;
    Customers: undefined;
    More: undefined;
};

// Products Stack
export type ProductsStackParamList = {
    ProductList: undefined;
    ProductDetail: { productId: number };
    AddProduct: undefined;
    EditProduct: { productId: number };
    Categories: undefined;
    Brands: undefined;
};

// Customers Stack
export type CustomersStackParamList = {
    CustomerList: undefined;
    CustomerDetail: { customerId: number };
    AddCustomer: undefined;
    EditCustomer: { customerId: number };
    CustomerDues: { customerId: number };
};

// Sales Stack
export type SalesStackParamList = {
    SalesList: undefined;
    SaleDetail: { saleId: number };
    POS: undefined;
    Cart: undefined;
    Checkout: undefined;
    Payment: { saleId: number; totalAmount: number };
    Invoice: { saleId: number };
};

// Inventory Stack
export type InventoryStackParamList = {
    InventoryList: undefined;
    StockMovements: undefined;
    LowStockAlerts: undefined;
    Warehouses: undefined;
    AdjustStock: { productId: number };
    TransferStock: { productId: number };
};

// Suppliers Stack
export type SuppliersStackParamList = {
    SupplierList: undefined;
    SupplierDetail: { supplierId: number };
    AddSupplier: undefined;
    EditSupplier: { supplierId: number };
    SupplierContacts: { supplierId: number };
    SupplierRatings: { supplierId: number };
};

// Purchases Stack
export type PurchasesStackParamList = {
    PurchaseList: undefined;
    PurchaseDetail: { purchaseId: number };
    CreatePurchase: undefined;
    ReceivePurchase: { purchaseId: number };
};

// Expenses Stack
export type ExpensesStackParamList = {
    ExpenseList: undefined;
    ExpenseDetail: { expenseId: number };
    AddExpense: undefined;
    Categories: undefined;
    RecurringExpenses: undefined;
};

// Reports Stack
export type ReportsStackParamList = {
    ReportList: undefined;
    ReportViewer: { reportType: string; reportId?: number };
    SalesReport: undefined;
    InventoryReport: undefined;
    FinancialReport: undefined;
    ScheduledReports: undefined;
    CreateSchedule: undefined;
};

// Distributors Stack
export type DistributorsStackParamList = {
    DistributorList: undefined;
    DistributorDetail: { distributorId: number };
    AddDistributor: undefined;
    EditDistributor: { distributorId: number };
    DistributorOrders: { distributorId: number };
    DistributorOrderDetail: { orderId: number };
    CreateDistributorOrder: { distributorId: number };
    DistributorPayments: { distributorId: number };
    CreateDistributorPayment: { distributorId: number };
};

// Users Stack
export type UsersStackParamList = {
    UserList: undefined;
    UserDetail: { userId: number };
    AddUser: undefined;
    EditUser: { userId: number };
    ChangePassword: { userId?: number };
};

// Roles Stack
export type RolesStackParamList = {
    RoleList: undefined;
    RoleDetail: { roleId: number };
    AddRole: undefined;
    EditRole: { roleId: number };
};

// Settings Stack
export type SettingsStackParamList = {
    Settings: undefined;
    Profile: undefined;
    StoreSettings: undefined;
    TaxSettings: undefined;
    InvoiceSettings: undefined;
    PrintSettings: undefined;
    BackupSettings: undefined;
    SystemSettings: undefined;
    ChangePassword: undefined;
    TwoFactorAuth: undefined;
    LoginHistory: undefined;
    NotificationPreferences: undefined;
};

// Help Stack
export type HelpStackParamList = {
    HelpCenter: undefined;
    FAQ: undefined;
    ContactSupport: undefined;
    Tutorials: undefined;
    About: undefined;
};

// Notifications Stack
export type NotificationsStackParamList = {
    NotificationList: undefined;
    NotificationDetail: { notificationId: string };
    NotificationSettings: undefined;
};

// Audit Stack
export type AuditStackParamList = {
    AuditLogs: undefined;
    AuditDetail: { logId: number };
};

// Backup Stack
export type BackupStackParamList = {
    BackupList: undefined;
    CreateBackup: undefined;
    RestoreBackup: { backupId: number };
    ScheduleBackup: undefined;
};

// Data Stack
export type DataStackParamList = {
    ExportData: undefined;
    ImportData: undefined;
    DataMapping: { importId: string };
};

// More Stack
export type MoreStackParamList = {
    MoreMenu: undefined;
    Suppliers: undefined;
    Purchases: undefined;
    Expenses: undefined;
    Reports: undefined;
    Distributors: undefined;
    Users: undefined;
    Roles: undefined;
    Settings: undefined;
    Help: undefined;
    Notifications: undefined;
    Audit: undefined;
    Backup: undefined;
    Data: undefined;
};

// Root Stack - Combines all stacks using intersection type
export type RootStackParamList = AuthStackParamList
    & MainTabParamList
    & ProductsStackParamList
    & CustomersStackParamList
    & SalesStackParamList
    & InventoryStackParamList
    & SuppliersStackParamList
    & PurchasesStackParamList
    & ExpensesStackParamList
    & ReportsStackParamList
    & DistributorsStackParamList
    & UsersStackParamList
    & RolesStackParamList
    & SettingsStackParamList
    & HelpStackParamList
    & NotificationsStackParamList
    & AuditStackParamList
    & BackupStackParamList
    & DataStackParamList
    & MoreStackParamList & {
    Splash: undefined;
    Auth: undefined;
    Main: undefined;
};

// CORRECT WAY: Augment the existing RootParamList from React Navigation
declare global {
    namespace ReactNavigation {
        // @ts-ignore
        interface RootParamList extends RootStackParamList {}
    }
}