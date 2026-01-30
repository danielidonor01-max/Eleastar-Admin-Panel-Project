import { useAdmin } from '../../context/AdminContext';
import { Bell, TrendingUp, TrendingDown, Calendar, FileDown, CreditCard } from 'lucide-react';
import { generatePayslipPDF } from '../../utils/generatePayslip';

export const UserDashboard: React.FC = () => {
    const { payrollStatus, employees, currentUserId, notifications, markNotificationAsRead } = useAdmin();

    const currentUser = employees.find(e => e.id === currentUserId);

    // Filter Notifications: Show System/Global ones + Targeted ones for this user
    const myNotifications = notifications.filter(n => (!n.targetUserId || n.targetUserId === currentUserId));
    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    // Financial Data Calculation
    const myAdjustments = payrollStatus.adjustments.filter(a => a.empId === currentUserId);
    const totalBonuses = myAdjustments.filter(a => a.type === 'Bonus').reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = myAdjustments.filter(a => a.type === 'Deduction' || a.type === 'Fine').reduce((sum, a) => sum + a.amount, 0);

    // Only show calculations if payroll is visible (Approved or Paid)
    const isPayrollVisible = payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid';
    const baseSalary = currentUser?.salary || 0;
    const netPay = baseSalary + totalBonuses - totalDeductions;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.name || 'User'}</h1>
                        <p className="text-brand-100 max-w-xl">
                            {currentUser?.title} • {currentUser?.department}
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-sm text-brand-200 font-bold uppercase tracking-wider">System Status</div>
                        <div className="text-2xl font-bold flex items-center gap-2 justify-end">
                            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#FFFFFF" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.6,34.3C59,45.5,47.1,54.2,34.4,61.9C21.7,69.6,8.2,76.3,-4.6,84.3C-17.4,92.3,-29.4,101.6,-39.8,98.1C-50.2,94.6,-58.9,78.3,-66.1,64.2C-73.3,50.1,-79,38.2,-81.9,25.4C-84.8,12.6,-84.9,-1.1,-80.7,-12.9C-76.5,-24.7,-68,-34.6,-57.8,-42.6C-47.6,-50.6,-35.7,-56.7,-23.7,-65.4C-11.7,-74.1,0.4,-85.4,14,-87.8C27.6,-90.2,42.7,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Notifications Center */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-0 flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-slate-500" />
                            <h3 className="font-bold text-slate-900">Notifications</h3>
                        </div>
                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>

                    <div className="flex-grow max-h-[300px] overflow-y-auto p-2 space-y-1">
                        {myNotifications.length === 0 ? (
                            <div className="text-center p-8 text-slate-400 text-sm">No new notifications</div>
                        ) : (
                            myNotifications.slice(0, 5).map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => markNotificationAsRead(notif.id)}
                                    className={`p-3 rounded-lg text-sm flex gap-3 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60 hover:opacity-100' : 'bg-blue-50 hover:bg-blue-100'}`}
                                >
                                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-slate-300' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-slate-900">{notif.message}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(notif.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Payroll Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Financial Overview</h3>
                                <p className="text-xs text-slate-500">
                                    Cycle: {payrollStatus.month} {payrollStatus.year} •
                                    <span className={`ml-1 font-bold ${payrollStatus.status === 'Paid' ? 'text-green-600' :
                                        payrollStatus.status === 'Approved' ? 'text-blue-600' :
                                            'text-amber-600'
                                        }`}>
                                        {payrollStatus.status}
                                    </span>
                                </p>
                            </div>
                        </div>
                        {/* Only show amount if approved/paid */}
                        {isPayrollVisible && (
                            <div className="text-right">
                                <div className="text-xs text-slate-500 uppercase font-bold">Estimated Net Pay</div>
                                <div className="text-2xl font-bold text-slate-900 font-mono">₦{netPay.toLocaleString()}</div>
                                <button
                                    onClick={() => currentUser && generatePayslipPDF(currentUser, payrollStatus)}
                                    className="mt-2 text-xs flex items-center gap-1 text-brand-600 hover:text-brand-800 font-medium ml-auto"
                                >
                                    <FileDown size={14} />
                                    Download Payslip
                                </button>
                            </div>
                        )}
                    </div>

                    {isPayrollVisible ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="text-sm text-slate-500 mb-1">Base Salary</div>
                                <div className="font-bold text-lg text-slate-900">₦{baseSalary.toLocaleString()}</div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Bonuses</span>
                                    </div>
                                    <span className="font-bold text-green-700">+ ₦{totalBonuses.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown size={16} className="text-red-600" />
                                        <span className="text-sm font-medium text-red-800">Deductions</span>
                                    </div>
                                    <span className="font-bold text-red-700">- ₦{totalDeductions.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Detailed Adjustments List */}
                            {myAdjustments.length > 0 && (
                                <div className="sm:col-span-2 mt-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Breakdown</h4>
                                    <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
                                        {myAdjustments.map((adj, idx) => (
                                            <div key={idx} className="flex justify-between p-3 bg-white text-sm">
                                                <span className="text-slate-700">{adj.reason}</span>
                                                <span className={`font-mono font-medium ${adj.type === 'Bonus' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {adj.type === 'Bonus' ? '+' : '-'} ₦{adj.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <Calendar className="text-slate-300 mb-3" size={48} />
                            <h4 className="font-bold text-slate-600">Payroll Processing</h4>
                            <p className="text-sm text-slate-400 max-w-xs mt-1">
                                The payroll for {payrollStatus.month} is currently being reviewed.
                                Details will safely appear here once approved.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
