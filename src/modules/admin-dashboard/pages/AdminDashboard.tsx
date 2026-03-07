import React, { useState } from 'react';
import { useAdmin } from '@/context/admin';
import { useRoleDashboard } from '../hooks/useRoleDashboard';
import { DashboardWidget } from '../widgets/DashboardWidget';

export const AdminDashboard: React.FC = () => {
    const { currentUserRole } = useAdmin();
    const role = currentUserRole || 'USER';
    const [activeTab, setActiveTab] = useState('overview');

    const { cardWidgets, standardWidgets, hasWidgets, tabs } = useRoleDashboard(role, activeTab);

    if (!hasWidgets && tabs.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500">
                No dashboard widgets configured for your role ({role}).
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Platform Overview</h1>
                <p className="text-slate-500 text-sm">Welcome back. Monitoring as {role.replace('_', ' ')}.</p>
            </div>

            {tabs.length > 0 && (
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-brand-500 text-brand-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* KPIs / Cards */}
            {cardWidgets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cardWidgets.map(widget => (
                        <DashboardWidget key={widget.id} id={widget.id} type={widget.type}>
                            {widget.component()}
                        </DashboardWidget>
                    ))}
                </div>
            )}

            {/* Standard Widgets (Charts, Queues, Feeds) */}
            {standardWidgets.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {standardWidgets.map(widget => (
                        <DashboardWidget key={widget.id} id={widget.id} type={widget.type}>
                            {widget.component()}
                        </DashboardWidget>
                    ))}
                </div>
            )}

            {!hasWidgets && (
                <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-slate-500">
                    No summary widgets available for this view.
                </div>
            )}
        </div>
    );
};
