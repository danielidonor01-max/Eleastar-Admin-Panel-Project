import { type ApiResponse, mockSuccess, delay } from './api';
import type { Department } from '../data/mockData';

/**
 * Service for Department Management
 */
export const departmentService = {
    /**
     * Fetches all departments
     */
    getDepartments: async (): Promise<ApiResponse<Department[]>> => {
        await delay();
        // In reality: return api.get('/departments');
        return mockSuccess([]);
    },

    /**
     * Saves or updates a department (including its salary band)
     */
    saveDepartment: async (dept: Department): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.post('/departments', dept);
        return mockSuccess(undefined, `Department ${dept.name} saved`);
    },

    /**
     * Deletes a department
     */
    deleteDepartment: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.delete(`/departments/${id}`);
        return mockSuccess(undefined, `Department deleted`);
    }
};
