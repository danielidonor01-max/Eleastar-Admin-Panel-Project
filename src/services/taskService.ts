import { type ApiResponse } from './api';
import { api } from '../utils/apiClient';
import type { Task } from '@/types';

function getError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Request failed';
}

/**
 * Service for Internal Task management
 */
export const taskService = {
    getAllTasks: async (params?: { page?: number; per_page?: number; status?: string; priority?: string; search?: string }): Promise<ApiResponse<Task[]>> => {
        try {
            const { data } = await api.get('/tasks', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: [], error: data?.message ?? 'Failed to fetch tasks' };
        } catch (error: unknown) {
            return { success: false, data: [], error: getError(error) };
        }
    },

    createTask: async (taskPayload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post('/tasks', taskPayload);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to create task' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getTaskStatistics: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/tasks/statistics');
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch task statistics' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getMyTasks: async (params?: { status?: string }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/tasks/my-tasks', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch my tasks' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    updateTaskStatus: async (id: string | number, status: string): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.patch(`/tasks/${id}/status`, { status });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to update task status' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },
};
