import type { AdminRole, ModuleType } from '../types';

export const INITIAL_PERMISSIONS: Record<AdminRole, ModuleType[]> = {
    SUPER_ADMIN: [
        'Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment',
        'Website CMS', 'Settings', 'Leave', 'Performance', 'Compliance', 'System Users'
    ],
    COO: [
        'Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment',
        'Website CMS', 'Leave', 'Performance', 'Compliance'
    ],
    HR_ADMIN: ['Dashboard', 'Employees', 'Recruitment', 'QR & ID', 'Leave', 'Performance'],
    MANAGEMENT_ADMIN: ['Dashboard', 'Employees', 'Leave', 'Performance', 'Compliance'],
    FINANCE_ADMIN: ['Dashboard', 'Payroll'],
    PAYROLL_ADMIN: ['Dashboard', 'Payroll'],
    TECHNICIAN: ['Dashboard', 'QR & ID', 'System Users'],
    WEB_ADMIN: ['Dashboard', 'Website CMS', 'Settings'],
    VIEWER: ['Dashboard'],
    CHIEF_RISK_OFFICER: ['Dashboard', 'Compliance'],
    USER: [],
};
