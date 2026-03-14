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
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import QRCode from 'react-native-qrcode-svg';

const TwoFactorAuthScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [setupMode, setSetupMode] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [qrCodeData, setQrCodeData] = useState('');

    // Mock data - replace with actual API data
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQRData = 'otpauth://totp/RetailManagement:admin@example.com?secret=JBSWY3DPEHPK3PXP&issuer=RetailManagement';

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual
            setTimeout(() => {
                setEnabled(false);
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to check 2FA status');
            setLoading(false);
        }
    };

    const handleEnable = () => {
        setSetupMode(true);
        // Generate secret and QR code
        setQrCodeData(mockQRData);
        // Generate backup codes
        setBackupCodes([
            'ABCD-EFGH-IJKL-MNOP',
            'QRST-UVWX-YZAB-CDEF',
            'GHIJ-KLMN-OPQR-STUV',
            'WXYZ-ABCD-EFGH-IJKL',
            'MNOP-QRST-UVWX-YZAB',
        ]);
    };

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            // Mock API call - replace with actual
            await new Promise(resolve => setTimeout(resolve, 1500));
            setEnabled(true);
            setSetupMode(false);
            Alert.alert('Success', 'Two-factor authentication enabled');
        } catch (error) {
            Alert.alert('Error', 'Failed to verify code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = () => {
        Alert.alert(
            'Disable Two-Factor Authentication',
            'This will make your account less secure. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disable',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Mock API call - replace with actual
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            setEnabled(false);
                            Alert.alert('Success', 'Two-factor authentication disabled');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to disable 2FA');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleRegenerateCodes = () => {
        Alert.alert(
            'Regenerate Backup Codes',
            'This will invalidate your existing backup codes. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Regenerate',
                    onPress: () => {
                        // Generate new backup codes
                        setBackupCodes([
                            'NEW1-ABCD-EFGH-IJKL',
                            'NEW2-MNOP-QRST-UVWX',
                            'NEW3-YZAB-CDEF-GHIJ',
                            'NEW4-KLMN-OPQR-STUV',
                            'NEW5-WXYZ-ABCD-EFGH',
                        ]);
                        Alert.alert('Success', 'New backup codes generated');
                    },
                },
            ]
        );
    };

    const copyToClipboard = (text: string) => {
        // Implement copy to clipboard
        Alert.alert('Copied', 'Code copied to clipboard');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    if (setupMode) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.setupContainer}>
                    <Icon name="shield-account" size={60} color={colors.primary[500]} />
                    <Text style={styles.setupTitle}>Set Up Two-Factor Authentication</Text>
                    <Text style={styles.setupSubtitle}>
                        Scan the QR code below with your authenticator app (Google Authenticator, Microsoft Authenticator, etc.)
                    </Text>

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={mockQRData}
                            size={200}
                            color={colors.text.primary}
                            backgroundColor={colors.background}
                        />
                    </View>

                    {/* Manual Setup Key */}
                    <View style={styles.manualContainer}>
                        <Text style={styles.manualLabel}>Can't scan the QR code?</Text>
                        <TouchableOpacity
                            style={styles.secretContainer}
                            onPress={() => copyToClipboard(mockSecret)}
                        >
                            <Text style={styles.secretText}>{mockSecret}</Text>
                            <Icon name="content-copy" size={20} color={colors.primary[500]} />
                        </TouchableOpacity>
                        <Text style={styles.manualHint}>
                            Tap to copy and enter manually in your authenticator app
                        </Text>
                    </View>

                    {/* Verification */}
                    <View style={styles.verificationContainer}>
                        <Text style={styles.verificationLabel}>Enter verification code</Text>
                        <TextInput
                            style={styles.verificationInput}
                            placeholder="6-digit code"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="numeric"
                            maxLength={6}
                        />
                    </View>

                    {/* Backup Codes */}
                    <View style={styles.backupContainer}>
                        <Text style={styles.backupTitle}>Backup Codes</Text>
                        <Text style={styles.backupSubtitle}>
                            Save these codes in a secure place. You can use them to access your account if you lose your phone.
                        </Text>

                        {backupCodes.map((code, index) => (
                            <View key={index} style={styles.backupCodeRow}>
                                <Text style={styles.backupCode}>{code}</Text>
                                <TouchableOpacity onPress={() => copyToClipboard(code)}>
                                    <Icon name="content-copy" size={16} color={colors.gray[400]} />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.regenerateButton}
                            onPress={handleRegenerateCodes}
                        >
                            <Text style={styles.regenerateButtonText}>Regenerate Codes</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setSetupMode(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.verifyButton, loading && styles.buttonDisabled]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={styles.verifyButtonText}>Verify & Enable</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Status Card */}
            <View style={styles.statusCard}>
                <View style={styles.statusIcon}>
                    <Icon
                        name={enabled ? 'shield-check' : 'shield-off'}
                        size={40}
                        color={enabled ? colors.success : colors.error}
                    />
                </View>
                <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>
                        Two-Factor Authentication
                    </Text>
                    <Text style={styles.statusDescription}>
                        {enabled
                            ? 'Your account is protected with 2FA'
                            : 'Add an extra layer of security to your account'}
                    </Text>
                </View>
                <Switch
                    value={enabled}
                    onValueChange={enabled ? handleDisable : handleEnable}
                    trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                />
            </View>

            {enabled && (
                <>
                    {/* Backup Codes Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Backup Codes</Text>
                        <Text style={styles.sectionDescription}>
                            Use these codes to access your account if you lose your phone. Each code can only be used once.
                        </Text>

                        <View style={styles.codesGrid}>
                            {backupCodes.map((code, index) => (
                                <View key={index} style={styles.codeItem}>
                                    <Text style={styles.codeText}>{code}</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard(code)}>
                                        <Icon name="content-copy" size={16} color={colors.gray[400]} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.regenerateButton}
                            onPress={handleRegenerateCodes}
                        >
                            <Text style={styles.regenerateButtonText}>Generate New Codes</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Trusted Devices */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Trusted Devices</Text>

                        <View style={styles.deviceItem}>
                            <View style={styles.deviceInfo}>
                                <Icon name="cellphone" size={20} color={colors.primary[500]} />
                                <View style={styles.deviceDetails}>
                                    <Text style={styles.deviceName}>iPhone 14 Pro</Text>
                                    <Text style={styles.deviceMeta}>Last used: Today • Mumbai, India</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <Icon name="dots-vertical" size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.deviceItem}>
                            <View style={styles.deviceInfo}>
                                <Icon name="laptop" size={20} color={colors.primary[500]} />
                                <View style={styles.deviceDetails}>
                                    <Text style={styles.deviceName}>MacBook Pro</Text>
                                    <Text style={styles.deviceMeta}>Last used: 2 days ago • Mumbai, India</Text>
                                </View>
                            </View>
                            <TouchableOpacity>
                                <Icon name="dots-vertical" size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Recovery Options */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recovery Options</Text>

                        <TouchableOpacity style={styles.recoveryOption}>
                            <View style={styles.recoveryInfo}>
                                <Icon name="email" size={20} color={colors.primary[500]} />
                                <Text style={styles.recoveryText}>Email Recovery</Text>
                            </View>
                            <Text style={styles.recoveryStatus}>admin@example.com</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.recoveryOption}>
                            <View style={styles.recoveryInfo}>
                                <Icon name="phone" size={20} color={colors.primary[500]} />
                                <Text style={styles.recoveryText}>SMS Recovery</Text>
                            </View>
                            <Text style={styles.recoveryStatus}>+91 98765 43210</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Info Note */}
            <View style={styles.infoNote}>
                <Icon name="information" size={20} color={colors.info} />
                <Text style={styles.infoText}>
                    Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusCard: {
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
    statusIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusInfo: {
        flex: 1,
        marginRight: 12,
    },
    statusTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    statusDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    section: {
        backgroundColor: colors.background,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 16,
    },
    codesGrid: {
        marginBottom: 16,
    },
    codeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    codeText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.monospace,
        color: colors.text.primary,
    },
    regenerateButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    regenerateButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deviceDetails: {
        marginLeft: 12,
    },
    deviceName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    deviceMeta: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    recoveryOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    recoveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recoveryText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        marginLeft: 12,
    },
    recoveryStatus: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    infoNote: {
        flexDirection: 'row',
        backgroundColor: colors.info + '10',
        margin: 16,
        padding: 12,
        borderRadius: 8,
        marginBottom: 32,
    },
    infoText: {
        flex: 1,
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.info,
        marginLeft: 8,
    },
    setupContainer: {
        padding: 16,
    },
    setupTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    setupSubtitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    manualContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    manualLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    secretContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[100],
        padding: 12,
        borderRadius: 8,
    },
    secretText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.monospace,
        color: colors.text.primary,
        marginRight: 8,
    },
    manualHint: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 4,
    },
    verificationContainer: {
        marginBottom: 24,
    },
    verificationLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 8,
    },
    verificationInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.monospace,
        color: colors.text.primary,
        textAlign: 'center',
        letterSpacing: 8,
    },
    backupContainer: {
        backgroundColor: colors.warning + '10',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    backupTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.warning,
        marginBottom: 4,
    },
    backupSubtitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 12,
    },
    backupCodeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 6,
        marginBottom: 6,
    },
    backupCode: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.monospace,
        color: colors.text.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: colors.gray[200],
    },
    cancelButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    verifyButton: {
        backgroundColor: colors.success,
    },
    verifyButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

export default TwoFactorAuthScreen;