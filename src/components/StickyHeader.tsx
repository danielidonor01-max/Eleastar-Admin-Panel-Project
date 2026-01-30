import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StickyHeader: React.FC = () => {
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-700 transition-colors">
                        <ShieldCheck size={18} />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight text-lg">Eleastar</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                        Home
                    </Link>

                    {/* Services Dropdown */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setIsServicesOpen(true)}
                        onMouseLeave={() => setIsServicesOpen(false)}
                    >
                        <Link
                            to="/services"
                            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors py-2"
                        >
                            Services <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                        </Link>

                        {/* Dropdown Menu */}
                        <div className={`absolute top-full left-0 w-64 bg-white rounded-xl shadow-lg border border-slate-100 p-2 transition-all duration-200 origin-top-left ${isServicesOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                            <div className="flex flex-col gap-1">
                                <Link to="/services/industrial-solutions" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors">
                                    Industrial Solutions
                                </Link>
                                <Link to="/services/information-technology" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors">
                                    Information Technology
                                </Link>
                                <Link to="/services/research-and-development" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors">
                                    Research & Development
                                </Link>
                                <Link to="/services/electronics-manufacturing" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors">
                                    Electronics Manufacturing
                                </Link>
                                <Link to="/services/specific-it-services" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-lg transition-colors">
                                    Specific IT Services
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                        About
                    </Link>
                    <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                        Contact
                    </Link>
                    <Link to="/careers" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
                        Eleastar and Me
                    </Link>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all"
                    >
                        <User size={16} />
                        Admin Login
                    </Link>

                    {/* Mobile Menu Button (Placeholder) */}
                    <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" aria-label="Toggle menu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>
                </div>
            </div>
        </header>
    );
};
