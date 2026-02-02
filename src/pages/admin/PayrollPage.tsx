import React, { useState, useMemo } from 'react';
import { Check, AlertCircle, Plus, Filter, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { PayrollAdjustmentModal } from '../../components/PayrollAdjustmentModal';

export const PayrollPage: React.FC = () => {
    const { employees, payrollStatus, updatePayrollStatus, bulkPayrollAdjustment, logAction, rolePermissions, currentUserRole } = useAdmin();
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

    // Permission Guard
    const canAccess = rolePermissions[currentUserRole]?.includes('Payroll') || currentUserRole === 'Super Admin';

    if (!canAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <AlertCircle size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
                <p>You do not have permission to view the Payroll module.</p>
            </div>
        );
    }

    // Selection & Filter State (Main Page)
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterDept, setFilterDept] = useState<string>('All');
    const [filterRole, setFilterRole] = useState<string>('All');
    const [filterType, setFilterType] = useState<string>('All');

    // Derived Data
    const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department))), [employees]);
    const roles = useMemo(() => Array.from(new Set(employees.map(e => e.title))), [employees]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchDept = filterDept === 'All' || emp.department === filterDept;
            const matchRole = filterRole === 'All' || emp.title === filterRole;
            const matchType = filterType === 'All' || emp.employmentType === filterType;
            const isActive = emp.status === 'active';
            return matchDept && matchRole && matchType && isActive;
        });
    }, [employees, filterDept, filterRole, filterType]);

    // Derived Totals
    const totalBaseSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const totalAdjustments = payrollStatus.adjustments.reduce((sum, adj) => {
        return sum + (adj.type === 'Bonus' ? adj.amount : -adj.amount);
    }, 0);
    const totalPayout = totalBaseSalary + totalAdjustments;

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredEmployees.map(e => e.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(mid => mid !== id));
        }
    };

    const handleApprove = () => {
        if (payrollStatus.status === 'Draft') {
            if (window.confirm('Submit payroll for review? This will notify the Finance team.')) {
                updatePayrollStatus('Reviewed');
                logAction('Payroll Review', 'Payroll marked as Reviewed');
            }
        } else if (payrollStatus.status === 'Reviewed') {
            if (window.confirm('Approve Payroll? This will LOCK the adjustments and finalize the amounts.')) {
                updatePayrollStatus('Approved');
                logAction('Payroll Approved', 'Payroll Approved. Funds locked.');
            }
        } else if (payrollStatus.status === 'Approved') {
            if (window.confirm('Mark as Paid? This will close the current cycle and disburse funds.')) {
                updatePayrollStatus('Paid');
                logAction('Payroll Paid', 'Funds Disbursed. Cycle Closed.');
            }
        }
    };

    const handleApplyAdjustment = (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        bulkPayrollAdjustment(empIds, type, amount, reason);
        // Clear main table selection if any, as the modal might have handled it or it's done now.
        setSelectedIds([]);
    };

    const getEmployeeNet = (empId: string, baseSalary: number) => {
        const empAdjustments = payrollStatus.adjustments.filter(a => a.empId === empId);
        const totalAdj = empAdjustments.reduce((sum, adj) => sum + (adj.type === 'Bonus' ? adj.amount : -adj.amount), 0);
        return baseSalary + totalAdj;
    };

    const formatNaira = (amount: number) => '₦' + amount.toLocaleString('en-NG');

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-500">Cycle: {payrollStatus.month} {payrollStatus.year}</p>
                        <span className="text-slate-300">•</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${payrollStatus.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                            payrollStatus.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                            }`}>
                            {payrollStatus.status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAdjustmentModal(true)}
                        disabled={payrollStatus.status === 'Paid'}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <Plus size={18} />
                        {selectedIds.length > 0 ? `Adjust Selected (${selectedIds.length})` : 'New Adjustment'}
                    </button>
                    {(payrollStatus.status !== 'Paid') && (
                        <button
                            onClick={handleApprove}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
                        >
                            <Check size={18} />
                            {payrollStatus.status === 'Draft' ? 'Submit for Review' :
                                payrollStatus.status === 'Reviewed' ? 'Approve Payroll' : 'Mark as Paid'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-slate-400 text-sm font-medium">Total Monthly Payout</div>
                        <div className="text-3xl font-bold mt-2">{formatNaira(totalPayout)}</div>
                        <div className="text-xs text-slate-400 mt-4 border-t border-slate-700 pt-3 flex justify-between">
                            <span>Base: {formatNaira(totalBaseSalary)}</span>
                            <span className={totalAdjustments >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                {totalAdjustments >= 0 ? '+' : ''}{formatNaira(totalAdjustments)} (Adj)
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium">Next Pay Date</div>
                    <div className="text-2xl font-bold text-slate-900 mt-2">Jan 25, 2026</div>
                    <div className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> Approval deadline: Jan 20
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-sm font-medium">Past Cycles</div>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>December 2025</span>
                            <span className="text-emerald-600 font-bold">Paid</span>
                        </div>
                        <div className="flex justify-between">
                            <span>November 2025</span>
                            <span className="text-emerald-600 font-bold">Paid</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <Filter size={18} /> Filters:
                </div>
                <select
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                    className="text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 py-1.5"
                >
                    <option value="All">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                    value={filterRole}
                    onChange={e => setFilterRole(e.target.value)}
                    className="text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 py-1.5"
                >
                    <option value="All">All Roles</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 py-1.5"
                >
                    <option value="All">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Intern">Intern</option>
                </select>

                {selectedIds.length > 0 && (
                    <div className="ml-auto flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                        <Check size={14} />
                        {selectedIds.length} Selected
                        <button onClick={() => setSelectedIds([])} className="ml-2 hover:bg-brand-100 rounded p-0.5">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Employee Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                        checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                                        onChange={e => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Base Salary</th>
                                <th className="px-6 py-4 text-right">Adjustments</th>
                                <th className="px-6 py-4 text-right">Net Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => {
                                    const adjustments = payrollStatus.adjustments.filter(a => a.empId === emp.id);
                                    const net = getEmployeeNet(emp.id, emp.salary || 0);
                                    const isSelected = selectedIds.includes(emp.id);

                                    return (
                                        <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                    checked={isSelected}
                                                    onChange={e => handleSelectOne(emp.id, e.target.checked)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{emp.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">{emp.title}</td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className={`px-2 py-1 rounded border ${emp.employmentType === 'Full-time' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                                                    }`}>
                                                    {emp.employmentType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-600 text-sm">
                                                {formatNaira(emp.salary || 0)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {adjustments.length > 0 ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        {adjustments.map((a, i) => (
                                                            <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${a.type === 'Bonus' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                                {a.type === 'Bonus' ? '+' : '-'}{formatNaira(a.amount)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                                                {formatNaira(net)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No employees match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-slate-900">Total (All Employees)</td>
                                <td className="px-6 py-4 text-right text-slate-900">{totalAdjustments !== 0 ? formatNaira(totalAdjustments) : '-'}</td>
                                <td className="px-6 py-4 text-right text-slate-900 text-lg">{formatNaira(totalPayout)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Adjustment Modal */}
            <PayrollAdjustmentModal
                isOpen={showAdjustmentModal}
                onClose={() => setShowAdjustmentModal(false)}
                onApply={handleApplyAdjustment}
                employees={employees}
                initialSelectedIds={selectedIds}
            />
        </div>
    );
};
