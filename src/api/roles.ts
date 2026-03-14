import apiClient from './client';

export interface Permission {
    id: number;
    name: string;
    description?: string;
    module?: string;
    createdAt?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: Permission[];
    userCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface RoleRequest {
    name: string;
    description?: string;
    permissions: number[];
}

export interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

export const rolesApi = {
    // Role CRUD
    getAllRoles: (params?: any) =>
        apiClient.get<{content: Role[], totalPages: number}>('/roles', {params}),

    getRoleById: (id: number) =>
        apiClient.get<Role>(`/roles/${id}`),

    createRole: (data: RoleRequest) =>
        apiClient.post<Role>('/roles', data),

    updateRole: (id: number, data: Partial<RoleRequest>) =>
        apiClient.put<Role>(`/roles/${id}`, data),

    deleteRole: (id: number) =>
        apiClient.delete(`/roles/${id}`),

    // Permissions
    getAllPermissions: () =>
        apiClient.get<Permission[]>('/roles/permissions'),

    getPermissionsByModule: () =>
        apiClient.get<PermissionGroup[]>('/roles/permissions/grouped'),

    // Role assignment
    getUsersInRole: (roleId: number, params?: any) =>
        apiClient.get(`/roles/${roleId}/users`, {params}),

    assignPermission: (roleId: number, permissionId: number) =>
        apiClient.post(`/roles/${roleId}/permissions/${permissionId}`),

    removePermission: (roleId: number, permissionId: number) =>
        apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`),

    // Stats
    getRoleStats: () =>
        apiClient.get<{total: number, activeRoles: number}>('/roles/stats'),
};