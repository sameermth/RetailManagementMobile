import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PurchasesStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import PurchaseListScreen from '@screens/purchases/PurchaseList';
import PurchaseDetailScreen from '@screens/purchases/PurchaseDetail';
import CreatePurchaseScreen from '@screens/purchases/CreatePurchase';
import ReceivePurchaseScreen from '@screens/purchases/ReceivePurchase';

const Stack = createNativeStackNavigator<PurchasesStackParamList>();

const PurchasesStack = () => {
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
                name="PurchaseList"
                component={PurchaseListScreen}
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
                options={{ title: 'Create Purchase Order' }}
            />
            <Stack.Screen
                name="ReceivePurchase"
                component={ReceivePurchaseScreen}
                options={{ title: 'Receive Items' }}
            />
        </Stack.Navigator>
    );
};

export default PurchasesStack;