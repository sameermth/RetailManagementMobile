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
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { validateEmail, validatePhone } from '@utils/validators';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { register, isLoading } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Invalid phone number (10 digits required)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
            });
            // Navigation will be handled automatically by AppNavigator
        } catch (err: any) {
            Alert.alert('Registration Failed', err.message || 'Could not create account');
        }
    };

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        // Clear error for this field when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Sign up to get started</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Username */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Username *</Text>
                        <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                            <Icon name="account" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter username"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.username}
                                onChangeText={(value) => updateForm('username', value)}
                                editable={!isLoading}
                            />
                        </View>
                        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email *</Text>
                        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <Icon name="email" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.email}
                                onChangeText={(value) => updateForm('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* First Name & Last Name */}
                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>First Name *</Text>
                            <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First name"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.firstName}
                                    onChangeText={(value) => updateForm('firstName', value)}
                                    editable={!isLoading}
                                />
                            </View>
                            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                        </View>

                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Last Name *</Text>
                            <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last name"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.lastName}
                                    onChangeText={(value) => updateForm('lastName', value)}
                                    editable={!isLoading}
                                />
                            </View>
                            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Phone (Optional)</Text>
                        <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                            <Icon name="phone" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter phone number"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.phone}
                                onChangeText={(value) => updateForm('phone', value)}
                                keyboardType="phone-pad"
                                editable={!isLoading}
                            />
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Password *</Text>
                        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                            <Icon name="lock" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.password}
                                onChangeText={(value) => updateForm('password', value)}
                                secureTextEntry={!showPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                            <Icon name="lock-check" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.confirmPassword}
                                onChangeText={(value) => updateForm('confirmPassword', value)}
                                secureTextEntry={!showConfirmPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Login Link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                        <Text style={styles.loginText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
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
    header: {
        marginBottom: 32,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    row: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    registerButton: {
        height: 52,
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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

export default RegisterScreen;