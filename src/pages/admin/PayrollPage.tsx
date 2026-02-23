import React, { useState, useMemo } from 'react';
import { Check, AlertCircle, Plus, Wallet, Edit2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { PayrollAdjustmentModal } from '../../components/PayrollAdjustmentModal';
import { SalaryEditModal } from '../../components/SalaryEditModal';
import { generatePastCycles } from '../../utils/payrollUtils';
import { useFeedback } from '../../context/FeedbackContext';
import { Select } from '../../components/Select';
import type { Employee } from '../../data/mockData';
import { SalarySettings } from './SalarySettings';

export const PayrollPage: React.FC = () => {
    const { employees, payrollStatus, bulkPayrollAdjustment, cooReviewPayroll, cfoApprovePayroll, updateEmployeeSalary, rolePermissions, currentUserRole } = useAdmin();
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [editingSalaryEmployee, setEditingSalaryEmployee] = useState<Employee | null>(null);
    const { showConfirm } = useFeedback();
    const [activeTab, setActiveTab] = useState<'payment' | 'structure'>('payment');

    // --- Cycle Selection State ---
    const initialYear = useMemo(() => new Date().getFullYear(), []);
    const [selectedYear, setSelectedYear] = useState<number>(initialYear);
    const [viewCycleId, setViewCycleId] = useState<string>('');

    // Dynamic Past Cycles
    const pastCycles = useMemo(() => generatePastCycles(payrollStatus, 24), [payrollStatus]);

    // Filter cycles by selected year
    const availableCycles = useMemo(() => {
        const all = [payrollStatus, ...pastCycles];
        return all.filter(c => c.year === selectedYear);
    }, [payrollStatus, pastCycles, selectedYear]);

    // Set default view cycle when year changes or on mount
    useMemo(() => {
        if (availableCycles.length > 0 && !availableCycles.find(c => c.id === viewCycleId)) {
            // Default to the first available cycle (usually the latest one in that year)
            setViewCycleId(availableCycles[0].id);
        }
    }, [availableCycles, viewCycleId]);

    const targetCycle = useMemo(() => {
        return availableCycles.find(c => c.id === viewCycleId) || payrollStatus;
    }, [availableCycles, viewCycleId, payrollStatus]);

    const isCurrentCycle = targetCycle.id === payrollStatus.id;

    // Permission Guard
    const canAccess = rolePermissions[currentUserRole]?.includes('Payroll') || currentUserRole === 'SUPER_ADMIN';

    // Auto-Reset Filters on Cycle Change
    React.useEffect(() => {
        setFilterDept('All');
        setFilterRole('All');
        setFilterType('All');
        setSelectedIds([]);
    }, [viewCycleId]);

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

    // Derived Totals
    const snapshotData = useMemo(() => {
        if (targetCycle.snapshot && targetCycle.snapshot.rawData) {
            try {
                return JSON.parse(targetCycle.snapshot.rawData);
            } catch (e) {
                console.error("Failed to parse snapshot data", e);
                return null;
            }
        }
        return null;
    }, [targetCycle]);

    const displayEmployees = useMemo(() => {
        if (snapshotData) {
            return snapshotData.employees;
        }
        return employees;
    }, [snapshotData, employees]);

    // Helper type for safe access
    type PayrollEmployee = {
        id: string;
        name: string;
        department?: string;
        title?: string;
        employmentType?: string;
        salary: number;
        status?: string;
        netPay?: number;
    };

    const filteredEmployees = useMemo(() => {
        const sourceData = displayEmployees as PayrollEmployee[];
        return sourceData.filter((emp) => {
            // For snapshot data, we might not have all fields like 'department' if not stored. 
            // But my AdminContext snapshot logic stored: id, name, salary, netPay.
            // It missed 'department', 'title', 'employmentType'. 
            // Logic check: I need to update AdminContext to store these fields if I want filtering to work on snapshots.
            // For now, let's assume filtering works on current employee data matched by ID, OR we just show all for snapshot?
            // Better: Update AdminContext to store full needed info. 
            // BUT, simply: For snapshot view, maybe disable complex filters or map them.
            // Let's rely on current employee metadata for filtering (Dept/Role) but use Snapshot financial data.

            // However, if an employee left, they might disappear from 'employees' list (if deleted)? No, we soft delete usually or status change.
            // So mapping by ID to get filterable attributes is safer for now.

            const liveEmp = employees.find(e => e.id === emp.id);
            const dept = liveEmp?.department || emp.department || 'Unknown';
            const role = liveEmp?.title || emp.title || 'Unknown';
            const type = liveEmp?.employmentType || emp.employmentType || 'Unknown';
            // Snapshot employees are by definition eligible at that time.

            const matchDept = filterDept === 'All' || dept === filterDept;
            const matchRole = filterRole === 'All' || role === filterRole;
            const matchType = filterType === 'All' || type === filterType;
            return matchDept && matchRole && matchType;
        });
    }, [displayEmployees, employees, filterDept, filterRole, filterType]);

    const totalBaseSalary = snapshotData
        ? snapshotData.employees.reduce((sum: number, e: any) => sum + e.salary, 0)
        : employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);

    const totalAdjustments = targetCycle.adjustments.reduce((sum, adj) => {
        return sum + (adj.type === 'Bonus' ? adj.amount : -adj.amount);
    }, 0);

    // For snapshot, totalPayout is pre-calculated but we can re-sum to be safe
    const totalPayout = snapshotData
        ? targetCycle.snapshot!.totalPayout
        : totalBaseSalary + totalAdjustments;

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredEmployees.map((e: any) => e.id));
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

    const handleApplyAdjustment = (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        bulkPayrollAdjustment(empIds, type, amount, reason);
        // Clear main table selection if any, as the modal might have handled it or it's done now.
        setSelectedIds([]);
    };

    const getEmployeeNet = (empId: string, baseSalary: number) => {
        if (snapshotData) {
            const snapEmp = snapshotData.employees.find((e: any) => e.id === empId);
            return snapEmp ? snapEmp.netPay : 0;
        }
        const empAdjustments = targetCycle.adjustments.filter(a => a.empId === empId);
        const totalAdj = empAdjustments.reduce((sum, adj) => sum + (adj.type === 'Bonus' ? adj.amount : -adj.amount), 0);
        return baseSalary + totalAdj;
    };

    const formatNaira = (amount: number) => '₦' + amount.toLocaleString('en-NG');

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>

                    {/* Tabs */}
                    <div className="flex items-center gap-4 mt-4 border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'payment'
                                ? 'text-brand-600 border-b-2 border-brand-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Payment Execution
                        </button>
                        <button
                            onClick={() => setActiveTab('structure')}
                            className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'structure'
                                ? 'text-brand-600 border-b-2 border-brand-600'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Salary Structures
                        </button>
                    </div>

                    {activeTab === 'payment' ? (
                        <>
                            <div className="flex items-center gap-3 mt-4">
                                {/* Year Selector */}
                                {/* Year Selector */}
                                <Select
                                    value={selectedYear.toString()}
                                    onChange={(val: string) => setSelectedYear(Number(val))}
                                    options={[
                                        { value: initialYear.toString(), label: initialYear.toString() },
                                        { value: (initialYear - 1).toString(), label: (initialYear - 1).toString() },
                                        { value: (initialYear - 2).toString(), label: (initialYear - 2).toString() }
                                    ]}
                                    className="min-w-[100px]"
                                />
                                <span className="text-slate-300">|</span>
                                <Select
                                    value={viewCycleId}
                                    onChange={(val: string) => setViewCycleId(val)}
                                    options={availableCycles.map(cycle => ({ value: cycle.id, label: cycle.month }))}
                                    className="min-w-[150px]"
                                />
                                <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase ${targetCycle.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                    targetCycle.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                    {targetCycle.status}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="mt-6">
                            <SalarySettings />
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    {activeTab === 'payment' && (
                        <>
                            {currentUserRole !== 'FINANCE_ADMIN' && (
                                <button
                                    onClick={() => setShowAdjustmentModal(true)}
                                    disabled={!isCurrentCycle || payrollStatus.status === 'Paid' || payrollStatus.status === 'Approved'}
                                    className="btn-secondary"
                                >
                                    <Plus size={18} />
                                    {selectedIds.length > 0 ? `Adjust Selected (${selectedIds.length})` : 'New Adjustment'}
                                </button>
                            )}

                            {(payrollStatus.status !== 'Paid' && isCurrentCycle) && (
                                <>
                                    {/* COO Review Button */}
                                    {(currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'COO') && payrollStatus.status === 'Draft' && (
                                        <button
                                            onClick={() => showConfirm({
                                                title: 'Review Payroll',
                                                message: 'Mark this payroll as reviewed and ready for CFO approval?',
                                                onConfirm: cooReviewPayroll
                                            })}
                                            className="btn-primary"
                                        >
                                            <Check size={18} />
                                            COO Review
                                        </button>
                                    )}

                                    {/* CFO Approval Button */}
                                    {(currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'FINANCE_ADMIN') && payrollStatus.status === 'Reviewed' && (
                                        <button
                                            onClick={() => showConfirm({
                                                title: 'Approve Payroll',
                                                message: 'Approve this payroll and generate snapshot for payment execution?',
                                                onConfirm: cfoApprovePayroll
                                            })}
                                            className="btn-success"
                                        >
                                            <Check size={18} />
                                            CFO Approve
                                        </button>
                                    )}

                                    {/* Finance/Super Admin Payment Execution Link */}
                                    {(currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'FINANCE_ADMIN' || currentUserRole === 'COO') && payrollStatus.status === 'Approved' && (
                                        <a
                                            href="/admin/finance"
                                            className="btn-accent flex items-center gap-2"
                                        >
                                            <Wallet size={18} />
                                            Go to Finance Ledger
                                        </a>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {activeTab === 'payment' && (
                <>
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



                    {/* Employee Table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-6 py-4 w-10">
                                            <input
                                                type="checkbox"
                                                aria-label="Select All Employees"
                                                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                                                onChange={e => handleSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        <th className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                Employee
                                                <select
                                                    value={filterDept}
                                                    onChange={e => setFilterDept(e.target.value)}
                                                    className="ml-auto bg-transparent border-none text-xs font-bold text-slate-500 focus:ring-0 cursor-pointer p-0 w-24 text-right"
                                                    title="Filter by Department"
                                                >
                                                    <option value="All">All Depts</option>
                                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4">
                                            <select
                                                value={filterRole}
                                                onChange={e => setFilterRole(e.target.value)}
                                                className="bg-transparent border-none text-xs font-bold text-slate-500 uppercase focus:ring-0 cursor-pointer p-0 w-full"
                                                title="Filter by Role"
                                            >
                                                <option value="All">All Roles</option>
                                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </th>
                                        <th className="px-6 py-3">
                                            <select
                                                value={filterType}
                                                onChange={e => setFilterType(e.target.value)}
                                                className="bg-transparent border-none text-xs font-bold text-slate-500 uppercase focus:ring-0 cursor-pointer p-0 w-full"
                                                title="Filter by Type"
                                            >
                                                <option value="All">All Types</option>
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Intern">Intern</option>
                                            </select>
                                        </th>
                                        <th className="px-6 py-3 text-right">Base Salary</th>
                                        <th className="px-6 py-3 text-right">Adjustments</th>
                                        <th className="px-6 py-3 text-right">Net Payable</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map(emp => {
                                            const adjustments = targetCycle.adjustments.filter(a => a.empId === emp.id);
                                            const net = getEmployeeNet(emp.id, emp.salary || 0);
                                            const isSelected = selectedIds.includes(emp.id);

                                            return (
                                                <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`Select ${emp.name}`}
                                                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                            checked={isSelected}
                                                            onChange={e => handleSelectOne(emp.id, e.target.checked)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 font-medium text-slate-900">{emp.name}</td>
                                                    <td className="px-6 py-3 text-sm text-slate-500">{emp.title}</td>
                                                    <td className="px-6 py-3 text-xs">
                                                        <span className={`px-2 py-1 rounded border ${emp.employmentType === 'Full-time' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                                                            }`}>
                                                            {emp.employmentType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-mono text-slate-600 text-sm">
                                                        {formatNaira(emp.salary || 0)}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
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
                                                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                                                        {formatNaira(net)}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {(currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'HR_ADMIN' || currentUserRole === 'MANAGEMENT_ADMIN') && (
                                                            <button
                                                                onClick={() => {
                                                                    const fullEmployee = employees.find(e => e.id === emp.id);
                                                                    if (fullEmployee) setEditingSalaryEmployee(fullEmployee);
                                                                }}
                                                                className="btn-ghost btn-icon text-slate-400 hover:text-brand-600 hover:bg-brand-50"
                                                                title="Edit Salary"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                                No employees match your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                                    <tr>
                                        <td colSpan={5} className="px-6 py-3 text-slate-900">Total (All Employees)</td>
                                        <td className="px-6 py-3 text-right text-slate-900">{totalAdjustments !== 0 ? formatNaira(totalAdjustments) : '-'}</td>
                                        <td className="px-6 py-3 text-right text-slate-900 text-lg">{formatNaira(totalPayout)}</td>
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

                    {/* Salary Edit Modal */}
                    {
                        editingSalaryEmployee && (
                            <SalaryEditModal
                                employee={editingSalaryEmployee}
                                onClose={() => setEditingSalaryEmployee(null)}
                                onSave={(newSalary, reason, effectiveDate) => {
                                    updateEmployeeSalary(editingSalaryEmployee.id, newSalary, reason, effectiveDate);
                                    setEditingSalaryEmployee(null);
                                }}
                            />
                        )
                    }
                </>
            )}
        </div >
    );
};
