import { type ApiResponse, mockSuccess, mockError, delay } from './api';
import type { AdminRole } from '../data/mockData';
import { employees } from '../data/mockData';
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

// Mock Token Generator
const generateToken = () => `mock-jwt-token-${Date.now()}`;

export const authService = {
    /**
     * Login with Email and Password
     * Currently mocks validation against the employees array.
     */
    login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
        await delay(800); // Simulate network request

        // Find user in mock data
        // In a real app, this would be a POST request to /api/auth/login
        const user = employees.find(e => e.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            return mockError('Invalid credentials');
        }

        // Mock Password Check (Accept any password for now, or specific one)
        // In production, NEVER handle passwords on the frontend like this.
        if (password.length < 3) {
            return mockError('Password is too short');
        }

        // Return User Object
        const token = generateToken();
        const refreshToken = `mock-refresh-token-${Date.now()}`;

        const loggedInUser: User = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.systemRole as AdminRole,
            permissions: [],
            token
        };

        // Save to Cookies (Secure Session)
        Cookies.set('admin_token', token, { expires: 1, secure: true, sameSite: 'strict' });
        Cookies.set('admin_refresh_token', refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
        localStorage.setItem('user_id', loggedInUser.id);

        return mockSuccess({ user: loggedInUser, token, refreshToken });
    },

    /**
     * Logout
     * Clears local storage and session data.
     */
    logout: async (): Promise<ApiResponse<void>> => {
        await delay(300);
        Cookies.remove('admin_token');
        Cookies.remove('admin_refresh_token');
        localStorage.removeItem('user_id');
        return mockSuccess<void>(undefined);
    },

    /**
     * Get Current User
     * Rehydrates user session from local storage or validates token.
     */
    getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
        await delay(200);
        const token = Cookies.get('admin_token');
        const userId = localStorage.getItem('user_id');

        if (!token || !userId) {
            return mockSuccess(null);
        }

        const user = employees.find(e => e.id === userId);
        if (!user) {
            return mockSuccess(null);
        }

        return mockSuccess({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.systemRole as AdminRole,
            permissions: [],
            token
        });
    },

    /**
     * Refresh Token
     * Exchanges refresh token for new access token.
     */
    refreshToken: async (): Promise<ApiResponse<string>> => {
        const refreshToken = Cookies.get('admin_refresh_token');
        if (!refreshToken) return mockError('No refresh token');

        await delay(500);
        // In reality: const response = await api.post('/auth/refresh', { refreshToken });
        const newToken = generateToken();
        Cookies.set('admin_token', newToken, { expires: 1, secure: true, sameSite: 'strict' });
        return mockSuccess(newToken);
    },

    /**
     * Verify/Regenerate Token (Pin, etc)
     */
    verifyPin: async (pin: string): Promise<boolean> => {
        await delay(500);
        return pin === '1234'; // Mock PIN
    }
};
