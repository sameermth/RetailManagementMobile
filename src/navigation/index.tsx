import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import Icon from '../components/Icon';

// Import all your types
import {
    AuthStackParamList,
    MainTabParamList,
    ProductsStackParamList,
    CustomersStackParamList,
    SalesStackParamList,
    InventoryStackParamList,
    SuppliersStackParamList,
    PurchasesStackParamList,
    ExpensesStackParamList,
    ReportsStackParamList,
    DistributorsStackParamList,
    UsersStackParamList,
    RolesStackParamList,
    SettingsStackParamList,
    HelpStackParamList,
    NotificationsStackParamList,
    AuditStackParamList,
    BackupStackParamList,
    DataStackParamList,
    MoreStackParamList,
    RootStackParamList,
} from './types';

// Import Auth Screens (EXISTING)
import LoginScreen from '../screens/auth/Login';
import RegisterScreen from '../screens/auth/Register';
import ForgotPasswordScreen from '../screens/auth/ForgotPassword';

// Import Main Tab Screens (EXISTING)
import DashboardScreen from '../screens/dashboard/Dashboard';
import POSScreen from '../screens/sales/POS';

// Products Stack (EXISTING)
import ProductListScreen from '../screens/products/ProductList';
import ProductDetailScreen from '../screens/products/ProductDetail';
import AddProductScreen from '../screens/products/AddProduct';
import EditProductScreen from '../screens/products/EditProduct';
import CategoriesScreen from '../screens/products/Categories';
import BrandsScreen from '../screens/products/Brands';

// Customers Stack (EXISTING)
import CustomerListScreen from '../screens/customers/CustomerList';
import CustomerDetailScreen from '../screens/customers/CustomerDetail';
import AddCustomerScreen from '../screens/customers/AddCustomer';
import EditCustomerScreen from '../screens/customers/EditCustomer';
import CustomerDuesScreen from '../screens/customers/CustomerDues';

// Sales Stack (EXISTING)
import SalesListScreen from '../screens/sales/SalesList';
import SaleDetailScreen from '../screens/sales/SalesDetail';
import CartScreen from '../screens/sales/Cart';
import CheckoutScreen from '../screens/sales/Checkout';
import PaymentScreen from '../screens/sales/Payment';
import InvoiceScreen from '../screens/sales/Invoice';

// Inventory Stack (EXISTING)
import InventoryListScreen from '../screens/inventory/InventoryList';
import StockMovementsScreen from '../screens/inventory/StockMovements';
import LowStockAlertsScreen from '../screens/inventory/LowStockAlertsScreen';
import WarehousesScreen from '../screens/inventory/Warehouses';
import AdjustStockScreen from '../screens/inventory/AdjustStock';
import TransferStockScreen from '../screens/inventory/TransferStock';

// Suppliers Stack (EXISTING)
import SupplierListScreen from '../screens/suppliers/SupplierList';
import SupplierDetailScreen from '../screens/suppliers/SupplierDetail';
import AddSupplierScreen from '../screens/suppliers/AddSupplier';
import EditSupplierScreen from '../screens/suppliers/EditSupplier';

// Purchases Stack (EXISTING)
import PurchaseListScreen from '../screens/purchases/PurchaseList';
import PurchaseDetailScreen from '../screens/purchases/PurchaseDetail';
import CreatePurchaseScreen from '../screens/purchases/CreatePurchase';
import ReceivePurchaseScreen from '../screens/purchases/ReceivePurchase';

// Expenses Stack (EXISTING)
import ExpenseListScreen from '../screens/expenses/ExpenseList';
import ExpenseDetailScreen from '../screens/expenses/ExpenseDetail';
import AddExpenseScreen from '../screens/expenses/AddExpense';
import RecurringExpensesScreen from '../screens/expenses/RecurringExpenses';

// Reports Stack (EXISTING)
import ReportListScreen from '../screens/reports/ReportList';
import ReportViewerScreen from '../screens/reports/ReportViewer';

// Distributors Stack (EXISTING)
import DistributorListScreen from '../screens/distributors/DistributorList';
import DistributorDetailScreen from '../screens/distributors/DistributorDetails';
import AddDistributorScreen from '../screens/distributors/AddDistributor';
import EditDistributorScreen from '../screens/distributors/EditDistributor';
import DistributorOrdersScreen from '../screens/distributors/DistributorOrders';
import DistributorOrderDetailScreen from '../screens/distributors/DistributorOrderDetail';
import CreateDistributorOrderScreen from '../screens/distributors/CreateDistributorOrder';
import DistributorPaymentsScreen from '../screens/distributors/DistributorPayments';
import CreateDistributorPaymentScreen from '../screens/distributors/CreateDistributorPayment';

// Users Stack (EXISTING)
import UserListScreen from '../screens/users/UserList';
import UserDetailScreen from '../screens/users/UserDetail';
import AddUserScreen from '../screens/users/AddUser';
import EditUserScreen from '../screens/users/EditUser';

// Roles Stack (EXISTING)
import RoleListScreen from '../screens/roles/RoleList';
import RoleDetailScreen from '../screens/roles/RoleDetail';
import AddRoleScreen from '../screens/roles/AddRole';
import EditRoleScreen from '../screens/roles/EditRole';

// Settings Stack (EXISTING)
import SettingsScreen from '../screens/settings/Settings';
import ProfileScreen from '../screens/settings/Profile';
import TaxSettingsScreen from '../screens/settings/TaxSettings';
import InvoiceSettingsScreen from '../screens/settings/InvoiceSettings';
import PrintSettingsScreen from '../screens/settings/PrintSettings';
import BackupSettingsScreen from '../screens/settings/BackupSettings';
import SystemSettingsScreen from '../screens/settings/SystemSettings';
import TwoFactorAuthScreen from '../screens/settings/TwoFactorAuth';
import LoginHistoryScreen from '../screens/settings/LoginHistory';
import NotificationPreferencesScreen from '../screens/settings/NotificationPreferences';

// More Stack (EXISTING)
import MoreMenuScreen from '../screens/more/MoreMenu';

import { RootState } from '../store';
import { colors } from '@theme/color';
import ChangePasswordScreen from "@screens/settings/ChangePassword";
import ExpenseCategoriesScreen from "@screens/expenses/Categories";
import CustomHeader from "@components/CustomHeader";
import POSStack from "@navigation/POSStack";

// Custom back button component
const CustomBackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={{ marginLeft: 8 }}>
        <Icon name="chevron-left" size={24} color={colors.text.primary} />
    </TouchableOpacity>
);

// Default screen options for all stack navigators
const stackScreenOptions = {
    headerBackVisible: false, // Hide the default back button
    headerBackButtonDisplayMode: 'minimal', // Minimize back button display
    headerBackTitleVisible: false, // Hide back button title
    headerBackButtonMenuEnabled: false, // Disable back button menu
    headerLeft: (props: any) => <CustomBackButton onPress={props.onPress} />,
};

// Create navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Create all stack navigators
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const CustomersStack = createNativeStackNavigator<CustomersStackParamList>();
const SalesStack = createNativeStackNavigator<SalesStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const SuppliersStack = createNativeStackNavigator<SuppliersStackParamList>();
const PurchasesStack = createNativeStackNavigator<PurchasesStackParamList>();
const ExpensesStack = createNativeStackNavigator<ExpensesStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const DistributorsStack = createNativeStackNavigator<DistributorsStackParamList>();
const UsersStack = createNativeStackNavigator<UsersStackParamList>();
const RolesStack = createNativeStackNavigator<RolesStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth Navigator
const AuthNavigator = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} options={{ header: (props) => <CustomHeader title="Login" showBackButton={false} {...props} />, }} />
            <AuthStack.Screen name="Register" component={RegisterScreen} options={{ header: (props) => <CustomHeader title="Register" showBackButton={false} {...props} />,}}/>
            <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{header: (props) => <CustomHeader title="Forgot Password" showBackButton={false} {...props} />,}}/>
        </AuthStack.Navigator>
    );
};

// Products Stack Navigator
const ProductsStackNavigator = () => {
    return (
        <ProductsStack.Navigator screenOptions={stackScreenOptions}>
            <ProductsStack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Products', header: (props) => <CustomHeader title="Product List" showBackButton={false} {...props} /> }} />
            <ProductsStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product Details', header: (props) => <CustomHeader title="Product Details" showBackButton={false} {...props} /> }} />
            <ProductsStack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add Product', header: (props) => <CustomHeader title="Add Product" showBackButton={false} {...props} /> }} />
            <ProductsStack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Edit Product', header: (props) => <CustomHeader title="Edit Product" showBackButton={false} {...props} /> }} />
            <ProductsStack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories', header: (props) => <CustomHeader title="Categories" showBackButton={false} {...props} /> }} />
            <ProductsStack.Screen name="Brands" component={BrandsScreen} options={{ title: 'Brands', header: (props) => <CustomHeader title="Brands" showBackButton={false} {...props} /> }} />
        </ProductsStack.Navigator>
    );
};

// Customers Stack Navigator
const CustomersStackNavigator = () => {
    return (
        <CustomersStack.Navigator screenOptions={stackScreenOptions}>
            <CustomersStack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers', header: (props) => <CustomHeader title="Customers" showBackButton={false} {...props} /> }} />
            <CustomersStack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details', header: (props) => <CustomHeader title="Customer Details" showBackButton={false} {...props} /> }} />
            <CustomersStack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer', header: (props) => <CustomHeader title="Add Customer" showBackButton={false} {...props} /> }} />
            <CustomersStack.Screen name="EditCustomer" component={EditCustomerScreen} options={{ title: 'Edit Customer', header: (props) => <CustomHeader title="Edit Customer" showBackButton={false} {...props} /> }} />
            <CustomersStack.Screen name="CustomerDues" component={CustomerDuesScreen} options={{ title: 'Customer Dues', header: (props) => <CustomHeader title="CustomerDues" showBackButton={false} {...props} /> }} />
        </CustomersStack.Navigator>
    );
};

// Sales Stack Navigator
const SalesStackNavigator = () => {
    return (
        <SalesStack.Navigator screenOptions={stackScreenOptions}>
            <SalesStack.Screen name="POS" component={POSScreen} options={{ title: 'Point of Sale', header: (props) => <CustomHeader title="Point of Sale" showBackButton={false} {...props} /> }} />
            <SalesStack.Screen name="SalesList" component={SalesListScreen} options={{ title: 'Sales History', header: (props) => <CustomHeader title="Sales History" showBackButton={false} {...props} /> }} />
            <SalesStack.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Sale Details', header: (props) => <CustomHeader title="Sale Details" showBackButton={false} {...props} /> }} />
            <SalesStack.Screen name="Cart" component={CartScreen} options={{ title: 'Shopping Cart', header: (props) => <CustomHeader title="Cart" showBackButton={false} {...props} /> }} />
            <SalesStack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout', header: (props) => <CustomHeader title="Checkout" showBackButton={false} {...props} /> }} />
            <SalesStack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment', header: (props) => <CustomHeader title="Payment" showBackButton={false} {...props} /> }} />
            <SalesStack.Screen name="Invoice" component={InvoiceScreen} options={{ title: 'Invoice', header: (props) => <CustomHeader title="Invoice" showBackButton={false} {...props} /> }} />
        </SalesStack.Navigator>
    );
};

// Inventory Stack Navigator
const InventoryStackNavigator = () => {
    return (
        <InventoryStack.Navigator screenOptions={stackScreenOptions}>
            <InventoryStack.Screen name="InventoryList" component={InventoryListScreen} options={{ title: 'Inventory', header: (props) => <CustomHeader title="Inventory" showBackButton={false} {...props} /> }} />
            <InventoryStack.Screen name="StockMovements" component={StockMovementsScreen} options={{ title: 'Stock Movements', header: (props) => <CustomHeader title="Stock Movements" showBackButton={false} {...props} />, }} />
            <InventoryStack.Screen name="LowStockAlerts" component={LowStockAlertsScreen} options={{ title: 'Low Stock Alerts', header: (props) => <CustomHeader title="Low Stock Alerts" showBackButton={false} {...props} />, }} />
            <InventoryStack.Screen name="Warehouses" component={WarehousesScreen} options={{ title: 'Warehouses', header: (props) => <CustomHeader title="Warehouses" showBackButton={false} {...props} /> }} />
            <InventoryStack.Screen name="AdjustStock" component={AdjustStockScreen} options={{ title: 'Adjust Stock', header: (props) => <CustomHeader title="Adjust Stocks" showBackButton={false} {...props} />, }} />
            <InventoryStack.Screen name="TransferStock" component={TransferStockScreen} options={{ title: 'Transfer Stock', header: (props) => <CustomHeader title="Transfer Stock" showBackButton={false} {...props} />, }} />
        </InventoryStack.Navigator>
    );
};

// Suppliers Stack Navigator
const SuppliersStackNavigator = () => {
    return (
        <SuppliersStack.Navigator screenOptions={stackScreenOptions}>
            <SuppliersStack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: 'Suppliers', header: (props) => <CustomHeader title="Suppliers" showBackButton={false} {...props} /> }} />
            <SuppliersStack.Screen name="SupplierDetail" component={SupplierDetailScreen} options={{ title: 'Supplier Details', header: (props) => <CustomHeader title="Supplier Details" showBackButton={false} {...props} /> }} />
            <SuppliersStack.Screen name="AddSupplier" component={AddSupplierScreen} options={{ title: 'Add Supplier', header: (props) => <CustomHeader title="Add Supplier" showBackButton={false} {...props} />, }} />
            <SuppliersStack.Screen name="EditSupplier" component={EditSupplierScreen} options={{ title: 'Edit Supplier', header: (props) => <CustomHeader title="Edit Supplier" showBackButton={false} {...props} />, }} />
        </SuppliersStack.Navigator>
    );
};

// Purchases Stack Navigator
const PurchasesStackNavigator = () => {
    return (
        <PurchasesStack.Navigator screenOptions={stackScreenOptions}>
            <PurchasesStack.Screen name="PurchaseList" component={PurchaseListScreen} options={{ title: 'Purchases', header: (props) => <CustomHeader title="Purchases" showBackButton={false} {...props} />, }} />
            <PurchasesStack.Screen name="PurchaseDetail" component={PurchaseDetailScreen} options={{ title: 'Purchase Details', header: (props) => <CustomHeader title="Purchase Details" showBackButton={false} {...props} /> }} />
            <PurchasesStack.Screen name="CreatePurchase" component={CreatePurchaseScreen} options={{ title: 'Create Purchase', header: (props) => <CustomHeader title="Create Purchase" showBackButton={false} {...props} /> }} />
            <PurchasesStack.Screen name="ReceivePurchase" component={ReceivePurchaseScreen} options={{ title: 'Receive Purchase', header: (props) => <CustomHeader title="Receive Purchase" showBackButton={false} {...props} /> }} />
        </PurchasesStack.Navigator>
    );
};

// Expenses Stack Navigator
const ExpensesStackNavigator = () => {
    return (
        <ExpensesStack.Navigator screenOptions={stackScreenOptions}>
            <ExpensesStack.Screen name="ExpenseList" component={ExpenseListScreen} options={{ title: 'Expenses', header: (props) => <CustomHeader title="Expenses" showBackButton={false} {...props} /> }} />
            <ExpensesStack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} options={{ title: 'Expense Details', header: (props) => <CustomHeader title="Expense Details" showBackButton={false} {...props} /> }} />
            <ExpensesStack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense', header: (props) => <CustomHeader title="Add Expense" showBackButton={false} {...props} /> }} />
            <ExpensesStack.Screen name="Categories" component={ExpenseCategoriesScreen} options={{ title: 'Categories', header: (props) => <CustomHeader title="Categories" showBackButton={false} {...props} /> }} />
            <ExpensesStack.Screen name="RecurringExpenses" component={RecurringExpensesScreen} options={{ title: 'Recurring Expenses', header: (props) => <CustomHeader title="Recurring Expenses" showBackButton={false} {...props} /> }} />
        </ExpensesStack.Navigator>
    );
};

// Reports Stack Navigator
const ReportsStackNavigator = () => {
    return (
        <ReportsStack.Navigator screenOptions={stackScreenOptions}>
            <ReportsStack.Screen name="ReportList" component={ReportListScreen} options={{ title: 'Reports', header: (props) => <CustomHeader title="Reports" showBackButton={false} {...props} /> }} />
            <ReportsStack.Screen name="ReportViewer" component={ReportViewerScreen} options={{ title: 'Report Viewer', header: (props) => <CustomHeader title="Report Viewer" showBackButton={false} {...props} /> }} />
        </ReportsStack.Navigator>
    );
};

// Distributors Stack Navigator
const DistributorsStackNavigator = () => {
    return (
        <DistributorsStack.Navigator screenOptions={stackScreenOptions}>
            <DistributorsStack.Screen name="DistributorList" component={DistributorListScreen} options={{ title: 'Distributors', header: (props) => <CustomHeader title="Distributors" showBackButton={false} {...props} /> }} />
            <DistributorsStack.Screen name="DistributorDetail" component={DistributorDetailScreen} options={{ title: 'Distributor Details', header: (props) => <CustomHeader title="Distributor Details" showBackButton={false} {...props} /> }} />
            <DistributorsStack.Screen name="AddDistributor" component={AddDistributorScreen} options={{ title: 'Add Distributor', header: (props) => <CustomHeader title="Add Distributor" showBackButton={false} {...props} />, }} />
            <DistributorsStack.Screen name="EditDistributor" component={EditDistributorScreen} options={{ title: 'Edit Distributor', header: (props) => <CustomHeader title="Edit Distributor" showBackButton={false} {...props} />, }} />
            <DistributorsStack.Screen name="DistributorOrders" component={DistributorOrdersScreen} options={{ title: 'Orders', header: (props) => <CustomHeader title="Orders" showBackButton={false} {...props} /> }} />
            <DistributorsStack.Screen name="DistributorOrderDetail" component={DistributorOrderDetailScreen} options={{ title: 'Order Details', header: (props) => <CustomHeader title="Order Details" showBackButton={false} {...props} /> }} />
            <DistributorsStack.Screen name="CreateDistributorOrder" component={CreateDistributorOrderScreen} options={{ title: 'Create Order', header: (props) => <CustomHeader title="Create Order" showBackButton={false} {...props} /> }} />
            <DistributorsStack.Screen name="DistributorPayments" component={DistributorPaymentsScreen} options={{ title: 'Payments', header: (props) => <CustomHeader title="Payments" showBackButton={false} {...props} /> }} />
            <DistributorsStack.Screen name="CreateDistributorPayment" component={CreateDistributorPaymentScreen} options={{ title: 'Create Payment', header: (props) => <CustomHeader title="Create Payment" showBackButton={false} {...props} /> }} />
        </DistributorsStack.Navigator>
    );
};

// Users Stack Navigator
const UsersStackNavigator = () => {
    return (
        <UsersStack.Navigator screenOptions={stackScreenOptions}>
            <UsersStack.Screen name="UserList" component={UserListScreen} options={{ title: 'Users', header: (props) => <CustomHeader title="Users" showBackButton={false} {...props} /> }} />
            <UsersStack.Screen name="UserDetail" component={UserDetailScreen} options={{ title: 'User Details', header: (props) => <CustomHeader title="User Details" showBackButton={false} {...props} /> }} />
            <UsersStack.Screen name="AddUser" component={AddUserScreen} options={{ title: 'Add User', header: (props) => <CustomHeader title="Add User" showBackButton={false} {...props} /> }} />
            <UsersStack.Screen name="EditUser" component={EditUserScreen} options={{ title: 'Edit User', header: (props) => <CustomHeader title="Edit User" showBackButton={false} {...props} /> }} />
            <UsersStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password', header: (props) => <CustomHeader title="Change Password" showBackButton={false} {...props} /> }} />
        </UsersStack.Navigator>
    );
};

// Roles Stack Navigator
const RolesStackNavigator = () => {
    return (
        <RolesStack.Navigator screenOptions={stackScreenOptions}>
            <RolesStack.Screen name="RoleList" component={RoleListScreen} options={{ title: 'Roles', header: (props) => <CustomHeader title="Roles" showBackButton={false} {...props} /> }} />
            <RolesStack.Screen name="RoleDetail" component={RoleDetailScreen} options={{ title: 'Role Details', header: (props) => <CustomHeader title="Role Details" showBackButton={false} {...props} /> }} />
            <RolesStack.Screen name="AddRole" component={AddRoleScreen} options={{ title: 'Add Role', header: (props) => <CustomHeader title="Add Role" showBackButton={false} {...props} /> }} />
            <RolesStack.Screen name="EditRole" component={EditRoleScreen} options={{ title: 'Edit Role', header: (props) => <CustomHeader title="Edit Role" showBackButton={false} {...props} /> }} />
        </RolesStack.Navigator>
    );
};

// Settings Stack Navigator
const SettingsStackNavigator = () => {
    return (
        <SettingsStack.Navigator screenOptions={stackScreenOptions}>
            <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', header: (props) => <CustomHeader title="Settings" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', header: (props) => <CustomHeader title="Profile" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="TaxSettings" component={TaxSettingsScreen} options={{ title: 'Tax Settings', header: (props) => <CustomHeader title="Tax Settings" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="InvoiceSettings" component={InvoiceSettingsScreen} options={{ title: 'Invoice Settings', header: (props) => <CustomHeader title="Invoice Settings" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="PrintSettings" component={PrintSettingsScreen} options={{ title: 'Print Settings', header: (props) => <CustomHeader title="Print Settings" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="BackupSettings" component={BackupSettingsScreen} options={{ title: 'Backup Settings', header: (props) => <CustomHeader title="Backup Settings" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="SystemSettings" component={SystemSettingsScreen} options={{ title: 'System Settings', header: (props) => <CustomHeader title="System Settings" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} options={{ title: 'Two Factor Auth', header: (props) => <CustomHeader title="Two Factor Authentication" showBackButton={false} {...props} />, }} />
            <SettingsStack.Screen name="LoginHistory" component={LoginHistoryScreen} options={{ title: 'Login History', header: (props) => <CustomHeader title="Login History" showBackButton={false} {...props} /> }} />
            <SettingsStack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ title: 'Notification Preferences', header: (props) => <CustomHeader title="Notification Preferences" showBackButton={false} {...props} /> }} />
        </SettingsStack.Navigator>
    );
};

// More Stack Navigator (handles all the other stacks)
const MoreStackNavigator = () => {
    return (
        <MoreStack.Navigator screenOptions={stackScreenOptions}>
            <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'More', header: (props) => <CustomHeader title="More" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Suppliers" component={SuppliersStackNavigator} options={{ title: 'Suppliers', headerShown: false, header: (props) => <CustomHeader title="Suppliers" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Purchases" component={PurchasesStackNavigator} options={{ title: 'Purchases', headerShown: false, header: (props) => <CustomHeader title="Purchases" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Expenses" component={ExpensesStackNavigator} options={{ title: 'Expenses', headerShown: false, header: (props) => <CustomHeader title="Expenses" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Reports" component={ReportsStackNavigator} options={{ title: 'Reports', headerShown: false, header: (props) => <CustomHeader title="Reports" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Distributors" component={DistributorsStackNavigator} options={{ title: 'Distributors', headerShown: false, header: (props) => <CustomHeader title="Distributors" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Users" component={UsersStackNavigator} options={{ title: 'Users', headerShown: false, header: (props) => <CustomHeader title="Users" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Roles" component={RolesStackNavigator} options={{ title: 'Roles', headerShown: false, header: (props) => <CustomHeader title="Roles" showBackButton={false} {...props} /> }} />
            <MoreStack.Screen name="Settings" component={SettingsStackNavigator} options={{ title: 'Settings', headerShown: false, header: (props) => <CustomHeader title="Settings" showBackButton={false} {...props} /> }} />
            {/* Help, Notifications, Audit, Backup, Data are commented out as screens don't exist yet */}
        </MoreStack.Navigator>
    );
};

// Main Tab Navigator
const MainTabNavigator = () => {
    return (
        <MainTab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.gray[400],
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                },
                headerShown: false,
            }}
        >
            <MainTab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <MainTab.Screen
                name="POS"
                component={SalesStackNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="cash-register" size={size} color={color} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Products"
                component={ProductsStackNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="package" size={size} color={color} />
                    ),
                }}
            />
            <MainTab.Screen
                name="Customers"
                component={CustomersStackNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" size={size} color={color} />
                    ),
                }}
            />
            <MainTab.Screen
                name="More"
                component={MoreStackNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="dots-horizontal" size={size} color={color} />
                    ),
                }}
            />
        </MainTab.Navigator>
    );
};

// Root App Navigator
const AppNavigator = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <RootStack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <RootStack.Screen name="Main" component={MainTabNavigator} />
            )}
        </RootStack.Navigator>
    );
};

export default AppNavigator;