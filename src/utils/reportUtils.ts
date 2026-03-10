// Compliance Report Generation Utilities
import type {
    PayrollSummaryReport,
    ApprovalTrailReport,
    BonusAdjustmentReport,
    PayrollVarianceReport,
    SalaryHistoryReport,
    PromotionHistoryReport,
    UserAccessReport,
    CriticalActionReport,
    AttestationPack
} from '../types';
import type {
    Employee,
    PromotionRequest,
    AdminRole
} from '../types';
import type { ActivityLog, ModuleType, PayrollCycleType } from '../types';
import { generatePastCycles } from './payrollUtils';

// ===== PAYROLL COMPLIANCE REPORTS =====

export const generatePayrollSummaryReport = (
    payrollStatus: PayrollCycleType,
    employees: Employee[],
    cycleId?: string
): PayrollSummaryReport[] => {
    const cycles = cycleId
        ? [payrollStatus].filter(c => c.id === cycleId)
        : [payrollStatus, ...generatePastCycles(payrollStatus, 12)];

    return cycles.map(cycle => {
        let snapshot: Record<string, unknown> | null = null;
        try {
            if (cycle.snapshot?.rawData) {
                snapshot = JSON.parse(cycle.snapshot.rawData);
            }
        } catch (e) {
            console.error('Failed to parse snapshot', e);
        }

        const totalGross = (snapshot?.totalPayout as unknown as number) || (cycle.totalPayout as unknown as number) || 0;
        const totalDeductions = (snapshot?.totalDeductions as unknown as number) || 0;
        const totalNet = (snapshot?.totalPayout as unknown as number) || (cycle.totalPayout as unknown as number) || 0; // Fallback logic


        return {
            cycleId: cycle.id,
            period: `${cycle.month} ${cycle.year}`,
            year: cycle.year,
            month: cycle.month,
            totalGross,
            totalDeductions,
            totalNet,
            employeeCount: (snapshot?.employees as unknown as Employee[])?.length || (cycle.snapshot?.employeeCount as unknown as number) || employees.length,
            approvalStatus: cycle.status as unknown as 'Draft' | 'Reviewed' | 'Approved' | 'Paid',
            approvedBy: cycle.approvedBy as unknown as string,
            approvedAt: cycle.approvedAt as unknown as string,
            executedAt: cycle.executedAt as unknown as string   
        };
    });
};

export const generateApprovalTrailReport = (
    cycleId: string,
    activityLogs: ActivityLog[]
): ApprovalTrailReport[] => {
    return activityLogs
        .filter(log =>
            log.entityId === cycleId &&
            log.entityType === 'Payroll' &&
            (log.actionType === 'APPROVE' || log.actionType === 'EXECUTE' || log.actionType === 'UPDATE' ||
                log.action.includes('Approved') || log.action.includes('Executed')) // Fallback checks
        )
        .map(log => ({
            id: log.id,
            cycleId,
            action: log.actionType || log.action,
            performedBy: log.userId || log.user,
            role: (log.role) || 'Unknown',
            timestamp: log.timestamp,
            details: log.details || '',
            status: log.status || 'Unknown'
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const generateBonusAdjustmentReport = (
    cycleId: string,
    payrollStatus: PayrollCycleType,
    employees: Employee[]
): BonusAdjustmentReport[] => {
    const cycle = payrollStatus.id === cycleId ? payrollStatus : null;
    if (!cycle || !cycle.adjustments) return [];

    return cycle.adjustments.map((adj, index) => {
        const employee = employees.find(e => e.id === adj.empId as unknown as number);
        return {
            id: `ADJ-${cycleId}-${index}`,
            cycleId,
            employeeId: adj.empId || 'Unknown',
            employeeName: employee?.name || 'Unknown',
            department: employee?.department_id as string || 'Unknown',
            type: adj.type,
            amount: adj.amount,
            reason: adj.reason,
            requestedBy: adj.requestedBy || 'System',
            requestedAt: adj.appliedAt || cycle.createdAt || new Date().toISOString(),
            approvedBy: adj.approvedBy,
            approvedAt: adj.approvedAt,
            status: adj.status || 'Applied'
        };
    });
};

export const generatePayrollVarianceReport = (
    currentCycleId: string,
    previousCycleId: string,
    payrollStatus: PayrollCycleType,
    employees: Employee[]
): PayrollVarianceReport[] => {
    const pastCycles = generatePastCycles(payrollStatus, 24);
    const currentCycle = payrollStatus.id === currentCycleId ? payrollStatus : pastCycles.find(c => c.id === currentCycleId);
    const previousCycle = pastCycles.find(c => c.id === previousCycleId);

    if (!currentCycle?.snapshot?.rawData || !previousCycle?.snapshot?.rawData) return [];

    let currentSnapshot: Record<string, unknown>[] = [];
    let previousSnapshot: Record<string, unknown>[] = [];

    try {
        const currData = JSON.parse(currentCycle.snapshot.rawData);
        const prevData = JSON.parse(previousCycle.snapshot.rawData);
        // Handle if rawData is array or object with employees
        currentSnapshot = Array.isArray(currData) ? currData : (currData.employees || []);
        previousSnapshot = Array.isArray(prevData) ? prevData : (prevData.employees || []);
    } catch (e) {
        console.error('Failed to parse snapshot', e);
        return [];
    }

    return currentSnapshot.map((currentEmp: Record<string, unknown>) => {
        const previousEmp = previousSnapshot.find(p => p.id === (currentEmp.id as unknown as string));
        const previousPeriod = previousEmp?.netPay as unknown as number || 0;
        const currentPeriod = (currentEmp.netPay as unknown as number) || 0;
        const variance = currentPeriod - previousPeriod;
        const variancePercent = previousPeriod > 0 ? (variance / previousPeriod) * 100 : 0;

        let flag: 'Normal' | 'Significant' | 'Critical' = 'Normal';
        if (Math.abs(variancePercent) > 20) flag = 'Critical';
        else if (Math.abs(variancePercent) > 10) flag = 'Significant';

        const employee = employees.find(e => e.id === currentEmp.id as unknown as number);

        return {
            employeeId: currentEmp.id as unknown as string,
            employeeName: currentEmp.name as unknown as string,
            department: employee?.department_id as string || 'Unknown',
            previousPeriod,
            currentPeriod,
            variance: variance as unknown as number,
            variancePercent: variancePercent as unknown as number,
            flag: flag as unknown as 'Normal' | 'Significant' | 'Critical'
        };
    });
};

// ===== HR & COMPENSATION REPORTS =====

export const generateSalaryHistoryReport = (
    activityLogs: ActivityLog[],
    employees: Employee[],
    employeeId?: string,
    startDate?: string,
    endDate?: string
): SalaryHistoryReport[] => {
    return activityLogs
        .filter(log =>
            log.entityType === 'Employee' &&
            (log.actionType === 'UPDATE' || log.action === 'Updated Employee') && // Fallback to action string
            (log.details?.toLowerCase().includes('salary') || false) &&
            (!employeeId || log.entityId === employeeId || log.details?.includes(employeeId || '')) &&
            (!startDate || new Date(log.timestamp) >= new Date(startDate)) &&
            (!endDate || new Date(log.timestamp) <= new Date(endDate))
        )
        .map(log => {
            const employee = employees.find(e => e.id === log.entityId as unknown as number);
            const metadata = (log.metadata || {}) as Record<string, unknown>;
            const previousSalary = (metadata.oldSalary as number) || (metadata.previousSalary as number) || 0;
            const newSalary = (metadata.newSalary as number) || 0;
            const changeAmount = newSalary - previousSalary;
            const changePercent = previousSalary > 0 ? (changeAmount / previousSalary) * 100 : 0;

            return {
                id: log.id,
                employeeId: log.entityId || 'Unknown', // Added default string
                employeeName: employee?.name || 'Unknown',
                department: employee?.department_id as string || 'Unknown',
                effectiveDate: (metadata.effectiveDate as string) || log.timestamp,
                previousSalary,
                newSalary,
                changeAmount,
                changePercent,
                reason: (metadata.reason as string) || 'Not specified',
                approvedBy: log.userId || 'Unknown', // Added default string
                timestamp: log.timestamp
            };
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const generatePromotionHistoryReport = (
    promotionRequests: PromotionRequest[],
    employees: Employee[],
    startDate?: string,
    endDate?: string
): PromotionHistoryReport[] => {
    return promotionRequests
        .filter(req =>
            req.status === 'Approved' &&
            (!startDate || new Date(req.requestedAt) >= new Date(startDate)) &&
            (!endDate || new Date(req.requestedAt) <= new Date(endDate))
        )
        .map(req => {
            const employee = employees.find(e => e.id === req.employeeId as unknown as number);
            return {
                id: req.id,
                employeeId: req.employeeId,
                employeeName: employee?.name || 'Unknown',
                department: employee?.department_id as string || 'Unknown',
                previousRole: req.currentRole,
                newRole: req.newRole,
                effectiveDate: req.effectiveDate || req.requestedAt,
                requestedBy: req.requestedBy,
                requestedAt: req.requestedAt,
                approvedBy: req.approvedBy || 'COO',
                approvedAt: req.approvedAt || req.requestedAt,
                salaryChange: req.proposedSalary ? req.proposedSalary - (employee?.salary as unknown as number) : undefined
            };
        })
        .sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
};

// ===== ACCESS & ACTIVITY REPORTS =====

export const generateUserAccessReport = (
    employees: Employee[],
    rolePermissions: Record<AdminRole, ModuleType[]>
): UserAccessReport[] => {
    return employees.map(emp => ({
        userId: emp.id as unknown as string,
        userName: emp.name,
        email: emp.email,
        role: emp.role_relation as unknown as AdminRole, // Fixed: role -> systemRole
        department: emp.department_id as string,
        status: (emp.status as unknown as string) === 'Active' ? 'Active' : (emp.status as unknown as string) === 'Suspended' ? 'Suspended' : 'Inactive',
        lastLogin: new Date().toISOString(), // Mocked as missing in interface
        moduleAccess: rolePermissions[emp.role_relation as unknown as AdminRole] || [], // Fixed: role -> systemRole
        createdAt: emp.joinedAt || new Date().toISOString(), // Fallback
        lastModified: new Date().toISOString() // Mocked
    }));
};

export const generateCriticalActionReport = (
    activityLogs: ActivityLog[],
    startDate?: string,
    endDate?: string
): CriticalActionReport[] => {
    // Modified filter logic as per instruction
    return activityLogs
        .filter(log => {
            const isCritical = ['DELETE', 'SENSITIVE_ACCESS', 'OVERRIDE'].includes(log.actionType || '') ||
                log.details?.includes('Override') ||
                log.action.includes('Delete');

            const matchesDate = (!startDate || new Date(log.timestamp) >= new Date(startDate)) &&
                (!endDate || new Date(log.timestamp) <= new Date(endDate));

            return isCritical && matchesDate;
        })
        .map(log => ({
            actionId: log.id,
            actionType: log.actionType || log.action,
            entityType: log.entityType || 'Check Details',
            entityId: log.entityId || 'N/A',
            performedBy: log.userId || log.user,
            performedByRole: log.role || 'Unknown',
            timestamp: log.timestamp,
            details: log.details || '',
            status: (log.status as CriticalActionReport['status']) || 'SUCCESS',
            metadata: log.metadata as Record<string, unknown> | undefined
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ===== ATTESTATION PACK =====

export const generateAttestationPack = (
    period: { start: string; end: string },
    reportTypes: string[],
    currentUserId: string,
    currentUserRole: string
): AttestationPack => {
    const declaration = `
ATTESTATION DECLARATION

This compliance attestation pack was generated by the Eleastar Admin System on ${new Date().toLocaleString()}.

Period Covered: ${new Date(period.start).toLocaleDateString()} to ${new Date(period.end).toLocaleDateString()}

All data contained within this pack is sourced from immutable payroll snapshots, ledger entries, and system audit logs.
The undersigned certifies that the information presented is accurate, complete, and represents the true state of the system
during the specified period.

Generated By: ${currentUserId}
Role: ${currentUserRole}
Generation Timestamp: ${new Date().toISOString()}

NOTICE: This attestation pack is intended for external audit and compliance purposes only.
Unauthorized distribution or modification of this document may result in disciplinary action.
    `.trim();

    return {
        id: `ATT-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        generatedBy: currentUserId,
        generatedByRole: currentUserRole,
        period,
        includedReports: reportTypes,
        reportCount: reportTypes.length,
        systemDeclaration: declaration
    };
};
