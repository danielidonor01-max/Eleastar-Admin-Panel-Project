// =============================================================================
// ADMIN CONTEXT CONTRACT
// =============================================================================

import type { Employee, ContractInfo, ContractDocument } from './employee';
import type { Job } from './recruitment';
import type { LeaveRequest, Department, Task } from './hr';
import type { ReviewCycle, PerformanceReview } from './performance';
import type { BonusType, BonusRequest, PayrollCycle, LedgerEntry } from './payroll';
import type { PromotionRequest, PromotionEligibilityRule } from './promotion';
import type { AdminRole, ModuleType } from './auth';
import type { AdminNotification, NotificationType, NotificationChannel, EmailLog } from './notifications';
import type { ActivityLog } from './activity';
import type {
    PayrollSummaryReport,
    ApprovalTrailReport,
    BonusAdjustmentReport,
    PayrollVarianceReport,
    SalaryHistoryReport,
    PromotionHistoryReport,
    UserAccessReport,
    CriticalActionReport,
    AttestationPack,
} from './reports';

/** Convenience alias — use PayrollCycle directly if preferred */
export type PayrollCycleType = PayrollCycle;

/**
 * The full shape of the AdminContext value.
 * All state and actions for the admin panel are accessed through this interface.
 */
export interface AdminContextType {
    isLoading: boolean;

    // -----------------------------------------------------------------------
    // Core Data
    // -----------------------------------------------------------------------
    employees: Employee[];
    jobs: Job[];
    activityLogs: ActivityLog[];
    payrollStatus: PayrollCycle;
    ceoSignature: string | null;
    currentTenantId: string;

    // -----------------------------------------------------------------------
    // Auth & Permissions
    // -----------------------------------------------------------------------
    isAuthenticated: boolean;
    currentUserRole: AdminRole;
    currentUserId: string | null;
    rolePermissions: Record<AdminRole, ModuleType[]>;

    login: (email: string, password: string) => Promise<{ role?: AdminRole; requiresOtp?: boolean }>;
    verifyOTP: (email: string, otp: string) => Promise<AdminRole | undefined>;
    logout: () => void;
    generateSystemPassword: () => string;
    switchRole: (role: AdminRole) => void;
    updateRolePermissions: (role: AdminRole, modules: ModuleType[]) => void;

    /** Prompt the user for PIN authorization before executing a sensitive action */
    requestAuth: (level: 'CMS' | 'SENSITIVE', description: string, onConfirm: () => void) => void;

    // -----------------------------------------------------------------------
    // Notifications
    // -----------------------------------------------------------------------
    notifications: AdminNotification[];
    unreadCount: number;
    emailLogs: EmailLog[];

    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
    dispatchNotification: (
        payload: { title: string; message: string; type: NotificationType; link: string },
        target: { userId?: string; roles?: AdminRole[] },
        channels?: NotificationChannel[]
    ) => void;
    sendEmail: (to: string, subject: string, body: string) => void;

    // -----------------------------------------------------------------------
    // Employees
    // -----------------------------------------------------------------------
    addEmployee: (
        employee: Omit<Employee, 'tenantId'> & {
            password?: string;
            password_confirmation?: string;
            role_id?: number;
        }
    ) => Promise<void> | void;
    updateEmployee: (id: string, updates: Partial<Employee>) => void;
    updateUserProfile: (updates: Partial<Employee>) => void;
    deleteEmployee: (id: string) => void;
    updateEmployeeContract: (id: string, contract: Partial<ContractInfo>) => void;
    uploadContractDocument: (id: string, doc: Omit<ContractDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
    updateEmployeeSalary: (empId: string, newSalary: number, reason: string, effectiveDate: string) => void;
    regenerateQR: (ids: string[]) => void;
    toggleQRStatus: (id: string, status: 'active' | 'suspended') => void;

    // -----------------------------------------------------------------------
    // Leave
    // -----------------------------------------------------------------------
    leaveRequests: LeaveRequest[];

    requestLeave: (
        userId: string,
        request: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>
    ) => Promise<void>;
    approveLeave: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    rejectLeave: (requestId: string, reason: string) => Promise<void>;
    refreshLeaveRequests: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Performance Reviews
    // -----------------------------------------------------------------------
    reviewCycles: ReviewCycle[];
    performanceReviews: PerformanceReview[];

    createReviewCycle: (cycle: Omit<ReviewCycle, 'id' | 'tenantId' | 'status'>) => Promise<void>;
    submitSelfReview: (id: string, selfReview: string, rating: number) => Promise<void>;
    updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
    approvePerformanceReview: (id: string, finalData: Partial<PerformanceReview>) => Promise<void>;
    startReviewCycle: (id: string) => Promise<void>;
    requestRevision: (id: string, feedback: string) => Promise<void>;
    refreshReviewCycles: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Payroll
    // -----------------------------------------------------------------------
    updatePayrollStatus: (status: PayrollCycle['status']) => void;
    addPayrollAdjustment: (
        empId: string,
        type: 'Bonus' | 'Fine' | 'Deduction',
        amount: number,
        reason: string
    ) => void;
    bulkPayrollAdjustment: (
        empIds: string[],
        type: 'Bonus' | 'Fine' | 'Deduction',
        amount: number,
        reason: string
    ) => void;
    cooReviewPayroll: () => void;
    cfoApprovePayroll: () => void;
    refreshPayrollStatus: () => Promise<void>;
    refreshPayroll: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Bonuses
    // -----------------------------------------------------------------------
    bonusTypes: BonusType[];
    bonusRequests: BonusRequest[];

    createBonusType: (bonus: Omit<BonusType, 'id' | 'tenantId'>) => Promise<void>;
    updateBonusType: (id: string, updates: Partial<BonusType>) => Promise<void>;
    requestBonus: (employeeId: string, bonusTypeId: string, amount: number, reason: string) => Promise<void>;
    approveBonus: (requestId: string, approvedBy: string) => Promise<void>;
    rejectBonus: (requestId: string, reason: string) => Promise<void>;
    refreshBonuses: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Finance Ledger
    // -----------------------------------------------------------------------
    ledgerEntries: LedgerEntry[];

    approveLedgerFunding: (cycleId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
    executeLedgerBatch: (cycleId: string) => Promise<{ success: boolean; error?: string }>;
    refreshLedgerEntries: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Departments
    // -----------------------------------------------------------------------
    departments: Department[];

    saveDepartment: (dept: Department) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;
    refreshDepartments: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Promotions
    // -----------------------------------------------------------------------
    promotionRequests: PromotionRequest[];
    eligibilityRules: PromotionEligibilityRule[];

    requestPromotion: (req: Omit<PromotionRequest, 'id' | 'tenantId' | 'status' | 'requestedAt'>) => Promise<void>;
    approvePromotion: (requestId: string) => Promise<void>;
    rejectPromotion: (requestId: string, reason: string) => Promise<void>;
    saveEligibilityRule: (rule: PromotionEligibilityRule) => Promise<void>;
    evaluateEligibility: (
        employeeId: string,
        newRole: string
    ) => { isEligible: boolean; reasons: string[]; scores: unknown };
    refreshPromotions: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Recruitment
    // -----------------------------------------------------------------------
    addJob: (job: Omit<Job, 'tenantId'>) => void;
    updateJob: (id: string, updates: Partial<Job>) => void;
    deleteJob: (id: string) => void;
    refreshJobs: () => Promise<void>;

    // -----------------------------------------------------------------------
    // Tasks
    // -----------------------------------------------------------------------
    tasks: Task[];

    createTask: (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
    updateTaskStatus: (taskId: string, status: Task['status']) => void;
    submitTaskEvidence: (taskId: string, notes: string, b64Evidence: string[]) => void;

    // -----------------------------------------------------------------------
    // Compliance Reports
    // -----------------------------------------------------------------------
    generatePayrollSummaryReport: (cycleId?: string) => PayrollSummaryReport[];
    generateApprovalTrailReport: (cycleId: string) => ApprovalTrailReport[];
    generateBonusAdjustmentReport: (cycleId: string) => BonusAdjustmentReport[];
    generatePayrollVarianceReport: (currentCycleId: string, previousCycleId: string) => PayrollVarianceReport[];
    generateSalaryHistoryReport: (employeeId?: string, startDate?: string, endDate?: string) => SalaryHistoryReport[];
    generatePromotionHistoryReport: (startDate?: string, endDate?: string) => PromotionHistoryReport[];
    generateUserAccessReport: () => UserAccessReport[];
    generateCriticalActionReport: (startDate?: string, endDate?: string) => CriticalActionReport[];
    generateAttestationPack: (period: { start: string; end: string }, reportTypes: string[]) => AttestationPack;
    logReportAccess: (reportType: string, filters: unknown) => void;

    // -----------------------------------------------------------------------
    // Audit
    // -----------------------------------------------------------------------
    logAction: (action: string, details?: string, ...args: unknown[]) => void;
    updateCeoSignature: (url: string) => Promise<void>;
}
