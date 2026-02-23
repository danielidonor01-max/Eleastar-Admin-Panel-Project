import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from '../components/ToastContainer';
import { ConfirmationModal } from '../components/ConfirmationModal';
import type { ToastType, ToastProps } from '../components/Toast';

interface ModalOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface FeedbackContextType {
    showSuccess: (options: { title: string; message?: string }) => void;
    showWarning: (options: { title: string; message?: string }) => void;
    showError: (options: { title: string; message?: string }) => void;
    showInfo: (options: { title: string; message?: string }) => void;
    showConfirm: (options: ModalOptions) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [modal, setModal] = useState<(ModalOptions & { isOpen: boolean }) | null>(null);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, type, title, message, onDismiss: dismissToast }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showSuccess = useCallback((opts: { title: string; message?: string }) => addToast('success', opts.title, opts.message), [addToast]);
    const showWarning = useCallback((opts: { title: string; message?: string }) => addToast('warning', opts.title, opts.message), [addToast]);
    const showError = useCallback((opts: { title: string; message?: string }) => addToast('error', opts.title, opts.message), [addToast]);
    const showInfo = useCallback((opts: { title: string; message?: string }) => addToast('info', opts.title, opts.message), [addToast]);

    const showConfirm = useCallback((options: ModalOptions) => {
        setModal({ ...options, isOpen: true });
    }, []);

    const handleConfirm = useCallback(() => {
        if (modal) {
            modal.onConfirm();
            setModal(null);
        }
    }, [modal]);

    const handleCancel = useCallback(() => {
        if (modal) {
            if (modal.onCancel) modal.onCancel();
            setModal(null);
        }
    }, [modal]);

    return (
        <FeedbackContext.Provider value={{ showSuccess, showWarning, showError, showInfo, showConfirm }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            {modal && (
                <ConfirmationModal
                    isOpen={modal.isOpen}
                    title={modal.title}
                    message={modal.message}
                    confirmLabel={modal.confirmLabel}
                    cancelLabel={modal.cancelLabel}
                    isDestructive={modal.isDestructive}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </FeedbackContext.Provider>
    );
};

export const useFeedback = () => {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useFeedback must be used within a FeedbackProvider');
    }
    return context;
};
