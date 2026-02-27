import React, { useState } from 'react';
import { X, User, QrCode, DollarSign, Clock, FileText, Mail, Phone, Briefcase, MapPin, Globe, Edit2, Save, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../data/mockData';
import { useAdmin } from '../context/AdminContext';
import { PUBLIC_LINK } from '../config';
import QRCode from 'react-qr-code';

interface EmployeeProfileModalProps {
    employee: Employee;
    onClose: () => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({ employee, onClose }) => {
    const { payrollStatus, activityLogs, toggleQRStatus, regenerateQR, updateEmployee } = useAdmin();
    const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'payroll' | 'activity'>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Edit Form State
    const [formData, setFormData] = useState({
        name: employee.name,
        email: employee.email,
        title: employee.title,
        department: employee.department,
        photoUrl: employee.photoUrl,
        phone: '+234 800 000 0000', // Mock phone since it's not in base type yet
        location: 'Abuja HQ',
        employmentType: employee.employmentType
    });

    const handleSave = () => {
        updateEmployee(employee.id, {
            name: formData.name,
            email: formData.email,
            title: formData.title,
            department: formData.department,
            photoUrl: formData.photoUrl,
            employmentType: formData.employmentType
        });
        setIsEditing(false);
    };

    // Derived Data
    const adjustments = payrollStatus.adjustments.filter(a => a.empId === employee.id);
    const relatedLogs = activityLogs.filter(log =>
        log.details?.includes(employee.name) || log.details?.includes(employee.id)
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'qr', label: 'QR & ID', icon: QrCode },
        { id: 'payroll', label: 'Payroll', icon: DollarSign },
        { id: 'activity', label: 'Activity Log', icon: Clock },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="relative bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Background */}
                <div className="bg-gradient-to-r from-[#0B1229] to-[#1a2342] absolute top-0 left-0 right-0 h-[180px] z-0" />

                {/* Action Buttons */}
                <div className="absolute top-6 right-6 z-50 flex gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                            title="Edit Profile"
                        >
                            <Edit2 size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors font-medium shadow-lg"
                            title="Save Changes"
                        >
                            <Save size={16} /> Save
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="relative z-10 px-8 pt-[60px] pb-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-[140px] h-[140px] rounded-2xl ring-4 ring-white shadow-xl bg-white overflow-hidden shrink-0 relative z-20 group">
                        <img src={formData.photoUrl} alt={employee.name} className="w-full h-full object-cover" />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium mb-1">Change Photo</span>
                                <input
                                    type="text"
                                    className="w-full text-xs p-1 rounded text-black"
                                    placeholder="https://..."
                                    aria-label="Photo URL"
                                    value={formData.photoUrl}
                                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                aria-label="Employee Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="text-3xl font-bold text-white mb-2 bg-white/10 border border-white/20 rounded px-2 w-full focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        ) : (
                            <h2 className="text-3xl font-bold text-white mb-2 shadow-black/10 drop-shadow-md">{formData.name}</h2>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        aria-label="Job Title"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="text-slate-200 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 w-32"
                                    />
                                    <span className="text-slate-400">•</span>
                                    <input
                                        type="text"
                                        aria-label="Department"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="text-slate-200 bg-white/10 border border-white/20 rounded px-1.5 py-0.5 w-32"
                                    />
                                </>
                            ) : (
                                <>
                                    <span className="text-slate-300 font-medium tracking-wide">{formData.title}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-300 font-medium tracking-wide">{formData.department}</span>
                                </>
                            )}

                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${employee.status === 'active' ? 'bg-[#00D66E] text-[#0B1229]' :
                                    employee.status === 'suspended' ? 'bg-amber-500 text-white' :
                                        employee.status === 'probation' ? 'bg-blue-500 text-white' :
                                            employee.status === 'onboarding' ? 'bg-slate-500 text-white' :
                                                'bg-red-500 text-white'}
                            `}>
                                {employee.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="px-8 mt-2 border-b border-slate-200 bg-white sticky top-0 z-10">
                    <nav className="flex gap-8 -mb-px overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-slate-900 text-slate-900'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    {activeTab === 'overview' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Contact Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    Contact Information
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <Mail size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</div>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    aria-label="Email Address"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900 break-all">{formData.email}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    aria-label="Phone Number"
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900">{formData.phone}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Office Location</div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    aria-label="Office Location"
                                                    value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900">{formData.location}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employment Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                    Employment Details
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase size={16} className="text-slate-400" />
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employment Type</span>
                                        </div>
                                        <div className="pl-6">
                                            {isEditing ? (
                                                <select
                                                    aria-label="Employment Type"
                                                    value={formData.employmentType}
                                                    onChange={e => setFormData({ ...formData, employmentType: e.target.value as any })}
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                                                >
                                                    <option value="Full-time">Full-time</option>
                                                    <option value="Part-time">Part-time</option>
                                                    <option value="Contract">Contract</option>
                                                    <option value="Intern">Intern</option>
                                                </select>
                                            ) : (
                                                <div className="text-sm font-medium text-slate-900">{employee.employmentType}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee ID</span>
                                            </div>
                                            <div className="pl-6">
                                                <div className="font-mono text-sm font-bold bg-slate-50 text-slate-700 inline-block px-3 py-1.5 rounded-lg border border-slate-200">
                                                    {employee.id}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={16} className="text-slate-400" />
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Joined</span>
                                            </div>
                                            <div className="pl-6">
                                                <div className="text-sm font-medium text-slate-900">Jan 12, 2024</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'qr' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                <h3 className="font-bold text-slate-900 mb-4">Current QR Code</h3>
                                <div className={`p-4 bg-white border-2 rounded-xl shadow-sm mb-4 transition-all ${employee.status === 'active' ? 'border-brand-500 ring-4 ring-brand-50' : 'border-slate-200 opacity-50 grayscale'}`}>
                                    <QRCode
                                        value={`${PUBLIC_LINK}/verify/${employee.id}`}
                                        size={160}
                                        level="H"
                                    />
                                </div>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${employee.status === 'active' || employee.status === 'probation' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    <div className={`w-2 h-2 rounded-full ${employee.status === 'active' || employee.status === 'probation' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    {employee.status === 'active' || employee.status === 'probation' ? 'Active & Valid' : 'Suspended / Invalid'}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-900 mb-4">Access Controls</h3>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => window.open(`${PUBLIC_LINK}/verify/${employee.id}`, '_blank')}
                                            className="w-full py-2.5 px-4 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <Globe size={16} />
                                            View Public Profile
                                        </button>

                                        <button
                                            onClick={() => toggleQRStatus(employee.id, (employee.status === 'active' || employee.status === 'probation') ? 'suspended' : 'active')}
                                            className={`w-full py-2.5 px-4 rounded-lg font-medium border transition-colors ${(employee.status === 'active' || employee.status === 'probation')
                                                ? 'border-red-200 text-red-700 hover:bg-red-50'
                                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {(employee.status === 'active' || employee.status === 'probation') ? 'Revoke QR Access' : 'Re-enable QR Access'}
                                        </button>
                                        <button
                                            onClick={() => regenerateQR([employee.id])}
                                            className="w-full py-2.5 px-4 rounded-lg font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
                                        >
                                            Regenerate New Code
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                    <strong>Note:</strong> Regenerating the QR code will invalidate the current physical ID card immediately. A reprint will be required.
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payroll' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-2xl font-bold text-slate-900">₦{employee.salary?.toLocaleString()}</div>
                                    <div className="text-xs text-slate-400 mt-1">/ month</div>
                                    <button
                                        onClick={() => { onClose(); navigate('/admin/promotions'); }}
                                        className="mt-4 text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                                    >
                                        <TrendingUp size={12} />
                                        Request Change
                                    </button>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Net Payable (Jan)</div>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {(employee.status === 'active' || employee.status === 'probation')
                                            ? `₦${(employee.salary + adjustments.reduce((sum, a) => sum + (a.type === 'Bonus' ? a.amount : -a.amount), 0)).toLocaleString()}`
                                            : '₦0.00'
                                        }
                                    </div>
                                    <div className="text-xs text-orange-600 mt-1 font-medium">
                                        {(employee.status === 'active' || employee.status === 'probation') ? payrollStatus.status : 'Not Eligible (Status)'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                                    Current Month Adjustments
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {adjustments.length > 0 ? adjustments.map((adj, i) => (
                                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-slate-900">{adj.reason}</div>
                                                <div className="text-xs text-slate-500">{adj.type}</div>
                                            </div>
                                            <div className={`font-mono font-bold ${adj.type === 'Bonus' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {adj.type === 'Bonus' ? '+' : '-'}₦{adj.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-6 text-center text-slate-500 italic">No adjustments for this cycle.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="divide-y divide-slate-100">
                                {relatedLogs.length > 0 ? relatedLogs.map(log => (
                                    <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1"><FileText size={16} className="text-slate-400" /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{log.actionType}</div>
                                                <div className="text-xs text-slate-500">{log.details}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-500 italic">No recent activity found regarding this employee.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
