import type { RoleWidgetMapping, DashboardTab } from '../types';

export const roleWidgetConfig: RoleWidgetMapping = {
    SUPER_ADMIN: [
        'saSystemStatus', 'saActiveAdmins', 'saPendingGlobal', 'saCriticalAlerts',
        'saAuditTimeline', 'saApprovalBottlenecks', 'saLoginAnomalies', 'saRecentAdminActions'
    ],
    COO: [
        'cooTotalEmployees', 'cooPayrollCost', 'cooPendingApprovals', 'cooRiskAlerts',
        'cooHrHealth', 'cooFinanceSnapshot', 'cooRiskSummary'
    ],
    HR_ADMIN: [
        'hrTotalEmployees', 'hrNewHires', 'hrPendingLeave', 'hrPendingReviews',
        'hrGrowthTrend', 'hrLeaveUtil', 'hrReviewStatus', 'hrLeaveQueue'
    ],
    FINANCE_ADMIN: [
        'finPayrollCycles', 'finTotalSalary', 'finPendingPayroll', 'finSalaryChanges',
        'finCostTrend', 'finCostDist', 'finSalaryFeed', 'finApprovalQueue'
    ],
    PAYROLL_ADMIN: [
        'payRunStatus', 'payPaid', 'payPending', 'payErrors',
        'payRunHistory', 'payFailureList', 'payNextCountdown'
    ],
    CHIEF_RISK_OFFICER: [
        'riskAuditEvents', 'riskRoleChanges', 'riskSuspended', 'riskLoginAnomalies',
        'riskAuditChart', 'riskHighRiskFeed', 'riskAccessChart', 'riskComplianceQueue'
    ]
};

export const superAdminTabs: DashboardTab[] = [
    { id: 'overview', label: 'Overview', roleContext: 'SUPER_ADMIN' },
    { id: 'hr', label: 'HR View', roleContext: 'HR_ADMIN' },
    { id: 'finance', label: 'Finance View', roleContext: 'FINANCE_ADMIN' },
    { id: 'payroll', label: 'Payroll View', roleContext: 'PAYROLL_ADMIN' },
    { id: 'risk', label: 'Risk View', roleContext: 'CHIEF_RISK_OFFICER' },
    { id: 'coo', label: 'COO View', roleContext: 'COO' },
];
