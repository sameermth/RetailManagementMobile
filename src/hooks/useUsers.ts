import { useState, useCallback } from 'react';
import { usersApi, User, UserRequest, Role } from '@api/users';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchUsers = useCallback(async (page = 0, size = 20, search?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, size };
            if (search) params.search = search;

            const response = await usersApi.getAll(params);
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    const getUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.getById(id);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (data: UserRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.create(data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (id: number, data: Partial<UserRequest>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.update(id, data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await usersApi.delete(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const activateUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await usersApi.activate(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to activate user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deactivateUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await usersApi.deactivate(id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await usersApi.getRoles();
            setRoles(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    }, []);

    const assignRoles = useCallback(async (userId: number, roleIds: number[]) => {
        setLoading(true);
        setError(null);
        try {
            await usersApi.assignRoles(userId, roleIds);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to assign roles');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const changePassword = useCallback(async (data: { oldPassword?: string; newPassword: string; confirmPassword: string; userId?: number }) => {
        setLoading(true);
        setError(null);
        try {
            await usersApi.changePassword(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        roles,
        loading,
        error,
        totalPages,
        currentPage,
        fetchUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        activateUser,
        deactivateUser,
        fetchRoles,
        assignRoles,
        changePassword,
    };
};