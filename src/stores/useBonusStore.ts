import { create } from 'zustand';
import { toast } from 'sonner';
import { bonusService } from '../services/bonusService';
import type { BonusType, BonusRequest } from '../types';
import { useAuditStore } from './useAuditStore';
import { usePayrollStore } from './usePayrollStore';
import { useAuthStore } from './useAuthStore';
import { useNotificationStore } from './useNotificationStore';
import { createPersistedStore } from './middleware';

interface BonusState {
    bonusTypes: BonusType[];
    bonusRequests: BonusRequest[];
    isLoading: boolean;
}

interface BonusActions {
    fetchBonuses: () => Promise<void>;
    refreshBonuses: () => Promise<void>;
    createBonusType: (bonus: Omit<BonusType, 'id' | 'tenantId'>) => Promise<void>;
    updateBonusType: (id: string, updates: Partial<BonusType>) => Promise<void>;
    requestBonus: (employeeId: string, bonusTypeId: string, amount: number, reason: string) => Promise<void>;
    approveBonus: (requestId: string, approvedBy: string) => Promise<void>;
    rejectBonus: (requestId: string, reason: string) => Promise<void>;
}

export const useBonusStore = create<BonusState & BonusActions>()(
    createPersistedStore('bonus', (set, get) => ({
        bonusTypes: [],
        bonusRequests: [],
        isLoading: false,

        fetchBonuses: async () => {
            const [typeRes, reqRes] = await Promise.all([bonusService.getBonusTypes(), bonusService.getBonusRequests()]);
            if (typeRes.success) set({ bonusTypes: Array.isArray(typeRes.data) ? typeRes.data : ((typeRes.data as { data?: BonusType[] })?.data || []) });
            if (reqRes.success) set({ bonusRequests: Array.isArray(reqRes.data) ? reqRes.data : ((reqRes.data as { data?: BonusRequest[] })?.data || []) });
        },

        refreshBonuses: async () => { await get().fetchBonuses(); },

        createBonusType: async (bonus) => {
            set({ isLoading: true });
            try {
                const res = await bonusService.createBonusType(bonus);
                if (res.success && res.data) {
                    set((s) => ({ bonusTypes: [...s.bonusTypes, res.data!] }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Bonus Type Created', `Created: ${bonus.name}`);
                    toast.success('Bonus Created', { description: `Type "${bonus.name}" is now available.` });
                } else {
                    toast.error('Creation Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Creation Error'); }
            finally { set({ isLoading: false }); }
        },

        updateBonusType: async (id, updates) => {
            set({ isLoading: true });
            try {
                const res = await bonusService.updateBonusType(id, updates);
                if (res.success) {
                    set((s) => ({ bonusTypes: s.bonusTypes.map((b) => b.id === id ? { ...b, ...updates } : b) }));
                    toast.success('Bonus Updated', { description: 'Bonus type details saved.' });
                } else {
                    toast.error('Update Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Update Error'); }
            finally { set({ isLoading: false }); }
        },

        requestBonus: async (employeeId, bonusTypeId, amount, reason) => {
            set({ isLoading: true });
            try {
                const { currentUserId } = useAuthStore.getState();
                const { payrollStatus } = usePayrollStore.getState();
                const res = await bonusService.requestBonus({ employeeId, bonusTypeId, amount, reason, requestedBy: currentUserId || 'System', cycleId: payrollStatus.id });
                if (res.success && res.data) {
                    set((s) => ({ bonusRequests: [...s.bonusRequests, res.data!] }));
                    const { dispatchNotification } = useNotificationStore.getState();
                    dispatchNotification(
                        { title: 'New Bonus Request', message: `Bonus request for employee ${employeeId}`, type: 'Payroll', link: '/admin/bonus' },
                        { roles: ['SUPER_ADMIN', 'COO', 'FINANCE_ADMIN'] }
                    );
                    const { logAction } = useAuditStore.getState();
                    logAction('Bonus Requested', `Bonus for ${employeeId}: ₦${amount}`);
                    toast.success('Request Sent', { description: 'Bonus request submitted for approval.' });
                } else {
                    toast.error('Request Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Request Error'); }
            finally { set({ isLoading: false }); }
        },

        approveBonus: async (requestId, approvedBy) => {
            set({ isLoading: true });
            try {
                const res = await bonusService.approveBonus(requestId, approvedBy);
                if (res.success) {
                    set((s) => ({ bonusRequests: s.bonusRequests.map((r) => r.id === requestId ? { ...r, status: 'Approved', approvedBy, approvedAt: new Date().toISOString() } : r) }));
                    const req = get().bonusRequests.find((r) => r.id === requestId);
                    if (req) {
                        const { addPayrollAdjustment } = usePayrollStore.getState();
                        await addPayrollAdjustment(req.employeeId, 'Bonus', req.amount, `Bonus: ${req.reason}`);
                        const { dispatchNotification } = useNotificationStore.getState();
                        dispatchNotification(
                            { title: 'Bonus Approved', message: 'Your bonus request has been approved!', type: 'Payroll', link: '/user/payroll' },
                            { userId: req.employeeId }
                        );
                        const { logAction } = useAuditStore.getState();
                        logAction('Bonus Approved', `${requestId} approved by ${approvedBy}`);
                    }
                    toast.success('Bonus Approved', { description: 'The bonus has been added to payroll.' });
                } else {
                    toast.error('Approval Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Approval Error'); }
            finally { set({ isLoading: false }); }
        },

        rejectBonus: async (requestId, reason) => {
            set({ isLoading: true });
            try {
                const res = await bonusService.rejectBonus(requestId, reason);
                if (res.success) {
                    set((s) => ({ bonusRequests: s.bonusRequests.map((r) => r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: reason } : r) }));
                    const req = get().bonusRequests.find((r) => r.id === requestId);
                    if (req) {
                        const { dispatchNotification } = useNotificationStore.getState();
                        dispatchNotification(
                            { title: 'Bonus Rejected', message: `Request rejected: ${reason}`, type: 'Payroll', link: '/user/payroll' },
                            { userId: req.employeeId }
                        );
                        const { logAction } = useAuditStore.getState();
                        logAction('Bonus Rejected', `${requestId}: ${reason}`);
                    }
                    toast.success('Bonus Rejected', { description: 'The request has been declined.' });
                } else {
                    toast.error('Rejection Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Rejection Error'); }
            finally { set({ isLoading: false }); }
        },
    })
    ));
