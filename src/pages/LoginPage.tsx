
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, verifyOTP, sendEmail } = useAdmin();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(email, password);
            if (result && result.requiresOtp) {
                setShowOtp(true);
                return; // Stop here, wait for OTP
            }
            if (result && result.role) {
                if (result.role === 'USER') {
                    navigate('/user/dashboard', { replace: true });
                } else {
                    navigate('/admin/dashboard', { replace: true });
                }
            } else if (!result.requiresOtp) {
                setError('Invalid email or password');
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const role = await verifyOTP(email, otp);
            if (role) {
                if (role === 'USER') {
                    navigate('/user/dashboard', { replace: true });
                } else {
                    navigate('/admin/dashboard', { replace: true });
                }
            } else {
                setError('Invalid OTP code');
            }
        } catch (err) {
            setError('An error occurred verifying OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }
        sendEmail(email, 'Password Reset Request', 'Click here to reset your password: [Link]');
        alert(`Password reset link sent to ${email} (Check Activity Log -> Email Logs)`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="flex items-center gap-2 mb-8 text-slate-900">
                <img src="/assets/logo-horizontal-blue.png" alt="Eleastar Technologies" className="h-12 object-contain" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <h2 className="text-white font-bold text-xl mb-2">Restricted Access</h2>
                    <p className="text-slate-400 text-sm">Sign in to access the administration panel.</p>
                </div>

                <div className="p-8 pt-10">
                    {!showOtp ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm"
                                        placeholder="name@eleastar.com"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? 'Authenticating...' : (
                                    <>Access Panel <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900">2-Step Verification</h3>
                                <p className="text-sm text-slate-500 mt-2">Enter the verification code sent to your email.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Authentication Code
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm text-center tracking-widest text-lg"
                                        placeholder="000000"
                                        autoFocus
                                        required
                                    />
                                </div>
                                {error && (
                                    <p className="mt-2 text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={isLoading || !otp}
                                    className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowOtp(false)}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                                >
                                    Use Different Account
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <a href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                            Return to Public Site
                        </a>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Preview Environment</span>
            </div>
        </div>
    );
};
