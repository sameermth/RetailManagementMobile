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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useUsers } from '@hooks/useUsers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { validateEmail, validatePhone } from '@utils/validators';

const AddUserScreen = () => {
    const navigation = useNavigation();
    const { createUser, roles, fetchRoles, loading } = useUsers();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        selectedRoles: [] as number[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

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
            newErrors.phone = 'Phone must be 10 digits';
        }
        if (formData.selectedRoles.length === 0) {
            newErrors.roles = 'Select at least one role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
                roles: formData.selectedRoles,
            };

            await createUser(userData);
            Alert.alert('Success', 'User created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create user');
        }
    };

    const toggleRole = (roleId: number) => {
        setFormData(prev => ({
            ...prev,
            selectedRoles: prev.selectedRoles.includes(roleId)
                ? prev.selectedRoles.filter(id => id !== roleId)
                : [...prev.selectedRoles, roleId],
        }));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Username <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter username"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.username}
                                onChangeText={(value) => setFormData({...formData, username: value})}
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.email}
                                onChangeText={(value) => setFormData({...formData, email: value})}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>First Name <Text style={styles.requiredStar}>*</Text></Text>
                            <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First name"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.firstName}
                                    onChangeText={(value) => setFormData({...formData, firstName: value})}
                                />
                            </View>
                            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                        </View>

                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Last Name <Text style={styles.requiredStar}>*</Text></Text>
                            <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last name"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.lastName}
                                    onChangeText={(value) => setFormData({...formData, lastName: value})}
                                />
                            </View>
                            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Phone</Text>
                        <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 10-digit phone number"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.phone}
                                onChangeText={(value) => setFormData({...formData, phone: value})}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>
                </View>

                {/* Password */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Password</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Password <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.password}
                                onChangeText={(value) => setFormData({...formData, password: value})}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Confirm Password <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Confirm password"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.confirmPassword}
                                onChangeText={(value) => setFormData({...formData, confirmPassword: value})}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>
                </View>

                {/* Roles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Roles <Text style={styles.requiredStar}>*</Text></Text>
                    {errors.roles && <Text style={styles.errorText}>{errors.roles}</Text>}

                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={styles.roleItem}
                            onPress={() => toggleRole(role.id)}
                        >
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleName}>{role.name}</Text>
                                {role.description && (
                                    <Text style={styles.roleDescription}>{role.description}</Text>
                                )}
                            </View>
                            <View style={[
                                styles.checkbox,
                                formData.selectedRoles.includes(role.id) && styles.checkboxChecked
                            ]}>
                                {formData.selectedRoles.includes(role.id) && (
                                    <Icon name="check" size={16} color={colors.background} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
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
                        <Text style={styles.submitButtonText}>Create User</Text>
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
    section: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
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
    requiredStar: {
        color: colors.error,
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
    roleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    roleInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    roleDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary[500],
    },
    submitButton: {
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
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

export default AddUserScreen;