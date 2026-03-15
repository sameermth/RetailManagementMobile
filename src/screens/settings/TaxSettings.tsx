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
    FlatList,
    Switch,
} from 'react-native';
import Icon from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';

interface Tax {
    id: string;
    name: string;
    rate: number;
    isDefault: boolean;
    applicableOn: 'ALL' | 'SALES' | 'PURCHASES';
    description?: string;
}

const TaxSettingsScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTax, setEditingTax] = useState<Tax | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        applicableOn: 'ALL' as const,
        description: '',
    });

    useEffect(() => {
        loadTaxes();
    }, []);

    const loadTaxes = async () => {
        setLoading(true);
        try {
            // Mock data - replace with API call
            setTaxes([
                { id: '1', name: 'GST 5%', rate: 5, isDefault: false, applicableOn: 'ALL' },
                { id: '2', name: 'GST 12%', rate: 12, isDefault: true, applicableOn: 'ALL' },
                { id: '3', name: 'GST 18%', rate: 18, isDefault: false, applicableOn: 'ALL' },
                { id: '4', name: 'GST 28%', rate: 28, isDefault: false, applicableOn: 'ALL' },
                { id: '5', name: 'IGST 5%', rate: 5, isDefault: false, applicableOn: 'SALES' },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to load tax settings');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTax = () => {
        if (!formData.name || !formData.rate) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const rate = parseFloat(formData.rate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            Alert.alert('Error', 'Rate must be between 0 and 100');
            return;
        }

        const newTax: Tax = {
            id: Date.now().toString(),
            name: formData.name,
            rate,
            isDefault: false,
            applicableOn: formData.applicableOn,
            description: formData.description,
        };

        setTaxes([...taxes, newTax]);
        resetForm();
        Alert.alert('Success', 'Tax added successfully');
    };

    const handleUpdateTax = () => {
        if (!editingTax) return;
        if (!formData.name || !formData.rate) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const rate = parseFloat(formData.rate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            Alert.alert('Error', 'Rate must be between 0 and 100');
            return;
        }

        const updatedTaxes = taxes.map(tax =>
            tax.id === editingTax.id
                ? {
                    ...tax,
                    name: formData.name,
                    rate,
                    applicableOn: formData.applicableOn,
                    description: formData.description
                }
                : tax
        );

        setTaxes(updatedTaxes);
        resetForm();
        Alert.alert('Success', 'Tax updated successfully');
    };

    const handleDeleteTax = (id: string) => {
        Alert.alert(
            'Delete Tax',
            'Are you sure you want to delete this tax rate?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setTaxes(taxes.filter(tax => tax.id !== id));
                        if (editingTax?.id === id) {
                            resetForm();
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = (id: string) => {
        setTaxes(taxes.map(tax => ({
            ...tax,
            isDefault: tax.id === id,
        })));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            rate: '',
            applicableOn: 'ALL',
            description: '',
        });
        setEditingTax(null);
        setShowAddForm(false);
    };

    const editTax = (tax: Tax) => {
        setEditingTax(tax);
        setFormData({
            name: tax.name,
            rate: tax.rate.toString(),
            applicableOn: tax.applicableOn,
            description: tax.description || '',
        });
        setShowAddForm(true);
    };

    const renderTaxItem = ({ item }: { item: Tax }) => (
        <View style={styles.taxCard}>
            <View style={styles.taxHeader}>
                <View style={styles.taxInfo}>
                    <Text style={styles.taxName}>{item.name}</Text>
                    <Text style={styles.taxRate}>{item.rate}%</Text>
                </View>
                {item.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                    </View>
                )}
            </View>

            <Text style={styles.applicableText}>
                Applicable on: {item.applicableOn}
            </Text>
            {item.description && (
                <Text style={styles.descriptionText}>{item.description}</Text>
            )}

            <View style={styles.taxActions}>
                {!item.isDefault && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.defaultButton]}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Icon name="star" size={16} color={colors.warning} />
                        <Text style={styles.actionButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => editTax(item)}
                >
                    <Icon name="pencil" size={16} color={colors.primary[500]} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteTax(item.id)}
                >
                    <Icon name="delete" size={16} color={colors.error} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tax Settings</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddForm(!showAddForm)}
                >
                    <Icon name={showAddForm ? 'close' : 'plus'} size={24} color={colors.background} />
                </TouchableOpacity>
            </View>

            {/* Add/Edit Form */}
            {showAddForm && (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>
                        {editingTax ? 'Edit Tax' : 'Add New Tax'}
                    </Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Tax Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., GST 18%"
                            value={formData.name}
                            onChangeText={(value) => setFormData({...formData, name: value})}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Tax Rate (%) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter rate"
                            value={formData.rate}
                            onChangeText={(value) => setFormData({...formData, rate: value})}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Applicable On</Text>
                        <View style={styles.pickerContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    formData.applicableOn === 'ALL' && styles.optionButtonActive,
                                ]}
                                onPress={() => setFormData({...formData, applicableOn: 'ALL'})}
                            >
                                <Text style={[
                                    styles.optionText,
                                    formData.applicableOn === 'ALL' && styles.optionTextActive,
                                ]}>All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    formData.applicableOn === 'SALES' && styles.optionButtonActive,
                                ]}
                                onPress={() => setFormData({...formData, applicableOn: 'SALES'})}
                            >
                                <Text style={[
                                    styles.optionText,
                                    formData.applicableOn === 'SALES' && styles.optionTextActive,
                                ]}>Sales Only</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.optionButton,
                                    formData.applicableOn === 'PURCHASES' && styles.optionButtonActive,
                                ]}
                                onPress={() => setFormData({...formData, applicableOn: 'PURCHASES'})}
                            >
                                <Text style={[
                                    styles.optionText,
                                    formData.applicableOn === 'PURCHASES' && styles.optionTextActive,
                                ]}>Purchases Only</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder="Enter description"
                            value={formData.description}
                            onChangeText={(value) => setFormData({...formData, description: value})}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.formActions}>
                        <TouchableOpacity
                            style={[styles.formButton, styles.cancelButton]}
                            onPress={resetForm}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.formButton, styles.saveButton]}
                            onPress={editingTax ? handleUpdateTax : handleAddTax}
                        >
                            <Text style={styles.saveButtonText}>
                                {editingTax ? 'Update' : 'Add'} Tax
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Tax List */}
            <FlatList
                data={taxes}
                renderItem={renderTaxItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="percent" size={48} color={colors.gray[300]} />
                        <Text style={styles.emptyStateTitle}>No Tax Rates</Text>
                        <Text style={styles.emptyStateText}>
                            Add your first tax rate to get started
                        </Text>
                    </View>
                }
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.text.primary,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        backgroundColor: colors.background,
        padding: 16,
        margin: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
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
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        backgroundColor: colors.surface,
    },
    multilineInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        marginHorizontal: 2,
        alignItems: 'center',
    },
    optionButtonActive: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    optionText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    optionTextActive: {
        color: colors.background,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    formButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: colors.gray[200],
    },
    cancelButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
    },
    saveButton: {
        backgroundColor: colors.primary[500],
    },
    saveButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
    },
    listContent: {
        padding: 16,
    },
    taxCard: {
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
    taxHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taxInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    taxName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginRight: 12,
    },
    taxRate: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
    },
    defaultBadge: {
        backgroundColor: colors.warning + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    defaultText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.warning,
    },
    applicableText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 12,
    },
    taxActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginLeft: 8,
    },
    defaultButton: {
        backgroundColor: colors.warning + '10',
    },
    editButton: {
        backgroundColor: colors.primary[50],
    },
    deleteButton: {
        backgroundColor: colors.error + '10',
    },
    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
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
});

export default TaxSettingsScreen;