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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

interface InvoiceSettings {
    prefix: string;
    nextNumber: number;
    format: string;
    termsAndConditions: string;
    bankDetails: string;
    signature: string;
    showDiscount: boolean;
    showTax: boolean;
    showShipping: boolean;
    showLogo: boolean;
    showStoreInfo: boolean;
    showCustomerInfo: boolean;
    footerText: string;
}

const InvoiceSettingsScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<InvoiceSettings>({
        prefix: 'INV',
        nextNumber: 1001,
        format: 'INV-{year}-{number}',
        termsAndConditions: '1. Goods once sold cannot be returned.\n2. Payment is due within 30 days.\n3. Interest will be charged on overdue payments.',
        bankDetails: 'Bank: HDFC Bank\nAccount: 1234567890\nIFSC: HDFC0001234',
        signature: 'Authorized Signatory',
        showDiscount: true,
        showTax: true,
        showShipping: true,
        showLogo: true,
        showStoreInfo: true,
        showCustomerInfo: true,
        footerText: 'Thank you for your business!',
    });

    const [previewInvoice, setPreviewInvoice] = useState('');

    useEffect(() => {
        generatePreview();
    }, [settings]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual
            setTimeout(() => {
                // Settings loaded
                generatePreview();
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to load invoice settings');
            setLoading(false);
        }
    };

    const generatePreview = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        let preview = settings.format
            .replace('{year}', year.toString())
            .replace('{month}', month)
            .replace('{day}', day)
            .replace('{number}', settings.nextNumber.toString());

        setPreviewInvoice(preview);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // API call to save
            Alert.alert('Success', 'Invoice settings saved successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to save invoice settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = <K extends keyof InvoiceSettings>(
        key: K,
        value: InvoiceSettings[K]
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

    return (
        <ScrollView style={styles.container}>
            {/* Invoice Number Format */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invoice Number Format</Text>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Prefix</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.prefix}
                        onChangeText={(value) => updateSetting('prefix', value)}
                        placeholder="e.g., INV"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Next Invoice Number</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.nextNumber.toString()}
                        onChangeText={(value) => updateSetting('nextNumber', parseInt(value) || 1)}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Format Pattern</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.format}
                        onChangeText={(value) => updateSetting('format', value)}
                        placeholder="INV-{year}-{number}"
                    />
                    <Text style={styles.hintText}>
                        Available placeholders: {'{year}'}, {'{month}'}, {'{day}'}, {'{number}'}
                    </Text>
                </View>

                <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Preview:</Text>
                    <Text style={styles.previewText}>{previewInvoice}</Text>
                </View>
            </View>

            {/* Display Options */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Display Options</Text>

                <SettingToggle
                    label="Show Logo"
                    description="Display store logo on invoice"
                    value={settings.showLogo}
                    onToggle={() => updateSetting('showLogo', !settings.showLogo)}
                />

                <SettingToggle
                    label="Show Store Information"
                    description="Display store name, address, contact"
                    value={settings.showStoreInfo}
                    onToggle={() => updateSetting('showStoreInfo', !settings.showStoreInfo)}
                />

                <SettingToggle
                    label="Show Customer Information"
                    description="Display customer details"
                    value={settings.showCustomerInfo}
                    onToggle={() => updateSetting('showCustomerInfo', !settings.showCustomerInfo)}
                />

                <SettingToggle
                    label="Show Discount"
                    description="Display discount amount"
                    value={settings.showDiscount}
                    onToggle={() => updateSetting('showDiscount', !settings.showDiscount)}
                />

                <SettingToggle
                    label="Show Tax"
                    description="Display tax breakdown"
                    value={settings.showTax}
                    onToggle={() => updateSetting('showTax', !settings.showTax)}
                />

                <SettingToggle
                    label="Show Shipping"
                    description="Display shipping charges"
                    value={settings.showShipping}
                    onToggle={() => updateSetting('showShipping', !settings.showShipping)}
                />
            </View>

            {/* Terms and Conditions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Terms & Conditions</Text>

                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={settings.termsAndConditions}
                    onChangeText={(value) => updateSetting('termsAndConditions', value)}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    placeholder="Enter terms and conditions..."
                />
            </View>

            {/* Bank Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bank Details</Text>

                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={settings.bankDetails}
                    onChangeText={(value) => updateSetting('bankDetails', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholder="Enter bank details for invoice..."
                />
            </View>

            {/* Signature */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Signature</Text>

                <TextInput
                    style={styles.input}
                    value={settings.signature}
                    onChangeText={(value) => updateSetting('signature', value)}
                    placeholder="Authorized Signatory"
                />
            </View>

            {/* Footer Text */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Footer Text</Text>

                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={settings.footerText}
                    onChangeText={(value) => updateSetting('footerText', value)}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    placeholder="Thank you for your business!"
                />
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
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 6,
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
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    hintText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 4,
    },
    previewContainer: {
        backgroundColor: colors.gray[100],
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    previewLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    previewText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.monospace,
        color: colors.primary[500],
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

export default InvoiceSettingsScreen;