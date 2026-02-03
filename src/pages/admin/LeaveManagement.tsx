import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CheckCircle, XCircle, Clock, User, Filter } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const LeaveManagement: React.FC = () => {
    const { employees, leaveRequests, approveLeave, rejectLeave } = useAdmin();
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
    const location = useLocation();

    // UI State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    // Deep Linking Handler
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const requestId = params.get('requestId');
        if (requestId) {
            const req = leaveRequests.find(r => r.id === requestId);
            if (req) {
                setFilter('All'); // Ensure it's visible regardless of status
                setHighlightedId(requestId);
                // Optional: Scroll to item logic could go here
            }
        }
    }, [location.search, leaveRequests]);

    const handleApprove = (id: string) => {
        setActionError(null);
        const result = approveLeave(id);
        if (!result.success && result.error) {
            setActionError(result.error);
            setTimeout(() => setActionError(null), 5000);
        }
    };

    const handleRejectClick = (id: string) => {
        setSelectedRequestId(id);
        setRejectModalOpen(true);
        setActionError(null);
    };

    const confirmReject = () => {
        if (!selectedRequestId || !rejectionReason.trim()) return;
        rejectLeave(selectedRequestId, rejectionReason);
        setRejectModalOpen(false);
        setRejectionReason('');
        setSelectedRequestId(null);
    };

    const getEmployeeName = (id: string) => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.name : 'Unknown User';
    };

    const getEmployeeDept = (id: string) => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.department : '-';
    };

    const filteredRequests = leaveRequests.filter(req => {
        // If deep linked, we prioritize showing the specific item if intended, 
        // but here 'All' filter with highlight is sufficient.
        if (filter === 'All') return true;
        return req.status === filter;
    }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
                    <p className="text-slate-500">Review and manage employee leave requests.</p>
                </div>
                <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                    {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Feedback */}
            {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                    <XCircle size={18} />
                    <span className="font-bold">{actionError}</span>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{leaveRequests.filter(r => r.status === 'Pending').length}</p>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{leaveRequests.filter(r => r.status === 'Approved').length}</p>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Rejected</p>
                        <p className="text-2xl font-bold text-red-600">{leaveRequests.filter(r => r.status === 'Rejected').length}</p>
                    </div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><XCircle size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Total Requests</p>
                        <p className="text-2xl font-bold text-slate-700">{leaveRequests.length}</p>
                    </div>
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Filter size={20} /></div>
                </div>
            </div>

            {/* Request List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-4">Employee</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">No requests found matching this filter.</td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className={`transition-all duration-500 ${highlightedId === req.id
                                                ? 'bg-brand-50 hover:bg-brand-100 border-l-4 border-l-brand-500 shadow-inner'
                                                : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{getEmployeeName(req.employeeId)}</div>
                                                    <div className="text-xs text-slate-500">{getEmployeeDept(req.employeeId)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-700">{req.type}</td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex flex-col text-xs">
                                                <span>{new Date(req.startDate).toLocaleDateString()}</span>
                                                <span className="text-slate-400">to</span>
                                                <span>{new Date(req.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-900">{req.days} days</td>
                                        <td className="p-4 text-slate-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {req.status === 'Pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(req.id)}
                                                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-900">Reject Leave Request</h3>
                            <p className="text-xs text-slate-500 mt-1">Please provide a reason for this rejection.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Reason</label>
                                <textarea
                                    autoFocus
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-shadow resize-none"
                                    placeholder="e.g. Schedule conflict with project deadline..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setRejectModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={!rejectionReason.trim()}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reject Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
