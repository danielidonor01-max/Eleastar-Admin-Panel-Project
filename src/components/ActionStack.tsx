import React, { useState } from 'react';
import { MapPin, Phone, ChevronDown, Check } from 'lucide-react';
import { useFeedback } from '../context/FeedbackContext';

export const ActionStack: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [reported, setReported] = useState(false);
    const { showInfo } = useFeedback();

    return (
        <div className="px-6 py-8 space-y-4 max-w-md mx-auto w-full">
            {/* Primary Action */}
            <div className="relative z-10">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-[#0B1229] hover:bg-[#151e3f] text-white font-medium py-4 px-6 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-between transition-all active:scale-[0.98]"
                >
                    <span>Return this ID card</span>
                    <ChevronDown className={`transition-transform duration-300 text-white/70 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
                        <a href="tel:+2348000000000" className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center">
                                <Phone size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-slate-900">Call Security</div>
                                <div className="text-xs text-slate-500">Available 24/7</div>
                            </div>
                        </a>

                        <button onClick={() => showInfo({ title: 'Opening Maps', message: 'Redirecting to HQ location...' })} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center">
                                <MapPin size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-slate-900">Drop off at HQ</div>
                                <div className="text-xs text-slate-500">VI, Lagos State</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Secondary Action */}
            <div className="text-center pt-2">
                {!reported ? (
                    <button
                        onClick={() => setReported(true)}
                        className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 w-full py-2"
                    >
                        Report invalid or misused ID
                    </button>
                ) : (
                    <div className="text-sm text-emerald-600 font-medium flex items-center justify-center gap-2 py-2 bg-emerald-50 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                        <Check size={16} /> Report submitted
                    </div>
                )}
            </div>
        </div>
    );
};
