import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Target, TrendingUp, Award, Calendar, Play, X, CheckCircle2 } from 'lucide-react';

export const PerformanceReviewPage: React.FC = () => {
    const { currentUserId, performanceReviews, updatePerformanceReview, reviewCycles } = useAdmin();
    // Sort reviews by date descending
    const myReviews = performanceReviews
        .filter(r => r.employeeId === currentUserId)
        .sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime());

    const activeCycle = reviewCycles.find(c => c.status === 'Active');
    const currentReview = activeCycle ? myReviews.find(r => r.cycleId === activeCycle.id) : null;

    // Determine if user can edit: No review yet OR Revision Requested
    const canEdit = !currentReview || currentReview.status === 'Revision Requested';
    const isReadOnly = !canEdit;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with existing data if available (e.g. for revision)
    const [formData, setFormData] = useState({
        achievements: '',
        challenges: '',
        goals: '',
        rating: 3
    });

    // Populate form when modal opens
    React.useEffect(() => {
        if (isModalOpen && currentReview) {
            const parsed = JSON.parse(currentReview.selfReview || '{}');
            setFormData({
                achievements: parsed.achievements || '',
                challenges: parsed.challenges || '',
                goals: parsed.goals || '',
                rating: currentReview.rating || 3
            });
        } else if (isModalOpen && !currentReview) {
            setFormData({ achievements: '', challenges: '', goals: '', rating: 3 });
        }
    }, [isModalOpen, currentReview]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId || !activeCycle) return;


        // Store structured data as string for now
        const selfReviewJson = JSON.stringify({
            achievements: formData.achievements,
            challenges: formData.challenges,
            goals: formData.goals
        });

        setIsSubmitting(true);
        setTimeout(() => {
            if (!currentReview) return;
            updatePerformanceReview(currentReview.id, {
                selfReview: selfReviewJson,
                rating: formData.rating,
                status: 'Submitted'
            });
            setIsSubmitting(false);
            setIsModalOpen(false);
        }, 800);
    };

    // Calculate stats safely
    const latestReview = myReviews[0];
    const overallRating = latestReview ? latestReview.rating : 'N/A';
    const lastReviewDate = latestReview && latestReview.submittedAt ? new Date(latestReview.submittedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'None';
    const nextReviewDate = activeCycle ? `Due ${new Date(activeCycle.endDate).toLocaleDateString()}` : 'TBD';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Header */}
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Performance & Development</h1>
                        <p className="text-slate-500">Track your professional growth and review history.</p>
                    </div>
                    {activeCycle ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg ${canEdit
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20'
                                : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-slate-50'
                                }`}
                        >
                            {canEdit ? <Play size={18} fill="currentColor" /> : <Award size={18} />}
                            {canEdit ? (currentReview?.status === 'Revision Requested' ? 'Update Self-Evaluation' : 'Start Self-Evaluation') : 'View My Submission'}
                        </button>
                    ) : (
                        <div className="px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-lg border border-slate-200 cursor-not-allowed text-xs uppercase tracking-wide">
                            No Active Cycle
                        </div>
                    )}
                </div>
            </div>

            {/* Status Feedback Card - if Revision Requested or Approved */}
            {currentReview && currentReview.status === 'Revision Requested' && (
                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-900 text-lg">Action Required: Revision Requested</h3>
                        <p className="text-amber-800 mt-1">Your manager has requested updates to your self-evaluation.</p>
                        <div className="mt-3 bg-white/60 p-3 rounded-lg border border-amber-100/50 text-sm font-medium text-amber-900 italic">
                            "{currentReview.managerFeedback}"
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 text-sm font-bold text-amber-700 hover:text-amber-900 underline"
                        >
                            Edit and Resubmit &rarr;
                        </button>
                    </div>
                </div>
            )}

            {/* Approved Feedback Card */}
            {currentReview && currentReview.status === 'Approved' && currentReview.managerFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                        <h3 className="font-bold text-emerald-900 text-lg">Performance Review Completed</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
                            <label className="text-xs font-bold text-emerald-600 uppercase">Manager Feedback</label>
                            <p className="text-slate-700 mt-2 text-sm leading-relaxed">
                                {currentReview.managerFeedback}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm flex flex-col justify-center items-center">
                            <label className="text-xs font-bold text-emerald-600 uppercase mb-2">Manager Rating</label>
                            <div className="text-3xl font-bold text-slate-900">
                                {currentReview.managerRating}<span className="text-lg text-slate-400">/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <Award size={20} />
                        <span className="text-sm font-bold uppercase tracking-wide">Overall Rating</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{overallRating} <span className="text-lg opacity-60 font-normal">/ 5.0</span></div>
                    <div className="text-xs opacity-80">Last Cycle: H2 2025</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                            <Calendar size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Latest Review</span>
                        </div>
                        <div className="font-bold text-slate-900 text-lg">
                            {latestReview ? (reviewCycles.find(c => c.id === latestReview.cycleId)?.title || 'Past Cycle') : 'No History'}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Completed on</span>
                        <span className="font-bold text-slate-700">{lastReviewDate}</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                            <Target size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Next Cycle</span>
                        </div>
                        <div className="font-bold text-slate-900 text-lg">Mid-Year 2026</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Scheduled for</span>
                        <span className="font-bold text-slate-700">{nextReviewDate}</span>
                    </div>
                </div>
            </div>

            {/* Performance History List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-slate-400" />
                        Review History
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {myReviews.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300 mb-3">
                                <Award size={32} />
                            </div>
                            <h3 className="text-slate-900 font-bold">No reviews found</h3>
                            <p className="text-slate-500 text-sm mt-1">You haven't completed any performance reviews yet.</p>
                        </div>
                    ) : (
                        myReviews.map((review) => {
                            const cycle = reviewCycles.find(c => c.id === review.cycleId);
                            const cycleTitle = cycle ? cycle.title : 'Unknown Cycle';
                            const selfRating = review.rating?.toFixed(1) || 'N/A';
                            const managerRating = review.managerRating ? review.managerRating.toFixed(1) : '-';

                            return (
                                <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg hidden sm:block">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{cycleTitle}</h4>
                                            <p className="text-xs text-slate-500 mt-1">Submitted: {new Date(review.submittedAt || '').toLocaleDateString()}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${review.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    review.status === 'Submitted' || review.status === 'Under Review' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                                        review.status === 'Revision Requested' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                            'bg-slate-50 text-slate-600'
                                                    }`}>
                                                    {review.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 text-right">
                                        <div>
                                            <div className="text-xl font-bold text-slate-900">{selfRating}</div>
                                            <div className="text-xs text-slate-400">Self Rating</div>
                                        </div>
                                        {review.status === 'Approved' && (
                                            <div>
                                                <div className="text-xl font-bold text-emerald-600">{managerRating}</div>
                                                <div className="text-xs text-slate-400">Manager Rating</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Self-Evaluation Modal */}
            {isModalOpen && activeCycle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setIsModalOpen(false)}
                    />

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50 shrink-0">
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">
                                    {isReadOnly ? 'My Self Evaluation' : 'Self Evaluation Form'}
                                </h3>
                                <p className="text-xs text-slate-500">{activeCycle.title}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} aria-label="Close modal" className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Rating */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-sm font-bold text-slate-900 mb-3">Overall Self Rating</label>
                                <div className="flex items-center gap-4">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            type="button"
                                            disabled={isReadOnly}
                                            onClick={() => setFormData({ ...formData, rating: score })}
                                            aria-label={`Rate ${score} out of 5`}
                                            className={`
                                                w-10 h-10 rounded-full font-bold text-lg flex items-center justify-center transition-all
                                                ${formData.rating === score
                                                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-200 scale-110'
                                                    : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'}
                                                ${isReadOnly ? 'cursor-default opacity-80' : ''}
                                            `}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                    <span className="text-sm text-slate-500 font-medium ml-2">
                                        {formData.rating === 1 ? 'Needs Improvement' :
                                            formData.rating === 5 ? 'Exceptional' : 'Good'}
                                    </span>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="achievements" className="block text-sm font-bold text-slate-700 mb-1">Key Achievements</label>
                                    <p className="text-xs text-slate-400 mb-2">What were your biggest wins this cycle?</p>
                                    <textarea
                                        id="achievements"
                                        disabled={isReadOnly}
                                        required
                                        rows={4}
                                        value={formData.achievements}
                                        onChange={e => setFormData({ ...formData, achievements: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600"
                                        placeholder="I successfully delivered..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="challenges" className="block text-sm font-bold text-slate-700 mb-1">Challenges Faced</label>
                                    <p className="text-xs text-slate-400 mb-2">What obstacles did you encounter and how did you handle them?</p>
                                    <textarea
                                        id="challenges"
                                        disabled={isReadOnly}
                                        required
                                        rows={3}
                                        value={formData.challenges}
                                        onChange={e => setFormData({ ...formData, challenges: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600"
                                        placeholder="The main challenge was..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="goals" className="block text-sm font-bold text-slate-700 mb-1">Goals for Next Cycle</label>
                                    <textarea
                                        id="goals"
                                        disabled={isReadOnly}
                                        required
                                        rows={3}
                                        value={formData.goals}
                                        onChange={e => setFormData({ ...formData, goals: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-600"
                                        placeholder="I plan to learn..."
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-white transition-colors"
                            >
                                Close
                            </button>
                            {!isReadOnly && (
                                <button
                                    onClick={(e) => handleSubmit(e as any)}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Submitting...' : (currentReview?.status === 'Revision Requested' ? 'Resubmit Evaluation' : 'Submit Evaluation')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
