import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { Picker } from '@react-native-picker/picker';

interface SystemSettings {
    language: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    firstDayOfWeek: 'monday' | 'sunday';
    enableLogging: boolean;
    debugMode: boolean;
    maintenanceMode: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
}

const SystemSettingsScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SystemSettings>({
        language: 'en',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        firstDayOfWeek: 'monday',
        enableLogging: true,
        debugMode: false,
        maintenanceMode: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to load system settings');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // API call to save
            Alert.alert('Success', 'System settings saved successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to save system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'This will clear all cached data. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    onPress: () => {
                        // Clear cache logic
                        Alert.alert('Success', 'Cache cleared successfully');
                    },
                },
            ]
        );
    };

    const handleResetApp = () => {
        Alert.alert(
            'Reset Application',
            'This will reset all settings to default. This action cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        // Reset logic
                        Alert.alert('Success', 'Application reset successfully');
                    },
                },
            ]
        );
    };

    const updateSetting = <K extends keyof SystemSettings>(
        key: K,
        value: SystemSettings[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const SettingToggle = ({
                               label,
                               value,
                               onToggle,
                               description
                           }: {
        label: string;
        value: boolean;
        onToggle: () => void;
        description?: string;
    }) => (
        <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{label}</Text>
                {description && <Text style={styles.toggleDescription}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
            />
        </View>
    );

    const PickerField = ({
                             label,
                             value,
                             onValueChange,
                             children
                         }: {
        label: string;
        value: string;
        onValueChange: (value: string) => void;
        children: React.ReactNode;
    }) => (
        <View style={styles.pickerContainer}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={value}
                    onValueChange={onValueChange}
                >
                    {children}
                </Picker>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Regional Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Regional Settings</Text>

                <PickerField label="Language" value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <Picker.Item label="English" value="en" />
                    <Picker.Item label="Hindi" value="hi" />
                    <Picker.Item label="Tamil" value="ta" />
                    <Picker.Item label="Telugu" value="te" />
                    <Picker.Item label="Kannada" value="kn" />
                    <Picker.Item label="Malayalam" value="ml" />
                </PickerField>

                <PickerField label="Currency" value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <Picker.Item label="Indian Rupee (₹)" value="INR" />
                    <Picker.Item label="US Dollar ($)" value="USD" />
                    <Picker.Item label="Euro (€)" value="EUR" />
                    <Picker.Item label="Pound Sterling (£)" value="GBP" />
                </PickerField>

                <PickerField label="Timezone" value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <Picker.Item label="Asia/Kolkata (IST)" value="Asia/Kolkata" />
                    <Picker.Item label="Asia/Dubai" value="Asia/Dubai" />
                    <Picker.Item label="Asia/Singapore" value="Asia/Singapore" />
                    <Picker.Item label="UTC" value="UTC" />
                </PickerField>

                <PickerField label="Date Format" value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                    <Picker.Item label="DD/MM/YYYY" value="DD/MM/YYYY" />
                    <Picker.Item label="MM/DD/YYYY" value="MM/DD/YYYY" />
                    <Picker.Item label="YYYY-MM-DD" value="YYYY-MM-DD" />
                </PickerField>

                <PickerField label="Time Format" value={settings.timeFormat} onValueChange={(value) => updateSetting('timeFormat', value)}>
                    <Picker.Item label="24 Hour" value="24h" />
                    <Picker.Item label="12 Hour (AM/PM)" value="12h" />
                </PickerField>

                <PickerField label="First Day of Week" value={settings.firstDayOfWeek} onValueChange={(value) => updateSetting('firstDayOfWeek', value as 'monday' | 'sunday')}>
                    <Picker.Item label="Monday" value="monday" />
                    <Picker.Item label="Sunday" value="sunday" />
                </PickerField>
            </View>

            {/* Security Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security Settings</Text>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Session Timeout (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.sessionTimeout.toString()}
                        onChangeText={(value) => updateSetting('sessionTimeout', parseInt(value) || 30)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Max Login Attempts</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.maxLoginAttempts.toString()}
                        onChangeText={(value) => updateSetting('maxLoginAttempts', parseInt(value) || 5)}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* System Behavior */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Behavior</Text>

                <SettingToggle
                    label="Enable Logging"
                    description="Log system events for debugging"
                    value={settings.enableLogging}
                    onToggle={() => updateSetting('enableLogging', !settings.enableLogging)}
                />

                <SettingToggle
                    label="Debug Mode"
                    description="Show detailed error messages"
                    value={settings.debugMode}
                    onToggle={() => updateSetting('debugMode', !settings.debugMode)}
                />

                <SettingToggle
                    label="Maintenance Mode"
                    description="Prevent user access during maintenance"
                    value={settings.maintenanceMode}
                    onToggle={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
                />
            </View>

            {/* Maintenance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Maintenance</Text>

                <TouchableOpacity
                    style={styles.maintenanceButton}
                    onPress={handleClearCache}
                >
                    <Icon name="delete-sweep" size={20} color={colors.warning} />
                    <Text style={styles.maintenanceButtonText}>Clear Cache</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.maintenanceButton, styles.resetButton]}
                    onPress={handleResetApp}
                >
                    <Icon name="restore" size={20} color={colors.error} />
                    <Text style={[styles.maintenanceButtonText, styles.resetButtonText]}>Reset Application</Text>
                </TouchableOpacity>
            </View>

            {/* System Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Information</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>App Version</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Build Number</Text>
                    <Text style={styles.infoValue}>2026.03.14</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>API Version</Text>
                    <Text style={styles.infoValue}>v1</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Environment</Text>
                    <Text style={styles.infoValue}>Production</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Device ID</Text>
                    <Text style={styles.infoValue}>XXXX-XXXX-XXXX-XXXX</Text>
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
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    toggleInfo: {
        flex: 1,
        marginRight: 12,
    },
    toggleLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    toggleDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    pickerContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 6,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    inputWrapper: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        backgroundColor: colors.surface,
    },
    maintenanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warning + '10',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    resetButton: {
        backgroundColor: colors.error + '10',
        borderColor: colors.error,
    },
    maintenanceButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
        marginLeft: 12,
    },
    resetButtonText: {
        color: colors.error,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    infoValue: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
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

export default SystemSettingsScreen;