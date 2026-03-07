import type {
    Employee,
    PromotionEligibilityRule,
    PromotionRequest,
    ReviewCycle,
    PerformanceReview,
    LeaveRequest,
    Job,
    LedgerEntry,
    Task,
    SystemApiKey,
    Department,
    CMSSection,
    CMSPage,
    ServiceItem,
    FooterContent,
    GlobalContent,
} from '../types';

// ---------------------------------------------------------------------------
// Seed / Initial Data Arrays
// ---------------------------------------------------------------------------

export const employees: Employee[] = [];

export const initialDepartments: Department[] = [];

export const promotionRequests: PromotionRequest[] = [];

export const initialEligibilityRules: PromotionEligibilityRule[] = [];

export const initialReviewCycles: ReviewCycle[] = [];

export const initialPerformanceReviews: PerformanceReview[] = [];

export const initialLeaveRequests: LeaveRequest[] = [];

export const jobs: Job[] = [];

export const mockEmployee: Employee | undefined = undefined;

export const initialLedgerEntries: LedgerEntry[] = [];

export const initialPromotionRequests: PromotionRequest[] = [];

export const initialTasks: Task[] = [];

export const initialApiKeys: SystemApiKey[] = [];

export const initialServicesCollection: ServiceItem[] = [];

export const initialServicesContent: CMSSection[] = [];

export const initialIndustrialSolutionsContent: CMSSection[] = [];

export const initialInformationTechnologyContent: CMSSection[] = [];

export const initialResearchAndDevelopmentContent: CMSSection[] = [];

export const initialElectronicsManufacturingContent: CMSSection[] = [];

export const initialCMSContent: CMSSection[] = [];

export const initialAboutContent: CMSSection[] = [];

export const initialSpecificITServicesContent: CMSSection[] = [];

export const initialCareersContent: CMSSection[] = [];

export const initialPages: Record<string, CMSPage> = {};

export const initialPageMetadata: Record<string, import('../types/cms').PageMetadata> = {};

export const initialGlobalContent: GlobalContent = {
    tenantId: 'tenant-default',
    siteName: 'Eleastar',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    contactInfo: {
        email: 'info@eleastar.com',
        phone: '+234 800 123 4567',
        address: '123 Innovation Drive, Lagos, Nigeria',
    },
    socialLinks: {
        linkedin: 'https://linkedin.com/company/eleastar',
        facebook: 'https://facebook.com/eleastar',
        twitter: 'https://twitter.com/eleastar',
        instagram: 'https://instagram.com/eleastar',
    },
    metaDescription: 'Leading provider of workforce solutions and technological innovation.',
    metaKeywords: 'ERP, Workforce, Payroll, Verification, Technology',
    navigation: [
        { id: 'nav-services',      label: 'Services',         path: '/services',          type: 'Internal', isVisible: true, order: 1 },
        { id: 'nav-technologies',  label: 'Technologies',     path: '/technologies',      type: 'Internal', isVisible: true, order: 2 },
        { id: 'nav-culture',       label: 'Eleastar & You',   path: '/eleastar-and-you',  type: 'Internal', isVisible: true, order: 3 },
        { id: 'nav-about',         label: 'About Eleastar',   path: '/about',             type: 'Internal', isVisible: true, order: 4 },
        { id: 'nav-contact',       label: 'Contact',          path: '/contact',           type: 'Internal', isVisible: true, order: 5 },
    ],
    seoDefaults: {
        siteTitle: 'Eleastar - Innovative Tech Solutions',
        siteDescription: 'Leading technology partner for industrial and digital transformation.',
        ogImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
};

export const initialFooterContent: FooterContent = {
    navigation: {
        id: 'footer-nav',
        lastUpdated: new Date().toISOString(),
        title: 'Primary Navigation',
        links: [],
    },
    utility: {
        id: 'footer-utility',
        lastUpdated: new Date().toISOString(),
        title: 'Utility Links',
        links: [],
    },
    social: {
        id: 'footer-social',
        lastUpdated: new Date().toISOString(),
        title: 'Connect With Us',
        links: [],
    },
    legal: {
        id: 'footer-legal',
        lastUpdated: new Date().toISOString(),
        title: 'Legal',
        links: [],
    },
    copyright: {
        id: 'footer-copyright',
        lastUpdated: new Date().toISOString(),
        content: '© 2026 Eleastar. All rights reserved.',
        links: [],
    },
};
