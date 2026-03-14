import apiClient from './client';

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    active: boolean;
    roles: Role[];
    createdAt: string;
    lastLoginAt?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
}

export interface UserRequest {
    username: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles?: number[];
}

export interface ChangePasswordRequest {
    userId?: number;
    oldPassword?: string;
    newPassword: string;
    confirmPassword: string;
}

export const usersApi = {
    // User CRUD
    getAll: (params?: any) =>
        apiClient.get<{content: User[], totalPages: number}>('/users', {params}),

    getById: (id: number) =>
        apiClient.get<User>(`/users/${id}`),

    getByUsername: (username: string) =>
        apiClient.get<User>(`/users/username/${username}`),

    create: (data: UserRequest) =>
        apiClient.post<User>('/users', data),

    update: (id: number, data: Partial<UserRequest>) =>
        apiClient.put<User>(`/users/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/users/${id}`),

    activate: (id: number) =>
        apiClient.put(`/users/${id}/activate`),

    deactivate: (id: number) =>
        apiClient.put(`/users/${id}/deactivate`),

    // Password Management
    changePassword: (data: ChangePasswordRequest) =>
        apiClient.post('/auth/change-password', data),

    resetPassword: (userId: number) =>
        apiClient.post(`/users/${userId}/reset-password`),

    // Roles
    getRoles: () =>
        apiClient.get<Role[]>('/users/roles'),

    assignRoles: (userId: number, roleIds: number[]) =>
        apiClient.post(`/users/${userId}/roles`, { roleIds }),

    // Profile
    getProfile: () =>
        apiClient.get<User>('/users/profile'),

    updateProfile: (data: Partial<User>) =>
        apiClient.put<User>('/users/profile', data),

    // Stats
    getStats: () =>
        apiClient.get<{total: number, active: number, inactive: number}>('/users/stats'),
};