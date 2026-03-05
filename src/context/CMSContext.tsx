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
    createCMSPage: (payload: any) => Promise<void>;
    updateCMSPage: (slug: string, payload: any) => Promise<void>;
    deleteCMSPage: (slug: string) => Promise<void>;
    updateCMSPageStatus: (slug: string, status: 'live' | 'draft') => Promise<void>;
    getPageSections: (slug: string) => Promise<any>;
    updatePMSContent: (id: string, content: any) => Promise<void>;
    createCMSSection: (payload: any) => Promise<void>;
    deleteCMSSection: (sectionId: string | number) => Promise<void>;

    getCMSMenus: () => Promise<any>;
    getMenuWithItems: (key: string) => Promise<any>;
    createMenuItem: (payload: any) => Promise<void>;
    updateMenuItem: (id: string | number, payload: any) => Promise<void>;
    deleteMenuItem: (id: string | number) => Promise<void>;
    updateMenuItemVisibility: (id: string | number, is_visible: boolean) => Promise<void>;

    updateFooterContent: (section: keyof FooterContent, data: Partial<FooterSection>) => Promise<void>;
    updateGlobal: (section: keyof GlobalContent, data: any) => Promise<void>;

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
                const [menusRes, settingsRes, homeRes] = await Promise.all([
                    cmsService.getPublicMenus(),
                    cmsService.getPublicSettingsGroups(),
                    cmsService.getPublicPageSections('home')
                ]);

                if (!isMounted) return;

                // Handle Menus (Header & Footer)
                if (menusRes.success && menusRes.data) {
                    const menuData = menusRes.data;

                    // Header Navigation
                    if (menuData.header?.items) {
                        setGlobalContent(prev => ({
                            ...prev,
                            navigation: menuData.header.items.map((item: any) => ({
                                id: String(item.id || item.slug),
                                label: item.label,
                                path: item.href || '#',
                                isVisible: true,
                                type: 'Internal',
                                order: item.order || 0,
                                subItems: item.children?.map((child: any) => ({
                                    label: child.label,
                                    slug: child.slug,
                                    href: child.href
                                }))
                            }))
                        }));
                    }

                    // Footer Navigation & Content
                    if (menuData.footer) {
                        const { footer } = menuData;
                        setFooterContent(prev => ({
                            ...prev,
                            navigation: {
                                ...prev.navigation,
                                links: (footer.group1 || []).map((l: any) => ({
                                    id: l.slug,
                                    label: l.label,
                                    url: l.href,
                                    isVisible: true
                                }))
                            },
                            utility: {
                                ...prev.utility,
                                links: (footer.group2 || []).map((l: any) => ({
                                    id: l.slug,
                                    label: l.label,
                                    url: l.href,
                                    isVisible: true
                                }))
                            },
                            social: {
                                ...prev.social,
                                links: (footer.socialLinks || []).map((l: any) => ({
                                    id: l.icon,
                                    label: l.icon.split('-').pop(), // Simple icon label extract
                                    url: l.href,
                                    isVisible: true
                                }))
                            },
                            legal: {
                                ...prev.legal,
                                links: (footer.legal || []).map((l: any) => ({
                                    id: l.slug,
                                    label: l.label,
                                    url: l.href,
                                    isVisible: true
                                }))
                            },
                            copyright: {
                                ...prev.copyright,
                                content: footer.copyright || prev.copyright.content
                            }
                        }));
                    }
                }

                if (settingsRes.success && settingsRes.data) {
                    // Map global settings if needed
                }

                // Handle Page Content (Home)
                if (homeRes.success && homeRes.data) {
                    const sections = homeRes.data.sections || [];
                    const heroSection = sections.find((s: any) => s.type === 'Hero');

                    let heroCards: any[] = [];
                    if (heroSection && heroSection.content?.slides) {
                        heroCards = heroSection.content.slides.map((slide: any) => ({
                            cardTitle: slide.headline,
                            cardDescription: slide.subheadline,
                            cardImages: {
                                mainImage: { url: slide.background_image?.url || '', alt: slide.background_image?.alt || '' },
                                subImage1: { url: '', alt: '' },
                                subImage2: { url: '', alt: '' },
                                subCardColor: 'bg-brand-600'
                            },
                            backgroundColor: 'bg-slate-900',
                            cardColor: 'bg-black/40',
                            button: {
                                text: slide.cta_label || 'Learn More',
                                link: slide.cta_link || '/services',
                                color: 'text-white',
                                backgroundColor: 'bg-brand-600',
                                icon: 'ArrowRight'
                            }
                        }));
                    }

                    // Map other sections as needed...
                    const contactSection = sections.find((s: any) => s.type === 'Contact');
                    let contactData = null;
                    if (contactSection) {
                        contactData = {
                            title: contactSection.title || 'Lets Discuss Your Next Project',
                            titleColor: 'text-white',
                            backgroundImage: '',
                            cardColor: 'bg-[#0a3b82]',
                            description: contactSection.intro || 'Do you have a project in mind? We would love to hear from you.',
                            textColor: 'text-white',
                            button: {
                                color: 'text-white',
                                backgroundColor: 'bg-black',
                                text: 'Talk To Us',
                                icon: 'ArrowRight',
                                link: '/contact'
                            }
                        };
                    }

                    setCmsContent({
                        metaData: [],
                        navData: [],
                        footerNavData: {} as any,
                        contactUsCardData: contactData as any,
                        pages: {
                            home: {
                                heroCardData: heroCards
                            }
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to load CMS layout structure", err);
            }
        };
        initCMS();
        return () => { isMounted = false; };
    }, []);

    // ---- CMS Pages ----
    const createCMSPage = async (payload: any) => {
        const res = await cmsService.createCMSPage(payload);
        if (res.success) {
            // Optionally refresh list or update state
        }
    };
    const updateCMSPage = async (slug: string, payload: any) => { await cmsService.updateCMSPage(slug, payload); };
    const deleteCMSPage = async (slug: string) => { await cmsService.deleteCMSPage(slug); };
    const updateCMSPageStatus = async (slug: string, status: 'live' | 'draft') => { await cmsService.updateCMSPageStatus(slug, status); };

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
    };
    const updateGlobal = async (section: keyof GlobalContent, data: any) => {
        setGlobalContent(prev => ({ ...prev, [section]: data }));
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

    return (
        <CMSContext.Provider value={{
            cmsContent, footerContent, globalContent, apiKeys,
            createCMSPage, updateCMSPage, deleteCMSPage, updateCMSPageStatus,
            getPageSections, updatePMSContent, createCMSSection, deleteCMSSection,
            getCMSMenus, getMenuWithItems, createMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemVisibility,
            updateFooterContent, updateGlobal, addApiKey, toggleApiKeyStatus, setFooterContent
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
