import { type ApiResponse, mockSuccess, delay } from './api';
import type { LeaveRequest } from '../data/mockData';

/**
 * Service for Leave management
 */
export const leaveService = {
    /**
     * Fetches all leave requests
     */
    getAllLeaveRequests: async (): Promise<ApiResponse<LeaveRequest[]>> => {
        await delay();
        // In reality: return api.get('/leave/requests');
        return mockSuccess([]); // Initial state
    },

    /**
     * Submits a new leave request
     */
    requestLeave: async (userId: string, request: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>): Promise<ApiResponse<LeaveRequest>> => {
        await delay();
        const newRequest: LeaveRequest = {
            tenantId: 'tenant-123', // Mock tenant
            ...request,
            id: `LR-${Date.now()}`,
            employeeId: userId,
            status: 'Pending',
            requestedAt: new Date().toISOString()
        };
        // In reality: return api.post('/leave/requests', newRequest);
        return mockSuccess(newRequest, 'Leave request submitted successfully');
    },

    /**
     * Approves a leave request
     */
    approveLeave: async (_requestId: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/leave/requests/${requestId}/approve`);
        return mockSuccess(undefined, 'Leave request approved');
    },

    /**
     * Rejects a leave request
     */
    rejectLeave: async (_requestId: string, reason: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/leave/requests/${requestId}/reject`, { reason });
        return mockSuccess(undefined, `Leave request rejected: ${reason}`);
    }
};
