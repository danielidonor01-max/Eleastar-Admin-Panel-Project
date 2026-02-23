import { type ApiResponse, mockSuccess, delay } from './api';
import type { CMSSection, ServiceItem, FooterSection, FooterContent, ServiceCollection } from '../data/mockData';

/**
 * Service for Website Content Management (CMS)
 */
export const cmsService = {
    /**
     * Fetches all CMS sections
     */
    getCMSContent: async (): Promise<ApiResponse<CMSSection[]>> => {
        await delay();
        // In reality: return api.get('/cms/sections');
        return mockSuccess([]);
    },

    /**
     * Updates CMS content block
     */
    updateCMSContent: async (_id: string, _updates: Partial<CMSSection>): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/cms/sections/${id}`, updates);
        return mockSuccess(undefined, 'CMS content updated successfully');
    },

    /**
     * Publishes CMS content
     */
    publishCMSContent: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.post(`/cms/sections/${id}/publish`);
        return mockSuccess(undefined, 'Content published live');
    },

    /**
     * Adds a new CMS section
     */
    addCMSContent: async (_section: CMSSection): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.post('/cms/sections', section);
        return mockSuccess(undefined, 'New CMS section added');
    },

    /**
     * Deletes a CMS section
     */
    deleteCMSContent: async (_id: string): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.delete(`/cms/sections/${id}`);
        return mockSuccess(undefined, 'CMS section deleted');
    },

    /**
     * Footer Management
     */
    updateFooter: async (_section: keyof FooterContent, _data: Partial<FooterSection>): Promise<ApiResponse<void>> => {
        await delay();
        // In reality: return api.patch(`/cms/footer/${section}`, data);
        return mockSuccess(undefined, 'Footer updated');
    },

    /**
     * Services Collection Management
     */
    getServices: async (): Promise<ApiResponse<ServiceCollection>> => {
        await delay();
        return mockSuccess([]);
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
