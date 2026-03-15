import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReportsStackParamList } from './types';
import { colors } from '@theme/color';

// Import screens
import ReportListScreen from '@screens/reports/ReportList';
import ReportViewerScreen from '@screens/reports/ReportViewer';
import SalesReportScreen from "@screens/sales/SalesReport";
import InventoryReportScreen from "@screens/sales/InventoryReport";
import FinancialReportScreen from "@screens/sales/FinancialReport";
const Stack = createNativeStackNavigator<ReportsStackParamList>();

const ReportsStack = () => {
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
                    backgroundColor: colors.gray[50],
                },
            }}
        >
            <Stack.Screen
                name="ReportList"
                component={ReportListScreen}
                options={{ title: 'Reports' }}
            />
            <Stack.Screen
                name="ReportViewer"
                component={ReportViewerScreen}
                options={{ title: 'Report Viewer' }}
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

export default ReportsStack;