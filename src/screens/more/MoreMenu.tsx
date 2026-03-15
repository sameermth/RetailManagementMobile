import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';

const MoreMenuScreen = () => {
    const navigation = useNavigation();

    const menuSections = [
        {
            title: 'Business Operations',
            items: [
                {
                    id: 'suppliers',
                    name: 'Suppliers',
                    icon: 'truck',
                    color: colors.info,
                    screen: 'Suppliers'
                },
                {
                    id: 'purchases',
                    name: 'Purchase Orders',
                    icon: 'clipboard-text',
                    color: colors.warning,
                    screen: 'Purchases'
                },
                {
                    id: 'distributors',
                    name: 'Distributors',
                    icon: 'truck-delivery',
                    color: colors.secondary,
                    screen: 'Distributors'
                },
                {
                    id: 'expenses',
                    name: 'Expenses',
                    icon: 'cash-minus',
                    color: colors.error,
                    screen: 'Expenses'
                },
            ],
        },
        {
            title: 'Reports & Analytics',
            items: [
                {
                    id: 'reports',
                    name: 'Reports',
                    icon: 'chart-bar',
                    color: colors.success,
                    screen: 'Reports'
                },
                {
                    id: 'inventory-report',
                    name: 'Inventory Report',
                    icon: 'package-variant',
                    color: colors.info,
                    screen: 'Reports',
                    params: { screen: 'InventoryReport' }
                },
                {
                    id: 'sales-report',
                    name: 'Sales Report',
                    icon: 'chart-line',
                    color: colors.warning,
                    screen: 'Reports',
                    params: { screen: 'SalesReport' }
                },
                {
                    id: 'financial-report',
                    name: 'Financial Report',
                    icon: 'finance',
                    color: colors.secondary,
                    screen: 'Reports',
                    params: { screen: 'FinancialReport' }
                },
            ],
        },
        {
            title: 'System',
            items: [
                {
                    id: 'settings',
                    name: 'Settings',
                    icon: 'cog',
                    color: colors.gray[600],
                    screen: 'Settings'
                },
                {
                    id: 'help',
                    name: 'Help & Support',
                    icon: 'help-circle',
                    color: colors.gray[600],
                    screen: 'Help'
                },
                {
                    id: 'about',
                    name: 'About',
                    icon: 'information',
                    color: colors.gray[600],
                    screen: 'About'
                },
                {
                    id: 'users',
                    name: 'User Management',
                    icon: 'account-group',
                    color: colors.primary[500],
                    screen: 'Users'
                },
                {
                    id: 'roles',
                    name: 'Roles & Permissions',
                    icon: 'shield-account',
                    color: colors.info,
                    screen: 'Roles'
                },
            ],
        },
    ];

    const renderMenuItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
                if (item.params) {
                    navigation.navigate(item.screen, item.params);
                } else {
                    navigation.navigate(item.screen);
                }
            }}
        >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.menuName}>{item.name}</Text>
            <Icon name="chevron-right" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {menuSections.map((section, index) => (
                <View key={index} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <View style={styles.sectionContent}>
                        {section.items.map(renderMenuItem)}
                    </View>
                </View>
            ))}

            <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
                <Text style={styles.copyrightText}>© 2026 Retail Management</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.secondary,
        marginLeft: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    sectionContent: {
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuName: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    versionContainer: {
        alignItems: 'center',
        padding: 24,
    },
    versionText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
});

export default MoreMenuScreen;