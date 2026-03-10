import { type ApiResponse } from './api';
import type { LeaveRequest } from '../types';
import { api } from '../utils/apiClient';

function getError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Request failed';
}

/**
 * Service for Leave management
 */
export const leaveService = {
    getAllLeaveRequests: async (params?: { page?: number; per_page?: number; status?: string; employee_id?: number }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/leaves', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch leave requests' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    requestLeave: async (userId: string, requestPayload: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const { data } = await api.post('/leaves/apply', {
                employee_id: userId,
                ...requestPayload,
            });
            if (data?.success || data?.status) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as LeaveRequest, error: data?.message ?? 'Failed to submit leave request' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as LeaveRequest, error: getError(error) };
        }
    },

    updateLeaveStatus: async (requestId: string | number, status: 'Approved' | 'Rejected', reason?: string): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.put(`/leaves/${requestId}/status`, { status, rejection_reason: reason });
            if (data?.success || data?.status) {
                return { success: true, data: undefined, message: data?.message };
            }
            return { success: false, data: undefined, error: data?.message ?? `Failed to ${status.toLowerCase()} leave request` };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    approveLeave: async (requestId: string | number): Promise<ApiResponse<void>> => {
        return leaveService.updateLeaveStatus(requestId, 'Approved');
    },

    rejectLeave: async (requestId: string | number, reason: string): Promise<ApiResponse<void>> => {
        return leaveService.updateLeaveStatus(requestId, 'Rejected', reason);
    },

    getLeaves: async (params?: { page?: number; per_page?: number; status?: string; type?: string; search?: string }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/leaves', { params });
            if (data?.success) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch leaves' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    applyLeave: async (payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post('/leaves/apply', payload);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to apply for leave' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    approveLeaveRequest: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.patch(`/leaves/${id}/approve`);
            if (data?.success || data?.status) {
                return { success: true, data: undefined, message: data?.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to approve leave request' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    rejectLeaveRequest: async (id: string | number, reason?: string): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.patch(`/leaves/${id}/reject`, { reason });
            if (data?.success || data?.status) {
                return { success: true, data: undefined, message: data?.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to reject leave request' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    getLeaveStatistics: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/leaves/statistics');
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch leave statistics' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getMyLeaves: async (params?: { status?: string }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/leaves/my-leaves', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch my leave requests' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getLeaveTypes: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/leaves/types');
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch leave types' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },
};
