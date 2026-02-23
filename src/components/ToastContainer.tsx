import React from 'react';
import { Toast } from './Toast';
import type { ToastProps } from './Toast';

interface ToastContainerProps {
    toasts: ToastProps[];
    onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};
