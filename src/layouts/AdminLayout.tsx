import React, { useState } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Globe, ChevronDown, LogOut, Calendar, BarChart2, QrCode, Wallet, FileText, CheckSquare, Key } from 'lucide-react';
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
        isAuthenticated
    } = useAdmin();

    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // UI State for Dropdowns
    const [showRoleMenu, setShowRoleMenu] = useState(false);

    // Sidebar State
    const [expandedCMS, setExpandedCMS] = useState(true); // Default open for visibility

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
    const sidebarWidthClass = expandedCMS ? 'w-[280px]' : 'w-64';

    const hasAccess = (module: ModuleType) => {
        return rolePermissions[currentUserRole].includes(module);
    };

    const roles: AdminRole[] = ['SUPER_ADMIN', 'COO', 'HR_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'CHIEF_RISK_OFFICER', 'USER'];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className={`${sidebarWidthClass} bg-slate-900 text-slate-300 flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out`}>
                {/* Logo Section */}
                <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800">
                    <div className="font-bold text-white tracking-wider flex items-center gap-2">
                        <img src="/assets/logo-horizontal-white.png" alt="Eleastar Admin" className="h-8 object-contain" />
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 ml-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Preview Mode</span>
                    </div>
                </div>

                {/* Navigation Links */}
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
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Employee Management</div>
                            {hasAccess('Employees') && (
                                <NavLink to="/admin/employees" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Users size={20} />
                                    Employees
                                </NavLink>
                            )}
                            {hasAccess('QR & ID') && (
                                <NavLink to="/admin/qr" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <QrCode size={20} />
                                    QR & ID
                                </NavLink>
                            )}
                        </>
                    )}

                    {hasAccess('Tasks') && (
                        <NavLink to="/admin/tasks" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                            <CheckSquare size={20} />
                            Admin Tasks
                        </NavLink>
                    )}

                    {(hasAccess('Payroll') || hasAccess('Leave')) && (
                        <>
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-6">Operations</div>
                            {hasAccess('Payroll') && (
                                <NavLink to="/admin/payroll" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Wallet size={20} />
                                    Payroll
                                </NavLink>
                            )}
                            {hasAccess('Leave') && (
                                <NavLink to="/admin/leaves" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                    <Calendar size={20} />
                                    Leave Requests
                                </NavLink>
                            )}
                        </>
                    )}

                    {/* Website CMS - Always show for Admins */}
                    {['SUPER_ADMIN', 'COO', 'HR_ADMIN'].includes(currentUserRole) && (
                        <div className="mt-6">
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2">Website Settings</div>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setExpandedCMS(!expandedCMS)}
                                    className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm flex items-center justify-between bg-slate-800 transition-colors ${expandedCMS ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Globe size={20} />
                                        <span>Website CMS</span>
                                    </div>
                                    <ChevronDown size={14} className={`transition-transform duration-200 ${expandedCMS ? '' : '-rotate-90'}`} />
                                </button>

                                {expandedCMS && (
                                    <div className="ml-5 mt-2 space-y-1">
                                        <NavLink to="/admin/cms?module=pages" className={({ isActive }) => {
                                            const search = location.search;
                                            const active = search.includes('module=pages') || (!search && isActive);
                                            return `flex items-center gap-3 px-3 py-2 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                        }}>
                                            <FileText size={14} />
                                            Pages
                                        </NavLink>
                                        <NavLink to="/admin/cms?module=menus" className={() => {
                                            const search = location.search;
                                            const active = search.includes('module=menus');
                                            return `flex items-center gap-3 px-3 py-2 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                        }}>
                                            <Globe size={14} />
                                            Navigation
                                        </NavLink>
                                        <NavLink to="/admin/cms?module=apikeys" className={() => {
                                            const search = location.search;
                                            const active = search.includes('module=apikeys');
                                            return `flex items-center gap-3 px-3 py-2 text-xs rounded-md transition-all ${active ? 'text-brand-400 font-medium bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
                                        }}>
                                            <Key size={14} />
                                            API Keys
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-8 mb-4">
                        <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                            <Settings size={20} />
                            Admin Settings
                        </NavLink>
                    </div>
                </nav>

                {/* User Info Bar at Bottom */}
                <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold ring-2 ring-slate-800">
                            {currentUserRole.charAt(0)}
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="text-sm font-semibold text-white truncate">Administrator</div>
                            <button
                                onClick={() => setShowRoleMenu(!showRoleMenu)}
                                className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1 hover:text-white transition-colors uppercase font-bold tracking-tighter"
                            >
                                {currentUserRole.replace('_', ' ')}
                                <ChevronDown size={8} />
                            </button>
                        </div>
                        <button
                            onClick={() => switchRole('USER')}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>

                    {/* Role Quick Switch Menu (for dev/preview) */}
                    {showRoleMenu && (
                        <div className="absolute bottom-20 left-4 right-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
                            <div className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-2 tracking-widest">Switch View Context</div>
                            <div className="grid grid-cols-1 gap-1">
                                {roles.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => { switchRole(r); setShowRoleMenu(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${currentUserRole === r ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                                    >
                                        {r.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col overflow-hidden relative">
                {/* Header / Top Bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <GlobalSearchMenu />
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationMenu />
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div className="hidden md:block text-right mr-2">
                            <div className="text-xs font-bold text-slate-900 leading-none">Admin User</div>
                            <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wide">{currentUserRole}</div>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
