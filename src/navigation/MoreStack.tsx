import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreStackParamList } from './types';
import { colors } from '@theme/color';

// Import screens (we'll create these next)
import MoreMenuScreen from '@screens/more/MoreMenu';
import SuppliersScreen from '@screens/suppliers/SupplierList';
import PurchasesScreen from '@screens/purchases/PurchaseList';
import ExpensesScreen from '@screens/expenses/ExpenseList';
import ReportsScreen from '@screens/reports/ReportList';
import SettingsScreen from '@screens/settings/Settings';
import ProfileScreen from '@screens/settings/Profile';

// Import detail screens
import SupplierDetailScreen from '@screens/suppliers/SupplierDetail';
import AddSupplierScreen from '@screens/suppliers/AddSupplier';
import PurchaseDetailScreen from '@screens/purchases/PurchaseDetail';
import CreatePurchaseScreen from '@screens/purchases/CreatePurchase';
import ExpenseDetailScreen from '@screens/expenses/ExpenseDetail';
import AddExpenseScreen from '@screens/expenses/AddExpense';
import ReportViewerScreen from '@screens/reports/ReportViewer';
import DistributorsStack from "@navigation/DistributorStack";
import UsersStack from "@navigation/UsersStack";
import RolesStack from "@navigation/RolesStack";

const Stack = createNativeStackNavigator<MoreStackParamList>();

const MoreStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text.primary,
                },
                headerTintColor: colors.primary[500],
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen
                name="MoreMenu"
                component={MoreMenuScreen}
                options={{ title: 'More Options' }}
            />

            {/* Suppliers */}
            <Stack.Screen
                name="Suppliers"
                component={SuppliersScreen}
                options={{ title: 'Suppliers' }}
            />
            <Stack.Screen
                name="SupplierDetail"
                component={SupplierDetailScreen}
                options={{ title: 'Supplier Details' }}
            />
            <Stack.Screen
                name="AddSupplier"
                component={AddSupplierScreen}
                options={{ title: 'Add Supplier' }}
            />

            {/* Purchases */}
            <Stack.Screen
                name="Purchases"
                component={PurchasesScreen}
                options={{ title: 'Purchase Orders' }}
            />
            <Stack.Screen
                name="PurchaseDetail"
                component={PurchaseDetailScreen}
                options={{ title: 'Purchase Details' }}
            />
            <Stack.Screen
                name="CreatePurchase"
                component={CreatePurchaseScreen}
                options={{ title: 'Create Purchase' }}
            />

            {/* Expenses */}
            <Stack.Screen
                name="Expenses"
                component={ExpensesScreen}
                options={{ title: 'Expenses' }}
            />
            <Stack.Screen
                name="ExpenseDetail"
                component={ExpenseDetailScreen}
                options={{ title: 'Expense Details' }}
            />
            <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{ title: 'Add Expense' }}
            />

            {/* Reports */}
            <Stack.Screen
                name="Reports"
                component={ReportsScreen}
                options={{ title: 'Reports' }}
            />
            <Stack.Screen
                name="ReportViewer"
                component={ReportViewerScreen}
                options={{ title: 'Report' }}
            />

            {/* Distributors - Add this */}
            <Stack.Screen
                name="Distributors"
                component={DistributorsStack}
                options={{ headerShown: false }}
            />

            {/* Settings */}
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
            <Stack.Screen
                name="Users"
                component={UsersStack}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
            <Stack.Screen
                name="Roles"
                component={RolesStack}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default MoreStack;