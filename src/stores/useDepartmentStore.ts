import { create } from 'zustand';
import { toast } from 'sonner';
import { departmentService } from '../services/departmentService';
import type { Department } from '../types';
import { useAuditStore } from './useAuditStore';
import { createPersistedStore } from './middleware';

interface DepartmentState {
    departments: Department[];
    isLoading: boolean;
}

interface DepartmentActions {
    fetchDepartments: () => Promise<void>;
    refreshDepartments: () => Promise<void>;
    saveDepartment: (dept: Department) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;
}

export const useDepartmentStore = create<DepartmentState & DepartmentActions>()(
    createPersistedStore('department', (set, get) => ({
    departments: [],
    isLoading: false,

    fetchDepartments: async () => {
        const res = await departmentService.getDepartments();
        if (res.success) {
            set({ departments: Array.isArray(res.data) ? res.data : ((res.data as { data?: Department[] })?.data || []) });
        }
    },

    refreshDepartments: async () => { await get().fetchDepartments(); },

    saveDepartment: async (dept) => {
        set({ isLoading: true });
        try {
            const res = await departmentService.saveDepartment(dept);
            if (res.success) {
                set((s) => {
                    const exists = s.departments.find((d) => d.id === dept.id);
                    return { departments: exists ? s.departments.map((d) => d.id === dept.id ? dept : d) : [...s.departments, dept] };
                });
                const { logAction } = useAuditStore.getState();
                logAction('Department Update', `Updated department ${dept.name}`);
                toast.success('Department Saved', { description: `${dept.name} updated successfully.` });
            } else {
                toast.error('Save Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Save Error', { description: 'Failed to save department.' }); }
        finally { set({ isLoading: false }); }
    },

    deleteDepartment: async (id) => {
        set({ isLoading: true });
        try {
            const res = await departmentService.deleteDepartment(id);
            if (res.success) {
                set((s) => ({ departments: s.departments.filter((d) => d.id !== id) }));
                const { logAction } = useAuditStore.getState();
                logAction('Department Update', `Deleted department ${id}`);
                toast.success('Department Deleted');
            } else {
                toast.error('Delete Failed', { description: (res as { error?: string }).error });
            }
        } catch { toast.error('Delete Error', { description: 'Failed to delete department.' }); }
        finally { set({ isLoading: false }); }
    },
})
));
