import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';

export const LeavePage: React.FC = () => {
    const { currentUserId, employees, leaveRequests, requestLeave } = useAdmin();
    const currentUser = employees.find(e => e.id === currentUserId);
    const myRequests = leaveRequests.filter(r => r.employeeId === currentUserId).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    const [isRequesting, setIsRequesting] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Annual',
        startDate: '',
        endDate: '',
        days: 1,
        reason: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        requestLeave(currentUserId!, {
            type: formData.type as any,
            startDate: formData.startDate,
            endDate: formData.endDate,
            days: Number(formData.days),
            reason: formData.reason
        });
        setIsRequesting(false);
    };

    if (!currentUser) return <div>Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
                    <p className="text-slate-500">View your balance and request time off.</p>
                </div>
                <button
                    onClick={() => setIsRequesting(!isRequesting)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    New Request
                </button>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3">
                        <Calendar size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Annual Leave</h3>
                    <div className="text-3xl font-bold text-blue-700 mt-1">{currentUser.leaveBalance?.annual || 0}</div>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mt-1">Days Remaining</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Sick Leave</h3>
                    <div className="text-3xl font-bold text-emerald-700 mt-1">{currentUser.leaveBalance?.sick || 0}</div>
                    <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mt-1">Days Remaining</p>
                </div>

                <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-3">
                        <CheckCircle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Total Used</h3>
                    <div className="text-3xl font-bold text-purple-700 mt-1">{currentUser.leaveBalance?.used || 0}</div>
                    <p className="text-xs text-purple-600 font-medium uppercase tracking-wide mt-1">Days Taken</p>
                </div>
            </div>

            {/* Request Form */}
            {isRequesting && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg mb-4">Request Time Off</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg p-2.5"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Annual">Annual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Unpaid">Unpaid Leave</option>
                                    <option value="Maternity">Maternity Leave</option>
                                    <option value="Paternity">Paternity Leave</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Days</label>
                                <input
                                    type="number"
                                    className="w-full border border-slate-300 rounded-lg p-2.5"
                                    min="1"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-slate-300 rounded-lg p-2.5"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-slate-300 rounded-lg p-2.5"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                            <textarea
                                className="w-full border border-slate-300 rounded-lg p-2.5 h-24"
                                placeholder="Describe the reason for your leave..."
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsRequesting(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Request History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900">Request History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">No leave requests found.</td>
                                </tr>
                            ) : (
                                myRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-medium text-slate-800">{req.type}</td>
                                        <td className="p-4 text-slate-600">
                                            {req.startDate} <span className="text-slate-300 mx-1">→</span> {req.endDate}
                                        </td>
                                        <td className="p-4 text-slate-600">{req.days} days</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {req.status === 'Approved' && <CheckCircle size={12} />}
                                                {req.status === 'Rejected' && <XCircle size={12} />}
                                                {req.status === 'Pending' && <Clock size={12} />}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-600 max-w-xs truncate">{req.reason}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
