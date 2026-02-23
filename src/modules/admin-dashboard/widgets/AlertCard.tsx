import React from 'react';

export interface AlertCardProps {
    title: string;
    count: number;
    description: string;
    alertType?: 'warning' | 'critical';
}

export const AlertCard: React.FC<AlertCardProps> = ({ title, count, description, alertType = 'warning' }) => {
    const isCritical = alertType === 'critical';
    return (
        <div className={`p-6 rounded-xl border flex flex-col h-full ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className={`text-sm font-medium mb-1 ${isCritical ? 'text-rose-700' : 'text-orange-700'}`}>{title}</div>
            <div className={`text-3xl font-bold ${isCritical ? 'text-rose-900' : 'text-orange-900'}`}>{count}</div>
            <div className={`mt-auto pt-4 text-xs font-medium ${isCritical ? 'text-rose-600' : 'text-orange-600'}`}>
                {description}
            </div>
        </div>
    );
};
