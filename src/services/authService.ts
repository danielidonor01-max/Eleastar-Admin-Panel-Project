import { type ApiResponse, delay } from './api';
import type { AdminRole } from '../data/mockData';
import { API_BASE_URL } from '../config';
import Cookies from 'js-cookie';

export interface User {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    permissions: string[];
    token?: string; // JWT token in the future
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken: string;
}


export const authService = {
    /**
     * Login with Email and Password
     * Calls POST /auth/login
     */
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse | { requires_otp: boolean, email: string }>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            // Support both Postman format and simpler local template format
            if (response.ok && (data.success || data.access_token)) {
                // Check if OTP is required
                if (data.data?.requires_otp) {
                    return { success: true, data: data.data, message: data.message };
                }

                // Normal Login Success
                const token = data.data?.token || data.access_token;
                const user = data.data?.user || data.user;

                const loggedInUser: User = {
                    id: String(user.id),
                    email: user.email,
                    name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
                    role: typeof user.role_id === 'number' ? (user.role_id === 1 ? 'SUPER_ADMIN' : (user.role_id === 2 ? 'HR_ADMIN' : 'USER')) : (user.role || 'SUPER_ADMIN'),
                    permissions: [],
                    token
                };

                Cookies.set('admin_token', token, { expires: 1, secure: true, sameSite: 'strict' });
                localStorage.setItem('user_id', loggedInUser.id);

                return { success: true, data: { user: loggedInUser, token, refreshToken: data.refresh_token || token }, message: data.message || 'Login successful' };
            } else {
                return { success: false, data: null as any, error: data.message || 'Invalid credentials' };
            }
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Verify OTP
     * Calls POST /auth/verify-otp
     */
    verifyOTP: async (email: string, otp: string): Promise<ApiResponse<LoginResponse>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();

            if (response.ok && data.success) {
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

                Cookies.set('admin_token', token, { expires: 1, secure: true, sameSite: 'strict' });
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
     * Logout
     * Calls POST /auth/logout
     */
    logout: async (): Promise<ApiResponse<void>> => {
        try {
            const token = Cookies.get('admin_token');
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
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
     * Calls GET /auth/me
     */
    getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
        const token = Cookies.get('admin_token');
        if (!token) return { success: true, data: null };

        try {
            // Support both Postman /auth/me and boilerplate /users/me endpoints
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();

            // Local boilerplate returns user object directly, Postman returns success wrap
            if (response.ok && (data.email || data.success)) {
                const user = data.data || data;
                const loggedInUser: User = {
                    id: String(user.id),
                    email: user.email,
                    name: user.firstName ? `${user.firstName} ${user.lastName}` : user.name,
                    role: typeof user.role_id === 'number' ? (user.role_id === 1 ? 'SUPER_ADMIN' : (user.role_id === 2 ? 'HR_ADMIN' : 'USER')) : (user.role || 'SUPER_ADMIN'),
                    permissions: [],
                    token
                };
                return { success: true, data: loggedInUser };
            } else {
                // Token invalid
                Cookies.remove('admin_token');
                return { success: true, data: null };
            }
        } catch (error: any) {
            console.error('GetCurrentUser error:', error);
            return { success: true, data: null };
        }
    },

    /**
     * Refresh Token
     * Currently a mock implementation until refresh route exists
     */
    refreshToken: async (): Promise<ApiResponse<string>> => {
        const refreshToken = Cookies.get('admin_refresh_token');
        if (!refreshToken) return { success: false, data: null as any, error: 'No refresh token' };
        // Placeholder for real refresh logic
        return { success: true, data: refreshToken };
    },

    /**
     * Verify/Regenerate Token (Pin, etc)
     */
    verifyPin: async (pin: string): Promise<boolean> => {
        await delay(500);
        return pin === '1234'; // Mock PIN
    }
};
