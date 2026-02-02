import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Calendar, Clock, CheckCircle, Plus, X, AlertCircle } from 'lucide-react';

export const LeavePage: React.FC = () => {
    const { currentUserId, employees, leaveRequests, requestLeave } = useAdmin();
    const currentUser = employees.find(e => e.id === currentUserId);
    const myRequests = leaveRequests.filter(r => r.employeeId === currentUserId).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Annual',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!currentUser) return <div>Loading...</div>;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId) return;

        setIsSubmitting(true);
        // Simulate network delay for "State Visibility"
        setTimeout(() => {
            // Calculate days (simple approximation)
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            requestLeave(currentUserId, {
                type: formData.type as any,
                startDate: formData.startDate,
                endDate: formData.endDate,
                days: days > 0 ? days : 1, // Fallback
                reason: formData.reason
            });

            setIsSubmitting(false);
            setIsModalOpen(false);
            setFormData({ type: 'Annual', startDate: '', endDate: '', reason: '' });
        }, 800);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
                    <p className="text-slate-500">Overview of your leave balance and history.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-900/20"
                >
                    <Plus size={20} />
                    Request Leave
                </button>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mb-3">
                        <Calendar size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Annual Leave</h3>
                    <div className="text-3xl font-bold text-blue-700 mt-1">{currentUser.leaveBalance?.annual || 0}</div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Days Remaining</p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mb-3">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Sick Leave</h3>
                    <div className="text-3xl font-bold text-emerald-700 mt-1">{currentUser.leaveBalance?.sick || 0}</div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Days Remaining</p>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mb-3">
                        <CheckCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Total Used</h3>
                    <div className="text-3xl font-bold text-purple-700 mt-1">{currentUser.leaveBalance?.used || 0}</div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-1">Days Taken</p>
                </div>
            </div>

            {/* Request History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Leave History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Dates</th>
                                <th className="px-6 py-3">Duration</th>
                                <th className="px-6 py-3 text-center">Status</th>
                                <th className="px-6 py-3">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No leave history available.</td>
                                </tr>
                            ) : (
                                myRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{req.type}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {req.startDate} <span className="text-slate-300 mx-1">→</span> {req.endDate}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{req.days} days</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                req.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Leave Request Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => !isSubmitting && setIsModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 text-lg">New Leave Request</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Leave Type</label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                                    disabled={isSubmitting}
                                >
                                    <option value="Annual">Annual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Maternity">Maternity Leave</option>
                                    <option value="Paternity">Paternity Leave</option>
                                    <option value="Unpaid">Unpaid Leave</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Please provide a reason for your leave request..."
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow resize-none"
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Info Banner */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-sm text-blue-700">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>Your request will be sent to your line manager for approval. You will be notified via email once processed.</p>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
