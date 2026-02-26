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
    }
};
