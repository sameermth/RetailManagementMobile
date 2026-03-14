import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Import screens (we'll create these next)
import LoginScreen from '@screens/auth/Login';
import RegisterScreen from '@screens/auth/Register';
import ForgotPasswordScreen from '@screens/auth/ForgotPassword';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
        headerShown: false,
            animation: 'slide_from_right',
    }}
>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
);
};

export default AuthNavigator;