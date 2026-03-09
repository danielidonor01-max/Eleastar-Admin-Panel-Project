import { type ApiResponse } from './api';
import type { Employee } from '../types';
import { api } from '../utils/apiClient';

function getError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Request failed';
}

export const employeeService = {
    /**
     * Get All Employees (Paginated)
     */
    getAllEmployees: async (params?: { page?: number; per_page?: number; status?: string; department?: string; search?: string; role?: number }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/employees', { params });
            if (data?.success) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch employees' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Get Employee by ID
     */
    getEmployeeById: async (id: string | number): Promise<ApiResponse<Employee | null>> => {
        try {
            const { data } = await api.get(`/employees/${id}`);
            if (data?.success) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch employee' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Create New Employee
     */
    createEmployee: async (employeePayload: unknown): Promise<ApiResponse<Employee>> => {
        try {
            const { data } = await api.post('/employees', employeePayload);
            if (data?.success) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as Employee, error: data?.message ?? 'Failed to create employee' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as Employee, error: getError(error) };
        }
    },

    /**
     * Update Employee
     */
    updateEmployee: async (id: string | number, updates: Partial<Employee>): Promise<ApiResponse<Employee>> => {
        try {
            const { data } = await api.put(`/employees/${id}`, updates);
            if (data?.success) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as Employee, error: data?.message ?? 'Failed to update employee' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as Employee, error: getError(error) };
        }
    },

    /**
     * Update Employee Status
     */
    updateEmployeeStatus: async (id: string | number, status: string): Promise<ApiResponse<Employee>> => {
        try {
            const { data } = await api.patch(`/employees/${id}/status`, { status });
            if (data?.success) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as Employee, error: data?.message ?? 'Failed to update employee status' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as Employee, error: getError(error) };
        }
    },

    /**
     * Delete Employee
     */
    deleteEmployee: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.delete(`/employees/${id}`);
            if (data?.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to delete employee' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    /**
     * Get Roles
     */
    getRoles: async (): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/roles');
            if (data?.success) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch roles' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    /**
     * Update Employee Salary (Specialized Action)
     */
    updateSalary: async (id: string | number, newSalary: number, reason: string): Promise<ApiResponse<Employee>> => {
        try {
            const { data } = await api.put(`/employees/${id}/salary`, { salary: newSalary, reason });
            if (data?.success) {
                return { success: true, data: data.data!, message: data.message };
            }
            return { success: false, data: null as unknown as Employee, error: data?.message ?? 'Failed to update salary' };
        } catch (error: unknown) {
            return { success: false, data: null as unknown as Employee, error: getError(error) };
        }
    },
};
