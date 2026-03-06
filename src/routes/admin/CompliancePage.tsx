import React, { useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import TimelineView from '../../components/compliance/TimelineView';
import { Shield, ClipboardList, Lock, AlertTriangle, Database } from 'lucide-react';

const CompliancePage: React.FC = () => {
    const { activityLogs, currentTenantId } = useAdmin();
    const [filter, setFilter] = useState<'ALL' | 'PAYROLL' | 'HR' | 'SECURITY'>('ALL');

    // Filter logs for compliance view
    const complianceLogs = useMemo(() => {
        return activityLogs.filter(log => {
            // Base filter: Only show relevant entity types for compliance audit
            const isRelevant = ['Payroll', 'HR', 'System', 'Security', 'Employee'].includes(log.entityType || '');
            if (!isRelevant) return false;

            if (filter === 'PAYROLL') return log.entityType === 'Payroll';
            if (filter === 'HR') return ['Employee', 'Leave', 'Performance', 'Recruitment'].includes(log.entityType || '');
            if (filter === 'SECURITY') return log.actionType === 'SECURITY' || log.entityType === 'System';

            return true;
        });
    }, [activityLogs, filter]);

    // Metrics
    const metrics = useMemo(() => {
        const total = complianceLogs.length;
        const violations = complianceLogs.filter(l => l.status === 'FAILURE').length;
        const securityEvents = complianceLogs.filter(l => l.actionType === 'SECURITY').length;
        const manualOverrides = complianceLogs.filter(l => (l.details || '').toLowerCase().includes('override') || (l.details || '').toLowerCase().includes('manual')).length;

        return { total, violations, securityEvents, manualOverrides };
    }, [complianceLogs]);

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Shield className="mr-3 text-indigo-600" />
                        Compliance & Audit Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Read-only view of sensitive system operations and audit trails.
                        <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded-full font-mono">
                            Tenant: {currentTenantId}
                        </span>
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 text-sm hover:bg-slate-50 font-medium shadow-sm">
                        Export Audit Report
                    </button>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Audit Events</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{metrics.total}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg"><ClipboardList className="text-blue-600" size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Security Incidents</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{metrics.securityEvents}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg"><Lock className="text-purple-600" size={24} /></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Policy Violations</p>
                            <h3 className={`text-3xl font-bold mt-2 ${metrics.violations > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                {metrics.violations}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg"><AlertTriangle className="text-red-600" size={24} /></div>
                    </div>
                    {metrics.violations > 0 && <p className="text-xs text-red-500 mt-2 font-medium">Action Required</p>}
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Manual Overrides</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{metrics.manualOverrides}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg"><Database className="text-amber-600" size={24} /></div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-slate-800">Audit Log Timeline</h2>

                    <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                        {(['ALL', 'PAYROLL', 'HR', 'SECURITY'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filter === f
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 max-h-[600px] overflow-y-auto">
                    <TimelineView logs={complianceLogs} />
                </div>
            </div>
        </div>
    );
};

export default CompliancePage;
