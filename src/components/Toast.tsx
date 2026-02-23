import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
    id,
    type,
    title,
    message,
    duration = 5000,
    onDismiss
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onDismiss]);

    const styles = {
        success: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-900',
            icon: <CheckCircle className="text-emerald-600" size={20} />
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-900',
            icon: <AlertTriangle className="text-amber-600" size={20} />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-900',
            icon: <XCircle className="text-red-600" size={20} />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-900',
            icon: <Info className="text-blue-600" size={20} />
        }
    };

    const style = styles[type];

    return (
        <div className={`${style.bg} ${style.border} border rounded-xl p-4 shadow-lg shadow-slate-900/5 flex items-start gap-4 mb-3 animate-in fade-in slide-in-from-right-8 duration-300 w-full max-w-sm pointer-events-auto`}>
            <div className="shrink-0 pt-0.5">
                {style.icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm ${style.text}`}>{title}</h4>
                {message && (
                    <p className={`text-sm mt-1 opacity-90 ${style.text}`}>{message}</p>
                )}
            </div>
            <button
                onClick={() => onDismiss(id)}
                className={`shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${style.text}`}
            >
                <X size={16} />
            </button>
        </div>
    );
};
