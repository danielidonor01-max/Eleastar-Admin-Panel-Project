import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import type { AdminRole } from '../types';
import type { ModuleType } from '../types';
import { INITIAL_PERMISSIONS } from './constants';
import { useNotificationStore } from './useNotificationStore';
import { useAuditStore } from './useAuditStore';
import { createPersistedStore } from './middleware';
import Cookies from 'js-cookie';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUserRole: AdminRole;
    currentUserId: string | null;
    currentTenantId: string;
    rolePermissions: Record<AdminRole, ModuleType[]>;
}

interface AuthActions {
    initialize: () => Promise<void>;
    login: (email: string, pass: string) => Promise<{ role?: AdminRole; requiresOtp?: boolean }>;
    verifyOTP: (email: string, otp: string) => Promise<AdminRole | undefined>;
    logout: () => Promise<void>;
    switchRole: (role: AdminRole) => void;
    updateRolePermissions: (role: AdminRole, modules: ModuleType[]) => void;
    setAuth: (userId: string, role: AdminRole) => void;
}


const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    currentUserRole: 'USER',
    currentUserId: null,
    currentTenantId: 'tenant-default',
    rolePermissions: INITIAL_PERMISSIONS,
}
export const useAuthStore = create<AuthState & AuthActions>()(
    createPersistedStore('auth', (set) => ({
    ...initialState,

    setAuth: (userId, role) => {
        set({ isAuthenticated: true, currentUserId: userId, currentUserRole: role });
    },

    initialize: async () => {
        set({ isLoading: true });
        try {
            const res = await authService.getCurrentUser();
            if (res.success && res.data) {
                const user = res.data as { id: number; role: AdminRole };
                const userId = String(user.id);
                set({
                    isAuthenticated: true,
                    currentUserId: userId,
                    currentUserRole: user.role,
                });
                const notifRes = await notificationService.getNotifications(userId, user.role);
                if (notifRes.success) {
                    const { setNotifications } = useNotificationStore.getState();
                    setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
                }
            }
        } catch {
            // Not authenticated — stay unauthenticated
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email, pass) => {
        set({ isLoading: true });
        try {
            const res = await authService.login(email, pass);
            if (res.success && res.data) {
                if ('requires_otp' in res.data && (res.data as { requires_otp: boolean }).requires_otp) {
                    return { requiresOtp: true };
                }
                if ('user' in res.data) {
                    const user = (res.data as { user: { id: number; role: AdminRole; email: string; name: string } }).user;
                    const userId = String(user.id);
                    set({ isAuthenticated: true, currentUserRole: user.role, currentUserId: userId });
                    const notifRes = await notificationService.getNotifications(userId, user.role);
                    if (notifRes.success) {
                        const { setNotifications } = useNotificationStore.getState();
                        setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
                    }
                    const { logAction } = useAuditStore.getState();
                    logAction('Authentication', `User ${user.email} logged in`);
                    toast.success(`Welcome, ${user.name}!`);
                    return { role: user.role };
                }
            }
            toast.error('Login Failed', { description: (res as { error?: string }).error || 'Invalid credentials' });
            return {};
        } catch {
            toast.error('Login Error', { description: 'An unexpected error occurred.' });
            return {};
        } finally {
            set({ isLoading: false });
        }
    },

    verifyOTP: async (email, otp) => {
        set({ isLoading: true });
        try {
            const res = await authService.verifyOTP(email, otp);
            if (res.success && res.data && 'user' in res.data) {
                const user = (res.data as { user: { id: number; role: AdminRole; email: string; name: string } }).user;
                const userId = String(user.id);
                set({ isAuthenticated: true, currentUserRole: user.role, currentUserId: userId });
                const notifRes = await notificationService.getNotifications(userId, user.role);
                if (notifRes.success) {
                    const { setNotifications } = useNotificationStore.getState();
                    setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
                }
                const { logAction } = useAuditStore.getState();
                logAction('Authentication', `User ${user.email} verified OTP`);
                toast.success(`Welcome, ${user.name}!`);
                return user.role;
            }
            toast.error('OTP Failed', { description: (res as { error?: string }).error || 'Invalid OTP' });
            return undefined;
        } catch {
            toast.error('OTP Error', { description: 'An unexpected error occurred.' });
            return undefined;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        await authService.logout();
        Cookies.remove('admin_token');
        sessionStorage.clear();
        set({ isAuthenticated: false, currentUserRole: 'USER', currentUserId: null });
        const { setNotifications } = useNotificationStore.getState();
        setNotifications([]);
        toast.info('Logged out successfully.');
        set({ isLoading: false });
    },

    switchRole: (role) => {
        set({ currentUserRole: role });
        const { logAction } = useAuditStore.getState();
        logAction('Role Switch', `Switched view to ${role}`);
    },

    updateRolePermissions: (role, modules) => {
        set((s) => ({ rolePermissions: { ...s.rolePermissions, [role]: modules } }));
        const { logAction } = useAuditStore.getState();
        logAction('Permission Update', `Updated access rights for ${role}`);
    },

})

));
