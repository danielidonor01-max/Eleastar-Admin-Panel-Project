import { create } from 'zustand';
import { toast } from 'sonner';
import { leaveService } from '../services/leaveService';
import type { LeaveRequest } from '../types';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';
import { useAuthStore } from './useAuthStore';
import { useEmployeeStore } from './useEmployeeStore';
import { createPersistedStore } from './middleware';

interface LeaveState {
    leaveRequests: LeaveRequest[];
    isLoading: boolean;
}

interface LeaveActions {
    fetchLeaveRequests: () => Promise<void>;
    requestLeave: (userId: string, requestData: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>) => Promise<void>;
    approveLeave: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    rejectLeave: (requestId: string, reason: string) => Promise<void>;
    refreshLeaveRequests: () => Promise<void>;
    startReminderEngine: () => () => void;
}

export const useLeaveStore = create<LeaveState & LeaveActions>()(
    createPersistedStore('leave', (set, get) => ({
    leaveRequests: [],
    isLoading: false,

    fetchLeaveRequests: async () => {
        const res = await leaveService.getAllLeaveRequests();
        if (res.success) {
            set({ leaveRequests: Array.isArray(res.data) ? res.data : ((res.data as { data?: LeaveRequest[] })?.data || []) });
        }
    },

    refreshLeaveRequests: async () => {
        const res = await leaveService.getAllLeaveRequests();
        if (res.success) {
            set({ leaveRequests: Array.isArray(res.data) ? res.data : ((res.data as { data?: LeaveRequest[] })?.data || []) });
        }
    },

    requestLeave: async (userId, requestData) => {
        if (new Date(requestData.startDate) > new Date(requestData.endDate)) {
            toast.error('Invalid Dates', { description: 'Start date must be before end date.' });
            return;
        }
        set({ isLoading: true });
        try {
            const res = await leaveService.requestLeave(userId, requestData);
            if (res.success) {
                const newReq = res.data as LeaveRequest;
                set((s) => ({ leaveRequests: [newReq, ...s.leaveRequests] }));
                const { logAction } = useAuditStore.getState();
                logAction('Leave Request', `New ${requestData.type} leave request from ${userId}`);
                const { dispatchNotification } = useNotificationStore.getState();
                dispatchNotification(
                    { title: 'New Leave Request', message: `${requestData.type} leave from ${userId}`, type: 'Leave', link: `/admin/leave?requestId=${newReq.id}` },
                    { roles: ['HR_ADMIN', 'SUPER_ADMIN', 'COO'] }, ['in-app', 'email']
                );
                toast.success('Request Submitted', { description: 'Leave request submitted successfully.' });
            } else {
                toast.error('Request Failed', { description: (res as { error?: string }).error });
            }
        } catch {
            toast.error('Request Error', { description: 'Failed to submit leave request.' });
        } finally {
            set({ isLoading: false });
        }
    },

    approveLeave: async (requestId) => {
        const { currentUserRole, currentUserId } = useAuthStore.getState();
        const authorized = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
        if (!authorized.includes(currentUserRole)) {
            return { success: false, error: 'Unauthorized: Insufficient permissions' };
        }
        const request = get().leaveRequests.find((r) => r.id === requestId);
        if (!request) return { success: false, error: 'Request not found' };
        if (request.status !== 'Pending') return { success: false, error: `Already ${request.status}` };

        set({ isLoading: true });
        try {
            const res = await leaveService.approveLeave(requestId);
            if (res.success) {
                set((s) => ({
                    leaveRequests: s.leaveRequests.map((r) =>
                        r.id === requestId ? { ...r, status: 'Approved', actionBy: currentUserId || 'System', actionAt: new Date().toISOString() } : r
                    ),
                }));
                const { updateEmployee } = useEmployeeStore.getState();
                updateEmployee(request.employeeId, {
                    leaveBalance: (() => {
                        const emp = useEmployeeStore.getState().employees.find((e: { employee_id: string }) => e.employee_id === request.employeeId);
                        if (!emp?.leaveBalance) return undefined;
                        return {
                            ...emp.leaveBalance,
                            annual: request.type === 'Annual' ? emp.leaveBalance.annual - request.days : emp.leaveBalance.annual,
                            sick: request.type === 'Sick' ? emp.leaveBalance.sick - request.days : emp.leaveBalance.sick,
                            used: emp.leaveBalance.used + request.days,
                        };
                    })(),
                });
                const { dispatchNotification } = useNotificationStore.getState();
                dispatchNotification(
                    { title: 'Leave Approved', message: 'Your leave request has been approved!', type: 'Leave', link: '/user/leave' },
                    { userId: request.employeeId }, ['in-app', 'email']
                );
                const { logAction } = useAuditStore.getState();
                logAction('Leave Approval', `Approved ${requestId} by ${currentUserId}`);
                toast.success('Leave Approved', { description: 'Leave request approved successfully.' });
                return { success: true };
            }
            toast.error('Approval Failed', { description: (res as { error?: string }).error });
            return { success: false, error: (res as { error?: string }).error };
        } catch {
            toast.error('Approval Error', { description: 'Failed to approve leave request.' });
            return { success: false, error: 'Network error' };
        } finally {
            set({ isLoading: false });
        }
    },

    rejectLeave: async (requestId, reason) => {
        const { currentUserRole, currentUserId } = useAuthStore.getState();
        if (!['SUPER_ADMIN', 'HR_ADMIN', 'COO'].includes(currentUserRole)) {
            toast.error('Unauthorized', { description: 'You do not have permission to reject leave requests.' });
            return;
        }
        const request = get().leaveRequests.find((r) => r.id === requestId);
        if (!request || request.status !== 'Pending') {
            toast.error('Action Failed', { description: 'Request is already resolved or not found.' });
            return;
        }
        set({ isLoading: true });
        try {
            const res = await leaveService.rejectLeave(requestId, reason);
            if (res.success) {
                set((s) => ({
                    leaveRequests: s.leaveRequests.map((r) =>
                        r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: reason, actionBy: currentUserId || 'System', rejectedAt: new Date().toISOString() } : r
                    ),
                }));
                const { dispatchNotification } = useNotificationStore.getState();
                dispatchNotification(
                    { title: 'Leave Rejected', message: `Your leave was rejected. Reason: ${reason}`, type: 'Leave', link: '/user/leave' },
                    { userId: request.employeeId }, ['in-app', 'email']
                );
                const { logAction } = useAuditStore.getState();
                logAction('Leave Rejection', `Rejected ${requestId}: ${reason}`);
                toast.success('Request Rejected');
            } else {
                toast.error('Rejection Failed', { description: (res as { error?: string }).error });
            }
        } catch {
            toast.error('Rejection Error', { description: 'Failed to reject leave request.' });
        } finally {
            set({ isLoading: false });
        }
    },

    startReminderEngine: () => {
        const check = () => {
            const now = new Date();
            const ONE_HOUR = 3600000;
            set((s) => ({
                leaveRequests: s.leaveRequests.map((req) => {
                    if (req.status !== 'Pending') return req;
                    const requested = new Date(req.requestedAt);
                    if (isNaN(requested.getTime())) return req;
                    const diffHours = (now.getTime() - requested.getTime()) / ONE_HOUR;
                    const level = req.reminderLevel || 0;
                    let newLevel = level;
                    let shouldRemind = false;
                    let escalation = false;
                    if (diffHours >= 24 && diffHours < 72 && level < 1) { newLevel = 1; shouldRemind = true; }
                    else if (diffHours >= 72 && diffHours < 120 && level < 2) { newLevel = 2; shouldRemind = true; }
                    else if (diffHours >= 120 && level < 3) { newLevel = 3; shouldRemind = true; escalation = true; }
                    if (shouldRemind) {
                        const { dispatchNotification } = useNotificationStore.getState();
                        const empName = useEmployeeStore.getState().employees.find((e: { employee_id: string }) => e.employee_id === req.employeeId)?.name || req.employeeId;
                        if (escalation) {
                            dispatchNotification(
                                { title: 'ESCALATION: Overdue Leave Request', message: `Leave by ${empName} pending 5+ days.`, type: 'Leave', link: '/admin/leave' },
                                { roles: ['SUPER_ADMIN'] }, ['in-app', 'email']
                            );
                        } else {
                            dispatchNotification(
                                { title: 'Reminder: Pending Leave Request', message: `Leave by ${empName} (${Math.floor(diffHours)}h ago)`, type: 'Leave', link: '/admin/leave' },
                                { roles: ['COO', 'HR_ADMIN'] }, newLevel === 2 ? ['in-app', 'email'] : ['in-app']
                            );
                        }
                        return { ...req, reminderLevel: newLevel, lastRemindedAt: now.toISOString() };
                    }
                    return req;
                }),
            }));
        };
        check();
        const id = setInterval(check, 60000);
        return () => clearInterval(id);
    },
})
    ));
