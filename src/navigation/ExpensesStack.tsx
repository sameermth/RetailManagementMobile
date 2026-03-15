import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from './types';
import { colors } from '@theme/color';

// Import screens
import ExpenseListScreen from '@screens/expenses/ExpenseList';
import ExpenseDetailScreen from '@screens/expenses/ExpenseDetail';
import AddExpenseScreen from '@screens/expenses/AddExpense';
import CategoriesScreen from '@screens/expenses/Categories';
import RecurringExpensesScreen from '@screens/expenses/RecurringExpenses';

const Stack = createNativeStackNavigator<ExpensesStackParamList>();

const ExpensesStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text.primary,
                },
                headerTintColor: colors.primary[500],
                contentStyle: {
                    backgroundColor: colors.gray[50],
                },
            }}
        >
            <Stack.Screen
                name="ExpenseList"
                component={ExpenseListScreen}
                options={{ title: 'Expenses' }}
            />
            <Stack.Screen
                name="ExpenseDetail"
                component={ExpenseDetailScreen}
                options={{ title: 'Expense Details' }}
            />
            <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={{ title: 'Add Expense' }}
            />
            <Stack.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{ title: 'Expense Categories' }}
            />
            <Stack.Screen
                name="RecurringExpenses"
                component={RecurringExpensesScreen}
                options={{ title: 'Recurring Expenses' }}
            />
        </Stack.Navigator>
    );
};

export default ExpensesStack;