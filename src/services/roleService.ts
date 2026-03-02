import { type ApiResponse } from './api';
import { API_BASE_URL } from '../config';
import Cookies from 'js-cookie';

const getHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

/**
 * Service for Role management
 */
export const roleService = {
    /**
     * Get All Roles
     * Calls GET /roles
     */
    getAllRoles: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch roles' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Create Role
     * Calls POST /roles
     */
    createRole: async (rolePayload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(rolePayload)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to create role' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Role Details
     * Calls GET /roles/{id}
     */
    getRoleById: async (id: string | number): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch role details' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Update Role
     * Calls PUT /roles/{id}
     */
    updateRole: async (id: string | number, updates: any): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to update role' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Delete Role
     * Calls DELETE /roles/{id}
     */
    deleteRole: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to delete role' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Assign Permissions to Role
     * Calls POST /roles/{id}/permissions
     */
    assignPermissions: async (id: string | number, permissions: string[]): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles/${id}/permissions`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ permissions })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to assign permissions' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    }
};
