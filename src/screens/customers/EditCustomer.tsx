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
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCustomers } from '@hooks/useCustomers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { CUSTOMER_TYPES } from '@utils/constants';
import { validateEmail, validatePhone, validateGST, validatePAN, validatePinCode } from '@utils/validators';
import { Picker } from '@react-native-picker/picker';

const EditCustomerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { customerId } = route.params as { customerId: number };
    const { getCustomer, updateCustomer, loading } = useCustomers();

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
        customerType: 'INDIVIDUAL',
        creditLimit: '',
        paymentTerms: '',
        businessName: '',
        contactPerson: '',
        designation: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadCustomer();
    }, []);

    const loadCustomer = async () => {
        try {
            const customer = await getCustomer(customerId);
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                alternatePhone: customer.alternatePhone || '',
                address: customer.address || '',
                city: customer.city || '',
                state: customer.state || '',
                country: customer.country || '',
                pincode: customer.pincode || '',
                gstNumber: customer.gstNumber || '',
                panNumber: customer.panNumber || '',
                customerType: customer.customerType || 'INDIVIDUAL',
                creditLimit: customer.creditLimit?.toString() || '',
                paymentTerms: customer.paymentTerms?.toString() || '',
                businessName: customer.businessName || '',
                contactPerson: customer.contactPerson || '',
                designation: customer.designation || '',
                notes: customer.notes || '',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to load customer details');
            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = 'Customer name is required';

        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (formData.alternatePhone && !validatePhone(formData.alternatePhone)) {
            newErrors.alternatePhone = 'Alternate phone must be 10 digits';
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

        if (formData.creditLimit && (isNaN(Number(formData.creditLimit)) || Number(formData.creditLimit) < 0)) {
            newErrors.creditLimit = 'Credit limit must be a positive number';
        }

        if (formData.paymentTerms && (isNaN(Number(formData.paymentTerms)) || Number(formData.paymentTerms) < 0)) {
            newErrors.paymentTerms = 'Payment terms must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const customerData = {
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
                customerType: formData.customerType as any,
                creditLimit: formData.creditLimit ? Number(formData.creditLimit) : undefined,
                paymentTerms: formData.paymentTerms ? Number(formData.paymentTerms) : undefined,
                businessName: formData.businessName || undefined,
                contactPerson: formData.contactPerson || undefined,
                designation: formData.designation || undefined,
                notes: formData.notes || undefined,
            };

            await updateCustomer(customerId, customerData);
            Alert.alert('Success', 'Customer updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update customer');
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
                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Customer Name <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter customer name"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.name}
                                onChangeText={(value) => updateForm('name', value)}
                                editable={!loading}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Customer Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.customerType}
                                onValueChange={(value) => updateForm('customerType', value)}
                                enabled={!loading}
                            >
                                {CUSTOMER_TYPES.map((type) => (
                                    <Picker.Item key={type.id} label={type.label} value={type.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {formData.customerType === 'BUSINESS' && (
                        <>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Business Name</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter business name"
                                        placeholderTextColor={colors.gray[400]}
                                        value={formData.businessName}
                                        onChangeText={(value) => updateForm('businessName', value)}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

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
                                <Text style={styles.label}>Designation</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter designation"
                                        placeholderTextColor={colors.gray[400]}
                                        value={formData.designation}
                                        onChangeText={(value) => updateForm('designation', value)}
                                        editable={!loading}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter email address"
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
                        <Text style={styles.label}>Phone</Text>
                        <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 10-digit phone number"
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

                {/* Address Information */}
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
                        {errors.creditLimit && <Text style={styles.errorText}>{errors.creditLimit}</Text>}
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
                        {errors.paymentTerms && <Text style={styles.errorText}>{errors.paymentTerms}</Text>}
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
                        <Text style={styles.submitButtonText}>Update Customer</Text>
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

export default EditCustomerScreen;