import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { login, register, logout, clearError } from '@store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@api/auth';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, token, isLoading, error, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const handleLogin = useCallback(
        async (credentials: LoginRequest) => {
            return await dispatch(login(credentials)).unwrap();
        },
        [dispatch]
    );

    const handleRegister = useCallback(
        async (userData: RegisterRequest) => {
            return await dispatch(register(userData)).unwrap();
        },
        [dispatch]
    );

    const handleLogout = useCallback(async () => {
        return await dispatch(logout()).unwrap();
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        user,
        token,
        isLoading,
        error,
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        clearError: handleClearError,
    };
};