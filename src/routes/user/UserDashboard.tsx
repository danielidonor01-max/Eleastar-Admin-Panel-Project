import { Link, useLocation } from 'react-router';
import { useAdmin } from '@/context/admin';
import { Calendar, FileDown, CreditCard, TrendingUp, Clock, User, ArrowRight, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generatePayslipPDF } from '../../utils/generatePayslip';
import { generatePastCycles } from '../../utils/payrollUtils';

export const UserDashboard: React.FC = () => {
    const { payrollStatus, employees, currentUserId, leaveRequests, performanceReviews } = useAdmin();
    const location = useLocation();

    // Deep Linking Scroll
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');
        if (section === 'payroll') {
            const element = document.getElementById('payroll-status-card');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: Highlight effect
                element.classList.add('ring-2', 'ring-brand-500');
                setTimeout(() => element.classList.remove('ring-2', 'ring-brand-500'), 2000);
            }
        }
    }, [location.search]);

    const currentUser = employees.find(e => e.id === currentUserId);
    const myAdjustments = payrollStatus.adjustments.filter(a => a.empId === currentUserId);
    const isPayrollVisible = payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid';

    // Calculations
    const baseSalary = currentUser?.salary || 0;
    const totalBonuses = myAdjustments.filter(a => a.type === 'Bonus').reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = myAdjustments.filter(a => a.type === 'Deduction' || a.type === 'Fine').reduce((sum, a) => sum + a.amount, 0);
    const netPay = baseSalary + totalBonuses - totalDeductions;

    // Mock Payroll History Data (Last 6 Months) -> Replaced with Dynamic
    const [historyPage, setHistoryPage] = useState(0);
    const ITEMS_PER_PAGE = 12;

    const allPastCycles = generatePastCycles(payrollStatus, 36); // Generate last 3 years
    // Add current cycle status to history view
    const historyData = [
        { ...payrollStatus, gross: baseSalary, bonus: totalBonuses, deduction: totalDeductions, net: netPay },
        ...allPastCycles.map(c => ({
            ...c,
            gross: baseSalary, // Simplified mock: assuming constant salary for history
            bonus: 0,
            deduction: 0,
            net: baseSalary
        }))
    ];

    const currentHistoryPage = historyData.slice(historyPage * ITEMS_PER_PAGE, (historyPage + 1) * ITEMS_PER_PAGE);

    // Derived History for Table (Compatible mapping)
    const history = currentHistoryPage.map(h => ({
        cycle: `${h.month} ${h.year}`,
        gross: (h as any).gross || baseSalary,
        bonus: (h as any).bonus || 0,
        deduction: (h as any).deduction || 0,
        net: (h as any).net || baseSalary,
        status: h.status
    }));

    // Finance Timeline Mock Data
    const timeline = [
        ...myAdjustments.map(adj => ({
            type: adj.type,
            title: `${adj.type} Applied`,
            desc: adj.reason,
            amount: adj.amount,
            date: 'Jan 2026'
        })),
        { type: 'Salary', title: 'Salary Credited', desc: 'December 2025 Salary Paid', amount: null, date: 'Dec 25, 2025' },
        { type: 'Promotion', title: 'Role Update', desc: `Promoted to ${currentUser?.title}`, amount: null, date: 'Nov 01, 2025' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Approved': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Draft': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Home</h1>
                <p className="text-slate-500">Overview of your employment and payroll information</p>
            </div>

            {/* Pending Actions / Feedback Cards */}
            <div className="space-y-4">
                {leaveRequests.some(r => r.employeeId === currentUserId && r.status === 'Pending') && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">Leave Request Pending</h4>
                            <p className="text-sm text-blue-700 mt-0.5">Your recent leave request is awaiting approval from management.</p>
                        </div>
                    </div>
                )}

                {performanceReviews.some(r => r.employeeId === currentUserId && r.status === 'Submitted') && (
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900">Performance Review Submitted</h4>
                            <p className="text-sm text-indigo-700 mt-0.5">Your self-evaluation has been submitted and is under review.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. Employment Info */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <User size={18} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Employment</span>
                        </div>
                        <h3 className="font-bold text-slate-900 leading-tight mb-1">{currentUser?.title}</h3>
                        <p className="text-slate-500 text-sm">{currentUser?.department}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                            {currentUser?.employmentType}
                        </span>
                        <span className="text-xs text-slate-400">• ID: {currentUser?.id}</span>
                    </div>
                    {/* Employment Status Badge */}
                    <div className="mt-3 bg-slate-50 rounded-lg p-2 border border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                        {/* Logic: If verifiedAt exists, assume Onboarded/Active. For now, we mock based on 'status' */}
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${currentUser?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span className="text-xs font-bold text-slate-700">
                                {currentUser?.status === 'active' ? 'Onboarded' : 'Probation'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Payroll Status */}
                <div id="payroll-status-card" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all duration-300">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Clock size={18} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Current Cycle</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-lg">{payrollStatus.month} {payrollStatus.year}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(payrollStatus.status)}`}>
                                {payrollStatus.status}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500">
                        Process Ref: #{payrollStatus.id}
                    </div>
                </div>

                {/* 3. Latest Net Pay */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CreditCard size={64} className="text-emerald-800" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CreditCard size={18} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Estimated Net Pay</span>
                        </div>
                        {isPayrollVisible ? (
                            <div className="font-mono text-2xl font-bold text-slate-900">
                                ₦{netPay.toLocaleString()}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic">Processing...</div>
                        )}
                        <p className="text-xs text-emerald-600/80 font-medium mt-1">Includes bonuses & deductions</p>
                    </div>
                    {isPayrollVisible && (
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <button
                                onClick={() => currentUser && generatePayslipPDF(currentUser, payrollStatus)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                                <FileDown size={14} /> Download Payslip
                            </button>
                        </div>
                    )}
                </div>

                {/* 4. Next Cycle Info */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Calendar size={18} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Next Payout</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Next Month</h3>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500">
                        Projected: 25th Feb 2026
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Payroll History Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase size={18} className="text-slate-400" />
                                Payroll History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Cycle</th>
                                        <th className="px-6 py-3 font-medium text-right">Gross Pay</th>
                                        <th className="px-6 py-3 font-medium text-right text-green-600">Bonus</th>
                                        <th className="px-6 py-3 font-medium text-right text-red-600">Deduction</th>
                                        <th className="px-6 py-3 font-medium text-right">Net Pay</th>
                                        <th className="px-6 py-3 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {/* Current Month (if visible) */}
                                    {/* History Rows */}
                                    {history.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{record.cycle}</td>
                                            <td className="px-6 py-4 text-right text-slate-500">₦{record.gross.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-slate-400">{record.bonus > 0 ? `+${record.bonus.toLocaleString()}` : '-'}</td>
                                            <td className="px-6 py-4 text-right text-slate-400">{record.deduction > 0 ? `-${record.deduction.toLocaleString()}` : '-'}</td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-700">₦{record.net.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500 font-medium">
                            <button
                                onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                                disabled={historyPage === 0}
                                className="disabled:opacity-30 hover:text-slate-800"
                            >
                                Previous Year
                            </button>
                            <span>Page {historyPage + 1}</span>
                            <button
                                onClick={() => setHistoryPage(p => p + 1)}
                                disabled={(historyPage + 1) * ITEMS_PER_PAGE >= historyData.length}
                                className="disabled:opacity-30 hover:text-slate-800"
                            >
                                Next Year
                            </button>
                        </div>
                    </div>
                </div>

                {/* Finance Updates Timeline */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-slate-400" />
                            Recent Finance Updates
                        </h3>
                        <div className="relative border-l border-slate-200 ml-3 space-y-8">
                            {timeline.length > 0 ? timeline.map((item, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`
                                        absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white
                                        ${item.type === 'Bonus' ? 'bg-green-500' : item.type === 'Deduction' ? 'bg-red-500' : 'bg-blue-500'}
                                    `}></div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">{item.type}</div>
                                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 mb-2">{item.desc}</p>
                                        {item.amount && (
                                            <div className={`text-xs font-mono font-bold ${item.type === 'Bonus' ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.type === 'Bonus' ? '+' : '-'} ₦{item.amount.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="text-[10px] text-slate-300 mt-2">{item.date}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-slate-400 italic pl-6">No recent updates</div>
                            )}
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="bg-linear-to-br from-brand-900 to-slate-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">My Profile</h3>
                            <p className="text-brand-200 text-sm mb-4">Keep your personal and contact details up to date.</p>
                            <Link to="/user/profile" className="inline-flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
                                View Profile <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                            <User size={120} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
