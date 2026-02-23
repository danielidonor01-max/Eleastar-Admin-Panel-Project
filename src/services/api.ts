import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * API Configuration
 * 
 * This file serves as the base configuration for all service calls.
 * It uses Axios for HTTP requests and js-cookie for token management.
 */

// Base URL for API - should be moved to .env in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create Axios instance
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global errors and automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = Cookies.get('admin_refresh_token');
            if (refreshToken) {
                try {
                    // In a real app, this would be a direct API call or importing authService
                    // To avoid circular dependency, we can use a direct axios call or a registry
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

                    if (response.data.success) {
                        const newToken = response.data.data.token;
                        Cookies.set('admin_token', newToken, { expires: 1, secure: true, sameSite: 'strict' });

                        // Retry the original request with the new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed, clean up and redirect
                    Cookies.remove('admin_token');
                    Cookies.remove('admin_refresh_token');
                    window.location.href = '/login'; // Or handle via history/context
                }
            } else {
                // No refresh token, clean up and redirect
                Cookies.remove('admin_token');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Generic Response wrapper for backward compatibility with mock implementations
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

// Utility for mock delay (retained for transitional period)
export const delay = (ms: number = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate a successful API response
export const mockSuccess = <T>(data: T, message?: string): ApiResponse<T> => ({
    data,
    success: true,
    message
});

// Helper to simulate a failed API response
export const mockError = <T>(error: string): ApiResponse<T> => ({
    data: null as any,
    success: false,
    error
});
