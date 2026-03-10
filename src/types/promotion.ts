// =============================================================================
// PROMOTIONS — Requests & Eligibility Rules
// =============================================================================

import type { AdminRole } from './auth';

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
    /** User ID of whoever submitted the request */
    requestedBy: string;
    requestedAt: string;
    /** COO who approved */
    reviewedBy?: string;
    approvedBy?: string;
    reviewedAt?: string;
    approvedAt?: string;
    rejectionReason?: string;
    eligibilitySnapshot?: {
        isEligible: boolean;
        reasons: string[];
        scores: {
            /** Latest review rating */
            performance: number;
            tenureMonths: number;
        };
    };
}

export interface PromotionEligibilityRule {
    id: string;
    tenantId: string;
    name: string;
    /** Role this rule applies to, or "Global" for all roles */
    targetRole: AdminRole | 'Global';
    minTimeInRoleMonths: number;
    minPerformanceRating: number;
    /** No disciplinary actions in the last X months (mock logic) */
    requireCleanRecord: boolean;
    isActive: boolean;
}
