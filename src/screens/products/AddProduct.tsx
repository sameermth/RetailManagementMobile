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
import { useNavigation } from '@react-navigation/native';
import { useProducts } from '@hooks/useProducts';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { UNITS_OF_MEASURE } from '@utils/constants';
import { Picker } from '@react-native-picker/picker';

const AddProductScreen = () => {
    const navigation = useNavigation();
    const { createProduct, loading } = useProducts();

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        categoryId: '',
        brandId: '',
        unitPrice: '',
        costPrice: '',
        gstRate: '',
        hsnCode: '',
        unitOfMeasure: 'PCS',
        reorderLevel: '',
        barcode: '',
        manufacturer: '',
        countryOfOrigin: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [showUnitPicker, setShowUnitPicker] = useState(false);

    useEffect(() => {
        loadCategoriesAndBrands();
    }, []);

    const loadCategoriesAndBrands = async () => {
        // TODO: Fetch categories and brands from API
        // This would be implemented when we have those APIs
        setCategories([
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Clothing' },
            { id: 3, name: 'Food & Beverages' },
        ]);
        setBrands([
            { id: 1, name: 'Samsung' },
            { id: 2, name: 'Apple' },
            { id: 3, name: 'Nike' },
        ]);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.sku) newErrors.sku = 'SKU is required';
        if (!formData.name) newErrors.name = 'Product name is required';
        if (!formData.unitPrice) {
            newErrors.unitPrice = 'Unit price is required';
        } else if (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) <= 0) {
            newErrors.unitPrice = 'Unit price must be a positive number';
        }
        if (formData.costPrice && (isNaN(Number(formData.costPrice)) || Number(formData.costPrice) < 0)) {
            newErrors.costPrice = 'Cost price must be a positive number';
        }
        if (formData.gstRate && (isNaN(Number(formData.gstRate)) || Number(formData.gstRate) < 0 || Number(formData.gstRate) > 100)) {
            newErrors.gstRate = 'GST rate must be between 0 and 100';
        }
        if (formData.reorderLevel && isNaN(Number(formData.reorderLevel))) {
            newErrors.reorderLevel = 'Reorder level must be a number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const productData = {
                sku: formData.sku,
                name: formData.name,
                description: formData.description || undefined,
                categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
                brandId: formData.brandId ? Number(formData.brandId) : undefined,
                unitPrice: Number(formData.unitPrice),
                costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
                gstRate: formData.gstRate ? Number(formData.gstRate) : undefined,
                hsnCode: formData.hsnCode || undefined,
                unitOfMeasure: formData.unitOfMeasure,
                reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
                barcode: formData.barcode || undefined,
                manufacturer: formData.manufacturer || undefined,
                countryOfOrigin: formData.countryOfOrigin || undefined,
            };

            await createProduct(productData);
            Alert.alert('Success', 'Product created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create product');
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

                    {renderInput('sku', 'SKU', 'Enter SKU', { required: true })}
                    {renderInput('name', 'Product Name', 'Enter product name', { required: true })}
                    {renderInput('description', 'Description', 'Enter product description', { multiline: true })}
                    {renderInput('barcode', 'Barcode', 'Enter barcode (optional)')}
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing</Text>

                    {renderInput('unitPrice', 'Unit Price', 'Enter unit price', {
                        required: true,
                        keyboardType: 'numeric'
                    })}

                    {renderInput('costPrice', 'Cost Price', 'Enter cost price (optional)', {
                        keyboardType: 'numeric'
                    })}

                    {renderInput('gstRate', 'GST Rate (%)', 'Enter GST rate (optional)', {
                        keyboardType: 'numeric'
                    })}

                    {renderInput('hsnCode', 'HSN Code', 'Enter HSN code (optional)')}
                </View>

                {/* Classification */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Classification</Text>

                    {/* Category Picker */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.categoryId}
                                onValueChange={(value) => updateForm('categoryId', value)}
                                enabled={!loading}
                            >
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((cat) => (
                                    <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Brand Picker */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Brand</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.brandId}
                                onValueChange={(value) => updateForm('brandId', value)}
                                enabled={!loading}
                            >
                                <Picker.Item label="Select Brand" value="" />
                                {brands.map((brand) => (
                                    <Picker.Item key={brand.id} label={brand.name} value={brand.id.toString()} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Unit of Measure Picker */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Unit of Measure</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.unitOfMeasure}
                                onValueChange={(value) => updateForm('unitOfMeasure', value)}
                                enabled={!loading}
                            >
                                {UNITS_OF_MEASURE.map((unit) => (
                                    <Picker.Item key={unit.id} label={unit.label} value={unit.id} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                </View>

                {/* Inventory */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory</Text>

                    {renderInput('reorderLevel', 'Reorder Level', 'Enter reorder level (optional)', {
                        keyboardType: 'numeric'
                    })}
                </View>

                {/* Additional Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>

                    {renderInput('manufacturer', 'Manufacturer', 'Enter manufacturer (optional)')}
                    {renderInput('countryOfOrigin', 'Country of Origin', 'Enter country (optional)')}
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
                        <Text style={styles.submitButtonText}>Create Product</Text>
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

export default AddProductScreen;