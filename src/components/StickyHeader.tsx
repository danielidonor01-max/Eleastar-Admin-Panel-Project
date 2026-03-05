import React, { useState } from 'react';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCMS } from '../context/CMSContext';

export const StickyHeader: React.FC = () => {
    const { globalContent } = useCMS();
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = globalContent.navigation;

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white group-hover:bg-brand-700 transition-all shadow-lg shadow-brand-200">
                        <ShieldCheck size={22} />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight text-xl">Eleastar</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map(item => {
                        const hasSubItems = (item as any).subItems && (item as any).subItems.length > 0;
                        if (hasSubItems) {
                            return (
                                <div
                                    key={item.id}
                                    className="relative group h-20 flex items-center"
                                    onMouseEnter={() => setIsServicesOpen(true)}
                                    onMouseLeave={() => setIsServicesOpen(false)}
                                >
                                    <Link
                                        to={item.path}
                                        className="flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-brand-600 transition-colors py-2"
                                    >
                                        {item.label} <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                                    </Link>
 
                                    {/* Dropdown Menu */}
                                    <div className={`absolute top-[90%] left-0 w-[450px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6 transition-all duration-200 origin-top-left flex gap-6 ${isServicesOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-brand-900 mb-2">Our Solutions Are Innovative, Adaptive and Efficient</h3>
                                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">Our full-service portfolio enables you to take advantage of digital transformation in Marketing, E-Commerce, and IT.</p>
                                            <Link to={item.path} className="inline-block px-5 py-2 bg-[#0a3b82] text-white text-sm font-medium rounded-full hover:bg-[#072a5e] transition-colors">See All {item.label}</Link>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <h4 className="text-brand-800 font-bold mb-2">{item.label}</h4>
                                            {(item as any).subItems.map((sub: any) => (
                                                <Link key={sub.href || sub.slug} to={sub.href || '#'} className="py-2 text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors flex items-center justify-between group/item">
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className="text-sm font-medium text-slate-800 hover:text-brand-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        to="/contact"
                        className="hidden md:flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        Get Started
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        aria-label="Toggle menu"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMobileOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {navItems.map(item => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className="text-lg font-bold text-slate-800 py-2 border-b border-slate-50 last:border-0"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        to="/login"
                        className="text-lg font-bold text-slate-800 py-2 border-b border-slate-50 last:border-0"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        Login
                    </Link>
                    <Link
                        to="/contact"
                        className="mt-4 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-all"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            )}
        </header>
    );
};
