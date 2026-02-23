import { type ApiResponse, mockSuccess, delay } from './api';
import type { Job } from '../data/mockData';

/**
 * Service for Job and Recruitment management
 */
export const jobService = {
    /**
     * Fetches all job listings
     */
    getAllJobs: async (): Promise<ApiResponse<Job[]>> => {
        await delay();
        // In reality: return api.get('/jobs');
        return mockSuccess([]); // Return empty for now as in current AdminContext
    },

    /**
     * Creates a new job listing
     */
    createJob: async (job: Job): Promise<ApiResponse<Job>> => {
        await delay();
        // In reality: return api.post('/jobs', job);
        return mockSuccess(job, 'Job posted successfully');
    },

    /**
     * Updates an existing job
     */
    updateJob: async (_id: string, _updates: Partial<Job>): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/jobs/${_id}`, _updates);
        return mockSuccess(undefined, 'Job updated successfully');
    },

    /**
     * Deletes a job listing
     */
    deleteJob: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.delete(`/jobs/${_id}`);
        return mockSuccess(undefined, 'Job deleted successfully');
    }
};
