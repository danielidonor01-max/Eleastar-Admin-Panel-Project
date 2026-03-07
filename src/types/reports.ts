// =============================================================================
// COMPLIANCE REPORTS
// =============================================================================

export type ReportCategory = 'Payroll' | 'HR' | 'Access' | 'Attestation';

// ---------------------------------------------------------------------------
// Payroll Reports
// ---------------------------------------------------------------------------

export interface PayrollSummaryReport {
    cycleId: string;
    period: string;
    year: number;
    month: string;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    employeeCount: number;
    approvalStatus: string;
    approvedBy?: string;
    approvedAt?: string;
    executedAt?: string;
}

export interface ApprovalTrailReport {
    id: string;
    cycleId: string;
    action: string;
    performedBy: string;
    role: string;
    timestamp: string;
    details: string;
    status: string;
}

export interface BonusAdjustmentReport {
    id: string;
    cycleId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    type: 'Bonus' | 'Fine' | 'Deduction';
    amount: number;
    reason: string;
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    status: string;
}

export interface PayrollVarianceReport {
    employeeId: string;
    employeeName: string;
    department: string;
    previousPeriod: number;
    currentPeriod: number;
    variance: number;
    variancePercent: number;
    /** Severity classification based on variance threshold */
    flag: 'Normal' | 'Significant' | 'Critical';
}

// ---------------------------------------------------------------------------
// HR & Compensation Reports
// ---------------------------------------------------------------------------

export interface SalaryHistoryReport {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    effectiveDate: string;
    previousSalary: number;
    newSalary: number;
    changeAmount: number;
    changePercent: number;
    reason: string;
    approvedBy: string;
    timestamp: string;
}

export interface PromotionHistoryReport {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    previousRole: string;
    newRole: string;
    effectiveDate: string;
    requestedBy: string;
    requestedAt: string;
    approvedBy: string;
    approvedAt: string;
    salaryChange?: number;
}

export interface SalaryStructureChangeReport {
    id: string;
    structureId: string;
    role: string;
    previousMinSalary: number;
    previousMaxSalary: number;
    newMinSalary: number;
    newMaxSalary: number;
    changeDate: string;
    changedBy: string;
    reason: string;
}

export interface EmploymentStatusReport {
    employeeId: string;
    employeeName: string;
    department: string;
    previousStatus: string;
    newStatus: string;
    changeDate: string;
    changedBy: string;
    reason: string;
}

export interface HeadcountAttritionReport {
    period: string;
    department: string;
    startingHeadcount: number;
    newHires: number;
    terminations: number;
    endingHeadcount: number;
    /** Attrition percentage */
    attritionRate: number;
    netChange: number;
}

// ---------------------------------------------------------------------------
// Access & Activity Reports
// ---------------------------------------------------------------------------

export interface UserAccessReport {
    userId: string;
    userName: string;
    email: string;
    role: string;
    department: string;
    status: 'Active' | 'Suspended' | 'Inactive';
    lastLogin?: string;
    moduleAccess: string[];
    createdAt: string;
    lastModified?: string;
}

export interface LoginSessionReport {
    sessionId: string;
    userId: string;
    userName: string;
    role: string;
    loginTime: string;
    logoutTime?: string;
    duration?: string;
    ipAddress?: string;
    sessionStatus: 'Active' | 'Ended' | 'Expired';
}

export interface CriticalActionReport {
    actionId: string;
    actionType: string;
    entityType: string;
    entityId?: string;
    performedBy: string;
    performedByRole: string;
    timestamp: string;
    details: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    metadata?: Record<string, unknown>;
}

export interface ApprovalLogReport {
    id: string;
    /** e.g. 'Payroll', 'Bonus', 'Promotion', 'Leave' */
    approvalType: string;
    entityId: string;
    entityDescription: string;
    requestedBy: string;
    requestedAt: string;
    approvedBy: string;
    approvedAt: string;
    approvalLevel: string;
    status: 'Approved' | 'Rejected' | 'Pending';
    comments?: string;
}

// ---------------------------------------------------------------------------
// Attestation Pack
// ---------------------------------------------------------------------------

export interface AttestationPack {
    id: string;
    generatedAt: string;
    generatedBy: string;
    generatedByRole: string;
    period: {
        start: string;
        end: string;
    };
    includedReports: string[];
    reportCount: number;
    systemDeclaration: string;
    signature?: string;
}

// ---------------------------------------------------------------------------
// Report Filters & Metadata
// ---------------------------------------------------------------------------

export interface ReportFilters {
    startDate?: string;
    endDate?: string;
    cycleId?: string;
    employeeId?: string;
    department?: string;
    reportType?: string;
    status?: string;
}

export interface ReportDefinition {
    id: string;
    name: string;
    category: ReportCategory;
    description: string;
    requiredRoles: string[];
    dataSource: string;
    supportsExport: boolean;
    requiresFilters?: string[];
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export type ExportFormat = 'CSV' | 'PDF' | 'ZIP';

export interface ExportRequest {
    reportType: string;
    format: ExportFormat;
    data: Record<string, unknown>[];
    filename: string;
    attestation?: AttestationPack;
}
