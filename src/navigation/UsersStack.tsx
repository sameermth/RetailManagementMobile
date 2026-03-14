import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UsersStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import UserListScreen from '@screens/users/UserList';
import UserDetailScreen from '@screens/users/UserDetail';
import AddUserScreen from '@screens/users/AddUser';
import EditUserScreen from '@screens/users/EditUser';

const Stack = createNativeStackNavigator<UsersStackParamList>();

const UsersStack = () => {
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
                name="UserList"
                component={UserListScreen}
                options={{ title: 'Users' }}
            />
            <Stack.Screen
                name="UserDetail"
                component={UserDetailScreen}
                options={{ title: 'User Details' }}
            />
            <Stack.Screen
                name="AddUser"
                component={AddUserScreen}
                options={{ title: 'Add User' }}
            />
            <Stack.Screen
                name="EditUser"
                component={EditUserScreen}
                options={{ title: 'Edit User' }}
            />
        </Stack.Navigator>
    );
};

export default UsersStack;