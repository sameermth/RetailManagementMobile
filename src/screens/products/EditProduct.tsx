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
import { useProducts } from '@hooks/useProducts';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { UNITS_OF_MEASURE } from '@utils/constants';
import { Picker } from '@react-native-picker/picker';

const EditProductScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params as { productId: number };
    const { getProduct, updateProduct, loading } = useProducts();

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
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadProductAndOptions();
    }, []);

    const loadProductAndOptions = async () => {
        try {
            // Load categories and brands
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

            // Load product data
            const product = await getProduct(productId);
            setFormData({
                sku: product.sku || '',
                name: product.name || '',
                description: product.description || '',
                categoryId: product.categoryId?.toString() || '',
                brandId: product.brandId?.toString() || '',
                unitPrice: product.unitPrice?.toString() || '',
                costPrice: product.costPrice?.toString() || '',
                gstRate: product.gstRate?.toString() || '',
                hsnCode: product.hsnCode || '',
                unitOfMeasure: product.unitOfMeasure || 'PCS',
                reorderLevel: product.reorderLevel?.toString() || '',
                barcode: product.barcode || '',
                manufacturer: product.manufacturer || '',
                countryOfOrigin: product.countryOfOrigin || '',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to load product details');
            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
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

            await updateProduct(productId, productData);
            Alert.alert('Success', 'Product updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update product');
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
                {/* Same form sections as AddProduct */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>SKU <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.sku && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter SKU"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.sku}
                                onChangeText={(value) => updateForm('sku', value)}
                                editable={!loading}
                            />
                        </View>
                        {errors.sku && <Text style={styles.errorText}>{errors.sku}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Product Name <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter product name"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.name}
                                onChangeText={(value) => updateForm('name', value)}
                                editable={!loading}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Description</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                placeholder="Enter product description"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.description}
                                onChangeText={(value) => updateForm('description', value)}
                                multiline
                                numberOfLines={3}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Barcode</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter barcode (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.barcode}
                                onChangeText={(value) => updateForm('barcode', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Pricing Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Unit Price <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.unitPrice && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter unit price"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.unitPrice}
                                onChangeText={(value) => updateForm('unitPrice', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                        {errors.unitPrice && <Text style={styles.errorText}>{errors.unitPrice}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Cost Price</Text>
                        <View style={[styles.inputContainer, errors.costPrice && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter cost price (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.costPrice}
                                onChangeText={(value) => updateForm('costPrice', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                        {errors.costPrice && <Text style={styles.errorText}>{errors.costPrice}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>GST Rate (%)</Text>
                        <View style={[styles.inputContainer, errors.gstRate && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter GST rate (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.gstRate}
                                onChangeText={(value) => updateForm('gstRate', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                        {errors.gstRate && <Text style={styles.errorText}>{errors.gstRate}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>HSN Code</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter HSN code (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.hsnCode}
                                onChangeText={(value) => updateForm('hsnCode', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Classification Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Classification</Text>

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

                {/* Inventory Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Reorder Level</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter reorder level (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.reorderLevel}
                                onChangeText={(value) => updateForm('reorderLevel', value)}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Additional Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Manufacturer</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter manufacturer (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.manufacturer}
                                onChangeText={(value) => updateForm('manufacturer', value)}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Country of Origin</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter country (optional)"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.countryOfOrigin}
                                onChangeText={(value) => updateForm('countryOfOrigin', value)}
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
                        <Text style={styles.submitButtonText}>Update Product</Text>
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

export default EditProductScreen;