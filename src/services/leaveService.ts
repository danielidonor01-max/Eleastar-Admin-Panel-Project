import { type ApiResponse } from './api';
import type { LeaveRequest } from '../data/mockData';
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
 * Service for Leave management
 */
export const leaveService = {
    /**
     * Fetches all leave requests (Paginated)
     */
    getAllLeaveRequests: async (params?: { page?: number; per_page?: number; status?: string; employee_id?: number }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/leave-requests?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch leave requests' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Submits a new leave request
     */
    requestLeave: async (userId: string, requestPayload: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>): Promise<ApiResponse<LeaveRequest>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leave-requests`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    employee_id: userId,
                    ...requestPayload
                })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to submit leave request' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Updates the status of a leave request (Approve/Reject)
     */
    updateLeaveStatus: async (requestId: string | number, status: 'Approved' | 'Rejected', reason?: string): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leave-requests/${requestId}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status, rejection_reason: reason })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || `Failed to ${status.toLowerCase()} leave request` };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Approves a leave request
     */
    approveLeave: async (requestId: string | number): Promise<ApiResponse<void>> => {
        return leaveService.updateLeaveStatus(requestId, 'Approved');
    },

    /**
     * Rejects a leave request
     */
    rejectLeave: async (requestId: string | number, reason: string): Promise<ApiResponse<void>> => {
        return leaveService.updateLeaveStatus(requestId, 'Rejected', reason);
    },

    /**
     * Get All Leaves
     * Calls GET /leaves
     */
    getLeaves: async (params?: { page?: number; per_page?: number; status?: string; type?: string; search?: string }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/leaves?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch leaves' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Apply for Leave (New Endpoint format)
     * Calls POST /leaves/apply
     */
    applyLeave: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leaves/apply`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to apply for leave' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Approve Leave Request (New Endpoint format)
     * Calls PATCH /leaves/{id}/approve
     */
    approveLeaveRequest: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leaves/${id}/approve`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to approve leave request' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Reject Leave Request (New Endpoint format)
     * Calls PATCH /leaves/{id}/reject
     */
    rejectLeaveRequest: async (id: string | number, reason?: string): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leaves/${id}/reject`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ reason })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to reject leave request' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Leave Statistics
     * Calls GET /leaves/statistics
     */
    getLeaveStatistics: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leaves/statistics`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch leave statistics' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get My Leave Requests
     * Calls GET /leaves/my-leaves
     */
    getMyLeaves: async (params?: { status?: string }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params?.status) query.append('status', params.status);

            const response = await fetch(`${API_BASE_URL}/leaves/my-leaves?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch my leave requests' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Leave Types
     * Calls GET /leaves/types
     */
    getLeaveTypes: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/leaves/types`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch leave types' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    }
};
