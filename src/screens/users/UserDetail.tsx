import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUsers } from '@hooks/useUsers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatDate, formatDateTime } from '@utils/formatters';

const UserDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params as { userId: number };
    const {
        getUser,
        deleteUser,
        activateUser,
        deactivateUser,
        fetchRoles,
        assignRoles,
        roles,
        loading,
    } = useUsers();

    const [user, setUser] = useState<any>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);

    useEffect(() => {
        loadUser();
        fetchRoles();
    }, []);

    const loadUser = async () => {
        try {
            const data = await getUser(userId);
            setUser(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load user details');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUser(userId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleStatus = async () => {
        try {
            if (user.active) {
                await deactivateUser(userId);
            } else {
                await activateUser(userId);
            }
            await loadUser();
        } catch (error) {
            Alert.alert('Error', 'Failed to update user status');
        }
    };

    const handleResetPassword = () => {
        Alert.alert(
            'Reset Password',
            'Send password reset email to user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        try {
                            // API call for password reset
                            Alert.alert('Success', 'Password reset email sent');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to send reset email');
                        }
                    },
                },
            ]
        );
    };

    const InfoRow = ({ label, value, icon }: any) => (
        <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
                <Icon name={icon} size={20} color={colors.gray[500]} />
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <Text style={styles.valueText}>{value || '-'}</Text>
        </View>
    );

    const Section = ({ title, children }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );

    const RoleModal = () => (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Assign Roles</Text>
                    <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                        <Icon name="close" size={24} color={colors.gray[600]} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.roleList}>
                    {roles.map((role) => {
                        const isAssigned = user?.roles?.some((r: any) => r.id === role.id);
                        return (
                            <TouchableOpacity
                                key={role.id}
                                style={styles.roleItem}
                                onPress={async () => {
                                    try {
                                        const currentRoleIds = user.roles.map((r: any) => r.id);
                                        let newRoleIds;
                                        if (isAssigned) {
                                            newRoleIds = currentRoleIds.filter((id: number) => id !== role.id);
                                        } else {
                                            newRoleIds = [...currentRoleIds, role.id];
                                        }
                                        await assignRoles(userId, newRoleIds);
                                        await loadUser();
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to update roles');
                                    }
                                }}
                            >
                                <View style={styles.roleInfo}>
                                    <Text style={styles.roleName}>{role.name}</Text>
                                    {role.description && (
                                        <Text style={styles.roleDescription}>{role.description}</Text>
                                    )}
                                </View>
                                {isAssigned && (
                                    <Icon name="check-circle" size={24} color={colors.success} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowRoleModal(false)}
                >
                    <Text style={styles.modalCloseButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading || !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: user.active ? colors.success : colors.error }]}>
                            <Text style={styles.statusText}>{user.active ? 'Active' : 'Inactive'}</Text>
                        </View>
                    </View>
                </View>

                {/* Personal Information */}
                <Section title="Personal Information">
                    <InfoRow label="Username" value={user.username} icon="account" />
                    <InfoRow label="First Name" value={user.firstName} icon="account" />
                    <InfoRow label="Last Name" value={user.lastName} icon="account" />
                    <InfoRow label="Email" value={user.email} icon="email" />
                    <InfoRow label="Phone" value={user.phone} icon="phone" />
                </Section>

                {/* Roles */}
                <Section title="Roles & Permissions">
                    <View style={styles.rolesHeader}>
                        <Text style={styles.rolesLabel}>Assigned Roles</Text>
                        <TouchableOpacity onPress={() => setShowRoleModal(true)}>
                            <Text style={styles.editRolesText}>Edit Roles</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.roleContainer}>
                        {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role: any) => (
                                <View key={role.id} style={styles.roleBadge}>
                                    <Text style={styles.roleBadgeText}>{role.name.replace('ROLE_', '')}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noRolesText}>No roles assigned</Text>
                        )}
                    </View>
                </Section>

                {/* Account Information */}
                <Section title="Account Information">
                    <InfoRow label="Created" value={formatDateTime(user.createdAt)} icon="clock-outline" />
                    <InfoRow label="Last Login" value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'} icon="login" />
                </Section>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => navigation.navigate('EditUser', { userId: user.id })}
                    >
                        <Icon name="pencil" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.passwordButton]}
                        onPress={handleResetPassword}
                    >
                        <Icon name="lock-reset" size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>Reset Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, user.active ? styles.deactivateButton : styles.activateButton]}
                        onPress={handleToggleStatus}
                    >
                        <Icon name={user.active ? 'close-circle' : 'check-circle'} size={20} color={colors.background} />
                        <Text style={styles.actionButtonText}>
                            {user.active ? 'Deactivate' : 'Activate'}
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
            </ScrollView>

            {showRoleModal && <RoleModal />}
        </>
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: colors.primary[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: typography.fontSize['3xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    headerInfo: {
        flex: 1,
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
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
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    valueText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    rolesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rolesLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    editRolesText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    roleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    roleBadge: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    roleBadgeText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    noRolesText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        fontStyle: 'italic',
    },
    actionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: colors.primary[500],
    },
    passwordButton: {
        backgroundColor: colors.info,
    },
    activateButton: {
        backgroundColor: colors.success,
    },
    deactivateButton: {
        backgroundColor: colors.warning,
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
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: colors.background,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    roleList: {
        padding: 16,
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
    modalCloseButton: {
        backgroundColor: colors.primary[500],
        padding: 16,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
    },
});

export default UserDetailScreen;