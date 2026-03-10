import React, { useState, useMemo } from 'react';
import { X, Filter, Check, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Employee } from '@/types';

interface PayrollAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => void;
    employees: Employee[];
    initialSelectedIds?: string[];
}

type FilterServiceLength = 'All' | '< 1 Year' | '1 - 3 Years' | '> 3 Years';

export const PayrollAdjustmentModal: React.FC<PayrollAdjustmentModalProps> = ({ isOpen, onClose, onApply, employees, initialSelectedIds = [] }) => {
    const [step, setStep] = useState<'selection' | 'details' | 'review'>('selection');

    // Filters
    const [filterDept, setFilterDept] = useState<string>('All');
    const [filterType, setFilterType] = useState<string>('All');
    const [filterService, setFilterService] = useState<FilterServiceLength>('All');

    // Selection
    const [selectionMode, setSelectionMode] = useState<'manual' | 'all_filtered'>(initialSelectedIds.length > 0 ? 'manual' : 'manual');
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

    // Reset or Sync when opening
    React.useEffect(() => {
        if (isOpen) {
            setSelectedIds(initialSelectedIds);
            setSelectionMode('manual'); // Default to manual if we have specific IDs, or just default.
            setStep('selection');
        }
    }, [isOpen, initialSelectedIds]);

    // Adjustment Details
    const [adjustment, setAdjustment] = useState({
        type: 'Bonus' as 'Bonus' | 'Fine' | 'Deduction',
        amount: 0,
        reason: ''
    });

    // Derived Data for Filters
    const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department_id))), [employees]);

    // Filtering Logic
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchDept = filterDept === 'All' || emp.department_id === filterDept;
            const matchType = filterType === 'All' || emp.employment_type === filterType;

            let matchService = true;
            if (filterService !== 'All' && emp.joinedAt) {
                const joined = new Date(emp.joinedAt);
                const now = new Date();
                const diffYears = (now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365);

                if (filterService === '< 1 Year') matchService = diffYears < 1;
                else if (filterService === '1 - 3 Years') matchService = diffYears >= 1 && diffYears <= 3;
                else if (filterService === '> 3 Years') matchService = diffYears > 3;
            }

            return matchDept && matchType && matchService && emp.status === 'active';
        });
    }, [employees, filterDept, filterType, filterService]);

    // Logic for "Targeted Employees"
    const targetedEmployees = useMemo(() => {
        if (selectionMode === 'all_filtered') return filteredEmployees;
        return employees.filter(e => selectedIds.includes(e.employee_id));
    }, [selectionMode, filteredEmployees, selectedIds, employees]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredEmployees.map(e => e.employee_id));
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

    const handleConfirm = () => {
        onApply(targetedEmployees.map(e => e.employee_id), adjustment.type, adjustment.amount, adjustment.reason);
        onClose();
    };

    const formatNaira = (val: number) => '₦' + val.toLocaleString('en-NG');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Apply Payroll Adjustment</h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'selection' ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>1</span>
                            <span>Selection</span>
                            <div className="w-4 h-px bg-slate-300"></div>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'details' ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>2</span>
                            <span>Details</span>
                            <div className="w-4 h-px bg-slate-300"></div>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 'review' ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>3</span>
                            <span>Review</span>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">

                    {/* STEP 1: SELECTION */}
                    {step === 'selection' && (
                        <div className="flex flex-col h-full">
                            {/* Filter Bar */}
                            <div className="p-4 border-b border-slate-100 bg-white flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mr-2">
                                    <Filter size={16} /> Filters:
                                </div>
                                <select aria-label="Filter by department" value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-sm border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-brand-500">
                                    <option value="All">All Departments</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select aria-label="Filter by employment type" value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-brand-500">
                                    <option value="All">All Types</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Intern">Intern</option>
                                </select>
                                <select aria-label="Filter by service length" value={filterService} onChange={e => setFilterService(e.target.value as FilterServiceLength)} className="text-sm border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-brand-500">
                                    <option value="All">Any Service Length</option>
                                    <option value="< 1 Year">Less than 1 Year</option>
                                    <option value="1 - 3 Years">1 - 3 Years</option>
                                    <option value="> 3 Years">Over 3 Years</option>
                                </select>
                            </div>

                            {/* Mode Toggle */}
                            <div className="bg-brand-50/50 p-2 text-center text-sm border-b border-brand-100">
                                <div className="inline-flex bg-white rounded-lg p-1 border border-brand-100 shadow-sm">
                                    <button
                                        onClick={() => setSelectionMode('manual')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectionMode === 'manual' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        Manual Selection
                                    </button>
                                    <button
                                        onClick={() => setSelectionMode('all_filtered')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${selectionMode === 'all_filtered' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        All Filtered ({filteredEmployees.length})
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-xs uppercase font-bold text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    aria-label="Select all employees"
                                                    checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                                                    onChange={e => handleSelectAll(e.target.checked)}
                                                    disabled={selectionMode === 'all_filtered'}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                                                />
                                            </th>
                                            <th className="px-6 py-3">Employee</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEmployees.map(emp => {
                                            const isSelected = selectionMode === 'all_filtered' || selectedIds.includes(emp.employee_id);
                                            return (
                                                <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}>
                                                    <td className="px-6 py-3">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`Select ${emp.name}`}
                                                            checked={isSelected}
                                                            onChange={e => handleSelectOne(emp.employee_id, e.target.checked)}
                                                            disabled={selectionMode === 'all_filtered'}
                                                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-3 font-medium text-slate-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                                                <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div>{emp.name}</div>
                                                                <div className="text-xs text-slate-500">{emp.department_id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-slate-500">{emp.role}</td>
                                                    <td className="px-6 py-3 text-sm text-slate-500">
                                                        {emp.joinedAt ? new Date(emp.joinedAt).toLocaleDateString() : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredEmployees.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-500 italic">No employees match the current filters.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 'details' && (
                        <div className="p-8 max-w-2xl mx-auto w-full">
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                                <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">Adjustment Details</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="adj-type" className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                        <select
                                            id="adj-type"
                                            value={adjustment.type}
                                            onChange={e => setAdjustment({ ...adjustment, type: e.target.value as 'Bonus' | 'Fine' | 'Deduction' })}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        >
                                            <option value="Bonus">Bonus (+)</option>
                                            <option value="Fine">Fine (-)</option>
                                            <option value="Deduction">Deduction (-)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="adj-amount" className="block text-sm font-bold text-slate-700 mb-1">Amount (₦)</label>
                                        <input
                                            id="adj-amount"
                                            type="number"
                                            min="0"
                                            value={adjustment.amount || ''}
                                            onChange={e => setAdjustment({ ...adjustment, amount: Number(e.target.value) })}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="adj-reason" className="block text-sm font-bold text-slate-700 mb-1">Reason <span className="text-red-500">*</span></label>
                                    <input
                                        id="adj-reason"
                                        type="text"
                                        value={adjustment.reason}
                                        onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                        placeholder="e.g. End of Year Performance Bonus"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">This reason will appear on the employee's payslip.</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <div>
                                        <strong>Note:</strong> You are applying this adjustment to <span className="font-bold">{targetedEmployees.length}</span> employees.
                                        Calculate total impact carefully.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 'review' && (
                        <div className="p-8 max-w-2xl mx-auto w-full">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700">
                                    Summary Overview
                                </div>
                                <div className="p-6 grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Impact</div>
                                        <div className={`text-3xl font-bold ${adjustment.type === 'Bonus' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {adjustment.type === 'Bonus' ? '+' : '-'}{formatNaira(targetedEmployees.length * adjustment.amount)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Affected Employees</div>
                                        <div className="text-3xl font-bold text-slate-900">{targetedEmployees.length}</div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Adjustment per employee:</span>
                                    <span className="font-mono font-medium text-slate-900">{formatNaira(adjustment.amount)} ({adjustment.type})</span>
                                </div>
                            </div>

                            <div className="text-sm text-slate-500 mb-2 font-medium">Sample of affected employees:</div>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                                <ul className="divide-y divide-slate-100">
                                    {targetedEmployees.slice(0, 5).map(emp => (
                                        <li key={emp.id} className="px-4 py-2 flex justify-between items-center text-sm">
                                            <span className="text-slate-900">{emp.name}</span>
                                            <span className="text-slate-400 text-xs">{emp.id}</span>
                                        </li>
                                    ))}
                                    {targetedEmployees.length > 5 && (
                                        <li className="px-4 py-2 text-xs text-center text-slate-400 italic">
                                            ...and {targetedEmployees.length - 5} others
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-100 bg-gray-50 flex justify-between items-center">
                    {step === 'selection' ? (
                        <div className="text-sm text-slate-500">
                            <strong className="text-slate-900">{targetedEmployees.length}</strong> employees selected
                        </div>
                    ) : (
                        <button
                            onClick={() => setStep(step === 'review' ? 'details' : 'selection')}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    )}

                    <div className="flex gap-3 ml-auto">
                        {step !== 'review' ? (
                            <button
                                onClick={() => setStep(step === 'selection' ? 'details' : 'review')}
                                disabled={targetedEmployees.length === 0 || (step === 'details' && (!adjustment.reason || adjustment.amount <= 0))}
                                className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next Step <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleConfirm}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold shadow-sm animate-pulse-subtle"
                            >
                                <Check size={16} /> Confirm & Apply
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
