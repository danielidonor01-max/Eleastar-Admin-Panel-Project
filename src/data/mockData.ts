export type EmployeeStatus = 'onboarding' | 'probation' | 'active' | 'suspended' | 'exited';

export type AdminRole = 'SUPER_ADMIN' | 'COO' | 'HR_ADMIN' | 'MANAGEMENT_ADMIN' | 'FINANCE_ADMIN' | 'PAYROLL_ADMIN' | 'TECHNICIAN' | 'USER' | 'CHIEF_RISK_OFFICER' | 'WEB_ADMIN' | 'VIEWER';

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

export interface SalaryStructure {
    id: string;
    tenantId: string;
    role: AdminRole;
    grade: string;
    minSalary: number;
    maxSalary: number;
    currency: string;
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

export const initialEligibilityRules: PromotionEligibilityRule[] = [
    {
        id: 'RULE-001',
        tenantId: 'tenant-123',
        name: 'Standard Promotion Criteria',
        targetRole: 'Global',
        minTimeInRoleMonths: 6,
        minPerformanceRating: 4.0,
        requireCleanRecord: true,
        isActive: true
    },
    {
        id: 'RULE-002',
        tenantId: 'tenant-123',
        name: 'Senior Management Criteria',
        targetRole: 'COO',
        minTimeInRoleMonths: 12,
        minPerformanceRating: 4.5,
        requireCleanRecord: true,
        isActive: true
    }
];

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

export const employees: Employee[] = [
    {
        tenantId: 'tenant-default',
        id: "EMP-001",
        name: "Stephen Omovwigho",
        title: "CEO",
        department: "Management",
        photoUrl: "https://ui-avatars.com/api/?name=Stephen+Omovwigho&background=0D8ABC&color=fff",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2020-01-15T09:00:00Z', // > 5 years
        salary: 500000,
        employmentType: 'Full-time',
        email: "stephen@eleastar.com",
        systemRole: 'SUPER_ADMIN',
        accessGranted: true,
        contractInfo: {
            contractType: 'Full-Time',
            startDate: '2020-01-15T09:00:00Z',
            noticePeriod: 90,
            documents: [
                {
                    id: 'DOC-001',
                    name: 'Employment Contract - CEO.pdf',
                    type: 'Employment Contract',
                    uploadedAt: '2020-01-10T10:00:00Z',
                    uploadedBy: 'HR-SYSTEM',
                    fileUrl: '/documents/contracts/ceo-contract.pdf',
                    fileSize: 245000,
                    status: 'active'
                }
            ]
        },
        socialLinks: {
            linkedin: "https://linkedin.com",
            twitter: "https://twitter.com",
            instagram: "https://instagram.com"
        }
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-002",
        name: "Glory Omokefe",
        title: "COO", // Updated to COO
        department: "Operations",
        photoUrl: "https://ui-avatars.com/api/?name=Glory+Omokefe&background=random",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2021-03-10T09:00:00Z', // ~4 years
        salary: 350000, // Bumped for C-level
        employmentType: 'Full-time',
        email: "glory@eleastar.com",
        systemRole: 'COO', // Updated Role
        accessGranted: true,
        managerId: "EMP-001" // Reports to CEO
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-CRO-01",
        name: "Sarah Risk",
        title: "CHIEF_RISK_OFFICER",
        department: "Compliance",
        photoUrl: "https://ui-avatars.com/api/?name=Sarah+Risk&background=random",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2022-01-10T09:00:00Z',
        salary: 320000,
        employmentType: 'Full-time',
        email: "sarah@eleastar.com",
        systemRole: 'CHIEF_RISK_OFFICER',
        accessGranted: true,
        managerId: "EMP-001" // Reports to CEO
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-003",
        name: "Odirin Success",
        title: "Backend Developer",
        department: "Engineering",
        photoUrl: "https://ui-avatars.com/api/?name=Odirin+Success&background=random",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2023-06-01T09:00:00Z', // < 3 years
        salary: 150000,
        employmentType: 'Full-time',
        email: "odirin@eleastar.com",
        systemRole: 'USER',
        accessGranted: true,
        phoneNumber: "+234 812 345 6789",
        socialLinks: {
            linkedin: "https://linkedin.com/in/odirinsuccess",
            twitter: "https://x.com/odirin_dev"
        },
        leaveBalance: {
            annual: 20,
            sick: 10,
            used: 0
        }
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-004",
        name: "Victor Ibanoson",
        title: "Backend Developer",
        department: "Engineering",
        photoUrl: "https://ui-avatars.com/api/?name=Victor+Ibanoson&background=random",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2023-08-15T09:00:00Z',
        salary: 200000,
        employmentType: 'Full-time',
        email: "victor@eleastar.com",
        systemRole: 'USER',
        accessGranted: true
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-005",
        name: "Fegor Idoro",
        title: "Frontend Developer",
        department: "Engineering",
        photoUrl: "https://ui-avatars.com/api/?name=Fegor+Idoro&background=random",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2024-01-10T09:00:00Z', // ~1 year
        salary: 200000,
        employmentType: 'Full-time',
        email: "fegor@eleastar.com",
        systemRole: 'USER',
        accessGranted: true
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-006",
        name: "Daniel Idonor",
        title: "UI/UX Designer",
        department: "Product",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        status: 'active',
        verifiedAt: new Date().toISOString(),
        joinedAt: '2024-02-01T09:00:00Z',
        salary: 150000,
        employmentType: 'Full-time',
        email: "daniel@eleastar.com",
        systemRole: 'COO',
        accessGranted: true
    },
    {
        tenantId: 'tenant-default',
        id: "EMP-007",
        name: "Victory Inorko",
        title: "Intern",
        department: "Engineering",
        photoUrl: "https://ui-avatars.com/api/?name=Victory+Inorko&background=random",
        status: 'active', // Changed to active lifecycle, but USER type
        verifiedAt: new Date().toISOString(),
        joinedAt: '2024-11-01T09:00:00Z', // Recent
        salary: 70000,
        employmentType: 'Intern',
        email: "victory@eleastar.com",
        systemRole: 'USER', // Updated from USER
        accessGranted: true
    }
];

export const salaryStructures: SalaryStructure[] = [
    {
        id: 'SS-001',
        tenantId: 'tenant-default',
        role: 'USER',
        grade: 'L1 - Entry',
        minSalary: 100000,
        maxSalary: 250000,
        currency: 'NGN'
    },
    {
        id: 'SS-002',
        tenantId: 'tenant-default',
        role: 'USER',
        grade: 'T1 - Junior',
        minSalary: 80000,
        maxSalary: 180000,
        currency: 'NGN'
    },
    {
        id: 'SS-003',
        tenantId: 'tenant-default',
        role: 'COO',
        grade: 'M1 - Lead',
        minSalary: 300000,
        maxSalary: 800000,
        currency: 'NGN'
    },
    {
        id: 'SS-004',
        tenantId: 'tenant-default',
        role: 'COO',
        grade: 'C-Suite',
        minSalary: 1000000,
        maxSalary: 5000000,
        currency: 'NGN'
    },
    {
        id: 'SS-005',
        tenantId: 'tenant-default',
        role: 'USER',
        grade: 'I1 - Intern',
        minSalary: 50000,
        maxSalary: 100000,
        currency: 'NGN'
    },
    {
        id: 'SS-006',
        tenantId: 'tenant-default',
        role: 'USER',
        grade: 'JT1 - Junior Tech',
        minSalary: 70000,
        maxSalary: 150000,
        currency: 'NGN'
    }
];

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

export const initialReviewCycles: ReviewCycle[] = [
    {
        tenantId: 'tenant-default',
        id: 'CYC-001',
        title: 'Q1 2026 Performance Review',
        status: 'Active',
        startDate: '2026-03-01',
        endDate: '2026-03-31'
    }
];

export const initialPerformanceReviews: PerformanceReview[] = [];

export const initialLeaveRequests: LeaveRequest[] = [
    {
        tenantId: 'tenant-default',
        id: "LR-001",
        employeeId: "EMP-003", // Odirin Success
        type: 'Annual',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
        days: 3,
        reason: "Personal time off to attend a wedding.",
        status: 'Pending',
        requestedAt: '2026-01-29T10:00:00Z', // ~3 days ago (Trigger 72h)
        reminderLevel: 0
    },
    {
        tenantId: 'tenant-default',
        id: "LR-002",
        employeeId: "EMP-004", // Victor
        type: 'Sick',
        startDate: '2026-02-05',
        endDate: '2026-02-06',
        days: 2,
        reason: "Feeling unwell",
        status: 'Pending',
        requestedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // ~25 hours ago (Trigger 24h)
        reminderLevel: 0
    },
    {
        tenantId: 'tenant-default',
        id: "LR-003",
        employeeId: "EMP-005", // Fegor
        type: 'Unpaid',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        days: 5,
        reason: "Traveling",
        status: 'Pending',
        requestedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // ~6 days ago (Trigger Escalation)
        reminderLevel: 0
    }
];

export const jobs: Job[] = [
    {
        id: "JOB-001",
        tenantId: 'tenant-default',
        title: 'Frontend Developer',
        department: 'Engineering',
        type: 'Full-time',
        location: 'Abuja (Hybrid)',
        applicants: 3,
        status: 'Published',
        postedAt: new Date().toISOString(),
        description: 'We are looking for a skilled Frontend Developer with React experience...',
        deadline: '2026-02-28',
        applicationList: [
            { tenantId: 'tenant-default', id: 'APP-001', jobId: 'JOB-001', candidateName: 'John Doe', email: 'john@example.com', resumeUrl: '#', status: 'New', appliedAt: '2026-01-20' },
            { tenantId: 'tenant-default', id: 'APP-002', jobId: 'JOB-001', candidateName: 'Jane Smith', email: 'jane@example.com', resumeUrl: '#', status: 'Reviewing', appliedAt: '2026-01-18' },
            { tenantId: 'tenant-default', id: 'APP-003', jobId: 'JOB-001', candidateName: 'Samuel Green', email: 'sam@example.com', resumeUrl: '#', status: 'Rejected', appliedAt: '2026-01-15' }
        ]
    },
    {
        id: 'JOB-002',
        tenantId: 'tenant-default',
        title: 'Backend Developer',
        department: 'Engineering',
        type: 'Full-time',
        location: 'Abuja (Hybrid)',
        applicants: 0,
        status: 'Published',
        postedAt: new Date().toISOString(),
        description: 'Join our backend team to build scalable APIs...',
        deadline: '2026-02-15',
        applicationList: []
    },
    {
        id: 'JOB-003',
        tenantId: 'tenant-default',
        title: 'Product Marketing Manager',
        department: 'Marketing',
        type: 'Full-time',
        location: 'Lagos (Remote)',
        applicants: 1,
        status: 'Published',
        postedAt: new Date().toISOString(),
        description: 'Lead our marketing initiatives...',
        deadline: '2026-03-10',
        applicationList: [
            { tenantId: 'tenant-default', id: 'APP-004', jobId: 'JOB-003', candidateName: 'Michael Brown', email: 'michael@example.com', resumeUrl: '#', status: 'Shortlisted', appliedAt: '2026-01-22' }
        ]
    }
];

export const mockEmployee = employees[5]; // Default for verification page

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

export const initialPageMetadata: Record<string, PageMetadata> = {
    'Home': {
        id: 'Home',
        tenantId: 'tenant-default',
        path: '/',
        metaTitle: 'Home | Eleastar',
        metaDescription: 'Welcome to Eleastar.',
        ogTitle: 'Home | Eleastar',
        ogDescription: 'Welcome to Eleastar.',
        ogImage: '',
        noIndex: false
    },
    'About': {
        id: 'About',
        tenantId: 'tenant-default',
        path: '/about',
        metaTitle: 'About Us | Eleastar',
        metaDescription: 'Learn about our mission and team.',
        ogTitle: 'About Us | Eleastar',
        ogDescription: 'Learn about our mission and team.',
        ogImage: '',
        noIndex: false
    },
    'Services': {
        id: 'Services',
        tenantId: 'tenant-default',
        path: '/services',
        metaTitle: 'Our Services | Eleastar',
        metaDescription: 'Explore our comprehensive services.',
        ogTitle: 'Our Services | Eleastar',
        ogDescription: 'Explore our comprehensive services.',
        ogImage: '',
        noIndex: false
    },
    'Contact': {
        id: 'Contact',
        tenantId: 'tenant-default',
        path: '/contact',
        metaTitle: 'Contact Us | Eleastar',
        metaDescription: 'Get in touch with us.',
        ogTitle: 'Contact Us | Eleastar',
        ogDescription: 'Get in touch with us.',
        ogImage: '',
        noIndex: false
    },
    'PrivacyPolicy': {
        id: 'PrivacyPolicy',
        tenantId: 'tenant-default',
        path: '/privacy-policy',
        metaTitle: 'Privacy Policy | Eleastar',
        metaDescription: 'Our commitment to your privacy.',
        ogTitle: 'Privacy Policy | Eleastar',
        ogDescription: 'Our commitment to your privacy.',
        ogImage: '',
        noIndex: false
    },
    'TermsOfService': {
        id: 'TermsOfService',
        tenantId: 'tenant-default',
        path: '/terms-of-service',
        metaTitle: 'Terms of Service | Eleastar',
        metaDescription: 'Terms and conditions for using our services.',
        ogTitle: 'Terms of Service | Eleastar',
        ogDescription: 'Terms and conditions for using our services.',
        ogImage: '',
        noIndex: false
    },
    'IndustrialSolutions': {
        id: 'IndustrialSolutions',
        tenantId: 'tenant-default',
        path: '/services/industrial-solutions',
        metaTitle: 'Industrial Solutions | Eleastar',
        metaDescription: 'We deliver automation systems, machinery maintenance, and industrial IoT setups.',
        ogTitle: 'Industrial Solutions | Eleastar',
        ogDescription: 'We deliver automation systems, machinery maintenance, and industrial IoT setups.',
        ogImage: '',
        noIndex: false
    },
    'InformationTechnology': {
        id: 'InformationTechnology',
        tenantId: 'tenant-default',
        path: '/services/information-technology',
        metaTitle: 'Information Technology | Eleastar',
        metaDescription: 'End-to-end IT solutions including software development and cloud infrastructure.',
        ogTitle: 'Information Technology | Eleastar',
        ogDescription: 'End-to-end IT solutions including software development and cloud infrastructure.',
        ogImage: '',
        noIndex: false
    },
    'ResearchAndDevelopment': {
        id: 'ResearchAndDevelopment',
        tenantId: 'tenant-default',
        path: '/services/research-and-development',
        metaTitle: 'Research & Development | Eleastar',
        metaDescription: 'Pioneering future technologies through dedicated research and innovative prototyping.',
        ogTitle: 'Research & Development | Eleastar',
        ogDescription: 'Pioneering future technologies through dedicated research and innovative prototyping.',
        ogImage: '',
        noIndex: false
    },
    'ElectronicsManufacturing': {
        id: 'ElectronicsManufacturing',
        tenantId: 'tenant-default',
        path: '/services/electronics-manufacturing',
        metaTitle: 'Electronics Manufacturing | Eleastar',
        metaDescription: 'High-precision electronics manufacturing and assembly services delivering reliability and scalability.',
        ogTitle: 'Electronics Manufacturing | Eleastar',
        ogDescription: 'High-precision electronics manufacturing and assembly services delivering reliability and scalability.',
        ogImage: '',
        noIndex: false
    }
};


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

export const initialServicesCollection: ServiceItem[] = [
    {
        id: 'svc-industrial-solutions',
        tenantId: 'tenant-default',
        slug: 'industrial-solutions',
        title: 'Industrial Solutions',
        shortDescription: 'We deliver automation systems, machinery maintenance, and industrial IoT setups.',
        icon: 'Factory', // Lucide icon name holder
        bannerImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        bannerAlt: 'Industrial Pipes',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            {
                id: 'sb-1',
                type: 'Feature',
                title1: 'Technological Solutions For Industries',
                title2: '01',
                description: 'Creating a modern software solutions for various industries, focusing on high-quality, innovative applications.',
                imageUrl: 'https://images.unsplash.com/photo-1581093450065-0a6b42b12975?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Tech Solutions',
                order: 1
            },
            {
                id: 'sb-2',
                type: 'Feature',
                title1: 'IT Consulting For Industries',
                title2: '02',
                description: 'Developing custom software solutions for various industries, focusing on high-quality, innovative applications.',
                imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                imageAlt: 'IT Consulting',
                order: 2
            }
        ]
    },
    {
        id: 'svc-information-technology',
        tenantId: 'tenant-default',
        slug: 'information-technology',
        title: 'Information Technology',
        shortDescription: 'End-to-end IT solutions including software development and cloud infrastructure.',
        icon: 'Server',
        bannerImage: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        bannerAlt: 'Server Room',
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        contentBlocks: [
            {
                id: 'sb-it-1',
                type: 'Feature',
                title1: 'Software Development',
                title2: '01',
                description: 'Custom software solutions tailored to your business needs, from web applications to enterprise systems.',
                imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                imageAlt: 'Coding',
                order: 1
            }
        ]
    }
];

export const initialServicesContent: CMSSection[] = [
    {
        id: 'svc-hero',
        type: 'ServicesHero',
        page: 'Services',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Our Services',
        headline: 'Our Solutions Are Innovative',
        description: 'We offer a comprehensive suite of technology and industrial solutions designed to drive efficiency and growth.',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
    },
    {
        id: 'svc-it',
        type: 'ServiceBlock',
        page: 'Services',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        serviceTitle: 'Information Technology Services',
        description: 'We provide end-to-end IT solutions including software development, cloud infrastructure management, and cybersecurity auditing. Our team ensures your digital backbone is robust and scalable.',
        ctaLabel: 'Learn More',
        ctaLink: '/contact',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'svc-rnd',
        type: 'ServiceBlock',
        page: 'Services',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        serviceTitle: 'Research And Development',
        description: 'Innovation is at our core. Our R&D division focuses on emerging technologies, prototyping new products, and finding smarter ways to solve industry problems.',
        ctaLabel: 'Explore R&D',
        ctaLink: '/contact',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'svc-electronics',
        type: 'ServiceBlock',
        page: 'Services',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        serviceTitle: 'Electronics Manufacturing',
        description: 'From PCB design to final assembly, we offer high-quality electronics manufacturing services tailored to your specifications and volume requirements.',
        ctaLabel: 'Manufacturing Details',
        ctaLink: '/contact',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'svc-industrial',
        type: 'ServiceBlock',
        page: 'Services',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        serviceTitle: 'Industrial Solutions',
        description: 'We deliver automation systems, machinery maintenance, and industrial IoT setups that optimize your production lines and reduce downtime.',
        ctaLabel: 'Industrial Solutions',
        ctaLink: '/services/industrial-solutions',
        imageUrl: 'https://images.unsplash.com/photo-1531297461136-82lw9z1.jpg?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'svc-specific',
        type: 'ServiceBlock',
        page: 'Services',
        isVisible: true,
        order: 6,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        serviceTitle: 'Specific IT Services',
        description: 'Need something niche? We offer specialized services including legacy system migration, database optimization, and custom API development.',
        ctaLabel: 'Consult with Us',
        ctaLink: '/contact',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'svc-contact',
        type: 'ContactCTA',
        page: 'Services',
        isVisible: true,
        order: 7,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Contact Us',
        text: 'Ready to start your project? Get in touch with our team today.',
        ctaLabel: 'Contact Now',
        ctaLink: '/contact'
    }
];

export const initialIndustrialSolutionsContent: CMSSection[] = [
    {
        id: 'ind-hero',
        type: 'ServiceDetailHero',
        page: 'IndustrialSolutions',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Industrial Solutions',
        intro: 'We aim to address current industry challenges and anticipate future trends, positioning us as a leader in technological innovation.'
    },
    {
        id: 'ind-overview',
        type: 'ServiceDetailOverview',
        page: 'IndustrialSolutions',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
        altText: 'Industrial Pipes against Blue Sky'
    },
    {
        id: 'ind-offering-1',
        type: 'ServiceDetailOffering',
        page: 'IndustrialSolutions',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '01',
        title: 'Technological Solutions For Industries',
        description: 'Creating a modern software solutions for various industries, focusing on high-quality, innovative applications.',
        imageUrl: 'https://images.unsplash.com/photo-1581093450065-0a6b42b12975?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'ind-offering-2',
        type: 'ServiceDetailOffering',
        page: 'IndustrialSolutions',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '02',
        title: 'IT Consulting For Industries',
        description: 'Developing custom software solutions for various industries, focusing on high-quality, innovative applications.',
        imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'ind-contact',
        type: 'ServiceDetailContact',
        page: 'IndustrialSolutions',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Contact US',
        description: 'Contact us today to learn how Weastar Technologies can support your business with our innovative and comprehensive service offerings. Edit in Pages copy.',
        ctaLabel: 'Reach Out To Us Now!',
        ctaLink: '/contact'
    }
];

export const initialInformationTechnologyContent: CMSSection[] = [
    {
        id: 'it-hero',
        type: 'ServiceDetailHero',
        page: 'InformationTechnology',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Information Technology Services',
        intro: 'We provide end-to-end IT solutions including software development, cloud infrastructure management, and cybersecurity auditing.'
    },
    {
        id: 'it-overview',
        type: 'ServiceDetailOverview',
        page: 'InformationTechnology',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Server room
        altText: 'Server Room'
    },
    {
        id: 'it-offering-1',
        type: 'ServiceDetailOffering',
        page: 'InformationTechnology',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '01',
        title: 'Software Development',
        description: 'Custom software solutions tailored to your business needs, from web applications to enterprise systems.',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'it-offering-2',
        type: 'ServiceDetailOffering',
        page: 'InformationTechnology',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '02',
        title: 'IT Consulting, Advisory, And Training',
        description: 'Expert guidance to help you navigate the digital landscape and upskill your workforce.',
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'it-offering-3',
        type: 'ServiceDetailOffering',
        page: 'InformationTechnology',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '03',
        title: 'Cloud Computing',
        description: 'Scalable cloud solutions to enhance flexibility, collaboration, and data security.',
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'it-offering-4',
        type: 'ServiceDetailOffering',
        page: 'InformationTechnology',
        isVisible: true,
        order: 6,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '04',
        title: 'Cybersecurity',
        description: 'Robust security measures to protect your digital assets and ensure compliance.',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'it-contact',
        type: 'ServiceDetailContact',
        page: 'InformationTechnology',
        isVisible: true,
        order: 7,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Contact US',
        description: 'Ready to transform your IT infrastructure? Reach out to our team of experts today.',
        ctaLabel: 'Get Started',
        ctaLink: '/contact'
    }
];

export const initialResearchAndDevelopmentContent: CMSSection[] = [
    {
        id: 'rnd-hero',
        type: 'ServiceDetailHero',
        page: 'ResearchAndDevelopment',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Research & Development',
        intro: 'Pioneering future technologies through dedicated research and innovative prototyping to solve complex challenges.'
    },
    {
        id: 'rnd-overview',
        type: 'ServiceDetailOverview',
        page: 'ResearchAndDevelopment',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Lab
        altText: 'R&D Laboratory'
    },
    {
        id: 'rnd-offering-1',
        type: 'ServiceDetailOffering',
        page: 'ResearchAndDevelopment',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '01',
        title: 'Prototype Development',
        description: 'Rapid prototyping services to bring your concepts to life and test feasibility.',
        imageUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'rnd-offering-2',
        type: 'ServiceDetailOffering',
        page: 'ResearchAndDevelopment',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '02',
        title: 'Technology Feasibility Studies',
        description: 'In-depth analysis to assess the technical and economic viability of new technologies.',
        imageUrl: 'https://images.unsplash.com/photo-1518152006812-edab29bca9b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'rnd-contact',
        type: 'ServiceDetailContact',
        page: 'ResearchAndDevelopment',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Collaborate With Us',
        description: 'Interested in partnering on cutting-edge research? Contact our R&D team.',
        ctaLabel: 'Inquire Now',
        ctaLink: '/contact'
    }
];

export const initialElectronicsManufacturingContent: CMSSection[] = [
    {
        id: 'elec-hero',
        type: 'ServiceDetailHero',
        page: 'ElectronicsManufacturing',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Electronics Manufacturing Services',
        intro: 'High-precision electronics manufacturing and assembly services delivering reliability and scalability.'
    },
    {
        id: 'elec-overview',
        type: 'ServiceDetailOverview',
        page: 'ElectronicsManufacturing',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Electronics
        altText: 'Electronics Assembly Line'
    },
    {
        id: 'elec-offering-1',
        type: 'ServiceDetailOffering',
        page: 'ElectronicsManufacturing',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '01',
        title: 'PCB Assembly',
        description: 'State-of-the-art printed circuit board assembly services for various applications.',
        imageUrl: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'elec-offering-2',
        type: 'ServiceDetailOffering',
        page: 'ElectronicsManufacturing',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '02',
        title: 'Quality Testing',
        description: 'Rigorous testing protocols to ensure every unit meets the highest quality standards.',
        imageUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'elec-contact',
        type: 'ServiceDetailContact',
        page: 'ElectronicsManufacturing',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Get A Quote',
        description: 'Contact us for a competitive quote on your electronics manufacturing needs.',
        ctaLabel: 'Request Quote',
        ctaLink: '/contact'
    }
];

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
        links: [
            { id: 'nav-1', label: 'Services', url: '/services', isVisible: true },
            { id: 'nav-2', label: 'Technology', url: '/technology', isVisible: true },
            { id: 'nav-3', label: 'Eleastar & You', url: '/culture', isVisible: true },
            { id: 'nav-4', label: 'About Eleastar', url: '/about', isVisible: true },
            { id: 'nav-5', label: 'Contact', url: '/contact', isVisible: true },
            { id: 'nav-6', label: 'New Update', url: '/news', isVisible: true },
            { id: 'nav-7', label: 'Locate us', url: '/contact#map', isVisible: true },
        ]
    },
    utility: {
        id: 'footer-utility',
        lastUpdated: new Date().toISOString(),
        title: 'Utility Links',
        links: [
            { id: 'util-1', label: 'Privacy policy', url: '/privacy', isVisible: true },
            { id: 'util-2', label: 'Terms of use', url: '/terms', isVisible: true },
        ]
    },
    social: {
        id: 'footer-social',
        lastUpdated: new Date().toISOString(),
        title: 'Social Media',
        links: [
            { id: 'soc-1', label: 'Facebook', url: '#', isVisible: true },
            { id: 'soc-2', label: 'X (Twitter)', url: '#', isVisible: true },
            { id: 'soc-3', label: 'LinkedIn', url: '#', isVisible: true },
            { id: 'soc-4', label: 'Instagram', url: '#', isVisible: true },
        ]
    },
    legal: {
        id: 'footer-legal',
        lastUpdated: new Date().toISOString(),
        content: "We grant you a limited, non-exclusive, non-transferable, revocable license to use the Website and our services for personal, non-commercial use, subject to these Terms. This license does not include any resale of our services or their contents; any collection and use of any product listings, descriptions, or prices; any derivative use of our services or their contents; or any use of data mining, robots, or similar data gathering and extraction tools. You may view, download for caching purposes only, and print pages from the Website for your personal use, subject to the restrictions set out below and elsewhere in these Terms"
    },
    copyright: {
        id: 'footer-copyright',
        lastUpdated: new Date().toISOString(),
        content: "RC - 7130026"
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
    // Let's check Industrial again.
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



export const initialCMSContent: CMSSection[] = [
    {
        id: 'sec-hero',
        type: 'Hero',
        page: 'Home',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        cards: [
            {
                id: 'card-1',
                headline: 'Driving Innovation, Delivering Excellence',
                subheadline: 'Your trusted partner for comprehensive verification and workforce solutions.',
                ctaLabel: 'Get Started',
                ctaLink: '/contact',
                imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
            }
        ]
    },
    {
        id: 'sec-about',
        type: 'About',
        page: 'Home',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'We Are Committed To Innovation And Excellence',
        text: 'We provide top-tier verification, seamless payroll integration, and robust HR management tools tailored for SMEs and industrial giants.',
        ctaLabel: 'Learn More',
        ctaLink: '/about',
        imageUrl: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'sec-services',
        type: 'Services',
        page: 'Home',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'We Partner with SMEs And Industrial Giants, Offering',
        subtitle: 'Quality Services',
        services: [
            { id: 'srv-1', title: 'Information Technology Services', description: 'Software Development, ISP, IT Consulting, Cloud Computing, Support, and Cybersecurity.' },
            { id: 'srv-2', title: 'Research and Development', description: 'Innovative Product Development, Data Services, and Training.' },
            { id: 'srv-3', title: 'Electronics Manufacturing', description: 'PCB Design, Component Sourcing, Custom Solutions, and Process Optimization.' },
            { id: 'srv-4', title: 'Industrial Solutions', description: 'Automation, Equipment Maintenance, Energy Management, Safety and Compliance.' },
            { id: 'srv-5', title: 'Specific IT Services', description: 'Ecommerce Solutions and Digital Marketing.' }
        ],
        ctaLabel: 'See All Services',
        ctaLink: '/services'
    },
    {
        id: 'sec-know-more',
        type: 'KnowMore',
        page: 'Home',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Know More',
        highlight: 'About Us',
        description: 'Our commitment goes beyond service delivery. We aim to build lasting partnerships based on trust and excellence.',
        ctaLabel: 'View More Details',
        ctaLink: '/about',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'sec-approach',
        type: 'Approach',
        page: 'Home',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Our Approach, The Standards',
        subtitle: 'For Our Uniqueness',
        steps: [
            { id: 'step-1', title: 'Client Consultation and Needs Assessment', description: 'We begin by understanding your specific goals and requirements.' },
            { id: 'step-2', title: 'Customized Solution Design', description: 'Tailoring strategies and technologies to fit your unique needs.' },
            { id: 'step-3', title: 'Prototyping and Feedback', description: 'Creating initial models to gather your input and refine the solution.' },
            { id: 'step-4', title: 'Implementation and Integration', description: 'Seamlessly deploying the solution into your existing systems.' },
            { id: 'step-5', title: 'Testing, Support and Maintenance', description: 'Ensuring long-term performance and reliability through continuous support.' }
        ],
        ctaLabel: 'Explore Our Methods',
        ctaLink: '/approach'
    },
    {
        id: 'sec-newest-tech',
        type: 'NewestTech',
        page: 'Home',
        isVisible: true,
        order: 6,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Our Newest',
        subtitle: 'Technology',
        description: 'A mobile money platform for Naira and Dollar transactions. Available on Android and IOS.',
        ctaLabel: 'View App',
        ctaLink: '/app',
        showAndroid: true,
        showIOS: true,
        imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'sec-contact',
        type: 'Contact',
        page: 'Home',
        isVisible: true,
        order: 7,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Lets Discuss Your',
        subtitle: 'Next Project',
        intro: 'Do you have a project in mind? We would love to hear from you.',
        privacyText: 'We respect your privacy. Your information is safe with us.'
    },
    {
        id: 'sec-news',
        type: 'News',
        page: 'Home',
        isVisible: true,
        order: 8,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Our Latest',
        newsItems: [
            { id: 'news-1', title: 'IoT Security', summary: 'Securing the connected world.', category: 'IoT', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', link: '/news/iot' },
            { id: 'news-2', title: 'AI Trends', summary: 'The future of artificial intelligence.', category: 'AI Tools', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', link: '/news/ai' }
        ],
        ctaLabel: 'View All News',
        ctaLink: '/news'
    },
    {
        id: 'sec-ceo',
        type: 'CEOQuote',
        page: 'Home',
        isVisible: true,
        order: 9,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: "We're Reputable",
        quote: "At the heart of our company lies a passion for technology and a dedication to pushing the boundaries of what's possible. We are driven by the belief that technology should enhance and simplify lives.",
        authorName: "Stephen Omovwigho",
        authorTitle: "CEO, Eleastar",
        imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
];

export const initialAboutContent: CMSSection[] = [
    {
        id: 'about-hero',
        type: 'AboutHero',
        page: 'About',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Driven by Purpose, Powered by People',
        subtitle: 'About Eleastar',
        description: 'We are a forward-thinking technology company dedicated to simplifying workforce management and empowering businesses through innovation.',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
    },
    {
        id: 'about-mission',
        type: 'OurMission',
        page: 'About',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Mission & Vision', // Optional title for section
        missionTitle: 'Our Mission',
        missionText: 'To provide cutting-edge solutions that streamline verification, payroll, and HR processes, enabling organizations to focus on what matters most—growth and people.',
        visionTitle: 'Our Vision',
        visionText: 'To be the global standard for integrated workforce solutions, fostering trust and efficiency in the digital age.',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    } as OurMissionSection, // Cast needed if BaseSection title is required and I only omitted it in object (it is required in BaseSection? No, specific props are. BaseSection doesn't have title. Wait, BaseSection DOES NOT have title. Good.)
    {
        id: 'about-narrative',
        type: 'TeamNarrative',
        page: 'About',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Our Team Narrative',
        text: 'At Eleastar, we believe that technology is only as good as the people behind it. Our diverse team of engineers, designers, and strategists works collaboratively to solve complex problems with simple, elegant solutions.',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'about-meet-team',
        type: 'MeetTeam',
        page: 'About',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Meet Our Leadership',
        subtitle: 'The minds behind our innovations.',
        members: [
            { id: 'u1', name: 'Stephen Omovwigho', role: 'Chief Executive Officer', imageUrl: 'https://ui-avatars.com/api/?name=Stephen+Omovwigho&background=0D8ABC&color=fff' },
            { id: 'u2', name: 'Glory Omokefe', role: 'Operations Manager', imageUrl: 'https://ui-avatars.com/api/?name=Glory+Omokefe&background=random' }
            // Add more as needed
        ]
    },
    {
        id: 'about-join',
        type: 'JoinTeam',
        page: 'About',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Join Our Team',
        text: 'Ready to make an impact? We are always looking for talented individuals to join our growing family.',
        ctaLabel: 'View Openings',
        ctaLink: '/careers',
        imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'about-contact',
        type: 'ContactCTA',
        page: 'About',
        isVisible: true,
        order: 6,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Get In Touch',
        text: 'Have questions or want to learn more about our services?',
        ctaLabel: 'Contact Us',
        ctaLink: '/contact'
    }
];

export const initialSpecificITServicesContent: CMSSection[] = [
    {
        id: 'spec-hero',
        type: 'ServiceDetailHero',
        page: 'SpecificITServices',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Specific IT Services',
        intro: 'We aim to address current industry challenges and anticipate future trends, positioning us as a leader in technological innovation.'
    },
    {
        id: 'spec-overview',
        type: 'ServiceDetailOverview',
        page: 'SpecificITServices',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80', // Collaboration image
        altText: 'IT Planning and Design Collaboration'
    },
    {
        id: 'spec-offering-1',
        type: 'ServiceDetailOffering',
        page: 'SpecificITServices',
        isVisible: true,
        order: 3,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '01',
        title: 'E-Commerce Solutions',
        description: 'Develop custom software solutions for various industries, focusing on high-quality, innovative applications.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'spec-offering-2',
        type: 'ServiceDetailOffering',
        page: 'SpecificITServices',
        isVisible: true,
        order: 4,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '02',
        title: 'Digital Marketing',
        description: 'Develop custom software solutions for various industries, focusing on high-quality, innovative applications.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'spec-offering-3',
        type: 'ServiceDetailOffering',
        page: 'SpecificITServices',
        isVisible: true,
        order: 5,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        number: '03',
        title: 'Outsourcing and Offshoring',
        description: 'Develop custom software solutions for various industries, focusing on high-quality, innovative applications.',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'spec-contact',
        type: 'ServiceDetailContact',
        page: 'SpecificITServices',
        isVisible: true,
        order: 6,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Contact Us',
        description: 'Contact us today to learn how Eleastar Technologies Ltd. can support your business with our innovative and comprehensive service offerings.',
        ctaLabel: 'Reach Out To Us Today',
        ctaLink: '/contact'
    },

    // --- Privacy Policy ---
    {
        id: 'pp-hero',
        type: 'AboutHero',
        page: 'PrivacyPolicy',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Privacy Policy',
        subtitle: '',
        description: 'We value your privacy. Read our policy to understand how we handle your data.',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80',
        altText: 'Privacy Policy Banner'
    },
    {
        id: 'pp-content',
        type: 'About', // Using About as generic content block
        page: 'PrivacyPolicy',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Data Collection',
        text: 'We collect information that you provide directly to us...',
        imageUrl: '', // Optional
        ctaLabel: '',
        ctaLink: ''
    },

    // --- Terms of Service ---
    {
        id: 'tos-hero',
        type: 'AboutHero',
        page: 'TermsOfService',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Terms of Service',
        subtitle: '',
        description: 'Please read these terms carefully before using our services.',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80',
        altText: 'Terms of Service Banner'
    },
    {
        id: 'tos-content',
        type: 'About',
        page: 'TermsOfService',
        isVisible: true,
        order: 2,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Agreement to Terms',
        text: 'By accessing our website, you agree to be bound by these terms...',
        imageUrl: '',
        ctaLabel: '',
        ctaLink: ''
    }
];

export const initialCareersContent: CMSSection[] = [
    {
        id: 'careers-hero',
        type: 'CareersHero',
        page: 'Careers',
        isVisible: true,
        order: 1,
        status: 'Published',
        lastUpdated: new Date().toISOString(),
        title: 'Careers at Eleastar',
        body: 'Join our world-class team building enterprise ERPs, AI solutions, and digital infrastructure for the continent.',
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80'
    }
];

export const initialPages: Record<string, CMSPage> = {
    'Home': {
        id: 'Home',
        tenantId: 'tenant-default',
        slug: '/',
        name: 'Home Page',
        status: 'Published',
        seo: {
            title: initialPageMetadata['Home'].metaTitle,
            description: initialPageMetadata['Home'].metaDescription,
            ogTitle: initialPageMetadata['Home'].ogTitle,
            ogDescription: initialPageMetadata['Home'].ogDescription,
            ogImage: initialPageMetadata['Home'].ogImage,
            noIndex: initialPageMetadata['Home'].noIndex
        },
        sections: initialCMSContent,
        lastUpdated: new Date().toISOString()
    },
    'About': {
        id: 'About',
        tenantId: 'tenant-default',
        slug: '/about',
        name: 'About Us',
        status: 'Published',
        seo: {
            title: initialPageMetadata['About'].metaTitle,
            description: initialPageMetadata['About'].metaDescription,
            ogTitle: initialPageMetadata['About'].ogTitle,
            ogDescription: initialPageMetadata['About'].ogDescription,
            ogImage: initialPageMetadata['About'].ogImage,
            noIndex: initialPageMetadata['About'].noIndex
        },
        sections: initialAboutContent,
        lastUpdated: new Date().toISOString()
    },
    'Services': {
        id: 'Services',
        tenantId: 'tenant-default',
        slug: '/services',
        name: 'Services Overview',
        status: 'Published',
        seo: {
            title: initialPageMetadata['Services'].metaTitle,
            description: initialPageMetadata['Services'].metaDescription,
            ogTitle: initialPageMetadata['Services'].ogTitle,
            ogDescription: initialPageMetadata['Services'].ogDescription,
            ogImage: initialPageMetadata['Services'].ogImage,
            noIndex: initialPageMetadata['Services'].noIndex
        },
        sections: initialServicesContent,
        lastUpdated: new Date().toISOString()
    },
    'Contact': {
        id: 'Contact',
        tenantId: 'tenant-default',
        slug: '/contact',
        name: 'Contact Us',
        status: 'Published',
        seo: {
            title: initialPageMetadata['Contact'].metaTitle,
            description: initialPageMetadata['Contact'].metaDescription,
            ogTitle: initialPageMetadata['Contact'].ogTitle,
            ogDescription: initialPageMetadata['Contact'].ogDescription,
            ogImage: initialPageMetadata['Contact'].ogImage,
            noIndex: initialPageMetadata['Contact'].noIndex
        },
        sections: [],
        lastUpdated: new Date().toISOString()
    },
    'PrivacyPolicy': {
        id: 'PrivacyPolicy',
        tenantId: 'tenant-default',
        slug: '/privacy-policy',
        name: 'Privacy Policy',
        status: 'Published',
        seo: {
            title: initialPageMetadata['PrivacyPolicy'].metaTitle,
            description: initialPageMetadata['PrivacyPolicy'].metaDescription,
            ogTitle: initialPageMetadata['PrivacyPolicy'].ogTitle,
            ogDescription: initialPageMetadata['PrivacyPolicy'].ogDescription,
            ogImage: initialPageMetadata['PrivacyPolicy'].ogImage,
            noIndex: initialPageMetadata['PrivacyPolicy'].noIndex
        },
        sections: initialSpecificITServicesContent.filter(s => s.page === 'PrivacyPolicy'),
        lastUpdated: new Date().toISOString()
    },
    'TermsOfService': {
        id: 'TermsOfService',
        tenantId: 'tenant-default',
        slug: '/terms-of-service',
        name: 'Terms of Service',
        status: 'Published',
        seo: {
            title: initialPageMetadata['TermsOfService'].metaTitle,
            description: initialPageMetadata['TermsOfService'].metaDescription,
            ogTitle: initialPageMetadata['TermsOfService'].ogTitle,
            ogDescription: initialPageMetadata['TermsOfService'].ogDescription,
            ogImage: initialPageMetadata['TermsOfService'].ogImage,
            noIndex: initialPageMetadata['TermsOfService'].noIndex
        },
        sections: initialSpecificITServicesContent.filter(s => s.page === 'TermsOfService'),
        lastUpdated: new Date().toISOString()
    },
    'SpecificITServices': {
        id: 'SpecificITServices',
        tenantId: 'tenant-default',
        slug: '/services/specific-it-services',
        name: 'Specific IT Services',
        status: 'Published',
        seo: {
            // Assuming default or missing metadata for this specific page if not in initialPageMetadata
            // But usually it should be there.
            // If not, use defaults.
            title: 'Specific IT Services | Eleastar',
            description: 'Specific IT Services including Ecommerce and Digital Marketing.',
            ogTitle: 'Specific IT Services | Eleastar',
            ogDescription: 'Specific IT Services including Ecommerce and Digital Marketing.',
            ogImage: '',
            noIndex: false
        },
        sections: initialSpecificITServicesContent.filter(s => s.page === 'SpecificITServices'),
        lastUpdated: new Date().toISOString()
    },
    'Careers': {
        id: 'Careers',
        tenantId: 'tenant-default',
        slug: '/careers',
        name: 'Careers',
        status: 'Published',
        seo: {
            title: 'Careers | Eleastar',
            description: 'Join our team and build the future of tech.',
            ogTitle: 'Careers | Eleastar',
            ogDescription: 'Join our team and build the future of tech.',
            ogImage: '',
            noIndex: false
        },
        sections: initialCareersContent,
        lastUpdated: new Date().toISOString()
    }
};



// --- Finance & Ledger Data ---
export const initialLedgerEntries: LedgerEntry[] = [
    {
        id: 'L-001',
        payrollCycleId: 'JAN-2026',
        tenantId: 'tenant-default',
        employeeId: 'EMP-001',
        currency: 'NGN',
        employeeName: 'Sarah Jenkins',
        type: 'Salary',
        bankDetails: { bankName: 'Access Bank', accountNumber: '0012345678', accountName: 'Sarah Jenkins' },
        amount: 450000,
        status: 'Pending Funding',
        createdAt: new Date().toISOString()
    },
    {
        id: 'L-002',
        payrollCycleId: 'JAN-2026',
        tenantId: 'tenant-default',
        employeeId: 'EMP-002',
        currency: 'NGN',
        employeeName: 'Michael Chen',
        type: 'Salary',
        bankDetails: { bankName: 'GTBank', accountNumber: '0098765432', accountName: 'Michael Chen' },
        amount: 550000,
        status: 'Funded',
        createdAt: new Date().toISOString()
    }
];

// --- Salary Structures ---
export const initialSalaryStructures: SalaryStructure[] = [
    {
        id: 'SS-001',
        tenantId: 'tenant-default',
        role: 'USER',
        grade: 'Associate',
        minSalary: 150000,
        maxSalary: 300000,
        currency: 'NGN'
    },
    {
        id: 'SS-002',
        tenantId: 'tenant-default',
        role: 'USER',
        grade: 'Senior Tech',
        minSalary: 250000,
        maxSalary: 450000,
        currency: 'NGN'
    },
    {
        id: 'SS-003',
        tenantId: 'tenant-default',
        role: 'SUPER_ADMIN',
        grade: 'Executive',
        minSalary: 800000,
        maxSalary: 1500000,
        currency: 'NGN'
    }
];

// --- Promotion Requests ---
export const initialPromotionRequests: PromotionRequest[] = [
    {
        id: 'PR-001',
        tenantId: 'tenant-default',
        employeeId: 'EMP-003', // Assuming exists
        currentRole: 'USER',
        newRole: 'USER',
        currentSalary: 200000,
        proposedSalary: 280000,
        effectiveDate: '2026-03-01',
        reason: 'Consistently high performance ratings and completed certifications.',
        requestedBy: 'EMP-001',
        requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'Pending',
        eligibilitySnapshot: {
            isEligible: true,
            reasons: [],
            scores: { performance: 4.5, tenureMonths: 14 }
        }
    }
];

