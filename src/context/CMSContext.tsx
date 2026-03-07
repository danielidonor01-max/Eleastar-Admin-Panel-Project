import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsService } from '../services/cmsService';
import type { CMSData, FooterContent, FooterSection, GlobalContent, CMSMenu, CMSPageItem } from '../types/cms';
import type { SystemApiKey, ApiResponse } from '../types/system';
import { initialFooterContent, initialGlobalContent, initialApiKeys } from '../data/mockData';

export interface CMSContextType {
    // State
    cmsContent: CMSData | null;
    setFooterContent: React.Dispatch<React.SetStateAction<FooterContent>>;
    footerContent: FooterContent;
    globalContent: GlobalContent;
    apiKeys: SystemApiKey[];

    // CMS Pages
    createCMSPage: (payload: Record<string, unknown>) => Promise<ApiResponse<CMSPageItem>>;
    updateCMSPage: (slug: string, payload: Record<string, unknown>) => Promise<ApiResponse<CMSPageItem>>;
    deleteCMSPage: (slug: string) => Promise<ApiResponse<null>>;
    updateCMSPageStatus: (slug: string, status: 'live' | 'draft') => Promise<ApiResponse<CMSPageItem>>;
    getPageSections: (slug: string) => Promise<ApiResponse<unknown>>;
    updatePMSContent: (id: string, content: Record<string, unknown>) => Promise<void>;
    createCMSSection: (payload: Record<string, unknown>) => Promise<void>;
    deleteCMSSection: (sectionId: string | number) => Promise<void>;

    // CMS Menus
    getCMSMenus: () => Promise<ApiResponse<CMSMenu[]>>;
    getMenuWithItems: (key: string) => Promise<ApiResponse<CMSMenu>>;
    createMenuItem: (payload: Record<string, unknown>) => Promise<void>;
    updateMenuItem: (id: string | number, payload: Record<string, unknown>) => Promise<void>;
    deleteMenuItem: (id: string | number) => Promise<void>;
    updateMenuItemVisibility: (id: string | number, is_visible: boolean) => Promise<void>;

    // Global & Footer
    updateFooterContent: (section: keyof FooterContent, data: Partial<FooterSection>) => Promise<{ success: true }>;
    updateGlobal: <K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => Promise<{ success: true }>;
    updateSEOMetadata: (slug: string, payload: Record<string, unknown>) => Promise<ApiResponse<CMSPageItem>>;
    refreshCMSData: () => Promise<void>;

    // API Keys Management
    addApiKey: (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => void;
    toggleApiKeyStatus: (id: string) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cmsContent, setCmsContent] = useState<CMSData | null>(null);
    const [footerContent, setFooterContent] = useState<FooterContent>(initialFooterContent);
    const [globalContent, setGlobalContent] = useState<GlobalContent>(initialGlobalContent);
    const [apiKeys, setApiKeys] = useState<SystemApiKey[]>(initialApiKeys);

    useEffect(() => {
        let isMounted = true;
        const initCMS = async () => {
            try {
                const [menusRes, _settingsRes] = await Promise.all([
                    cmsService.getPublicMenus(),
                    cmsService.getPublicSettingsGroups()
                ]);

                if (!isMounted) return;

                if (menusRes.success && menusRes.data) {
                    const menusArray = Array.isArray(menusRes.data)
                        ? (menusRes.data as CMSMenu[])
                        : (Object.values(menusRes.data) as CMSMenu[]);

                    const headerMenu = menusArray.find(m => m.key === 'header');

                    if (headerMenu) {
                        setGlobalContent(prev => ({
                            ...prev,
                            navigation: (headerMenu.items || []).map(item => ({
                                id: String(item.id),
                                label: item.label,
                                path: item.url,
                                type: 'Internal' as const,
                                isVisible: item.is_visible !== false,
                                order: item.order,
                            }))
                        }));
                    }
                }

                const pagesRes = await cmsService.getCMSPages();
                if (pagesRes.success && pagesRes.data) {
                    setCmsContent(pagesRes.data as CMSData);
                }
            } catch (err) {
                console.error('Failed to load CMS layout structure', err);
            }
        };
        initCMS();
        return () => { isMounted = false; };
    }, []);

    const refreshCMSData = async () => {
        const res = await cmsService.getCMSPages();
        if (res.success && res.data) {
            setCmsContent(res.data as CMSData);
        }
    };

    // ---- CMS Pages ----
    const createCMSPage = async (payload: Record<string, unknown>) => {
        const res = await cmsService.createCMSPage(payload);
        if (res.success) {
            await refreshCMSData();
        }
        return res as ApiResponse<CMSPageItem>;
    };
    const updateCMSPage = async (slug: string, payload: Record<string, unknown>) =>
        cmsService.updateCMSPage(slug, payload) as Promise<ApiResponse<CMSPageItem>>;
    const deleteCMSPage = async (slug: string) =>
        cmsService.deleteCMSPage(slug) as Promise<ApiResponse<null>>;
    const updateCMSPageStatus = async (slug: string, status: 'live' | 'draft') =>
        cmsService.updateCMSPageStatus(slug, status) as Promise<ApiResponse<CMSPageItem>>;

    // ---- CMS Sections ----
    const getPageSections = async (slug: string) =>
        cmsService.getPageSections(slug) as Promise<ApiResponse<unknown>>;
    const updatePMSContent = async (id: string, content: Record<string, unknown>) => {
        await cmsService.updateCMSSection(id, content);
    };
    const createCMSSection = async (payload: Record<string, unknown>) => {
        await cmsService.createCMSSection(payload);
    };
    const deleteCMSSection = async (sectionId: string | number) => {
        await cmsService.deleteCMSSection(sectionId);
    };

    // ---- CMS Menus ----
    const getCMSMenus = async () =>
        cmsService.getCMSMenus() as Promise<ApiResponse<CMSMenu[]>>;
    const getMenuWithItems = async (key: string) =>
        cmsService.getMenuWithItems(key) as Promise<ApiResponse<CMSMenu>>;
    const createMenuItem = async (payload: Record<string, unknown>) => {
        await cmsService.createMenuItem(payload);
    };
    const updateMenuItem = async (id: string | number, payload: Record<string, unknown>) => {
        await cmsService.updateMenuItem(id, payload);
    };
    const deleteMenuItem = async (id: string | number) => {
        await cmsService.deleteMenuItem(id);
    };
    const updateMenuItemVisibility = async (id: string | number, is_visible: boolean) => {
        await cmsService.updateMenuItemVisibility(id, is_visible);
    };

    // ---- Footer & Global ----
    const updateFooterContent = async (section: keyof FooterContent, data: Partial<FooterSection>) => {
        setFooterContent(prev => ({ ...prev, [section]: { ...prev[section], ...data } }));
        return { success: true as const };
    };
    const updateGlobal = async <K extends keyof GlobalContent>(section: K, data: GlobalContent[K]) => {
        setGlobalContent(prev => ({ ...prev, [section]: data }));
        return { success: true as const };
    };

    // ---- API Keys ----
    const addApiKey = (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => {
        const newKey: SystemApiKey = {
            ...apiKey,
            id: `ak_${Date.now()}`,
            tenantId: 't1',
            createdAt: new Date().toISOString(),
            status: 'active',
        };
        setApiKeys(prev => [...prev, newKey]);
    };
    const toggleApiKeyStatus = (id: string) => {
        setApiKeys(prev =>
            prev.map(key => key.id === id ? { ...key, status: key.status === 'active' ? 'disabled' : 'active' } : key)
        );
    };

    const updateSEOMetadata = async (slug: string, payload: Record<string, unknown>) => {
        const res = await cmsService.updateCMSPage(slug, payload);
        if (res.success) {
            await refreshCMSData();
        }
        return res as ApiResponse<CMSPageItem>;
    };

    return (
        <CMSContext.Provider value={{
            cmsContent, footerContent, globalContent, apiKeys,
            createCMSPage, updateCMSPage, deleteCMSPage, updateCMSPageStatus,
            getPageSections, updatePMSContent, createCMSSection, deleteCMSSection,
            getCMSMenus, getMenuWithItems, createMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemVisibility,
            updateFooterContent, updateGlobal, addApiKey, toggleApiKeyStatus, setFooterContent,
            updateSEOMetadata, refreshCMSData,
        }}>
            {children}
        </CMSContext.Provider>
    );
};

export const useCMS = () => {
    const context = useContext(CMSContext);
    if (!context) throw new Error('useCMS must be used within CMSProvider');
    return context;
};
