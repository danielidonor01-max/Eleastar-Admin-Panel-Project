// @ts-nocheck
import { useState, useMemo } from 'react';
import { useAdmin } from '@/context/admin';
import {
    FileText,
    Lock,
    Download,
    Calendar,
    Filter,
    Shield,
    TrendingUp,
    Users,
    DollarSign,
    Activity
} from 'lucide-react';
import { useFeedback } from '@/context/FeedbackContext';
import { exportToCSV, exportToPDF, generateAttestationPack, formatDateForFilename } from '@/utils/exportUtils';

type ReportTab = 'payroll' | 'hr' | 'access' | 'attestation';

export function ComplianceReportsPage() {
    const {
        currentUserRole,
        payrollStatus,
        employees,
        generatePayrollSummaryReport,
        generateApprovalTrailReport,
        generateBonusAdjustmentReport,
        generatePayrollVarianceReport,
        generateSalaryHistoryReport,
        generatePromotionHistoryReport,
        generateUserAccessReport,
        generateCriticalActionReport,
        generateAttestationPack
    } = useAdmin();
    const { showSuccess, showInfo } = useFeedback();

    const [activeTab, setActiveTab] = useState<ReportTab>('payroll');
    const [selectedReport, setSelectedReport] = useState<string>('payroll-summary');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');

    // Permission Guard - Restrict to specific roles
    const allowedRoles = ['Super Admin', 'COO', 'Chief Risk Officer', 'Finance Admin', 'HR Admin'];
    if (!allowedRoles.includes(currentUserRole)) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <Lock size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
                <p>Compliance Reports are restricted to authorized personnel only.</p>
            </div>
        );
    }

    // Generate Current Report Data
    const currentReportData = useMemo(() => {
        switch (selectedReport) {
            case 'payroll-summary':
                return generatePayrollSummaryReport(payrollStatus.id);
            case 'approval-trail':
                return generateApprovalTrailReport(payrollStatus.id);
            case 'bonus-adjustment':
                return generateBonusAdjustmentReport(payrollStatus.id);
            case 'payroll-variance':
                return generatePayrollVarianceReport(payrollStatus.id, 'PREV-CYCLE');
            case 'salary-history':
                return generateSalaryHistoryReport(selectedEmployee, dateRange.start, dateRange.end);
            case 'promotion-history':
                return generatePromotionHistoryReport(dateRange.start, dateRange.end);
            case 'user-access':
                return generateUserAccessReport();
            case 'critical-action':
                return generateCriticalActionReport(dateRange.start, dateRange.end);
            default:
                return [];
        }
    }, [selectedReport, payrollStatus.id, selectedEmployee, dateRange]);

    const handleExportCSV = () => {
        const reportName = reportsByTab[activeTab].find(r => r.id === selectedReport)?.label || 'Report';
        const filename = `${reportName.replace(/ /g, '_')}_${formatDateForFilename(new Date())}`;
        exportToCSV(currentReportData, filename);
        showSuccess({ title: 'Export Complete', message: `${reportName} exported as CSV successfully` });
    };

    const handleExportPDF = () => {
        const reportName = reportsByTab[activeTab].find(r => r.id === selectedReport)?.label || 'Report';
        const filename = `${reportName.replace(/ /g, '_')}_${formatDateForFilename(new Date())}`;
        exportToPDF(currentReportData, reportName, filename);
        showSuccess({ title: 'Export Complete', message: `${reportName} prepared for PDF export` });
    };

    const handleGenerateAttestationPack = () => {
        const reports = [
            { name: 'Payroll_Summary', data: generatePayrollSummaryReport(payrollStatus.id) },
            { name: 'Approval_Trail', data: generateApprovalTrailReport(payrollStatus.id) },
            { name: 'Salary_History', data: generateSalaryHistoryReport() },
            { name: 'User_Access', data: generateUserAccessReport() }
        ];

        generateAttestationPack(reports, dateRange);
        showSuccess({ title: 'Attestation Pack Generated', message: `${reports.length} reports exported` });
    };

    const tabs = [
        { id: 'payroll', label: 'Payroll Compliance', icon: DollarSign },
        { id: 'hr', label: 'HR & Compensation', icon: TrendingUp },
        { id: 'access', label: 'Access & Activity', icon: Users },
        { id: 'attestation', label: 'Attestation Packs', icon: Shield }
    ];

    const reportsByTab = {
        payroll: [
            { id: 'payroll-summary', label: 'Payroll Summary', icon: FileText },
            { id: 'approval-trail', label: 'Approval Trail', icon: Shield },
            { id: 'bonus-adjustment', label: 'Bonus Adjustments', icon: DollarSign },
            { id: 'payroll-variance', label: 'Payroll Variance', icon: TrendingUp }
        ],
        hr: [
            { id: 'salary-history', label: 'Salary History', icon: DollarSign },
            { id: 'promotion-history', label: 'Promotion History', icon: TrendingUp }
        ],
        access: [
            { id: 'user-access', label: 'User Access Log', icon: Users },
            { id: 'critical-action', label: 'Critical Actions', icon: Activity }
        ],
        attestation: []
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Compliance Reports</h1>
                    <p className="text-slate-500">Generate audit-grade reports for compliance verification</p>
                </div>
                <div className="flex items-center gap-2">
                    <Shield size={20} className="text-brand-600" />
                    <span className="text-sm font-medium text-slate-600">
                        {currentUserRole}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as ReportTab);
                                    if (reportsByTab[tab.id as ReportTab].length > 0) {
                                        setSelectedReport(reportsByTab[tab.id as ReportTab][0].id);
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-brand-600 text-brand-600 font-medium'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-6">
                {/* Sidebar - Report Selection */}
                {activeTab !== 'attestation' && (
                    <div className="col-span-3 space-y-2">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Report Type</h3>
                        {reportsByTab[activeTab].map((report) => {
                            const Icon = report.icon;
                            return (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${selectedReport === report.id
                                        ? 'bg-brand-50 text-brand-700 font-medium border border-brand-200'
                                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm">{report.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Report Display Area */}
                <div className={activeTab === 'attestation' ? 'col-span-12' : 'col-span-9'}>
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        {activeTab === 'attestation' ? (
                            // Attestation Pack Generator
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield size={24} className="text-brand-600" />
                                    <h2 className="text-xl font-bold text-slate-900">Generate Attestation Pack</h2>
                                </div>
                                <p className="text-slate-600 mb-6">
                                    Create a comprehensive compliance package containing multiple reports,
                                    cryptographically signed and ready for audit submission.
                                </p>

                                {/* Period Selector */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateAttestationPack}
                                    className="btn-primary flex items-center gap-2"
                                    disabled={!dateRange.start || !dateRange.end}
                                >
                                    <Download size={18} />
                                    Generate Attestation Pack (ZIP)
                                </button>

                                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-slate-900 mb-2">What's Included:</h4>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• Payroll Summary Report</li>
                                        <li>• Approval Trail with Digital Signatures</li>
                                        <li>• Salary History & Adjustments</li>
                                        <li>• Promotion & Bonus Records</li>
                                        <li>• Critical Action Logs</li>
                                        <li>• SHA-256 Checksum Manifest</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            // Regular Report Display
                            <>
                                {/* Filters */}
                                <div className="flex gap-4 mb-6 pb-4 border-b border-slate-200">
                                    {(selectedReport === 'salary-history' || selectedReport === 'promotion-history' || selectedReport === 'critical-action') && (
                                        <>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                                    <Calendar size={14} className="inline mr-1" />
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dateRange.start}
                                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                                    <Calendar size={14} className="inline mr-1" />
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={dateRange.end}
                                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                                />
                                            </div>
                                        </>
                                    )}
                                    {selectedReport === 'salary-history' && (
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                <Filter size={14} className="inline mr-1" />
                                                Employee
                                            </label>
                                            <select
                                                value={selectedEmployee}
                                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            >
                                                <option value="">All Employees</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Export Actions */}
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {reportsByTab[activeTab].find(r => r.id === selectedReport)?.label}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleExportCSV}
                                            className="btn-secondary flex items-center gap-2 text-sm"
                                        >
                                            <Download size={16} />
                                            CSV
                                        </button>
                                        <button
                                            onClick={handleExportPDF}
                                            className="btn-secondary flex items-center gap-2 text-sm"
                                        >
                                            <Download size={16} />
                                            PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Report Data Table */}
                                {currentReportData.length === 0 ? (
                                    <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                            <FileText size={32} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Report Data Available</h3>
                                        <p className="text-sm max-w-md mx-auto mb-6">
                                            Select specific filters above and click "Export" or "Generate" to create a new compliance report.
                                            Ensure payroll cycles are processed for data to appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Details</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Timestamp</th>
                                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {currentReportData.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-slate-900">{item.id || idx + 1}</td>
                                                        <td className="px-4 py-3 text-slate-600">{item.details || 'N/A'}</td>
                                                        <td className="px-4 py-3 text-slate-600">{item.timestamp || 'N/A'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                                {item.status || 'Complete'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
