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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUsers } from '@hooks/useUsers';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { validateEmail, validatePhone } from '@utils/validators';

const EditUserScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params as { userId: number };
    const { getUser, updateUser, loading } = useUsers();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const user = await getUser(userId);
            setFormData({
                username: user.username || '',
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to load user details');
            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone must be 10 digits';
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
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || undefined,
            };

            await updateUser(userId, userData);
            Alert.alert('Success', 'User updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update user');
        }
    };

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Edit User</Text>

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
                                editable={!loading}
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
                                editable={!loading}
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
                                    editable={!loading}
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
                                    editable={!loading}
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
                                editable={!loading}
                            />
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <Text style={styles.submitButtonText}>Update User</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        paddingVertical: 12,
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        marginTop: 4,
        marginLeft: 4,
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

export default EditUserScreen;