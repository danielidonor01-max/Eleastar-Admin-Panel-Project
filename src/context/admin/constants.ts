import type { AdminRole } from '../../data/mockData';
import type { AdminNotification } from '../../services/notificationTypes';
import type { ModuleType } from './types';

export const INITIAL_PERMISSIONS: Record<AdminRole, ModuleType[]> = {
    'SUPER_ADMIN': [
        'Dashboard',
        'Employees',
        'QR & ID',
        'Payroll',
        'Recruitment',
        'Website CMS',
        'Settings',
        'Leave',
        'Performance',
        'Compliance',
        'System Users'
    ],
    'COO': [
        'Dashboard',
        'Employees',
        'QR & ID',
        'Payroll',
        'Recruitment',
        'Website CMS',
        'Leave',
        'Performance',
        'Compliance'
    ],
    'HR_ADMIN': ['Dashboard', 'Employees', 'Recruitment', 'QR & ID', 'Leave', 'Performance'],
    'MANAGEMENT_ADMIN': ['Dashboard', 'Employees', 'Leave', 'Performance', 'Compliance'],
    'FINANCE_ADMIN': ['Dashboard', 'Payroll'],
    'PAYROLL_ADMIN': ['Dashboard', 'Payroll'],
    'TECHNICIAN': ['Dashboard', 'QR & ID', 'System Users'],
    'WEB_ADMIN': ['Dashboard', 'Website CMS', 'Settings'],
    'VIEWER': ['Dashboard'],
    'CHIEF_RISK_OFFICER': ['Dashboard', 'Compliance'],
    'USER': []
};

export const INITIAL_NOTIFICATIONS: AdminNotification[] = [
    {
        id: '1',
        title: 'System Alert',
        type: 'System',
        message: 'New admin session started',
        timestamp: new Date().toISOString(),
        isRead: false,
        link: '/admin/dashboard'
    },
    {
        id: '2',
        title: 'Onboarding',
        type: 'HR',
        message: 'New employee onboarded: Sarah Jenkins',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false,
        link: '/admin/employees'
    },
    {
        id: '3',
        title: 'Payroll Update',
        type: 'Payroll',
        message: 'January Payroll cycle opened',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
        link: '/admin/payroll'
    },
    {
        id: '4',
        title: 'Application Received',
        type: 'Recruitment',
        message: '5 new applications for Frontend Dev',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        isRead: false,
        link: '/admin/recruitment'
    },
    {
        id: '5',
        title: 'QR Maintenance',
        type: 'QR',
        message: 'Bulk QR regeneration completed',
        timestamp: new Date(Date.now() - 250000000).toISOString(),
        isRead: true,
        link: '/admin/qr'
    }
];
