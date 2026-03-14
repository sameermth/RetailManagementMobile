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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSuppliers } from '@hooks/useSuppliers';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency, formatDate, formatPhoneNumber } from '@utils/formatters';

const SupplierDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { supplierId } = route.params as { supplierId: number };
    const { getSupplier, deleteSupplier, activateSupplier, deactivateSupplier, loading } = useSuppliers();

    const [supplier, setSupplier] = useState<any>(null);

    useEffect(() => {
        loadSupplier();
    }, []);

    const loadSupplier = async () => {
        try {
            const data = await getSupplier(supplierId);
            setSupplier(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load supplier details');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Supplier',
            'Are you sure you want to delete this supplier?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSupplier(supplierId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete supplier');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleStatus = async () => {
        try {
            if (supplier.isActive) {
                await deactivateSupplier(supplierId);
            } else {
                await activateSupplier(supplierId);
            }
            await loadSupplier();
        } catch (error) {
            Alert.alert('Error', 'Failed to update supplier status');
        }
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

    if (loading || !supplier) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {supplier.name?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.supplierName}>{supplier.name}</Text>
                        <Text style={styles.supplierCode}>Code: {supplier.supplierCode}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: supplier.isActive ? colors.success : colors.error }]}>
                            <Text style={styles.statusText}>{supplier.isActive ? 'Active' : 'Inactive'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Contact Information */}
            <Section title="Contact Information">
                <InfoRow label="Contact Person" value={supplier.contactPerson} icon="account-tie" />
                <InfoRow label="Email" value={supplier.email} icon="email" />
                <InfoRow label="Phone" value={formatPhoneNumber(supplier.phone)} icon="phone" />
                <InfoRow label="Alternate Phone" value={formatPhoneNumber(supplier.alternatePhone)} icon="phone-plus" />
                <InfoRow label="Website" value={supplier.website} icon="web" />
            </Section>

            {/* Address */}
            <Section title="Address">
                <InfoRow label="Address" value={supplier.address} icon="map-marker" />
                <InfoRow label="City" value={supplier.city} icon="city" />
                <InfoRow label="State" value={supplier.state} icon="map" />
                <InfoRow label="Country" value={supplier.country} icon="earth" />
                <InfoRow label="Pincode" value={supplier.pincode} icon="zip-box" />
            </Section>

            {/* Tax Information */}
            <Section title="Tax Information">
                <InfoRow label="GST Number" value={supplier.gstNumber} icon="barcode" />
                <InfoRow label="PAN Number" value={supplier.panNumber} icon="card-account-details" />
                <InfoRow label="Tax Type" value={supplier.taxType} icon="percent" />
            </Section>

            {/* Business Terms */}
            <Section title="Business Terms">
                <InfoRow label="Credit Limit" value={supplier.creditLimit ? formatCurrency(supplier.creditLimit) : '-'} icon="credit-card" />
                <InfoRow label="Outstanding Amount" value={formatCurrency(supplier.outstandingAmount || 0)} icon="cash" />
                <InfoRow label="Payment Terms" value={supplier.paymentTerms ? `${supplier.paymentTerms} days` : '-'} icon="calendar-clock" />
                <InfoRow label="Lead Time" value={supplier.leadTimeDays ? `${supplier.leadTimeDays} days` : '-'} icon="truck-delivery" />
            </Section>

            {/* Bank Details */}
            <Section title="Bank Details">
                <InfoRow label="Bank Name" value={supplier.bankName} icon="bank" />
                <InfoRow label="Account Number" value={supplier.bankAccountNumber} icon="credit-card" />
                <InfoRow label="IFSC Code" value={supplier.bankIfscCode} icon="barcode" />
                <InfoRow label="Branch" value={supplier.bankBranch} icon="bank" />
                <InfoRow label="UPI ID" value={supplier.upiId} icon="qrcode" />
            </Section>

            {/* Additional Info */}
            <Section title="Additional Information">
                <InfoRow label="Business Type" value={supplier.businessType} icon="domain" />
                <InfoRow label="Last Purchase" value={supplier.lastPurchaseDate ? formatDate(supplier.lastPurchaseDate) : 'Never'} icon="calendar" />
                <InfoRow label="Notes" value={supplier.notes} icon="note" />
            </Section>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => navigation.navigate('EditSupplier', { supplierId: supplier.id })}
                >
                    <Icon name="pencil" size={20} color={colors.background} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, supplier.isActive ? styles.deactivateButton : styles.activateButton]}
                    onPress={handleToggleStatus}
                >
                    <Icon name={supplier.isActive ? 'close-circle' : 'check-circle'} size={20} color={colors.background} />
                    <Text style={styles.actionButtonText}>
                        {supplier.isActive ? 'Deactivate' : 'Activate'}
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
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
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
    supplierName: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
        marginBottom: 4,
    },
    supplierCode: {
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
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        marginTop: 8,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    editButton: {
        backgroundColor: colors.primary[500],
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
});

export default SupplierDetailScreen;