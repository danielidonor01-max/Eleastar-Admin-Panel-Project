import { type ApiResponse, mockError } from './api';
import { apiClient } from '../utils/apiClient';
import { CMS_PUBLIC_API_KEY } from '../config';
import {
    type ServiceItem,
    type FooterSection,
    type FooterContent,
    type ServiceCollection,
    initialServicesCollection
} from '../data/mockData';
import type { CMSData } from '../types/cms';

/**
 * Service for Website Content Management (CMS)
 */
export const cmsService = {
    /**
     * Gets public slugs - no auth, relies on API Key
     */
    getPublicCMSSlugs: async (): Promise<ApiResponse<{ name: string; slug: string }[]>> => {
        try {
            const response = await apiClient(`/cms/get-slugs`, {
                requireAuth: false,
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY
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
            const response = await apiClient(`/cms/pages/${slug}`, {
                requireAuth: false,
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY
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
            const response = await apiClient(`/cms/menus`, {
                requireAuth: false,
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY
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
            const response = await apiClient(`/cms/settings/groups`, {
                requireAuth: false,
                headers: {
                    'X-CMS-API-Key': CMS_PUBLIC_API_KEY
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
            const response = await apiClient(`/portal/cms/pages`, {});
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
            const response = await apiClient(`/portal/cms/api-keys`, {});
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
            const response = await apiClient(`/portal/cms/api-keys`, {
                method: 'POST',
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
            const response = await apiClient(`/portal/cms/api-keys/${id}`, {
                method: 'DELETE'
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
    toggleApiKeyStatus: async (id: string | number, is_active: boolean): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient(`/portal/cms/api-keys/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ is_active })
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
    updateCMSSection: async (sectionId: string | number, payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient(`/portal/cms/sections/${sectionId}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
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
            const response = await apiClient(`/portal/cms/sections/${sectionId}/status`, {
                method: 'PATCH',
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
            const response = await apiClient(`/portal/cms/pages`, {
                method: 'POST',
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
            const response = await apiClient(`/portal/cms/pages/${slug}`, {
                method: 'PUT',
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
            const response = await apiClient(`/portal/cms/pages/${slug}`, {
                method: 'DELETE'
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
            const response = await apiClient(`/portal/cms/pages/${slug}/status`, {
                method: 'PATCH',
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
            const response = await apiClient(`/portal/cms/pages/${slug}/sections`, {});
            const data = await response.json();
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    createCMSSection: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient(`/portal/cms/sections`, {
                method: 'POST',
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
            const response = await apiClient(`/portal/cms/sections/${sectionId}`, {
                method: 'DELETE'
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
            const response = await apiClient(`/portal/cms/menus`, {});
            const data = await response.json();
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: [], success: false, error: error.message };
        }
    },

    getMenuWithItems: async (key: string): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient(`/portal/cms/menus/${key}`, {});
            const data = await response.json();
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    createMenuItem: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient(`/portal/cms/menu-items`, {
                method: 'POST',
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
            const response = await apiClient(`/portal/cms/menu-items/${id}`, {
                method: 'PUT',
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
            const response = await apiClient(`/portal/cms/menu-items/${id}`, {
                method: 'DELETE'
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
            const response = await apiClient(`/portal/cms/menu-items/${id}/visibility`, {
                method: 'PATCH',
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
     * Update Footer metadata (social links, copyright, etc.)
     */
    updateFooterMetadata: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await apiClient(`/portal/cms/menus/footer/metadata`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Failed to update footer metadata');
            return { data: data.data, success: true, message: data.message };
        } catch (error: any) {
            return { data: null, success: false, error: error.message };
        }
    },

    /**
     * Footer Management (Legacy) - Redirect to metadata
     */
    updateFooter: async (_section: keyof FooterContent, data: Partial<FooterSection>): Promise<ApiResponse<void>> => {
        return cmsService.updateFooterMetadata(data);
    },

    /**
     * Services Collection Management (Legacy)
     * Note: If backend adds specific services endpoints, implement them here.
     */
    getServices: async (): Promise<ApiResponse<ServiceCollection>> => {
        return { data: initialServicesCollection, success: true };
    },

    addService: async (_service: ServiceItem): Promise<ApiResponse<void>> => {
        return mockError('Endpoint not implemented in backend');
    },

    updateService: async (_id: string, _updates: Partial<ServiceItem>): Promise<ApiResponse<void>> => {
        return mockError('Endpoint not implemented in backend');
    },

    deleteService: async (_id: string): Promise<ApiResponse<void>> => {
        return mockError('Endpoint not implemented in backend');
    }
};
