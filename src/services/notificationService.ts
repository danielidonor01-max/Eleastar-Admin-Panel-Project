import { type ApiResponse, delay, mockSuccess } from './api';
import type { AdminRole } from '../data/mockData';
import type { AdminNotification, NotificationType } from './notificationTypes';

// Mock Data
let notificationsDb: AdminNotification[] = [
    { id: '1', title: 'System Alert', type: 'System', message: 'New admin session started', timestamp: new Date().toISOString(), isRead: false, link: '/admin/dashboard' },
    { id: '2', title: 'Onboarding', type: 'HR', message: 'New employee onboarded: Sarah Jenkins', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, link: '/admin/employees' },
    { id: '3', title: 'Payroll Update', type: 'Payroll', message: 'January Payroll cycle opened', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true, link: '/admin/payroll' },
    { id: '4', title: 'Application Received', type: 'Recruitment', message: '5 new applications for Frontend Dev', timestamp: new Date(Date.now() - 172800000).toISOString(), isRead: false, link: '/admin/recruitment' }
];

export const notificationService = {
    /**
     * Get Notifications for User
     */
    getNotifications: async (_userId: string, _role: string): Promise<ApiResponse<AdminNotification[]>> => {
        await delay(300);
        // Filter logic would happen on backend usually
        // For now, return all (mocking the context behavior)
        return mockSuccess(notificationsDb);
    },

    /**
     * Mark as Read
     */
    markAsRead: async (id: string): Promise<ApiResponse<void>> => {
        await delay(100);
        notificationsDb = notificationsDb.map(n => n.id === id ? { ...n, isRead: true } : n);
        return mockSuccess(undefined);
    },

    /**
     * Mark All as Read
     */
    markAllAsRead: async (): Promise<ApiResponse<void>> => {
        await delay(200);
        notificationsDb = notificationsDb.map(n => ({ ...n, isRead: true }));
        return mockSuccess(undefined);
    },

    /**
     * Dispatch New Notification
     */
    dispatch: async (
        payload: { title: string; message: string; type: NotificationType; link: string },
        target: { userId?: string; roles?: AdminRole[] }
    ): Promise<ApiResponse<AdminNotification>> => {
        await delay(100);

        const newNotification: AdminNotification = {
            id: `NOTIF-${Date.now()}`,
            ...payload,
            timestamp: new Date().toISOString(),
            isRead: false,
            targetUserId: target.userId,
            targetRole: target.roles
        };

        notificationsDb = [newNotification, ...notificationsDb];
        return mockSuccess(newNotification);
    }
};
