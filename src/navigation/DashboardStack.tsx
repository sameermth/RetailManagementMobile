import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList } from './types';

// Import screens
import DashboardScreen from '@screens/dashboard/Dashboard';
import {colors} from "@theme/color";
import SalesReportScreen from "@screens/sales/SalesReport";
import InventoryReportScreen from "@screens/sales/InventoryReport";
import FinancialReportScreen from "@screens/sales/FinancialReport";

const Stack = createNativeStackNavigator();

const DashboardStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="DashboardMain"
                component={DashboardScreen}
                options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
                name="SalesReport"
                component={SalesReportScreen}
                options={{ title: 'Sales Report' }}
            />
            <Stack.Screen
                name="InventoryReport"
                component={InventoryReportScreen}
                options={{ title: 'Inventory Report' }}
            />
            <Stack.Screen
                name="FinancialReport"
                component={FinancialReportScreen}
                options={{ title: 'Financial Report' }}
            />
        </Stack.Navigator>
    );
};

export default DashboardStack;