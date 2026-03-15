import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SalesStackParamList } from './types';
import { colors } from '@theme/color';

// Import screens (we'll create these next)
import POSScreen from '@screens/sales/POS';
import CartScreen from '@screens/sales/Cart';
import CheckoutScreen from '@screens/sales/Checkout';
import PaymentScreen from '@screens/sales/Payment';
import InvoiceScreen from '@screens/sales/Invoice';

const Stack = createNativeStackNavigator<SalesStackParamList>();

const POSStack = () => {
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
                name="POS"
                component={POSScreen}
                options={{ title: 'Point of Sale' }}
            />
            <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{ title: 'Shopping Cart' }}
            />
            <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{ title: 'Checkout' }}
            />
            <Stack.Screen
                name="Payment"
                component={PaymentScreen}
                options={{ title: 'Payment' }}
            />
            <Stack.Screen
                name="Invoice"
                component={InvoiceScreen}
                options={{ title: 'Invoice' }}
            />
        </Stack.Navigator>
    );
};

export default POSStack;