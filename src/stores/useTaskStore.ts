import { create } from 'zustand';
import { toast } from 'sonner';
import type { Task } from '../types';
import { useNotificationStore } from './useNotificationStore';
import { taskService } from '../services/taskService';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
}

interface TaskActions {
    getAllTasks: () => Promise<void>;
    createTask: (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => Promise<void>;
    updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
    submitTaskEvidence: (taskId: string, notes: string, b64Evidence: string[]) => void;
}

export const useTaskStore = create<TaskState & TaskActions>((set, get) => ({
    tasks: [],
    isLoading: false,

    getAllTasks: async () => {
        set({ isLoading: true });
        try {
            const res = await taskService.getAllTasks();
            if (res.success) {
                set({ tasks: Array.isArray(res.data) ? res.data : ((res.data as { data?: Task[] })?.data || []) });
            } else {
                toast.error('Fetch Error', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Fetch Error', { description: 'Failed to fetch tasks.' }); }
        finally { set({ isLoading: false }); }
    },

    createTask: async (taskData) => {
        set({ isLoading: true });
        try {
            const res = await taskService.createTask(taskData);
            if (res.success) {
                const newTask: Task = {
                    ...taskData,
                    id: (res.data as { id?: string })?.id || `TSK-${Date.now()}`,
                    status: 'Pending',
                    createdAt: new Date().toISOString(),
                };
                set((s) => ({ tasks: [newTask, ...s.tasks] }));
                const { dispatchNotification } = useNotificationStore.getState();
                dispatchNotification(
                    { title: 'New Task Assigned', message: `You have been assigned: ${taskData.title}`, type: 'HR', link: '/user/tasks' },
                    { userId: taskData.assignedTo }
                );
                toast.success('Task Created', { description: 'Task assigned successfully.' });
            } else {
                toast.error('Creation Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Creation Error', { description: 'Failed to create task.' }); }
        finally { set({ isLoading: false }); }
    },

    updateTaskStatus: async (taskId, status) => {
        set({ isLoading: true });
        try {
            const res = await taskService.updateTaskStatus(taskId, status);
            if (res.success) {
                set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status } : t) }));
                toast.success('Status Updated', { description: `Task status updated to ${status}.` });
            } else {
                toast.error('Update Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Update Error', { description: 'Failed to update task status.' }); }
        finally { set({ isLoading: false }); }
    },

    submitTaskEvidence: (taskId, notes, b64Evidence) => {
        set((s) => ({
            tasks: s.tasks.map((t) =>
                t.id === taskId ? { ...t, progressNotes: notes, evidenceUrls: b64Evidence, status: 'In Review' as const } : t
            ),
        }));
        const task = get().tasks.find((t) => t.id === taskId);
        if (task) {
            const { dispatchNotification } = useNotificationStore.getState();
            dispatchNotification(
                { title: 'Task Evidence Submitted', message: `Evidence submitted for ${task.title}`, type: 'System', link: '/admin/tasks' },
                { userId: task.assignedBy }
            );
        }
    },
}));
