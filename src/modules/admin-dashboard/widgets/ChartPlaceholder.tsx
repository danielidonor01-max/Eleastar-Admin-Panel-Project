import React from 'react';

export interface ChartPlaceholderProps {
    title: string;
    height?: string;
}

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, height = 'h-64' }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <h3 className="text-slate-900 font-bold mb-4">{title}</h3>
            <div className={`w-full ${height} bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-1`}>
                [Chart] {title}
            </div>
        </div>
    );
};
