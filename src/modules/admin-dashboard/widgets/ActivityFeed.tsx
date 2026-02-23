import React from 'react';

export interface ActivityItem {
    id: string;
    action: string;
    user: string;
    time: string;
    details?: string;
}

export interface ActivityFeedProps {
    title: string;
    items: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ title, items }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500 text-center">No recent activity</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="px-6 py-4">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-slate-900">{item.action}</span>
                                <span className="text-xs text-slate-500">{item.time}</span>
                            </div>
                            <div className="text-xs text-slate-600">
                                <span className="font-medium">{item.user}</span>
                                {item.details && ` - ${item.details}`}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
