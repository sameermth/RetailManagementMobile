import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch,
    FlatList,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Backup {
    id: string;
    fileName: string;
    size: string;
    date: string;
    type: 'auto' | 'manual';
}

const BackupSettingsScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [backups, setBackups] = useState<Backup[]>([]);
    const [autoBackup, setAutoBackup] = useState(false);
    const [backupFrequency, setBackupFrequency] = useState('DAILY');
    const [backupTime, setBackupTime] = useState(new Date());
    const [retentionDays, setRetentionDays] = useState('30');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        setLoading(true);
        try {
            // Mock data - replace with API call
            setBackups([
                {
                    id: '1',
                    fileName: 'backup_2026_03_14_1000.zip',
                    size: '2.5 MB',
                    date: '2026-03-14 10:00',
                    type: 'auto',
                },
                {
                    id: '2',
                    fileName: 'backup_2026_03_13_1000.zip',
                    size: '2.4 MB',
                    date: '2026-03-13 10:00',
                    type: 'auto',
                },
                {
                    id: '3',
                    fileName: 'manual_backup_2026_03_12.zip',
                    size: '2.3 MB',
                    date: '2026-03-12 15:30',
                    type: 'manual',
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to load backups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreating(true);
        try {
            // API call to create backup
            await new Promise(resolve => setTimeout(resolve, 3000));
            Alert.alert('Success', 'Backup created successfully');
            loadBackups();
        } catch (error) {
            Alert.alert('Error', 'Failed to create backup');
        } finally {
            setCreating(false);
        }
    };

    const handleRestoreBackup = (backupId: string) => {
        Alert.alert(
            'Restore Backup',
            'Restoring will replace current data. This action cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore',
                    onPress: async () => {
                        setRestoring(true);
                        try {
                            // API call to restore
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            Alert.alert('Success', 'Backup restored successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to restore backup');
                        } finally {
                            setRestoring(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDownloadBackup = (backupId: string) => {
        Alert.alert('Download', 'Downloading backup...');
        // Implement download logic
    };

    const handleDeleteBackup = (backupId: string) => {
        Alert.alert(
            'Delete Backup',
            'Are you sure you want to delete this backup?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setBackups(backups.filter(b => b.id !== backupId));
                    },
                },
            ]
        );
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setBackupTime(selectedDate);
        }
    };

    const renderBackupItem = ({ item }: { item: Backup }) => (
        <View style={styles.backupCard}>
            <View style={styles.backupHeader}>
                <Icon
                    name={item.type === 'auto' ? 'calendar-clock' : 'cloud-upload'}
                    size={24}
                    color={item.type === 'auto' ? colors.info : colors.success}
                />
                <View style={styles.backupInfo}>
                    <Text style={styles.backupName}>{item.fileName}</Text>
                    <Text style={styles.backupMeta}>
                        {item.date} • {item.size}
                    </Text>
                </View>
            </View>

            <View style={styles.backupActions}>
                <TouchableOpacity
                    style={[styles.backupAction, styles.restoreAction]}
                    onPress={() => handleRestoreBackup(item.id)}
                >
                    <Icon name="restore" size={16} color={colors.success} />
                    <Text style={styles.actionText}>Restore</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.backupAction, styles.downloadAction]}
                    onPress={() => handleDownloadBackup(item.id)}
                >
                    <Icon name="download" size={16} color={colors.primary[500]} />
                    <Text style={styles.actionText}>Download</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.backupAction, styles.deleteAction]}
                    onPress={() => handleDeleteBackup(item.id)}
                >
                    <Icon name="delete" size={16} color={colors.error} />
                    <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Auto Backup Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Automatic Backup</Text>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleLabel}>Enable Auto Backup</Text>
                            <Text style={styles.toggleDescription}>
                                Automatically backup data on schedule
                            </Text>
                        </View>
                        <Switch
                            value={autoBackup}
                            onValueChange={setAutoBackup}
                            trackColor={{ false: colors.gray[300], true: colors.primary[500] }}
                        />
                    </View>

                    {autoBackup && (
                        <>
                            <View style={styles.pickerContainer}>
                                <Text style={styles.label}>Frequency</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={backupFrequency}
                                        onValueChange={setBackupFrequency}
                                    >
                                        <Picker.Item label="Daily" value="DAILY" />
                                        <Picker.Item label="Weekly" value="WEEKLY" />
                                        <Picker.Item label="Monthly" value="MONTHLY" />
                                    </Picker>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={styles.label}>Backup Time</Text>
                                <Text style={styles.timeValue}>
                                    {backupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Retention Period (days)</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={retentionDays}
                                        onValueChange={setRetentionDays}
                                    >
                                        <Picker.Item label="7 days" value="7" />
                                        <Picker.Item label="15 days" value="15" />
                                        <Picker.Item label="30 days" value="30" />
                                        <Picker.Item label="60 days" value="60" />
                                        <Picker.Item label="90 days" value="90" />
                                    </Picker>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Manual Backup */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Manual Backup</Text>

                    <TouchableOpacity
                        style={[styles.createButton, creating && styles.createButtonDisabled]}
                        onPress={handleCreateBackup}
                        disabled={creating}
                    >
                        {creating ? (
                            <ActivityIndicator color={colors.background} />
                        ) : (
                            <>
                                <Icon name="cloud-upload" size={24} color={colors.background} />
                                <Text style={styles.createButtonText}>Create Backup Now</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Backup History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Backup History</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary[500]} />
                    ) : (
                        <FlatList
                            data={backups}
                            renderItem={renderBackupItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Icon name="cloud-off" size={48} color={colors.gray[300]} />
                                    <Text style={styles.emptyStateText}>No backups found</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </ScrollView>

            {showTimePicker && (
                <DateTimePicker
                    value={backupTime}
                    mode="time"
                    is24Hour={true}
                    onChange={onTimeChange}
                />
            )}

            {restoring && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Restoring backup...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
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
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    toggleInfo: {
        flex: 1,
        marginRight: 12,
    },
    toggleLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    toggleDescription: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 6,
    },
    pickerContainer: {
        marginTop: 16,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    timeButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
    },
    timeValue: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
    },
    inputWrapper: {
        marginTop: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.success,
        paddingVertical: 14,
        borderRadius: 8,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.background,
        marginLeft: 8,
    },
    backupCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    backupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    backupInfo: {
        flex: 1,
        marginLeft: 12,
    },
    backupName: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    backupMeta: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    backupActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
    },
    backupAction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
    },
    restoreAction: {
        backgroundColor: colors.success + '10',
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    downloadAction: {
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    deleteAction: {
        backgroundColor: colors.error + '10',
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    actionText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 24,
    },
    emptyStateText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginTop: 8,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginTop: 12,
    },
});

export default BackupSettingsScreen;