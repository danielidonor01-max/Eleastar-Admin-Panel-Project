import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { BonusRequest } from '@/types';

interface BonusApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    bonusRequest: BonusRequest;
    onApprove: (requestId: string, pin: string) => Promise<void>;
    onReject: (requestId: string, reason: string) => Promise<void>;
}

export const BonusApprovalModal: React.FC<BonusApprovalModalProps> = ({
    isOpen,
    onClose,
    bonusRequest,
    onApprove,
    onReject
}) => {
    const [mode, setMode] = useState<'approve' | 'reject'>('approve');
    const [pin, setPin] = useState(['', '', '', '']);
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleConfirm = async () => {
        if (mode === 'approve') {
            const pinValue = pin.join('');
            if (pinValue === '1234') {
                await onApprove(bonusRequest.id, pinValue);
                onClose();
            } else {
                setError('Invalid Level 2 PIN');
            }
        } else {
            if (!rejectReason) {
                setError('Rejection reason is required');
                return;
            }
            await onReject(bonusRequest.id, rejectReason);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className={`p-6 text-white flex justify-between items-start ${mode === 'approve' ? 'bg-linear-to-r from-brand-600 to-brand-800' : 'bg-red-600'}`}>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {mode === 'approve' ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                            <h2 className="text-xl font-bold">{mode === 'approve' ? 'Authorize Bonus' : 'Reject Bonus'}</h2>
                        </div>
                        <p className="text-white/80 text-sm">
                            {mode === 'approve' ? 'Level 2 Authorization Required' : 'Please provide a reason for rejection'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition" aria-label="Close modal">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                        <div className="text-sm text-slate-500 mb-1">Request Amount</div>
                        <div className="text-2xl font-bold text-slate-900">₦{bonusRequest.amount.toLocaleString()}</div>
                        <div className="text-sm text-slate-600 mt-2">
                            For: <span className="font-medium">{bonusRequest.employeeId}</span> {/* In real app, look up name */}
                        </div>
                        <div className="text-sm text-slate-600">
                            Reason: <span className="italic">"{bonusRequest.reason}"</span>
                        </div>
                    </div>

                    {mode === 'approve' ? (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-700 text-center">Enter 4-Digit Security PIN</label>
                            <div className="flex justify-center gap-3">
                                {pin.map((digit, i) => (
                                    <input
                                        key={i}
                                        id={`pin-${i}`}
                                        type="password"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handlePinChange(i, e.target.value)}
                                        className="w-12 h-12 text-center text-2xl font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        aria-label={`Digit ${i + 1}`}
                                    />
                                ))}

                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason</label>
                            <textarea
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none"
                                rows={3}
                                placeholder="Why is this bonus being rejected?"
                                autoFocus
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        {mode === 'approve' ? (
                            <button
                                onClick={() => { setMode('reject'); setError(''); }}
                                className="flex-1 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
                            >
                                Reject Request
                            </button>
                        ) : (
                            <button
                                onClick={() => { setMode('approve'); setError(''); }}
                                className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition"
                            >
                                Back to Approve
                            </button>
                        )}

                        <button
                            onClick={handleConfirm}
                            className={`flex-1 py-3 font-bold text-white rounded-lg shadow-lg shadow-brand-500/20 transition transform active:scale-95 ${mode === 'approve'
                                ? 'bg-brand-600 hover:bg-brand-700'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                }`}
                        >
                            {mode === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
