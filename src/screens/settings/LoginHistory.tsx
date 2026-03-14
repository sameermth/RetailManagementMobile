import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatDateTime } from '@utils/formatters';

interface LoginEvent {
    id: string;
    timestamp: string;
    ipAddress: string;
    device: string;
    browser: string;
    location: string;
    status: 'success' | 'failed';
    failureReason?: string;
}

const LoginHistoryScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [loginHistory, setLoginHistory] = useState<LoginEvent[]>([]);
    const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

    useEffect(() => {
        loadLoginHistory();
    }, []);

    const loadLoginHistory = async () => {
        setLoading(true);
        try {
            // Mock data - replace with API call
            setLoginHistory([
                {
                    id: '1',
                    timestamp: '2026-03-14T10:30:00',
                    ipAddress: '192.168.1.100',
                    device: 'iPhone 14 Pro',
                    browser: 'Safari',
                    location: 'Mumbai, India',
                    status: 'success',
                },
                {
                    id: '2',
                    timestamp: '2026-03-14T09:15:00',
                    ipAddress: '192.168.1.100',
                    device: 'iPhone 14 Pro',
                    browser: 'Safari',
                    location: 'Mumbai, India',
                    status: 'success',
                },
                {
                    id: '3',
                    timestamp: '2026-03-13T22:45:00',
                    ipAddress: '203.0.113.45',
                    device: 'Unknown Device',
                    browser: 'Chrome',
                    location: 'Delhi, India',
                    status: 'failed',
                    failureReason: 'Invalid password',
                },
                {
                    id: '4',
                    timestamp: '2026-03-13T18:20:00',
                    ipAddress: '192.168.1.100',
                    device: 'MacBook Pro',
                    browser: 'Chrome',
                    location: 'Mumbai, India',
                    status: 'success',
                },
                {
                    id: '5',
                    timestamp: '2026-03-12T11:05:00',
                    ipAddress: '198.51.100.78',
                    device: 'Samsung Galaxy S23',
                    browser: 'Chrome',
                    location: 'Bangalore, India',
                    status: 'failed',
                    failureReason: 'Account locked',
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to load login history');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = loginHistory.filter(item =>
        filter === 'all' ? true : item.status === filter
    );

    const renderLoginItem = ({ item }: { item: LoginEvent }) => (
        <View style={styles.loginCard}>
            <View style={styles.loginHeader}>
                <View style={[styles.statusIndicator, { backgroundColor: item.status === 'success' ? colors.success : colors.error }]} />
                <View style={styles.loginInfo}>
                    <Text style={styles.deviceName}>{item.device}</Text>
                    <Text style={styles.timestamp}>{formatDateTime(item.timestamp)}</Text>
                </View>
                <Icon
                    name={item.status === 'success' ? 'check-circle' : 'alert-circle'}
                    size={24}
                    color={item.status === 'success' ? colors.success : colors.error}
                />
            </View>

            <View style={styles.loginDetails}>
                <View style={styles.detailRow}>
                    <Icon name="ip" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>IP: {item.ipAddress}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="web" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.browser}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Icon name="map-marker" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>{item.location}</Text>
                </View>

                {item.status === 'failed' && item.failureReason && (
                    <View style={[styles.detailRow, styles.failureRow]}>
                        <Icon name="alert" size={16} color={colors.error} />
                        <Text style={[styles.detailText, styles.failureText]}>
                            Reason: {item.failureReason}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Login History</Text>

            <View style={styles.filterTabs}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterTab, filter === 'success' && styles.filterTabActive]}
                    onPress={() => setFilter('success')}
                >
                    <Text style={[styles.filterTabText, filter === 'success' && styles.filterTabTextActive]}>
                        Successful
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterTab, filter === 'failed' && styles.filterTabActive]}
                    onPress={() => setFilter('failed')}
                >
                    <Text style={[styles.filterTabText, filter === 'failed' && styles.filterTabTextActive]}>
                        Failed
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{loginHistory.length}</Text>
                    <Text style={styles.statLabel}>Total Logins</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                        {loginHistory.filter(l => l.status === 'success').length}
                    </Text>
                    <Text style={styles.statLabel}>Successful</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.error }]}>
                        {loginHistory.filter(l => l.status === 'failed').length}
                    </Text>
                    <Text style={styles.statLabel}>Failed</Text>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="history" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyStateTitle}>No Login History</Text>
            <Text style={styles.emptyStateText}>
                Your login activity will appear here
            </Text>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.exportButton}>
                <Icon name="download" size={20} color={colors.primary[500]} />
                <Text style={styles.exportButtonText}>Export History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton}>
                <Icon name="delete-sweep" size={20} color={colors.error} />
                <Text style={styles.clearButtonText}>Clear History</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}

            <FlatList
                data={filteredHistory}
                renderItem={renderLoginItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmptyState : null}
                ListFooterComponent={filteredHistory.length > 0 ? renderFooter : null}
                refreshing={loading}
                onRefresh={loadLoginHistory}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray[50],
    },
    header: {
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 16,
    },
    filterTabs: {
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    filterTabActive: {
        backgroundColor: colors.background,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterTabText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    filterTabTextActive: {
        color: colors.primary[500],
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        padding: 12,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography.fontSize.xl,
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
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    loginCard: {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    loginHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 12,
    },
    loginInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    timestamp: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    loginDetails: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginLeft: 8,
    },
    failureRow: {
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    failureText: {
        color: colors.error,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 32,
    },
    exportButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[50],
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    exportButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.primary[500],
        marginLeft: 6,
    },
    clearButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.error + '10',
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 8,
    },
    clearButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.error,
        marginLeft: 6,
    },
});

export default LoginHistoryScreen;