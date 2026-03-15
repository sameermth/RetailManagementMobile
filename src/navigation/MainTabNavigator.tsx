import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '../../components/Icon';
import { MainTabParamList } from './types';

// Import navigators
import DashboardStack from './DashboardStack';
import POSStack from './POSStack';
import ProductsStack from './ProductsStack';
import CustomersStack from './CustomersStack';
import MoreStack from './MoreStack';

import { colors } from '@theme/color';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.gray[400],
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingBottom: 4,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    marginBottom: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="POS"
                component={POSStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="cash-register" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Products"
                component={ProductsStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="package" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Customers"
                component={CustomersStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="More"
                component={MoreStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="dots-horizontal" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;