import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { useSales } from '@hooks/useSales';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { formatCurrency } from '@utils/formatters';
import { PAYMENT_METHODS } from '@utils/constants';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { totalAmount, saleId } = route.params as { totalAmount: number; saleId: number };

    const { clearCart } = useCart();
    const { createPayment, loading } = useSales();

    const [selectedMethod, setSelectedMethod] = useState('CASH');
    const [amount, setAmount] = useState(totalAmount.toString());
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');

    const handlePayment = async () => {
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        if (paymentAmount < totalAmount) {
            Alert.alert(
                'Partial Payment',
                `Remaining balance of ${formatCurrency(totalAmount - paymentAmount)} will be recorded as due. Continue?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: processPayment }
                ]
            );
        } else {
            processPayment();
        }
    };

    const processPayment = async () => {
        try {
            await createPayment({
                saleId,
                amount: parseFloat(amount),
                paymentMethod: selectedMethod,
                referenceNumber: reference || undefined,
                notes: notes || undefined,
            });

            clearCart();
            navigation.replace('Invoice', { saleId });
        } catch (error: any) {
            Alert.alert('Payment Failed', error.message || 'Could not process payment');
        }
    };

    const getChange = () => {
        const paid = parseFloat(amount) || 0;
        return paid > totalAmount ? paid - totalAmount : 0;
    };

    return (
        <ScrollView style={styles.container}>
            {/* Amount Summary */}
            <View style={styles.summaryCard}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>

                <View style={styles.divider} />

                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Paying</Text>
                    <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        placeholder="0.00"
                    />
                </View>

                {parseFloat(amount) > totalAmount && (
                    <View style={styles.changeRow}>
                        <Text style={styles.changeLabel}>Change Due</Text>
                        <Text style={styles.changeValue}>{formatCurrency(getChange())}</Text>
                    </View>
                )}
            </View>

            {/* Payment Methods */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.methodGrid}>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.methodCard,
                                selectedMethod === method.id && styles.methodCardSelected,
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <Icon
                                name={method.icon}
                                size={32}
                                color={selectedMethod === method.id ? colors.background : colors.gray[600]}
                            />
                            <Text style={[
                                styles.methodText,
                                selectedMethod === method.id && styles.methodTextSelected
                            ]}>
                                {method.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Reference (for card/cheque/upi) */}
            {(selectedMethod === 'CARD' || selectedMethod === 'CHEQUE' || selectedMethod === 'UPI') && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {selectedMethod === 'CARD' && 'Card Details'}
                        {selectedMethod === 'CHEQUE' && 'Cheque Details'}
                        {selectedMethod === 'UPI' && 'UPI Details'}
                    </Text>

                    {selectedMethod === 'CARD' && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Card Number"
                                value={reference}
                                onChangeText={setReference}
                                keyboardType="numeric"
                                maxLength={16}
                            />
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                                    placeholder="CVV"
                                    keyboardType="numeric"
                                    maxLength={3}
                                />
                            </View>
                        </>
                    )}

                    {selectedMethod === 'CHEQUE' && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="Cheque Number"
                                value={reference}
                                onChangeText={setReference}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Bank Name"
                            />
                        </>
                    )}

                    {selectedMethod === 'UPI' && (
                        <TextInput
                            style={styles.input}
                            placeholder="UPI ID (e.g., name@okhdfcbank)"
                            value={reference}
                            onChangeText={setReference}
                            autoCapitalize="none"
                        />
                    )}
                </View>
            )}

            {/* Notes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    placeholder="Add notes about this payment..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.payButton, loading && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    <Icon name="cash" size={20} color={colors.background} />
                    <Text style={styles.payButtonText}>Complete Payment</Text>
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
    summaryCard: {
        backgroundColor: colors.background,
        padding: 20,
        margin: 16,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    totalLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    totalValue: {
        fontSize: typography.fontSize['3xl'],
        fontFamily: typography.fontFamily.bold,
        color: colors.primary[500],
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    amountInput: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        minWidth: 120,
        textAlign: 'right',
    },
    changeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    changeLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    changeValue: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.bold,
        color: colors.success,
    },
    section: {
        backgroundColor: colors.background,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
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
    methodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    methodCard: {
        width: '30%',
        margin: '1.5%',
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        alignItems: 'center',
    },
    methodCardSelected: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    methodText: {
        fontSize: typography.fontSize.xs,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.secondary,
        marginTop: 4,
    },
    methodTextSelected: {
        color: colors.background,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.regular,
        color: colors.text.primary,
        marginBottom: 12,
    },
    notesInput: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 24,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: colors.gray[200],
    },
    cancelButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.text.primary,
    },
    payButton: {
        backgroundColor: colors.success,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    payButtonDisabled: {
        opacity: 0.6,
    },
    payButtonText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.background,
        marginLeft: 8,
    },
});

export default PaymentScreen;