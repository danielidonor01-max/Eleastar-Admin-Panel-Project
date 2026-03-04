import { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    Users,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    ShieldAlert,
    Activity,
    Briefcase,
    CheckCircle,
    UserMinus
} from 'lucide-react';

export function AnalyticsDashboard() {
    const {
        employees,
        performanceReviews,
        leaveRequests,
        bonusRequests,
        promotionRequests,
        currentUserRole,
        refreshPromotions,
        refreshBonuses,
        refreshLeaveRequests
    } = useAdmin();

    const [activeTab, setActiveTab] = useState<'health' | 'cost' | 'risk'>('health');

    // Data Fetching
    useEffect(() => {
        refreshPromotions();
        refreshBonuses();
        refreshLeaveRequests();
    }, [refreshPromotions, refreshBonuses, refreshLeaveRequests]);

    // Access Control
    const canView = ['Super Admin', 'CEO', 'COO', 'Finance Admin'].includes(currentUserRole);

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <ShieldAlert size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
                <p>This dashboard is restricted to Executive and Finance roles.</p>
            </div>
        );
    }

    // --- Metrics Calculations ---

    // 1. Org Health Metrics
    const healthMetrics = useMemo(() => {
        const total = employees.length;
        const active = employees.filter(e => e.status === 'active').length;
        const probation = employees.filter(e => e.status === 'probation').length;
        const suspended = employees.filter(e => e.status === 'suspended').length;
        const exited = employees.filter(e => e.status === 'exited').length;

        // Performance Distribution
        const ratings = performanceReviews
            .filter(r => r.status === 'Approved')
            .map(r => r.rating || r.managerRating || 0);

        const ratingDist = [
            { name: '0-1 Stars', count: ratings.filter(r => r >= 0 && r < 1).length },
            { name: '1-2 Stars', count: ratings.filter(r => r >= 1 && r < 2).length },
            { name: '2-3 Stars', count: ratings.filter(r => r >= 2 && r < 3).length },
            { name: '3-4 Stars', count: ratings.filter(r => r >= 3 && r < 4).length },
            { name: '4-5 Stars', count: ratings.filter(r => r >= 4 && r <= 5).length },
        ];

        // Average Rating
        const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        return { total, active, probation, suspended, exited, ratingDist, avgRating };
    }, [employees, performanceReviews]);

    // 2. Cost & Payroll Metrics
    const costMetrics = useMemo(() => {
        // Current Monthly Liability (Active Employees Base Salary / 12)
        const monthlyBaseLiability = employees
            .filter(e => e.status === 'active' || e.status === 'probation')
            .reduce((sum, e) => sum + (e.salary / 12), 0);

        // Bonus Exposure (Approved Bonuses in current cycle usually, explicitly ignoring cycle for this summary)
        const totalBonusesApproved = bonusRequests
            .filter(r => r.status === 'Approved')
            .reduce((sum, r) => sum + r.amount, 0);

        // Department Breakdown
        const deptCost: Record<string, number> = {};
        employees
            .filter(e => e.status === 'active' || e.status === 'probation')
            .forEach(e => {
                const dept = e.department || 'Unassigned';
                deptCost[dept] = (deptCost[dept] || 0) + (e.salary / 12);
            });

        const deptChartData = Object.entries(deptCost)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return { monthlyBaseLiability, totalBonusesApproved, deptChartData };
    }, [employees, bonusRequests]);

    // 3. Risk Metrics
    const riskMetrics = useMemo(() => {
        const pendingPromotions = promotionRequests.filter(r => r.status === 'Pending').length;
        const pendingBonuses = bonusRequests.filter(r => r.status === 'Pending').length;
        const pendingLeave = leaveRequests.filter(r => r.status === 'Pending').length;

        // Mock "Exceptions" logic
        const salaryExceptions = employees.filter(e => e.salary > 50000000).length; // Arbitrary high salary check

        return { pendingPromotions, pendingBonuses, pendingLeave, salaryExceptions };
    }, [promotionRequests, bonusRequests, leaveRequests, employees]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Executive Analytics</h1>
                    <p className="text-slate-500">Org Health, Cost Analysis, and Risk Signals</p>
                </div>
                <div className="flex gap-2">
                    {/* Read Only Badge */}
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium flex items-center gap-2">
                        <ShieldAlert size={16} /> Read Only View
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('health')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'health' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Activity size={18} />
                        Org Health
                    </div>
                    {activeTab === 'health' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('cost')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'cost' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <DollarSign size={18} />
                        Cost & Payroll
                    </div>
                    {activeTab === 'cost' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('risk')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'risk' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Risk & Compliance
                    </div>
                    {activeTab === 'risk' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {activeTab === 'health' && (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total Headcount"
                                value={healthMetrics.total}
                                icon={<Users size={20} className="text-blue-600" />}
                                color="bg-blue-50"
                            />
                            <MetricCard
                                title="Active Employees"
                                value={healthMetrics.active}
                                subtext={`${healthMetrics.probation} on Probation`}
                                icon={<CheckCircle size={20} className="text-green-600" />}
                                color="bg-green-50"
                            />
                            <MetricCard
                                title="Avg Performance"
                                value={healthMetrics.avgRating.toFixed(1)}
                                subtext="/ 5.0 Stars"
                                icon={<TrendingUp size={20} className="text-purple-600" />}
                                color="bg-purple-50"
                            />
                            <MetricCard
                                title="Attrition (Exited)"
                                value={healthMetrics.exited}
                                icon={<UserMinus size={20} className="text-red-600" />}
                                color="bg-red-50"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Distribution Chart - CSS Implementation */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Performance Score Distribution</h3>
                                <div className="h-64 flex items-end justify-between space-x-2">
                                    {healthMetrics.ratingDist.map((item, index) => {
                                        const maxCount = Math.max(...healthMetrics.ratingDist.map(d => d.count), 1);
                                        const heightPercentage = (item.count / maxCount) * 100;
                                        return (
                                            <div key={index} className="flex flex-col items-center w-full group relative">
                                                <div
                                                    className="w-full bg-brand-600 rounded-t-md transition-all duration-500 hover:bg-brand-500"
                                                    style={{ height: `${heightPercentage}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                                                />
                                                <span className="text-xs text-slate-500 mt-2 text-center">{item.name}</span>
                                                <div className="absolute -top-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.count} employees
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status Distribution Pie Chart - CSS Implementation */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Workforce Status</h3>
                                <div className="flex items-center justify-center h-64">
                                    {/* Simple Legend instead of Pie Chart for now to keep it clean without Recharts complexity */}
                                    <div className="w-full space-y-4">
                                        {[
                                            { name: 'Active', value: healthMetrics.active, color: 'bg-emerald-500', width: `${(healthMetrics.active / healthMetrics.total) * 100}%` },
                                            { name: 'Probation', value: healthMetrics.probation, color: 'bg-amber-500', width: `${(healthMetrics.probation / healthMetrics.total) * 100}%` },
                                            { name: 'Suspended', value: healthMetrics.suspended, color: 'bg-red-500', width: `${(healthMetrics.suspended / healthMetrics.total) * 100}%` },
                                            { name: 'Exited', value: healthMetrics.exited, color: 'bg-slate-500', width: `${(healthMetrics.exited / healthMetrics.total) * 100}%` },
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-slate-700">{item.name}</span>
                                                    <span className="text-slate-500">{item.value} ({((item.value / healthMetrics.total) * 100 || 0).toFixed(0)}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div className={`h-full ${item.color}`} style={{ width: item.width }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cost' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MetricCard
                                title="Monthly Base Payroll"
                                value={`₦${costMetrics.monthlyBaseLiability.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                icon={<Briefcase size={20} className="text-brand-600" />}
                                color="bg-brand-50"
                            />
                            <MetricCard
                                title="Bonuses Approved (YTD)"
                                value={`₦${costMetrics.totalBonusesApproved.toLocaleString()}`}
                                icon={<DollarSign size={20} className="text-green-600" />}
                                color="bg-green-50"
                            />
                            <MetricCard
                                title="Projected Annual Cost"
                                value={`₦${(costMetrics.monthlyBaseLiability * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                subtext="Base Salaries Only"
                                icon={<TrendingUp size={20} className="text-blue-600" />}
                                color="bg-blue-50"
                            />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Cost by Department</h3>
                            <div className="space-y-4">
                                {costMetrics.deptChartData.map((item, index) => {
                                    const maxVal = Math.max(...costMetrics.deptChartData.map(d => d.value), 1000);
                                    const widthPercentage = (item.value / maxVal) * 100;
                                    return (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-32 text-sm font-medium text-slate-600 truncate text-right">
                                                {item.name}
                                            </div>
                                            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                                                <div
                                                    className="h-full bg-sky-500 rounded-full"
                                                    style={{ width: `${widthPercentage}%` }}
                                                />
                                            </div>
                                            <div className="w-32 text-sm text-slate-900 font-mono text-right">
                                                ₦{(item.value / 1000000).toFixed(1)}M
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'risk' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <RiskCard
                                title="Pending Promotions"
                                count={riskMetrics.pendingPromotions}
                                type={riskMetrics.pendingPromotions > 0 ? 'warning' : 'success'}
                            />
                            <RiskCard
                                title="Pending Bonuses"
                                count={riskMetrics.pendingBonuses}
                                type={riskMetrics.pendingBonuses > 0 ? 'warning' : 'success'}
                            />
                            <RiskCard
                                title="Active Leave Requests"
                                count={riskMetrics.pendingLeave}
                                type="neutral"
                            />
                            <RiskCard
                                title="Salary Exceptions (>50M)"
                                count={riskMetrics.salaryExceptions}
                                type={riskMetrics.salaryExceptions > 0 ? 'danger' : 'success'}
                            />
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <h3 className="font-semibold text-slate-900">Recent Compliance Signals</h3>
                            </div>
                            <div className="p-6 text-center text-slate-500 py-12">
                                <ShieldAlert size={48} className="mx-auto mb-3 text-slate-300" />
                                <p>No critical compliance violations detected in the last 30 days.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-components

function MetricCard({ title, value, subtext, icon, color }: any) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );
}

function RiskCard({ title, count, type }: { title: string, count: number, type: 'success' | 'warning' | 'danger' | 'neutral' }) {
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-700',
        warning: 'bg-amber-50 border-amber-200 text-amber-700',
        danger: 'bg-red-50 border-red-200 text-red-700',
        neutral: 'bg-slate-50 border-slate-200 text-slate-700'
    };

    return (
        <div className={`p-5 rounded-xl border ${colors[type]} shadow-sm`}>
            <p className="text-sm font-medium mb-2 opacity-80">{title}</p>
            <div className="text-3xl font-bold">{count}</div>
        </div>
    );
}
