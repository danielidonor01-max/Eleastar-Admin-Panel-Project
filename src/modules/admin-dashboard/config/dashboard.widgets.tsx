
import type { DashboardWidgetConfig } from '../types';
import { MetricCard } from '../widgets/MetricCard';
import { StatusCard } from '../widgets/StatusCard';
import { AlertCard } from '../widgets/AlertCard';
import { ChartPlaceholder } from '../widgets/ChartPlaceholder';
import { ActivityFeed } from '../widgets/ActivityFeed';
import { QueueTable } from '../widgets/QueueTable';

const mockActivity = [
    { id: '1', action: 'Login Anomaly', user: 'Unknown IP', time: '10m ago', details: 'Failed attempt' },
    { id: '2', action: 'Role Changed', user: 'stephen@eleastar.com', time: '1h ago', details: 'Granted ADMIN' },
];

const mockQueue = [
    { id: '1', title: 'Leave Request', subtitle: 'John Doe - Annual', status: 'Pending' },
    { id: '2', title: 'Salary Advance', subtitle: 'Jane Smith', status: 'Pending' },
];

export const widgets: Record<string, DashboardWidgetConfig> = {
    // SUPER_ADMIN
    saSystemStatus: { id: 'saSystemStatus', title: 'System Status', type: 'card', level: 'summary', supportedRoles: ['SUPER_ADMIN'], component: () => <StatusCard title="System Status" status="Healthy" subtitle="All services online" statusColor="emerald" /> },
    saActiveAdmins: { id: 'saActiveAdmins', title: 'Active Admins Today', type: 'card', level: 'summary', supportedRoles: ['SUPER_ADMIN'], component: () => <MetricCard title="Active Admins Today" value="5" trend="Normal" trendUp={true} /> },
    saPendingGlobal: { id: 'saPendingGlobal', title: 'Pending Actions (Global)', type: 'card', level: 'summary', supportedRoles: ['SUPER_ADMIN'], component: () => <MetricCard title="Pending Actions (Global)" value="12" /> },
    saCriticalAlerts: { id: 'saCriticalAlerts', title: 'Critical Alerts', type: 'card', level: 'summary', supportedRoles: ['SUPER_ADMIN'], component: () => <AlertCard title="Critical Alerts" count={0} description="No active alerts" alertType="warning" /> },
    saAuditTimeline: { id: 'saAuditTimeline', title: 'Audit Activity Timeline', type: 'widget', level: 'detailed', supportedRoles: ['SUPER_ADMIN'], component: () => <ActivityFeed title="Audit Activity Timeline" items={mockActivity} /> },
    saApprovalBottlenecks: { id: 'saApprovalBottlenecks', title: 'Approval Bottlenecks', type: 'widget', level: 'detailed', supportedRoles: ['SUPER_ADMIN'], component: () => <ChartPlaceholder title="Approval Bottlenecks (HR / Finance)" /> },
    saLoginAnomalies: { id: 'saLoginAnomalies', title: 'Login & Access Anomalies', type: 'widget', level: 'detailed', supportedRoles: ['SUPER_ADMIN'], component: () => <ChartPlaceholder title="Login Anomalies Trend" /> },
    saRecentAdminActions: { id: 'saRecentAdminActions', title: 'Recent Admin Actions Feed', type: 'widget', level: 'detailed', supportedRoles: ['SUPER_ADMIN'], component: () => <ActivityFeed title="Recent Admin Actions" items={mockActivity} /> },

    // COO
    cooTotalEmployees: { id: 'cooTotalEmployees', title: 'Total Employees', type: 'card', level: 'summary', supportedRoles: ['COO'], component: () => <MetricCard title="Total Employees" value="142" /> },
    cooPayrollCost: { id: 'cooPayrollCost', title: 'Payroll Cost (Month)', type: 'card', level: 'summary', supportedRoles: ['COO'], component: () => <MetricCard title="Payroll Cost (Month)" value="₦45.2M" /> },
    cooPendingApprovals: { id: 'cooPendingApprovals', title: 'Pending Approvals (All)', type: 'card', level: 'summary', supportedRoles: ['COO'], component: () => <MetricCard title="Pending Approvals" value="8" /> },
    cooRiskAlerts: { id: 'cooRiskAlerts', title: 'Risk Alerts', type: 'card', level: 'summary', supportedRoles: ['COO'], component: () => <AlertCard title="Risk Alerts" count={2} description="Requires review" alertType="warning" /> },
    cooHrHealth: { id: 'cooHrHealth', title: 'HR Health Summary', type: 'widget', level: 'detailed', supportedRoles: ['COO'], component: () => <ChartPlaceholder title="HR Health (Attrition vs Growth)" /> },
    cooFinanceSnapshot: { id: 'cooFinanceSnapshot', title: 'Finance Snapshot', type: 'widget', level: 'detailed', supportedRoles: ['COO'], component: () => <ChartPlaceholder title="Finance Snapshot" /> },
    cooRiskSummary: { id: 'cooRiskSummary', title: 'Risk Summary', type: 'widget', level: 'detailed', supportedRoles: ['COO'], component: () => <ChartPlaceholder title="Risk Summary" /> },

    // HR_ADMIN
    hrTotalEmployees: { id: 'hrTotalEmployees', title: 'Total Employees', type: 'card', level: 'summary', supportedRoles: ['HR_ADMIN'], component: () => <MetricCard title="Total Employees" value="142" trend="+3 this month" trendUp={true} /> },
    hrNewHires: { id: 'hrNewHires', title: 'New Hires (30 days)', type: 'card', level: 'summary', supportedRoles: ['HR_ADMIN'], component: () => <MetricCard title="New Hires" value="4" /> },
    hrPendingLeave: { id: 'hrPendingLeave', title: 'Pending Leave Requests', type: 'card', level: 'summary', supportedRoles: ['HR_ADMIN'], component: () => <MetricCard title="Pending Leave" value="5" /> },
    hrPendingReviews: { id: 'hrPendingReviews', title: 'Pending Performance Reviews', type: 'card', level: 'summary', supportedRoles: ['HR_ADMIN'], component: () => <MetricCard title="Pending Reviews" value="12" /> },
    hrGrowthTrend: { id: 'hrGrowthTrend', title: 'Employee Growth Trend', type: 'widget', level: 'detailed', supportedRoles: ['HR_ADMIN'], component: () => <ChartPlaceholder title="Employee Growth (12 Months)" /> },
    hrLeaveUtil: { id: 'hrLeaveUtil', title: 'Leave Utilization Chart', type: 'widget', level: 'detailed', supportedRoles: ['HR_ADMIN'], component: () => <ChartPlaceholder title="Leave Utilization by Dept" /> },
    hrReviewStatus: { id: 'hrReviewStatus', title: 'Performance Review Status', type: 'widget', level: 'detailed', supportedRoles: ['HR_ADMIN'], component: () => <ChartPlaceholder title="Review Completion Status" /> },
    hrLeaveQueue: { id: 'hrLeaveQueue', title: 'Leave Approval Queue', type: 'widget', level: 'detailed', supportedRoles: ['HR_ADMIN'], component: () => <QueueTable title="Leave Approval Queue" items={mockQueue} /> },

    // FINANCE_ADMIN
    finPayrollCycles: { id: 'finPayrollCycles', title: 'Payroll Cycles (Month)', type: 'card', level: 'summary', supportedRoles: ['FINANCE_ADMIN'], component: () => <StatusCard title="Payroll Cycles" status="Draft" subtitle="Feb 2026" statusColor="orange" /> },
    finTotalSalary: { id: 'finTotalSalary', title: 'Total Salary Cost', type: 'card', level: 'summary', supportedRoles: ['FINANCE_ADMIN'], component: () => <MetricCard title="Total Salary Cost" value="₦45.2M" /> },
    finPendingPayroll: { id: 'finPendingPayroll', title: 'Pending Payroll Approvals', type: 'card', level: 'summary', supportedRoles: ['FINANCE_ADMIN'], component: () => <MetricCard title="Pending Payroll Approvals" value="1" /> },
    finSalaryChanges: { id: 'finSalaryChanges', title: 'Salary Changes (30 days)', type: 'card', level: 'summary', supportedRoles: ['FINANCE_ADMIN'], component: () => <MetricCard title="Salary Changes" value="3" /> },
    finCostTrend: { id: 'finCostTrend', title: 'Payroll Cost Trend', type: 'widget', level: 'detailed', supportedRoles: ['FINANCE_ADMIN'], component: () => <ChartPlaceholder title="Cost Trend (6 Months)" /> },
    finCostDist: { id: 'finCostDist', title: 'Department Cost Distribution', type: 'widget', level: 'detailed', supportedRoles: ['FINANCE_ADMIN'], component: () => <ChartPlaceholder title="Cost by Department" /> },
    finSalaryFeed: { id: 'finSalaryFeed', title: 'Salary Change Activity Feed', type: 'widget', level: 'detailed', supportedRoles: ['FINANCE_ADMIN'], component: () => <ActivityFeed title="Salary Changes" items={mockActivity} /> },
    finApprovalQueue: { id: 'finApprovalQueue', title: 'Payroll Approval Queue', type: 'widget', level: 'detailed', supportedRoles: ['FINANCE_ADMIN'], component: () => <QueueTable title="Payroll Approvals" items={mockQueue} /> },

    // PAYROLL_ADMIN
    payRunStatus: { id: 'payRunStatus', title: 'Current Payroll Status', type: 'card', level: 'summary', supportedRoles: ['PAYROLL_ADMIN'], component: () => <StatusCard title="Process Status" status="Processing" subtitle="Batch 2 of 4" statusColor="brand" /> },
    payPaid: { id: 'payPaid', title: 'Employees Paid', type: 'card', level: 'summary', supportedRoles: ['PAYROLL_ADMIN'], component: () => <MetricCard title="Employees Paid" value="120" /> },
    payPending: { id: 'payPending', title: 'Employees Pending', type: 'card', level: 'summary', supportedRoles: ['PAYROLL_ADMIN'], component: () => <MetricCard title="Employees Pending" value="22" /> },
    payErrors: { id: 'payErrors', title: 'Payroll Errors', type: 'card', level: 'summary', supportedRoles: ['PAYROLL_ADMIN'], component: () => <AlertCard title="Payroll Errors" count={0} description="No errors in current batch" alertType="warning" /> },
    payRunHistory: { id: 'payRunHistory', title: 'Payroll Run History', type: 'widget', level: 'detailed', supportedRoles: ['PAYROLL_ADMIN'], component: () => <ChartPlaceholder title="Execution Times" /> },
    payFailureList: { id: 'payFailureList', title: 'Payment Failure List', type: 'widget', level: 'detailed', supportedRoles: ['PAYROLL_ADMIN'], component: () => <QueueTable title="Payment Failures" items={[]} /> },
    payNextCountdown: { id: 'payNextCountdown', title: 'Next Payroll Countdown', type: 'widget', level: 'detailed', supportedRoles: ['PAYROLL_ADMIN'], component: () => <StatusCard title="Next Cycle" status="5 Days" subtitle="Draft Generation" statusColor="brand" /> },

    // CHIEF_RISK_OFFICER
    riskAuditEvents: { id: 'riskAuditEvents', title: 'Audit Events (24h)', type: 'card', level: 'summary', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <MetricCard title="Audit Events (24h)" value="1,240" /> },
    riskRoleChanges: { id: 'riskRoleChanges', title: 'Role Changes (30 days)', type: 'card', level: 'summary', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <MetricCard title="Role Changes" value="2" /> },
    riskSuspended: { id: 'riskSuspended', title: 'Suspended Users', type: 'card', level: 'summary', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <AlertCard title="Suspended Users" count={1} description="Requires action" alertType="critical" /> },
    riskLoginAnomalies: { id: 'riskLoginAnomalies', title: 'Login Anomalies', type: 'card', level: 'summary', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <AlertCard title="Login Anomalies" count={3} description="Multiple failed attempts" alertType="warning" /> },
    riskAuditChart: { id: 'riskAuditChart', title: 'Audit Timeline', type: 'widget', level: 'detailed', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <ChartPlaceholder title="Audit Event Volume" /> },
    riskHighRiskFeed: { id: 'riskHighRiskFeed', title: 'High-Risk Actions Feed', type: 'widget', level: 'detailed', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <ActivityFeed title="High-Risk Actions" items={mockActivity} /> },
    riskAccessChart: { id: 'riskAccessChart', title: 'Access Pattern Chart', type: 'widget', level: 'detailed', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <ChartPlaceholder title="Geo/Time Access Patterns" /> },
    riskComplianceQueue: { id: 'riskComplianceQueue', title: 'Compliance Review Queue', type: 'widget', level: 'detailed', supportedRoles: ['CHIEF_RISK_OFFICER'], component: () => <QueueTable title="Pending Reviews" items={mockQueue} /> },
};
