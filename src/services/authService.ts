import { type ApiResponse, delay } from './api';
import type { AdminRole } from '../data/mockData';
import { apiClient } from '../utils/apiClient';
import Cookies from 'js-cookie';

export interface User {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    permissions: string[];
    token?: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export const authService = {
    /**
     * Login with Email and Password
     */
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse | { requires_otp: boolean, email: string }>> => {
        try {
            const response = await apiClient(`/auth/login`, {
                method: 'POST',
                requireAuth: false,
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status || data.access_token)) {
                if (data.data?.requires_otp) {
                    return { success: true, data: data.data, message: data.message };
                }

                const token = data.data?.token || data.access_token || data.token;
                const user = data.data?.user || data.user;

                const loggedInUser: User = {
                    id: String(user.id),
                    email: user.email,
                    name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || ''),
                    role: typeof user.role_id === 'number' ? (user.role_id === 1 ? 'SUPER_ADMIN' : (user.role_id === 2 ? 'HR_ADMIN' : 'USER')) : (user.role || 'SUPER_ADMIN'),
                    permissions: [],
                    token
                };

                Cookies.set('admin_token', token, { expires: 1, secure: window.location.protocol === 'https:', sameSite: 'strict' });
                localStorage.setItem('user_id', loggedInUser.id);

                return {
                    success: true,
                    data: {
                        user: loggedInUser,
                        token,
                        refreshToken: data.data?.refresh_token || data.refresh_token || token
                    },
                    message: data.message || 'Login successful'
                };
            } else {
                return { success: false, data: null as any, error: data.message || 'Invalid credentials' };
            }
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Verify OTP
     */
    verifyOTP: async (email: string, otp: string): Promise<ApiResponse<LoginResponse>> => {
        try {
            const response = await apiClient(`/auth/verify-otp`, {
                method: 'POST',
                requireAuth: false,
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();

            if (response.ok && data.status) {
                const token = data.data.token;
                const user = data.data.user;

                const loggedInUser: User = {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    role: user.role_id === 1 ? 'SUPER_ADMIN' : (user.role_id === 2 ? 'HR_ADMIN' : 'USER'),
                    permissions: [],
                    token
                };

                Cookies.set('admin_token', token, { expires: 1, secure: window.location.protocol === 'https:', sameSite: 'strict' });
                localStorage.setItem('user_id', loggedInUser.id);

                return { success: true, data: { user: loggedInUser, token, refreshToken: token }, message: data.message };
            } else {
                return { success: false, data: null as any, error: data.message || 'Invalid OTP' };
            }
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Resend OTP
     */
    resendOTP: async (email: string): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient(`/auth/resend-otp`, {
                method: 'POST',
                requireAuth: false,
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok && data.status) {
                return { success: true, data: undefined, message: data.message };
            } else {
                return { success: false, data: null as any, error: data.message || 'Failed to resend OTP' };
            }
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Forgot Password
     */
    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient(`/auth/forgot-password`, {
                method: 'POST',
                requireAuth: false,
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok && data.status) {
                return { success: true, data: undefined, message: data.message };
            } else {
                return { success: false, data: null as any, error: data.message || 'Failed to send password reset link' };
            }
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Reset Password
     */
    resetPassword: async (payload: { email: string; token: string; password: string; password_confirmation: string }): Promise<ApiResponse<void>> => {
        try {
            const response = await apiClient(`/auth/reset-password`, {
                method: 'POST',
                requireAuth: false,
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && data.status) {
                return { success: true, data: undefined, message: data.message };
            } else {
                return { success: false, data: null as any, error: data.message || 'Failed to reset password' };
            }
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Logout
     */
    logout: async (): Promise<ApiResponse<void>> => {
        try {
            const token = Cookies.get('admin_token');
            if (token) {
                await apiClient(`/auth/logout`, {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('admin_token');
            Cookies.remove('admin_refresh_token');
            localStorage.removeItem('user_id');
        }
        return { success: true, data: undefined };
    },

    /**
     * Get Current User
     */
    getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
        const token = Cookies.get('admin_token');
        if (!token) return { success: true, data: null };

        try {
            const response = await apiClient(`/auth/me`, {
                method: 'GET'
            });
            const data = await response.json();

            if (response.ok && (data.email || data.success || data.status)) {
                const user = data.data?.user || data.data || data;
                const loggedInUser: User = {
                    id: String(user.id),
                    email: user.email,
                    name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || ''),
                    role: typeof user.role_id === 'number' ? (user.role_id === 1 ? 'SUPER_ADMIN' : (user.role_id === 2 ? 'HR_ADMIN' : 'USER')) : (user.role || 'SUPER_ADMIN'),
                    permissions: [],
                    token
                };
                return { success: true, data: loggedInUser };
            } else {
                Cookies.remove('admin_token');
                return { success: true, data: null };
            }
        } catch (error: any) {
            console.error('GetCurrentUser error:', error);
            return { success: true, data: null };
        }
    },

    /**
     * Mock implementations for development
     */
    refreshToken: async (): Promise<ApiResponse<string>> => {
        const refreshToken = Cookies.get('admin_refresh_token');
        if (!refreshToken) return { success: false, data: null as any, error: 'No refresh token' };
        return { success: true, data: refreshToken };
    },

    verifyPin: async (pin: string): Promise<boolean> => {
        await delay(500);
        return pin === '1234';
    }
};
