import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

interface NotificationCategory {
    id: string;
    name: string;
    description: string;
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
}

interface NotificationPreference {
    id: string;
    category: string;
    enabled: boolean;
    channels: {
        email: boolean;
        push: boolean;
        sms: boolean;
        inApp: boolean;
    };
}

const NotificationPreferencesScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState<NotificationCategory[]>([
        {
            id: 'sales',
            name: 'Sales & Orders',
            description: 'New orders, order updates, payment confirmations',
            email: true,
            push: true,
            sms: false,
            inApp: true,
        },
        {
            id: 'inventory',
            name: 'Inventory Alerts',
            description: 'Low stock alerts, out of stock notifications',
            email: true,
            push: true,
            sms: true,
            inApp: true,
        },
        {
            id: 'customers',
            name: 'Customer Activity',
            description: 'New customer registration, customer updates',
            email: false,
            push: false,
            sms: false,
            inApp: true,
        },
        {
            id: 'dues',
            name: 'Due Payments',
            description: 'Payment due reminders, overdue alerts',
            email: true,
            push: true,
            sms: true,
            inApp: true,
        },
        {
            id: 'expenses',
            name: 'Expenses',
            description: 'Expense approvals, budget alerts',
            email: true,
            push: false,
            sms: false,
            inApp: true,
        },
        {
            id: 'system',
            name: 'System Updates',
            description: 'Maintenance notices, feature updates',
            email: true,
            push: true,
            sms: false,
            inApp: true,
        },
        {
            id: 'marketing',
            name: 'Marketing',
            description: 'Promotional offers, newsletters',
            email: false,
            push: false,
            sms: false,
            inApp: false,
        },
    ]);

    const [masterSwitch, setMasterSwitch] = useState(true);
    const [quietHours, setQuietHours] = useState(false);
    const [quietHoursStart, setQuietHoursStart] = useState('22:00');
    const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to load notification preferences');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // API call to save
            Alert.alert('Success', 'Notification preferences saved');
        } catch (error) {
            Alert.alert('Error', 'Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategoryChannel = (
        categoryId: string,
        channel: 'email' | 'push' | 'sms' | 'inApp'
    ) => {
        setPreferences(prev =>
            prev.map(cat =>
                cat.id === categoryId
                    ? { ...cat, [channel]: !cat[channel] }
                    : cat
            )
        );
    };

    const toggleCategory = (categoryId: string) => {
        setPreferences(prev =>
            prev.map(cat =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        email: !cat.email,
                        push: !cat.push,
                        sms: !cat.sms,
                        inApp: !cat.inApp,
                    }
                    : cat
            )
        );
    };

    const toggleAll = (channel: 'email' | 'push' | 'sms' | 'inApp') => {
        const allEnabled = preferences.every(cat => cat[channel]);
        setPreferences(prev =>
            prev.map(cat => ({ ...cat, [channel]: !allEnabled }))
        );
    };

    const ChannelHeader = ({
                               title,
                               icon,
                               channel
                           }: {
        title: string;
        icon: string;
        channel: 'email' | 'push' | 'sms' | 'inApp'
    }) => {
        const allEnabled = preferences.every(cat => cat[channel]);
        return (
            <View style={styles.channelHeader}>
                <View style={styles.channelTitle}>
                    <Icon name={icon} size={20} color={colors.primary[500]} />
                    <Text style={styles.channelTitleText}>{title}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleAll(channel)}>
                    <Text style={styles.toggleAllText}>
                        {allEnabled ? 'Disable All' : 'Enable All'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const CategoryRow = ({ category }: { category: NotificationCategory }) => (
        <View style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>

            <View style={styles.channelToggles}>
                <TouchableOpacity
                    style={styles.channelToggle}
                    onPress={() => toggleCategoryChannel(category.id, 'email')}
                >
                    <Icon
                        name={category.email ? 'email' : 'email-outline'}
                        size={24}
                        color={category.email ? colors.primary[500] : colors.gray[400]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.channelToggle}
                    onPress={() => toggleCategoryChannel(category.id, 'push')}
                >
                    <Icon
                        name={category.push ? 'cellphone' : 'cellphone'}
                        size={24}
                        color={category.push ? colors.primary[500] : colors.gray[400]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.channelToggle}
                    onPress={() => toggleCategoryChannel(category.id, 'sms')}
                >
                    <Icon
                        name={category.sms ? 'message' : 'message-outline'}
                        size={24}
                        color={category.sms ? colors.primary[500] : colors.gray[400]}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.channelToggle}
                    onPress={() => toggleCategoryChannel(category.id, 'inApp')}
                >
                    <Icon
                        name={category.inApp ? 'bell' : 'bell-outline'}
                        size={24}
                        color={category.inApp ? colors.primary[500] : colors.gray[400]}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Master Control */}
            <View style={styles.section}>
                <View style={styles.masterRow}>
                    <View style={styles.masterInfo}>
                        <Text style={styles.masterLabel}>Receive Notifications</Text>
                        <Text style={styles.masterDescription}>
                            Master switch for all notifications
                        </Text>
                    </View>
                    <Switch
                        value={masterSwitch}
                        onValueChange={setMasterSwitch}
                        trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                    />
                </View>
            </View>

            {/* Quiet Hours */}
            <View style={styles.section}>
                <View style={styles.quietHoursRow}>
                    <View style={styles.quietHoursInfo}>
                        <Text style={styles.quietHoursLabel}>Quiet Hours</Text>
                        <Text style={styles.quietHoursDescription}>
                            Mute notifications during specified hours
                        </Text>
                    </View>
                    <Switch
                        value={quietHours}
                        onValueChange={setQuietHours}
                        trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                    />
                </View>

                {quietHours && (
                    <View style={styles.quietHoursTime}>
                        <TouchableOpacity style={styles.timePicker}>
                            <Text style={styles.timeLabel}>From</Text>
                            <Text style={styles.timeValue}>{quietHoursStart}</Text>
                        </TouchableOpacity>

                        <Text style={styles.timeSeparator}>to</Text>

                        <TouchableOpacity style={styles.timePicker}>
                            <Text style={styles.timeLabel}>To</Text>
                            <Text style={styles.timeValue}>{quietHoursEnd}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Notification Channels */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notification Channels</Text>

                {/* Email Channel */}
                <ChannelHeader title="Email" icon="email" channel="email" />
                {preferences.map(cat => (
                    <CategoryRow key={cat.id} category={cat} />
                ))}

                {/* Push Notifications */}
                <View style={styles.channelSpacer} />
                <ChannelHeader title="Push Notifications" icon="cellphone" channel="push" />
                {preferences.map(cat => (
                    <CategoryRow key={cat.id} category={cat} />
                ))}

                {/* SMS */}
                <View style={styles.channelSpacer} />
                <ChannelHeader title="SMS" icon="message" channel="sms" />
                {preferences.map(cat => (
                    <CategoryRow key={cat.id} category={cat} />
                ))}

                {/* In-App */}
                <View style={styles.channelSpacer} />
                <ChannelHeader title="In-App" icon="bell" channel="inApp" />
                {preferences.map(cat => (
                    <CategoryRow key={cat.id} category={cat} />
                ))}
            </View>

            {/* Email Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Email Settings</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Digest Frequency</Text>
                    <TouchableOpacity style={styles.settingValue}>
                        <Text style={styles.settingValueText}>Daily</Text>
                        <Icon name="chevron-down" size={20} color={colors.gray[400]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Include attachments</Text>
                    <Switch
                        value={true}
                        onValueChange={() => {}}
                        trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                    />
                </View>
            </View>

            {/* Push Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Push Notification Settings</Text>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Sound</Text>
                    <TouchableOpacity style={styles.settingValue}>
                        <Text style={styles.settingValueText}>Default</Text>
                        <Icon name="chevron-down" size={20} color={colors.gray[400]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Vibrate</Text>
                    <Switch
                        value={true}
                        onValueChange={() => {}}
                        trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                    />
                </View>

                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Show preview</Text>
                    <Switch
                        value={true}
                        onValueChange={() => {}}
                        trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                    />
                </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.background} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Preferences</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    section: {
        backgroundColor: colors.background,
        padding: 16,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    masterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    masterInfo: {
        flex: 1,
        marginRight: 12,
    },
    masterLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    masterDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    quietHoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    quietHoursInfo: {
        flex: 1,
        marginRight: 12,
    },
    quietHoursLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    quietHoursDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    quietHoursTime: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    timePicker: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
    },
    timeLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 2,
    },
    timeValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    timeSeparator: {
        marginHorizontal: 12,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    channelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    channelTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    channelTitleText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 8,
    },
    toggleAllText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    channelSpacer: {
        height: 16,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    categoryInfo: {
        flex: 1,
        marginRight: 12,
    },
    categoryName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    categoryDescription: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    channelToggles: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    channelToggle: {
        padding: 6,
        marginLeft: 4,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    settingLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    settingValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValueText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginRight: 4,
    },
    saveButton: {
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        margin: 16,
        marginBottom: 32,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
});

export default NotificationPreferencesScreen;