// =============================================================================
// PAYROLL — Cycles, Ledger & Bonuses
// =============================================================================

import type { AdminRole } from './auth';

// ---------------------------------------------------------------------------
// Payroll Cycle
// ---------------------------------------------------------------------------

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
        /** JSON-stringified snapshot of eligible employees and their calculations */
        rawData: string;
        totalDeductions?: number;
        totalNet?: number;
    };
    totalPayout?: number;
    approvedBy?: string;
    approvedAt?: string;
    executedAt?: string;
    createdAt?: string;
    paidAt?: string;
    transactionId?: string;
}

// ---------------------------------------------------------------------------
// Finance Ledger
// ---------------------------------------------------------------------------

export interface LedgerEntry {
    id: string;
    tenantId: string;
    payrollCycleId: string;
    employeeId: string;
    /** Snapshot of the employee's name at time of ledger creation */
    employeeName: string;
    /** Snapshot of bank details at time of ledger creation */
    bankDetails: {
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
    /** Unique Transaction Reference */
    transactionReference?: string;
}

// ---------------------------------------------------------------------------
// Bonuses
// ---------------------------------------------------------------------------

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
    /** Links this bonus to a specific payroll cycle */
    cycleId: string;
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


export interface Adjustment {
    empId: string;
    type: 'Bonus' | 'Fine' | 'Deduction';
    amount: number;
    reason: string;
    requestedBy?: string;
    appliedAt?: string;
    approvedBy?: string;
    approvedAt?: string;
    status?: string;
}


export interface PayrollEmployee {
    id: string;
    name: string;
    department?: string;
    title?: string;
    employmentType?: string;
    salary: number;
    status?: string;
    netPay?: number;
};
