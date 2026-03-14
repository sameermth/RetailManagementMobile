import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SectionList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRoles } from '@hooks/useRoles';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatDate } from '@utils/formatters';

const RoleDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { roleId } = route.params as { roleId: number };
    const {
        getRole,
        deleteRole,
        permissionGroups,
        fetchPermissionGroups,
        assignPermission,
        removePermission,
        loading,
    } = useRoles();

    const [role, setRole] = useState<any>(null);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        loadRole();
        fetchPermissionGroups();
    }, []);

    const loadRole = async () => {
        try {
            const data = await getRole(roleId);
            setRole(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load role details');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Role',
            'Are you sure you want to delete this role? Users with this role will lose associated permissions.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteRole(roleId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete role');
                        }
                    },
                },
            ]
        );
    };

    const togglePermission = async (permissionId: number) => {
        if (!role) return;

        const hasPermission = role.permissions?.some((p: any) => p.id === permissionId);

        try {
            if (hasPermission) {
                await removePermission(roleId, permissionId);
            } else {
                await assignPermission(roleId, permissionId);
            }
            await loadRole(); // Reload to get updated permissions
        } catch (error) {
            Alert.alert('Error', 'Failed to update permission');
        }
    };

    const InfoRow = ({ label, value }: any) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || '-'}</Text>
        </View>
    );

    const renderPermissionSection = ({ section }: { section: any }) => (
        <View style={styles.permissionSection}>
            <View style={styles.sectionHeader}>
                <Icon name={getModuleIcon(section.module)} size={20} color={colors.primary[500]} />
                <Text style={styles.sectionTitle}>{section.module}</Text>
            </View>
            {section.data.map((permission: any) => {
                const hasPermission = role?.permissions?.some((p: any) => p.id === permission.id);
                return (
                    <TouchableOpacity
                        key={permission.id}
                        style={styles.permissionItem}
                        onPress={() => editing && togglePermission(permission.id)}
                        disabled={!editing}
                    >
                        <View style={styles.permissionInfo}>
                            <Text style={styles.permissionName}>{permission.name}</Text>
                            {permission.description && (
                                <Text style={styles.permissionDescription}>{permission.description}</Text>
                            )}
                        </View>
                        {editing ? (
                            <View style={[styles.checkbox, hasPermission && styles.checkboxChecked]}>
                                {hasPermission && <Icon name="check" size={16} color={colors.background} />}
                            </View>
                        ) : (
                            hasPermission && (
                                <Icon name="check-circle" size={20} color={colors.success} />
                            )
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

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

    if (loading || !role) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    const sections = permissionGroups.map(group => ({
        title: group.module,
        module: group.module,
        data: group.permissions,
    }));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.roleIcon}>
                        <Icon name="shield-account" size={40} color={colors.primary[500]} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.roleName}>{role.name}</Text>
                        {role.description && (
                            <Text style={styles.roleDescription}>{role.description}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{role.userCount || 0}</Text>
                        <Text style={styles.statLabel}>Users</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{role.permissions?.length || 0}</Text>
                        <Text style={styles.statLabel}>Permissions</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatDate(role.createdAt)}</Text>
                        <Text style={styles.statLabel}>Created</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => navigation.navigate('EditRole', { roleId: role.id })}
                    >
                        <Icon name="pencil" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Edit Role</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, editing ? styles.doneButton : styles.manageButton]}
                        onPress={() => setEditing(!editing)}
                    >
                        <Icon name={editing ? 'check' : 'shield-edit'} size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>
                            {editing ? 'Done' : 'Manage Permissions'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={handleDelete}
                    >
                        <Icon name="delete" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {editing && (
                <View style={styles.editHint}>
                    <Icon name="information" size={16} color={colors.info} />
                    <Text style={styles.editHintText}>
                        Tap checkboxes to grant or revoke permissions
                    </Text>
                </View>
            )}

            <SectionList
                sections={sections}
                renderItem={() => null}
                renderSectionHeader={renderPermissionSection}
                keyExtractor={(item, index) => item.id + index}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
            />
        </View>
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
    header: {
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    roleIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    roleDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: colors.primary[500],
    },
    manageButton: {
        backgroundColor: colors.info,
    },
    doneButton: {
        backgroundColor: colors.success,
    },
    deleteButton: {
        backgroundColor: colors.error,
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 6,
    },
    editHint: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info + '10',
        padding: 8,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
    },
    editHintText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.info,
        marginLeft: 8,
    },
    listContent: {
        padding: 16,
    },
    permissionSection: {
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginLeft: 8,
        textTransform: 'capitalize',
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
});

export default RoleDetailScreen;