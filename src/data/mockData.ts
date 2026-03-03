export type EmployeeStatus = 'onboarding' | 'probation' | 'active' | 'suspended' | 'exited';

export type AdminRole = 'SUPER_ADMIN' | 'COO' | 'HR_ADMIN' | 'MANAGEMENT_ADMIN' | 'FINANCE_ADMIN' | 'PAYROLL_ADMIN' | 'TECHNICIAN' | 'USER' | 'CHIEF_RISK_OFFICER' | 'WEB_ADMIN' | 'VIEWER';

export interface Department {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    minSalary: number;
    maxSalary: number;
    currency: string;
}

export interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface TaxDetails {
    taxId: string; // TIN
    pensionId: string; // PEN
}

export interface Asset {
    id: string;
    type: 'Laptop' | 'Monitor' | 'Phone' | 'ID Card' | 'Other';
    serialNumber?: string;
    assignedAt: string;
    status: 'Active' | 'Returned' | 'Lost';
}

export interface ContractDocument {
    id: string;
    name: string;
    type: 'Employment Contract' | 'NDA' | 'Offer Letter' | 'Amendment' | 'Other';
    uploadedAt: string;
    uploadedBy: string;
    fileUrl: string; // Simulated for now
    fileSize: number;
    status: 'active' | 'expired' | 'superseded';
}

export interface ContractInfo {
    contractType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
    startDate: string;
    endDate?: string; // For contracts/internships
    probationEndDate?: string;
    noticePeriod: number; // in days
    documents: ContractDocument[];
}



export interface PromotionRequest {
    id: string;
    tenantId: string;
    employeeId: string;
    currentRole: AdminRole;
    newRole: AdminRole;
    currentSalary: number;
    proposedSalary: number;
    effectiveDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedBy: string; // User ID
    requestedAt: string;
    approvedBy?: string; // COO ID
    approvedAt?: string;
    rejectionReason?: string;
    eligibilitySnapshot?: {
        isEligible: boolean;
        reasons: string[];
        scores: {
            performance: number; // Latest review rating
            tenureMonths: number;
        };
    };
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assignedTo: string; // Employee ID
    assignedBy: string; // Admin ID
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'In Progress' | 'In Review' | 'Completed';
    deliveryDate: string;
    createdAt: string;
    progressNotes?: string;
    evidenceUrls?: string[]; // Arrays of base64 strings or URLs
}

export interface PromotionEligibilityRule {
    id: string;
    tenantId: string;
    name: string;
    targetRole: AdminRole | 'Global';
    minTimeInRoleMonths: number;
    minPerformanceRating: number;
    requireCleanRecord: boolean; // No disciplinary actions in last X months (mock logic for now)
    isActive: boolean;
}

export const initialEligibilityRules: PromotionEligibilityRule[] = [];

export interface SalaryHistoryEntry {
    date: string;
    amount: number;
    reason: string;
    approvedBy?: string;
}

export interface PromotionHistoryEntry {
    date: string;
    oldRole: AdminRole;
    newRole: AdminRole;
    reason: string;
    approvedBy?: string;
}

export interface SystemApiKey {
    id: string;
    tenantId: string;
    name: string;
    keyPreview: string; // First few and last few chars for display
    createdAt: string;
    status: 'active' | 'disabled';
}

export interface Employee {
    id: string;
    tenantId: string;
    name: string;
    title: string;
    department: string;
    photoUrl: string;
    // Lifecycle Status
    status: EmployeeStatus;
    verifiedAt: string;
    joinedAt: string; // New field for Length of Service
    salary: number;
    // Employment Contract Type
    employmentType: 'Full-time' | 'Part-time' | 'Intern';
    email: string;
    password?: string; // Added for Auth
    // Access Control Fields
    systemRole: AdminRole;
    accessGranted: boolean;
    // Hierarchy
    managerId?: string; // Reports to
    // Financials
    bankDetails?: BankDetails;
    taxDetails?: TaxDetails;
    // Assets
    assets?: Asset[];
    // Contract Information
    contractInfo?: ContractInfo;
    // Self-Service Editable
    phoneNumber?: string;
    address?: string;
    emergencyContact?: {
        name: string;
        relationship: string;
        phoneNumber: string;
    };
    socialLinks?: {
        linkedin?: string;
        facebook?: string;
        instagram?: string;
        twitter?: string;
    };
    // Leave Management
    leaveBalance?: {
        annual: number; // e.g. 20
        sick: number; // e.g. 10
        used: number; // Total days used
    };
    // Career History
    salaryHistory?: SalaryHistoryEntry[];
    promotionHistory?: PromotionHistoryEntry[];
}

export interface LeaveRequest {
    id: string;
    tenantId: string;
    employeeId: string;
    type: 'Annual' | 'Sick' | 'Unpaid' | 'Maternity' | 'Paternity' | 'Other';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedAt: string;
    rejectionReason?: string;
    actionBy?: string; // ID of the approver/rejector
    actionAt?: string; // Timestamp of action
    // Reminder Logic
    reminderLevel?: number; // 0=None, 1=24h, 2=72h, 3=Escalated
    lastRemindedAt?: string;
}

export interface Application {
    id: string;
    tenantId: string;
    jobId: string;
    candidateName: string;
    email: string;
    resumeUrl: string;
    status: 'New' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Hired';
    appliedAt: string;
}

export interface Job {
    id: string;
    tenantId: string;
    title: string;
    department: string;
    type: 'Full-time' | 'Contract' | 'Internship';
    location: string;
    applicants: number; // Count for display
    status: 'Published' | 'Closed' | 'Draft';
    postedAt: string;
    // New Fields
    description: string;
    deadline: string;
    applicationList?: Application[];
}

export interface BonusType {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    category: 'Individual' | 'Group' | 'Global';
    isTaxable: boolean;
    requiresApproval: boolean;
    isActive: boolean;
}

export interface BonusEligibilityRule {
    id: string;
    tenantId: string;
    bonusTypeId: string;
    name: string;
    targetRole: AdminRole | 'Global';
    minPerformanceRating?: number;
    minTenureMonths?: number;
    isActive: boolean;
}

export interface BonusRequest {
    id: string;
    tenantId: string;
    cycleId: string; // Linked to a payroll cycle
    employeeId: string;
    bonusTypeId: string;
    amount: number;
    reason: string;
    requestedBy: string;
    requestedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}

export interface LedgerEntry {
    id: string;
    tenantId: string;
    payrollCycleId: string;
    employeeId: string;
    employeeName: string; // Snapshot
    bankDetails: { // Snapshot
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
    amount: number;
    currency: string;
    type: 'Salary' | 'Bonus' | 'Deduction' | 'Tax' | 'Pension';
    status: 'Pending Funding' | 'Funded' | 'Executed' | 'Failed';
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;
    executedAt?: string;
    transactionReference?: string; // UTR
}

export const employees: Employee[] = [];

export const initialDepartments: Department[] = [];

export const promotionRequests: PromotionRequest[] = [];

export interface PayrollCycle {
    id: string;
    tenantId: string;
    month: string;
    year: number;
    status: 'Draft' | 'Reviewed' | 'Approved' | 'Paid';
    adjustments: {
        empId: string;
        type: 'Bonus' | 'Fine' | 'Deduction';
        amount: number;
        reason: string;
        // Reporting fields
        requestedBy?: string;
        appliedAt?: string;
        approvedBy?: string;
        approvedAt?: string;
        status?: string;
    }[];
    snapshot?: {
        generatedAt: string;
        approvedBy: string;
        totalPayout: number;
        employeeCount: number;
        dataHash: string;
        rawData: string; // JSON stringified snapshot of eligible employees and their calculations
        totalDeductions?: number; // Added for reportUtils
        totalNet?: number; // Added for reportUtils
    };
    // Top-level reporting fields
    totalPayout?: number;
    approvedBy?: string;
    approvedAt?: string;
    executedAt?: string;
    createdAt?: string;
    paidAt?: string;
    transactionId?: string;
}

export interface ReviewCycle {
    id: string;
    tenantId: string;
    title: string;
    status: 'Draft' | 'Active' | 'Completed';
    startDate: string;
    endDate: string;
}

export interface PerformanceReview {
    id: string;
    tenantId: string;
    employeeId: string;
    cycleId: string;
    selfReview: string;
    rating: number; // 1-5
    status: 'Pending' | 'Submitted' | 'Under Review' | 'Revision Requested' | 'Approved';
    submittedAt?: string;
    // Reviewer Fields
    managerRating?: number;
    managerFeedback?: string;
    internalNotes?: string;
    recommendation?: 'None' | 'Promotion' | 'Salary Increase' | 'Bonus';
    reviewedBy?: string;
    reviewedAt?: string;
    // Reminder Logic
    reminderLevel?: number; // 0=None, 1=24h, 2=72h, 3=Escalated
    lastRemindedAt?: string;
}

export const initialReviewCycles: ReviewCycle[] = [];

export const initialPerformanceReviews: PerformanceReview[] = [];

export const initialLeaveRequests: LeaveRequest[] = [];

export const jobs: Job[] = [];

export const mockEmployee: Employee | undefined = undefined; // Removed hardcoded default

// --- CMS Section Types ---

export type SectionType =
    | 'Hero'
    | 'About'
    | 'Approach'
    | 'Services'
    | 'KnowMore'
    | 'NewestTech'
    | 'Contact'
    | 'News'
    | 'CEOQuote'
    // About Page Sections
    | 'AboutHero'
    | 'OurMission'
    | 'TeamNarrative'
    | 'MeetTeam'
    | 'JoinTeam'
    // Services Page Sections
    | 'ServicesHero'
    | 'ServiceBlock'
    | 'ContactCTA'
    | 'ServiceDetailHero'
    | 'ServiceDetailOverview'
    | 'ServiceDetailOffering'
    | 'ServiceDetailContact'
    | 'CareersHero';

export interface BaseSection {
    id: string;
    type: SectionType;
    page: 'Home' | 'About' | 'Services' | 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices' | 'PrivacyPolicy' | 'TermsOfService' | 'Careers';
    isVisible: boolean;
    order: number; // 1-indexed
    lastUpdated: string;
    status: 'Published' | 'Draft';
}

// --- Home Page Section Interfaces ---

export interface HeroSection extends BaseSection {
    type: 'Hero';
    cards: {
        id: string;
        headline: string;
        subheadline: string;
        ctaLabel: string;
        ctaLink: string;
        imageUrl: string;
        altText?: string;
    }[];
}

export interface AboutSection extends BaseSection {
    type: 'About';
    title: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

export interface ServicesSection extends BaseSection {
    type: 'Services';
    title: string;
    subtitle: string;
    services: {
        id: string;
        title: string;
        description: string;
    }[];
    ctaLabel: string;
    ctaLink: string;
}

export interface KnowMoreSection extends BaseSection {
    type: 'KnowMore';
    title: string;
    highlight: string;
    description: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

export interface ApproachSection extends BaseSection {
    type: 'Approach';
    title: string;
    subtitle: string;
    steps: {
        id: string;
        title: string;
        description: string;
    }[];
    ctaLabel: string;
    ctaLink: string;
}

export interface NewestTechSection extends BaseSection {
    type: 'NewestTech';
    title: string;
    subtitle: string;
    description: string;
    ctaLabel: string;
    ctaLink: string;
    showAndroid: boolean;
    showIOS: boolean;
    imageUrl: string;
    altText?: string;
}

export interface ContactSection extends BaseSection {
    type: 'Contact';
    title: string;
    subtitle: string;
    intro: string;
    privacyText: string;
}

export interface NewsSection extends BaseSection {
    type: 'News';
    title: string;
    newsItems: {
        id: string;
        title: string;
        summary: string;
        category: string;
        imageUrl: string;
        link: string;
    }[];
    ctaLabel: string;
    ctaLink: string;
}

export interface CEOQuoteSection extends BaseSection {
    type: 'CEOQuote';
    title: string;
    quote: string;
    authorName: string;
    authorTitle: string;
    imageUrl: string;
    altText?: string;
}

// --- About Page Section Interfaces ---

export interface AboutHeroSection extends BaseSection {
    type: 'AboutHero';
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    altText?: string;
}

export interface OurMissionSection extends BaseSection {
    type: 'OurMission';
    title?: string; // Optional wrapper title
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    imageUrl: string;
    altText?: string;
}

export interface TeamNarrativeSection extends BaseSection {
    type: 'TeamNarrative';
    title: string;
    text: string;
    imageUrl: string;
    altText?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    altText?: string;
    bio?: string;
    generatedAt?: string;
    processedAt?: string;
    paidAt?: string;
    transactionId?: string;
    linkedinUrl?: string; // Added for About Page
}

export interface MeetTeamSection extends BaseSection {
    type: 'MeetTeam';
    title: string;
    subtitle: string;
    members: TeamMember[];
}

export interface JoinTeamCTASection extends BaseSection {
    type: 'JoinTeam';
    title: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

export interface ContactCTASection extends BaseSection {
    type: 'ContactCTA';
    title: string;
    text: string;
    ctaLabel: string;
    ctaLink: string;
}

// Alias for generic usage if needed, though mostly using unions
export type HomepageSection =
    | HeroSection
    | AboutSection
    | ServicesSection
    | KnowMoreSection
    | ApproachSection
    | NewestTechSection
    | ContactSection
    | NewsSection
    | CEOQuoteSection;

export interface ServicesHeroSection extends BaseSection {
    type: 'ServicesHero';
    page: 'Services';
    title: string;          // "Our Services"
    headline: string;       // "Our Solutions Are Innovative"
    description: string;
    imageUrl: string;
    altText?: string;
}

export interface ServiceBlockSection extends BaseSection {
    type: 'ServiceBlock';
    page: 'Services';
    serviceTitle: string;
    description: string;    // Multi-paragraph allowed (newline separated or HTML)
    ctaLabel: string;
    ctaLink: string;
    imageUrl: string;
    altText?: string;
}

// Reuse ContactCTASection for Services Contact

// Union of all CMS Sections
export type CMSSection =
    | HeroSection
    | AboutSection
    | ApproachSection
    | ServicesSection
    | KnowMoreSection
    | NewestTechSection
    | ContactSection
    | NewsSection
    | CEOQuoteSection
    | AboutHeroSection
    | OurMissionSection
    | TeamNarrativeSection
    | MeetTeamSection
    | JoinTeamCTASection
    | ContactCTASection
    | ServicesHeroSection
    | ServiceBlockSection
    | ServiceDetailHeroSection
    | ServiceDetailOverviewSection
    | ServiceDetailOfferingSection
    | ServiceDetailOfferingSection
    | ServiceDetailContactSection
    | CareersHeroSection;

// ... (keep HomepageSection alias)

// ... (keep initialCMSContent and initialAboutContent)

// --- GLOBAL SETTINGS ---
export interface GlobalContent {
    tenantId: string;
    siteName: string;
    logoUrl: string;
    faviconUrl: string;
    navigation: {
        id: string;
        label: string;
        path: string; // Slug or absolute URL
        type: 'Internal' | 'External';
        isVisible: boolean;
        order: number;
    }[];
    seoDefaults: {
        siteTitle: string;
        siteDescription: string;
        ogImage: string;
        twitterHandle?: string;
    };
    contactInfo: {
        email: string;
        phone: string;
        address: string;
    };
    socialLinks: {
        linkedin: string;
        facebook: string;
        twitter: string;
        instagram: string;
    };
    metaDescription: string;
    metaKeywords: string;
}

export type ServiceCollection = ServiceItem[];

export const initialGlobalContent: GlobalContent = {
    tenantId: 'tenant-default',
    siteName: 'Eleastar',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    contactInfo: {
        email: 'info@eleastar.com',
        phone: '+234 800 123 4567',
        address: '123 Innovation Drive, Lagos, Nigeria'
    },
    socialLinks: {
        linkedin: 'https://linkedin.com/company/eleastar',
        facebook: 'https://facebook.com/eleastar',
        twitter: 'https://twitter.com/eleastar',
        instagram: 'https://instagram.com/eleastar'
    },
    metaDescription: 'Leading provider of workforce solutions and technological innovation.',
    metaKeywords: 'ERP, Workforce, Payroll, Verification, Technology',
    navigation: [
        { id: 'nav-services', label: 'Services', path: '/services', type: 'Internal', isVisible: true, order: 1 },
        { id: 'nav-technologies', label: 'Technologies', path: '/technologies', type: 'Internal', isVisible: true, order: 2 },
        { id: 'nav-culture', label: 'Eleastar & You', path: '/eleastar-and-you', type: 'Internal', isVisible: true, order: 3 },
        { id: 'nav-about', label: 'About Eleastar', path: '/about', type: 'Internal', isVisible: true, order: 4 },
        { id: 'nav-contact', label: 'Contact', path: '/contact', type: 'Internal', isVisible: true, order: 5 },
    ],
    seoDefaults: {
        siteTitle: 'Eleastar - Innovative Tech Solutions',
        siteDescription: 'Leading technology partner for industrial and digital transformation.',
        ogImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },

};

// --- SEO METADATA ---
export interface PageMetadata {
    id: string; // matches Page ID (e.g. 'Home')
    tenantId: string;
    path: string; // Canonical path
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noIndex: boolean;
}

export const initialPageMetadata: Record<string, PageMetadata> = {};


// --- UNIFIED CMS STRUCTURE ---

export interface SEOMetadata {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noIndex: boolean;
}

export interface CMSPage {
    id: string;
    tenantId: string;
    slug: string;
    name: string;
    status: 'Published' | 'Draft';
    seo: SEOMetadata;
    sections: CMSSection[];
    lastUpdated: string;
}




// --- SERVICES COLLECTION ---

export interface ServiceContentBlock {
    id: string;
    type: 'Feature' | 'Benefit' | 'Process' | 'Standard'; // Just for categorization if needed
    title1: string;
    title2?: string;
    description: string;
    imageUrl?: string;
    imageAlt?: string;
    order: number;
}

export interface ServiceItem {
    id: string; // UUID
    tenantId: string;
    slug: string; // e.g. 'industrial-solutions'
    title: string;
    shortDescription: string; // For listing
    icon: string; // URL or Lucide name

    // Detail Page Data
    bannerImage: string;
    bannerAlt: string;

    contentBlocks: ServiceContentBlock[];

    // SEO Override (Optional - falls back to defaults generated from content)
    seo?: Partial<PageMetadata>;

    status: 'Published' | 'Draft';
    lastUpdated: string;
}

export const initialServicesCollection: ServiceItem[] = [];

export const initialServicesContent: CMSSection[] = [];

export const initialIndustrialSolutionsContent: CMSSection[] = [];

export const initialInformationTechnologyContent: CMSSection[] = [];

export const initialResearchAndDevelopmentContent: CMSSection[] = [];

export const initialElectronicsManufacturingContent: CMSSection[] = [];

// --- Footer CMS Types ---

export interface FooterLink {
    id: string;
    label: string;
    url: string;
    isVisible: boolean; // For utility/social toggling
}

export interface FooterSection {
    id: string;
    lastUpdated: string;
    title?: string;
    links?: FooterLink[];
    content?: string; // For legal text or copyright RC number
    // For specific configurations like social platforms or simple text fields
}

export interface FooterContent {
    navigation: FooterSection;
    utility: FooterSection;
    social: FooterSection;
    legal: FooterSection;
    copyright: FooterSection;
}

export const initialFooterContent: FooterContent = {
    navigation: {
        id: 'footer-nav',
        lastUpdated: new Date().toISOString(),
        title: 'Primary Navigation',
        links: []
    },
    utility: {
        id: 'footer-utility',
        lastUpdated: new Date().toISOString(),
        title: 'Utility Links',
        links: []
    },
    social: {
        id: 'footer-social',
        lastUpdated: new Date().toISOString(),
        title: 'Connect With Us',
        links: []
    },
    legal: {
        id: 'footer-legal',
        lastUpdated: new Date().toISOString(),
        title: 'Legal',
        links: []
    },
    copyright: {
        id: 'footer-copyright',
        lastUpdated: new Date().toISOString(),
        content: '© 2026 Eleastar. All rights reserved.',
        links: []
    }
};

export interface ServiceDetailHeroSection extends BaseSection {
    type: 'ServiceDetailHero';
    page: 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices';
    title: string;
    intro: string;
}

export interface ServiceDetailOverviewSection extends BaseSection {
    type: 'ServiceDetailOverview';
    page: 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices';
    imageUrl: string;
    altText: string;
}

export interface ServiceDetailOfferingSection extends BaseSection {
    type: 'ServiceDetailOffering';
    page: 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices';
    number: string;
    title: string;
    description: string; // or text? Industrial has 'text', IT has 'description' and 'text'. Let's standardize on description for new ones, but support existing.
    // Industrial uses 'text', IT uses 'description' (in mock) but type def might be inconsistent.
    // Let's look at the Industrial again.
    // Industrial mock uses 'text'. IT mock uses 'description' and 'text'?
    // Let's look at the IT mock data again. IT mock uses 'description'.
    // Industrial mock uses 'text'.
    // To be safe, let's keep it flexible or check the definition below.
    // The previous view showed Interface definition for Hero and Overview.
    // Let's assume standardizing on 'description' is better but we must support 'text' if used.
    // Actually, let's look at the implementation of ServiceDetail.tsx to see what it expects.
    imageUrl: string;
    altText?: string;
    ctaLabel?: string;
    ctaLink?: string;
}

export interface ServiceDetailContactSection extends BaseSection {
    type: 'ServiceDetailContact';
    page: 'IndustrialSolutions' | 'InformationTechnology' | 'ResearchAndDevelopment' | 'ElectronicsManufacturing' | 'SpecificITServices';
    title: string;
    description: string;
    ctaLabel: string; // Button text
    ctaLink: string;  // mailto: or link
}

export interface CareersHeroSection extends BaseSection {
    type: 'CareersHero';
    page: 'Careers';
    title: string;
    body: string;
    imageUrl?: string;
}
export interface CareersHeroSection extends BaseSection {
    type: 'CareersHero';
    page: 'Careers';
    title: string;
    body: string;
    imageUrl?: string;
}


// --- CMS CONTENT ---
export const initialCMSContent: CMSSection[] = [];
export const initialAboutContent: CMSSection[] = [];
export const initialSpecificITServicesContent: CMSSection[] = [];
export const initialCareersContent: CMSSection[] = [];

export const initialPages: Record<string, CMSPage> = {};



// --- Finance & Ledger Data ---
export const initialLedgerEntries: LedgerEntry[] = [];

// --- Promotion Requests ---
export const initialPromotionRequests: PromotionRequest[] = [];

// --- Task Management ---
export const initialTasks: Task[] = [];

export const initialApiKeys: SystemApiKey[] = [];
