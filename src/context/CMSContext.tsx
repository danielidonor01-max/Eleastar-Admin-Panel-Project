import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsService } from '../services/cmsService';
import type { CMSData } from '../types/cms';
import type { FooterContent, GlobalContent, FooterSection, SystemApiKey } from '../data/mockData';
import { initialFooterContent, initialGlobalContent, initialApiKeys } from '../data/mockData';

export interface CMSContextType {
    // State
    cmsContent: CMSData | null;
    setFooterContent: React.Dispatch<React.SetStateAction<FooterContent>>;
    footerContent: FooterContent;
    globalContent: GlobalContent;
    apiKeys: SystemApiKey[];

    // New CMS Actions (Pages & Menus)
    createCMSPage: (payload: any) => Promise<any>;
    updateCMSPage: (slug: string, payload: any) => Promise<any>;
    deleteCMSPage: (slug: string) => Promise<any>;
    updateCMSPageStatus: (slug: string, status: 'live' | 'draft') => Promise<any>;
    getPageSections: (slug: string) => Promise<any>;
    updatePMSContent: (id: string, content: any) => Promise<any>;
    createCMSSection: (payload: any) => Promise<any>;
    deleteCMSSection: (sectionId: string | number) => Promise<any>;

    getCMSMenus: () => Promise<any>;
    getMenuWithItems: (key: string) => Promise<any>;
    createMenuItem: (payload: any) => Promise<any>;
    updateMenuItem: (id: string | number, payload: any) => Promise<any>;
    deleteMenuItem: (id: string | number) => Promise<any>;
    updateMenuItemVisibility: (id: string | number, is_visible: boolean) => Promise<any>;

    updateFooterContent: (section: keyof FooterContent, data: Partial<FooterSection>) => Promise<any>;
    updateGlobal: (section: keyof GlobalContent, data: any) => Promise<any>;
    updateSEOMetadata: (slug: string, payload: any) => Promise<any>;
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

    // Initial Load for public structural data
    useEffect(() => {
        let isMounted = true;
        const initCMS = async () => {
            try {
                // Fetch public CMS layout data
                const [menusRes, _settingsRes] = await Promise.all([
                    cmsService.getPublicMenus(),
                    cmsService.getPublicSettingsGroups()
                ]);

                if (!isMounted) return;

                if (menusRes.success && menusRes.data) {
                    const menusArray = Array.isArray(menusRes.data)
                        ? menusRes.data
                        : Object.values(menusRes.data);

                    const headerMenu: any = menusArray.find((m: any) => m.key === 'header');

                    if (headerMenu) {
                        setGlobalContent(prev => ({
                            ...prev,
                            navigation: (headerMenu.items || []).map((item: any) => ({
                                id: String(item.id),
                                label: item.title || item.label,
                                path: item.url,
                                isVisible: item.is_visible !== false
                            }))
                        }));
                    }
                }

                // Fetch metadata/pages if in portal context or fallback
                const pagesRes = await cmsService.getCMSPages();
                if (pagesRes.success && pagesRes.data) {
                    setCmsContent(pagesRes.data);
                }

            } catch (err) {
                console.error("Failed to load CMS layout structure", err);
            }
        };
        initCMS();
        return () => { isMounted = false; };
    }, []);

    const refreshCMSData = async () => {
        const res = await cmsService.getCMSPages();
        if (res.success && res.data) {
            setCmsContent(res.data);
        }
    };

    // ---- CMS Pages ----
    const createCMSPage = async (payload: any) => {
        const res = await cmsService.createCMSPage(payload);
        if (res.success) {
            await refreshCMSData();
        }
        return res;
    };
    const updateCMSPage = async (slug: string, payload: any) => { return await cmsService.updateCMSPage(slug, payload); };
    const deleteCMSPage = async (slug: string) => { return await cmsService.deleteCMSPage(slug); };
    const updateCMSPageStatus = async (slug: string, status: 'live' | 'draft') => { return await cmsService.updateCMSPageStatus(slug, status); };

    // ---- CMS Sections ----
    const getPageSections = async (slug: string) => { return await cmsService.getPageSections(slug); };
    const updatePMSContent = async (id: string, content: any) => { await cmsService.updateCMSSection(id, content); };
    const createCMSSection = async (payload: any) => { await cmsService.createCMSSection(payload); };
    const deleteCMSSection = async (sectionId: string | number) => { await cmsService.deleteCMSSection(sectionId); };

    // ---- CMS Menus ----
    const getCMSMenus = async () => { return await cmsService.getCMSMenus(); };
    const getMenuWithItems = async (key: string) => { return await cmsService.getMenuWithItems(key); };
    const createMenuItem = async (payload: any) => { await cmsService.createMenuItem(payload); };
    const updateMenuItem = async (id: string | number, payload: any) => { await cmsService.updateMenuItem(id, payload); };
    const deleteMenuItem = async (id: string | number) => { await cmsService.deleteMenuItem(id); };
    const updateMenuItemVisibility = async (id: string | number, is_visible: boolean) => { await cmsService.updateMenuItemVisibility(id, is_visible); };

    // ---- Footer & Global ----
    const updateFooterContent = async (section: keyof FooterContent, data: Partial<FooterSection>) => {
        setFooterContent(prev => ({ ...prev, [section]: { ...prev[section], ...data } }));
        return { success: true };
    };
    const updateGlobal = async (section: keyof GlobalContent, data: any) => {
        setGlobalContent(prev => ({ ...prev, [section]: data }));
        return { success: true };
    };

    // ---- API Keys ----
    const addApiKey = (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => {
        const newKey: SystemApiKey = {
            ...apiKey,
            id: `ak_${Date.now()}`,
            tenantId: 't1',
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        setApiKeys(prev => [...prev, newKey]);
    };
    const toggleApiKeyStatus = (id: string) => {
        setApiKeys(prev => prev.map(key => key.id === id ? { ...key, status: key.status === 'active' ? 'disabled' : 'active' } : key));
    };

    const updateSEOMetadata = async (slug: string, payload: any) => {
        const res = await cmsService.updateCMSPage(slug, payload); // Using updateCMSPage as it handles meta fields
        if (res.success) {
            await refreshCMSData();
        }
        return res;
    };

    return (
        <CMSContext.Provider value={{
            cmsContent, footerContent, globalContent, apiKeys,
            createCMSPage, updateCMSPage, deleteCMSPage, updateCMSPageStatus,
            getPageSections, updatePMSContent, createCMSSection, deleteCMSSection,
            getCMSMenus, getMenuWithItems, createMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemVisibility,
            updateFooterContent, updateGlobal, addApiKey, toggleApiKeyStatus, setFooterContent,
            updateSEOMetadata, refreshCMSData
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
