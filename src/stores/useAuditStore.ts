import { create } from 'zustand';
import * as reportService from '../services/reportService';
import type { ActivityLog, AdminRole } from '../types';
import type {
    PayrollSummaryReport, ApprovalTrailReport, BonusAdjustmentReport,
    PayrollVarianceReport, SalaryHistoryReport, PromotionHistoryReport,
    UserAccessReport, CriticalActionReport, AttestationPack,
} from '../types/reports';
import { useAuthStore } from './useAuthStore';
import { useEmployeeStore } from './useEmployeeStore';
import { usePayrollStore } from './usePayrollStore';
import { useBonusStore } from './useBonusStore';
import { usePromotionStore } from './usePromotionStore';
import { createPersistedStore } from './middleware';

interface AuditState {
    activityLogs: ActivityLog[];
}

interface AuditActions {
    logAction: (action: string, details?: string) => void;
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
}

export const useAuditStore = create<AuditState & AuditActions>()(
    createPersistedStore('audit', (set, get) => ({
    activityLogs: [],

    logAction: (action, details) => {
        const { currentUserRole } = useAuthStore.getState();
        const newLog: ActivityLog = {
            id: crypto.randomUUID(),
            user: 'Admin User',
            actorName: 'Admin User',
            actorRole: currentUserRole as AdminRole,
            role: currentUserRole as AdminRole,
            action,
            actionType: action,
            details,
            timestamp: new Date().toISOString(),
        };
        set((s) => ({ activityLogs: [newLog, ...s.activityLogs] }));
    },

    logReportAccess: (reportType, filters) => {
        get().logAction('CREATE', `System Accessed ${reportType} report. Filters: ${JSON.stringify(filters)}`);
    },

    generatePayrollSummaryReport(cycleId) {
        get().logReportAccess('Payroll Summary', { cycleId });
        const { employees } = useEmployeeStore.getState();
        const { payrollStatus } = usePayrollStore.getState();
        return reportService.generatePayrollSummaryReport(
            employees,
            payrollStatus,
            cycleId
        ) as PayrollSummaryReport[];
    },

    generateApprovalTrailReport(cycleId) {
        get().logReportAccess('Approval Trail', { cycleId });
        return reportService.generateApprovalTrailReport(get().activityLogs, cycleId) as ApprovalTrailReport[];
    },

    generateBonusAdjustmentReport(cycleId) {
        get().logReportAccess('Bonus Adjustment', { cycleId });
        const { employees } = useEmployeeStore.getState();
        const { payrollStatus } = usePayrollStore.getState();
        const { bonusRequests } = useBonusStore.getState();
        return reportService.generateBonusAdjustmentReport(
            employees,
            payrollStatus,
            bonusRequests,
            cycleId
        ) as BonusAdjustmentReport[];
    },

    generatePayrollVarianceReport(currentCycleId, previousCycleId) {
        get().logReportAccess('Payroll Variance', { currentCycleId, previousCycleId });
        const { employees } = useEmployeeStore.getState();
        const { payrollStatus } = usePayrollStore.getState();
        return reportService.generatePayrollVarianceReport(
            employees,
            payrollStatus,
            { id: previousCycleId, adjustments: [] },
            currentCycleId,
            previousCycleId
        ) as PayrollVarianceReport[];
    },

    generateSalaryHistoryReport(employeeId, startDate, endDate) {
        get().logReportAccess('Salary History', { employeeId, startDate, endDate });
        const { employees } = useEmployeeStore.getState();
        return reportService.generateSalaryHistoryReport(
            employees,
            get().activityLogs,
            employeeId,
            startDate,
            endDate
        ) as SalaryHistoryReport[];
    },

    generatePromotionHistoryReport(startDate, endDate) {
        get().logReportAccess('Promotion History', { startDate, endDate });
        const { employees } = useEmployeeStore.getState();
        const { promotionRequests } = usePromotionStore.getState();
        return reportService.generatePromotionHistoryReport(
            employees,
            promotionRequests,
            startDate,
            endDate
        ) as PromotionHistoryReport[];
    },

    generateUserAccessReport() {
        get().logReportAccess('USER Access', {});
        const { employees } = useEmployeeStore.getState();
        return reportService.generateUserAccessReport(
            employees,
            get().activityLogs
        ) as UserAccessReport[];
    },

    generateCriticalActionReport(startDate, endDate) {
        get().logReportAccess('Critical Action', { startDate, endDate });
        return reportService.generateCriticalActionReport(get().activityLogs, startDate, endDate) as CriticalActionReport[];
    },

    generateAttestationPack(period, reportTypes) {
        get().logReportAccess('Attestation Pack', { period, reportTypes });
        const { currentUserId } = useAuthStore.getState();
        return {
            id: crypto.randomUUID(),
            generatedAt: new Date().toISOString(),
            generatedBy: currentUserId || 'System',
            generatedByRole: 'CHIEF_RISK_OFFICER',
            period,
            includedReports: reportTypes,
            reportCount: reportTypes.length,
            systemDeclaration: 'This attestation pack has been generated by the system and reflects accurate data for the specified period.',
        } as AttestationPack;
    },
})
));
