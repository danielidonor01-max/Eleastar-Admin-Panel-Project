import React from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

const PreviewBadge: React.FC = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Preview Environment</span>
        </div>
    );
};

export default PreviewBadge;
