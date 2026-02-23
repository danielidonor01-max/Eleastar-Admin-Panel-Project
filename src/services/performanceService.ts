import { type ApiResponse, mockSuccess, delay } from './api';
import type { ReviewCycle, PerformanceReview } from '../data/mockData';

/**
 * Service for Performance management
 */
export const performanceService = {
    /**
     * Fetches all review cycles
     */
    getReviewCycles: async (): Promise<ApiResponse<ReviewCycle[]>> => {
        await delay();
        // In reality: return api.get('/performance/cycles');
        return mockSuccess([]);
    },

    /**
     * Creates a new review cycle
     */
    createReviewCycle: async (cycle: Omit<ReviewCycle, 'id' | 'tenantId' | 'status'>): Promise<ApiResponse<ReviewCycle>> => {
        await delay();
        const newCycle: ReviewCycle = {
            ...cycle,
            id: `CYC-${Date.now()}`,
            tenantId: 'tenant-default',
            status: 'Draft'
        };
        // In reality: return api.post('/performance/cycles', newCycle);
        return mockSuccess(newCycle, 'Review cycle created successfully');
    },

    /**
     * Submits a self-review
     */
    submitReview: async (review: Omit<PerformanceReview, 'id' | 'tenantId' | 'status' | 'submittedAt'>): Promise<ApiResponse<PerformanceReview>> => {
        await delay();
        const newReview: PerformanceReview = {
            tenantId: 'tenant-123', // Mock tenant
            ...review,
            id: `REV-${Date.now()}`,
            status: 'Submitted',
            submittedAt: new Date().toISOString()
        };
        // In reality: return api.post('/performance/reviews', newReview);
        return mockSuccess(newReview, 'Performance review submitted');
    },

    /**
     * Updates a performance review (e.g., manager feedback)
     */
    updateReview: async (_id: string, _updates: Partial<PerformanceReview>): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/performance/reviews/${id}`, updates);
        return mockSuccess(undefined, 'Performance review updated');
    },

    /**
     * Approves a performance review
     */
    approveReview: async (_id: string, _finalData: Partial<PerformanceReview>): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/performance/reviews/${id}/approve`, finalData);
        return mockSuccess(undefined, 'Performance review approved');
    }
};
