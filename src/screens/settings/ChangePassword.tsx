import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const { changePassword, loading } = useAuth();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        } else if (!/[A-Z]/.test(formData.newPassword)) {
            newErrors.newPassword = 'Password must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(formData.newPassword)) {
            newErrors.newPassword = 'Password must contain at least one number';
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await changePassword({
                oldPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });

            Alert.alert(
                'Success',
                'Password changed successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to change password');
        }
    };

    const getPasswordStrength = () => {
        const password = formData.newPassword;
        if (!password) return { strength: 0, label: 'No password' };

        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 10) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 2) return { strength: 1, label: 'Weak', color: colors.error };
        if (score <= 3) return { strength: 2, label: 'Medium', color: colors.warning };
        if (score <= 4) return { strength: 3, label: 'Strong', color: colors.info };
        return { strength: 4, label: 'Very Strong', color: colors.success };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Icon name="lock-reset" size={60} color={colors.primary[500]} />
                    <Text style={styles.title}>Change Password</Text>
                    <Text style={styles.subtitle}>
                        Choose a strong password that you don't use elsewhere
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Current Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={[styles.inputContainer, errors.currentPassword && styles.inputError]}>
                            <Icon name="lock" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.currentPassword}
                                onChangeText={(value) => setFormData({...formData, currentPassword: value})}
                                secureTextEntry={!showCurrent}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                                <Icon name={showCurrent ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.currentPassword && (
                            <Text style={styles.errorText}>{errors.currentPassword}</Text>
                        )}
                    </View>

                    {/* New Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                            <Icon name="lock-plus" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.newPassword}
                                onChangeText={(value) => setFormData({...formData, newPassword: value})}
                                secureTextEntry={!showNew}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                                <Icon name={showNew ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.newPassword && (
                            <Text style={styles.errorText}>{errors.newPassword}</Text>
                        )}
                    </View>

                    {/* Password Strength Meter */}
                    {formData.newPassword.length > 0 && (
                        <View style={styles.strengthContainer}>
                            <View style={styles.strengthBarContainer}>
                                {[1, 2, 3, 4].map((level) => (
                                    <View
                                        key={level}
                                        style={[
                                            styles.strengthBar,
                                            {
                                                backgroundColor:
                                                    level <= passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : colors.gray[200],
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                            <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                                {passwordStrength.label}
                            </Text>
                        </View>
                    )}

                    {/* Confirm Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                            <Icon name="lock-check" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.confirmPassword}
                                onChangeText={(value) => setFormData({...formData, confirmPassword: value})}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                                <Icon name={showConfirm ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                    </View>

                    {/* Password Requirements */}
                    <View style={styles.requirementsContainer}>
                        <Text style={styles.requirementsTitle}>Password must contain:</Text>

                        <View style={styles.requirementRow}>
                            <Icon
                                name={formData.newPassword.length >= 6 ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={formData.newPassword.length >= 6 ? colors.success : colors.gray[400]}
                            />
                            <Text style={styles.requirementText}>At least 6 characters</Text>
                        </View>

                        <View style={styles.requirementRow}>
                            <Icon
                                name={/[A-Z]/.test(formData.newPassword) ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={/[A-Z]/.test(formData.newPassword) ? colors.success : colors.gray[400]}
                            />
                            <Text style={styles.requirementText}>At least one uppercase letter</Text>
                        </View>

                        <View style={styles.requirementRow}>
                            <Icon
                                name={/[0-9]/.test(formData.newPassword) ? 'check-circle' : 'circle-outline'}
                                size={16}
                                color={/[0-9]/.test(formData.newPassword) ? colors.success : colors.gray[400]}
                            />
                            <Text style={styles.requirementText}>At least one number</Text>
                        </View>

                        <View style={styles.requirementRow}>
                            <Icon
                                name={
                                    formData.newPassword !== formData.currentPassword && formData.newPassword
                                        ? 'check-circle'
                                        : 'circle-outline'
                                }
                                size={16}
                                color={
                                    formData.newPassword !== formData.currentPassword && formData.newPassword
                                        ? colors.success
                                        : colors.gray[400]
                                }
                            />
                            <Text style={styles.requirementText}>Different from current password</Text>
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <Text style={styles.submitButtonText}>Change Password</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    scrollContainer: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        marginBottom: 24,
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
    },
    inputError: {
        borderColor: colors.error,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        paddingVertical: 12,
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
    strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    strengthBarContainer: {
        flex: 1,
        flexDirection: 'row',
        height: 4,
        backgroundColor: colors.gray[200],
        borderRadius: 2,
        overflow: 'hidden',
        marginRight: 8,
    },
    strengthBar: {
        flex: 1,
        height: '100%',
    },
    strengthLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
    },
    requirementsContainer: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    requirementsTitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 12,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    submitButton: {
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
});

export default ChangePasswordScreen;