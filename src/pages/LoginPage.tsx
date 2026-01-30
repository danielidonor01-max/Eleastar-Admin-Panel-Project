
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const LoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the redirect path from location state, or default to /admin/dashboard
    const from = location.state?.from?.pathname || "/admin/dashboard";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const role = login(password);
        if (role) {
            // Priority Redirect: If a specific "from" location was set (e.g. they tried to access a URL), 
            // check if they are authorized for it. If not, go to their default dashboard.

            if (role === 'User') {
                navigate('/user/dashboard', { replace: true });
            } else {
                navigate('/admin/dashboard', { replace: true });
            }
        } else {
            setError('Invalid access code');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="flex items-center gap-2 mb-8 text-slate-900">
                <img src="/assets/logo-horizontal-blue.png" alt="Eleastar Technologies" className="h-12 object-contain" />
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <h2 className="text-white font-bold text-xl mb-2">Restricted Access</h2>
                    <p className="text-slate-400 text-sm">Enter your administrator access code to continue.</p>
                </div>

                <div className="p-8 pt-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Access Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm"
                                    placeholder="Enter code..."
                                    autoFocus
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
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                        >
                            Access Panel <ArrowRight size={18} />
                        </button>
                    </form>

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
