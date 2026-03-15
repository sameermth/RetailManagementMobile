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
    SectionList,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useRoles } from '@hooks/useRoles';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';

const AddRoleScreen = () => {
    const navigation = useNavigation();
    const {
        createRole,
        permissionGroups,
        fetchPermissionGroups,
        loading,
    } = useRoles();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as number[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchPermissionGroups();
    }, []);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) {
            newErrors.name = 'Role name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Role name must be at least 3 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const roleData = {
                name: formData.name,
                description: formData.description || undefined,
                permissions: formData.permissions,
            };

            await createRole(roleData);
            Alert.alert('Success', 'Role created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create role');
        }
    };

    const togglePermission = (permissionId: number) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId],
        }));
    };

    const toggleAllInModule = (permissions: any[]) => {
        const modulePermissionIds = permissions.map(p => p.id);
        const allSelected = modulePermissionIds.every(id => formData.permissions.includes(id));

        setFormData(prev => ({
            ...prev,
            permissions: allSelected
                ? prev.permissions.filter(id => !modulePermissionIds.includes(id))
                : [...prev.permissions, ...modulePermissionIds.filter(id => !prev.permissions.includes(id))],
        }));
    };

    const getModuleIcon = (module: string) => {
        switch (module?.toLowerCase()) {
            case 'products': return 'package';
            case 'inventory': return 'warehouse';
            case 'sales': return 'cash-register';
            case 'customers': return 'account-group';
            case 'suppliers': return 'truck';
            case 'purchases': return 'clipboard-text';
            case 'distributors': return 'truck-delivery';
            case 'expenses': return 'cash-minus';
            case 'reports': return 'chart-bar';
            case 'users': return 'account-group';
            case 'settings': return 'cog';
            default: return 'shield';
        }
    };

    const filteredGroups = permissionGroups
        .map(group => ({
            ...group,
            permissions: group.permissions.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter(group => group.permissions.length > 0);

    const sections = filteredGroups.map(group => ({
        title: group.module,
        module: group.module,
        data: group.permissions,
    }));

    const renderPermissionSection = ({ section }: { section: any }) => {
        const allModuleSelected = section.data.every((p: any) => formData.permissions.includes(p.id));
        const someModuleSelected = section.data.some((p: any) => formData.permissions.includes(p.id));

        return (
            <View style={styles.permissionSection}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <Icon name={getModuleIcon(section.module)} size={20} color={colors.primary[500]} />
                        <Text style={styles.sectionTitle}>{section.module}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.selectAllButton, allModuleSelected && styles.selectAllButtonActive]}
                        onPress={() => toggleAllInModule(section.data)}
                    >
                        <Text style={[styles.selectAllText, allModuleSelected && styles.selectAllTextActive]}>
                            {allModuleSelected ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {section.data.map((permission: any) => {
                    const isSelected = formData.permissions.includes(permission.id);
                    return (
                        <TouchableOpacity
                            key={permission.id}
                            style={styles.permissionItem}
                            onPress={() => togglePermission(permission.id)}
                        >
                            <View style={styles.permissionInfo}>
                                <Text style={styles.permissionName}>{permission.name}</Text>
                                {permission.description && (
                                    <Text style={styles.permissionDescription}>{permission.description}</Text>
                                )}
                            </View>
                            <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                                {isSelected && <Icon name="check" size={16} color={colors.background} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
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
                        <Text style={styles.label}>Role Name <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter role name (e.g., MANAGER, CASHIER)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.name}
                                onChangeText={(value) => setFormData({...formData, name: value})}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Enter role description"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.description}
                                onChangeText={(value) => setFormData({...formData, description: value})}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>

                {/* Permissions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Permissions</Text>
                    <Text style={styles.subtitle}>
                        Select the permissions to assign to this role
                    </Text>

                    <View style={styles.searchContainer}>
                        <Icon name="magnify" size={20} color={colors.gray[400]} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search permissions..."
                            placeholderTextColor={colors.gray[400]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close" size={20} color={colors.gray[400]} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View style={styles.selectedCount}>
                        <Text style={styles.selectedCountText}>
                            {formData.permissions.length} permissions selected
                        </Text>
                    </View>

                    {sections.map(section => renderPermissionSection({ section }))}

                    {sections.length === 0 && (
                        <View style={styles.noResults}>
                            <Icon name="shield-off" size={48} color={colors.gray[300]} />
                            <Text style={styles.noResultsText}>No permissions found</Text>
                        </View>
                    )}
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
                        <Text style={styles.submitButtonText}>Create Role</Text>
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
        marginBottom: 12,
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
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
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        padding: 0,
    },
    selectedCount: {
        backgroundColor: colors.primary[50],
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    selectedCountText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        textAlign: 'center',
    },
    permissionSection: {
        backgroundColor: colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginLeft: 8,
        textTransform: 'capitalize',
    },
    selectAllButton: {
        backgroundColor: colors.gray[100],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    selectAllButtonActive: {
        backgroundColor: colors.primary[500],
    },
    selectAllText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    selectAllTextActive: {
        color: colors.background,
    },
    permissionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    permissionInfo: {
        flex: 1,
        marginRight: 12,
    },
    permissionName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    permissionDescription: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary[500],
    },
    noResults: {
        alignItems: 'center',
        padding: 24,
    },
    noResultsText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 8,
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

export default AddRoleScreen;