import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SuppliersStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import SupplierListScreen from '@screens/suppliers/SupplierList';
import SupplierDetailScreen from '@screens/suppliers/SupplierDetail';
import AddSupplierScreen from '@screens/suppliers/AddSupplier';
import EditSupplierScreen from '@screens/suppliers/EditSupplier';

const Stack = createNativeStackNavigator<SuppliersStackParamList>();

const SuppliersStack = () => {
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
                name="SupplierList"
                component={SupplierListScreen}
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
            <Stack.Screen
                name="EditSupplier"
                component={EditSupplierScreen}
                options={{ title: 'Edit Supplier' }}
            />
        </Stack.Navigator>
    );
};

export default SuppliersStack;