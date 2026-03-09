import { create } from 'zustand';
import { toast } from 'sonner';
import { performanceService } from '../services/performanceService';
import type { ReviewCycle, PerformanceReview, AdminRole, Employee } from '../types';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';
import { useAuthStore } from './useAuthStore';
import { useEmployeeStore } from './useEmployeeStore';
import { createPersistedStore } from './middleware';

interface PerformanceState {
    reviewCycles: ReviewCycle[];
    performanceReviews: PerformanceReview[];
    isLoading: boolean;
}

interface PerformanceActions {
    fetchReviewCycles: () => Promise<void>;
    refreshReviewCycles: () => Promise<void>;
    createReviewCycle: (cycle: Omit<ReviewCycle, 'id' | 'tenantId' | 'status'>) => Promise<void>;
    startReviewCycle: (id: string) => Promise<void>;
    submitSelfReview: (id: string, selfReview: string, rating: number) => Promise<void>;
    updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
    approvePerformanceReview: (id: string, finalData: Partial<PerformanceReview>) => Promise<void>;
    requestRevision: (id: string, feedback: string) => Promise<void>;
}

export const usePerformanceStore = create<PerformanceState & PerformanceActions>()(
    createPersistedStore('performance', (set, get) => ({
        reviewCycles: [],
        performanceReviews: [],
        isLoading: false,

        fetchReviewCycles: async () => {
            const res = await performanceService.getReviewCycles();
            if (res.success) {
                set({ reviewCycles: Array.isArray(res.data) ? res.data : ((res.data as { data?: ReviewCycle[] })?.data || []) });
            }
        },

        refreshReviewCycles: async () => {
            await get().fetchReviewCycles();
        },

        createReviewCycle: async (cycle) => {
            set({ isLoading: true });
            try {
                const res = await performanceService.createReviewCycle(cycle);
                if (res.success) {
                    set((s) => ({ reviewCycles: [res.data as ReviewCycle, ...s.reviewCycles] }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Review Cycle', `Created: ${cycle.title}`);
                    const { dispatchNotification } = useNotificationStore.getState();
                    dispatchNotification(
                        { title: 'New Performance Review Cycle', message: `"${cycle.title}" has started.`, type: 'Performance', link: '/user/performance' },
                        {}, ['in-app']
                    );
                    toast.success('Cycle Created', { description: 'Performance review cycle has been created.' });
                } else {
                    toast.error('Creation Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Creation Error');
            } finally {
                set({ isLoading: false });
            }
        },

        startReviewCycle: async (id) => {
            set({ isLoading: true });
            try {
                set((s) => ({ reviewCycles: s.reviewCycles.map((c) => c.id === id ? { ...c, status: 'Active' } : c) }));
                const cycle = get().reviewCycles.find((c) => c.id === id);
                if (cycle) {
                    const { currentTenantId } = useAuthStore.getState();
                    const { employees } = useEmployeeStore.getState();
                    const newReviews: PerformanceReview[] = employees.map((emp: Employee) => ({
                        id: `PR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        tenantId: currentTenantId,
                        employeeId: emp.id.toString(),
                        cycleId: id,
                        status: 'Pending',
                        rating: 0,
                        selfReview: '',
                        managerFeedback: '',
                        managerRating: 0,
                        submittedAt: '',
                        reviewedAt: '',
                        reviewedBy: '',
                        internalNotes: '',
                        recommendation: 'None',
                    }));
                    set((s) => ({ performanceReviews: [...s.performanceReviews, ...newReviews] }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Review Cycle Started', `Generated ${newReviews.length} reviews for ${cycle.title}`);
                    toast.success('Cycle Started', { description: `Generated ${newReviews.length} reviews.` });
                }
            } catch {
                toast.error('Error', { description: 'Failed to start review cycle.' });
            } finally {
                set({ isLoading: false });
            }
        },

        submitSelfReview: async (id, selfReview, rating) => {
            set({ isLoading: true });
            try {
                const existing = get().performanceReviews.find((r) => r.id === id);
                if (!existing) { toast.error('Submission Error', { description: 'Review record not found.' }); return; }
                const reviewUpdate = { cycleId: existing.cycleId, employeeId: existing.employeeId, selfReview, rating };
                const res = await performanceService.submitReview(reviewUpdate);
                if (res.success) {
                    set((s) => ({
                        performanceReviews: s.performanceReviews.map((r) =>
                            r.id === id ? { ...r, selfReview, rating, status: 'Submitted', submittedAt: new Date().toISOString() } : r
                        ),
                    }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Self Review Submitted', `User ${existing.employeeId} submitted self review`);
                    const { dispatchNotification } = useNotificationStore.getState();
                    dispatchNotification(
                        { title: 'New Self-Evaluation', message: `Employee submitted self-evaluation.`, type: 'Performance', link: '/admin/performance' },
                        { roles: ['COO', 'SUPER_ADMIN', 'HR_ADMIN'] }, ['in-app']
                    );
                    toast.success('Review Submitted', { description: 'Self-evaluation submitted successfully.' });
                } else {
                    toast.error('Submission Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Submission Error');
            } finally {
                set({ isLoading: false });
            }
        },

        updatePerformanceReview: async (id, updates) => {
            const { currentUserRole } = useAuthStore.getState();
            const authorized: AdminRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
            if (!authorized.includes(currentUserRole)) {
                toast.error('Unauthorized', { description: 'You do not have permission to update reviews.' });
                return;
            }
            const review = get().performanceReviews.find((r) => r.id === id);
            if (review?.status === 'Approved') {
                toast.error('Action Locked', { description: 'Cannot update a finalized review.' });
                return;
            }
            set({ isLoading: true });
            try {
                const res = await performanceService.updateReview(id, updates);
                if (res.success) {
                    set((s) => ({
                        performanceReviews: s.performanceReviews.map((r) => r.id === id ? { ...r, status: 'Under Review', ...updates } : r),
                    }));
                    toast.success('Draft Saved', { description: 'Review changes have been recorded.' });
                } else {
                    toast.error('Update Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Update Error');
            } finally {
                set({ isLoading: false });
            }
        },

        approvePerformanceReview: async (id, finalData) => {
            const { currentUserRole, currentUserId } = useAuthStore.getState();
            const authorized: AdminRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
            if (!authorized.includes(currentUserRole)) {
                toast.error('Unauthorized', { description: 'You do not have permission to approve reviews.' });
                return;
            }
            const review = get().performanceReviews.find((r) => r.id === id);
            if (!review) return;
            if (review.status === 'Approved') { toast.info('Already Finalized'); return; }
            set({ isLoading: true });
            try {
                const res = await performanceService.approveReview(id, finalData);
                if (res.success) {
                    set((s) => ({
                        performanceReviews: s.performanceReviews.map((r) =>
                            r.id === id ? { ...r, ...finalData, status: 'Approved', reviewedBy: currentUserId || 'System', reviewedAt: new Date().toISOString() } : r
                        ),
                    }));
                    const { dispatchNotification } = useNotificationStore.getState();
                    dispatchNotification(
                        { title: 'Performance Review Completed', message: 'Your review has been approved.', type: 'Performance', link: '/user/performance' },
                        { userId: review.employeeId }, ['in-app', 'email']
                    );
                    const { logAction } = useAuditStore.getState();
                    logAction('Review Approved', `Finalized review for ${review.employeeId}`);
                    toast.success('Review Approved', { description: 'Performance review finalized successfully.' });
                } else {
                    toast.error('Approval Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Approval Error');
            } finally {
                set({ isLoading: false });
            }
        },

        requestRevision: async (id, feedback) => {
            const review = get().performanceReviews.find((r) => r.id === id);
            if (!review) return;
            set({ isLoading: true });
            try {
                const res = await performanceService.updateReview(id, { managerFeedback: feedback, status: 'Revision Requested' });
                if (res.success) {
                    const { currentUserId } = useAuthStore.getState();
                    set((s) => ({
                        performanceReviews: s.performanceReviews.map((r) =>
                            r.id === id ? { ...r, status: 'Revision Requested', managerFeedback: feedback, reviewedBy: currentUserId || 'System', reviewedAt: new Date().toISOString() } : r
                        ),
                    }));
                    const { dispatchNotification } = useNotificationStore.getState();
                    dispatchNotification(
                        { title: 'Revision Requested', message: 'Manager requested changes to your self-evaluation.', type: 'Performance', link: '/user/performance' },
                        { userId: review.employeeId }, ['in-app', 'email']
                    );
                    toast.success('Revision Requested', { description: 'User has been notified.' });
                } else {
                    toast.error('Request Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Request Error');
            } finally {
                set({ isLoading: false });
            }
        },
    })
    ));
    