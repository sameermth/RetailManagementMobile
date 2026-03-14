import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InventoryStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import InventoryListScreen from '@screens/inventory/InventoryList';
import StockMovementsScreen from '@screens/inventory/StockMovements';
import LowStockAlertsScreen from '@screens/inventory/LowStockAlerts';
import WarehousesScreen from '@screens/inventory/Warehouses';
import AdjustStockScreen from '@screens/inventory/AdjustStock';
import TransferStockScreen from '@screens/inventory/TransferStock';

const Stack = createNativeStackNavigator<InventoryStackParamList>();

const InventoryStack = () => {
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
                name="InventoryList"
                component={InventoryListScreen}
                options={{ title: 'Inventory' }}
            />
            <Stack.Screen
                name="StockMovements"
                component={StockMovementsScreen}
                options={{ title: 'Stock Movements' }}
            />
            <Stack.Screen
                name="LowStockAlerts"
                component={LowStockAlertsScreen}
                options={{ title: 'Low Stock Alerts' }}
            />
            <Stack.Screen
                name="Warehouses"
                component={WarehousesScreen}
                options={{ title: 'Warehouses' }}
            />
            <Stack.Screen
                name="AdjustStock"
                component={AdjustStockScreen}
                options={{ title: 'Adjust Stock' }}
            />
            <Stack.Screen
                name="TransferStock"
                component={TransferStockScreen}
                options={{ title: 'Transfer Stock' }}
            />
        </Stack.Navigator>
    );
};

export default InventoryStack;