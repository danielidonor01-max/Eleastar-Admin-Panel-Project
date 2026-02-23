import React from 'react';

export interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendUp }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="text-slate-500 text-sm font-medium mb-1">{title}</div>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                {trend && (
                    <div className={`text-sm font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
};
