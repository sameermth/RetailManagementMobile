import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CustomersStackParamList } from './types';
import { colors } from '@theme/color';

// Import screens (we'll create these next)
import CustomerListScreen from '@screens/customers/CustomerList';
import CustomerDetailScreen from '@screens/customers/CustomerDetail';
import AddCustomerScreen from '@screens/customers/AddCustomer';
import EditCustomerScreen from '@screens/customers/EditCustomer';
import CustomerDuesScreen from '@screens/customers/CustomerDues';

const Stack = createNativeStackNavigator<CustomersStackParamList>();

const CustomersStack = () => {
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
                name="CustomerList"
                component={CustomerListScreen}
                options={{ title: 'Customers' }}
            />
            <Stack.Screen
                name="CustomerDetail"
                component={CustomerDetailScreen}
                options={{ title: 'Customer Details' }}
            />
            <Stack.Screen
                name="AddCustomer"
                component={AddCustomerScreen}
                options={{ title: 'Add Customer' }}
            />
            <Stack.Screen
                name="EditCustomer"
                component={EditCustomerScreen}
                options={{ title: 'Edit Customer' }}
            />
            <Stack.Screen
                name="CustomerDues"
                component={CustomerDuesScreen}
                options={{ title: 'Customer Dues' }}
            />
        </Stack.Navigator>
    );
};

export default CustomersStack;