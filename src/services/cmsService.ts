import { type ApiResponse, mockError } from './api';
import { api } from '../utils/apiClient';
import { CMS_PUBLIC_API_KEY } from '../config';
import type { FooterSection, FooterContent, ServiceCollection } from '../types';
import { initialServicesCollection } from '../data/mockData';
import type { CMSData, CMSPageDetail } from '../types/cms';

/**
 * Service for Website Content Management (CMS)
 */
export const cmsService = {
    /**
     * Gets public slugs - no auth, relies on API Key
     */
    getPublicCMSSlugs: async (): Promise<ApiResponse<{ name: string; slug: string }[]>> => {
        try {
            const { data } = await api.get(`/cms/get-slugs`, {
                requireAuth: false,
                headers: { 'X-CMS-API-Key': CMS_PUBLIC_API_KEY },
            });
            return { data: data?.data ?? [], success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: [], success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Gets sections for a specific public page
     */
    getPublicPageSections: async (slug: string): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/cms/pages/${slug}`, {
                requireAuth: false,
                headers: { 'X-CMS-API-Key': CMS_PUBLIC_API_KEY },
            });
            return { data: data?.data ?? null, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Gets public global navigation menus
     */
    getPublicMenus: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/cms/menus`, {
                requireAuth: false,
                headers: { 'X-CMS-API-Key': CMS_PUBLIC_API_KEY },
            });
            return { data: data?.data ?? [], success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: [], success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Gets public settings (footer, global variables)
     */
    getPublicSettingsGroups: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/cms/settings/groups`, {
                requireAuth: false,
                headers: { 'X-CMS-API-Key': CMS_PUBLIC_API_KEY },
            });
            return { data: data?.data ?? [], success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: [], success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Fetches all CMS pages (Admin)
     */
    getCMSPages: async (): Promise<ApiResponse<CMSData | null>> => {
        try {
            const { data } = await api.get(`/portal/cms/pages`);
            return { data: data?.data ?? null, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Gets a single page by slug with full sections, parent, and children (Admin)
     */
    getPageBySlug: async (slug: string): Promise<ApiResponse<CMSPageDetail | null>> => {
        try {
            const { data } = await api.get(`/portal/cms/pages/${slug}`);
            return { data: data?.data ?? null, success: !!data?.status, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Lists all CMS API Keys (Admin)
     */
    listApiKeys: async (): Promise<ApiResponse<unknown[]>> => {
        try {
            const { data } = await api.get(`/portal/cms/api-keys`);
            return { data: data?.data ?? [], success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: [], success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Generates a new CMS API Key (Admin)
     */
    generateApiKey: async (name: string): Promise<ApiResponse<{ name: string; key: string }>> => {
        try {
            const { data } = await api.post(`/portal/cms/api-keys`, { name });
            if (!data?.status) throw new Error(data?.message ?? 'Failed to generate API key');
            return { data: data.data!, success: true, message: data?.message ?? 'API key generated successfully' };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null as unknown as { name: string; key: string }, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Delete an API Key (Admin)
     */
    deleteApiKey: async (id: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.delete(`/portal/cms/api-keys/${id}`);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to delete API key');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Toggle API Key active status (Admin)
     */
    toggleApiKeyStatus: async (id: string | number, is_active: boolean): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.patch(`/portal/cms/api-keys/${id}/status`, { is_active });
            if (!data?.status) throw new Error(data?.message ?? 'Failed to toggle status');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Updates CMS content block (Admin)
     */
    updateCMSSection: async (sectionId: string | number, payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.put(`/portal/cms/sections/${sectionId}`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update section');
            return { data: data.data, success: true, message: data?.message ?? 'CMS content updated successfully' };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Updates CMS Section status e.g., publish (Admin)
     */
    updateCMSSectionStatus: async (sectionId: string | number, status: 'published' | 'draft'): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.patch(`/portal/cms/sections/${sectionId}/status`, { status });
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update section status');
            return { data: data.data, success: true, message: data?.message ?? 'Section status updated' };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },


    // -------------------------------------------------------------
    // PAGES MANAGEMENT
    // -------------------------------------------------------------
    createCMSPage: async (payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
                        const { data } = await api.post(`/portal/cms/pages`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to create page');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    updateCMSPage: async (slug: string, payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.put(`/portal/cms/pages/${slug}`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update page');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    deleteCMSPage: async (slug: string): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.delete(`/portal/cms/pages/${slug}`);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to delete page');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    updateCMSPageStatus: async (slug: string, status: 'live' | 'draft'): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.patch(`/portal/cms/pages/${slug}/status`, { status });
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update page status');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    getPageSections: async (slug: string): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/portal/cms/pages/${slug}/sections`);
            return { data: data?.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    createCMSSection: async (payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post(`/portal/cms/sections`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to create section');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    deleteCMSSection: async (sectionId: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.delete(`/portal/cms/sections/${sectionId}`);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to delete section');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    // -------------------------------------------------------------
    // MENUS MANAGEMENT
    // -------------------------------------------------------------
    getCMSMenus: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/portal/cms/menus`);
            return { data: data?.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: [], success: false, error: e?.message ?? 'Request failed' };
        }
    },

    getMenuWithItems: async (key: string): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/portal/cms/menus/${key}`);
            return { data: data?.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    createMenuItem: async (payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post(`/portal/cms/menu-items`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to create menu item');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    updateMenuItem: async (id: string | number, payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.put(`/portal/cms/menu-items/${id}`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update menu item');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    deleteMenuItem: async (id: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.delete(`/portal/cms/menu-items/${id}`);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to delete menu item');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    updateMenuItemVisibility: async (id: string | number, is_visible: boolean): Promise<ApiResponse<unknown>> => {
        try {
                const { data } = await api.patch(`/portal/cms/menu-items/${id}/visibility`, { is_visible });
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update menu item visibility');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Update Footer metadata (social links, copyright, etc.)
     */
    updateFooterMetadata: async (payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.patch(`/portal/cms/menus/footer/metadata`, payload);
            if (!data?.status) throw new Error(data?.message ?? 'Failed to update footer metadata');
            return { data: data.data, success: true, message: data?.message };
        } catch (error: unknown) {
            const e = error as { message?: string };
            return { data: null, success: false, error: e?.message ?? 'Request failed' };
        }
    },

    /**
     * Footer Management (Legacy) - Redirect to metadata
     */
    updateFooter: async (_section: keyof FooterContent, data: Partial<FooterSection>): Promise<ApiResponse<void>> => {
        const result = await cmsService.updateFooterMetadata(data);
        return { ...result, data: undefined };
    },

    /**
     * Services Collection Management (Legacy)
     * Note: If backend adds specific services endpoints, implement them here.
     */
    getServices: async (): Promise<ApiResponse<ServiceCollection>> => {
        return { data: initialServicesCollection, success: true };
    },

    addService: async (): Promise<ApiResponse<void>> => {
        return mockError('Endpoint not implemented in backend');
    },

    updateService: async (): Promise<ApiResponse<void>> => {
        return mockError('Endpoint not implemented in backend');
    },

    deleteService: async (): Promise<ApiResponse<void>> => {
        return mockError('Endpoint not implemented in backend');
    }
};
