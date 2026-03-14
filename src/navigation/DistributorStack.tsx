import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DistributorsStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import DistributorListScreen from '@screens/distributors/DistributorList';
import DistributorDetailScreen from '@screens/distributors/DistributorDetail';
import AddDistributorScreen from '@screens/distributors/AddDistributor';
import EditDistributorScreen from '@screens/distributors/EditDistributor';
import DistributorOrdersScreen from '@screens/distributors/DistributorOrdersScreen';
import DistributorOrderDetailScreen from '@screens/distributors/DistributorOrderDetail';
import CreateDistributorOrderScreen from '@screens/distributors/CreateDistributorOrderScreen';
import DistributorPaymentsScreen from '@screens/distributors/DistributorPaymentsScreen';
import CreateDistributorPaymentScreen from '@screens/distributors/CreateDistributorPaymentScreen';

const Stack = createNativeStackNavigator<DistributorsStackParamList>();

const DistributorsStack = () => {
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
                name="DistributorList"
                component={DistributorListScreen}
                options={{ title: 'Distributors' }}
            />
            <Stack.Screen
                name="DistributorDetail"
                component={DistributorDetailScreen}
                options={{ title: 'Distributor Details' }}
            />
            <Stack.Screen
                name="AddDistributor"
                component={AddDistributorScreen}
                options={{ title: 'Add Distributor' }}
            />
            <Stack.Screen
                name="EditDistributor"
                component={EditDistributorScreen}
                options={{ title: 'Edit Distributor' }}
            />
            <Stack.Screen
                name="DistributorOrders"
                component={DistributorOrdersScreen}
                options={{ title: 'Orders' }}
            />
            <Stack.Screen
                name="DistributorOrderDetail"
                component={DistributorOrderDetailScreen}
                options={{ title: 'Order Details' }}
            />
            <Stack.Screen
                name="CreateDistributorOrder"
                component={CreateDistributorOrderScreen}
                options={{ title: 'Create Order' }}
            />
            <Stack.Screen
                name="DistributorPayments"
                component={DistributorPaymentsScreen}
                options={{ title: 'Payments' }}
            />
            <Stack.Screen
                name="CreateDistributorPayment"
                component={CreateDistributorPaymentScreen}
                options={{ title: 'Record Payment' }}
            />
        </Stack.Navigator>
    );
};

export default DistributorsStack;