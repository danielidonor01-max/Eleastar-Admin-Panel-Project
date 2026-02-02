import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Globe, Briefcase, ChevronDown, ChevronRight, LogOut, Calendar, Share2, BarChart2, Layout, QrCode, Wallet, FileText, Search, Check, Lock, User } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { NotificationMenu } from '../components/NotificationMenu';
import type { AdminRole, ModuleType } from '../context/AdminContext';
import { PUBLIC_LINK } from '../config';

export const AdminLayout: React.FC = () => {
    const {
        currentUserRole,
        switchRole,
        rolePermissions,
        isAuthenticated,
        logout
    } = useAdmin();

    const navigate = useNavigate();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // UI State for Dropdowns
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Sidebar State
    const [expandedCMS, setExpandedCMS] = useState(true); // Default open for visibility
    const [expandedServices, setExpandedServices] = useState(false);
    const [expandedCareers, setExpandedCareers] = useState(false);

    // Auto-expand sidebar sections based on active route
    React.useEffect(() => {
        const isCMS = location.pathname.includes('/admin/cms');

        if (isCMS) {
            setExpandedCMS(true);
            const search = location.search;
            const isServices = search.includes('page=IndustrialSolutions') ||
                search.includes('page=InformationTechnology') ||
                search.includes('page=ResearchAndDevelopment') ||
                search.includes('page=ElectronicsManufacturing') ||
                search.includes('page=SpecificITServices') ||
                search.includes('page=Services');

            setExpandedServices(isServices);

            const isCareers = search.includes('page=Careers');
            setExpandedCareers(isCareers);
        } else {
            // "Global Navigation Consistency": Clicking a non-CMS module should deactivate/collapse Website CMS.
            setExpandedCMS(false);
            setExpandedServices(false);
            setExpandedCareers(false);
        }
    }, [location.pathname, location.search]);

    // Click outside to close (simplified)
    // In production, use click-outside hooks.

    const hasAccess = (module: ModuleType) => {
        return rolePermissions[currentUserRole].includes(module);
    };

    const roles: AdminRole[] = ['Super Admin', 'Management Admin', 'HR Admin', 'Finance Admin', 'Web Admin'];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full flex-shrink-0 transition-all duration-300">
                <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-800">
                    <div className="font-bold text-white tracking-wider flex items-center gap-2">
                        <img src="/assets/logo-horizontal-white.png" alt="Eleastar Admin" className="h-8 object-contain" />
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 ml-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Preview Mode</span>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                    {hasAccess('Dashboard') && (
                        <>
                            <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-2">Core</div>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                                <LayoutDashboard size={20} />
                                Dashboard
                            </NavLink>
                        </>
                    )}

                    {(hasAccess('Employees') || hasAccess('QR & ID')) && (
                        <>
                            {/* Only show header if we haven't shown it for dashboard or if we want to group distinctively */}
                            {/* In this simple list, we can just render the links if permitted */}

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
                                        <div className="ml-9 mt-1 space-y-1 border-l border-slate-700 pl-3">
                                            {/* Home */}
                                            <NavLink to="/admin/cms?page=Home" className={() => {
                                                const search = useLocation().search;
                                                const isCurrent = location.pathname === '/admin/cms' && (!search || search.includes('page=Home'));
                                                return `block px-3 py-1.5 text-sm rounded-md transition-colors ${isCurrent ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                            }}>
                                                Home Page
                                            </NavLink>

                                            {/* About */}
                                            <NavLink to="/admin/cms?page=About" className={() => {
                                                const search = useLocation().search;
                                                const isCurrent = location.pathname === '/admin/cms' && search.includes('page=About');
                                                return `block px-3 py-1.5 text-sm rounded-md transition-colors ${isCurrent ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                            }}>
                                                About Page
                                            </NavLink>

                                            {/* Services Parent */}
                                            <div>
                                                <button
                                                    onClick={() => setExpandedServices(!expandedServices)}
                                                    className="w-full text-left flex items-center justify-between px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Layout size={14} /> Services
                                                    </span>
                                                    {expandedServices ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>

                                                {expandedServices && (
                                                    <div className="ml-2 pl-2 border-l border-slate-700 mt-1 space-y-1">
                                                        <NavLink to="/admin/cms?page=Services" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=Services') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>Main Page</NavLink>
                                                        <NavLink to="/admin/cms?page=IndustrialSolutions" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=IndustrialSolutions') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>Industrial</NavLink>
                                                        <NavLink to="/admin/cms?page=InformationTechnology" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=InformationTechnology') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>IT Services</NavLink>
                                                        <NavLink to="/admin/cms?page=ResearchAndDevelopment" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=ResearchAndDevelopment') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>R&D</NavLink>
                                                        <NavLink to="/admin/cms?page=ElectronicsManufacturing" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=ElectronicsManufacturing') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>Electronics</NavLink>
                                                        <NavLink to="/admin/cms?page=SpecificITServices" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=SpecificITServices') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>Specific IT</NavLink>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Eleastar & You Parent */}
                                            <div>
                                                <button
                                                    onClick={() => setExpandedCareers(!expandedCareers)}
                                                    className="w-full text-left flex items-center justify-between px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Briefcase size={14} /> Eleastar & You
                                                    </span>
                                                    {expandedCareers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>

                                                {expandedCareers && (
                                                    <div className="ml-2 pl-2 border-l border-slate-700 mt-1 space-y-1">
                                                        <NavLink to="/admin/cms?page=Careers" className={() => {
                                                            const search = useLocation().search;
                                                            return `block px-3 py-1.5 text-xs rounded-md transition-colors ${location.pathname === '/admin/cms' && search.includes('page=Careers') ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                                        }}>Careers</NavLink>
                                                        {/* Future: Tech Hub */}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact */}
                                            <NavLink to="/admin/cms?page=Contact" className={() => {
                                                const search = useLocation().search;
                                                const isCurrent = location.pathname === '/admin/cms' && search.includes('page=Contact');
                                                return `block px-3 py-1.5 text-sm rounded-md transition-colors ${isCurrent ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                            }}>
                                                Contact Us
                                            </NavLink>

                                            {/* Footer */}
                                            <NavLink to="/admin/cms?page=Footer" className={() => {
                                                const search = useLocation().search;
                                                const isCurrent = location.pathname === '/admin/cms' && search.includes('page=Footer');
                                                return `block px-3 py-1.5 text-sm rounded-md transition-colors ${isCurrent ? 'text-brand-400 font-medium' : 'text-slate-400 hover:text-white'}`;
                                            }}>
                                                Footer
                                            </NavLink>
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
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <NavLink to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-slate-400">
                        <LogOut size={20} />
                        Exit to Public Site
                    </NavLink>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-20 relative">
                    {/* View As Info */}
                    <div className="flex items-center gap-4">
                        <div className="w-96 relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search employees, payroll, or pages... (Cmd+K)"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                            />
                        </div>
                        {currentUserRole !== 'Super Admin' && (
                            <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs font-medium animate-pulse">
                                View Mode: {currentUserRole}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Share Preview Button */}
                        {currentUserRole === 'Super Admin' && (
                            <button
                                onClick={() => {
                                    const previewUrl = PUBLIC_LINK || window.location.origin;
                                    navigator.clipboard.writeText(previewUrl);
                                    alert(`Link copied: ${previewUrl}`);
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
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold border border-brand-200 hover:ring-2 hover:ring-brand-200 transition-all"
                                >
                                    AU
                                </button>

                                {/* User Menu Dropdown */}
                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <div className="font-bold text-slate-900">Admin User</div>
                                                <div className="text-xs text-slate-500">admin@eleastar.com</div>
                                            </div>
                                            <button
                                                onClick={() => { setShowUserMenu(false); navigate('/admin/profile'); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                            >
                                                <User size={16} /> My Profile
                                            </button>
                                            <button
                                                onClick={() => { setShowUserMenu(false); navigate('/admin/profile'); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Settings size={16} /> Personal Settings
                                            </button>
                                            <button
                                                onClick={() => { setShowUserMenu(false); navigate('/admin/profile', { state: { activeTab: 'security' } }); }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                                <Lock size={16} /> Change Password
                                            </button>
                                            <div className="border-t border-slate-100 mt-1 pt-1">
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
