import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Target, CheckCircle, Clock } from 'lucide-react';

export const PerformanceReviewPage: React.FC = () => {
    const { currentUserId, reviewCycles, performanceReviews, submitSelfReview } = useAdmin();
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

    // Form State
    const [rating, setRating] = useState(3);
    const [selfReviewText, setSelfReviewText] = useState('');

    const activeCycles = reviewCycles.filter(c => c.status === 'Active');

    // Check if already submitted for a cycle
    const hasSubmitted = (cycleId: string) => {
        return performanceReviews.some(r => r.cycleId === cycleId && r.employeeId === currentUserId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCycleId || !currentUserId) return;

        submitSelfReview({
            employeeId: currentUserId,
            cycleId: selectedCycleId,
            selfReview: selfReviewText,
            rating: rating
        });

        // Reset
        setSelectedCycleId(null);
        setSelfReviewText('');
        setRating(3);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Performance Reviews</h1>
                <p className="text-slate-500">Complete your self-evaluations for active review cycles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Cycles List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Target size={20} className="text-indigo-600" />
                        Active Cycles
                    </h3>
                    {activeCycles.length === 0 ? (
                        <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500">
                            No active review cycles at this time.
                        </div>
                    ) : (
                        activeCycles.map(cycle => {
                            const submitted = hasSubmitted(cycle.id);
                            return (
                                <div key={cycle.id} className={`p-5 rounded-xl border ${selectedCycleId === cycle.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'} transition-all`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{cycle.title}</h4>
                                            <p className="text-sm text-slate-500">Due: {new Date(cycle.endDate).toLocaleDateString()}</p>
                                        </div>
                                        {submitted ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                <CheckCircle size={12} /> Completed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                                <Clock size={12} /> Pending
                                            </span>
                                        )}
                                    </div>

                                    {!submitted && (
                                        <button
                                            onClick={() => setSelectedCycleId(cycle.id)}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${selectedCycleId === cycle.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            {selectedCycleId === cycle.id ? 'Starting Review...' : 'Start Self-Review'}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Review Form */}
                {selectedCycleId && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 relative">
                        <h3 className="font-bold text-lg mb-4">Self-Assessment</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Reflect on your achievements and areas for improvement
                                </label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="I successfully delivered..."
                                    value={selfReviewText}
                                    onChange={e => setSelfReviewText(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Overall Rating (1-5)
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        value={rating}
                                        onChange={e => setRating(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="font-bold text-xl text-indigo-600 w-8">{rating}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Needs Improvement</span>
                                    <span>Exceeds Expectations</span>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold transition-transform active:scale-95">
                                    Submit Review
                                </button>
                                <button type="button" onClick={() => setSelectedCycleId(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 rounded-lg font-bold">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
