import { type ApiResponse, mockSuccess, delay } from './api';
import type { SalaryStructure } from '../data/mockData';

/**
 * Service for Salary Structure Management
 */
export const salaryService = {
    /**
     * Fetches all salary structures
     */
    getSalaryStructures: async (): Promise<ApiResponse<SalaryStructure[]>> => {
        await delay();
        // In reality: return api.get('/salary/structures');
        return mockSuccess([]);
    },

    /**
     * Saves or updates a salary structure
     */
    saveSalaryStructure: async (structure: SalaryStructure): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.post('/salary/structures', structure);
        return mockSuccess(undefined, `Salary structure for ${structure.role} saved`);
    }
};
