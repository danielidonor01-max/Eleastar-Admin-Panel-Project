import { type ApiResponse, mockSuccess, delay } from './api';
import type { LedgerEntry } from '../data/mockData';

/**
 * Service for Internal Finance Ledger (Payroll-related only)
 */
export const financeService = {
    /**
     * Fetches all ledger entries
     */
    getLedgerEntries: async (): Promise<ApiResponse<LedgerEntry[]>> => {
        await delay();
        // In reality: return api.get('/finance/ledger');
        return mockSuccess([]);
    },

    /**
     * Approves funding for a payroll cycle
     */
    approveFunding: async (_cycleId: string, _pin: string): Promise<ApiResponse<void>> => {
        await delay();
        // Mock PIN validation happens server-side normally
        return mockSuccess(undefined, 'Funding approved successfully');
    },

    /**
     * Executes a ledger batch payment
     */
    executeBatch: async (_cycleId: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Payment batch executed');
    }
};
