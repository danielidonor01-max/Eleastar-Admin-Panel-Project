import { create } from 'zustand';
import type { AdminNotification, EmailLog, NotificationType, NotificationChannel, AdminRole } from '../types';
import type { Employee } from '../types';
import { useEmployeeStore } from './useEmployeeStore';
import { createPersistedStore } from './middleware';
import { useAuditStore } from './useAuditStore';

interface NotificationState {
    notifications: AdminNotification[];
    emailLogs: EmailLog[];
    unreadCount: number;
    lastNotificationSig: string | null;
    lastNotificationTime: number;
}

interface NotificationActions {
    setNotifications: (notifications: AdminNotification[]) => void;
    dispatchNotification: (
        payload: { title: string; message: string; type: NotificationType; link: string },
        target: { userId?: string; roles?: AdminRole[] },
        channels?: NotificationChannel[]
    ) => void;
    addNotification: (type: NotificationType, message: string, link: string, targetUserId?: string) => void;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
    sendEmail: (to: string, subject: string, body: string) => void;
}

const TITLE_MAP: Record<string, string> = {
    System: 'System Notification', HR: 'HR Update', Payroll: 'Payroll Alert',
    Recruitment: 'Hiring Update', Leave: 'Leave Status', Performance: 'Performance Review',
    QR: 'Security Alert',
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
    createPersistedStore('notification', (set, get) => ({
    notifications: [],
    emailLogs: [],
    unreadCount: 0,
    lastNotificationSig: null,
    lastNotificationTime: 0,

    setNotifications: (notifications) => {
        set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length });
    },

    dispatchNotification: (payload, target, channels = ['in-app']) => {
        const sig = JSON.stringify({ payload, target });
        const now = Date.now();
        const { lastNotificationSig, lastNotificationTime } = get();
        if (lastNotificationSig === sig && now - lastNotificationTime < 5000) return;
        set({ lastNotificationSig: sig, lastNotificationTime: now });

        if (channels.includes('in-app') || channels.includes('both')) {
            const newNotif: AdminNotification = {
                id: Math.random().toString(36).substr(2, 9),
                title: payload.title,
                type: payload.type,
                message: payload.message,
                timestamp: new Date().toISOString(),
                isRead: false,
                link: payload.link,
                targetUserId: target.userId,
                targetRole: target.roles,
            };
            set((s) => ({
                notifications: [newNotif, ...s.notifications],
                unreadCount: s.unreadCount + 1,
            }));
        }

        if (channels.includes('email') || channels.includes('both')) {
            const { employees } = useEmployeeStore.getState();
            const recipients: Employee[] = [];
            if (target.userId) {
                const user = employees.find((e) => e.id === target.userId);
                if (user) recipients.push(user);
            }
            if (target.roles?.length) {
                employees.filter((e) => target.roles!.includes(e.systemRole)).forEach((e) => recipients.push(e));
            }
            const unique = Array.from(new Set(recipients.map((r) => r.id)))
                .map((id) => recipients.find((r) => r.id === id)!)
                .filter(Boolean);
            unique.forEach((r) => {
                get().sendEmail(
                    r.email || `${r.id.toLowerCase()}@eleastar.com`,
                    payload.title,
                    `${payload.message}\n\nView: ${typeof window !== 'undefined' ? window.location.origin : ''}${payload.link}`
                );
            });
        }
    },

    addNotification: (type, message, link, targetUserId) => {
        get().dispatchNotification(
            { title: TITLE_MAP[type] || 'Notification', message, type, link },
            { userId: targetUserId }
        );
    },

    markNotificationAsRead: (id) => {
        set((s) => ({
            notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            unreadCount: Math.max(0, s.unreadCount - 1),
        }));
    },

    markAllNotificationsAsRead: () => {
        set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        }));
        const { logAction } = useAuditStore.getState();
        logAction('Notifications', 'Marked all notifications as read');
    },

    sendEmail: (to, subject, body) => {
        const { employees } = useEmployeeStore.getState();
        const newLog: EmailLog = {
            id: `EMAIL-${Date.now()}`,
            recipientEmail: to,
            recipientName: employees.find((e) => e.email === to)?.name || 'Unknown',
            subject,
            body,
            timestamp: new Date().toISOString(),
            triggerEvent: 'System Action',
        };
        set((s) => ({ emailLogs: [newLog, ...s.emailLogs] }));
    },
    })
    ));
