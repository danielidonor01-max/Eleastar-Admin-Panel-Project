import { type ApiResponse, mockSuccess, delay } from './api';
import type { BonusType, BonusRequest } from '@/types';

/**
 * Service for Bonus Management
 */
export const bonusService = {
    /**
     * Fetches all bonus types
     */
    getBonusTypes: async (): Promise<ApiResponse<BonusType[]>> => {
        await delay();
        return mockSuccess([]);
    },

    /**
     * Fetches all bonus requests
     */
    getBonusRequests: async (): Promise<ApiResponse<BonusRequest[]>> => {
        await delay();
        return mockSuccess([]);
    },

    /**
     * Creates a new bonus type
     */
    createBonusType: async (bonus: Omit<BonusType, 'id' | 'tenantId'>): Promise<ApiResponse<BonusType>> => {
        await delay();
        const newBonus: BonusType = { ...bonus, id: Math.random().toString(36).substr(2, 9), tenantId: 'tenant-default' };
        return mockSuccess(newBonus, 'Bonus type created');
    },

    /**
     * Updates an existing bonus type
     */
    updateBonusType: async (_id: string, _updates: Partial<BonusType>): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Bonus type updated');
    },

    /**
     * Requests a bonus for an employee
     */
    requestBonus: async (request: Omit<BonusRequest, 'id' | 'tenantId' | 'status' | 'requestedAt'>): Promise<ApiResponse<BonusRequest>> => {
        await delay();
        const newRequest: BonusRequest = {
            ...request,
            id: Math.random().toString(36).substr(2, 9),
            tenantId: 'tenant-default',
            status: 'Pending',
            requestedAt: new Date().toISOString()
        };
        return mockSuccess(newRequest, 'Bonus request submitted');
    },

    /**
     * Approves a bonus request
     */
    approveBonus: async (_requestId: string, _approvedBy: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Bonus approved');
    },

    /**
     * Rejects a bonus request
     */
    rejectBonus: async (_requestId: string, _reason: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Bonus request rejected');
    }
};
