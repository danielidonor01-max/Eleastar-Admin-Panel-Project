import { Outlet, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { LogOut, User, Calendar, BarChart2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const UserLayout: React.FC = () => {
    const { isAuthenticated, logout, currentUserRole, employees, currentUserId } = useAdmin();
    const navigate = useNavigate();

    // Get live user data
    const currentUser = employees.find(e => e.id === currentUserId);
    const userDisplayName = currentUser?.name || "User";
    const userInitials = userDisplayName.split(' ').map(n => n[0]).join('').substring(0, 2);
    const userEmail = currentUser?.email || "user@eleastar.com";

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (currentUserRole !== 'User') {
        // Redirect admins to admin dashboard if they try to access user layout
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Simple User Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 lg:px-8">
                <div onClick={() => navigate('/user/dashboard')} className="flex items-center gap-3 cursor-pointer">
                    <img src="/assets/logo-horizontal-blue.png" alt="Eleastar" className="h-8 object-contain" />
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100 uppercase tracking-wide">
                        Employee Portal
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-2">
                        <NavLink to="/user/profile" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <User size={18} />
                            <span>Profile</span>
                        </NavLink>
                        <NavLink to="/user/leave" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <Calendar size={18} />
                            <span>Leave</span>
                        </NavLink>
                        <NavLink to="/user/performance" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                            <BarChart2 size={18} />
                            <span>Performance</span>
                        </NavLink>
                    </div>

                    {/* User Profile and Logout */}
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors pr-3"
                        onClick={() => navigate('/user/profile')}
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-slate-900">{userDisplayName}</div>
                            <div className="text-xs text-slate-500">{userEmail}</div>
                        </div>
                        <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold border border-brand-200 overflow-hidden">
                            {currentUser?.photoUrl ? (
                                <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                userInitials
                            )}
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-grow p-6 lg:p-10 max-w-5xl mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
};
