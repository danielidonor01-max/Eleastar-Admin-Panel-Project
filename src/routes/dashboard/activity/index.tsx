import { useState, useMemo } from 'react';
import { useAuditStore } from '@/stores/useAuditStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { Search, Filter, FileText, CheckCircle, XCircle, Mail, ArrowUpRight } from 'lucide-react';
import type { ActivityLog, EmailLog } from '@/types';

export const ActivityLogPage = () => {
    const activityLogs = useAuditStore((s) => s.activityLogs);
    const emailLogs = useNotificationStore((s) => s.emailLogs);
    const [activeTab, setActiveTab] = useState<'activity' | 'email'>('activity');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SECURITY' | 'LOGIN' | 'APPROVE' | 'REJECT'>('ALL');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

    // Filter and search logs
    const filteredLogs = useMemo(() => {
        return activityLogs.filter((log: ActivityLog) => {
            const matchesSearch = searchTerm === '' ||
                (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (log.entityType || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = filterType === 'ALL' || (log.actionType || log.action) === filterType;
            // Provide default "SUCCESS" if status is undefined
            const logStatus = log.status || 'SUCCESS';
            const matchesStatus = filterStatus === 'ALL' || logStatus === filterStatus;

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [activityLogs, searchTerm, filterType, filterStatus]);

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle size={16} className="text-emerald-600" />;
            case 'FAILURE':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return <CheckCircle size={16} className="text-emerald-600 opacity-50" />;
        }
    };

    const getActionColor = (actionType?: string) => {
        switch (actionType) {
            case 'CREATE':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'UPDATE':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'DELETE':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'SECURITY':
            case 'LOGIN':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'APPROVE':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'REJECT':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">System Activity Log</h1>
                <p className="text-slate-500 mt-1">Complete audit trail of all system operations</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'activity'
                        ? 'text-brand-600 border-b-2 border-brand-600'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    System Operations
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'email'
                        ? 'text-brand-600 border-b-2 border-brand-600'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Email Logs
                </button>
            </div>

            {activeTab === 'email' ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Trigger</th>
                                    <th className="px-6 py-4 text-right">Content</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {emailLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <Mail className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                                            No email logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    emailLogs.map((log: EmailLog) => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{log.recipientName}</div>
                                                <div className="text-xs text-slate-500">{log.recipientEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {log.subject}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {log.triggerEvent}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => alert(log.body)}
                                                    className="text-brand-600 hover:text-brand-700 font-medium text-xs flex items-center justify-end gap-1 ml-auto"
                                                >
                                                    View Body <ArrowUpRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search activity..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    aria-label="Search activity logs"
                                />
                            </div>

                            {/* Action Type Filter */}
                            <div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as 'CREATE' | 'UPDATE' | 'DELETE' | 'SECURITY' | 'LOGIN' | 'APPROVE' | 'REJECT')}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    aria-label="Filter by action type"
                                >
                                    <option value="ALL">All Actions</option>
                                    <option value="CREATE">Create</option>
                                    <option value="UPDATE">Update</option>
                                    <option value="DELETE">Delete</option>
                                    <option value="SECURITY">Security</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as 'SUCCESS' | 'FAILURE')}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    aria-label="Filter by status"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="FAILURE">Failure</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                            <Filter size={16} />
                            <span>Showing {filteredLogs.length} of {activityLogs.length} activities</span>
                        </div>
                    </div>

                    {/* Activity List */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {filteredLogs.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No activity logs found</p>
                                    <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
                                </div>
                            ) : (
                                filteredLogs.map((log: ActivityLog) => (
                                    <div key={log.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                {/* Icon */}
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                                                    <FileText size={18} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getActionColor(log.actionType)}`}>
                                                            {log.actionType || 'ACTION'}
                                                        </span>
                                                        <span className="text-xs text-slate-500">{log.entityType || 'SYSTEM'}</span>
                                                        {getStatusIcon(log.status)}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 mb-1">{log.details}</p>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                                        <span className="font-medium">{log.user}</span>
                                                        <span>•</span>
                                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                        {log.entityId && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="font-mono">ID: {log.entityId.slice(0, 8)}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-slate-500 text-sm font-medium mb-1">Total Activities</div>
                            <div className="text-2xl font-bold text-slate-900">{activityLogs.length}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-slate-500 text-sm font-medium mb-1">Successful</div>
                            <div className="text-2xl font-bold text-emerald-600">
                                {activityLogs.filter((l: ActivityLog) => l.status === 'SUCCESS').length}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-slate-500 text-sm font-medium mb-1">Failed</div>
                            <div className="text-2xl font-bold text-red-600">
                                {activityLogs.filter((l: ActivityLog) => l.status === 'FAILURE').length}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
