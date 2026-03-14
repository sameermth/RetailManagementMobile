import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSuppliers } from '@hooks/useSuppliers';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { validateEmail, validatePhone, validateGST, validatePAN, validatePinCode } from '@utils/validators';
import { Picker } from '@react-native-picker/picker';

const EditSupplierScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { supplierId } = route.params as { supplierId: number };
    const { getSupplier, updateSupplier, loading } = useSuppliers();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
        gstNumber: '',
        panNumber: '',
        contactPerson: '',
        contactPersonPhone: '',
        contactPersonEmail: '',
        creditLimit: '',
        paymentTerms: '',
        paymentMethod: 'BANK_TRANSFER',
        bankName: '',
        bankAccountNumber: '',
        bankIfscCode: '',
        bankBranch: '',
        upiId: '',
        taxType: 'GST',
        taxRegistrationNumber: '',
        businessType: '',
        leadTimeDays: '',
        minimumOrderValue: '',
        maximumOrderValue: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadSupplier();
    }, []);

    const loadSupplier = async () => {
        try {
            const supplier = await getSupplier(supplierId);
            setFormData({
                name: supplier.name || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                alternatePhone: supplier.alternatePhone || '',
                address: supplier.address || '',
                city: supplier.city || '',
                state: supplier.state || '',
                country: supplier.country || '',
                pincode: supplier.pincode || '',
                gstNumber: supplier.gstNumber || '',
                panNumber: supplier.panNumber || '',
                contactPerson: supplier.contactPerson || '',
                contactPersonPhone: supplier.contactPersonPhone || '',
                contactPersonEmail: supplier.contactPersonEmail || '',
                creditLimit: supplier.creditLimit?.toString() || '',
                paymentTerms: supplier.paymentTerms?.toString() || '',
                paymentMethod: supplier.paymentMethod || 'BANK_TRANSFER',
                bankName: supplier.bankName || '',
                bankAccountNumber: supplier.bankAccountNumber || '',
                bankIfscCode: supplier.bankIfscCode || '',
                bankBranch: supplier.bankBranch || '',
                upiId: supplier.upiId || '',
                taxType: supplier.taxType || 'GST',
                taxRegistrationNumber: supplier.taxRegistrationNumber || '',
                businessType: supplier.businessType || '',
                leadTimeDays: supplier.leadTimeDays?.toString() || '',
                minimumOrderValue: supplier.minimumOrderValue?.toString() || '',
                maximumOrderValue: supplier.maximumOrderValue?.toString() || '',
                notes: supplier.notes || '',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to load supplier details');
            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = 'Supplier name is required';

        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (formData.alternatePhone && !validatePhone(formData.alternatePhone)) {
            newErrors.alternatePhone = 'Alternate phone must be 10 digits';
        }

        if (formData.contactPersonPhone && !validatePhone(formData.contactPersonPhone)) {
            newErrors.contactPersonPhone = 'Contact person phone must be 10 digits';
        }

        if (formData.gstNumber && !validateGST(formData.gstNumber)) {
            newErrors.gstNumber = 'Invalid GST format';
        }

        if (formData.panNumber && !validatePAN(formData.panNumber)) {
            newErrors.panNumber = 'Invalid PAN format';
        }

        if (formData.pincode && !validatePinCode(formData.pincode)) {
            newErrors.pincode = 'Invalid pincode (6 digits required)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const supplierData = {
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                alternatePhone: formData.alternatePhone || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                country: formData.country || undefined,
                pincode: formData.pincode || undefined,
                gstNumber: formData.gstNumber || undefined,
                panNumber: formData.panNumber || undefined,
                contactPerson: formData.contactPerson || undefined,
                contactPersonPhone: formData.contactPersonPhone || undefined,
                contactPersonEmail: formData.contactPersonEmail || undefined,
                creditLimit: formData.creditLimit ? Number(formData.creditLimit) : undefined,
                paymentTerms: formData.paymentTerms ? Number(formData.paymentTerms) : undefined,
                paymentMethod: formData.paymentMethod,
                bankName: formData.bankName || undefined,
                bankAccountNumber: formData.bankAccountNumber || undefined,
                bankIfscCode: formData.bankIfscCode || undefined,
                bankBranch: formData.bankBranch || undefined,
                upiId: formData.upiId || undefined,
                taxType: formData.taxType,
                taxRegistrationNumber: formData.taxRegistrationNumber || undefined,
                businessType: formData.businessType || undefined,
                leadTimeDays: formData.leadTimeDays ? Number(formData.leadTimeDays) : undefined,
                minimumOrderValue: formData.minimumOrderValue ? Number(formData.minimumOrderValue) : undefined,
                maximumOrderValue: formData.maximumOrderValue ? Number(formData.maximumOrderValue) : undefined,
                notes: formData.notes || undefined,
            };

            await updateSupplier(supplierId, supplierData);
            Alert.alert('Success', 'Supplier updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update supplier');
        }
    };

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
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
                {/* Same form sections as AddSupplier */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Supplier Name <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter supplier name"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.name}
                                onChangeText={(value) => updateForm('name', value)}
                                editable={!loading}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Business Type</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter business type"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.businessType}
                                onChangeText={(value) => updateForm('businessType', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Contact Person</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter contact person name"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.contactPerson}
                                onChangeText={(value) => updateForm('contactPerson', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Contact Person Phone</Text>
                        <View style={[styles.inputContainer, errors.contactPersonPhone && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 10-digit phone"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.contactPersonPhone}
                                onChangeText={(value) => updateForm('contactPersonPhone', value)}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!loading}
                            />
                        </View>
                        {errors.contactPersonPhone && <Text style={styles.errorText}>{errors.contactPersonPhone}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Contact Person Email</Text>
                        <View style={[styles.inputContainer, errors.contactPersonEmail && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email address"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.contactPersonEmail}
                                onChangeText={(value) => updateForm('contactPersonEmail', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Company Email</Text>
                        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter company email"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.email}
                                onChangeText={(value) => updateForm('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Company Phone</Text>
                        <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 10-digit phone"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.phone}
                                onChangeText={(value) => updateForm('phone', value)}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!loading}
                            />
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Alternate Phone</Text>
                        <View style={[styles.inputContainer, errors.alternatePhone && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter alternate phone"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.alternatePhone}
                                onChangeText={(value) => updateForm('alternatePhone', value)}
                                keyboardType="phone-pad"
                                maxLength={10}
                                editable={!loading}
                            />
                        </View>
                        {errors.alternatePhone && <Text style={styles.errorText}>{errors.alternatePhone}</Text>}
                    </View>
                </View>

                {/* Address Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Street Address</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Enter street address"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.address}
                                onChangeText={(value) => updateForm('address', value)}
                                multiline
                                numberOfLines={3}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>City</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter city"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.city}
                                    onChangeText={(value) => updateForm('city', value)}
                                    editable={!loading}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>State</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter state"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.state}
                                    onChangeText={(value) => updateForm('state', value)}
                                    editable={!loading}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Country</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter country"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.country}
                                    onChangeText={(value) => updateForm('country', value)}
                                    editable={!loading}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Pincode</Text>
                            <View style={[styles.inputContainer, errors.pincode && styles.inputError]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter pincode"
                                    placeholderTextColor={colors.gray[400]}
                                    value={formData.pincode}
                                    onChangeText={(value) => updateForm('pincode', value)}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    editable={!loading}
                                />
                            </View>
                            {errors.pincode && <Text style={styles.errorText}>{errors.pincode}</Text>}
                        </View>
                    </View>
                </View>

                {/* Tax Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tax Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>GST Number</Text>
                        <View style={[styles.inputContainer, errors.gstNumber && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter GST number"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.gstNumber}
                                onChangeText={(value) => updateForm('gstNumber', value)}
                                autoCapitalize="characters"
                                maxLength={15}
                                editable={!loading}
                            />
                        </View>
                        {errors.gstNumber && <Text style={styles.errorText}>{errors.gstNumber}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>PAN Number</Text>
                        <View style={[styles.inputContainer, errors.panNumber && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter PAN number"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.panNumber}
                                onChangeText={(value) => updateForm('panNumber', value)}
                                autoCapitalize="characters"
                                maxLength={10}
                                editable={!loading}
                            />
                        </View>
                        {errors.panNumber && <Text style={styles.errorText}>{errors.panNumber}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Tax Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.taxType}
                                onValueChange={(value) => updateForm('taxType', value)}
                                enabled={!loading}
                            >
                                <Picker.Item label="GST" value="GST" />
                                <Picker.Item label="VAT" value="VAT" />
                                <Picker.Item label="Sales Tax" value="SALES_TAX" />
                                <Picker.Item label="None" value="NONE" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Tax Registration Number</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter tax registration number"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.taxRegistrationNumber}
                                onChangeText={(value) => updateForm('taxRegistrationNumber', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Business Terms */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Terms</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Credit Limit</Text>
                        <View style={[styles.inputContainer, errors.creditLimit && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter credit limit"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.creditLimit}
                                onChangeText={(value) => updateForm('creditLimit', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Payment Terms (days)</Text>
                        <View style={[styles.inputContainer, errors.paymentTerms && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter payment terms in days"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.paymentTerms}
                                onChangeText={(value) => updateForm('paymentTerms', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Payment Method</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.paymentMethod}
                                onValueChange={(value) => updateForm('paymentMethod', value)}
                                enabled={!loading}
                            >
                                <Picker.Item label="Bank Transfer" value="BANK_TRANSFER" />
                                <Picker.Item label="Cheque" value="CHEQUE" />
                                <Picker.Item label="Cash" value="CASH" />
                                <Picker.Item label="UPI" value="UPI" />
                                <Picker.Item label="Credit" value="CREDIT" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Lead Time (days)</Text>
                        <View style={[styles.inputContainer, errors.leadTimeDays && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter average delivery time"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.leadTimeDays}
                                onChangeText={(value) => updateForm('leadTimeDays', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Minimum Order Value</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter minimum order value"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.minimumOrderValue}
                                onChangeText={(value) => updateForm('minimumOrderValue', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Maximum Order Value</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter maximum order value"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.maximumOrderValue}
                                onChangeText={(value) => updateForm('maximumOrderValue', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Bank Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Details</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Bank Name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter bank name"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.bankName}
                                onChangeText={(value) => updateForm('bankName', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Account Number</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account number"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.bankAccountNumber}
                                onChangeText={(value) => updateForm('bankAccountNumber', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>IFSC Code</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter IFSC code"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.bankIfscCode}
                                onChangeText={(value) => updateForm('bankIfscCode', value)}
                                autoCapitalize="characters"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Branch</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter branch name"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.bankBranch}
                                onChangeText={(value) => updateForm('bankBranch', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>UPI ID</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter UPI ID"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.upiId}
                                onChangeText={(value) => updateForm('upiId', value)}
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Additional Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Notes</Text>

                    <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Enter any additional notes"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.notes}
                                onChangeText={(value) => updateForm('notes', value)}
                                multiline
                                numberOfLines={3}
                                editable={!loading}
                            />
                        </View>
                    </View>
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
                        <Text style={styles.submitButtonText}>Update Supplier</Text>
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
    },
    inputError: {
        borderColor: colors.error,
    },
    input: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        paddingHorizontal: 12,
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
        marginLeft: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        overflow: 'hidden',
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

export default EditSupplierScreen;