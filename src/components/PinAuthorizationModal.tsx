import React, { useState, useEffect } from 'react';
import { Lock, AlertCircle, Check, X } from 'lucide-react';

export type AuthLevel = 'CMS' | 'SENSITIVE';

interface PinAuthorizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void;
    requiredLevel: AuthLevel;
    description: string;
    title?: string;
}

export const PinAuthorizationModal: React.FC<PinAuthorizationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    requiredLevel,
    description,
    title = 'Authorization Required'
}) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);

    // Hardcoded PINs (System Level)
    const AUTH_CODES = {
        'CMS': 'AAAAA',       // Level 2 Management (SEO, Content)
        'SENSITIVE': 'CCCCC'  // Level 2 Finance (Payroll, HR)
    };

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError(null);
            setAttempts(0);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (attempts >= 3) {
            setError('Too many attempts. Action blocked.');
            return;
        }

        const requiredPin = AUTH_CODES[requiredLevel];

        if (pin === requiredPin) {
            onSuccess(pin);
            onClose();
        } else {
            setAttempts(prev => prev + 1);
            setError('Incorrect PIN.');
            setPin('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <Lock size={18} className="text-amber-400" />
                        <span>{title}</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        {description}
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4 flex items-start gap-2">
                        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-800">
                            <strong>Level 2 Access Required</strong><br />
                            Please enter your secure PIN to proceed.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <input
                                autoFocus
                                type="password"
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value);
                                    setError(null);
                                }}
                                maxLength={5}
                                placeholder="• • • • •"
                                className="w-full text-center text-3xl font-mono tracking-[0.5em] py-3 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none uppercase"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-4 text-center font-bold animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={pin.length < 5 || attempts >= 3}
                                className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                Verify
                            </button>
                        </div>
                    </form>
                </div>
                {/* Security Footer */}
                <div className="bg-slate-50 px-6 py-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Secure Authorization System</span>
                    <span>System ID: SYS-{new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
    );
};
