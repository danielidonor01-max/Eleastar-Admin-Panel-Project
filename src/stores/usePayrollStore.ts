import { create } from 'zustand';
import { toast } from 'sonner';
import { payrollService } from '../services/payrollService';
import type { PayrollCycle, AdminRole } from '../types';
import { createPersistedStore } from './middleware';
import { useAuthStore } from './useAuthStore';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';

const INITIAL_PAYROLL: PayrollCycle = {
    id: '', tenantId: 'tenant-default', month: '', year: 0, status: 'Draft', adjustments: [],
};

interface PayrollState {
    payrollStatus: PayrollCycle;
    isLoading: boolean;
}

interface PayrollActions {
    fetchPayrollStatus: () => Promise<void>;
    updatePayrollStatus: (status: PayrollCycle['status']) => Promise<void>;
    addPayrollAdjustment: (empId: string, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => Promise<void>;
    bulkPayrollAdjustment: (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => Promise<void>;
    cooReviewPayroll: () => void;
    cfoApprovePayroll: () => void;
    refreshPayroll: () => Promise<void>;
    refreshPayrollStatus: () => Promise<void>;
}

export const usePayrollStore = create<PayrollState & PayrollActions>()(
    createPersistedStore('payroll', (set, get) => ({
        payrollStatus: INITIAL_PAYROLL,
        isLoading: false,

        fetchPayrollStatus: async () => {
            const res = await payrollService.getPayrollStatus();
            if (res.success) {
                const data = Array.isArray(res.data) ? res.data : ((res.data as { data?: PayrollCycle[] })?.data || []);
                if (data.length > 0) set({ payrollStatus: data[0] });
            }
        },

        refreshPayroll: async () => {
            const res = await payrollService.getPayrollStatus();
            if (res.success) {
                const data = Array.isArray(res.data) ? res.data : ((res.data as { data?: PayrollCycle[] })?.data || []);
                if (data.length > 0) set({ payrollStatus: data[0] });
            }
        },

        refreshPayrollStatus: async () => {
            await get().fetchPayrollStatus();
        },

        updatePayrollStatus: async (status) => {
            const { currentUserRole } = useAuthStore.getState();
            const authorized: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
            if (!authorized.includes(currentUserRole)) {
                toast.error('Unauthorized', { description: 'Only Finance or SUPER_ADMINs can update payroll status.' });
                return;
            }
            const { payrollStatus } = get();
            if (payrollStatus.status === 'Paid' && status !== 'Paid') {
                toast.error('Action Denied', { description: 'Cannot revert a completed Paid payroll cycle.' });
                return;
            }
            set({ isLoading: true });
            try {
                const res = await payrollService.updateStatus(payrollStatus.id, status);
                if (res.success) {
                    set((s) => ({ payrollStatus: { ...s.payrollStatus, status } }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Updated Payroll Status', `Changed status to ${status}`);
                    if (status === 'Approved' || status === 'Paid') {
                        const { dispatchNotification } = useNotificationStore.getState();
                        dispatchNotification(
                            { title: 'Payslip Available', message: `Payroll updated to ${status}. Check your Payslip.`, type: 'Payroll', link: '/user/payroll' },
                            { roles: ['USER'] }, ['in-app', 'email']
                        );
                    }
                    toast.success('Status Updated', { description: `Payroll status updated to ${status}.` });
                } else {
                    toast.error('Update Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Update Error', { description: 'Failed to update payroll status.' });
            } finally {
                set({ isLoading: false });
            }
        },

        addPayrollAdjustment: async (empId, type, amount, reason) => {
            const { currentUserRole } = useAuthStore.getState();
            const authorized: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
            if (!authorized.includes(currentUserRole)) {
                toast.error('Unauthorized', { description: 'You do not have permission to add adjustments.' });
                return;
            }
            const { payrollStatus } = get();
            if (payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid') {
                toast.error('Action Locked', { description: `Cannot add adjustments when Payroll is ${payrollStatus.status}.` });
                return;
            }
            set({ isLoading: true });
            try {
                const res = await payrollService.addAdjustment(empId, type, amount, reason);
                if (res.success) {
                    set((s) => ({ payrollStatus: { ...s.payrollStatus, adjustments: [...s.payrollStatus.adjustments, { empId, type, amount, reason }] } }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Payroll Adjustment', `Added ${type} of ₦${amount} for ${empId}`);
                    toast.success('Adjustment Added', { description: 'Payroll adjustment recorded successfully.' });
                } else {
                    toast.error('Adjustment Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Adjustment Error', { description: 'Failed to record payroll adjustment.' });
            } finally {
                set({ isLoading: false });
            }
        },

        bulkPayrollAdjustment: async (empIds, type, amount, reason) => {
            const { currentUserRole } = useAuthStore.getState();
            const authorized: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
            if (!authorized.includes(currentUserRole)) {
                toast.error('Unauthorized', { description: 'You do not have permission to create bulk adjustments.' });
                return;
            }
            const { payrollStatus } = get();
            if (payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid') {
                toast.error('Action Locked', { description: `Cannot add adjustments when Payroll is ${payrollStatus.status}.` });
                return;
            }
            set({ isLoading: true });
            try {
                const responses = await Promise.all(empIds.map((id) => payrollService.addAdjustment(id, type, amount, reason)));
                if (responses.every((r) => r.success)) {
                    const newAdjustments = empIds.map((empId) => ({ empId, type, amount, reason }));
                    set((s) => ({ payrollStatus: { ...s.payrollStatus, adjustments: [...s.payrollStatus.adjustments, ...newAdjustments] } }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Bulk Adjustment', `${type} for ${empIds.length} employees`);
                    toast.success('Bulk Adjustment', { description: `Applied adjustment to ${empIds.length} employees.` });
                } else {
                    toast.error('Bulk Adjustment Failed', { description: 'Some adjustments failed.' });
                }
            } catch {
                toast.error('Bulk Adjustment Error');
            } finally {
                set({ isLoading: false });
            }
        },

        cooReviewPayroll: () => {
            get().updatePayrollStatus('Reviewed');
            const { logAction } = useAuditStore.getState();
            logAction('Payroll Review', `COO reviewed payroll for ${get().payrollStatus.month}`);
        },

        cfoApprovePayroll: () => {
            get().updatePayrollStatus('Approved');
            const { logAction } = useAuditStore.getState();
            logAction('Payroll Approval', `CFO approved payroll for ${get().payrollStatus.month}`);
        },
    })
    ));
