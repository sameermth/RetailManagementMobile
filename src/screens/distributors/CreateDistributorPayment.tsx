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
import Icon from '../../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDistributors } from '@hooks/useDistributors';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { Picker } from '@react-native-picker/picker';

const CreateDistributorPaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { distributorId } = route.params as { distributorId: number };
    const { getDistributor, createPayment, fetchOrders, orders, loading } = useDistributors();

    const [distributor, setDistributor] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: '',
        bankName: '',
        chequeNumber: '',
        chequeDate: '',
        cardLastFour: '',
        cardType: '',
        upiId: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showOrderPicker, setShowOrderPicker] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const distData = await getDistributor(distributorId);
            setDistributor(distData);
            await fetchOrders(distributorId, 0, 50);
        } catch (error) {
            Alert.alert('Error', 'Failed to load distributor data');
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be a positive number';
        }

        if (formData.paymentMethod === 'CHEQUE') {
            if (!formData.chequeNumber) {
                newErrors.chequeNumber = 'Cheque number is required';
            }
            if (!formData.chequeDate) {
                newErrors.chequeDate = 'Cheque date is required';
            }
        }

        if (formData.paymentMethod === 'CARD') {
            if (!formData.cardLastFour || formData.cardLastFour.length !== 4) {
                newErrors.cardLastFour = 'Last 4 digits of card are required';
            }
        }

        if (formData.paymentMethod === 'UPI' && !formData.upiId) {
            newErrors.upiId = 'UPI ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const paymentData = {
                distributorId,
                orderId: selectedOrder?.id,
                amount: Number(formData.amount),
                paymentMethod: formData.paymentMethod,
                paymentDate: formData.paymentDate,
                transactionId: formData.transactionId || undefined,
                bankName: formData.bankName || undefined,
                chequeNumber: formData.chequeNumber || undefined,
                chequeDate: formData.chequeDate || undefined,
                cardLastFour: formData.cardLastFour || undefined,
                cardType: formData.cardType || undefined,
                upiId: formData.upiId || undefined,
                notes: formData.notes || undefined,
            };

            await createPayment(paymentData);
            Alert.alert('Success', 'Payment recorded successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to record payment');
        }
    };

    const renderOrderPicker = () => (
        <View style={styles.pickerOverlay}>
            <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Link to Order (Optional)</Text>
                <TouchableOpacity onPress={() => setShowOrderPicker(false)}>
                    <Icon name="close" size={24} color={colors.gray[600]} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.pickerList}>
                <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => {
                        setSelectedOrder(null);
                        setShowOrderPicker(false);
                    }}
                >
                    <Text style={styles.pickerItemName}>No Order (General Payment)</Text>
                </TouchableOpacity>
                {orders.map((order) => (
                    <TouchableOpacity
                        key={order.id}
                        style={styles.pickerItem}
                        onPress={() => {
                            setSelectedOrder(order);
                            setShowOrderPicker(false);
                            // Suggest the pending amount
                            if (order.pendingAmount > 0 && !formData.amount) {
                                setFormData({...formData, amount: order.pendingAmount.toString()});
                            }
                        }}
                    >
                        <View style={styles.pickerItemLeft}>
                            <Text style={styles.pickerItemName}>{order.orderNumber}</Text>
                            <Text style={styles.pickerItemDetail}>
                                Pending: {formatCurrency(order.pendingAmount)} | Total: {formatCurrency(order.totalAmount)}
                            </Text>
                        </View>
                        <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                            {order.status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING_APPROVAL': return colors.warning;
            case 'APPROVED': return colors.info;
            case 'PROCESSING': return colors.primary[500];
            case 'SHIPPED': return colors.info;
            case 'DELIVERED': return colors.success;
            case 'CANCELLED': return colors.error;
            default: return colors.gray[500];
        }
    };

    if (!distributor) {
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
                {/* Distributor Info */}
                <View style={styles.distributorCard}>
                    <Icon name="truck-delivery" size={24} color={colors.primary[500]} />
                    <View style={styles.distributorInfo}>
                        <Text style={styles.distributorName}>{distributor.name}</Text>
                        <Text style={styles.distributorCode}>Code: {distributor.distributorCode}</Text>
                    </View>
                    <Text style={styles.outstandingAmount}>
                        Outstanding: {formatCurrency(distributor.outstandingAmount || 0)}
                    </Text>
                </View>

                {/* Order Selection */}
                <TouchableOpacity
                    style={styles.orderSelector}
                    onPress={() => setShowOrderPicker(true)}
                >
                    <Icon name="package" size={20} color={colors.gray[500]} />
                    <Text style={styles.orderSelectorText}>
                        {selectedOrder ? `Order: ${selectedOrder.orderNumber}` : 'Link to an order (optional)'}
                    </Text>
                    <Icon name="chevron-down" size={20} color={colors.gray[400]} />
                </TouchableOpacity>

                {/* Amount */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Amount <Text style={styles.requiredStar}>*</Text></Text>
                        <View style={[styles.inputContainer, errors.amount && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.gray[400]}
                                value={formData.amount}
                                onChangeText={(value) => setFormData({...formData, amount: value})}
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>
                        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Payment Method</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.paymentMethod}
                                onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                                enabled={!loading}
                            >
                                <Picker.Item label="Bank Transfer" value="BANK_TRANSFER" />
                                <Picker.Item label="Cheque" value="CHEQUE" />
                                <Picker.Item label="Cash" value="CASH" />
                                <Picker.Item label="Card" value="CARD" />
                                <Picker.Item label="UPI" value="UPI" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Payment Date</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={colors.gray[400]}
                            value={formData.paymentDate}
                            onChangeText={(value) => setFormData({...formData, paymentDate: value})}
                        />
                    </View>
                </View>

                {/* Method-specific fields */}
                {formData.paymentMethod === 'BANK_TRANSFER' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Transaction ID / Reference"
                            value={formData.transactionId}
                            onChangeText={(value) => setFormData({...formData, transactionId: value})}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Bank Name"
                            value={formData.bankName}
                            onChangeText={(value) => setFormData({...formData, bankName: value})}
                        />
                    </View>
                )}

                {formData.paymentMethod === 'CHEQUE' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cheque Details</Text>
                        <View style={[styles.inputWrapper, errors.chequeNumber && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Cheque Number"
                                value={formData.chequeNumber}
                                onChangeText={(value) => setFormData({...formData, chequeNumber: value})}
                            />
                        </View>
                        {errors.chequeNumber && <Text style={styles.errorText}>{errors.chequeNumber}</Text>}

                        <View style={[styles.inputWrapper, errors.chequeDate && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Cheque Date (YYYY-MM-DD)"
                                value={formData.chequeDate}
                                onChangeText={(value) => setFormData({...formData, chequeDate: value})}
                            />
                        </View>
                        {errors.chequeDate && <Text style={styles.errorText}>{errors.chequeDate}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Bank Name"
                            value={formData.bankName}
                            onChangeText={(value) => setFormData({...formData, bankName: value})}
                        />
                    </View>
                )}

                {formData.paymentMethod === 'CARD' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Card Details</Text>
                        <View style={[styles.inputWrapper, errors.cardLastFour && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Last 4 digits"
                                value={formData.cardLastFour}
                                onChangeText={(value) => setFormData({...formData, cardLastFour: value})}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>
                        {errors.cardLastFour && <Text style={styles.errorText}>{errors.cardLastFour}</Text>}

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Card Type</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.cardType}
                                    onValueChange={(value) => setFormData({...formData, cardType: value})}
                                >
                                    <Picker.Item label="Visa" value="VISA" />
                                    <Picker.Item label="Mastercard" value="MASTERCARD" />
                                    <Picker.Item label="Amex" value="AMEX" />
                                    <Picker.Item label="RuPay" value="RUPAY" />
                                    <Picker.Item label="Other" value="OTHER" />
                                </Picker>
                            </View>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Transaction ID (optional)"
                            value={formData.transactionId}
                            onChangeText={(value) => setFormData({...formData, transactionId: value})}
                        />
                    </View>
                )}

                {formData.paymentMethod === 'UPI' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>UPI Details</Text>
                        <View style={[styles.inputWrapper, errors.upiId && styles.inputError]}>
                            <TextInput
                                style={styles.input}
                                placeholder="UPI ID (e.g., name@okhdfcbank)"
                                value={formData.upiId}
                                onChangeText={(value) => setFormData({...formData, upiId: value})}
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.upiId && <Text style={styles.errorText}>{errors.upiId}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Transaction ID / Reference (optional)"
                            value={formData.transactionId}
                            onChangeText={(value) => setFormData({...formData, transactionId: value})}
                        />
                    </View>
                )}

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        placeholder="Add any notes about this payment..."
                        value={formData.notes}
                        onChangeText={(value) => setFormData({...formData, notes: value})}
                        multiline
                        numberOfLines={3}
                    />
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
                        <Text style={styles.submitButtonText}>Record Payment</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Order Picker */}
            {showOrderPicker && renderOrderPicker()}
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
    distributorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    distributorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    distributorName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        marginBottom: 2,
    },
    distributorCode: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    outstandingAmount: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.warning,
    },
    orderSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    orderSelectorText: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        marginLeft: 8,
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
        marginBottom: 12,
    },
    inputWrapper: {
        marginBottom: 12,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 4,
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
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        marginBottom: 8,
    },
    notesInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.regular,
        color: colors.error,
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        marginBottom: 8,
    },
    submitButton: {
        backgroundColor: colors.success,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
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
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'ios' ? 50 : 0,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerTitle: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
    },
    pickerList: {
        flex: 1,
    },
    pickerItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerItemLeft: {
        marginBottom: 4,
    },
    pickerItemName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
        marginBottom: 2,
    },
    pickerItemDetail: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
    },
    orderStatus: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.medium,
    },
});

export default CreateDistributorPaymentScreen;