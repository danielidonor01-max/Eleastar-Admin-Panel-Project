import { create } from 'zustand';
import type { AuthLevel } from '../components/PinAuthorizationModal';
import { useAuditStore } from './useAuditStore';
import { createPersistedStore } from './middleware';

interface AuthRequest {
    level: AuthLevel;
    description: string;
    onConfirm: (pin: string) => void;
}

interface SettingsState {
    authRequest: AuthRequest | null;
}

interface SettingsActions {
    requestAuth: (level: AuthLevel, description: string, onConfirm: (pin: string) => void) => void;
    clearAuthRequest: () => void;
    handleAuthSuccess: (pin: string) => void;
    generateSystemPassword: () => string;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
    createPersistedStore('settings', (set, get) => ({
        authRequest: null,

        requestAuth: (level, description, onConfirm) => {
            set({ authRequest: { level, description, onConfirm } });
        },

        clearAuthRequest: () => set({ authRequest: null }),

        handleAuthSuccess: (pin) => {
            const { authRequest } = get();
            if (authRequest) {
                authRequest.onConfirm(pin);
                const { logAction } = useAuditStore.getState();
                logAction('Authorization', `PIN Verified for: ${authRequest.description}`);
                set({ authRequest: null });
            }
        },

        generateSystemPassword: () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            return Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        },
    })
    ));
