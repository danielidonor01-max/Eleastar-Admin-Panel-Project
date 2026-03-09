import React, { useState, useMemo } from 'react';
import { useEmployeeStore } from '@/stores/useEmployeeStore';
import { usePromotionStore } from '@/stores/usePromotionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useConfirmStore } from '@/stores/useConfirmStore';
import type { PromotionRequest, AdminRole, PromotionEligibilityRule, Employee } from '@/types';
import { CheckCircle, XCircle, Clock, Plus, User, ArrowRight, AlertTriangle, ShieldAlert, Settings } from 'lucide-react';

export const PromotionsPage = () => {
    const promotionRequests = usePromotionStore((s) => s.promotionRequests);
    const employees = useEmployeeStore((s) => s.employees);
    const eligibilityRules = usePromotionStore((s) => s.eligibilityRules);
    const requestPromotion = usePromotionStore((s) => s.requestPromotion);
    const approvePromotion = usePromotionStore((s) => s.approvePromotion);
    const rejectPromotion = usePromotionStore((s) => s.rejectPromotion);
    const saveEligibilityRule = usePromotionStore((s) => s.saveEligibilityRule);
    const evaluateEligibility = usePromotionStore((s) => s.evaluateEligibility);
    const currentUserRole = useAuthStore((s) => s.currentUserRole);
    const currentUserId = useAuthStore((s) => s.currentUserId);
    const showConfirm = useConfirmStore((s) => s.showConfirm);

    const [activeTab, setActiveTab] = useState<'Pending' | 'History' | 'Rules'>('Pending');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<{
        employeeId: string;
        newRole: AdminRole;
        suggestedSalary: number;
        reason: string;
        effectiveDate: string;
    }>({
        employeeId: '',
        newRole: 'USER',
        suggestedSalary: 0,
        reason: '',
        effectiveDate: new Date().toISOString().split('T')[0]
    });

    const [ruleFormData, setRuleFormData] = useState<Partial<PromotionEligibilityRule>>({
        name: '',
        targetRole: 'Global',
        minTimeInRoleMonths: 6,
        minPerformanceRating: 3.0,
        requireCleanRecord: true,
        isActive: true
    });

    // Derived Data
    const canApprove = currentUserRole === 'COO' || currentUserRole === 'SUPER_ADMIN';
    const canRequest = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGEMENT_ADMIN'].includes(currentUserRole);
    const canManageRules = ['SUPER_ADMIN', 'HR_ADMIN'].includes(currentUserRole);

    const filteredRequests = promotionRequests.filter((req: PromotionRequest) => {
        if (activeTab === 'Pending') return req.status === 'Pending';
        if (activeTab === 'History') return req.status !== 'Pending';
        return false;
    }).sort((a: PromotionRequest, b: PromotionRequest) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    // Eligibility Check for Request Form
    const eligibilityCheck = useMemo(() => {
        if (!formData.employeeId) return null;
        return evaluateEligibility(formData.employeeId, formData.newRole);
    }, [formData.employeeId, formData.newRole, evaluateEligibility]);

    const handleEmployeeSelect = (empId: string) => {
        const emp = employees.find((e: Employee) => e.id === empId);
        if (emp) {
            setFormData({
                ...formData,
                employeeId: empId,
                newRole: emp.systemRole, // Default to current
                suggestedSalary: emp.salary
            });
        }
    };

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const emp = employees.find((e: Employee) => e.id === formData.employeeId);
        if (!emp) return;

        requestPromotion({
            employeeId: formData.employeeId,
            currentRole: emp.systemRole,
            newRole: formData.newRole,
            currentSalary: emp.salary,
            proposedSalary: formData.suggestedSalary,
            effectiveDate: formData.effectiveDate,
            reason: formData.reason,
            requestedBy: currentUserId || 'System'
        });
        setIsModalOpen(false);
        setFormData({ employeeId: '', newRole: 'USER', suggestedSalary: 0, reason: '', effectiveDate: '' });
    };

    const handleRuleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveEligibilityRule({
            id: ruleFormData.id || `RULE-${Date.now()}`,
            tenantId: 'tenant-default',
            name: ruleFormData.name || 'New Rule',
            targetRole: ruleFormData.targetRole || 'Global',
            minTimeInRoleMonths: Number(ruleFormData.minTimeInRoleMonths),
            minPerformanceRating: Number(ruleFormData.minPerformanceRating),
            requireCleanRecord: ruleFormData.requireCleanRecord || false,
            isActive: ruleFormData.isActive !== undefined ? ruleFormData.isActive : true
        });
        setIsRuleModalOpen(false);
        setRuleFormData({ name: '', targetRole: 'Global', minTimeInRoleMonths: 6, minPerformanceRating: 3.0, isActive: true });
    };

    const handleApprove = (req: PromotionRequest) => {
        const eligibilityWarning = req.eligibilitySnapshot && !req.eligibilitySnapshot.isEligible
            ? `\n\n⚠️ WARNING: This employee was marked as INELIGIBLE.\nReasons: ${req.eligibilitySnapshot.reasons.join(', ')}`
            : '';

        showConfirm({
            title: 'Approve Promotion',
            message: `Are you sure you want to promote this employee to ${req.newRole} with a salary of ₦${req.proposedSalary.toLocaleString()}?${eligibilityWarning}`,
            confirmLabel: 'Yes, Approve',
            cancelLabel: 'Cancel',
            onConfirm: () => approvePromotion(req.id)
        });
    };

    const handleReject = (req: PromotionRequest) => {
        const reason = prompt("Reason for rejection:");
        if (reason) {
            rejectPromotion(req.id, reason);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promotions & Role Changes</h1>
                    <p className="text-gray-500">Manage career progression and salary adjustments.</p>
                </div>
                <div className="flex gap-2">
                    {canManageRules && (
                        <button
                            onClick={() => { setActiveTab('Rules'); setIsRuleModalOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-50 transition"
                        >
                            <Settings className="w-4 h-4" />
                            Manage Rules
                        </button>
                    )}
                    {canRequest && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200"
                        >
                            <Plus className="w-4 h-4" />
                            Propose Promotion
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
                <button
                    className={`pb-3 px-1 font-medium text-sm ${activeTab === 'Pending' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('Pending')}
                >
                    Pending Approvals
                    {promotionRequests.filter((r: PromotionRequest) => r.status === 'Pending').length > 0 && (
                        <span className="ml-2 bg-brand-100 text-brand-600 px-2 py-0.5 rounded-full text-xs">
                            {promotionRequests.filter((r: PromotionRequest) => r.status === 'Pending').length}
                        </span>
                    )}
                </button>
                <button
                    className={`pb-3 px-1 font-medium text-sm ${activeTab === 'History' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('History')}
                >
                    History
                </button>
                {canManageRules && (
                    <button
                        className={`pb-3 px-1 font-medium text-sm ${activeTab === 'Rules' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('Rules')}
                    >
                        Eligibility Rules
                    </button>
                )}
            </div>

            {/* Rules Content */}
            {activeTab === 'Rules' && canManageRules && (
                <div className="space-y-4">
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-brand-600 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-brand-900">Promotion Eligibility Rules</h3>
                            <p className="text-sm text-brand-700">These rules are advisory. They generate warnings during the promotion request process but do not strictly block promotions, allowing for management discretion.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eligibilityRules.map((rule: PromotionEligibilityRule) => (
                            <div key={rule.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative hover:shadow-md transition">
                                <div className="absolute top-4 right-4">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {rule.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{rule.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">Target: <span className="font-medium text-gray-900">{rule.targetRole}</span></p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Min Tenure:</span>
                                        <span className="font-medium">{rule.minTimeInRoleMonths} months</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Min Rating:</span>
                                        <span className="font-medium">{rule.minPerformanceRating} / 5.0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Clean Record:</span>
                                        <span className="font-medium">{rule.requireCleanRecord ? 'Required' : 'Optional'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setRuleFormData(rule); setIsRuleModalOpen(true); }}
                                    className="mt-4 w-full py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg"
                                >
                                    Edit Rule
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => { setRuleFormData({ name: '', targetRole: 'Global', minTimeInRoleMonths: 6, minPerformanceRating: 3.0, isActive: true }); setIsRuleModalOpen(true); }}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition cursor-pointer h-full min-h-[200px]"
                        >
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="font-medium">Add New Rule</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            {activeTab !== 'Rules' && (
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <User className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No {activeTab.toLowerCase()} requests</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mb-6">
                                {activeTab === 'Pending'
                                    ? "There are no promotion requests waiting for review at this time."
                                    : "No promotion history found."}
                            </p>
                            {canRequest && activeTab === 'Pending' && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-sm font-medium flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nominate Employee
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredRequests.map((req: PromotionRequest) => {
                            const employee = employees.find((e: Employee) => e.id === req.employeeId);
                            const isSalaryIncrease = req.proposedSalary > req.currentSalary;
                            const isEligible = req.eligibilitySnapshot?.isEligible ?? true;

                            return (
                                <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    {/* Employee Info */}
                                    <div className="flex items-center gap-4 min-w-[250px]">
                                        <div className="relative">
                                            <img src={employee?.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                                            {!isEligible && (
                                                <div className="absolute -top-1 -right-1 bg-amber-100 text-amber-600 rounded-full p-0.5 border border-white" title="Marked as Ineligible Exception">
                                                    <AlertTriangle className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{employee?.name || 'Unknown User'}</h3>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <span>{req.currentRole}</span>
                                                <ArrowRight className="w-3 h-3" />
                                                <span className="font-medium text-brand-600">{req.newRole}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Salary Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Salary</p>
                                                <p className="font-medium text-gray-900">₦{req.currentSalary.toLocaleString()}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Proposed Salary</p>
                                                <p className={`font-semibold ${isSalaryIncrease ? 'text-green-600' : 'text-gray-900'}`}>
                                                    ₦{req.proposedSalary.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            <span className="font-medium">Reason: </span>{req.reason}
                                        </div>
                                        {!isEligible && (
                                            <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-start gap-1">
                                                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                                <span>
                                                    <strong>Eligibility Warning:</strong> {req.eligibilitySnapshot?.reasons.join(', ')} (Performance: {req.eligibilitySnapshot?.scores.performance}/5)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                        {req.status === 'Pending' ? (
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-medium">
                                                    <Clock className="w-3 h-3" /> COO Review
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {req.status}
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-400">{new Date(req.requestedAt).toLocaleDateString()}</p>

                                        {req.status === 'Pending' && canApprove && (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleApprove(req)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-6 h-6" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Request Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Propose Promotion</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                <select
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.employeeId}
                                    onChange={e => handleEmployeeSelect(e.target.value)}
                                    aria-label="Select Employee"
                                >
                                    <option value="">Select Employee...</option>
                                    {employees.filter((e: Employee) => e.status === 'active' || e.status === 'probation').map((e: Employee) => (
                                        <option key={e.id} value={e.id}>{e.name} ({e.systemRole})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Eligibility Feedback */}
                            {eligibilityCheck && (
                                <div className={`p-3 rounded-lg border text-sm ${eligibilityCheck.isEligible ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        {eligibilityCheck.isEligible ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                        {eligibilityCheck.isEligible ? 'Eligible for Promotion' : 'Eligibility Warning'}
                                    </div>
                                    {!eligibilityCheck.isEligible && (
                                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                                            {eligibilityCheck.reasons.map((r: string, i: number) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="mt-2 text-xs flex gap-3 text-gray-500">
                                        <span>Performance: <strong>{(eligibilityCheck.scores as { performance?: number }).performance ?? 0} / 5</strong></span>
                                        <span>Tenure: <strong>{(eligibilityCheck.scores as { tenureMonths?: number }).tenureMonths ?? 0} months</strong></span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="newRole" className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                                    <select
                                        id="newRole"
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.newRole}
                                        onChange={e => setFormData({ ...formData, newRole: e.target.value as AdminRole })}
                                    >
                                        {['SUPER_ADMIN', 'MANAGEMENT_ADMIN', 'HR_ADMIN', 'FINANCE_ADMIN', 'TECHNICIAN', 'USER', 'CHIEF_RISK_OFFICER', 'WEB_ADMIN', 'VIEWER'].map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="suggestedSalary" className="block text-sm font-medium text-gray-700 mb-1">New Salary (₦)</label>
                                    <input
                                        id="suggestedSalary"
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.suggestedSalary}
                                        onChange={e => setFormData({ ...formData, suggestedSalary: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                                <input
                                    id="effectiveDate"
                                    type="date"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.effectiveDate}
                                    onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason / Justification</label>
                                <textarea
                                    id="reason"
                                    required
                                    rows={3}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="Explain why this promotion is requested..."
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className={`px-4 py-2 text-white rounded-lg transition ${eligibilityCheck?.isEligible ? 'bg-brand-600 hover:bg-brand-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                                    {eligibilityCheck?.isEligible ? 'Submit Request' : 'Submit as Exception'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rule Modal */}
            {isRuleModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{ruleFormData.id ? 'Edit Eligibility Rule' : 'Create Eligibility Rule'}</h2>
                        <form onSubmit={handleRuleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                                <input
                                    id="ruleName"
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={ruleFormData.name}
                                    onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                                <select
                                    id="targetRole"
                                    required
                                    className="w-full p-2 border rounded-lg"
                                    value={ruleFormData.targetRole}
                                    onChange={e => setRuleFormData({ ...ruleFormData, targetRole: e.target.value as AdminRole })}
                                >
                                    <option value="Global">Global (Fallback)</option>
                                    {['SUPER_ADMIN', 'MANAGEMENT_ADMIN', 'HR_ADMIN', 'FINANCE_ADMIN', 'TECHNICIAN', 'USER', 'CHIEF_RISK_OFFICER', 'WEB_ADMIN', 'VIEWER'].map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="minTenure" className="block text-sm font-medium text-gray-700 mb-1">Min Tenure (Months)</label>
                                    <input
                                        id="minTenure"
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full p-2 border rounded-lg"
                                        value={ruleFormData.minTimeInRoleMonths}
                                        onChange={e => setRuleFormData({ ...ruleFormData, minTimeInRoleMonths: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">Min Rating (1-5)</label>
                                    <input
                                        id="minRating"
                                        type="number"
                                        required
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        className="w-full p-2 border rounded-lg"
                                        value={ruleFormData.minPerformanceRating}
                                        onChange={e => setRuleFormData({ ...ruleFormData, minPerformanceRating: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="requireClean"
                                    checked={ruleFormData.requireCleanRecord}
                                    onChange={e => setRuleFormData({ ...ruleFormData, requireCleanRecord: e.target.checked })}
                                />
                                <label htmlFor="requireClean" className="text-sm text-gray-700">Require Clean Disciplinary Record</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={ruleFormData.isActive}
                                    onChange={e => setRuleFormData({ ...ruleFormData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">Rule Active</label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
