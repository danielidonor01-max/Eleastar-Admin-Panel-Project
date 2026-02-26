import { type ApiResponse } from './api';
import type { Job } from '../data/mockData';
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
 * Service for Job and Recruitment management
 */
export const jobService = {
    /**
     * Fetches all job listings
     */
    getAllJobs: async (params?: { page?: number; per_page?: number; status?: string; department?: string; search?: string }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/jobs?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch jobs' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Creates a new job listing
     */
    createJob: async (jobPayload: any): Promise<ApiResponse<Job>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(jobPayload)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to create job' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Updates an existing job
     */
    updateJob: async (id: string | number, updates: Partial<Job>): Promise<ApiResponse<Job>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to update job' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Deletes a job listing
     */
    deleteJob: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to delete job' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    }
};
