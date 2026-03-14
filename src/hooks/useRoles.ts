import { useState, useCallback } from 'react';
import { rolesApi, Role, Permission, PermissionGroup, RoleRequest } from '@api/roles';

export const useRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    // Role CRUD
    const fetchRoles = useCallback(async (page = 0, size = 20, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            if (search) params.search = search;

            const response = await rolesApi.getAllRoles(params);
            setRoles(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    }, []);

    const getRole = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rolesApi.getRoleById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch role');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createRole = useCallback(async (data: RoleRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rolesApi.createRole(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create role');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRole = useCallback(async (id: number, data: Partial<RoleRequest>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await rolesApi.updateRole(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update role');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteRole = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await rolesApi.deleteRole(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete role');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Permissions
    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await rolesApi.getAllPermissions();
            setPermissions(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch permissions');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPermissionGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await rolesApi.getPermissionsByModule();
            setPermissionGroups(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch permission groups');
        } finally {
            setLoading(false);
        }
    }, []);

    // Permission assignment
    const assignPermission = useCallback(async (roleId: number, permissionId: number) => {
        setLoading(true);
        setError(null);
        try {
            await rolesApi.assignPermission(roleId, permissionId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign permission');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const removePermission = useCallback(async (roleId: number, permissionId: number) => {
        setLoading(true);
        setError(null);
        try {
            await rolesApi.removePermission(roleId, permissionId);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove permission');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        roles,
        permissions,
        permissionGroups,
        loading,
        error,
        totalPages,
        currentPage,
        fetchRoles,
        getRole,
        createRole,
        updateRole,
        deleteRole,
        fetchPermissions,
        fetchPermissionGroups,
        assignPermission,
        removePermission,
    };
};