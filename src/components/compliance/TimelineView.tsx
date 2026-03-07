import React from 'react';
import type { ActivityLog } from '@/context/admin';
import { CheckCircle, AlertTriangle, XCircle, Clock, Shield } from 'lucide-react';

interface TimelineViewProps {
    logs: ActivityLog[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ logs }) => {
    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <Shield size={48} className="mx-auto mb-4 opacity-50" />
                <p>No compliance records found for this period.</p>
            </div>
        );
    }

    // Sort logs by timestamp desc
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const getIcon = (status: ActivityLog['status'], type: ActivityLog['actionType']) => {
        if (type === 'SECURITY') return <Shield size={16} className="text-purple-500" />;
        if (status === 'SUCCESS') return <CheckCircle size={16} className="text-emerald-500" />;
        if (status === 'FAILURE') return <XCircle size={16} className="text-red-500" />;
        return <Clock size={16} className="text-amber-500" />;
    };

    const getBadgeColor = (actionType: ActivityLog['actionType']) => {
        switch (actionType) {
            case 'SECURITY': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'APPROVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'REJECT': return 'bg-red-100 text-red-700 border-red-200';
            case 'CREATE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'UPDATE': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                {sortedLogs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                        {/* Timeline Connector */}
                        <div className="absolute -left-[9px] top-1 bg-white p-1 rounded-full border border-slate-200">
                            {getIcon(log.status, log.actionType)}
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getBadgeColor(log.actionType)}`}>
                                        {log.actionType}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        {log.entityType}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-slate-800 font-medium">{log.details}</p>

                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                <div className="flex items-center space-x-4">
                                    <span>
                                        User: <span className="font-semibold text-slate-700">{log.userId || 'System'}</span>
                                    </span>
                                    {Array.isArray((log.metadata as Record<string, unknown>)?.ids) && (
                                        <span>
                                            Affected: <span className="font-mono bg-slate-200 px-1 rounded">{(log.metadata as { ids: unknown[] }).ids.length} items</span>
                                        </span>
                                    )}
                                </div>

                                {log.status === 'FAILURE' && (
                                    <div className="flex items-center text-red-600 font-medium">
                                        <AlertTriangle size={12} className="mr-1" />
                                        <span>Flagged Exception</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimelineView;
