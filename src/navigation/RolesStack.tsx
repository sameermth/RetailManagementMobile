import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RolesStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import RoleListScreen from '@screens/roles/RoleList';
import RoleDetailScreen from '@screens/roles/RoleDetail';
import AddRoleScreen from '@screens/roles/AddRole';
import EditRoleScreen from '@screens/roles/EditRole';

const Stack = createNativeStackNavigator<RolesStackParamList>();

const RolesStack = () => {
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
                name="RoleList"
                component={RoleListScreen}
                options={{ title: 'Roles & Permissions' }}
            />
            <Stack.Screen
                name="RoleDetail"
                component={RoleDetailScreen}
                options={{ title: 'Role Details' }}
            />
            <Stack.Screen
                name="AddRole"
                component={AddRoleScreen}
                options={{ title: 'Create Role' }}
            />
            <Stack.Screen
                name="EditRole"
                component={EditRoleScreen}
                options={{ title: 'Edit Role' }}
            />
        </Stack.Navigator>
    );
};

export default RolesStack;