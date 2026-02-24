import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useFeedback } from '../../context/FeedbackContext';
import { Search, Filter, Plus, Calendar, AlertCircle, CheckCircle2, Clock, Eye } from 'lucide-react';
import type { Task } from '../../data/mockData';

export const AdminTasksPage: React.FC = () => {
    const { tasks, employees, createTask, updateTaskStatus } = useAdmin();
    const { showConfirm, showSuccess } = useFeedback();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | Task['status']>('All');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('Medium');
    const [deliveryDate, setDeliveryDate] = useState('');

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        createTask({
            title,
            description,
            assignedTo,
            assignedBy: 'EMP-001', // Should ideally come from current user session
            priority,
            deliveryDate: new Date(deliveryDate).toISOString()
        });
        showSuccess({ title: 'Task Created', message: 'The task has been successfully assigned.' });
        setIsCreateModalOpen(false);
        // Reset
        setTitle(''); setDescription(''); setAssignedTo(''); setPriority('Medium'); setDeliveryDate('');
    };

    const handleMarkComplete = (taskId: string) => {
        showConfirm({
            title: 'Complete Task',
            message: 'Are you sure you want to formally mark this task as completed?',
            confirmLabel: 'Complete',
            onConfirm: () => {
                updateTaskStatus(taskId, 'Completed');
                showSuccess({ title: 'Task Completed', message: 'The task has been finalized and logged.' });
                setSelectedTask(null);
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Task Management</h1>
                    <p className="text-slate-500 mt-1">Assign tasks and monitor personnel evidence reports.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn btn-primary"
                >
                    <Plus size={20} className="mr-2" />
                    Assign New Task
                </button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
                        <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
                        <p className="text-3xl font-bold text-brand-600">{tasks.filter(t => t.status === 'In Progress').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                        <Clock size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Awaiting Review</p>
                        <p className="text-3xl font-bold text-amber-600">{tasks.filter(t => t.status === 'In Review').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                        <AlertCircle size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-emerald-600">{tasks.filter(t => t.status === 'Completed').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={24} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-slate-400" />
                    <select
                        title="Filter tasks by status"
                        aria-label="Filter tasks by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Layout Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-320px)] min-h-[500px]">

                {/* Task List Drawer */}
                <div className={`lg:w-1/3 border-r border-slate-200 flex flex-col ${selectedTask ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto">
                        {filteredTasks.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <p>No tasks found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredTasks.map(task => {
                                    const assignee = employees.find(e => e.id === task.assignedTo);
                                    return (
                                        <button
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedTask?.id === task.id ? 'bg-brand-50 border-l-4 border-brand-600' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-slate-900 truncate pr-2">{task.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    task.status === 'In Review' ? 'bg-amber-100 text-amber-700' :
                                                        task.status === 'In Progress' ? 'bg-brand-100 text-brand-700' :
                                                            'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500 line-clamp-2 mb-2">{task.description}</div>
                                            <div className="flex justify-between items-center text-xs text-slate-400">
                                                <span>{assignee ? assignee.name : 'Unknown'}</span>
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(task.deliveryDate).toLocaleDateString()}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Viewer */}
                <div className={`lg:w-2/3 flex flex-col bg-slate-50 ${!selectedTask ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedTask ? (
                        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-200">
                            {/* Header */}
                            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedTask.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedTask.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                            selectedTask.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                                selectedTask.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {selectedTask.priority} Priority
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} className="text-slate-400" /> Due: {new Date(selectedTask.deliveryDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="text-slate-700 leading-relaxed max-w-2xl">{selectedTask.description}</div>
                                </div>
                            </div>

                            {/* Evidence Viewer */}
                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                {selectedTask.status === 'In Review' || selectedTask.status === 'Completed' ? (
                                    <>
                                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Eye size={18} className="text-slate-400" />
                                                Progress Notes
                                            </h3>
                                            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                {selectedTask.progressNotes || "No notes provided."}
                                            </p>
                                        </div>

                                        {selectedTask.evidenceUrls && selectedTask.evidenceUrls.length > 0 && (
                                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                                <h3 className="font-bold text-slate-900 mb-4">Attached Evidence</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {selectedTask.evidenceUrls.map((url, index) => (
                                                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-32 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity">
                                                            <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 pb-12">
                                        <Clock size={48} className="mb-4 opacity-50" />
                                        <p>Task is currently {selectedTask.status.toLowerCase()}.</p>
                                        <p className="text-sm">Evidence and notes will appear here once submitted.</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
                                {selectedTask.status === 'In Review' && (
                                    <button
                                        onClick={() => handleMarkComplete(selectedTask.id)}
                                        className="btn btn-primary"
                                    >
                                        <CheckCircle2 size={18} className="mr-2" />
                                        Approve & Complete Task
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <CheckCircle2 size={64} className="mb-4 text-slate-300 opacity-50" />
                            <p className="text-lg font-medium text-slate-500">Select a task</p>
                            <p className="text-sm">Choose a task from the list to view its details and review evidence.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Plus className="text-brand-600" />
                                Assign New Task
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                {/* SVG Close logic built-in to browser essentially for simplicity */}
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="p-6 flex-1 overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    placeholder="e.g., Audit safety equipment"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    placeholder="Detailed instructions for the assignee..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign To <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={assignedTo}
                                        title="Assign to specific personnel"
                                        aria-label="Assign to specific personnel"
                                        onChange={e => setAssignedTo(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    >
                                        <option value="">Select Personnel...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                                    <select
                                        value={priority}
                                        title="Select Task Priority"
                                        aria-label="Select Task Priority"
                                        onChange={e => setPriority(e.target.value as any)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    required
                                    value={deliveryDate}
                                    onChange={e => setDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Send Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
