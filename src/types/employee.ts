// =============================================================================
// EMPLOYEE
// =============================================================================

import type { AdminRole, RolesProps } from './auth';

/**
 * Lifecycle status of an employee from initial onboarding through exit.
 */
export type EmployeeStatus = 'onboarding' | 'probation' | 'active' | 'suspended' | 'exited';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
// ---------------------------------------------------------------------------
// Financial
// ---------------------------------------------------------------------------

export interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface TaxDetails {
    /** Tax Identification Number */
    taxId: string;
    /** Pension Enrollment Number */
    pensionId: string;
}

// ---------------------------------------------------------------------------
// Assets & Contracts
// ---------------------------------------------------------------------------

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
    /** Simulated file URL */
    fileUrl: string;
    fileSize: number;
    status: 'active' | 'expired' | 'superseded';
}

export interface ContractInfo {
    contractType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
    startDate: string;
    /** For contracts and internships */
    endDate?: string;
    probationEndDate?: string;
    /** Notice period in days */
    noticePeriod: number;
    documents: ContractDocument[];
}

// ---------------------------------------------------------------------------
// Career History
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Employee Record
// ---------------------------------------------------------------------------

export interface Employee {
    id: number;
    photoUrl: string;
    employee_id: string;
    department_id: string;
    role_id: string;
    role_relation: RolesProps;
    employment_type: EmploymentType ;
    salary: string;
    performance_rating: string;
    hire_date: string;
    has_disciplinary_record: boolean;
    status: EmployeeStatus;
    name: string;
    email: string;
    email_verified_at: string;
    otp_expires_at: string;
    is_first_login: boolean;
    last_login_at: string;
    created_at: string;

    // Lifecycle
    verifiedAt: string;
    /** ISO date string — used for Length of Service calculations */
    joinedAt: string;




    // Hierarchy
    /** ID of the employee's direct manager */
    managerId?: string;

    // Financials
    bankDetails?: BankDetails;
    taxDetails?: TaxDetails;

    // Assets & Contract
    assets?: Asset[];
    contractInfo?: ContractInfo;

    // Self-Service Fields
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

    // Leave
    leaveBalance?: {
        /** Total annual days entitlement, e.g. 20 */
        annual: number;
        /** Sick days entitlement, e.g. 10 */
        sick: number;
        /** Total days used across all types */
        used: number;
    };

    // Career History
    salaryHistory?: SalaryHistoryEntry[];
    promotionHistory?: PromotionHistoryEntry[];
}
