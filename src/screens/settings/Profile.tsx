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
    Image,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { validateEmail, validatePhone } from '@utils/validators';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, updateProfile, loading } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            await updateProfile(formData);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update profile');
        }
    };

    const handleCancel = () => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        setErrors({});
        setIsEditing(false);
    };

    const renderField = (
        label: string,
        value: string,
        field: string,
        options?: {
            keyboardType?: 'default' | 'email-address' | 'phone-pad';
            editable?: boolean;
        }
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {options?.editable ? (
                <>
                    <TextInput
                        style={[styles.fieldInput, errors[field] && styles.fieldError]}
                        value={value}
                        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                        keyboardType={options?.keyboardType || 'default'}
                        editable={!loading}
                    />
                    {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
                </>
            ) : (
                <Text style={styles.fieldValue}>{value || 'Not provided'}</Text>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </Text>
                        </View>
                    )}
                    {isEditing && (
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Icon name="camera" size={20} color={colors.background} />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.userName}>
                    {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.userRole}>{user?.roles?.[0]}</Text>
            </View>

            {/* Profile Information */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    {!isEditing ? (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Icon name="pencil" size={20} color={colors.primary[500]} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.editActions}>
                            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                style={styles.saveButton}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.background} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.infoCard}>
                    {renderField('First Name', formData.firstName, 'firstName', { editable: isEditing })}
                    {renderField('Last Name', formData.lastName, 'lastName', { editable: isEditing })}
                    {renderField('Email', formData.email, 'email', {
                        editable: isEditing,
                        keyboardType: 'email-address'
                    })}
                    {renderField('Phone', formData.phone, 'phone', {
                        editable: isEditing,
                        keyboardType: 'phone-pad'
                    })}
                </View>
            </View>

            {/* Account Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Username</Text>
                        <Text style={styles.infoValue}>{user?.username}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Member Since</Text>
                        <Text style={styles.infoValue}>
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Login</Text>
                        <Text style={styles.infoValue}>
                            {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Security */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <TouchableOpacity
                    style={styles.securityItem}
                    onPress={() => Alert.alert('Coming Soon', 'Password change feature coming soon')}
                >
                    <View style={styles.securityItemLeft}>
                        <Icon name="lock" size={20} color={colors.primary[500]} />
                        <Text style={styles.securityItemText}>Change Password</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={colors.gray[400]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.securityItem}
                    onPress={() => Alert.alert('Coming Soon', 'Two-factor authentication coming soon')}
                >
                    <View style={styles.securityItemLeft}>
                        <Icon name="shield-account" size={20} color={colors.primary[500]} />
                        <Text style={styles.securityItemText}>Two-Factor Authentication</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={colors.gray[400]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.securityItem}
                    onPress={() => Alert.alert('Coming Soon', 'Login history coming soon')}
                >
                    <View style={styles.securityItemLeft}>
                        <Icon name="history" size={20} color={colors.primary[500]} />
                        <Text style={styles.securityItemText}>Login History</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={colors.gray[400]} />
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
    header: {
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarText: {
        fontSize: typography.fontSize['3xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.background,
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    userRole: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    editActions: {
        flexDirection: 'row',
    },
    cancelButton: {
        marginRight: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    cancelButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    saveButton: {
        backgroundColor: colors.primary[500],
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    saveButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    infoCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        paddingVertical: 8,
    },
    fieldInput: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    fieldError: {
        borderColor: colors.error,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
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
    securityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    securityItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    securityItemText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        marginLeft: 12,
    },
});

export default ProfileScreen;