import React, { useMemo } from 'react';
import { X, ExternalLink, Calendar, TrendingUp, Wallet, UserPlus, FileText, QrCode, Bell, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { AdminNotification, NotificationType } from '../services/notificationTypes';
import { useAdmin } from '../context/AdminContext';

interface NotificationDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: AdminNotification | null;
}

export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({ isOpen, onClose, notification }) => {
    const navigate = useNavigate();

    if (!isOpen || !notification) return null;

    // Helper: Icon Map (Duplicated from Menu for self-containment/consistency)
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'Leave': return <Calendar size={24} className="text-orange-600" />;
            case 'Performance': return <TrendingUp size={24} className="text-indigo-600" />;
            case 'Payroll': return <Wallet size={24} className="text-emerald-600" />;
            case 'Recruitment': return <UserPlus size={24} className="text-blue-600" />;
            case 'HR': return <FileText size={24} className="text-slate-600" />;
            case 'QR': return <QrCode size={24} className="text-violet-600" />;
            case 'System':
            default: return <Bell size={24} className="text-slate-500" />;
        }
    };

    const { currentUserRole } = useAdmin();

    // Routing Logic
    const actionConfig = useMemo(() => {
        // Default to safe values
        let label = "View Details";
        let path = notification.link;
        let disabled = false;
        let warning = "";

        // Specific Routing Rules
        switch (notification.type) {
            case 'HR':
                if (notification.title.includes("Onboarding")) {
                    // Keep general link unless detailed ID provided in future
                    if (!path || path === '#') {
                        path = currentUserRole === 'USER' ? '/user/dashboard' : '/admin/employees';
                    }
                }
                break;
            case 'System':
                if (!path || path === '#') {
                    path = currentUserRole === 'USER' ? '/user/dashboard' : '/admin/dashboard';
                }
                break;
            default:
                // Trust the link provided in the notification object
                // If it's missing, fallback logic handled below
                break;
        }

        // Validity Check (Simple heuristic: if link is '#' or empty)
        if (!path || path === '#' || path === '') {
            disabled = true;
            label = "Action Unavailable";
            warning = "The destination for this notification is not yet implemented.";
        }

        return { label, path, disabled, warning };
    }, [notification, currentUserRole]);

    const handlePrimaryAction = () => {
        if (actionConfig.disabled) return;
        onClose();
        navigate(actionConfig.path);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                            {getIcon(notification.type)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">{notification.type} Notification</h3>
                            <p className="text-xs text-slate-500">
                                {new Date(notification.timestamp).toLocaleString(undefined, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{notification.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        {notification.message}
                    </p>

                    {/* Warning if disabled */}
                    {actionConfig.disabled && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-xs text-amber-700">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p>{actionConfig.warning}</p>
                        </div>
                    )}
                </div>

                {/* FooterActions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrimaryAction}
                        disabled={actionConfig.disabled}
                        className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${actionConfig.disabled
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <span>{actionConfig.label}</span>
                        {!actionConfig.disabled && <ExternalLink size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
