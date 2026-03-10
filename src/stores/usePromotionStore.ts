import { create } from 'zustand';
import { toast } from 'sonner';
import { promotionService } from '../services/promotionService';
import type { PromotionRequest, PromotionEligibilityRule, Employee, PerformanceReview, RolesProps, AdminRole } from '../types';
import { createPersistedStore } from './middleware';
import { useNotificationStore } from './useNotificationStore';
import { useAuditStore } from './useAuditStore';
import { useAuthStore } from './useAuthStore';
import { useEmployeeStore } from './useEmployeeStore';
import { usePerformanceStore } from './usePerformanceStore';

interface PromotionState {
    promotionRequests: PromotionRequest[];
    eligibilityRules: PromotionEligibilityRule[];
    isLoading: boolean;
}

interface PromotionActions {
    fetchPromotions: () => Promise<void>;
    refreshPromotions: () => Promise<void>;
    requestPromotion: (req: Omit<PromotionRequest, 'id' | 'tenantId' | 'status' | 'requestedAt'>) => Promise<void>;
    approvePromotion: (requestId: string) => Promise<void>;
    rejectPromotion: (requestId: string, reason: string) => Promise<void>;
    saveEligibilityRule: (rule: PromotionEligibilityRule) => Promise<void>;
    evaluateEligibility: (employeeId: string, newRole: string) => { isEligible: boolean; reasons: string[]; scores: { performance: number; tenureMonths: number } };
}

export const usePromotionStore = create<PromotionState & PromotionActions>()(
    createPersistedStore('promotion', (set, get) => ({
        promotionRequests: [],
        eligibilityRules: [],
        isLoading: false,

        fetchPromotions: async () => {
            const [promoRes, rulesRes] = await Promise.all([promotionService.getPromotionRequests(), promotionService.getEligibilityRules()]);
            if (promoRes.success) set({ promotionRequests: Array.isArray(promoRes.data) ? promoRes.data : ((promoRes.data as { data?: PromotionRequest[] })?.data || []) });
            if (rulesRes.success) set({ eligibilityRules: Array.isArray(rulesRes.data) ? rulesRes.data : ((rulesRes.data as { data?: PromotionEligibilityRule[] })?.data || []) });
        },

        refreshPromotions: async () => { await get().fetchPromotions(); },

        requestPromotion: async (req) => {
            set({ isLoading: true });
            try {
                const res = await promotionService.requestPromotion(req);
                if (res.success && res.data) {
                    set((s) => ({ promotionRequests: [...s.promotionRequests, res.data!] }));
                    const { dispatchNotification } = useNotificationStore.getState();
                    dispatchNotification(
                        { title: 'Promotion Request', message: `New promotion request for ${req.employeeId}`, type: 'HR', link: '/admin/promotions' },
                        { roles: ['SUPER_ADMIN', 'COO'] }
                    );
                    const { logAction } = useAuditStore.getState();
                    logAction('Promotion Request', `Requested promotion for ${req.employeeId}`);
                    toast.success('Request Sent', { description: 'Promotion request has been submitted.' });
                } else {
                    toast.error('Request Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Request Error'); }
            finally { set({ isLoading: false }); }
        },

        approvePromotion: async (requestId) => {
            set({ isLoading: true });
            try {
                const res = await promotionService.approvePromotion(requestId);
                if (res.success) {
                    const { currentUserId } = useAuthStore.getState();
                    set((s) => ({ promotionRequests: s.promotionRequests.map((r) => r.id === requestId ? { ...r, status: 'Approved', approvedBy: currentUserId || 'System', approvedAt: new Date().toISOString() } : r) }));
                    const req = get().promotionRequests.find((r) => r.id === requestId);
                    if (req) {
                        const { updateEmployee } = useEmployeeStore.getState();
                        await updateEmployee(req.employeeId as unknown as string, { role_relation: req.newRole as unknown as RolesProps, salary: req.proposedSalary as unknown as string, role: req.newRole as unknown as AdminRole });
                        const { dispatchNotification } = useNotificationStore.getState();
                        dispatchNotification(
                            { title: 'Promotion Approved', message: `Congratulations! Promoted to ${req.newRole}`, type: 'HR', link: '/user/profile' },
                            { userId: req.employeeId }
                        );
                        const { logAction } = useAuditStore.getState();
                        logAction('Promotion Approved', `Approved promotion for ${req.employeeId}`);
                    }
                    toast.success('Promotion Approved', { description: 'Employee has been promoted.' });
                } else {
                    toast.error('Approval Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Approval Error'); }
            finally { set({ isLoading: false }); }
        },

        rejectPromotion: async (requestId, reason) => {
            set({ isLoading: true });
            try {
                const res = await promotionService.rejectPromotion(requestId, reason);
                if (res.success) {
                    set((s) => ({ promotionRequests: s.promotionRequests.map((r) => r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: reason } : r) }));
                    const req = get().promotionRequests.find((r) => r.id === requestId);
                    if (req) {
                        const { dispatchNotification } = useNotificationStore.getState();
                        dispatchNotification(
                            { title: 'Promotion Rejected', message: `Request rejected: ${reason}`, type: 'HR', link: '/user/profile' },
                            { userId: req.employeeId }
                        );
                        const { logAction } = useAuditStore.getState();
                        logAction('Promotion Rejected', `Rejected ${requestId}`);
                    }
                    toast.success('Promotion Rejected', { description: 'The request has been declined.' });
                } else {
                    toast.error('Rejection Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Rejection Error'); }
            finally { set({ isLoading: false }); }
        },

        saveEligibilityRule: async (rule) => {
            set({ isLoading: true });
            try {
                const res = await promotionService.saveEligibilityRule(rule);
                if (res.success) {
                    set((s) => {
                        const exists = s.eligibilityRules.find((r) => r.id === rule.id);
                        return { eligibilityRules: exists ? s.eligibilityRules.map((r) => r.id === rule.id ? rule : r) : [...s.eligibilityRules, rule] };
                    });
                    const { logAction } = useAuditStore.getState();
                    logAction('Eligibility Rule Save', `Rule ${rule.id} saved.`);
                    toast.success('Rule Saved', { description: 'Promotion eligibility criteria updated.' });
                } else {
                    toast.error('Save Failed', { description: (res as { error?: string }).error });
                }
            } catch { toast.error('Save Error'); }
            finally { set({ isLoading: false }); }
        },

        evaluateEligibility: (employeeId, newRole) => {
            const { employees } = useEmployeeStore.getState();
            const { performanceReviews } = usePerformanceStore.getState();
            const employee = employees.find((e: Partial<Employee>) => e.id === employeeId as unknown as number);
            if (!employee) return { isEligible: false, reasons: ['Employee not found'], scores: { performance: 0, tenureMonths: 0 } };

            const tenureMonths = employee.joinedAt
                ? Math.floor((Date.now() - new Date(employee.joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
                : 0;

            const reviews = performanceReviews;
            const latestReview = reviews
                .filter((r: Partial<PerformanceReview>) => r.employeeId === employeeId && r.status === 'Approved')
                .sort((a: { reviewedAt?: string }, b: { reviewedAt?: string }) => {
                    const aT = a.reviewedAt ? new Date(a.reviewedAt).getTime() : 0;
                    const bT = b.reviewedAt ? new Date(b.reviewedAt).getTime() : 0;
                    return bT - aT;
                })[0];
            const performance = latestReview?.managerRating ?? 0;

            const warnings: string[] = [];
            const matchedRules = get().eligibilityRules.filter((r) => r.targetRole === newRole || r.targetRole === 'Global');
            for (const rule of matchedRules) {
                if (rule.minTimeInRoleMonths && tenureMonths < rule.minTimeInRoleMonths) {
                    warnings.push(`Requires ${rule.minTimeInRoleMonths} months tenure (current: ${tenureMonths})`);
                }
                if (rule.minPerformanceRating && performance < rule.minPerformanceRating) {
                    warnings.push(`Requires min rating of ${rule.minPerformanceRating} (current: ${performance})`);
                }
            }
            return { isEligible: warnings.length === 0, reasons: warnings, scores: { performance, tenureMonths } };
        },
    })
    ));
