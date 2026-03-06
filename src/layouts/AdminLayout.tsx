import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Globe, ChevronDown, ChevronRight, LogOut, Calendar, BarChart2, QrCode, Wallet, FileText, Check, Shield, TrendingUp, Gift, Activity, CheckSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { NotificationMenu } from '../components/NotificationMenu';
import { GlobalSearchMenu } from '../components/GlobalSearchMenu';
import type { AdminRole } from '../data/mockData';
import type { ModuleType } from '../context/AdminContext';

export const AdminLayout: React.FC = () => {
    const {
        currentUserRole,
        switchRole,
        rolePermissions,
        isAuthenticated,
        isLoading
    } = useAdmin();
    // const { cmsContent } = useCMS();

    const navigate = useNavigate();
    const location = useLocation();

    // UI State for Dropdowns
    const [showRoleMenu, setShowRoleMenu] = useState(false);

    // Sidebar State
    const [expandedCMS, setExpandedCMS] = useState(true); // Default open for visibility
    const [expandedServices, setExpandedServices] = useState(false);



    React.useEffect(() => {
        const isCMS = location.pathname.includes('/admin/cms');
        if (isCMS) {
            setExpandedCMS(true);
        }
    }, [location.pathname]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse text-sm tracking-wide">Securing Admin Session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

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
                                            {/* GLOBAL SETTINGS */}
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 mt-4 px-1">Global Settings</div>
                                            <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2 mb-4">
                                                <NavLink to="/admin/cms?module=menus&page=GlobalNav" className={() => {
                                                    const active = location.search.includes('page=GlobalNav');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Navigation Menu
                                                </NavLink>
                                                <NavLink to="/admin/cms?module=settings&page=GlobalSEO" className={() => {
                                                    const active = location.search.includes('page=GlobalSEO');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    SEO Defaults
                                                </NavLink>
                                            </div>

                                            {/* PAGES */}
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 mt-4 px-1">Pages</div>
                                            <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2 mb-4">
                                                <NavLink to="/admin/cms?module=pages&page=home" className={() => {
                                                    const active = location.search.includes('page=home') || (!location.search.includes('page=') && location.pathname.includes('/admin/cms'));
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Home
                                                </NavLink>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setExpandedServices(!expandedServices)}
                                                        className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-all ${location.search.includes('page=services') || location.search.includes('page=information-technology') || location.search.includes('page=research-and-development') || location.search.includes('page=electronics-manufacturing') || location.search.includes('page=cloud-solutions') ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <span>Services</span>
                                                        {expandedServices ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                    </button>

                                                    {expandedServices && (
                                                        <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-700">
                                                            <NavLink to="/admin/cms?module=pages&page=services" className={() => {
                                                                const active = location.search.includes('page=services');
                                                                return `block px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'text-brand-300 font-medium' : 'text-slate-500 hover:text-slate-300'}`;
                                                            }}>
                                                                Overview
                                                            </NavLink>
                                                            <NavLink to="/admin/cms?module=pages&page=information-technology" className={() => {
                                                                const active = location.search.includes('page=information-technology');
                                                                return `block px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'text-brand-300 font-medium' : 'text-slate-500 hover:text-slate-300'}`;
                                                            }}>
                                                                Information Technology
                                                            </NavLink>
                                                            <NavLink to="/admin/cms?module=pages&page=research-and-development" className={() => {
                                                                const active = location.search.includes('page=research-and-development');
                                                                return `block px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'text-brand-300 font-medium' : 'text-slate-500 hover:text-slate-300'}`;
                                                            }}>
                                                                Research & Development
                                                            </NavLink>
                                                            <NavLink to="/admin/cms?module=pages&page=electronics-manufacturing" className={() => {
                                                                const active = location.search.includes('page=electronics-manufacturing');
                                                                return `block px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'text-brand-300 font-medium' : 'text-slate-500 hover:text-slate-300'}`;
                                                            }}>
                                                                Electronics Manufacturing
                                                            </NavLink>
                                                            <NavLink to="/admin/cms?module=pages&page=cloud-solutions" className={() => {
                                                                const active = location.search.includes('page=cloud-solutions');
                                                                return `block px-3 py-1.5 text-[11px] rounded-md transition-all ${active ? 'text-brand-300 font-medium' : 'text-slate-500 hover:text-slate-300'}`;
                                                            }}>
                                                                Cloud Solutions
                                                            </NavLink>
                                                        </div>
                                                    )}
                                                </div>

                                                <NavLink to="/admin/cms?module=pages&page=technology" className={() => {
                                                    const active = location.search.includes('page=technology');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Technologies
                                                </NavLink>
                                                <NavLink to="/admin/cms?module=pages&page=eleastar-and-you" className={() => {
                                                    const active = location.search.includes('page=eleastar-and-you');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Eleastar & You
                                                </NavLink>
                                                <NavLink to="/admin/cms?module=pages&page=about-eleastar" className={() => {
                                                    const active = location.search.includes('page=about-eleastar');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    About Eleastar
                                                </NavLink>
                                                <NavLink to="/admin/cms?module=pages&page=contact-us" className={() => {
                                                    const active = location.search.includes('page=contact-us');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Contact Us
                                                </NavLink>
                                            </div>

                                            {/* FOOTER */}
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 mt-4 px-1">Footer</div>
                                            <div className="space-y-0.5 border-l border-slate-800 ml-1 pl-2 mb-4">
                                                <NavLink to="/admin/cms?module=settings&page=FooterLayout" className={() => {
                                                    const active = location.search.includes('page=FooterLayout');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Footer Layout
                                                </NavLink>
                                                <NavLink to="/admin/cms?module=settings&page=PrivacyPolicy" className={() => {
                                                    const active = location.search.includes('page=PrivacyPolicy');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Privacy Policy
                                                </NavLink>
                                                <NavLink to="/admin/cms?module=settings&page=TermsOfService" className={() => {
                                                    const active = location.search.includes('page=TermsOfService');
                                                    return `block px-2 py-1.5 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                                }}>
                                                    Terms of Service
                                                </NavLink>
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
