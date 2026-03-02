import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Globe, ChevronDown, ChevronRight, LogOut, Calendar, Share2, BarChart2, QrCode, Wallet, FileText, Check, Shield, TrendingUp, Gift, Activity, CheckSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { NotificationMenu } from '../components/NotificationMenu';
import { GlobalSearchMenu } from '../components/GlobalSearchMenu';
import { useFeedback } from '../context/FeedbackContext';
import type { AdminRole } from '../data/mockData';
import type { ModuleType } from '../context/AdminContext';
import { PUBLIC_LINK } from '../config';

export const AdminLayout: React.FC = () => {
    const {
        currentUserRole,
        switchRole,
        rolePermissions,
        isAuthenticated,
        cmsContent
    } = useAdmin();

    const { showSuccess } = useFeedback();

    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // UI State for Dropdowns
    const [showRoleMenu, setShowRoleMenu] = useState(false);

    // Sidebar State
    const [expandedCMS, setExpandedCMS] = useState(true); // Default open for visibility

    // CMS Sections State (Collapsible)
    const [cmsSectionState, setCmsSectionState] = useState({
        global: true,
        collections: false,
        pages: true,
        footer: false
    });

    const toggleCmsSection = (section: keyof typeof cmsSectionState) => {
        setCmsSectionState(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Auto-expand sidebar sections based on active route
    React.useEffect(() => {
        const isCMS = location.pathname.includes('/admin/cms');

        if (isCMS) {
            setExpandedCMS(true);
        } else {
            // "Global Navigation Consistency": Clicking a non-CMS module should deactivate/collapse Website CMS.
            setExpandedCMS(false);
        }
    }, [location.pathname, location.search]);

    // Sidebar width based on CMS expansion
    // If CMS is expanded, wide sidebar (280px), else standard (256px)
    const sidebarWidthClass = expandedCMS ? 'w-[280px]' : 'w-64';

    // Click outside to close (simplified)
    // In production, use click-outside hooks.

    const hasAccess = (module: ModuleType) => {
        return rolePermissions[currentUserRole].includes(module);
    };

    const roles: AdminRole[] = ['SUPER_ADMIN', 'COO', 'HR_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'CHIEF_RISK_OFFICER', 'USER'];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

            <aside className={`${sidebarWidthClass} bg-slate-900 text-slate-300 flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out`}>
                <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800">
                    <div className="font-bold text-white tracking-wider flex items-center gap-2">
                        <img src="/assets/logo-horizontal-white.png" alt="Eleastar Admin" className="h-8 object-contain" />
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 ml-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Preview Mode</span>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {hasAccess('Dashboard') && (
                        <>
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-2">Core</div>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                <LayoutDashboard size={20} />
                                Dashboard
                            </NavLink>
                            {/* Analytics Link - CEO/COO/Finance only */}
                            {['SUPER_ADMIN', 'COO', 'FINANCE_ADMIN'].includes(currentUserRole) && (
                                <NavLink to="/admin/analytics" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <BarChart2 size={20} />
                                    Analytics
                                </NavLink>
                            )}
                        </>
                    )}

                    {(hasAccess('Employees') || hasAccess('QR & ID')) && (
                        <>
                            {/* Only show header if we haven't shown it for dashboard or if we want to group distinctively */}
                            {/* In this simple list, we can just render the links if permitted */}

                            {hasAccess('QR & ID') && (
                                <NavLink to="/admin/qr" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <QrCode size={20} />
                                    QR & ID
                                </NavLink>
                            )}
                            {hasAccess('Employees') && (
                                <NavLink to="/admin/employees" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Users size={20} />
                                    Employees
                                </NavLink>
                            )}

                        </>
                    )}

                    {(hasAccess('Payroll') || hasAccess('Recruitment')) && (
                        <>
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Finance & HR</div>
                            {hasAccess('Payroll') && (
                                <NavLink to="/admin/payroll" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Wallet size={20} />
                                    Payroll
                                </NavLink>
                            )}

                            {hasAccess('Recruitment') && (
                                <NavLink to="/admin/recruitment" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <FileText size={20} />
                                    Recruitment
                                </NavLink>
                            )}
                            {/* Salary Bands */}
                            {hasAccess('Employees') && (
                                <NavLink to="/admin/salary-structures" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <TrendingUp size={20} />
                                    Department Salary
                                </NavLink>
                            )}
                            {hasAccess('Employees') && (
                                <NavLink to="/admin/tasks" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <CheckSquare size={20} />
                                    Task Mgmt
                                </NavLink>
                            )}
                            {hasAccess('Leave') && (
                                <NavLink to="/admin/leave" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Calendar size={20} />
                                    Leave Mgmt
                                </NavLink>
                            )}
                            {hasAccess('Performance') && (
                                <NavLink to="/admin/performance" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <BarChart2 size={20} />
                                    Performance
                                </NavLink>
                            )}
                        </>
                    )}

                    {hasAccess('Employees') && (
                        <NavLink to="/admin/promotions" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                            <TrendingUp size={20} />
                            Promotions
                        </NavLink>
                    )}

                    {hasAccess('Payroll') && (
                        <NavLink to="/admin/bonuses" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                            <Gift size={20} />
                            Bonuses
                        </NavLink>
                    )}


                    {hasAccess('Compliance') && (
                        <>
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Risk & Compliance</div>
                            <NavLink to="/admin/compliance" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                <Shield size={20} />
                                Compliance
                            </NavLink>
                            {['SUPER_ADMIN', 'COO', 'CHIEF_RISK_OFFICER', 'FINANCE_ADMIN', 'HR_ADMIN'].includes(currentUserRole) && (
                                <NavLink to="/admin/compliance-reports" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <FileText size={20} />
                                    Reports
                                </NavLink>
                            )}
                            <NavLink to="/admin/activity" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                <Activity size={20} />
                                Activity Log
                            </NavLink>
                        </>
                    )}

                    {(hasAccess('Website CMS') || hasAccess('Settings')) && (
                        <>
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">System</div>

                            {hasAccess('Website CMS') && (
                                <div className="mb-2">
                                    <button
                                        onClick={() => setExpandedCMS(!expandedCMS)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${location.pathname.includes('/admin/cms') ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Globe size={20} />
                                            <span>Website CMS</span>
                                        </div>
                                        {expandedCMS ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>

                                    {expandedCMS && (
                                        <div className="ml-5 mt-2 transition-all duration-300 ease-in-out">

                                            {/* Global Settings */}
                                            <div className="mb-1">
                                                <button
                                                    onClick={() => toggleCmsSection('global')}
                                                    className="w-full flex items-center justify-between group px-1 mb-1 mt-3"
                                                >
                                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest group-hover:text-slate-400 transition-colors">Global Settings</div>
                                                    <ChevronDown size={10} className={`text-slate-600 transition-transform duration-200 ${cmsSectionState.global ? '' : '-rotate-90'}`} />
                                                </button>

                                                {cmsSectionState.global && (
                                                    <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2">
                                                        <NavLink to="/admin/cms?page=GlobalNav" className={() => {
                                                            const search = location.search;
                                                            const active = search.includes('page=GlobalNav');
                                                            return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                        }}>
                                                            Navigation Menu
                                                        </NavLink>
                                                        <NavLink to="/admin/cms?page=GlobalSEO" className={() => {
                                                            const search = location.search;
                                                            const active = search.includes('page=GlobalSEO');
                                                            return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                        }}>
                                                            SEO Defaults
                                                        </NavLink>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Collections */}
                                            <div className="mb-1">
                                                <button
                                                    onClick={() => toggleCmsSection('collections')}
                                                    className="w-full flex items-center justify-between group px-1 mb-1 mt-3"
                                                >
                                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest group-hover:text-slate-400 transition-colors">Collections</div>
                                                    <ChevronDown size={10} className={`text-slate-600 transition-transform duration-200 ${cmsSectionState.collections ? '' : '-rotate-90'}`} />
                                                </button>

                                                {cmsSectionState.collections && (
                                                    <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2">
                                                        <NavLink to="/admin/cms?page=ServicesCollection" className={() => {
                                                            const search = location.search;
                                                            const active = search.includes('page=ServicesCollection');
                                                            return `flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                        }}>
                                                            <FileText size={14} className="opacity-70" />
                                                            Services
                                                        </NavLink>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pages */}
                                            <div className="mb-1">
                                                <button
                                                    onClick={() => toggleCmsSection('pages')}
                                                    className="w-full flex items-center justify-between group px-1 mb-1 mt-3"
                                                >
                                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest group-hover:text-slate-400 transition-colors">Pages</div>
                                                    <ChevronDown size={10} className={`text-slate-600 transition-transform duration-200 ${cmsSectionState.pages ? '' : '-rotate-90'}`} />
                                                </button>

                                                {cmsSectionState.pages && (
                                                    <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2">
                                                        {Object.keys(cmsContent?.pages || {}).map((pageSlug) => {
                                                            const isHome = pageSlug.toLowerCase() === 'home';
                                                            const displayLabel = isHome ? 'Home' : pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1).replace(/-/g, ' ');

                                                            return (
                                                                <NavLink
                                                                    key={pageSlug}
                                                                    to={`/admin/cms?page=${pageSlug}`}
                                                                    className={() => {
                                                                        const search = location.search;
                                                                        const active = isHome ? (!search || search.includes(`page=${pageSlug}`)) : search.includes(`page=${pageSlug}`);
                                                                        return `block px-2 py-1.5 text-xs rounded-md capitalize transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                                    }}
                                                                >
                                                                    {displayLabel}
                                                                </NavLink>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="mb-1">
                                                <button
                                                    onClick={() => toggleCmsSection('footer')}
                                                    className="w-full flex items-center justify-between group px-1 mb-1 mt-3"
                                                >
                                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest group-hover:text-slate-400 transition-colors">Footer</div>
                                                    <ChevronDown size={10} className={`text-slate-600 transition-transform duration-200 ${cmsSectionState.footer ? '' : '-rotate-90'}`} />
                                                </button>

                                                {cmsSectionState.footer && (
                                                    <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2">
                                                        <NavLink to="/admin/cms?page=FooterLayout" className={() => {
                                                            const search = location.search;
                                                            const active = search.includes('page=FooterLayout');
                                                            return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                        }}>
                                                            Footer Layout
                                                        </NavLink>

                                                        <div className="mt-2 mb-1 pl-2 text-[10px] text-slate-600 font-medium tracking-wide">LEGAL PAGES</div>
                                                        <NavLink to="/admin/cms?page=PrivacyPolicy" className={() => {
                                                            const search = location.search;
                                                            const active = search.includes('page=PrivacyPolicy');
                                                            return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                        }}>
                                                            Privacy Policy
                                                        </NavLink>
                                                        <NavLink to="/admin/cms?page=TermsOfService" className={() => {
                                                            const search = location.search;
                                                            const active = search.includes('page=TermsOfService');
                                                            return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                        }}>
                                                            Terms of Service
                                                        </NavLink>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {hasAccess('Settings') && (
                                <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Settings size={20} />
                                    Settings
                                </NavLink>
                            )}
                        </>
                    )}
                    <div className="pt-4 mt-2 mb-2 border-t border-slate-800">
                        <NavLink to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400">
                            <LogOut size={20} />
                            Exit to Public Site
                        </NavLink>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-20 relative">
                    {/* View As Info */}
                    <div className="flex items-center gap-4">
                        <GlobalSearchMenu />
                        {currentUserRole !== 'SUPER_ADMIN' && (
                            <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs font-medium animate-pulse">
                                View Mode: {currentUserRole}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Share Preview Button */}
                        {currentUserRole === 'SUPER_ADMIN' && (
                            <button
                                onClick={() => {
                                    const previewUrl = PUBLIC_LINK || window.location.origin;
                                    navigator.clipboard.writeText(previewUrl);
                                    showSuccess({ title: 'Copied', message: `Link copied: ${previewUrl}` });
                                }}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-200"
                                title="Share this link for review"
                            >
                                <Share2 size={16} />
                                <span>Share Preview Link</span>
                            </button>
                        )}

                        {/* Notifications */}
                        <NotificationMenu />

                        {/* User Menu & Role Switcher */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-slate-900">Admin User</div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowRoleMenu(!showRoleMenu)}
                                        className="text-xs text-slate-500 hover:text-brand-600 flex items-center justify-end gap-1 ml-auto group"
                                    >
                                        {currentUserRole} <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
                                    </button>

                                    {/* Role Dropdown */}
                                    {showRoleMenu && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowRoleMenu(false)} />
                                            <div className="absolute right-0 top-6 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">Switch View As</div>
                                                {roles.map(role => (
                                                    <button
                                                        key={role}
                                                        onClick={() => {
                                                            switchRole(role);
                                                            setShowRoleMenu(false);
                                                            navigate('/admin/dashboard'); // Reset to dashboard to avoid dead ends
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${role === currentUserRole ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700'}`}
                                                    >
                                                        {role}
                                                        {role === currentUserRole && <Check size={14} />}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => navigate('/admin/profile')}
                                    className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold border border-brand-200 hover:ring-2 hover:ring-brand-200 transition-all"
                                    title="Go to Profile"
                                >
                                    AU
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div >
    );
};
