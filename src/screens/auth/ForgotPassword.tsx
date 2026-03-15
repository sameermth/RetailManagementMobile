import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { validateEmail } from '@utils/validators';
import apiClient from '../../api/client';

type ResetStep = 'request' | 'verify' | 'reset';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState<ResetStep>('request');
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI states
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resendTimer, setResendTimer] = useState(0);
    const [resetToken, setResetToken] = useState('');

    // Timer for resend OTP
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Step 1: Request Password Reset
    const handleRequestReset = async () => {
        // Validate email
        if (!email) {
            setErrors({ email: 'Email is required' });
            return;
        }
        if (!validateEmail(email)) {
            setErrors({ email: 'Invalid email format' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Call your API to request password reset
            const response = await apiClient.post('/auth/forgot-password', { email });

            // If successful, move to OTP verification step
            setCurrentStep('verify');
            setResendTimer(60); // Start 60 second timer for resend
            Alert.alert(
                'OTP Sent',
                'A verification code has been sent to your email address.'
            );
        } catch (error: any) {
            Alert.alert(
                'Request Failed',
                error.response?.data?.message || 'Could not process your request. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await apiClient.post('/auth/verify-otp', {
                email,
                otp
            });

            // Store the reset token from response
            setResetToken(response.data.resetToken);
            setCurrentStep('reset');
        } catch (error: any) {
            Alert.alert(
                'Verification Failed',
                error.response?.data?.message || 'Invalid OTP. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setIsLoading(true);
        try {
            await apiClient.post('/auth/resend-otp', { email });
            setResendTimer(60);
            Alert.alert('Success', 'A new OTP has been sent to your email.');
        } catch (error: any) {
            Alert.alert(
                'Failed',
                error.response?.data?.message || 'Could not resend OTP. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async () => {
        // Validate passwords
        const newErrors: Record<string, string> = {};

        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await apiClient.post('/auth/reset-password', {
                email,
                token: resetToken,
                newPassword
            });

            Alert.alert(
                'Success',
                'Your password has been reset successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login' as never)
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Reset Failed',
                error.response?.data?.message || 'Could not reset password. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Render different steps
    const renderStep = () => {
        switch (currentStep) {
            case 'request':
                return (
                    <>
                        <View style={styles.iconContainer}>
                            <Icon name="lock-reset" size={60} color={colors.primary[500]} />
                        </View>

                        <Text style={styles.stepTitle}>Forgot Password?</Text>
                        <Text style={styles.stepDescription}>
                            Enter your email address and we'll send you a verification code to reset your password.
                        </Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                                <Icon name="email" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.gray[400]}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({});
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
                            onPress={handleRequestReset}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={styles.actionButtonText}>Send Reset Code</Text>
                            )}
                        </TouchableOpacity>
                    </>
                );

            case 'verify':
                return (
                    <>
                        <View style={styles.iconContainer}>
                            <Icon name="shield-check" size={60} color={colors.primary[500]} />
                        </View>

                        <Text style={styles.stepTitle}>Verify OTP</Text>
                        <Text style={styles.stepDescription}>
                            Enter the 6-digit verification code sent to {'\n'}
                            <Text style={styles.emailText}>{email}</Text>
                        </Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Verification Code</Text>
                            <View style={[styles.inputContainer, errors.otp && styles.inputError]}>
                                <Icon name="form-textbox-password" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter 6-digit OTP"
                                    placeholderTextColor={colors.gray[400]}
                                    value={otp}
                                    onChangeText={(text) => {
                                        setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                                        if (errors.otp) setErrors({});
                                    }}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    editable={!isLoading}
                                />
                            </View>
                            {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
                            onPress={handleVerifyOTP}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={styles.actionButtonText}>Verify OTP</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <TouchableOpacity
                                onPress={handleResendOTP}
                                disabled={resendTimer > 0 || isLoading}
                            >
                                <Text style={[
                                    styles.resendLink,
                                    (resendTimer > 0 || isLoading) && styles.resendLinkDisabled
                                ]}>
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                );

            case 'reset':
                return (
                    <>
                        <View style={styles.iconContainer}>
                            <Icon name="lock-reset" size={60} color={colors.primary[500]} />
                        </View>

                        <Text style={styles.stepTitle}>Reset Password</Text>
                        <Text style={styles.stepDescription}>
                            Create a new password for your account
                        </Text>

                        {/* New Password */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                                <Icon name="lock" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter new password"
                                    placeholderTextColor={colors.gray[400]}
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        if (errors.newPassword) setErrors({});
                                    }}
                                    secureTextEntry={!showNewPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showNewPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.gray[400]}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                                <Icon name="lock-check" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={colors.gray[400]}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errors.confirmPassword) setErrors({});
                                    }}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color={colors.gray[400]}
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        {/* Password Requirements */}
                        <View style={styles.requirementsContainer}>
                            <Text style={styles.requirementsTitle}>Password must:</Text>
                            <View style={styles.requirementItem}>
                                <Icon
                                    name={newPassword.length >= 6 ? 'check-circle' : 'circle-outline'}
                                    size={16}
                                    color={newPassword.length >= 6 ? colors.success : colors.gray[400]}
                                />
                                <Text style={styles.requirementText}>Be at least 6 characters</Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <Icon
                                    name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                                    size={16}
                                    color={/[A-Z]/.test(newPassword) ? colors.success : colors.gray[400]}
                                />
                                <Text style={styles.requirementText}>Contain at least one uppercase letter</Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <Icon
                                    name={/[0-9]/.test(newPassword) ? 'check-circle' : 'circle-outline'}
                                    size={16}
                                    color={/[0-9]/.test(newPassword) ? colors.success : colors.gray[400]}
                                />
                                <Text style={styles.requirementText}>Contain at least one number</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={colors.background} />
                            ) : (
                                <Text style={styles.actionButtonText}>Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </>
                );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => {
                        if (currentStep === 'request') {
                            navigation.goBack();
                        } else {
                            setCurrentStep('request');
                            setOtp('');
                            setErrors({});
                        }
                    }}
                    style={styles.backButton}
                >
                    <Icon name="arrow-left" size={24} color={colors.text.primary} />
                </TouchableOpacity>

                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, currentStep === 'request' && styles.stepDotActive]} />
                    <View style={[styles.stepLine, currentStep !== 'request' && styles.stepLineActive]} />
                    <View style={[styles.stepDot, currentStep === 'verify' && styles.stepDotActive]} />
                    <View style={[styles.stepLine, currentStep === 'reset' && styles.stepLineActive]} />
                    <View style={[styles.stepDot, currentStep === 'reset' && styles.stepDotActive]} />
                </View>

                {/* Current Step Content */}
                {renderStep()}

                {/* Back to Login Link (only on first step) */}
                {currentStep === 'request' && (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember your password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                            <Text style={styles.loginText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    backButton: {
        marginBottom: 24,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.gray[300],
    },
    stepDotActive: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary[500],
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.gray[300],
        marginHorizontal: 4,
    },
    stepLineActive: {
        backgroundColor: colors.primary[500],
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    emailText: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
    },
    inputError: {
        borderColor: colors.error,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
    actionButton: {
        height: 52,
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    actionButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    resendText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    resendLink: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
    resendLinkDisabled: {
        color: colors.gray[400],
    },
    requirementsContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    requirementsTitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 8,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    requirementText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    loginText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary[500],
    },
});

export default ForgotPasswordScreen;