import React, { useState, useMemo } from 'react';
import { Bell, Calendar, TrendingUp, Wallet, UserPlus, QrCode, FileText, CheckCheck, Search } from 'lucide-react';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { AdminNotification, NotificationType, FilterPillProps } from '@/types';
import NotificationDetailsModal from '@/components/NotificationDetailsModal';


const FilterPill = ({ label, value, activeFilter, onSelect }: FilterPillProps) => (
    <button
        onClick={() => onSelect(value)}
        className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all flex items-center gap-2 ${
            activeFilter === value
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
    >
        {label}
    </button>
);

export const NotificationsPage = () => {
    const notifications = useNotificationStore((s) => s.notifications);
    const markNotificationAsRead = useNotificationStore((s) => s.markNotificationAsRead);
    const markAllNotificationsAsRead = useNotificationStore((s) => s.markAllNotificationsAsRead);
    const currentUserId = useAuthStore((s) => s.currentUserId);
    const currentUserRole = useAuthStore((s) => s.currentUserRole);

    const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | NotificationType>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);

    // 1. Base Filter (User/Role Target)
    const myNotifications = useMemo(() => {
        return notifications.filter((n: AdminNotification) => {
            if (n.targetUserId) return n.targetUserId === currentUserId;
            if (n.targetRole && n.targetRole.length > 0) return n.targetRole.includes(currentUserRole);
            return !n.targetUserId && (!n.targetRole || n.targetRole.length === 0);
        });
    }, [notifications, currentUserId, currentUserRole]);

    const unreadCount = myNotifications.filter((n: AdminNotification) => !n.isRead).length;

    // 2. Search & Active Tab Filter
    const filteredNotifications = useMemo(() => {
        return myNotifications.filter((n: AdminNotification) => {
            // Search Filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch = n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Tab Filter
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Unread') return !n.isRead;
            return n.type === activeFilter;
        });
    }, [myNotifications, activeFilter, searchQuery]);

    // 3. Time Grouping Helper
    const groupedNotifications = useMemo(() => {
        const groups: Record<string, AdminNotification[]> = {
            'Today': [],
            'Yesterday': [],
            'Earlier': []
        };

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        filteredNotifications.forEach((n: AdminNotification) => {
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

    const handleItemClick = (n: AdminNotification) => {
        markNotificationAsRead(n.id);
        setSelectedNotification(n);
    };

    // Helper: Icon Map
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'Leave': return <Calendar size={20} className="text-orange-600" />;
            case 'Performance': return <TrendingUp size={20} className="text-indigo-600" />;
            case 'Payroll': return <Wallet size={20} className="text-emerald-600" />;
            case 'Recruitment': return <UserPlus size={20} className="text-blue-600" />;
            case 'HR': return <FileText size={20} className="text-slate-600" />;
            case 'QR': return <QrCode size={20} className="text-violet-600" />;
            case 'System':
            default: return <Bell size={20} className="text-slate-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        View and manage your alerts and updates.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllNotificationsAsRead}
                        className="text-sm font-medium text-slate-600 hover:text-brand-600 bg-white border border-slate-200 hover:border-brand-200 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                        <CheckCheck size={16} />
                        Mark all read
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-2 md:pb-0">
                    <FilterPill label="All" value="All" activeFilter={activeFilter} onSelect={setActiveFilter} />
                    <FilterPill label={`Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}`} value="Unread" activeFilter={activeFilter} onSelect={setActiveFilter} />
                    <div className="w-px h-8 bg-slate-200 mx-1 shrink-0" />
                    <FilterPill label="Leave" value="Leave" activeFilter={activeFilter} onSelect={setActiveFilter} />
                    <FilterPill label="Payroll" value="Payroll" activeFilter={activeFilter} onSelect={setActiveFilter} />
                    <FilterPill label="System" value="System" activeFilter={activeFilter} onSelect={setActiveFilter} />
                    <FilterPill label="Recruitment" value="Recruitment" activeFilter={activeFilter} onSelect={setActiveFilter} />
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Bell size={32} />
                        </div>
                        <h4 className="text-slate-900 font-bold text-lg mb-2">
                            {searchQuery ? 'No matches found' : (activeFilter === 'All' ? "You're all caught up" : 'No notifications match this filter')}
                        </h4>
                        <p className="text-slate-500">
                            {searchQuery
                                ? "Try adjusting your search terms or clearing filters."
                                : "When you receive new notifications, they will appear here."}
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedNotifications).map(([group, items]) => (
                        items.length > 0 && (
                            <div key={group}>
                                <div className="flex items-center gap-4 mb-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{group}</h3>
                                    <div className="h-px bg-slate-200 flex-1" />
                                </div>
                                <div className="grid gap-3">
                                    {items.map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleItemClick(n)}
                                            className={`group relative p-4 rounded-xl border transition-all cursor-pointer grid grid-cols-[auto_1fr_auto] gap-4 items-center ${!n.isRead
                                                ? 'bg-white border-brand-200 shadow-md ring-1 ring-brand-50'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${!n.isRead
                                                ? 'bg-brand-50 border-brand-100'
                                                : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:border-slate-200'
                                                }`}>
                                                {getIcon(n.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`text-base truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                        {n.title}
                                                    </h4>
                                                    {!n.isRead && (
                                                        <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0 animate-pulse" />
                                                    )}
                                                </div>
                                                <p className={`text-sm line-clamp-2 ${!n.isRead ? 'text-slate-600' : 'text-slate-500'}`}>
                                                    {n.message}
                                                </p>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex flex-col items-end gap-2 pl-4 border-l border-slate-100">
                                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${!n.isRead ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {!n.isRead ? 'New' : 'Read'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))
                )}
            </div>

            {/* Modal */}
            <NotificationDetailsModal
                isOpen={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                notification={selectedNotification}
            />
        </div>
    );
};
