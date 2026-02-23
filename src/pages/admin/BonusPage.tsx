import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit2, Check, X, Clock, ShieldCheck } from 'lucide-react';
import type { BonusType, BonusRequest } from '../../data/mockData';
import { BonusApprovalModal } from '../../components/BonusApprovalModal';

export function BonusPage() {
    const {
        employees,
        bonusTypes,
        createBonusType,
        updateBonusType,
        requestBonus,
        bonusRequests,
        approveBonus,
        rejectBonus
    } = useAdmin();

    const [activeTab, setActiveTab] = useState<'types' | 'award' | 'requests'>('types');
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    // Approval Modal State
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<BonusRequest | null>(null);

    const handleOpenApproval = (req: BonusRequest) => {
        setSelectedRequest(req);
        setApprovalModalOpen(true);
    };

    // Edit State
    const [editingType, setEditingType] = useState<BonusType | null>(null);
    // Form State (Type)
    const [typeForm, setTypeForm] = useState<Partial<BonusType>>({
        name: '',
        description: '',
        category: 'Individual',
        isTaxable: true,
        requiresApproval: true,
        isActive: true
    });

    const openTypeModal = (type?: BonusType) => {
        if (type) {
            setEditingType(type);
            setTypeForm(type);
        } else {
            setEditingType(null);
            setTypeForm({
                name: '',
                description: '',
                category: 'Individual',
                isTaxable: true,
                requiresApproval: true,
                isActive: true
            });
        }
        setIsTypeModalOpen(true);
    };

    const handleSaveType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingType) {
            await updateBonusType(editingType.id, typeForm);
        } else {
            await createBonusType(typeForm as Omit<BonusType, 'id' | 'tenantId'>);
        }
        setIsTypeModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Bonus & Compensation</h1>
                    <p className="text-slate-500">Manage bonus types and eligibility criteria.</p>
                </div>
                <button
                    onClick={() => openTypeModal()}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition"
                >
                    <Plus size={18} />
                    Add Bonus Type
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('types')}
                        className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'types' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Bonus Types
                        {activeTab === 'types' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('award')}
                        className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'award' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Award Bonus
                        {activeTab === 'award' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'requests' ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        Requests & Approvals
                        {activeTab === 'requests' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 rounded-t-full"></div>}
                    </button>
                </div>
            </div>

            {/* Content - Bonus Types */}
            {activeTab === 'types' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Taxable</th>
                                <th className="px-6 py-4">Approval Req.</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bonusTypes.map(type => (
                                <tr key={type.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{type.name}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs">{type.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.category === 'Global' ? 'bg-purple-100 text-purple-700' :
                                            type.category === 'Group' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            {type.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {type.isTaxable ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-slate-400" />}
                                    </td>
                                    <td className="px-6 py-4">
                                        {type.requiresApproval ? <Check size={16} className="text-orange-500" /> : <X size={16} className="text-slate-400" />}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {type.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openTypeModal(type)}
                                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {bonusTypes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">No bonus types defined.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Content - Award Bonus */}
            {activeTab === 'award' && (
                <AwardBonusPanel
                    employees={employees}
                    bonusTypes={bonusTypes}
                    onRequestBonus={async (empId, typeId, amount, reason) => {
                        await requestBonus(empId, typeId, amount, reason);
                        setActiveTab('requests'); // Switch to requests tab after submission
                    }}
                />
            )}

            {/* Content - Requests */}
            {activeTab === 'requests' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bonusRequests.map(req => {
                                const employee = employees.find(e => e.id === req.employeeId);
                                return (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{employee?.name || req.employeeId}</div>
                                            <div className="text-xs text-slate-500">{employee?.title || 'Unknown Role'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            ₦{req.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                            {req.reason}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(req.requestedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {req.status === 'Approved' && <Check size={12} />}
                                                {req.status === 'Rejected' && <X size={12} />}
                                                {req.status === 'Pending' && <Clock size={12} />}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleOpenApproval(req)}
                                                    className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition shadow-sm"
                                                >
                                                    Review
                                                </button>
                                            )}
                                            {req.status === 'Approved' && req.approvedBy && (
                                                <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                                    <ShieldCheck size={12} /> Approved
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {bonusRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">No bonus requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Approval Modal */}
            {selectedRequest && (
                <BonusApprovalModal
                    isOpen={approvalModalOpen}
                    onClose={() => setApprovalModalOpen(false)}
                    bonusRequest={selectedRequest}
                    onApprove={approveBonus}
                    onReject={rejectBonus}
                />
            )}

            {/* Type Modal */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">{editingType ? 'Edit Bonus Type' : 'New Bonus Type'}</h2>
                            <button onClick={() => setIsTypeModalOpen(false)} aria-label="Close Modal"><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <form onSubmit={handleSaveType} className="space-y-4">
                            <div>
                                <label htmlFor="typeName" className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input
                                    id="typeName"
                                    type="text"
                                    required
                                    value={typeForm.name}
                                    onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="typeDescription" className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    id="typeDescription"
                                    value={typeForm.description}
                                    onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label htmlFor="typeCategory" className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                <select
                                    id="typeCategory"
                                    value={typeForm.category}
                                    onChange={e => setTypeForm({ ...typeForm, category: e.target.value as any })}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="Individual">Individual Performance</option>
                                    <option value="Group">Group/Department</option>
                                    <option value="Global">Company Wide</option>
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={typeForm.isTaxable}
                                        onChange={e => setTypeForm({ ...typeForm, isTaxable: e.target.checked })}
                                        className="text-brand-600 focus:ring-brand-500 rounded"
                                    />
                                    <span className="text-sm text-slate-700">Taxable</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={typeForm.requiresApproval}
                                        onChange={e => setTypeForm({ ...typeForm, requiresApproval: e.target.checked })}
                                        className="text-brand-600 focus:ring-brand-500 rounded"
                                    />
                                    <span className="text-sm text-slate-700">Requires Approval</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={typeForm.isActive}
                                        onChange={e => setTypeForm({ ...typeForm, isActive: e.target.checked })}
                                        className="text-brand-600 focus:ring-brand-500 rounded"
                                    />
                                    <span className="text-sm text-slate-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">Save Type</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

function AwardBonusPanel({ employees, bonusTypes, onRequestBonus }: {
    employees: any[];
    bonusTypes: BonusType[];
    onRequestBonus: (empId: string, typeId: string, amount: number, reason: string) => Promise<void>;
}) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [bonusMode, setBonusMode] = useState<'fixed' | 'percentage'>('fixed');
    const [amount, setAmount] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [reason, setReason] = useState<string>('');

    const handleToggleEmployee = (empId: string) => {
        setSelectedEmployees(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    const handleSelectAll = () => {
        if (selectedEmployees.length === filteredEmployees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(filteredEmployees.map(e => e.id));
        }
    };

    const filteredEmployees = employees; // Show all employees regardless of type selection

    const handleSubmit = async () => {
        if (!reason || selectedEmployees.length === 0) return;
        if (bonusMode === 'fixed' && amount <= 0) return;
        if (bonusMode === 'percentage' && percentage <= 0) return;

        for (const empId of selectedEmployees) {
            let finalAmount = amount;
            if (bonusMode === 'percentage') {
                const emp = employees.find(e => e.id === empId);
                const salary = emp?.salary || 0;
                finalAmount = (salary * percentage) / 100;
            }

            if (finalAmount > 0) {
                await onRequestBonus(empId, selectedType, finalAmount, reason);
            }
        }
        setSelectedEmployees([]);
        setAmount(0);
        setPercentage(0);
        setReason('');
    };

    const totalEstimatedCost = React.useMemo(() => {
        if (bonusMode === 'fixed') {
            return selectedEmployees.length * amount;
        }
        return selectedEmployees.reduce((sum, empId) => {
            const emp = employees.find(e => e.id === empId);
            return sum + ((emp?.salary || 0) * percentage / 100);
        }, 0);
    }, [bonusMode, amount, percentage, selectedEmployees, employees]);

    const isValid = selectedType && selectedEmployees.length > 0 && reason && (
        (bonusMode === 'fixed' && amount > 0) ||
        (bonusMode === 'percentage' && percentage > 0)
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-4 items-center">
                            <select
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 text-sm font-medium text-slate-700 bg-slate-50"
                                aria-label="Select Bonus Type"
                            >
                                <option value="" disabled>Select Bonus Type...</option>
                                {bonusTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="text-sm text-slate-500">
                            {selectedEmployees.length} selected
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                            aria-label="Select all employees"
                                        />
                                    </th>
                                    <th className="px-4 py-3">Employee</th>
                                    {bonusMode === 'percentage' && <th className="px-4 py-3 text-right">Est. Amount</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => {
                                    const estAmount = bonusMode === 'percentage' ? (emp.salary || 0) * percentage / 100 : 0;

                                    return (
                                        <tr key={emp.id} className={`hover:bg-slate-50 transition ${selectedEmployees.includes(emp.id) ? 'bg-brand-50/30' : ''}`}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(emp.id)}
                                                    onChange={() => handleToggleEmployee(emp.id)}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                    aria-label={`Select ${emp.name}`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{emp.name}</div>
                                                <div className="text-xs text-slate-500">{emp.title}</div>
                                            </td>
                                            {bonusMode === 'percentage' && (
                                                <td className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                                                    ₦{estAmount.toLocaleString()}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={bonusMode === 'percentage' ? 3 : 2} className="px-4 py-8 text-center text-slate-500 italic">No employees found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
                    <h3 className="font-bold text-lg text-slate-900">Award Details</h3>

                    {/* Mode Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setBonusMode('fixed')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${bonusMode === 'fixed' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Fixed Amount
                        </button>
                        <button
                            onClick={() => setBonusMode('percentage')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${bonusMode === 'percentage' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            % of Salary
                        </button>
                    </div>

                    <div>
                        <label htmlFor="awardAmount" className="block text-sm font-bold text-slate-700 mb-1">
                            {bonusMode === 'fixed' ? 'Amount per Employee' : 'Percentage of Salary'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400">
                                {bonusMode === 'fixed' ? '₦' : '%'}
                            </span>
                            <input
                                id="awardAmount"
                                type="number"
                                min="0"
                                value={bonusMode === 'fixed' ? amount : percentage}
                                onChange={e => bonusMode === 'fixed' ? setAmount(Number(e.target.value)) : setPercentage(Number(e.target.value))}
                                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="awardReason" className="block text-sm font-bold text-slate-700 mb-1">Reason</label>
                        <textarea
                            id="awardReason"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                            rows={3}
                            placeholder="e.g. Q3 Performance Bonus"
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Selected:</span>
                            <span className="font-medium text-slate-900">{selectedEmployees.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Mode:</span>
                            <span className="font-medium text-slate-900 capitalize">{bonusMode}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
                            <span>Total Cost:</span>
                            <span>₦{totalEstimatedCost.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className="w-full py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
};
