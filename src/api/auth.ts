import apiClient from './client';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | undefined;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export const authApi = {
    login: (data: LoginRequest) =>
        apiClient.post<AuthResponse>('/auth/login', data),

    register: (data: RegisterRequest) =>
        apiClient.post<AuthResponse>('/auth/register', data),

    logout: () =>
        apiClient.post('/auth/logout'),
};