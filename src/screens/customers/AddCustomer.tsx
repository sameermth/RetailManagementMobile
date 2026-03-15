import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useCustomers } from '@hooks/useCustomers';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { CUSTOMER_TYPES } from '@utils/constants';
import { validateEmail, validatePhone, validateGST, validatePAN, validatePinCode } from '@utils/validators';
import { Picker } from '@react-native-picker/picker';

const AddCustomerScreen = () => {
    const navigation = useNavigation();
    const { createCustomer, loading } = useCustomers();

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

            await createCustomer(customerData);
            Alert.alert('Success', 'Customer created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create customer');
        }
    };

    const updateForm = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const renderInput = (
        key: string,
        label: string,
        placeholder: string,
        options?: {
            keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
            multiline?: boolean;
            required?: boolean;
            autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
        }
    ) => (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>
                {label} {options?.required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <View style={[styles.inputContainer, errors[key] && styles.inputError]}>
                <TextInput
                    style={[styles.input, options?.multiline && styles.multilineInput]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.gray[400]}
                    value={formData[key]}
                    onChangeText={(value) => updateForm(key, value)}
                    keyboardType={options?.keyboardType || 'default'}
                    multiline={options?.multiline}
                    numberOfLines={options?.multiline ? 3 : 1}
                    autoCapitalize={options?.autoCapitalize || 'sentences'}
                    editable={!loading}
                />
            </View>
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
        </View>
    );

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

                    {renderInput('name', 'Customer Name', 'Enter customer name', { required: true })}

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
                            {renderInput('businessName', 'Business Name', 'Enter business name')}
                            {renderInput('contactPerson', 'Contact Person', 'Enter contact person name')}
                            {renderInput('designation', 'Designation', 'Enter designation')}
                        </>
                    )}
                </View>

                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {renderInput('email', 'Email', 'Enter email address', {
                        keyboardType: 'email-address',
                        autoCapitalize: 'none'
                    })}

                    {renderInput('phone', 'Phone', 'Enter 10-digit phone number', {
                        keyboardType: 'phone-pad',
                        maxLength: 10
                    })}

                    {renderInput('alternatePhone', 'Alternate Phone', 'Enter alternate phone', {
                        keyboardType: 'phone-pad',
                        maxLength: 10
                    })}
                </View>

                {/* Address Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    {renderInput('address', 'Street Address', 'Enter street address', { multiline: true })}

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter city"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.city}
                                onChangeText={(value) => updateForm('city', value)}
                                editable={!loading}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>State</Text>
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

                    <View style={styles.row}>
                        <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter country"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.country}
                                onChangeText={(value) => updateForm('country', value)}
                                editable={!loading}
                            />
                        </View>
                        <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Pincode</Text>
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
                    </View>
                </View>

                {/* Tax Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tax Information</Text>

                    {renderInput('gstNumber', 'GST Number', 'Enter GST number', {
                        autoCapitalize: 'characters',
                        maxLength: 15
                    })}

                    {renderInput('panNumber', 'PAN Number', 'Enter PAN number', {
                        autoCapitalize: 'characters',
                        maxLength: 10
                    })}
                </View>

                {/* Business Terms */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Terms</Text>

                    {renderInput('creditLimit', 'Credit Limit', 'Enter credit limit', {
                        keyboardType: 'numeric'
                    })}

                    {renderInput('paymentTerms', 'Payment Terms (days)', 'Enter payment terms in days', {
                        keyboardType: 'numeric'
                    })}
                </View>

                {/* Additional Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Notes</Text>

                    {renderInput('notes', 'Notes', 'Enter any additional notes', { multiline: true })}
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
                        <Text style={styles.submitButtonText}>Create Customer</Text>
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

export default AddCustomerScreen;