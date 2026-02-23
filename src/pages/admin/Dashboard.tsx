import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Clock, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export const Dashboard: React.FC = () => {
    const { employees, payrollStatus, activityLogs, jobs } = useAdmin();
    const location = useLocation();
    const navigate = useNavigate();
    const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null);

    // Deep Linking Handler
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const logId = params.get('logId');
        if (logId) {
            setHighlightedLogId(logId);
            // Optional: Scroll to view if list gets long
        }
    }, [location.search]);

    // Computed Data
    const totalEmployees = employees.length;
    const interns = employees.filter(e => e.employmentType === 'Intern').length;
    const active = employees.filter(e => e.status === 'active').length;
    const activePercentage = totalEmployees > 0 ? Math.round((active / totalEmployees) * 100) : 0;

    const openRoles = jobs.filter(j => j.status === 'Published').length;
    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicants, 0);

    // Approximate width for lint compliance
    let widthClass = 'w-0';
    if (activePercentage > 85) widthClass = 'w-full';
    else if (activePercentage > 60) widthClass = 'w-3/4';
    else if (activePercentage > 40) widthClass = 'w-1/2';
    else if (activePercentage > 15) widthClass = 'w-1/4';

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="text-slate-500 text-sm font-medium mb-1">Total Employees</div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-slate-900">{totalEmployees}</div>
                        <div className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                            <TrendingUp size={16} /> +2
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`bg-brand-500 h-full rounded-full ${widthClass}`} />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{activePercentage}% Active • {interns} Intern</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="text-slate-500 text-sm font-medium mb-1">Payroll Status</div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-slate-900">{payrollStatus.status}</div>
                        <div className="text-brand-600 text-sm font-medium bg-brand-50 px-2 py-0.5 rounded-full">
                            {payrollStatus.month}
                        </div>
                    </div>
                    <div className="mt-auto pt-4 text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock size={14} />
                        Next payout: Jan 25
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="text-slate-500 text-sm font-medium mb-1">QR Activity</div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-slate-900">12</div>
                        <div className="text-emerald-600 text-sm">100% Valid</div>
                    </div>
                    <div className="mt-auto pt-4 text-xs text-slate-500">
                        Last scan: Just now
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="text-slate-500 text-sm font-medium mb-1">Recruitment</div>
                    <div className="flex items-end justify-between">
                        <div className="text-3xl font-bold text-slate-900">{openRoles}</div>
                        <div className="text-slate-400 text-sm">Open Roles</div>
                    </div>
                    <div className="mt-auto pt-4 flex -space-x-2 items-center">
                        <span className="text-xs text-slate-500 font-medium">{totalApplicants} Active Candidates</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Recent System Activity</h3>
                        <button onClick={() => navigate('/admin/activity')} className="btn-ghost btn-sm text-brand-600">View All</button>
                    </div>
                    <div className="divide-y divide-slate-100 relative">
                        {activityLogs.slice(0, 5).map((log) => (
                            <div
                                key={log.id}
                                className={`px-6 py-4 flex items-center justify-between transition-all duration-500 ${highlightedLogId === log.id
                                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                    : 'hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{log.actionType}</div>
                                        <div className="text-xs text-slate-500">{log.actorName} • {new Date(log.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 max-w-[200px] truncate">
                                    {log.details}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Center */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Requires Attention</h3>
                    <div className="space-y-4">
                        {payrollStatus.status === 'Reviewed' && (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="flex items-start gap-3">
                                    <Clock className="text-orange-600 mt-0.5" size={18} />
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-900">Payroll Approval Pending</h4>
                                        <p className="text-xs text-orange-700 mt-1">{payrollStatus.month} cycle needs review.</p>
                                        <button onClick={() => navigate('/admin/payroll')} className="btn-secondary btn-sm mt-3 text-orange-800 border-orange-200 hover:bg-orange-50">Review Payroll</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 bg-brand-50 rounded-lg border border-brand-100">
                            <div className="flex items-start gap-3">
                                <Users className="text-brand-600 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-brand-900">New Applications</h4>
                                    <p className="text-xs text-brand-700 mt-1">{totalApplicants} candidates waiting.</p>
                                    <button onClick={() => navigate('/admin/recruitment')} className="btn-secondary btn-sm mt-3 text-brand-800 border-brand-200 hover:bg-brand-50">View Candidates</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
