import { type ApiResponse } from './api';
import type { Job } from '../types';
import { api } from '../utils/apiClient';

function getError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Request failed';
}

/**
 * Service for Job and Recruitment management
 */
export const jobService = {
    /**
     * Fetches all job listings
     */
    getAllJobs: async (params?: { page?: number; per_page?: number; status?: string; department?: string; search?: string }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get<{ success?: boolean; data?: unknown; message?: string }>('/jobs', { params });
            if (data?.success) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch jobs' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Creates a new job listing
     */
    createJob: async (jobPayload: unknown): Promise<ApiResponse<Job>> => {
        try {
            const { data } = await api.post<{ success?: boolean; data?: Job; message?: string }>('/jobs', jobPayload);
            if (data?.success) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as Job, error: data?.message ?? 'Failed to create job' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as Job, error: getError(error) };
        }
    },

    /**
     * Updates an existing job
     */
    updateJob: async (id: string | number, updates: Partial<Job>): Promise<ApiResponse<Job>> => {
        try {
            const { data } = await api.put<{ success?: boolean; data?: Job; message?: string }>(`/jobs/${id}`, updates);
            if (data?.success) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as Job, error: data?.message ?? 'Failed to update job' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as Job, error: getError(error) };
        }
    },

    /**
     * Deletes a job listing
     */
    deleteJob: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.delete<{ success?: boolean; message?: string }>(`/jobs/${id}`);
            if (data?.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to delete job' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },
};
