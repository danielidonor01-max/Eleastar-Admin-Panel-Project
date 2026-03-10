import React, { useState, useMemo, useEffect } from 'react';
import { Check, AlertCircle, Plus, Wallet, Edit2 } from 'lucide-react';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { usePayrollStore } from '@/stores/usePayrollStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConfirmStore } from '@/stores/useConfirmStore';
import { PayrollAdjustmentModal } from '@/components/PayrollAdjustmentModal';
import { SalaryEditModal } from '@/components/SalaryEditModal';
import { generatePastCycles } from '@/utils/payrollUtils';
import { Select } from '@/components/Select';
import type { Adjustment, Employee, PayrollCycle, PayrollEmployee } from '@/types';

export const PayrollPage = () => {
    const {employees, updateEmployeeSalary} = useEmployeeStore();
    const {payrollStatus, bulkPayrollAdjustment, cooReviewPayroll, cfoApprovePayroll, refreshPayroll} = usePayrollStore();
    const {rolePermissions, currentUserRole} = useAuthStore();
    const {showConfirm} = useConfirmStore();
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [editingSalaryEmployee, setEditingSalaryEmployee] = useState<Employee | null>(null);


    // Selection & Filter State (Main Page)
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filterDept, setFilterDept] = useState<string>('All');
    const [filterRole, setFilterRole] = useState<string>('All');
    const [filterType, setFilterType] = useState<string>('All');



    // Data Fetching
    useEffect(() => {
        refreshPayroll();
    }, [refreshPayroll]);

    // --- Cycle Selection State ---
    const initialYear = useMemo(() => new Date().getFullYear(), []);
    const [selectedYear, setSelectedYear] = useState<number>(initialYear);
    const [viewCycleId, setViewCycleId] = useState<string>('');

    // Dynamic Past Cycles
    const pastCycles = useMemo(() => generatePastCycles(payrollStatus, 24), [payrollStatus]);

    // Filter cycles by selected year
    const availableCycles = useMemo(() => {
        const all = [payrollStatus, ...pastCycles];
        return all.filter((c: PayrollCycle) => c.year === selectedYear);
    }, [payrollStatus, pastCycles, selectedYear]);

    // Set default view cycle when year changes or on mount
    React.useEffect(() => {
        if (availableCycles.length > 0 && !availableCycles.find((c: PayrollCycle) => c.id === viewCycleId)) {
            setViewCycleId(availableCycles[0]?.id || '');
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


    // Derived Data
    const departments = useMemo(() => Array.from(new Set(employees.map((e: Employee) => e.department_id))), [employees]);
    const roles = useMemo(() => Array.from(new Set(employees.map((e: Employee) => e.role_relation?.name))), [employees]);

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

    const filteredEmployees = useMemo(() => {
        const sourceData = displayEmployees as PayrollEmployee[];
        return sourceData.filter((emp: PayrollEmployee) => {

            const liveEmp = employees.find((e: Employee) => e.employee_id === emp.id);
            const dept = liveEmp?.department_id || 'Unassigned';
            const role = liveEmp?.role_relation?.name || 'Unknown';
            const type = liveEmp?.employment_type || 'Full-time';
            // Snapshot employees are by definition eligible at that time.

            const matchDept = filterDept === 'All' || dept === filterDept;
            const matchRole = filterRole === 'All' || role === filterRole;
            const matchType = filterType === 'All' || type === filterType;
            return matchDept && matchRole && matchType;
        });
    }, [displayEmployees, employees, filterDept, filterRole, filterType]);

    const totalBaseSalary = snapshotData
        ? snapshotData.employees.reduce((sum: number, e: PayrollEmployee) => Number(sum) + Number(e.salary || 0), 0)
        : employees.reduce((sum: number, emp: Employee) => Number(sum) + Number(emp.salary || 0), 0);

    const totalAdjustments = targetCycle.adjustments.reduce((sum: number, adj: Adjustment) => {
        return Number(sum) + (adj.type === 'Bonus' ? Number(adj.amount || 0) : -Number(adj.amount || 0));
    }, 0);

    // Re-sum totalPayout securely to avoid string concatenation bugs inherited from legacy snapshots
    const totalPayout = Number(totalBaseSalary) + Number(totalAdjustments);

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredEmployees.map((e: PayrollEmployee) => e.id));
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
            const snapEmp = snapshotData.employees.find((e: PayrollEmployee) => e.id === empId);
            return snapEmp ? snapEmp.netPay : 0;
        }
        const empAdjustments = targetCycle.adjustments.filter((a: Adjustment) => a.empId === empId);
        const totalAdj = empAdjustments.reduce((sum: number, adj: Adjustment) => sum + (adj.type === 'Bonus' ? adj.amount : -adj.amount), 0);
        return baseSalary + totalAdj;
    };

    const formatNaira = (amount: number) => '₦' + amount.toLocaleString('en-NG');


    if (!canAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <AlertCircle size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
                <p>You do not have permission to view the Payroll module.</p>
            </div>
        );
    }


    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>

                    {/* Tabs */}

                    <div className="flex items-center gap-3 mt-4">
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

                </div>
                <div className="flex gap-3">
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
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="font-bold">Employee</div>
                                        <select
                                            value={filterDept}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterDept(e.target.value)}
                                            className="w-full mt-1 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 bg-white"
                                            title="Filter by Department"
                                        >
                                            <option value="All">All Departments</option>
                                            {departments.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="font-bold invisible">Role</div>{/* Hidden to align with left */}
                                        <select
                                            value={filterRole}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRole(e.target.value)}
                                            className="w-full mt-1 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 bg-white cursor-pointer"
                                            title="Filter by Role"
                                        >
                                            <option value="All">All Roles</option>
                                            {roles.map((r: string) => <option key={r} value={r}>{r}</option> as React.ReactElement)}
                                        </select>
                                    </div>
                                </th>
                                <th className="px-6 py-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="font-bold invisible">Type</div>
                                        <select
                                            value={filterType}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                                            className="w-full mt-1 p-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 bg-white cursor-pointer"
                                            title="Filter by Type"
                                        >
                                            <option value="All">All Emp. Types</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Intern">Intern</option>
                                        </select>
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right align-top"><div className="mt-8 font-bold">Base Salary</div></th>
                                <th className="px-6 py-4 text-right align-top"><div className="mt-8 font-bold">Adjustments</div></th>
                                <th className="px-6 py-4 text-right align-top"><div className="mt-8 font-bold">Net Payable</div></th>
                                <th className="px-6 py-4 text-center align-top"><div className="mt-8 font-bold">Actions</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp: PayrollEmployee) => {
                                    const adjustments = targetCycle.adjustments.filter((a: Adjustment) => a.empId === emp.id);
                                    const net = getEmployeeNet(emp.id, emp.salary || 0);
                                    const isSelected = selectedIds.includes(emp.id);

                                    return (
                                        <tr key={emp.id} className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Select ${emp.name}`}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                    checked={isSelected}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectOne(emp.id, e.target.checked)}
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
                                                        {adjustments.map((a: Adjustment, i: number) => (
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
                                                            const fullEmployee = employees.find((e: Employee) => e.employee_id === emp.id);
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
                                <td colSpan={4} className="px-6 py-3 text-slate-900">Total (All Employees)</td>
                                <td className="px-6 py-3 text-right text-slate-900 font-mono text-sm">{formatNaira(totalBaseSalary)}</td>
                                <td className="px-6 py-3 text-right text-slate-900">{totalAdjustments !== 0 ? formatNaira(totalAdjustments) : '-'}</td>
                                <td className="px-6 py-3 text-right text-slate-900 text-lg font-mono">{formatNaira(totalPayout)}</td>
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
                            updateEmployeeSalary(editingSalaryEmployee.employee_id, newSalary, reason, effectiveDate);
                            setEditingSalaryEmployee(null);
                        }}
                    />
                )
            }
        </div >
    );
};
