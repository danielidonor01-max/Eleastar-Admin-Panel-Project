import * as reportService from '../../../services/reportService';
import type { AdminDeps } from '../deps';
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
} from '../../../types/reports';

export interface ReportActions {
    generatePayrollSummaryReport: (cycleId?: string) => PayrollSummaryReport[];
    generateApprovalTrailReport: (cycleId: string) => ApprovalTrailReport[];
    generateBonusAdjustmentReport: (cycleId: string) => BonusAdjustmentReport[];
    generatePayrollVarianceReport: (currentCycleId: string, previousCycleId: string) => PayrollVarianceReport[];
    generateSalaryHistoryReport: (
        employeeId?: string,
        startDate?: string,
        endDate?: string
    ) => SalaryHistoryReport[];
    generatePromotionHistoryReport: (startDate?: string, endDate?: string) => PromotionHistoryReport[];
    generateUserAccessReport: () => UserAccessReport[];
    generateCriticalActionReport: (startDate?: string, endDate?: string) => CriticalActionReport[];
    generateAttestationPack: (
        period: { start: string; end: string },
        reportTypes: string[]
    ) => AttestationPack;
    logReportAccess: (reportType: string, filters: unknown) => void;
}

export function createReportActions(deps: AdminDeps): ReportActions {
    const {
        employees,
        payrollStatus,
        activityLogs,
        bonusRequests,
        promotionRequests,
        currentUserId,
        logAction
    } = deps;

    const logReportAccess = (reportType: string, filters: unknown) => {
        logAction(
            'CREATE',
            `System Accessed ${reportType} report. Status: SUCCESS. Ref: report-${reportType}. Filters: ${JSON.stringify(filters)}`
        );
    };

    return {
        generatePayrollSummaryReport(cycleId?: string) {
            logReportAccess('Payroll Summary', { cycleId });
            return reportService.generatePayrollSummaryReport(
                employees,
                payrollStatus,
                cycleId
            ) as PayrollSummaryReport[];
        },
        generateApprovalTrailReport(cycleId: string) {
            logReportAccess('Approval Trail', { cycleId });
            return reportService.generateApprovalTrailReport(activityLogs, cycleId) as ApprovalTrailReport[];
        },
        generateBonusAdjustmentReport(cycleId: string) {
            logReportAccess('Bonus Adjustment', { cycleId });
            return reportService.generateBonusAdjustmentReport(
                employees,
                payrollStatus,
                bonusRequests || [],
                cycleId
            ) as BonusAdjustmentReport[];
        },
        generatePayrollVarianceReport(currentCycleId: string, previousCycleId: string) {
            logReportAccess('Payroll Variance', { currentCycleId, previousCycleId });
            const previousCycleData = { id: previousCycleId, adjustments: [] };
            return reportService.generatePayrollVarianceReport(
                employees,
                payrollStatus,
                previousCycleData,
                currentCycleId,
                previousCycleId
            ) as PayrollVarianceReport[];
        },
        generateSalaryHistoryReport(
            employeeId?: string,
            startDate?: string,
            endDate?: string
        ) {
            logReportAccess('Salary History', { employeeId, startDate, endDate });
            return reportService.generateSalaryHistoryReport(
                employees,
                activityLogs,
                employeeId,
                startDate,
                endDate
            ) as SalaryHistoryReport[];
        },
        generatePromotionHistoryReport(startDate?: string, endDate?: string) {
            logReportAccess('Promotion History', { startDate, endDate });
            return reportService.generatePromotionHistoryReport(
                employees,
                promotionRequests || [],
                startDate,
                endDate
            ) as PromotionHistoryReport[];
        },
        generateUserAccessReport() {
            logReportAccess('USER Access', {});
            return reportService.generateUserAccessReport(employees, activityLogs) as UserAccessReport[];
        },
        generateCriticalActionReport(startDate?: string, endDate?: string) {
            logReportAccess('Critical Action', { startDate, endDate });
            return reportService.generateCriticalActionReport(
                activityLogs,
                startDate,
                endDate
            ) as CriticalActionReport[];
        },
        generateAttestationPack(
            period: { start: string; end: string },
            reportTypes: string[]
        ): AttestationPack {
            logReportAccess('Attestation Pack', { period, reportTypes });
            return {
                id: `ATT-${Date.now()}`,
                generatedAt: new Date().toISOString(),
                generatedBy: currentUserId || 'System',
                generatedByRole: 'CHIEF_RISK_OFFICER',
                period,
                includedReports: reportTypes,
                reportCount: reportTypes.length,
                systemDeclaration: 'This attestation pack has been generated by the system and reflects accurate data for the specified period.',
            };
        },
        logReportAccess
    };
}
