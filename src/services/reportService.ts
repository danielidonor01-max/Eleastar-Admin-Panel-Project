// @ts-nocheck
import type {
    Employee,
    PayrollCycle,
    BonusRequest,
    PromotionRequest,
    PromotionHistoryEntry
} from '@/types';
import type { ActivityLog } from '../types';
import type {
    PayrollSummaryReport,
    ApprovalTrailReport,
    BonusAdjustmentReport,
    PayrollVarianceReport,
    SalaryHistoryReport,
    PromotionHistoryReport,
    UserAccessReport,
    CriticalActionReport
} from '../data/reportTypes';

/**
 * Generate Payroll Summary Report
 * Lists all employees with their salary, bonuses, deductions for a given cycle
 */
export function generatePayrollSummaryReport(
    employees: Employee[],
    payrollCycle: PayrollCycle,
    cycleId?: string
): PayrollSummaryReport[] {
    const targetCycle = cycleId || payrollCycle.id;

    return employees.map(emp => {
        // Find adjustments for this employee in this cycle
        const adjustments = payrollCycle.adjustments?.filter(adj => adj.empId === emp.id) || [];
        const bonuses = adjustments.filter(adj => adj.type === 'Bonus').reduce((sum, adj) => sum + adj.amount, 0);
        const deductions = adjustments.filter(adj => adj.type === 'Deduction' || adj.type === 'Fine').reduce((sum, adj) => sum + adj.amount, 0);

        const grossPay = emp.salary + bonuses;
        const netPay = grossPay - deductions;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            baseSalary: emp.salary,
            bonuses,
            deductions,
            grossPay,
            netPay,
            paymentStatus: payrollCycle.status === 'Paid' ? 'Paid' : 'Pending',
            cycleId: targetCycle,
            period: `${payrollCycle.month} ${payrollCycle.year}`
        };
    });
}

/**
 * Generate Approval Trail Report
 * Shows all approval actions in the payroll cycle
 */
export function generateApprovalTrailReport(
    activityLogs: ActivityLog[],
    cycleId: string
): ApprovalTrailReport[] {
    return activityLogs
        .filter(log =>
            log.actionType === 'APPROVE' &&
            log.entityType === 'Payroll' &&
            log.entityId === cycleId
        )
        .map(log => ({
            actionId: log.id,
            actionType: log.actionType,
            performedBy: log.actorName,
            performedByRole: log.actorRole,
            timestamp: log.timestamp,
            details: log.details,
            status: log.status,
            entityId: log.entityId || cycleId,
            metadata: log.metadata
        }));
}

/**
 * Generate Bonus Adjustment Report
 * Lists all bonus adjustments in a payroll cycle
 */
export function generateBonusAdjustmentReport(
    employees: Employee[],
    payrollCycle: PayrollCycle,
    bonusRequests: BonusRequest[],
    cycleId: string
): BonusAdjustmentReport[] {
    const adjustments = payrollCycle.adjustments?.filter(adj => adj.type === 'Bonus') || [];

    return adjustments.map(adj => {
        const employee = employees.find(e => e.id === adj.empId);
        const bonusRequest = bonusRequests.find(br =>
            br.employeeId === adj.empId &&
            br.status === 'Approved'
        );

        return {
            employeeId: adj.empId,
            employeeName: employee?.name || 'Unknown',
            bonusType: bonusRequest?.bonusTypeId || 'Manual Adjustment',
            amount: adj.amount,
            reason: adj.reason,
            approvedBy: bonusRequest?.approvedBy || 'System',
            approvedAt: bonusRequest?.approvedAt || new Date().toISOString(),
            cycleId
        };
    });
}

/**
 * Generate Payroll Variance Report
 * Compares two payroll cycles to show changes
 */
export function generatePayrollVarianceReport(
    employees: Employee[],
    currentCycle: PayrollCycle,
    previousCycleData: { id: string; adjustments: any[] },
    currentCycleId: string,
    previousCycleId: string
): PayrollVarianceReport[] {
    return employees.map(emp => {
        const currentAdj = currentCycle.adjustments?.filter(adj => adj.empId === emp.id) || [];
        const previousAdj = previousCycleData.adjustments?.filter(adj => adj.empId === emp.id) || [];

        const currentBonuses = currentAdj.filter(a => a.type === 'Bonus').reduce((sum, a) => sum + a.amount, 0);
        const previousBonuses = previousAdj.filter(a => a.type === 'Bonus').reduce((sum, a) => sum + a.amount, 0);

        const currentDeductions = currentAdj.filter(a => a.type === 'Deduction' || a.type === 'Fine').reduce((sum, a) => sum + a.amount, 0);
        const previousDeductions = previousAdj.filter(a => a.type === 'Deduction' || a.type === 'Fine').reduce((sum, a) => sum + a.amount, 0);

        const currentNet = emp.salary + currentBonuses - currentDeductions;
        const previousNet = emp.salary + previousBonuses - previousDeductions;

        return {
            employeeId: emp.id,
            employeeName: emp.name,
            currentPeriod: `${currentCycle.month} ${currentCycle.year}`,
            previousPeriod: previousCycleId,
            currentAmount: currentNet,
            previousAmount: previousNet,
            variance: currentNet - previousNet,
            variancePercentage: previousNet > 0 ? ((currentNet - previousNet) / previousNet) * 100 : 0,
            reason: currentNet !== previousNet ? 'Adjustment applied' : 'No change'
        };
    });
}

/**
 * Generate Salary History Report
 * Shows salary changes over time for employees
 */
export function generateSalaryHistoryReport(
    employees: Employee[],
    activityLogs: ActivityLog[],
    employeeId?: string,
    startDate?: string,
    endDate?: string
): SalaryHistoryReport[] {
    const targetEmployees = employeeId ? employees.filter(e => e.id === employeeId) : employees;
    const results: SalaryHistoryReport[] = [];

    targetEmployees.forEach(emp => {
        // Get salary change logs
        const salaryLogs = activityLogs.filter(log =>
            log.entityType === 'Employee' &&
            log.entityId === emp.id &&
            log.details.toLowerCase().includes('salary')
        );

        // Filter by date if provided
        const filteredLogs = salaryLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            if (startDate && logDate < new Date(startDate)) return false;
            if (endDate && logDate > new Date(endDate)) return false;
            return true;
        });

        // Add current salary as baseline
        results.push({
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            effectiveDate: emp.joinedAt || new Date().toISOString(),
            previousSalary: 0,
            newSalary: emp.salary,
            changeAmount: emp.salary,
            changePercentage: 0,
            reason: 'Initial salary',
            approvedBy: 'HR Admin'
        });

        // Add historical changes if any logs exist
        filteredLogs.forEach(log => {
            results.push({
                employeeId: emp.id,
                employeeName: emp.name,
                department: emp.department,
                effectiveDate: log.timestamp,
                previousSalary: emp.salary,
                newSalary: emp.salary,
                changeAmount: 0,
                changePercentage: 0,
                reason: log.details,
                approvedBy: log.actorName
            });
        });
    });

    return results.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
}

/**
 * Generate Promotion History Report
 * Lists all promotions within a date range
 */
export function generatePromotionHistoryReport(
    employees: Employee[],
    promotionRequests: PromotionRequest[],
    startDate?: string,
    endDate?: string
): PromotionHistoryReport[] {
    const results: PromotionHistoryReport[] = [];

    employees.forEach(emp => {
        const promotions = emp.promotionHistory || [];

        promotions.forEach(promo => {
            const promoDate = new Date(promo.date);
            if (startDate && promoDate < new Date(startDate)) return;
            if (endDate && promoDate > new Date(endDate)) return;

            results.push({
                employeeId: emp.id,
                employeeName: emp.name,
                promotionDate: promo.date,
                fromRole: promo.oldRole,
                toRole: promo.newRole,
                salaryIncrease: 0, // Can be calculated if previous salary is tracked
                reason: promo.reason,
                approvedBy: promo.approvedBy
            });
        });
    });

    return results.sort((a, b) => new Date(b.promotionDate).getTime() - new Date(a.promotionDate).getTime());
}

/**
 * Generate User Access Report
 * Lists user access and activity
 */
export function generateUserAccessReport(
    employees: Employee[],
    activityLogs: ActivityLog[]
): UserAccessReport[] {
    return employees.map(emp => {
        const userLogs = activityLogs.filter(log => log.actorId === emp.id);
        const loginLogs = userLogs.filter(log => log.actionType === 'LOGIN');

        return {
            userId: emp.id,
            userName: emp.name,
            role: emp.systemRole || 'User',
            lastLogin: loginLogs.length > 0 ? loginLogs[0].timestamp : 'Never',
            loginCount: loginLogs.length,
            activityCount: userLogs.length,
            status: emp.status === 'active' ? 'Active' : 'Inactive',
            accountCreated: emp.joinedAt
        };
    });
}

/**
 * Generate Critical Action Report
 * Lists high-risk actions within a date range
 */
export function generateCriticalActionReport(
    activityLogs: ActivityLog[],
    startDate?: string,
    endDate?: string
): CriticalActionReport[] {
    const criticalActions = ['APPROVE', 'DELETE', 'SECURITY'];

    return activityLogs
        .filter(log => {
            if (!criticalActions.includes(log.actionType)) return false;

            const logDate = new Date(log.timestamp);
            if (startDate && logDate < new Date(startDate)) return false;
            if (endDate && logDate > new Date(endDate)) return false;

            return true;
        })
        .map(log => ({
            actionId: log.id,
            actionType: log.actionType,
            performedBy: log.actorName,
            performedByRole: log.actorRole,
            entityType: log.entityType,
            entityId: log.entityId || 'N/A',
            timestamp: log.timestamp,
            details: log.details,
            status: log.status,
            riskLevel: log.actionType === 'DELETE' ? 'High' : log.actionType === 'SECURITY' ? 'Critical' : 'Medium'
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
