import React from 'react';

export const GlobalLoadingFallback: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                {/* Outer expanding ring */}
                <div className="absolute inset-0 border-4 border-brand-100 rounded-full animate-ping opacity-75"></div>
                {/* Inner spinning ring */}
                <div className="absolute inset-0 border-4 border-transparent border-t-brand-600 rounded-full animate-spin"></div>
                {/* Center dot */}
                <div className="w-3 h-3 bg-brand-600 rounded-full"></div>
            </div>
            <h3 className="text-sm font-semibold text-slate-700 tracking-wide animate-pulse">Loading Platform...</h3>
        </div>
    );
};
