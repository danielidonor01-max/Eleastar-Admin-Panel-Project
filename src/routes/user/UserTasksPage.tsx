import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { CheckCircle2, Clock, Play, Upload, X, AlertCircle, FileImage } from 'lucide-react';
import type { Task } from '../../data/mockData';

export const UserTasksPage: React.FC = () => {
    const tasks = useTaskStore((s) => s.tasks);
    const currentUserId = useAuthStore((s) => s.currentUserId);
    const updateTaskStatus = useTaskStore((s) => s.updateTaskStatus);
    const submitTaskEvidence = useTaskStore((s) => s.submitTaskEvidence);

    // Only show tasks assigned to this specific user
    const myTasks = tasks.filter(t => t.assignedTo === currentUserId);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Evidence Form State
    const [progressNotes, setProgressNotes] = useState('');
    const [evidenceB64, setEvidenceB64] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large', { description: 'Please select an image under 5MB.' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setEvidenceB64(prev => [...prev, base64String]);
        };
        reader.readAsDataURL(file);
    };

    const removeEvidence = (index: number) => {
        setEvidenceB64(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartTask = (taskId: string) => {
        updateTaskStatus(taskId, 'In Progress');
        toast.success('Task Started', { description: 'Status updated to In Progress.' });
        if (selectedTask?.id === taskId) {
            setSelectedTask({ ...selectedTask, status: 'In Progress' });
        }
    };

    const handleSubmitEvidence = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask) return;

        submitTaskEvidence(selectedTask.id, progressNotes, evidenceB64);
        toast.success('Evidence Submitted', { description: 'Your admin will review the task shortly.' });
        setSelectedTask({ ...selectedTask, status: 'In Review', progressNotes, evidenceUrls: evidenceB64 });
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
                <p className="text-slate-500 mt-1">View assignments, track deadlines, and submit your completion reports.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Assigned</p>
                    <p className="text-3xl font-bold text-slate-900">{myTasks.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-brand-200 shadow-sm bg-brand-50/50">
                    <p className="text-sm font-medium text-brand-700 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-brand-700">{myTasks.filter(t => t.status === 'In Progress').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm bg-amber-50/50">
                    <p className="text-sm font-medium text-amber-700 mb-1">In Review</p>
                    <p className="text-3xl font-bold text-amber-700">{myTasks.filter(t => t.status === 'In Review').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/50">
                    <p className="text-sm font-medium text-emerald-700 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-emerald-700">{myTasks.filter(t => t.status === 'Completed').length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-320px)] min-h-[500px]">

                {/* Task List */}
                <div className={`lg:w-1/3 border-r border-slate-200 flex flex-col ${selectedTask ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto">
                        {myTasks.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <CheckCircle2 className="mx-auto mb-4 text-slate-300" size={48} />
                                <p>You have no pending tasks. Great job!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {myTasks.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()).map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setProgressNotes(task.progressNotes || '');
                                            setEvidenceB64(task.evidenceUrls || []);
                                        }}
                                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-4 ${selectedTask?.id === task.id ? 'bg-brand-50 border-l-4 border-brand-600' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="mt-1">
                                            {task.status === 'Completed' ? (
                                                <CheckCircle2 className="text-emerald-500" size={18} />
                                            ) : task.status === 'In Review' ? (
                                                <AlertCircle className="text-amber-500" size={18} />
                                            ) : task.status === 'In Progress' ? (
                                                <Play className="text-brand-500" size={18} />
                                            ) : (
                                                <Clock className="text-slate-400" size={18} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-slate-900 truncate pr-2">{task.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate mb-1">{task.description}</p>
                                            <p className="text-xs text-slate-400 font-medium">Due: {new Date(task.deliveryDate).toLocaleDateString()}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Viewer */}
                <div className={`lg:w-2/3 flex flex-col bg-slate-50 ${!selectedTask ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedTask ? (
                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200">
                            {/* Header */}
                            <div className="p-6 bg-white border-b border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedTask.title}</h2>
                                <p className="text-sm text-slate-500 mb-4">Assigned on: {new Date(selectedTask.createdAt).toLocaleDateString()} • Due: {new Date(selectedTask.deliveryDate).toLocaleDateString()}</p>

                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-slate-700 leading-relaxed text-sm">
                                    {selectedTask.description}
                                </div>
                            </div>

                            {/* Evidence Form / Display */}
                            <div className="p-6 flex-1 overflow-y-auto">

                                {selectedTask.status === 'Pending' ? (
                                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                                        <Play size={48} className="mx-auto text-slate-300 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to start?</h3>
                                        <p className="text-slate-500 mb-6">Mark this task as "In Progress" to let your admin know you've begun working on it.</p>
                                        <button onClick={() => handleStartTask(selectedTask.id)} className="btn btn-primary">
                                            Start Task
                                        </button>
                                    </div>
                                ) : selectedTask.status === 'In Progress' ? (
                                    <form onSubmit={handleSubmitEvidence} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
                                        <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">Submit Delivery Evidence</h3>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Progress Notes / Report <span className="text-red-500">*</span></label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={progressNotes}
                                                title="Progress notes regarding this task"
                                                aria-label="Progress notes regarding this task"
                                                onChange={(e) => setProgressNotes(e.target.value)}
                                                placeholder="Describe what was accomplished..."
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Attach Evidence (Image)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />

                                            <div className="flex flex-wrap gap-4 mb-4">
                                                {evidenceB64.map((b64, index) => (
                                                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                                                        <img src={b64} alt={`Evidence ${index}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEvidence(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:text-brand-600 hover:border-brand-500 transition-colors bg-slate-50"
                                                >
                                                    <Upload size={20} className="mb-1" />
                                                    <span className="text-[10px] font-medium">Upload File</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-slate-100">
                                            <button type="submit" className="btn btn-primary">
                                                <FileImage size={18} className="mr-2" />
                                                Submit Task for Review
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Read-Only State for In Review / Completed */}
                                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <CheckCircle2 size={18} className={selectedTask.status === 'Completed' ? "text-emerald-500" : "text-amber-500"} />
                                                {selectedTask.status === 'Completed' ? 'Task Completed & Reviewed' : 'Task Pending Admin Review'}
                                            </h3>
                                            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                                                {selectedTask.progressNotes}
                                            </p>
                                        </div>

                                        {selectedTask.evidenceUrls && selectedTask.evidenceUrls.length > 0 && (
                                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                                <h3 className="font-bold text-slate-900 mb-4">Attached Evidence</h3>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {selectedTask.evidenceUrls.map((url, index) => (
                                                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-32 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                                                            <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle2 size={64} className="mb-4 text-slate-300 opacity-50" />
                            <p className="text-lg font-medium text-slate-500">Task Details</p>
                            <p className="text-sm">Select a task from the list to view requirements or submit evidence.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
