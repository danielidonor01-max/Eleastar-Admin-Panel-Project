import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CheckCircle, XCircle, Clock, Calendar, User, Filter } from 'lucide-react';

export const LeaveManagement: React.FC = () => {
    const { employees, leaveRequests, approveLeave, rejectLeave } = useAdmin();
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');

    const getEmployeeName = (id: string) => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.name : 'Unknown User';
    };

    const getEmployeeDept = (id: string) => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.department : '-';
    };

    const filteredRequests = leaveRequests.filter(req => {
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
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
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
                                                        onClick={() => approveLeave(req.id)}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => rejectLeave(req.id)}
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
        </div>
    );
};
