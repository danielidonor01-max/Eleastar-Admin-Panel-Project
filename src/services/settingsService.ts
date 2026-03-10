import { api } from '@/utils/apiClient';
import { type ApiResponse } from './api';
import { type GlobalContent } from '@/types';

/**
 * Service for Global Application Settings
 */
export const settingsService = {
    /**
     * Fetches global application settings
     */
    getGlobalSettings: async (): Promise<ApiResponse<GlobalContent | null>> => {
      try {
        const { data } = await api.get('/settings/global');
        return { data: data?.data ?? null, success: true, message: data?.message };
      } catch (error: unknown) {
        const e = error as { message?: string };
        return { data: null, success: false, error: e?.message ?? 'Request failed' };
      }
    },

    /**
     * Updates global application settings
     */
    updateGlobal: async (section: keyof GlobalContent, data: Record<string, unknown>): Promise<ApiResponse<void>> => {
        try {
            const { data: updatedData } = await api.patch(`/settings/global/${section}`, { data });
            return { data: updatedData?.data ?? null, success: true, message: updatedData?.message ?? 'Global settings updated' };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: undefined, success: false, error: e?.message ?? 'Request failed', message: 'Failed to update global settings' };
        }
    },

    /**
     * Updates CEO signature
     */
    updateCeoSignature: async (url: string): Promise<ApiResponse<void>> => {
        try {
            const { data: updatedData } = await api.patch(`/settings/branding/signature`, { url });
            return { data: updatedData?.data ?? null, success: true, message: updatedData?.message ?? 'CEO signature updated' };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: undefined, success: false, error: e?.message ?? 'Request failed', message: 'Failed to update CEO signature' };
        }
    },
};
