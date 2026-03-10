import { type ApiResponse } from './api';
import type { AdminRole } from '@/types';
import type { AdminNotification, NotificationType } from '@/types';
import { api } from '@/utils/apiClient';



export const notificationService = {
    /**
     * Get Notifications for User
     */
    getNotifications: async (_userId: string, _role: string): Promise<ApiResponse<AdminNotification[]>> => {
        const { data } = await api.get('/notifications', { params: { userId: _userId, role: _role } });
        if (data?.success) {
            return { success: true, data: data.data ?? null };
        }
        return { success: false, data: null as unknown as AdminNotification[], error: data?.message ?? 'Failed to fetch notifications' };
    },

    /**
     * Mark as Read
     */
    markAsRead: async (id: string): Promise<ApiResponse<void>> => {
        const { data } = await api.put(`/notifications/${id}/read`);
        if (data?.success) {
            return { success: true, data: undefined, message: data.message };
        }
        return { success: false, data: undefined, error: data?.message ?? 'Failed to mark notification as read' };
    },

    /**
     * Mark All as Read
     */
    markAllAsRead: async (): Promise<ApiResponse<void>> => {
        const { data } = await api.put('/notifications/read');
        if (data?.success) {
            return { success: true, data: undefined, message: data.message };
        }
        return { success: false, data: undefined, error: data?.message ?? 'Failed to mark all notifications as read' };
    },

    /**
     * Dispatch New Notification
     */
    dispatch: async (
        payload: { title: string; message: string; type: NotificationType; link: string },
        target: { userId?: string; roles?: AdminRole[] }
    ): Promise<ApiResponse<AdminNotification>> => {
        const { data } = await api.post('/notifications', {
            ...payload,
            targetUserId: target.userId,
            targetRole: target.roles,
        });
        if (data?.success) {
            return { success: true, data: data.data!, message: data.message };
        }
        return { success: false, data: null as unknown as AdminNotification, error: data?.message ?? 'Failed to dispatch notification' };
    }
};
