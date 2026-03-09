import { type ApiResponse } from './api';
import type { PayrollCycle } from '../types';
import { api } from '../utils/apiClient';

function getError(error: unknown): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message ?? e.message ?? 'Request failed';
}

/**
 * Service for Payroll management
 */
export const payrollService = {
    updateStatus: async (id: string | number, status: PayrollCycle['status']): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.put(`/payroll-cycles/${id}/status`, { status });
            if (data?.success || data?.status) {
                return { success: true, data: undefined, message: data?.message };
            }
            return { success: false, data: undefined, error: data?.message ?? `Failed to update payroll status to ${status}` };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    addAdjustment: async (empId: string | number, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.post('/payroll-adjustments', {
                employee_id: empId,
                type,
                amount,
                reason,
            });
            if (data?.success || data?.status) {
                return { success: true, data: undefined, message: data?.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to add payroll adjustment' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },

    getPayrollStatus: async (params?: { page?: number; per_page?: number; status?: string; month?: string; year?: number }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/payroll-cycles', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch payroll cycles' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getPayrollSummary: async (params?: { cycle_id?: number }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/payroll', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch payroll summary' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getPayrollDetails: async (id: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/payroll/${id}`);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch payroll details' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    generatePayrollCycle: async (payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post('/payroll', payload);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to generate payroll cycle' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    approvePayroll: async (id: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.post(`/payroll/${id}/approve`);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to approve payroll' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getPastPayrollCycles: async (params?: { per_page?: number }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/payroll/history/past', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch past payroll cycles' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getPayrollEmployees: async (params?: { cycle_id?: number; department?: string; role_id?: number; employment_type?: string; search?: string; per_page?: number }): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get('/payroll-employees', { params });
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch payroll employees' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    getEmployeePayrollDetails: async (id: string | number): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.get(`/payroll-employees/${id}`);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to fetch employee payroll details' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    updateAdjustment: async (id: string | number, payload: unknown): Promise<ApiResponse<unknown>> => {
        try {
            const { data } = await api.put(`/payroll-adjustments/${id}`, payload);
            if (data?.success || data?.status) {
                return { success: true, data: data.data ?? null, message: data?.message };
            }
            return { success: false, data: null, error: data?.message ?? 'Failed to update adjustment' };
        } catch (error: unknown) {
            return { success: false, data: null, error: getError(error) };
        }
    },

    deleteAdjustment: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const { data } = await api.delete(`/payroll-adjustments/${id}`);
            if (data?.success || data?.status) {
                return { success: true, data: undefined, message: data?.message };
            }
            return { success: false, data: undefined, error: data?.message ?? 'Failed to delete adjustment' };
        } catch (error: unknown) {
            return { success: false, data: undefined, error: getError(error) };
        }
    },
};
