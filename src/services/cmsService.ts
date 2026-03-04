import { type ApiResponse, mockSuccess, delay } from './api';
import { CMS_API_BASE_URL, CMS_PUBLIC_API_KEY } from '../config';
import {
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
     * Lists all CMS API Keys (Admin)
     */
    listApiKeys: async (): Promise<ApiResponse<any[]>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/api-keys`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return { data: data.data || [], success: true, message: data.message };
        } catch (error: any) {
            return { data: [], success: false, error: error.message };
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
     * Delete an API Key (Admin)
     */
    deleteApiKey: async (id: string | number): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/api-keys/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to delete API key');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    /**
     * Toggle API Key active status (Admin)
     */
    toggleApiKeyStatus: async (id: string | number, status: 'active' | 'inactive'): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/api-keys/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to toggle status');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
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


    // -------------------------------------------------------------
    // PAGES MANAGEMENT
    // -------------------------------------------------------------
    createCMSPage: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/pages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to create page');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    updateCMSPage: async (slug: string, payload: any): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/pages/${slug}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update page');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    deleteCMSPage: async (slug: string): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/pages/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to delete page');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    updateCMSPageStatus: async (slug: string, status: 'live' | 'draft'): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/pages/${slug}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update page status');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    getPageSections: async (slug: string): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/pages/${slug}/sections`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    createCMSSection: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/sections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to create section');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    deleteCMSSection: async (sectionId: string | number): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/sections/${sectionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to delete section');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    // -------------------------------------------------------------
    // MENUS MANAGEMENT
    // -------------------------------------------------------------
    getCMSMenus: async (): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/menus`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: [], success: false, error: error.message };
        }
    },

    getMenuWithItems: async (key: string): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/menus/${key}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    createMenuItem: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/menu-items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to create menu item');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    updateMenuItem: async (id: string | number, payload: any): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/menu-items/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update menu item');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    deleteMenuItem: async (id: string | number): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/menu-items/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to delete menu item');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    updateMenuItemVisibility: async (id: string | number, is_visible: boolean): Promise<ApiResponse<any>> => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${CMS_API_BASE_URL}/portal/cms/menu-items/${id}/visibility`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ is_visible })
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update menu item visibility');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
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
