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
import { useNavigation } from '@react-navigation/native';
import { useExpenses } from '@hooks/useExpenses';
import { useAuth } from '@hooks/useAuth';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { PAYMENT_METHODS } from '@utils/constants';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddExpenseScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { categories, createExpense, loading, fetchCategories } = useExpenses();

    const [formData, setFormData] = useState({
        categoryId: '',
        description: '',
        amount: '',
        expenseDate: new Date(),
        paymentMethod: 'CASH',
        vendor: '',
        vendorInvoiceNumber: '',
        referenceNumber: '',
        notes: '',
        isReimbursable: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        await fetchCategories();
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be a positive number';
        }
        if (!formData.expenseDate) {
            newErrors.expenseDate = 'Expense date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const expenseData = {
                categoryId: Number(formData.categoryId),
                description: formData.description.trim(),
                amount: Number(formData.amount),
                expenseDate: formData.expenseDate.toISOString().split('T')[0],
                paymentMethod: formData.paymentMethod as any,
                vendor: formData.vendor.trim() || undefined,
                vendorInvoiceNumber: formData.vendorInvoiceNumber.trim() || undefined,
                referenceNumber: formData.referenceNumber.trim() || undefined,
                notes: formData.notes.trim() || undefined,
                isReimbursable: formData.isReimbursable,
                userId: user?.id,
            };

            await createExpense(expenseData);
            Alert.alert('Success', 'Expense created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create expense');
        }
    };

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            updateForm('expenseDate', selectedDate);
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
                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Category <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View style={[styles.pickerContainer, errors.categoryId && styles.inputError]}>
                        <Picker
                            selectedValue={formData.categoryId}
                            onValueChange={(value) => updateForm('categoryId', value)}
                            enabled={!loading}
                        >
                            <Picker.Item label="Select a category" value="" />
                            {categories.map((cat) => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                            ))}
                        </Picker>
                    </View>
                    {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    {renderInput('description', 'Description', 'Enter expense description', {
                        required: true,
                        multiline: true
                    })}
                </View>

                {/* Amount */}
                <View style={styles.section}>
                    {renderInput('amount', 'Amount', 'Enter amount', {
                        required: true,
                        keyboardType: 'numeric'
                    })}
                </View>

                {/* Date */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Expense Date <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.dateButton, errors.expenseDate && styles.inputError]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>
                            {formData.expenseDate.toLocaleDateString()}
                        </Text>
                        <Icon name="calendar" size={20} color={colors.gray[500]} />
                    </TouchableOpacity>
                    {errors.expenseDate && <Text style={styles.errorText}>{errors.expenseDate}</Text>}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <Text style={styles.label}>Payment Method</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formData.paymentMethod}
                            onValueChange={(value) => updateForm('paymentMethod', value)}
                            enabled={!loading}
                        >
                            {PAYMENT_METHODS.map((method) => (
                                <Picker.Item key={method.id} label={method.label} value={method.id} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Vendor Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vendor Details (Optional)</Text>

                    {renderInput('vendor', 'Vendor Name', 'Enter vendor name')}
                    {renderInput('vendorInvoiceNumber', 'Vendor Invoice #', 'Enter invoice number')}
                    {renderInput('referenceNumber', 'Reference #', 'Enter reference number')}
                </View>

                {/* Reimbursable Toggle */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.toggleContainer}
                        onPress={() => updateForm('isReimbursable', !formData.isReimbursable)}
                    >
                        <View style={styles.toggleLeft}>
                            <Icon
                                name="cash-refund"
                                size={24}
                                color={formData.isReimbursable ? colors.success : colors.gray[400]}
                            />
                            <Text style={styles.toggleLabel}>This is a reimbursable expense</Text>
                        </View>
                        <View style={[
                            styles.toggleSwitch,
                            formData.isReimbursable && styles.toggleSwitchActive
                        ]}>
                            <View style={[
                                styles.toggleKnob,
                                formData.isReimbursable && styles.toggleKnobActive
                            ]} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    {renderInput('notes', 'Additional Notes', 'Enter any additional notes', {
                        multiline: true
                    })}
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
                        <Text style={styles.submitButtonText}>Create Expense</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={formData.expenseDate}
                    mode="date"
                    onChange={onDateChange}
                />
            )}
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
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 12,
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
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.surface,
    },
    dateButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        marginLeft: 12,
    },
    toggleSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.gray[300],
        padding: 2,
    },
    toggleSwitchActive: {
        backgroundColor: colors.success,
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.background,
    },
    toggleKnobActive: {
        transform: [{ translateX: 22 }],
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

export default AddExpenseScreen;