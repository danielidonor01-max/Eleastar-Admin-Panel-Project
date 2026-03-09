import { create } from 'zustand';
import { toast } from 'sonner';
import { jobService } from '../services/jobService';
import type { Job } from '../types';
import { createPersistedStore } from './middleware';
import { useAuthStore } from './useAuthStore';
import { useNotificationStore } from './useNotificationStore';
import { useAuditStore } from './useAuditStore';

interface RecruitmentState {
    jobs: Job[];
    isLoading: boolean;
}

interface RecruitmentActions {
    fetchJobs: () => Promise<void>;
    refreshJobs: () => Promise<void>;
    addJob: (job: Omit<Job, 'tenantId'>) => Promise<void>;
    updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
    deleteJob: (id: string) => Promise<void>;
}

export const useRecruitmentStore = create<RecruitmentState & RecruitmentActions>()(
    createPersistedStore('recruitment', (set, get) => ({
    jobs: [],
    isLoading: false,

    fetchJobs: async () => {
        const res = await jobService.getAllJobs();
        if (res.success) {
            set({ jobs: Array.isArray(res.data) ? res.data : ((res.data as { data?: Job[] })?.data || []) });
        }
    },

    refreshJobs: async () => { await get().fetchJobs(); },

    addJob: async (job) => {
        set({ isLoading: true });
        try {
            const { currentTenantId } = useAuthStore.getState();
            const fullJob: Job = { ...job, tenantId: currentTenantId };
            const res = await jobService.createJob(fullJob);
            if (res.success) {
                set((s) => ({ jobs: [...s.jobs, res.data as Job] }));
                        const { logAction } = useAuditStore.getState();
                logAction('Posted Job', `Created job listing: ${fullJob.title}`);
                const { dispatchNotification } = useNotificationStore.getState();
                dispatchNotification({ title: 'New Job Posted', message: `New Job Posted: ${fullJob.title}`, type: 'Recruitment', link: `/admin/recruitment?jobId=${fullJob.id}` }, { roles: ['SUPER_ADMIN', 'HR_ADMIN'] }, ['in-app']);
                toast.success('Job Posted', { description: `${fullJob.title} is now live.` });
            } else {
                toast.error('Post Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Post Error', { description: 'Failed to post job listing.' }); }
        finally { set({ isLoading: false }); }
    },

    updateJob: async (id, updates) => {
        set({ isLoading: true });
        try {
            const res = await jobService.updateJob(id, updates);
            if (res.success) {
                set((s) => ({ jobs: s.jobs.map((j) => j.id === id ? { ...j, ...updates } : j) }));
                const { logAction } = useAuditStore.getState();
                logAction('Updated Job', `Updated job listing ${id}`);
                toast.success('Job Updated', { description: 'Job details have been saved.' });
            } else {
                toast.error('Update Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Update Error', { description: 'Failed to update job.' }); }
        finally { set({ isLoading: false }); }
    },

    deleteJob: async (id) => {
        set({ isLoading: true });
        try {
            const res = await jobService.deleteJob(id);
            if (res.success) {
                set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) }));
                const { logAction } = useAuditStore.getState();
                logAction('Deleted Job', `Deleted job listing ${id}`);
                toast.success('Job Deleted', { description: 'Job listing has been removed.' });
            } else {
                toast.error('Delete Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Delete Error', { description: 'Failed to delete job.' }); }
        finally { set({ isLoading: false }); }
    },
})
    ));
