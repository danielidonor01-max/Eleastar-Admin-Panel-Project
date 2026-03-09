import { create } from 'zustand';
import { toast } from 'sonner';
import { employeeService } from '../services/employeeService';
import { settingsService } from '../services/settingsService';
import type { Employee, ContractInfo, ContractDocument, AdminRole } from '../types';
import { createPersistedStore } from './middleware';
import { useAuthStore } from './useAuthStore';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';

interface EmployeeState {
    employees: Employee[];
    ceoSignature: string | null;
    isLoading: boolean;
}

interface EmployeeActions {
    fetchEmployees: () => Promise<void>;
    getVisibleEmployees: () => Employee[];
    addEmployee: (newEmployee: Omit<Employee, 'tenantId'> & { password?: string; password_confirmation?: string; role_id?: number }) => Promise<void>;
    updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    updateUserProfile: (updates: Partial<Employee>) => Promise<void>;
    updateEmployeeContract: (id: string, contract: Partial<ContractInfo>) => Promise<void>;
    uploadContractDocument: (id: string, doc: Omit<ContractDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => Promise<void>;
    updateEmployeeSalary: (empId: string, newSalary: number, reason: string, _effectiveDate: string) => Promise<void>;
    regenerateQR: (ids: string[]) => void;
    toggleQRStatus: (id: string, status: 'active' | 'suspended') => void;
    updateCeoSignature: (url: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState & EmployeeActions>()(
    createPersistedStore('employee', (set, get) => ({
        employees: [],
        ceoSignature: null,
        isLoading: false,

        fetchEmployees: async () => {
            set({ isLoading: true });
            try {
                const res = await employeeService.getAllEmployees();
                if (res.success) {
                    const data = Array.isArray(res.data) ? res.data : ((res.data as { data?: Employee[] })?.data || []);
                    set({ employees: data });
                }
            } finally {
                set({ isLoading: false });
            }
        },

        getVisibleEmployees: () => {
            const { currentUserRole, currentUserId } = useAuthStore.getState();
            const sensitiveRoles: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'COO'];
            const { employees } = get();
            if (sensitiveRoles.includes(currentUserRole)) return employees;
            return employees.map((emp) => ({
                ...emp,
                salary: emp.id === currentUserId ? emp.salary : 0,
            }));
        },

        addEmployee: async (newEmployee) => {
            set({ isLoading: true });
            try {
                const { password, password_confirmation, role_id, ...empData } = newEmployee;
                const { currentTenantId } = useAuthStore.getState();
                const payload = { ...empData, tenantId: currentTenantId, password, password_confirmation, role_id };
                const res = await employeeService.createEmployee(payload);
                if (res.success) {
                    const created: Employee = res.data || ({ ...empData, tenantId: payload.tenantId } as Employee);
                    set((s) => ({ employees: [created, ...s.employees] }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Onboarding', `Added new employee: ${created.name}`);
                    toast.success('Employee Added', { description: `${created.name} has been successfully onboarded.` });
                } else {
                    toast.error('Onboarding Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Onboarding Error', { description: 'Failed to create employee.' });
            } finally {
                set({ isLoading: false });
            }
        },

        updateEmployee: async (id, updates) => {
            set({ isLoading: true });
            try {
                const res = await employeeService.updateEmployee(id, updates);
                if (res.success) {
                    set((s) => ({
                        employees: s.employees.map((emp) => {
                            if (emp.id !== id) return emp;
                            const oldEmp = emp;
                            const newEmp = { ...emp, ...updates };
                            const { dispatchNotification } = useNotificationStore.getState();
                            if (updates.salary && updates.salary !== oldEmp.salary) {
                                dispatchNotification(
                                    { title: 'Salary Updated', message: `Your salary has been updated to ₦${updates.salary.toLocaleString()}`, type: 'Payroll', link: '/user/profile' },
                                    { userId: id }, ['in-app', 'email']
                                );
                            }
                            if (updates.title && updates.title !== oldEmp.title) {
                                dispatchNotification(
                                    { title: 'Role Update', message: `Congratulations on your new role: ${updates.title}!`, type: 'HR', link: '/user/profile' },
                                    { userId: id }, ['in-app', 'email']
                                );
                            }
                            return newEmp;
                        }),
                    }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Updated Employee', `Updated profile for ${id}`);
                    toast.success('Profile Updated', { description: 'Employee profile updated successfully.' });
                } else {
                    toast.error('Update Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Update Error', { description: 'Failed to update employee.' });
            } finally {
                set({ isLoading: false });
            }
        },

        deleteEmployee: async (id) => {
            set({ isLoading: true });
            try {
                const res = await employeeService.deleteEmployee(id);
                if (res.success) {
                    set((s) => ({ employees: s.employees.filter((e) => e.id !== id) }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Offboarding', `Removed employee: ${id}`);
                    toast.success('Employee Removed');
                } else {
                    toast.error('Delete Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Delete Error', { description: 'Failed to delete employee.' });
            } finally {
                set({ isLoading: false });
            }
        },

        updateUserProfile: async (updates) => {
            const { currentUserId } = useAuthStore.getState();
            if (!currentUserId) return;
            set({ isLoading: true });
            try {
                const safeUpdates: Partial<Employee> = {
                    phoneNumber: updates.phoneNumber,
                    address: updates.address,
                    emergencyContact: updates.emergencyContact,
                    bankDetails: updates.bankDetails,
                    taxDetails: updates.taxDetails,
                };
                const res = await employeeService.updateEmployee(currentUserId, safeUpdates);
                if (res.success) {
                    set((s) => ({ employees: s.employees.map((e) => e.id === currentUserId ? { ...e, ...safeUpdates } : e) }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Profile Update', 'User updated their own profile');
                    toast.success('Profile Updated', { description: 'Your changes have been saved.' });
                }
            } catch {
                toast.error('Update Error', { description: 'Failed to update profile.' });
            } finally {
                set({ isLoading: false });
            }
        },

        updateEmployeeContract: async (id, contract) => {
            set({ isLoading: true });
            try {
                set((s) => ({ employees: s.employees.map((e) => e.id === id ? { ...e, ...contract } : e) }));
                const { logAction } = useAuditStore.getState();
                logAction('Contract Update', `Updated contract for ${id}`);
                toast.success('Contract Updated', { description: 'Contract details have been saved.' });
            } finally {
                set({ isLoading: false });
            }
        },

        uploadContractDocument: async (id, doc) => {
            set({ isLoading: true });
            try {
                const { logAction } = useAuditStore.getState();
                logAction('Document Upload', `Uploaded contract document for ${id}: ${doc.name}`);
                toast.success('Document Uploaded', { description: 'Contract document has been recorded.' });
            } finally {
                set({ isLoading: false });
            }
        },

        updateEmployeeSalary: async (empId, newSalary, reason) => {
            set({ isLoading: true });
            try {
                const res = await employeeService.updateSalary(empId, newSalary, reason);
                if (res.success) {
                    set((s) => ({ employees: s.employees.map((e) => e.id === empId ? { ...e, salary: newSalary } : e) }));
                    const { logAction } = useAuditStore.getState();
                    logAction('Salary Update', `Updated salary for ${empId} to ${newSalary}. Reason: ${reason}`);
                    toast.success('Salary Updated', { description: 'Employee salary has been modified.' });
                } else {
                    toast.error('Update Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Update Error', { description: 'Failed to update salary.' });
            } finally {
                set({ isLoading: false });
            }
        },

        regenerateQR: (ids) => {
            set((s) => ({
                employees: s.employees.map((e) => ids.includes(e.id) ? { ...e, verifiedAt: new Date().toISOString() } : e),
            }));
            const { logAction } = useAuditStore.getState();
            logAction('Regenerated QR', `Regenerated QR for ${ids.length} employees.`);
            const { dispatchNotification } = useNotificationStore.getState();
            dispatchNotification({ title: 'QR Codes Regenerated', message: `QR Codes regenerated for ${ids.length} staff`, type: 'HR', link: '/admin/qr' }, { roles: ['SUPER_ADMIN', 'COO', 'FINANCE_ADMIN', 'PAYROLL_ADMIN'] }, ['in-app', 'email']);
        },

        toggleQRStatus: (id, status) => {
            set((s) => ({
                employees: s.employees.map((e) => e.id === id ? { ...e, status: status === 'suspended' ? 'suspended' : 'active' } : e),
            }));
            const { logAction } = useAuditStore.getState();
            logAction('Updated QR Status', `Set QR status to ${status} for ${id}`);
        },

        updateCeoSignature: async (url) => {
            set({ isLoading: true });
            try {
                const res = await settingsService.updateCeoSignature(url);
                if (res.success) {
                    set({ ceoSignature: url });
                    const { logAction } = useAuditStore.getState();
                    logAction('Settings', 'Updated CEO digital signature');
                    toast.success('Signature Updated', { description: 'CEO signature has been recorded.' });
                } else {
                    toast.error('Update Failed', { description: (res as { error?: string }).error });
                }
            } catch {
                toast.error('Update Error', { description: 'Failed to update CEO signature.' });
            } finally {
                set({ isLoading: false });
            }
        },
    })
    ));
