import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Search, Filter, MailOpen, Mail, CheckCircle2, Trash2, Clock, X } from 'lucide-react';
import type { Inquiry } from '../../data/mockData';

export const InquiriesPage: React.FC = () => {
    const { inquiries, markInquiryAsRead, resolveInquiry, deleteInquiry } = useAdmin();
    const { showConfirm, showSuccess } = useFeedback();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'resolved'>('all');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

    // Filter Logic
    const filteredInquiries = inquiries.filter(inq => {
        const matchesSearch = inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewInquiry = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        if (inquiry.status === 'unread') {
            markInquiryAsRead(inquiry.id);
        }
    };

    const handleResolve = (id: string) => {
        showConfirm({
            title: 'Resolve Inquiry',
            message: 'Are you sure you want to mark this inquiry as resolved?',
            onConfirm: () => {
                resolveInquiry(id);
                showSuccess({ title: 'Resolved', message: 'Inquiry marked as resolved.' });
                setSelectedInquiry(null);
            }
        });
    };

    const handleDelete = (id: string) => {
        showConfirm({
            title: 'Delete Inquiry',
            message: 'Are you sure you want to permanently delete this inquiry?',
            confirmLabel: 'Delete',
            isDestructive: true,
            onConfirm: () => {
                deleteInquiry(id);
                showSuccess({ title: 'Deleted', message: 'Inquiry removed permanently.' });
                setSelectedInquiry(null);
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Inquiries Tracker</h1>
                    <p className="text-slate-500 mt-1">Manage and respond to website contact form submissions.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 text-center min-w-[100px]">
                        <div className="text-2xl font-bold text-slate-900">{inquiries.filter(i => i.status === 'unread').length}</div>
                        <div className="text-xs text-slate-500 font-medium">Unread</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 text-center min-w-[100px]">
                        <div className="text-2xl font-bold text-slate-900">{inquiries.filter(i => i.status === 'resolved').length}</div>
                        <div className="text-xs text-slate-500 font-medium">Resolved</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search name, email, or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-slate-400" />
                    <select
                        title="Filter inquiries by status"
                        aria-label="Filter inquiries by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    >
                        <option value="all">All Statuses</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Inbox Layout */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-250px)] min-h-[500px]">

                {/* List View */}
                <div className={`lg:w-1/3 border-r border-slate-200 flex flex-col ${selectedInquiry ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto">
                        {filteredInquiries.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <Mail className="mx-auto mb-4 text-slate-300" size={48} />
                                <p>No inquiries found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredInquiries.map(inq => (
                                    <button
                                        key={inq.id}
                                        onClick={() => handleViewInquiry(inq)}
                                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-4 ${selectedInquiry?.id === inq.id ? 'bg-brand-50 border-l-4 border-brand-600' : 'border-l-4 border-transparent'} ${inq.status === 'unread' ? 'bg-white' : 'bg-slate-50/50'}`}
                                    >
                                        <div className="mt-1">
                                            {inq.status === 'unread' ? (
                                                <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1" />
                                            ) : inq.status === 'resolved' ? (
                                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                                            ) : (
                                                <MailOpen size={16} className="text-slate-400 mt-0.5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm truncate pr-2 ${inq.status === 'unread' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {inq.name}
                                                </h4>
                                                <span className="text-xs text-slate-500 whitespace-nowrap">
                                                    {new Date(inq.submittedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate mb-1 ${inq.status === 'unread' ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                                                {inq.subject}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {inq.message}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className={`lg:w-2/3 flex flex-col bg-slate-50 ${!selectedInquiry ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedInquiry ? (
                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200">
                            {/* Detail Header */}
                            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-slate-900">{selectedInquiry.subject}</h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${selectedInquiry.status === 'unread' ? 'bg-brand-100 text-brand-700' :
                                            selectedInquiry.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                            {selectedInquiry.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="font-medium text-slate-900">{selectedInquiry.name}</span>
                                        <span>&lt;{selectedInquiry.email}&gt;</span>
                                        <span className="mx-2">•</span>
                                        <Clock size={14} />
                                        <span>{new Date(selectedInquiry.submittedAt).toLocaleString()}</span>
                                    </div>
                                    {(selectedInquiry.company || selectedInquiry.phone) && (
                                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                                            {selectedInquiry.company && (
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium">Company:</span> {selectedInquiry.company}
                                                </div>
                                            )}
                                            {selectedInquiry.phone && (
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium">Phone:</span> {selectedInquiry.phone}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedInquiry(null)}
                                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                                        title="Close details"
                                        aria-label="Close inquiry details"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="p-8 flex-1 overflow-y-auto">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 min-h-[300px] whitespace-pre-wrap text-slate-700 leading-relaxed font-mono text-sm">
                                    {selectedInquiry.message}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
                                <button
                                    onClick={() => handleDelete(selectedInquiry.id)}
                                    className="btn btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete Inquiry
                                </button>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            window.location.href = `mailto:${selectedInquiry.email}?subject=RE: ${selectedInquiry.subject}`;
                                        }}
                                        className="btn btn-outline"
                                    >
                                        Reply via Email
                                    </button>
                                    {selectedInquiry.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleResolve(selectedInquiry.id)}
                                            className="btn btn-primary"
                                        >
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Mark as Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <Mail size={64} className="mb-4 text-slate-300 opacity-50" />
                            <p className="text-lg font-medium text-slate-500">Select an inquiry to read</p>
                            <p className="text-sm">Choose a message from the list to view its contents.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
