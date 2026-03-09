import { create } from 'zustand';
import { toast } from 'sonner';
import { financeService } from '../services/financeService';
import type { LedgerEntry } from '../types';
import { useAuditStore } from './useAuditStore';
import { createPersistedStore } from './middleware';

interface FinanceState {
    ledgerEntries: LedgerEntry[];
    isLoading: boolean;
}

interface FinanceActions {
    fetchLedgerEntries: () => Promise<void>;
    refreshLedgerEntries: () => Promise<void>;
    approveLedgerFunding: (cycleId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
    executeLedgerBatch: (cycleId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useFinanceStore = create<FinanceState & FinanceActions>()(
    createPersistedStore('finance', (set, get) => ({
        ledgerEntries: [],
        isLoading: false,

        fetchLedgerEntries: async () => {
            const res = await financeService.getLedgerEntries();
            if (res.success) {
                set({ ledgerEntries: Array.isArray(res.data) ? res.data : ((res.data as { data?: LedgerEntry[] })?.data || []) });
            }
        },

        refreshLedgerEntries: async () => { await get().fetchLedgerEntries(); },

        approveLedgerFunding: async (cycleId, pin) => {
            set({ isLoading: true });
            try {
                const res = await financeService.approveFunding(cycleId, pin);
                if (res.success) {
                    set((s) => ({ ledgerEntries: s.ledgerEntries.map((e) => e.payrollCycleId === cycleId ? { ...e, status: 'Funded' } : e) }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Finance Approval', `Ledger cycle ${cycleId} funded.`);
                    toast.success('Funding Approved', { description: 'Funds have been allocated to the payroll batch.' });
                    return { success: true };
                }
                toast.error('Approval Failed', { description: (res as { error?: string }).error });
                return { success: false, error: (res as { error?: string }).error };
            } catch {
                toast.error('Approval Error', { description: 'Failed to approve funding.' });
                return { success: false, error: 'Internal Error' };
            } finally {
                set({ isLoading: false });
            }
        },

        executeLedgerBatch: async (cycleId) => {
            set({ isLoading: true });
            try {
                const res = await financeService.executeBatch(cycleId);
                if (res.success) {
                    set((s) => ({
                        ledgerEntries: s.ledgerEntries.map((e) =>
                            e.payrollCycleId === cycleId ? { ...e, status: 'Executed', transactionReference: `TRX-${Math.random().toString(36).substr(2, 8).toUpperCase()}` } : e
                        ),
                    }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Finance Execution', `Ledger cycle ${cycleId} executed.`);
                    toast.success('Batch Executed', { description: 'Payments have been dispatched.' });
                    return { success: true };
                }
                toast.error('Execution Failed', { description: (res as { error?: string }).error });
                return { success: false, error: (res as { error?: string }).error };
            } catch {
                toast.error('Execution Error', { description: 'Failed to execute payment batch.' });
                return { success: false, error: 'Internal Error' };
            } finally {
                set({ isLoading: false });
            }
        },
    })
));
