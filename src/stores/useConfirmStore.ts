import { create } from 'zustand';
import { createPersistedStore } from './middleware';

interface ModalOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ConfirmState {
    modal: (ModalOptions & { isOpen: boolean }) | null;
}

interface ConfirmActions {
    showConfirm: (options: ModalOptions) => void;
    handleConfirm: () => void;
    handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState & ConfirmActions>()(createPersistedStore('confirm', (set, get) => ({
    modal: null,

    showConfirm: (options) => {
        set({ modal: { ...options, isOpen: true } });
    },

    handleConfirm: () => {
        const { modal } = get();
        if (modal) {
            modal.onConfirm();
            set({ modal: null });
        }
    },

    handleCancel: () => {
        const { modal } = get();
        if (modal) {
            if (modal.onCancel) modal.onCancel();
            set({ modal: null });
        }
    },
})
));
