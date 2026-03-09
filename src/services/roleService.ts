import { type ApiResponse } from './api';
import { api } from '../utils/apiClient';

function getError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Request failed';
}

/**
 * Service for Role management
 */
export const roleService = {
    /**
     * Get All Roles
     */
    getAllRoles: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get<{ success?: boolean; data?: unknown; message?: string }>('/roles');
            if (data?.success) {
                return { success: true, data: data.data ?? null, message: data.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch roles' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Create Role
     */
    createRole: async (rolePayload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post<{ success?: boolean; data?: unknown; message?: string }>('/roles', rolePayload);
            if (data?.success) {
                return { success: true, data: data.data ?? null, message: data.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to create role' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Get Role Details
     */
    getRoleById: async (id: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get<{ success?: boolean; data?: unknown; message?: string }>(`/roles/${id}`);
            if (data?.success) {
                return { success: true, data: data.data ?? null, message: data.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch role details' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Update Role
     */
    updateRole: async (id: string | number, updates: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.put<{ success?: boolean; data?: unknown; message?: string }>(`/roles/${id}`, updates);
            if (data?.success) {
                return { success: true, data: data.data ?? null, message: data.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to update role' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Delete Role
     */
    deleteRole: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.delete<{ success?: boolean; message?: string }>(`/roles/${id}`);
            if (data?.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to delete role' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    /**
     * Assign Permissions to Role
     */
    assignPermissions: async (id: string | number, permissions: string[]): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post<{ success?: boolean; data?: unknown; message?: string }>(`/roles/${id}/permissions`, { permissions });
            if (data?.success) {
                return { success: true, data: data.data ?? null, message: data.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to assign permissions' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },
};
