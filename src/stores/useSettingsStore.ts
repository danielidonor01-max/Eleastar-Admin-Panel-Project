import { create } from 'zustand';
import type { AuthLevel } from '../components/PinAuthorizationModal';
import { useAuditStore } from './useAuditStore';
import { createPersistedStore } from './middleware';
import { settingsService } from '@/services/settingsService';
import type { GlobalContent } from '@/types';
import type { SystemApiKey } from '@/types';

interface AuthRequest {
    level: AuthLevel;
    description: string;
    onConfirm: (pin: string) => void;
}

interface SettingsState {
    authRequest: AuthRequest | null;
    globalSettings: GlobalContent | null;
    isLoading: boolean;
    error: string | null;
    message: string | null;
    apiKeys: SystemApiKey[];    
}

interface SettingsActions {
    requestAuth: (level: AuthLevel, description: string, onConfirm: (pin: string) => void) => void;
    clearAuthRequest: () => void;
    handleAuthSuccess: (pin: string) => void;
    generateSystemPassword: () => string;
    getGlobalSettings: () => Promise<void>;
    updateGlobal: (section: keyof GlobalContent, data: Record<string, unknown>) => Promise<void>;
    addApiKey: (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => void;
    toggleApiKeyStatus: (id: string) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
    createPersistedStore('settings', (set, get) => ({
        authRequest: null,
        globalSettings: null,
        isLoading: false,
        error: null,
        message: null,
        apiKeys: [],
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

        getGlobalSettings: async () => {
            set({ isLoading: true });
            const res = await settingsService.getGlobalSettings();
            if (res.success) {
                set({ globalSettings: res.data as GlobalContent });
            }
            set({ isLoading: false });
        },

        updateGlobal: async (section: keyof GlobalContent, data: Record<string, unknown>) => {
            set({ isLoading: true });
            const res = await settingsService.updateGlobal(section, data);
            if (res.success) {
                set({ globalSettings: res.data as unknown as GlobalContent });
            }
            set({ isLoading: false });
        },

        addApiKey: (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => {
            set({ apiKeys: [...get().apiKeys, apiKey as SystemApiKey] });
        },

        toggleApiKeyStatus: (id: string) => {
            set({ apiKeys: get().apiKeys.map(key => key.id === id ? { ...key, status: key.status === 'active' ? 'disabled' : 'active' } : key) });
        },
        })
    ));
