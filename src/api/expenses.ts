import apiClient from './client';

export interface ExpenseCategory {
    id: number;
    categoryCode: string;
    name: string;
    description?: string;
    type?: string;
    parentCategoryId?: number;
    budgetAmount?: number;
    allocatedAmount: number;
    isActive: boolean;
}

export interface Expense {
    id: number;
    expenseNumber: string;
    categoryId: number;
    categoryName: string;
    expenseDate: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    status: string;
    vendor?: string;
    vendorInvoiceNumber?: string;
    notes?: string;
    receiptUrl?: string;
}

export interface ExpenseRequest {
    categoryId: number;
    expenseDate: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    vendor?: string;
    vendorInvoiceNumber?: string;
    notes?: string;
    isReimbursable?: boolean;
}

export interface RecurringExpense {
    id: number;
    recurringExpenseNumber: string;
    categoryId: number;
    description: string;
    amount: number;
    frequency: string;
    startDate: string;
    endDate?: string;
    nextGenerationDate: string;
    isActive: boolean;
}

export const expensesApi = {
    // Categories
    getCategories: () =>
        apiClient.get<ExpenseCategory[]>('/expense-categories'),

    createCategory: (data: {name: string, description?: string, budgetAmount?: number}) =>
        apiClient.post<ExpenseCategory>('/expense-categories', data),

    // Expenses
    getAll: (params?: any) =>
        apiClient.get<{content: Expense[], totalPages: number}>('/expenses', {params}),

    getById: (id: number) =>
        apiClient.get<Expense>(`/expenses/${id}`),

    getByNumber: (expenseNumber: string) =>
        apiClient.get<Expense>(`/expenses/number/${expenseNumber}`),

    getByCategory: (categoryId: number, params?: any) =>
        apiClient.get<Expense[]>(`/expenses/category/${categoryId}`, {params}),

    getByStatus: (status: string, params?: any) =>
        apiClient.get<Expense[]>(`/expenses/status/${status}`, {params}),

    getByDateRange: (startDate: string, endDate: string) =>
        apiClient.get<Expense[]>('/expenses/date-range', {params: {startDate, endDate}}),

    create: (data: ExpenseRequest) =>
        apiClient.post<Expense>('/expenses', data),

    update: (id: number, data: ExpenseRequest) =>
        apiClient.put<Expense>(`/expenses/${id}`, data),

    approve: (id: number, comments?: string) =>
        apiClient.post<Expense>(`/expenses/${id}/approve`, {approved: true, comments}),

    reject: (id: number, reason: string) =>
        apiClient.post<Expense>(`/expenses/${id}/reject`, null, {params: {reason}}),

    markAsPaid: (id: number) =>
        apiClient.post<Expense>(`/expenses/${id}/mark-paid`),

    cancel: (id: number, reason: string) =>
        apiClient.post(`/expenses/${id}/cancel`, null, {params: {reason}}),

    uploadReceipt: (id: number, receiptUrl: string) =>
        apiClient.post<Expense>(`/expenses/${id}/upload-receipt`, null, {params: {receiptUrl}}),

    // Recurring expenses
    getRecurring: () =>
        apiClient.get<RecurringExpense[]>('/recurring-expenses'),

    createRecurring: (data: Omit<RecurringExpense, 'id' | 'recurringExpenseNumber' | 'nextGenerationDate'>) =>
        apiClient.post<RecurringExpense>('/recurring-expenses', data),

    // Stats
    getSummary: (period: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month') =>
        apiClient.get('/expenses/summary', {params: {period}}),

    getPendingApprovalCount: () =>
        apiClient.get<number>('/expenses/stats/pending-approval'),
};