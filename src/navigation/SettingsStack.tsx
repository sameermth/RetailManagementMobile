import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from './types';
import { colors } from '@theme/colors';

// Import screens
import SettingsScreen from '@screens/settings/Settings';
import ProfileScreen from '@screens/settings/Profile';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack = () => {
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
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile' }}
            />
        </Stack.Navigator>
    );
};

export default SettingsStack;