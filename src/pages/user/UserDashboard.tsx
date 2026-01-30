import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { User, CreditCard, Bell, ShieldCheck } from 'lucide-react';

export const UserDashboard: React.FC = () => {
    const { payrollStatus } = useAdmin();

    // Mock User Data for this exercise
    const userProfile = {
        name: "Demo User",
        role: "Software Engineer",
        department: "Engineering",
        employeeId: "EMP-2024-001",
        joinDate: "Jan 15, 2024"
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name}</h1>
                    <p className="text-brand-100 max-w-xl">
                        Here is your personal overview. Check your specific payroll details and company announcements below.
                    </p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.6,34.3C59,45.5,47.1,54.2,34.4,61.9C21.7,69.6,8.2,76.3,-4.6,84.3C-17.4,92.3,-29.4,101.6,-39.8,98.1C-50.2,94.6,-58.9,78.3,-66.1,64.2C-73.3,50.1,-79,38.2,-81.9,25.4C-84.8,12.6,-84.9,-1.1,-80.7,-12.9C-76.5,-24.7,-68,-34.6,-57.8,-42.6C-47.6,-50.6,-35.7,-56.7,-23.7,-65.4C-11.7,-74.1,0.4,-85.4,14,-87.8C27.6,-90.2,42.7,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900">My Profile</h3>
                    </div>

                    <div className="space-y-4 flex-grow">
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500 text-sm">Employee ID</span>
                            <span className="font-mono text-sm font-medium text-slate-900">{userProfile.employeeId}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500 text-sm">Department</span>
                            <span className="font-medium text-slate-900">{userProfile.department}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-2">
                            <span className="text-slate-500 text-sm">Role</span>
                            <span className="font-medium text-slate-900">{userProfile.role}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Joined</span>
                            <span className="font-medium text-slate-900">{userProfile.joinDate}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Payroll Status */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900">Payroll Status</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Current Cycle</div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800">{payrollStatus.month} {payrollStatus.year}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${payrollStatus.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                        payrollStatus.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {payrollStatus.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Expected Pay Date</div>
                            <div className="text-slate-900 font-medium">Jan 30, 2026</div> {/* Mocked for demo */}
                        </div>

                        <div className="text-xs text-slate-400 text-center">
                            Calculated based on approved cycles only.
                        </div>
                    </div>
                </div>

                {/* 3. Announcements / Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Bell size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900">Announcements</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Mock Policy Update */}
                        <div className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                            <div className="mt-1">
                                <ShieldCheck size={16} className="text-brand-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">Security Policy Update</h4>
                                <p className="text-xs text-slate-500 mt-1">Please review the new IT security guidelines effective Feb 1st.</p>
                            </div>
                        </div>

                        {/* HR Update */}
                        <div className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                            <div className="mt-1">
                                <User size={16} className="text-brand-500" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">Town Hall Meeting</h4>
                                <p className="text-xs text-slate-500 mt-1">Join us this Friday at 3 PM for the monthly all-hands.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
