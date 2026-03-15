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
import Slider from '@react-native-community/slider';

interface PrintSettings {
    printerModel: string;
    printerIP: string;
    printerPort: string;
    paperWidth: number; // in mm
    fontSize: number;
    copies: number;
    autoPrint: boolean;
    showLogo: boolean;
    showHeader: boolean;
    showFooter: boolean;
    headerText: string;
    footerText: string;
    charactersPerLine: number;
}

const PrintSettingsScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [settings, setSettings] = useState<PrintSettings>({
        printerModel: 'EPSON TM-T20',
        printerIP: '192.168.1.100',
        printerPort: '9100',
        paperWidth: 80,
        fontSize: 12,
        copies: 1,
        autoPrint: true,
        showLogo: true,
        showHeader: true,
        showFooter: true,
        headerText: 'RETAIL MANAGEMENT',
        footerText: 'Thank you for shopping with us!',
        charactersPerLine: 42,
    });

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to load print settings');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // API call to save
            Alert.alert('Success', 'Print settings saved successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to save print settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTestPrint = async () => {
        setTesting(true);
        try {
            // API call to test print
            await new Promise(resolve => setTimeout(resolve, 2000));
            Alert.alert('Success', 'Test print sent to printer');
        } catch (error) {
            Alert.alert('Error', 'Failed to send test print');
        } finally {
            setTesting(false);
        }
    };

    const handleDiscoverPrinters = () => {
        Alert.alert('Info', 'Searching for printers on network...');
        // Implement printer discovery logic
    };

    const updateSetting = <K extends keyof PrintSettings>(
        key: K,
        value: PrintSettings[K]
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
            {/* Printer Configuration */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Printer Configuration</Text>

                <View style={styles.inputWrapper}>
                    <Text style={styles.label}>Printer Model</Text>
                    <TextInput
                        style={styles.input}
                        value={settings.printerModel}
                        onChangeText={(value) => updateSetting('printerModel', value)}
                        placeholder="e.g., EPSON TM-T20"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputWrapper, { flex: 2, marginRight: 8 }]}>
                        <Text style={styles.label}>IP Address</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.printerIP}
                            onChangeText={(value) => updateSetting('printerIP', value)}
                            placeholder="192.168.1.100"
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Port</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.printerPort}
                            onChangeText={(value) => updateSetting('printerPort', value)}
                            placeholder="9100"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.discoverButton}
                    onPress={handleDiscoverPrinters}
                >
                    <Icon name="wifi" size={20} color={colors.primary[500]} />
                    <Text style={styles.discoverButtonText}>Discover Printers on Network</Text>
                </TouchableOpacity>
            </View>

            {/* Paper Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Paper Settings</Text>

                <View style={styles.sliderContainer}>
                    <Text style={styles.label}>Paper Width: {settings.paperWidth} mm</Text>
                    <Slider
                        value={settings.paperWidth}
                        onValueChange={(value) => updateSetting('paperWidth', value)}
                        minimumValue={58}
                        maximumValue={112}
                        step={1}
                        minimumTrackTintColor={colors.primary[500]}
                        maximumTrackTintColor={colors.gray[300]}
                    />
                    <View style={styles.sliderLabels}>
                        <Text style={styles.sliderMinLabel}>58mm</Text>
                        <Text style={styles.sliderMaxLabel}>112mm</Text>
                    </View>
                </View>

                <View style={styles.sliderContainer}>
                    <Text style={styles.label}>Characters per line: {settings.charactersPerLine}</Text>
                    <Slider
                        value={settings.charactersPerLine}
                        onValueChange={(value) => updateSetting('charactersPerLine', value)}
                        minimumValue={32}
                        maximumValue={64}
                        step={1}
                        minimumTrackTintColor={colors.primary[500]}
                        maximumTrackTintColor={colors.gray[300]}
                    />
                </View>
            </View>

            {/* Print Quality */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Print Quality</Text>

                <View style={styles.sliderContainer}>
                    <Text style={styles.label}>Font Size: {settings.fontSize} pt</Text>
                    <Slider
                        value={settings.fontSize}
                        onValueChange={(value) => updateSetting('fontSize', value)}
                        minimumValue={8}
                        maximumValue={24}
                        step={1}
                        minimumTrackTintColor={colors.primary[500]}
                        maximumTrackTintColor={colors.gray[300]}
                    />
                </View>

                <View style={styles.sliderContainer}>
                    <Text style={styles.label}>Number of Copies: {settings.copies}</Text>
                    <Slider
                        value={settings.copies}
                        onValueChange={(value) => updateSetting('copies', value)}
                        minimumValue={1}
                        maximumValue={5}
                        step={1}
                        minimumTrackTintColor={colors.primary[500]}
                        maximumTrackTintColor={colors.gray[300]}
                    />
                </View>

                <SettingToggle
                    label="Auto Print"
                    description="Automatically print after payment"
                    value={settings.autoPrint}
                    onToggle={() => updateSetting('autoPrint', !settings.autoPrint)}
                />
            </View>

            {/* Receipt Content */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Receipt Content</Text>

                <SettingToggle
                    label="Show Store Logo"
                    value={settings.showLogo}
                    onToggle={() => updateSetting('showLogo', !settings.showLogo)}
                />

                <SettingToggle
                    label="Show Header"
                    value={settings.showHeader}
                    onToggle={() => updateSetting('showHeader', !settings.showHeader)}
                />

                <SettingToggle
                    label="Show Footer"
                    value={settings.showFooter}
                    onToggle={() => updateSetting('showFooter', !settings.showFooter)}
                />

                {settings.showHeader && (
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Header Text</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.headerText}
                            onChangeText={(value) => updateSetting('headerText', value)}
                            placeholder="Enter header text"
                        />
                    </View>
                )}

                {settings.showFooter && (
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Footer Text</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            value={settings.footerText}
                            onChangeText={(value) => updateSetting('footerText', value)}
                            placeholder="Enter footer text"
                            multiline
                            numberOfLines={2}
                        />
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.testButton, testing && styles.buttonDisabled]}
                    onPress={handleTestPrint}
                    disabled={testing || loading}
                >
                    {testing ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <>
                            <Icon name="printer" size={20} color={colors.background} />
                            <Text style={styles.buttonText}>Test Print</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <>
                            <Icon name="content-save" size={20} color={colors.background} />
                            <Text style={styles.buttonText}>Save Settings</Text>
                        </>
                    )}
                </TouchableOpacity>
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
        minHeight: 60,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    discoverButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[50],
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    discoverButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 8,
    },
    sliderContainer: {
        marginBottom: 16,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    sliderMinLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    sliderMaxLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    buttonContainer: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    testButton: {
        backgroundColor: colors.info,
    },
    saveButton: {
        backgroundColor: colors.primary[500],
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
        marginLeft: 8,
    },
});

export default PrintSettingsScreen;