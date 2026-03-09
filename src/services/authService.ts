import { type ApiResponse, delay } from './api';
import type { AdminRole } from '@/types';
import { api } from '../utils/apiClient';
import Cookies from 'js-cookie';

interface ApiUser {
    id: number;
    employee_id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    otp_expires_at: string | null;
    is_first_login: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    employee_id: string;
    name: string;
    email: string;
    role_id?: string;
    role: AdminRole;
    email_verified_at: string;
    otp_expires_at: string | null;
    is_first_login: boolean;
    last_login_at: string;
    created_at: string;
    updated_at: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    token_type: string;
}

/** API response wrapper: { status, message, data } */
interface ApiAuthResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

function getErrorMessage(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } | string }; message?: string };
    const d = e.response?.data;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object' && 'message' in d) return (d as { message?: string }).message ?? 'Request failed';
    return e.message ?? 'Request failed';
}

function mapApiUserToUser(apiUser: ApiUser, defaultRole: AdminRole = 'SUPER_ADMIN'): User {
    return {
        id: apiUser.id,
        employee_id: apiUser.employee_id,
        name: apiUser.name,
        email: apiUser.email,
        role: defaultRole,
        email_verified_at: apiUser.email_verified_at ?? '',
        otp_expires_at: apiUser.otp_expires_at,
        is_first_login: apiUser.is_first_login,
        last_login_at: apiUser.last_login_at ?? '',
        created_at: apiUser.created_at,
        updated_at: apiUser.updated_at,
    };
}
export const authService = {


    
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse | { requires_otp: boolean; email: string }>> => {
        try {
            const res = await api.post('/auth/login', { email, password }, { requireAuth: false });
            const data = res.data as ApiAuthResponse<{ user: ApiUser; token: string; token_type: string }>;

            if (data.status && data.data) {
                const { token, token_type: tokenType, user: apiUser } = data.data;
                const loggedInUser = mapApiUserToUser(apiUser);

                Cookies.set('admin_token', token, { expires: 1, secure: window.location.protocol === 'https:', sameSite: 'strict' });
                localStorage.setItem('user_id', String(loggedInUser.id));

                return {
                    success: true,
                    data: { user: loggedInUser, token, token_type: tokenType },
                    message: data.message,
                };
            }
            return { success: false, data: null as unknown as LoginResponse, error: (data as { message?: string }).message ?? 'Invalid credentials' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as LoginResponse, error: getErrorMessage(error) };
        }
    },


    verifyOTP: async (email: string, otp: string): Promise<ApiResponse<LoginResponse>> => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp }, { requireAuth: false });
            const payload = data as ApiAuthResponse<{ user: ApiUser; token: string; token_type: string }>;

            if (payload.status && payload.data) {
                const { token, token_type: tokenType, user: apiUser } = payload.data;
                const loggedInUser = mapApiUserToUser(apiUser);

                Cookies.set('admin_token', token, { expires: 1, secure: window.location.protocol === 'https:', sameSite: 'strict' });
                localStorage.setItem('user_id', String(loggedInUser.id));

                return { success: true, data: { user: loggedInUser, token, token_type: tokenType }, message: payload.message };
            }
            return { success: false, data: null as unknown as LoginResponse, error: payload.message ?? 'Invalid OTP' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as LoginResponse, error: getErrorMessage(error) };
        }
    },

    /**
     * Resend OTP
     */
    resendOTP: async (email: string): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.post('/auth/resend-otp', { email }, { requireAuth: false });
            if ((data as { status?: boolean }).status) {
                return { success: true, data: undefined, message: (data as { message?: string }).message };
            }
            return { success: false, data: undefined, error: (data as { message?: string }).message ?? 'Failed to resend OTP' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getErrorMessage(error) };
        }
    },

    /**
     * Forgot Password
     */
    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.post('/auth/forgot-password', { email }, { requireAuth: false });
            if ((data as { status?: boolean }).status) {
                return { success: true, data: undefined, message: (data as { message?: string }).message };
            }
            return { success: false, data: undefined, error: (data as { message?: string }).message ?? 'Failed to send password reset link' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getErrorMessage(error) };
        }
    },

    /**
     * Reset Password
     */
    resetPassword: async (payload: { email: string; token: string; password: string; password_confirmation: string }): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.post('/auth/reset-password', payload, { requireAuth: false });
            if ((data as { status?: boolean }).status) {
                return { success: true, data: undefined, message: (data as { message?: string }).message };
            }
            return { success: false, data: undefined, error: (data as { message?: string }).message ?? 'Failed to reset password' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getErrorMessage(error) };
        }
    },

    /**
     * Logout
     */
    logout: async (): Promise<ApiResponse<void>> => {
        try {
            const token = Cookies.get('admin_token');
            if (token) {
                await api.post('/auth/logout', undefined, {});
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
            const res = await api.get('/auth/me');
            const resData = res.data as ApiAuthResponse<ApiUser>;

            if (resData?.status && resData?.data) {
                const loggedInUser = mapApiUserToUser(resData.data);
                return { success: true, data: loggedInUser };
            }
            Cookies.remove('admin_token');
            return { success: true, data: null };
        } catch (error: unknown) {
            console.error('GetCurrentUser error:', error);
            return { success: true, data: null };
        }
    },

    /**
     * Mock implementations for development
     */
    refreshToken: async (): Promise<ApiResponse<string>> => {
        const refreshToken = Cookies.get('admin_refresh_token');
        if (!refreshToken) return { success: false, data: null as unknown as string, error: 'No refresh token' };
        return { success: true, data: refreshToken };
    },

    verifyPin: async (pin: string): Promise<boolean> => {
        await delay(500);
        return pin === '1234';
    },
};
