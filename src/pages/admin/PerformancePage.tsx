import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Calendar, Plus, User, CheckSquare } from 'lucide-react';

export const PerformancePage: React.FC = () => {
    const {
        reviewCycles,
        performanceReviews,
        employees,
        tasks,
        currentUserId,
        createReviewCycle,
        updatePerformanceReview,
        startReviewCycle,
        submitSelfReview,
        approvePerformanceReview,
        requestRevision,
        refreshReviewCycles
    } = useAdmin();
    const { showError } = useFeedback();
    const [isCreating, setIsCreating] = useState(false);

    // Data Fetching
    useEffect(() => {
        refreshReviewCycles();
    }, [refreshReviewCycles]);

    // Review Logic Data
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({
        managerRating: 0,
        managerFeedback: '',
        internalNotes: '',
        recommendation: 'None' as 'None' | 'Promotion' | 'Salary Increase' | 'Bonus'
    });

    // Self Review State
    const [selfReviewModalOpen, setSelfReviewModalOpen] = useState(false);
    const [selfReviewData, setSelfReviewData] = useState({
        achievements: '',
        challenges: '',
        goals: '',
        rating: 0
    });

    const [newCycleData, setNewCycleData] = useState({
        title: '',
        startDate: '',
        endDate: ''
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createReviewCycle({
            title: newCycleData.title,
            startDate: newCycleData.startDate,
            endDate: newCycleData.endDate
        });
        setIsCreating(false);
        setNewCycleData({ title: '', startDate: '', endDate: '' });
    };

    const handleStartCycle = (id: string) => {
        startReviewCycle(id);
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;

    const openReviewModal = (id: string) => {
        const review = performanceReviews.find(r => r.id === id);
        if (!review) return;

        // Check if Self Review
        if (review.employeeId === currentUserId) {
            // Populate self data if exists (parsing JSON)
            try {
                const parsed = review.selfReview ? JSON.parse(review.selfReview.replace(/\[Self Rating: \d+\/5\]\n\n/, '')) : {};

                setSelfReviewData({
                    achievements: parsed.achievements || '',
                    challenges: parsed.challenges || '',
                    goals: parsed.goals || '',
                    rating: review.rating || 0
                });
            } catch (e) {
                // ignore
            }
            setSelectedReviewId(id);
            setSelfReviewModalOpen(true);
            return;
        }

        // Manager Review
        setSelectedReviewId(id);
        setReviewData({
            managerRating: review.rating || 0,
            managerFeedback: review.managerFeedback || '',
            internalNotes: review.internalNotes || '',
            recommendation: review.recommendation || 'None'
        });
        setReviewModalOpen(true);
    };

    const handleSaveDraft = () => {
        if (!selectedReviewId) return;
        updatePerformanceReview(selectedReviewId, {
            rating: reviewData.managerRating,
            managerFeedback: reviewData.managerFeedback,
            internalNotes: reviewData.internalNotes,
            recommendation: reviewData.recommendation
        });
        setReviewModalOpen(false);
    };

    const handleSubmitSelfReview = () => {
        if (!selectedReviewId) return;
        const reviewString = JSON.stringify({
            achievements: selfReviewData.achievements,
            challenges: selfReviewData.challenges,
            goals: selfReviewData.goals
        });
        submitSelfReview(selectedReviewId, reviewString, selfReviewData.rating);
        setSelfReviewModalOpen(false);
    };

    const handleApprove = () => {
        if (!selectedReviewId) return;
        if (!reviewData.managerFeedback.trim()) {
            showError({ title: 'Validation Error', message: 'Feedback is required before approving.' });
            return;
        }
        approvePerformanceReview(selectedReviewId, {
            rating: reviewData.managerRating,
            managerFeedback: reviewData.managerFeedback,
            recommendation: reviewData.recommendation,
            status: 'Approved',
            reviewedBy: currentUserId || 'system',
            reviewedAt: new Date().toISOString()
        });
        setReviewModalOpen(false);
    };

    const handleRequestRevision = () => {
        if (!selectedReviewId) return;
        if (!reviewData.managerFeedback.trim()) {
            showError({ title: 'Validation Error', message: 'Please provide feedback explaining what needs revision.' });
            return;
        }
        requestRevision(selectedReviewId, reviewData.managerFeedback);
        setReviewModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Performance Management</h1>
                    <p className="text-slate-500">Manage review cycles and track employee progress.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary"
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
                            <label htmlFor="cycleTitle" className="block text-xs font-bold text-indigo-700 mb-1">Cycle Title</label>
                            <input
                                id="cycleTitle"
                                required
                                type="text"
                                placeholder="e.g. Q1 2026 Performance Review"
                                className="w-full border-indigo-200 rounded-lg"
                                value={newCycleData.title}
                                onChange={e => setNewCycleData({ ...newCycleData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-xs font-bold text-indigo-700 mb-1">Start Date</label>
                            <input
                                id="startDate"
                                required
                                type="date"
                                className="w-full border-indigo-200 rounded-lg"
                                value={newCycleData.startDate}
                                onChange={e => setNewCycleData({ ...newCycleData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-xs font-bold text-indigo-700 mb-1">End Date</label>
                            <input
                                id="endDate"
                                required
                                type="date"
                                className="w-full border-indigo-200 rounded-lg"
                                value={newCycleData.endDate}
                                onChange={e => setNewCycleData({ ...newCycleData, endDate: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary">Launch</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="btn-ghost">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Task Performance Leaderboard */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CheckSquare size={20} className="text-brand-600" />
                            Task Completion Metrics
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Real-time tracking of assigned vs. completed tasks per employee.</p>
                    </div>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-4 font-bold">Personnel</th>
                                <th className="p-4 font-bold">Department</th>
                                <th className="p-4 font-bold text-center">Total Tasks</th>
                                <th className="p-4 font-bold text-center">Completed</th>
                                <th className="p-4 font-bold text-right">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                const stats = employees.map(emp => {
                                    const empTasks = tasks.filter(t => t.assignedTo === emp.id);
                                    const total = empTasks.length;
                                    const completed = empTasks.filter(t => t.status === 'Completed').length;
                                    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                                    return { ...emp, totalTasks: total, completedTasks: completed, completionRate: rate };
                                }).filter(stat => stat.totalTasks > 0).sort((a, b) => b.completionRate - a.completionRate);

                                if (stats.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500 italic">No tasks assigned to any personnel yet.</td>
                                        </tr>
                                    );
                                }

                                return stats.map(stat => (
                                    <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-100 hidden sm:flex">
                                                    {stat.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{stat.name}</p>
                                                    <p className="text-xs text-slate-500">{stat.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">{stat.department}</td>
                                        <td className="p-4 text-center font-medium text-slate-900">{stat.totalTasks}</td>
                                        <td className="p-4 text-center text-emerald-600 font-bold">{stat.completedTasks}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${stat.completionRate >= 80 ? 'bg-emerald-500' : stat.completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${stat.completionRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 w-10">{stat.completionRate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Active Cycles */}
            <div className="grid grid-cols-1 gap-6">
                {reviewCycles.map(cycle => {
                    const cycleReviews = performanceReviews.filter(r => r.id === cycle.id);
                    const completionCount = cycleReviews.length;
                    const completionRate = employees.length > 0 ? Math.round((completionCount / employees.length) * 100) : 0;

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

                            {/* Cycle Actions */}
                            {cycle.status === 'Draft' && (
                                <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                                    <p className="text-sm text-indigo-700 font-medium">This cycle is currently in Draft.</p>
                                    <button
                                        onClick={() => handleStartCycle(cycle.id)}
                                        className="btn-primary text-xs py-1.5"
                                    >
                                        Start Cycle & Generate Reviews
                                    </button>
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-100">
                                <div className="h-full bg-indigo-500" style={{ width: `${completionRate}%` }}></div>
                            </div>

                            {/* Reviews List */}
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
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-slate-500">Self-Rating: {review.rating}/5</p>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${review.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                                review.status === 'Revision Requested' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>{review.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-medium text-slate-400 block">
                                                        {new Date(review.submittedAt || '').toLocaleDateString()}
                                                    </span>
                                                    <button
                                                        onClick={() => openReviewModal(review.id)}
                                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-1"
                                                    >
                                                        {review.employeeId === currentUserId && review.status === 'Pending' ? 'Submit Self-Review' :
                                                            review.status === 'Submitted' || review.status === 'Under Review' ? 'Review' : 'View Details'} &rarr;
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Review Modal */}
            {reviewModalOpen && selectedReviewId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">

                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Performance Review</h3>
                                <div className="text-sm text-slate-500">
                                    {getEmployeeName(performanceReviews.find(r => r.id === selectedReviewId)?.employeeId || '')}
                                </div>
                            </div>
                            <button onClick={() => setReviewModalOpen(false)} className="btn-ghost btn-icon text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                &times;
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Employee Self-Review (Read Only) */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Employee Self-Evaluation</h4>
                                {(() => {
                                    const review = performanceReviews.find(r => r.id === selectedReviewId);
                                    if (!review) return null;
                                    const selfReviewData = (() => {
                                        try {
                                            return JSON.parse(review.selfReview || '{}');
                                        } catch {
                                            return {};
                                        }
                                    })();
                                    return (
                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Key Achievements</label>
                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{selfReviewData.achievements || 'No details provided.'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Challenges Faced</label>
                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{selfReviewData.challenges || 'No details provided.'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                <label className="block text-xs font-bold text-slate-500 mb-1">Goals for Next Period</label>
                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{selfReviewData.goals || 'No details provided.'}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                                                <label className="block text-xs font-bold text-slate-500">Self Rating</label>
                                                <span className="font-bold text-indigo-600">{review.rating}/5</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Right: Manager Review Form */}
                            <div className="space-y-6">
                                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Manager Evaluation</h4>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Manager Rating (1-5)</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewData({ ...reviewData, managerRating: star })}
                                                className={`w-10 h-10 rounded-lg font-bold transition-colors ${reviewData.managerRating >= star ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                            >
                                                {star}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="recommendation" className="block text-sm font-bold text-slate-700 mb-2">Recommendation</label>
                                    <select
                                        id="recommendation"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={reviewData.recommendation}
                                        onChange={e => setReviewData({ ...reviewData, recommendation: e.target.value as any })}
                                    >
                                        <option value="None">No Change</option>
                                        <option value="Salary Increase">Salary Increase</option>
                                        <option value="Promotion">Promotion</option>
                                        <option value="Bonus">Bonus</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="feedback" className="block text-sm font-bold text-slate-700 mb-2">Feedback for Employee <span className="text-red-500">*</span></label>
                                    <textarea
                                        id="feedback"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        placeholder="Provide constructive feedback..."
                                        value={reviewData.managerFeedback}
                                        onChange={e => setReviewData({ ...reviewData, managerFeedback: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">This feedback will be visible to the employee after approval.</p>
                                </div>

                                <div>
                                    <label htmlFor="internalNotes" className="block text-sm font-bold text-slate-700 mb-2">Internal Notes</label>
                                    <textarea
                                        id="internalNotes"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-amber-50 border-amber-200"
                                        placeholder="Private notes for HR/Management..."
                                        value={reviewData.internalNotes}
                                        onChange={e => setReviewData({ ...reviewData, internalNotes: e.target.value })}
                                    />
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><User size={12} /> Visible only to Admin/Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestRevision}
                                className="px-4 py-2 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg font-bold transition-colors"
                            >
                                Request Revision
                            </button>
                            <button
                                onClick={handleSaveDraft}
                                className="btn-secondary"
                            >
                                Save Draft
                            </button>
                            <button
                                onClick={handleApprove}
                                className="btn-primary"
                            >
                                Approve & Finalize
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Self Review Modal */}
            {selfReviewModalOpen && selectedReviewId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelfReviewModalOpen(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">Submit Self-Evaluation</h3>
                            <p className="text-sm text-slate-500">Please reflect on your performance for this cycle.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Key Achievements</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={4}
                                    placeholder="What are you most proud of achieving?"
                                    value={selfReviewData.achievements}
                                    onChange={e => setSelfReviewData({ ...selfReviewData, achievements: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Challenges Faced</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="What obstacles did you encounter?"
                                    value={selfReviewData.challenges}
                                    onChange={e => setSelfReviewData({ ...selfReviewData, challenges: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Goals for Next Period</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="What do you want to achieve next?"
                                    value={selfReviewData.goals}
                                    onChange={e => setSelfReviewData({ ...selfReviewData, goals: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Self Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setSelfReviewData({ ...selfReviewData, rating: star })}
                                            className={`w-10 h-10 rounded-lg font-bold transition-colors ${selfReviewData.rating >= star ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {star}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setSelfReviewModalOpen(false)} className="btn-ghost">Cancel</button>
                            <button onClick={handleSubmitSelfReview} className="btn-primary">Submit Evaluation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
