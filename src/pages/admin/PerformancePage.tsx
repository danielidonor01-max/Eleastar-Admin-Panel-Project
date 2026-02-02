import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Calendar, Plus, User } from 'lucide-react';

export const PerformancePage: React.FC = () => {
    const { reviewCycles, performanceReviews, employees, createReviewCycle, updatePerformanceReview, approvePerformanceReview, requestRevision } = useAdmin();
    const [isCreating, setIsCreating] = useState(false);

    // Review Logic Data
    const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({
        managerRating: 0,
        managerFeedback: '',
        internalNotes: '',
        recommendation: 'None' as 'None' | 'Promotion' | 'Salary Increase' | 'Bonus'
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
            status: 'Active',
            startDate: newCycleData.startDate,
            endDate: newCycleData.endDate
        });
        setIsCreating(false);
        setNewCycleData({ title: '', startDate: '', endDate: '' });
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;

    const openReviewModal = (id: string) => {
        const review = performanceReviews.find(r => r.id === id);
        if (review) {
            setSelectedReviewId(id);
            setReviewData({
                managerRating: review.managerRating || 0,
                managerFeedback: review.managerFeedback || '',
                internalNotes: review.internalNotes || '',
                recommendation: review.recommendation || 'None'
            });
            setReviewModalOpen(true);
        }
    };

    const handleSaveDraft = () => {
        if (!selectedReviewId) return;
        updatePerformanceReview(selectedReviewId, reviewData);
        setReviewModalOpen(false);
    };

    const handleApprove = () => {
        if (!selectedReviewId) return;
        if (!reviewData.managerFeedback.trim()) {
            alert('Feedback is required before approving.');
            return;
        }
        approvePerformanceReview(selectedReviewId, reviewData);
        setReviewModalOpen(false);
    };

    const handleRequestRevision = () => {
        if (!selectedReviewId) return;
        if (!reviewData.managerFeedback.trim()) {
            alert('Please provide feedback explaining what needs revision.');
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
                                                        {review.status === 'Submitted' || review.status === 'Under Review' ? 'Review' : 'View Details'} &rarr;
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
            {
                reviewModalOpen && selectedReviewId && (
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
                                <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
                                        const selfReviewData = JSON.parse(review.selfReview || '{}');
                                        return (
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Key Achievements</label>
                                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{selfReviewData.achievements || 'None details provided.'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Challenges Faced</label>
                                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{selfReviewData.challenges || 'None details provided.'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Goals for Next Period</label>
                                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{selfReviewData.goals || 'None details provided.'}</p>
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Recommendation</label>
                                        <select
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Feedback for Employee <span className="text-red-500">*</span></label>
                                        <textarea
                                            rows={4}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="Provide constructive feedback..."
                                            value={reviewData.managerFeedback}
                                            onChange={e => setReviewData({ ...reviewData, managerFeedback: e.target.value })}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">This feedback will be visible to the employee after approval.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Internal Notes</label>
                                        <textarea
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
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
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
                                    className="px-4 py-2 text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg font-bold transition-colors"
                                >
                                    Save Draft
                                </button>
                                <button
                                    onClick={handleApprove}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Approve & Finalize
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
