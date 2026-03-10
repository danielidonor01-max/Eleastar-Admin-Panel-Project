import { type ApiResponse, mockSuccess, delay } from './api';
import type { PromotionRequest, PromotionEligibilityRule } from '@/types';

/**
 * Service for Promotion Management
 */
export const promotionService = {
    /**
     * Fetches all promotion requests
     */
    getPromotionRequests: async (): Promise<ApiResponse<PromotionRequest[]>> => {
        await delay();
        return mockSuccess([]);
    },

    /**
     * Fetches all eligibility rules
     */
    getEligibilityRules: async (): Promise<ApiResponse<PromotionEligibilityRule[]>> => {
        await delay();
        return mockSuccess([]);
    },

    /**
     * Requests a promotion for an employee
     */
    requestPromotion: async (request: Omit<PromotionRequest, 'id' | 'tenantId' | 'status' | 'requestedAt'>): Promise<ApiResponse<PromotionRequest>> => {
        await delay();
        const newRequest: PromotionRequest = {
            ...request,
            id: `PR-${Date.now()}`,
            tenantId: 'tenant-default',
            status: 'Pending',
            requestedAt: new Date().toISOString()
        };
        return mockSuccess(newRequest, 'Promotion request submitted');
    },

    /**
     * Approves a promotion request
     */
    approvePromotion: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Promotion approved');
    },

    /**
     * Rejects a promotion request
     */
    rejectPromotion: async (_id: string, _reason: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Promotion request rejected');
    },

    /**
     * Saves or updates an eligibility rule
     */
    saveEligibilityRule: async (_rule: PromotionEligibilityRule): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Eligibility rule saved');
    }
};
