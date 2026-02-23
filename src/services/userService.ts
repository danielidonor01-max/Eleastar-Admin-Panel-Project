import { api, type ApiResponse } from './api';
import type { Employee } from '../data/mockData';

export const userService = {
    /**
     * Create a new System User (Admin Role) on the backend
     */
    createAdminUser: async (data: { email: string; firstName: string; lastName: string; role: string }): Promise<ApiResponse<{ user: any; initialPassword: string }>> => {
        try {
            const response = await api.post('/users', data);
            return {
                data: response.data,
                success: true
            };
        } catch (error: any) {
            return {
                data: null as any,
                success: false,
                error: error.response?.data?.message || 'Failed to create user'
            };
        }
    },

    /**
     * Resets the password for a given user ID
     */
    resetPassword: async (userId: string): Promise<ApiResponse<{ user: any; newPassword: string }>> => {
        try {
            const response = await api.post(`/users/${userId}/reset-password`);
            return {
                data: response.data,
                success: true
            };
        } catch (error: any) {
            return {
                data: null as any,
                success: false,
                error: error.response?.data?.message || 'Failed to reset password'
            };
        }
    }
};
