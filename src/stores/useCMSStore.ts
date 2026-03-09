import { create } from 'zustand';
import { toast } from 'sonner';
import { cmsService } from '../services/cmsService';
import { initialFooterContent, initialGlobalContent, initialApiKeys } from '../data/mockData';
import type { CMSData, FooterContent, FooterSection, GlobalContent, CMSMenu, CMSPageItem } from '../types/cms';
import type { SystemApiKey, ApiResponse } from '../types/system';
import { createPersistedStore } from './middleware';

interface CMSState {
    isLoading: boolean;
    cmsContent: CMSData | null;
    footerContent: FooterContent;
    globalContent: GlobalContent;
    pagesList: CMSPageItem[];
    apiKeys: SystemApiKey[];
}

interface CMSActions {
    setFooterContent: (content: FooterContent | ((prev: FooterContent) => FooterContent)) => void;
    fetchCMSData: () => Promise<void>;
    refreshCMSData: () => Promise<void>;
    createCMSPage: (payload: Record<string, unknown>) => Promise<ApiResponse<CMSPageItem>>;
    updateCMSPage: (slug: string, payload: Record<string, unknown>) => Promise<ApiResponse<CMSPageItem>>;
    deleteCMSPage: (slug: string) => Promise<ApiResponse<null>>;
    updateCMSPageStatus: (slug: string, status: 'live' | 'draft') => Promise<ApiResponse<CMSPageItem>>;
    updateSEOMetadata: (slug: string, payload: Record<string, unknown>) => Promise<ApiResponse<CMSPageItem>>;
    getPageSections: (slug: string) => Promise<ApiResponse<unknown>>;
    updatePMSContent: (id: string, content: Record<string, unknown>) => Promise<void>;
    createCMSSection: (payload: Record<string, unknown>) => Promise<void>;
    deleteCMSSection: (sectionId: string | number) => Promise<void>;
    getCMSMenus: () => Promise<ApiResponse<CMSMenu[]>>;
    getMenuWithItems: (key: string) => Promise<ApiResponse<CMSMenu>>;
    createMenuItem: (payload: Record<string, unknown>) => Promise<void>;
    updateMenuItem: (id: string | number, payload: Record<string, unknown>) => Promise<void>;
    deleteMenuItem: (id: string | number) => Promise<void>;
    updateMenuItemVisibility: (id: string | number, is_visible: boolean) => Promise<void>;
    updateFooterContent: (section: keyof FooterContent, data: Partial<FooterSection>) => Promise<{ success: true }>;
    updateGlobal: <K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => Promise<{ success: true }>;
    addApiKey: (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => void;
    toggleApiKeyStatus: (id: string) => void;
}

export const useCMSStore = create<CMSState & CMSActions>()(
    createPersistedStore('cms', (set) => ({
    isLoading: false,
    cmsContent: null,
    pagesList: [],
    footerContent: initialFooterContent,
    globalContent: initialGlobalContent,
    apiKeys: initialApiKeys,

    setFooterContent: (content) => {
        set((s) => ({ footerContent: typeof content === 'function' ? content(s.footerContent) : content }));
    },

    fetchCMSData: async () => {
        set({ isLoading: true });
        try {
            const [menusRes] = await Promise.all([
                cmsService.getPublicMenus(),
                cmsService.getPublicSettingsGroups(),
            ]);
            if (menusRes.success && menusRes.data) {
                const menusArray = Array.isArray(menusRes.data)
                    ? (menusRes.data as CMSMenu[])
                    : (Object.values(menusRes.data) as CMSMenu[]);
                const headerMenu = menusArray.find((m) => m.key === 'header');
                if (headerMenu) {
                    set((s) => ({
                        globalContent: {
                            ...s.globalContent,
                            navigation: (headerMenu.items || []).map((item) => ({
                                id: String(item.id),
                                label: item.label,
                                path: item.url,
                                type: 'Internal' as const,
                                isVisible: item.is_visible !== false,
                                order: item.order,
                            })),
                        },
                    }));
                }
            }
            const pagesRes = await cmsService.getCMSPages();
            if (pagesRes.success && pagesRes.data) {
                set({ pagesList: pagesRes.data as unknown as CMSPageItem[] });
            }
        } catch (err) {
            console.error('Failed to load CMS data', err);
        } finally {
            set({ isLoading: false });
        }
    },

    refreshCMSData: async () => {
        set({ isLoading: true });
        const res = await cmsService.getCMSPages();
        if (res.success && res.data) set({ pagesList: res.data as unknown as CMSPageItem[] });
        set({ isLoading: false });
    },

    createCMSPage: async (payload) => {
        set({ isLoading: true });
        const res = await cmsService.createCMSPage(payload);
        if (res.success) {
            const { refreshCMSData } = useCMSStore.getState();
            await refreshCMSData();
            toast.success('Page Created');
        }
        set({ isLoading: false });
        return res as ApiResponse<CMSPageItem>;
    },

    updateCMSPage: async (slug, payload) => {
        set({ isLoading: true });
        const res = await cmsService.updateCMSPage(slug, payload);
        if (res.success) {
            const { refreshCMSData } = useCMSStore.getState();
            await refreshCMSData();
        }
        set({ isLoading: false });
        return res as ApiResponse<CMSPageItem>;
    },
    deleteCMSPage: async (slug) => {
        set({ isLoading: true });
        const res = await cmsService.deleteCMSPage(slug);
        if (res.success) {
            const { refreshCMSData } = useCMSStore.getState();
            await refreshCMSData();
        }
        set({ isLoading: false });
        return res as ApiResponse<null>;
    },
    updateCMSPageStatus: async (slug, status) => {
        set({ isLoading: true });
        const res = await cmsService.updateCMSPageStatus(slug, status);
        if (res.success) {
            const { refreshCMSData } = useCMSStore.getState();
            await refreshCMSData();
        }
        set({ isLoading: false });
        return res as ApiResponse<CMSPageItem>;
    },

    updateSEOMetadata: async (slug, payload) => {
        set({ isLoading: true });
        const res = await cmsService.updateCMSPage(slug, payload);
        if (res.success) {
            const { refreshCMSData } = useCMSStore.getState();
            await refreshCMSData();
        }
        set({ isLoading: false });
        return res as ApiResponse<CMSPageItem>;
    },

    getPageSections: async (slug) => {
        set({ isLoading: true });
        const res = await cmsService.getPageSections(slug);
        set({ isLoading: false });
        return res as ApiResponse<unknown>;
    },
    updatePMSContent: async (id, content) => { await cmsService.updateCMSSection(id, content); },
    createCMSSection: async (payload) => { await cmsService.createCMSSection(payload); },
    deleteCMSSection: async (sectionId) => { await cmsService.deleteCMSSection(sectionId); },

    getCMSMenus: async () => cmsService.getCMSMenus() as Promise<ApiResponse<CMSMenu[]>>,
    getMenuWithItems: async (key) => cmsService.getMenuWithItems(key) as Promise<ApiResponse<CMSMenu>>,
    createMenuItem: async (payload) => { await cmsService.createMenuItem(payload); },
    updateMenuItem: async (id, payload) => { await cmsService.updateMenuItem(id, payload); },
    deleteMenuItem: async (id) => { await cmsService.deleteMenuItem(id); },
    updateMenuItemVisibility: async (id, is_visible) => { await cmsService.updateMenuItemVisibility(id, is_visible); },

    updateFooterContent: async (section, data) => {
        set((s) => ({ footerContent: { ...s.footerContent, [section]: { ...s.footerContent[section], ...data } } }));
        return { success: true };
    },

    updateGlobal: async (section, data) => {
        set((s) => ({ globalContent: { ...s.globalContent, [section]: data } }));
        return { success: true };
    },

    addApiKey: (apiKey) => {
        const newKey: SystemApiKey = {
            ...apiKey,
            id: `ak_${Date.now()}`,
            tenantId: 't1',
            createdAt: new Date().toISOString(),
            status: 'active',
        };
        set((s) => ({ apiKeys: [...s.apiKeys, newKey] }));
    },

    toggleApiKeyStatus: (id) => {
        set((s) => ({
            apiKeys: s.apiKeys.map((k) => k.id === id ? { ...k, status: k.status === 'active' ? 'disabled' : 'active' } : k),
        }));
    },
})
    ));
