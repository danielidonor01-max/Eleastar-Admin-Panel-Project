import React from 'react';
import { Shield, Clock } from 'lucide-react';
import type { Employee } from '@/types';

interface VerificationInfoProps {
    employee: Employee;
}

export const VerificationInfo: React.FC<VerificationInfoProps> = ({ employee }) => {
    // Format date nicely
    const date = new Date(employee.verifiedAt);
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="max-w-md mx-6 mb-8 p-5 bg-slate-100/50 rounded-xl border border-slate-200/50">
            <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <Shield className="text-brand-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Verified by Eleastar SecureCore™</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            This identity was cryptographically verified against our central employee database.
                        </p>
                    </div>
                </div>

                <div className="h-px bg-slate-200 w-full" />

                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Clock size={14} />
                    <span>Verified live at {timeStr} on {dateStr}</span>
                </div>
            </div>
        </div>
    );
};
