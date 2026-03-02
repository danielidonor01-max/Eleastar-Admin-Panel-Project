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
 * Service for Internal Task management
 */
export const taskService = {
    /**
     * Fetch All Tasks (Paginated)
     * Calls GET /tasks
     */
    getAllTasks: async (params?: { page?: number; per_page?: number; status?: string; priority?: string; search?: string }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/tasks?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch tasks' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Create Task
     * Calls POST /tasks
     */
    createTask: async (taskPayload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(taskPayload)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to create task' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Task Statistics
     * Calls GET /tasks/statistics
     */
    getTaskStatistics: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/statistics`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch task statistics' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get My Tasks
     * Calls GET /tasks/my-tasks
     */
    getMyTasks: async (params?: { status?: string }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params?.status) {
                query.append('status', params.status);
            }

            const response = await fetch(`${API_BASE_URL}/tasks/my-tasks?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch my tasks' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Update Task Status
     * Calls PATCH /tasks/{id}/status
     */
    updateTaskStatus: async (id: string | number, status: string): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to update task status' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    }
};
