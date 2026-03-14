import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { storage } from '@utils/storage';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [emailReports, setEmailReports] = useState(false);
    const [biometric, setBiometric] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will clear all cached data. You will need to download reports again.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await storage.clear();
                        Alert.alert('Success', 'Cache cleared successfully');
                    },
                },
            ]
        );
    };

    const SettingItem = ({ icon, title, description, rightElement }: any) => (
        <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
                <Icon name={icon} size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {description && <Text style={styles.settingDescription}>{description}</Text>}
            </View>
            <View style={styles.settingRight}>{rightElement}</View>
        </View>
    );

    const SettingLink = ({ icon, title, description, onPress }: any) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingIcon}>
                <Icon name={icon} size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {description && <Text style={styles.settingDescription}>{description}</Text>}
            </View>
            <Icon name="chevron-right" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
    );

    const Section = ({ title, children }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* User Profile Summary */}
            <TouchableOpacity
                style={styles.profileCard}
                onPress={() => navigation.navigate('Profile')}
            >
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.roles?.[0]}</Text>
                    </View>
                </View>
                <Icon name="chevron-right" size={24} color={colors.gray[400]} />
            </TouchableOpacity>

            {/* Preferences */}
            <Section title="Preferences">
                <SettingItem
                    icon="theme-light-dark"
                    title="Dark Mode"
                    description="Switch to dark theme"
                    rightElement={
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                        />
                    }
                />
                <SettingItem
                    icon="bell"
                    title="Push Notifications"
                    description="Receive alerts on your device"
                    rightElement={
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                        />
                    }
                />
                <SettingItem
                    icon="email"
                    title="Email Reports"
                    description="Get reports via email"
                    rightElement={
                        <Switch
                            value={emailReports}
                            onValueChange={setEmailReports}
                            trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                        />
                    }
                />
                <SettingItem
                    icon="fingerprint"
                    title="Biometric Login"
                    description="Use fingerprint or face ID"
                    rightElement={
                        <Switch
                            value={biometric}
                            onValueChange={setBiometric}
                            trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                        />
                    }
                />
            </Section>

            {/* Account Settings */}
            <Section title="Account">
                <SettingLink
                    icon="account"
                    title="Profile Information"
                    description="Update your personal details"
                    onPress={() => navigation.navigate('Profile')}
                />
                <SettingLink
                    icon="lock"
                    title="Change Password"
                    description="Update your password"
                    onPress={() => Alert.alert('Coming Soon', 'Password change feature coming soon')}
                />
                <SettingLink
                    icon="bell-outline"
                    title="Notification Settings"
                    description="Configure notification preferences"
                    onPress={() => Alert.alert('Coming Soon', 'Notification settings coming soon')}
                />
                <SettingLink
                    icon="history"
                    title="Login History"
                    description="View your recent login activity"
                    onPress={() => Alert.alert('Coming Soon', 'Login history coming soon')}
                />
            </Section>

            {/* Business Settings */}
            <Section title="Business">
                <SettingLink
                    icon="store"
                    title="Store Information"
                    description="Update your business details"
                    onPress={() => Alert.alert('Coming Soon', 'Store settings coming soon')}
                />
                <SettingLink
                    icon="currency-usd"
                    title="Tax Settings"
                    description="Configure tax rates and rules"
                    onPress={() => Alert.alert('Coming Soon', 'Tax settings coming soon')}
                />
                <SettingLink
                    icon="printer"
                    title="Print Settings"
                    description="Configure receipt and invoice printing"
                    onPress={() => Alert.alert('Coming Soon', 'Print settings coming soon')}
                />
                <SettingLink
                    icon="qrcode"
                    title="Barcode Settings"
                    description="Configure barcode formats"
                    onPress={() => Alert.alert('Coming Soon', 'Barcode settings coming soon')}
                />
            </Section>

            {/* Data Management */}
            <Section title="Data">
                <SettingLink
                    icon="database"
                    title="Backup Data"
                    description="Create a backup of your data"
                    onPress={() => Alert.alert('Coming Soon', 'Backup feature coming soon')}
                />
                <SettingLink
                    icon="restore"
                    title="Restore Data"
                    description="Restore from a previous backup"
                    onPress={() => Alert.alert('Coming Soon', 'Restore feature coming soon')}
                />
                <SettingLink
                    icon="delete-sweep"
                    title="Clear Cache"
                    description="Free up storage space"
                    onPress={handleClearCache}
                />
                <SettingLink
                    icon="export"
                    title="Export Data"
                    description="Export your data to CSV/Excel"
                    onPress={() => Alert.alert('Coming Soon', 'Export feature coming soon')}
                />
            </Section>

            {/* Support */}
            <Section title="Support">
                <SettingLink
                    icon="help-circle"
                    title="Help Center"
                    description="Get help with using the app"
                    onPress={() => Alert.alert('Coming Soon', 'Help center coming soon')}
                />
                <SettingLink
                    icon="book-open"
                    title="User Guide"
                    description="Read the documentation"
                    onPress={() => Alert.alert('Coming Soon', 'User guide coming soon')}
                />
                <SettingLink
                    icon="message"
                    title="Contact Support"
                    description="Get in touch with our team"
                    onPress={() => Alert.alert('Coming Soon', 'Contact support coming soon')}
                />
                <SettingLink
                    icon="information"
                    title="About"
                    description="Version 1.0.0"
                    onPress={() => Alert.alert('About', 'Retail Management App v1.0.0\n© 2026 All rights reserved')}
                />
            </Section>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Icon name="logout" size={24} color={colors.error} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Version 1.0.0</Text>
                <Text style={styles.footerText}>© 2026 Retail Management</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    roleText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
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
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingIcon: {
        width: 40,
        alignItems: 'center',
    },
    settingContent: {
        flex: 1,
        marginLeft: 12,
    },
    settingTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    settingDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 2,
    },
    settingRight: {
        marginLeft: 12,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '10',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.error,
    },
    logoutText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.error,
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        padding: 20,
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
});

export default SettingsScreen;