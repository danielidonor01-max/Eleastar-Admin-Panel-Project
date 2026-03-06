import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Menu, ChevronDown, Calendar, BarChart2, CheckSquare } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { NotificationMenu } from '../components/NotificationMenu';

export const UserLayout: React.FC = () => {
    const { isAuthenticated, isLoading, logout, currentUserRole, employees, currentUserId } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Get live user data
    const currentUser = employees.find(e => e.id === currentUserId);
    const userDisplayName = currentUser?.name || "User";
    const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').substring(0, 2);
    const userEmail = currentUser?.email || "user@eleastar.com";

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-brand-100 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium text-xs tracking-widest uppercase">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (currentUserRole !== 'USER') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col h-full flex-shrink-0 transition-transform duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <img src="/assets/logo-horizontal-white.png" alt="Eleastar" className="h-7 object-contain" />
                </div>

                <div className="px-6 py-4">
                    <div className="px-3 py-1 bg-brand-900/50 text-brand-400 rounded-md text-xs font-bold uppercase tracking-wider border border-brand-800/50 text-center">
                        Employee Portal
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-1">
                    <NavLink
                        to="/user/dashboard"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <LayoutDashboard size={20} />
                        Home
                    </NavLink>
                    <NavLink
                        to="/user/profile"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <User size={20} />
                        My Profile
                    </NavLink>
                    <NavLink
                        to="/user/tasks"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <CheckSquare size={20} />
                        My Tasks
                    </NavLink>
                    <NavLink
                        to="/user/leave"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Calendar size={20} />
                        Leave
                    </NavLink>
                    <NavLink
                        to="/user/performance"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <BarChart2 size={20} />
                        Performance
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-red-400 transition-colors text-slate-400 group"
                    >
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
                            aria-label="Toggle Sidebar"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
                            {location.pathname.includes('dashboard') ? 'Home' : 'My Profile'}
                        </h1>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <NotificationMenu />

                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full lg:rounded-lg transition-colors border border-transparent hover:border-slate-100"
                            >
                                <div className="text-right hidden lg:block">
                                    <div className="text-sm font-bold text-slate-900">{userDisplayName}</div>
                                    <div className="text-xs text-slate-500">{currentUser?.title || "Employee"}</div>
                                </div>
                                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200 overflow-hidden shadow-sm">
                                    {currentUser?.photoUrl ? (
                                        <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        userInitials
                                    )}
                                </div>
                                <ChevronDown size={16} className="text-slate-400 hidden lg:block" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-3 border-b border-slate-50 lg:hidden">
                                            <div className="font-bold text-slate-900">{userDisplayName}</div>
                                            <div className="text-xs text-slate-500">{userEmail}</div>
                                        </div>
                                        <button
                                            onClick={() => { setUserMenuOpen(false); navigate('/user/profile'); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <User size={16} /> My Profile
                                        </button>
                                        <div className="border-t border-slate-50 mt-1 pt-1">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    navigate('/login');
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
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
