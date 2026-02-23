import React, { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, MapPin, Clock, School, Calendar, ChevronRight, FileText } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useLocation } from 'react-router-dom';
import type { Job } from '../../data/mockData';

export const RecruitmentPage: React.FC = () => {
    const { jobs, addJob, updateJob } = useAdmin();
    const { showConfirm, showInfo } = useFeedback();
    const [activeTab, setActiveTab] = useState<'jobs' | 'techhub'>('jobs');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const location = useLocation();

    // Deep Linking Handler
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const jobId = params.get('jobId');
        if (jobId) {
            const job = jobs.find(j => j.id === jobId);
            if (job) {
                // Determine which tab to switch to? For now assumed 'jobs'
                // If the job exists, we open the modal
                setSelectedJobId(jobId);
            }
        }
    }, [location.search, jobs]);

    const selectedJob = jobs.find(j => j.id === selectedJobId);

    // Form State
    const [newJob, setNewJob] = useState<Partial<Job>>({
        type: 'Full-time',
        location: 'Abuja (Hybrid)',
        status: 'Published',
        description: ''
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newJob.title || !newJob.department || !newJob.description) return;

        const job: Omit<Job, 'tenantId'> = {
            id: `JOB-${Math.floor(Math.random() * 1000)}`,
            title: newJob.title!,
            department: newJob.department!,
            type: newJob.type as any,
            location: newJob.location || 'Remote',
            applicants: 0,
            status: 'Published',
            postedAt: new Date().toISOString(),
            description: newJob.description!,
            deadline: newJob.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 30 days
        };
        addJob(job);
        setShowAddModal(false);
        setNewJob({ type: 'Full-time', location: 'Abuja (Hybrid)', status: 'Published', description: '' });
    };

    const handleCloseRole = (id: string) => {
        showConfirm({
            title: 'Close Role',
            message: 'Are you sure you want to close this role? It will no longer be visible to applicants.',
            confirmLabel: 'Close Role',
            isDestructive: true,
            onConfirm: () => updateJob(id, { status: 'Closed' })
        });
    };

    const totalApplications = jobs.reduce((sum, job) => sum + job.applicants, 0);
    const openRoles = jobs.filter(j => j.status === 'Published').length;

    return (
        <div>
            {/* Header & Tabs */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Recruitment & Tech Hub</h1>
                        <p className="text-slate-500">Manage job listings, applications, and tech cohorts.</p>
                    </div>
                    {activeTab === 'jobs' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary"
                        >
                            <Plus size={18} /> Post New Role
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Job Openings
                    </button>
                    <button
                        onClick={() => setActiveTab('techhub')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'techhub' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Tech Hub Cohorts
                    </button>
                </div>
            </div>

            {/* Stats Overview (Global) */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{totalApplications}</div>
                        <div className="text-xs text-slate-500 font-medium">Total Applications</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{openRoles}</div>
                        <div className="text-xs text-slate-500 font-medium">Active Job Listings</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                        <School size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">2</div>
                        <div className="text-xs text-slate-500 font-medium">Active Cohorts</div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'jobs' ? (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <span className="font-bold text-slate-700">Active Job Listings</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {jobs.length > 0 ? jobs.map(role => (
                            <div key={role.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-lg text-slate-900">{role.title}</h3>
                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${role.status === 'Published'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {role.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                        <span className="flex items-center gap-1"><Briefcase size={14} /> {role.department}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14} /> {role.location}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {role.type}</span>
                                        {role.deadline && <span className="flex items-center gap-1 text-orange-600"><Calendar size={14} /> Due: {role.deadline}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-center">
                                    <div className="text-right mr-4 hidden md:block">
                                        <div className="text-2xl font-bold text-slate-900">{role.applicationList?.length || 0}</div>
                                        <div className="text-xs text-slate-500">Applicants</div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedJobId(role.id)}
                                        className="btn-secondary"
                                    >
                                        View Applicants
                                    </button>

                                    {role.status === 'Published' && (
                                        <button
                                            onClick={() => handleCloseRole(role.id)}
                                            className="btn-secondary text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                    <Briefcase size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No active job listings</h3>
                                <p className="text-slate-500 mb-6">Create a new job posting to start recruiting.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn-primary"
                                >
                                    Post First Role
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tech Hub Cohorts View (Mocked for now as requested) */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 mx-auto">
                            <School size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Tech Hub Cohort Management</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8">
                            Manage student applications, batches, and curriculum schedules for the Eleastar Tech Hub.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                            <div className="border border-slate-200 rounded-xl p-6 hover:border-purple-200 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">Active</span>
                                    <ChevronRight className="text-slate-400 group-hover:text-brand-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Cohort 3.0 (2025/Late)</h3>
                                <p className="text-sm text-slate-500 mb-4">Frontend & Backend Engineering</p>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span>👥 45 Students</span>
                                    <span>📅 Ends Feb 2026</span>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-6 hover:border-purple-200 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Upcoming</span>
                                    <ChevronRight className="text-slate-400 group-hover:text-brand-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Cohort 4.0 (2026/Early)</h3>
                                <p className="text-sm text-slate-500 mb-4">Full Stack & Product Design</p>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <span>📝 Applications Open</span>
                                    <span>📅 Starts Mar 2026</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-600 transition-colors cursor-pointer min-h-[150px]">
                                <Plus size={24} className="mb-2" />
                                <span className="font-bold">Create New Cohort Batch</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Job Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                                    <Briefcase size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Post New Role</h2>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="btn-ghost btn-icon text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="job-title" className="block text-sm font-bold text-slate-900 mb-1">Job Title <span className="text-red-500">*</span></label>
                                    <input
                                        id="job-title"
                                        type="text"
                                        required
                                        placeholder="e.g. Senior Frontend Engineer"
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                        value={newJob.title || ''}
                                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="job-dept" className="block text-sm font-bold text-slate-900 mb-1">Department</label>
                                        <select
                                            id="job-dept"
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            value={newJob.department || 'Engineering'}
                                            onChange={e => setNewJob({ ...newJob, department: e.target.value })}
                                        >
                                            <option>Engineering</option>
                                            <option>Product</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                            <option>Operations</option>
                                            <option>HR</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="job-type" className="block text-sm font-bold text-slate-900 mb-1">Employment Type</label>
                                        <select
                                            id="job-type"
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            value={newJob.type || 'Full-time'}
                                            onChange={e => setNewJob({ ...newJob, type: e.target.value as any })}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="job-loc" className="block text-sm font-bold text-slate-900 mb-1">Location</label>
                                        <input
                                            id="job-loc"
                                            type="text"
                                            required
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            value={newJob.location || ''}
                                            onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="job-deadline" className="block text-sm font-bold text-slate-900 mb-1">Application Deadline</label>
                                        <input
                                            id="job-deadline"
                                            type="date"
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500"
                                            value={newJob.deadline || ''}
                                            onChange={e => setNewJob({ ...newJob, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="job-desc" className="block text-sm font-bold text-slate-900 mb-1">Job Description <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <FileText className="absolute top-3 left-3 text-slate-400" size={18} />
                                        <textarea
                                            id="job-desc"
                                            required
                                            rows={6}
                                            placeholder="Describe the role, responsibilities, and requirements..."
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                            value={newJob.description || ''}
                                            onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">Cancel</button>
                                <button type="submit" className="btn-primary">Post Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applicant List Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Applicants</h2>
                                <p className="text-slate-500 text-sm">For {selectedJob.title}</p>
                            </div>
                            <button onClick={() => setSelectedJobId(null)} className="btn-ghost btn-icon rounded-full">
                                <span className="sr-only">Close</span>
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            {selectedJob.applicationList && selectedJob.applicationList.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {selectedJob.applicationList.map(app => (
                                        <div key={app.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group">
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                    {app.candidateName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{app.candidateName}</div>
                                                    <div className="text-sm text-slate-500">{app.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${app.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    app.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => showInfo({ title: 'View Profile', message: `Opening profile for ${app.candidateName}... (Mock Action)` })}
                                                        className="text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-1.5 bg-brand-50 rounded-lg">
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => showInfo({ title: 'Download Resume', message: `Downloading resume for ${app.candidateName}... (Mock Action)` })}
                                                        className="text-xs font-medium text-slate-600 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg">
                                                        Resume
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users size={24} className="text-slate-400" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">No applicants yet</h3>
                                    <p className="text-sm">Wait for candidates to apply or share the job posting.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
                            <button onClick={() => setSelectedJobId(null)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
