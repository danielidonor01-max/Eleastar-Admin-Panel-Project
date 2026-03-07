// =============================================================================
// NOTIFICATIONS
// =============================================================================

import type { AdminRole } from './auth';

export type NotificationType =
    | 'System'
    | 'HR'
    | 'Payroll'
    | 'Recruitment'
    | 'Leave'
    | 'Performance'
    | 'QR';

export type NotificationChannel = 'in-app' | 'email' | 'both';

export interface AdminNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string;
    isRead: boolean;
    link: string;
    targetUserId?: string;
    targetRole?: AdminRole[];
}

export interface EmailLog {
    id: string;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    timestamp: string;
    triggerEvent: string;
}



export type FilterValue = 'All' | 'Unread' | NotificationType;

export interface FilterPillProps {
    label: string;
    value: FilterValue;
    activeFilter: FilterValue;
    onSelect: (value: FilterValue) => void;
}