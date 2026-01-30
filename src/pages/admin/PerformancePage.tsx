import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Calendar, Plus, BarChart2, User } from 'lucide-react';

export const PerformancePage: React.FC = () => {
    const { reviewCycles, performanceReviews, employees, createReviewCycle } = useAdmin();
    const [isCreating, setIsCreating] = useState(false);
    const [auditCycleId, setAuditCycleId] = useState<string | null>(null); // For viewing details

    const [newCycleData, setNewCycleData] = useState({
        title: '',
        startDate: '',
        endDate: ''
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createReviewCycle({
            title: newCycleData.title,
            status: 'Active',
            startDate: newCycleData.startDate,
            endDate: newCycleData.endDate
        });
        setIsCreating(false);
        setNewCycleData({ title: '', startDate: '', endDate: '' });
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Performance Management</h1>
                    <p className="text-slate-500">Manage review cycles and track employee progress.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    New Cycle
                </button>
            </div>

            {/* Create Modal (Simple Inline for MVP) */}
            {isCreating && (
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
                    <h3 className="font-bold text-indigo-900 mb-4">Launch New Review Cycle</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-indigo-700 mb-1">Cycle Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Q1 2026 Performance Review"
                                className="w-full border-indigo-200 rounded-lg"
                                value={newCycleData.title}
                                onChange={e => setNewCycleData({ ...newCycleData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-700 mb-1">Start Date</label>
                            <input
                                required
                                type="date"
                                className="w-full border-indigo-200 rounded-lg"
                                value={newCycleData.startDate}
                                onChange={e => setNewCycleData({ ...newCycleData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-indigo-700 mb-1">End Date</label>
                            <input
                                required
                                type="date"
                                className="w-full border-indigo-200 rounded-lg"
                                value={newCycleData.endDate}
                                onChange={e => setNewCycleData({ ...newCycleData, endDate: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Launch</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Active Cycles */}
            <div className="grid grid-cols-1 gap-6">
                {reviewCycles.map(cycle => {
                    const cycleReviews = performanceReviews.filter(r => r.cycleId === cycle.id);
                    const completionCount = cycleReviews.length;
                    const completionRate = Math.round((completionCount / employees.length) * 100);

                    return (
                        <div key={cycle.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900">{cycle.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cycle.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                            }`}>{cycle.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Calendar size={14} />
                                        {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-900">{completionRate}%</div>
                                    <p className="text-xs text-slate-500 uppercase font-medium">Completion</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-100">
                                <div className="h-full bg-indigo-500" style={{ width: `${completionRate}%` }}></div>
                            </div>

                            {/* Reviews List (Accordion Style - simplified for now) */}
                            <div className="bg-slate-50 p-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <User size={14} />
                                    Submissions ({completionCount})
                                </h4>
                                {completionCount === 0 ? (
                                    <p className="text-sm text-slate-400 italic">No reviews submitted yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {cycleReviews.map(review => (
                                            <div key={review.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {getEmployeeName(review.employeeId).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{getEmployeeName(review.employeeId)}</p>
                                                        <p className="text-xs text-slate-500">Self-Rating: {review.rating}/5</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400">
                                                    {new Date(review.submittedAt || '').toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
