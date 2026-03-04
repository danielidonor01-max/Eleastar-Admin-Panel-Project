import { type ApiResponse, mockSuccess, delay } from './api';
import { CMS_API_BASE_URL, CMS_PUBLIC_API_KEY } from '../config';
import {
    type CMSSection,
    type ServiceItem,
    type FooterSection,
    type FooterContent,
    type ServiceCollection,
    initialServicesCollection
} from '../data/mockData';
// import { fallbackCMSData } from '../data/fallbackCMS';
import type { CMSData } from '../types/cms';

// Helper for fetching tokens securely. Assuming the app stores 'token' in localStorage
const getAuthToken = () => localStorage.getItem('token') || '';

/**
 * Service for Website Content Management (CMS)
 */
export const cmsService = {
    /**
     * Gets public slugs - no auth, relies on API Key
     */
    getPublicCMSSlugs: async (): Promise<ApiResponse<{ name: string; slug: string }[]>> => {
        try {
            const response = await fetch(`${CMS_API_BASE_URL}/cms/get-slugs`, {
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return {
                data: data.data || [],
                success: true,
                message: data.message
            };
        } catch (error: any) {
            return { data: [] as any, success: false, error: error.message };
        }
    },

    /**
     * Gets sections for a specific public page
     */
    getPublicPageSections: async (slug: string): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${CMS_API_BASE_URL}/cms/pages/${slug}`, {
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return {
                data: data.data || null,
                success: true,
                message: data.message
            };
        } catch (error: any) {
            return { data: null as any, success: false, error: error.message };
        }
    },

    /**
     * Gets public global navigation menus
     */
    getPublicMenus: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${CMS_API_BASE_URL}/cms/menus`, {
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return {
                data: data.data || [],
                success: true,
                message: data.message
            };
        } catch (error: any) {
            return { data: [] as any, success: false, error: error.message };
        }
    },

    /**
     * Gets public settings (footer, global variables)
     */
    getPublicSettingsGroups: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${CMS_API_BASE_URL}/cms/settings/groups`, {
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return {
                data: data.data || [],
                success: true,
                message: data.message
            };
        } catch (error: any) {
            return { data: [] as any, success: false, error: error.message };
        }
    },

    /**
     * Fetches all CMS pages (Admin)
     */
    getCMSPages: async (): Promise<ApiResponse<CMSData | null>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/pages`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return {
                data: data.data || null,
                success: true,
                message: data.message
            };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    /**
     * Generates a new CMS API Key (Admin)
     */
    generateApiKey: async (name: string): Promise<ApiResponse<{ name: string; key: string }>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/api-keys`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to generate API key');
            return {
                data: data.data,
                success: true,
                message: data.message || 'API key generated successfully'
            };
        } catch (error: any) {
            return { data: null as any, success: false, error: error.message };
        }
    },

    /**
     * Updates CMS content block (Admin)
     */
    updateCMSSection: async (sectionId: string | number, updates: any): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/sections/${sectionId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update section');
            return {
                data: data.data,
                success: true,
                message: data.message || 'CMS content updated successfully'
            };
        } catch (error: any) {
            return { data: null as any, success: false, error: error.message };
        }
    },

    /**
     * Updates CMS Section status e.g., publish (Admin)
     */
    updateCMSSectionStatus: async (sectionId: string | number, status: 'published' | 'draft'): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/sections/${sectionId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update section status');
            return {
                data: data.data,
                success: true,
                message: data.message || 'Section status updated'
            };
        } catch (error: any) {
            return { data: null as any, success: false, error: error.message };
        }
    },


    /**
     * FALLBACK Methods - still using mockData temporarily depending on the context consumption.
     * Over time, these will be replaced by the Live endpoints above when fully integrated
     */
    getCMSContent: async (): Promise<ApiResponse<CMSData | null>> => {
        await delay();
        // Removed fallbackCMSData per user request to rely purely on Backend API
        return mockSuccess(null);
    },

    updateCMSContent: async (_id: string, _updates: Partial<CMSSection>): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'CMS content updated successfully');
    },

    publishCMSContent: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Content published live');
    },

    // Temp proxy for creating a page until backend endpoint exists
    addCMSPage: async (_pageName: string, _slug: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'New dynamic page layout formulated');
    },

    addCMSContent: async (_section: CMSSection): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'New CMS section added');
    },

    deleteCMSContent: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'CMS section deleted');
    },

    /**
     * Footer Management
     */
    updateFooter: async (_section: keyof FooterContent, _data: Partial<FooterSection>): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Footer updated');
    },

    /**
     * Services Collection Management
     */
    getServices: async (): Promise<ApiResponse<ServiceCollection>> => {
        await delay();
        return mockSuccess(initialServicesCollection);
    },

    addService: async (_service: ServiceItem): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Service added');
    },

    updateService: async (_id: string, _updates: Partial<ServiceItem>): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Service updated');
    },

    deleteService: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        return mockSuccess(undefined, 'Service deleted');
    }
};
