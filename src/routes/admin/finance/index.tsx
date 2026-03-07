import { useState, useMemo } from 'react';
import { useAdmin } from '@/context/admin';
import {
    ShieldCheck,
    Landmark,
    CheckCircle,
    Clock,
    Lock,
    FileText
} from 'lucide-react';
import { PinAuthorizationModal } from '@/components/PinAuthorizationModal';
import { useFeedback } from '@/context/FeedbackContext';
import type { LedgerEntry } from '@/types';

export function FinanceLedgerPage() {
    const {
        payrollStatus,
        ledgerEntries,
        approveLedgerFunding,
        executeLedgerBatch,
        currentUserRole
    } = useAdmin();
    const { showSuccess, showError } = useFeedback();

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'history'>('pending');

    // Filter Logic
    const currentCycleEntries = useMemo(() => {
        return ledgerEntries.filter((e: LedgerEntry) => e.payrollCycleId === payrollStatus.id);
    }, [ledgerEntries, payrollStatus.id]);

    const pendingFunding = currentCycleEntries.filter((e: LedgerEntry) => e.status === 'Pending Funding');
    const fundedReady = currentCycleEntries.filter((e: LedgerEntry) => e.status === 'Funded');
    const executed = currentCycleEntries.filter((e: LedgerEntry) => e.status === 'Executed');

    // Totals
    const pendingTotal = pendingFunding.reduce((sum: number, e: LedgerEntry) => sum + e.amount, 0);
    const fundedTotal = fundedReady.reduce((sum: number, e: LedgerEntry) => sum + e.amount, 0);

    const handleFundingApproval = async (pin: string) => {
        
        const result = await approveLedgerFunding(payrollStatus.id, pin);
        if (result.data) {
            showSuccess({ title: 'Funding Approved', message: 'Ledger is now ready for execution.' });
            setActiveTab('ready'); 
        } else {
            showError({ title: 'Approval Failed', message: result.message || 'Invalid PIN' });
        }
    };

    const handleExecution = async () => {

        const result = await executeLedgerBatch(payrollStatus.id);
        if (result.data) {
            showSuccess({ title: 'Payments Executed', message: `Successfully processed ${fundedReady.length} payments.` });
            setActiveTab('history');
        } else {
            showError({ title: 'Execution Failed', message: result.message || 'Unknown error' });
        }
    };

    // Permission Guard
    if (!['Super Admin', 'Finance Admin', 'COO'].includes(currentUserRole)) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <Lock size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
                <p>This module is for Finance and Executive use only.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Finance Ledger</h1>
                    <p className="text-slate-500">Cycle: {payrollStatus.month} {payrollStatus.year}</p>
                </div>
                <div className="flex gap-2">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${payrollStatus.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {payrollStatus.status}
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-500">Pending Funding</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">₦{pendingTotal.toLocaleString()}</div>
                    <p className="text-sm text-slate-500">{pendingFunding.length} transactions waiting</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={20} /></div>
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-500">Ready to Execute</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">₦{fundedTotal.toLocaleString()}</div>
                    <p className="text-sm text-slate-500">{fundedReady.length} funded & verified</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Landmark size={20} /></div>
                        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-500">Executed (YTD)</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">₦{ledgerEntries.filter((e: LedgerEntry) => e.status === 'Executed').reduce((s: number, e: LedgerEntry) => s + e.amount, 0).toLocaleString()}</div>
                    <p className="text-sm text-slate-500">Total processed volume</p>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'pending' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Clock size={16} /> Pending Funding ({pendingFunding.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ready')}
                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'ready' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <ShieldCheck size={16} /> Ready for Execution ({fundedReady.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'history' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <FileText size={16} /> Execution History
                    </button>
                </div>

                <div className="p-6">
                    {/* TABLE VIEW */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Employee</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Bank Details</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    {activeTab === 'history' && <th className="px-4 py-3">Ref ID</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(activeTab === 'pending' ? pendingFunding : activeTab === 'ready' ? fundedReady : executed).length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                            No entries found in flight.
                                        </td>
                                    </tr>
                                ) : (
                                    (activeTab === 'pending' ? pendingFunding : activeTab === 'ready' ? fundedReady : executed).map((entry: LedgerEntry) => (
                                        <tr key={entry.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{entry.employeeName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs ${entry.type === 'Bonus' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {entry.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {entry.bankDetails.bankName} •••• {entry.bankDetails.accountNumber.slice(-4)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-slate-900">
                                                ₦{entry.amount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {entry.status === 'Pending Funding' && <span className="text-amber-600 flex items-center gap-1"><Clock size={12} /> Awaiting Approval</span>}
                                                {entry.status === 'Funded' && <span className="text-blue-600 flex items-center gap-1"><CheckCircle size={12} /> Approved</span>}
                                                {entry.status === 'Executed' && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Paid</span>}
                                            </td>
                                            {activeTab === 'history' && (
                                                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                                    {entry.transactionReference}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ACTION FOOTER */}
                    <div className="mt-8 flex justify-end">
                        {activeTab === 'pending' && pendingFunding.length > 0 && (
                            <button
                                onClick={() => setIsPinModalOpen(true)}
                                className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 font-medium flex items-center gap-2 shadow-sm"
                            >
                                <ShieldCheck size={20} />
                                Approve Funding (₦{pendingTotal.toLocaleString()})
                            </button>
                        )}

                        {activeTab === 'ready' && fundedReady.length > 0 && (
                            <button
                                onClick={handleExecution}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2 shadow-sm"
                            >
                                <Landmark size={20} />
                                Execute Payments (₦{fundedTotal.toLocaleString()})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <PinAuthorizationModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleFundingApproval}
                requiredLevel="SENSITIVE"
                title="Authorize Fund Release"
                description={`You are about to authorize the release of ₦${pendingTotal.toLocaleString()} for payroll execution. This action is irreversible.`}
            />
        </div>
    );
}
