import React, { useState, useMemo } from 'react';
import { Bell, Calendar, TrendingUp, Wallet, UserPlus, QrCode, FileText, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import type { Notification, NotificationType } from '../context/AdminContext';

export const NotificationMenu: React.FC = () => {
    const {
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        currentUserId,
        currentUserRole
    } = useAdmin();

    const [showMenu, setShowMenu] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | NotificationType>('All');
    const navigate = useNavigate();

    // 1. Base Filter (User/Role Target)
    const myNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (n.targetUserId) return n.targetUserId === currentUserId;
            if (n.targetRole && n.targetRole.length > 0) return n.targetRole.includes(currentUserRole);
            return !n.targetUserId && (!n.targetRole || n.targetRole.length === 0);
        });
    }, [notifications, currentUserId, currentUserRole]);

    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    // 2. Active Tab Filter
    const filteredNotifications = useMemo(() => {
        return myNotifications.filter(n => {
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Unread') return !n.isRead;
            return n.type === activeFilter;
        });
    }, [myNotifications, activeFilter]);

    // 3. Time Grouping Helper
    const groupedNotifications = useMemo(() => {
        const groups: Record<string, Notification[]> = {
            'Today': [],
            'Yesterday': [],
            'Earlier': []
        };

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        filteredNotifications.forEach(n => {
            const date = new Date(n.timestamp);
            if (date.toDateString() === today.toDateString()) {
                groups['Today'].push(n);
            } else if (date.toDateString() === yesterday.toDateString()) {
                groups['Yesterday'].push(n);
            } else {
                groups['Earlier'].push(n);
            }
        });

        return groups;
    }, [filteredNotifications]);

    const handleItemClick = (n: Notification) => {
        markNotificationAsRead(n.id);
        setShowMenu(false);
        navigate(n.link);
    };

    // Helper: Icon Map
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'Leave': return <Calendar size={16} className="text-orange-600" />;
            case 'Performance': return <TrendingUp size={16} className="text-indigo-600" />;
            case 'Payroll': return <Wallet size={16} className="text-emerald-600" />;
            case 'Recruitment': return <UserPlus size={16} className="text-blue-600" />;
            case 'HR': return <FileText size={16} className="text-slate-600" />;
            case 'QR': return <QrCode size={16} className="text-violet-600" />;
            case 'System':
            default: return <Bell size={16} className="text-slate-500" />;
        }
    };

    // Helper: Pill Component
    const FilterPill = ({ label, value }: { label: string, value: typeof activeFilter }) => (
        <button
            onClick={() => setActiveFilter(value)}
            className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${activeFilter === value
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="relative text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-100"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            {showMenu && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">

                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    Notifications
                                    {unreadCount > 0 && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                                </h3>
                                <button
                                    onClick={markAllNotificationsAsRead}
                                    className="text-xs text-slate-500 hover:text-brand-600 font-medium flex items-center gap-1.5 transition-colors group"
                                    title="Mark all as read"
                                >
                                    <CheckCheck size={14} className="group-hover:text-brand-600" />
                                    <span>Mark all read</span>
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-gradient">
                                <FilterPill label="All" value="All" />
                                <FilterPill label={`Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`} value="Unread" />
                                <div className="w-px h-4 bg-slate-200 mx-1 self-center flex-shrink-0" />
                                <FilterPill label="Leave" value="Leave" />
                                <FilterPill label="Performance" value="Performance" />
                                <FilterPill label="Payroll" value="Payroll" />
                                <FilterPill label="System" value="System" />
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto bg-slate-50/50">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                                        <Bell size={24} />
                                    </div>
                                    <h4 className="text-slate-900 font-bold mb-1">
                                        {activeFilter === 'All' ? "You're all caught up 🎉" : 'No notifications match this filter.'}
                                    </h4>
                                    <p className="text-xs text-slate-500 max-w-[200px]">
                                        {activeFilter === 'All'
                                            ? "Check back later for updates on leave, payroll, and more."
                                            : "Try selecting a different category or clearing filters."}
                                    </p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {Object.entries(groupedNotifications).map(([group, items]) => (
                                        items.length > 0 && (
                                            <div key={group}>
                                                <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 border-b border-slate-100/50">
                                                    {group}
                                                </div>
                                                <div>
                                                    {items.map(n => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => handleItemClick(n)}
                                                            className={`group relative px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-all flex gap-3.5 items-start ${!n.isRead ? 'bg-white' : 'bg-transparent opacity-80 hover:opacity-100'
                                                                }`}
                                                        >
                                                            {/* Unread Indicator Bar */}
                                                            {!n.isRead && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-500" />
                                                            )}

                                                            {/* Icon Box */}
                                                            <div className={`mt-0.5 w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${!n.isRead ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-100 border-slate-100 text-slate-400 grayscale'
                                                                }`}>
                                                                {getIcon(n.type)}
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-2 mb-0.5">
                                                                    <p className={`text-sm truncate pr-2 ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                                                                        }`}>
                                                                        {n.title}
                                                                    </p>
                                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                                                                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-xs leading-relaxed line-clamp-2 ${!n.isRead ? 'text-slate-600' : 'text-slate-500'
                                                                    }`}>
                                                                    {n.message}
                                                                </p>
                                                                {/* Type Tag */}
                                                                {/* <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-500">
                                                                    {n.type}
                                                                </div> */}
                                                            </div>

                                                            {/* Valid Read Indicator Dot for very quick scanning */}
                                                            {!n.isRead && (
                                                                <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0 absolute right-4" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                            <button
                                onClick={() => navigate('/admin/dashboard')} // Or a dedicated full page if it exists
                                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center justify-center gap-1 w-full py-1"
                            >
                                View Full History
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

