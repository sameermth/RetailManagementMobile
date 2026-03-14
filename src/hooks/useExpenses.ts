import { useState, useCallback } from 'react';
import { expensesApi, Expense, ExpenseCategory, ExpenseRequest, RecurringExpense } from '@api/expenses';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    // Category methods
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.getCategories();
            setCategories(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (data: {name: string, description?: string, budgetAmount?: number}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.createCategory(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create category');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Expense methods
    const fetchExpenses = useCallback(async (page = 0, size = 20, categoryId?: number, status?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            let response;

            if (categoryId) {
                response = await expensesApi.getByCategory(categoryId, params);
            } else if (status) {
                response = await expensesApi.getByStatus(status, params);
            } else {
                response = await expensesApi.getAll(params);
            }

            if (Array.isArray(response.data)) {
                setExpenses(response.data);
                setTotalPages(1);
            } else {
                setExpenses(response.data.content);
                setTotalPages(response.data.totalPages);
                setCurrentPage(response.data.number);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    }, []);

    const getExpense = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getExpenseByNumber = useCallback(async (expenseNumber: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.getByNumber(expenseNumber);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch expense by number');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createExpense = useCallback(async (data: ExpenseRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateExpense = useCallback(async (id: number, data: ExpenseRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const approveExpense = useCallback(async (id: number, comments?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.approve(id, comments);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to approve expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const rejectExpense = useCallback(async (id: number, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.reject(id, reason);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reject expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsPaid = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.markAsPaid(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to mark expense as paid');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelExpense = useCallback(async (id: number, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            await expensesApi.cancel(id, reason);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Recurring expenses
    const fetchRecurringExpenses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.getRecurring();
            setRecurringExpenses(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch recurring expenses');
        } finally {
            setLoading(false);
        }
    }, []);

    const createRecurringExpense = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.createRecurring(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create recurring expense');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Stats
    const getExpenseSummary = useCallback(async (period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month') => {
        setLoading(true);
        setError(null);
        try {
            const response = await expensesApi.getSummary(period);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch expense summary');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPendingApprovalCount = useCallback(async () => {
        try {
            const response = await expensesApi.getPendingApprovalCount();
            return response.data;
        } catch (err: any) {
            return 0;
        }
    }, []);

    return {
        expenses,
        categories,
        recurringExpenses,
        loading,
        error,
        totalPages,
        currentPage,
        fetchCategories,
        createCategory,
        fetchExpenses,
        getExpense,
        getExpenseByNumber,
        createExpense,
        updateExpense,
        approveExpense,
        rejectExpense,
        markAsPaid,
        cancelExpense,
        fetchRecurringExpenses,
        createRecurringExpense,
        getExpenseSummary,
        getPendingApprovalCount,
    };
};