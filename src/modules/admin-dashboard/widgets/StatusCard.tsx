import React from 'react';

export interface StatusCardProps {
    title: string;
    status: string;
    subtitle?: string;
    statusColor?: 'brand' | 'emerald' | 'rose' | 'orange';
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, status, subtitle, statusColor = 'brand' }) => {
    const colors = {
        brand: 'text-brand-600 bg-brand-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        rose: 'text-rose-600 bg-rose-50',
        orange: 'text-orange-600 bg-orange-50',
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-slate-900">{status}</div>
            </div>
            {subtitle && (
                <div className={`mt-auto pt-4 text-xs font-medium inline-block px-2 py-0.5 rounded-full ${colors[statusColor]} w-max`}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};
