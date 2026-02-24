import { type ApiResponse, mockSuccess, delay } from './api';
import { initialGlobalContent, type GlobalContent } from '../data/mockData';

/**
 * Service for Global Application Settings
 */
export const settingsService = {
    /**
     * Fetches global application settings
     */
    getGlobalSettings: async (): Promise<ApiResponse<GlobalContent>> => {
        await delay();
        // In reality: return api.get('/settings/global');
        return mockSuccess(initialGlobalContent);
    },

    /**
     * Updates global application settings
     */
    updateGlobal: async (section: keyof GlobalContent, _data: any): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/settings/global/${section}`, { data });
        return mockSuccess(undefined, `Global setting '${section}' updated`);
    },

    /**
     * Updates CEO Signature URL
     */
    updateCeoSignature: async (_url: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.post('/settings/branding/signature', { url });
        return mockSuccess(undefined, 'CEO Signature updated');
    }
};
