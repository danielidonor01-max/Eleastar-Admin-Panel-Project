import React from 'react';

export interface QueueItem {
    id: string;
    title: string;
    subtitle: string;
    status: string;
}

export interface QueueTableProps {
    title: string;
    items: QueueItem[];
}

export const QueueTable: React.FC<QueueTableProps> = ({ title, items }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="p-6 text-sm text-slate-500 text-center">Queue is empty</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <div className="font-medium text-sm text-slate-900">{item.title}</div>
                                <div className="text-xs text-slate-500">{item.subtitle}</div>
                            </div>
                            <div className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                {item.status}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
