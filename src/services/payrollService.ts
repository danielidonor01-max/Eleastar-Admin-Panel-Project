import { type ApiResponse } from './api';
import type { PayrollCycle } from '../data/mockData';
import { API_BASE_URL } from '../config';
import Cookies from 'js-cookie';

const getHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

/**
 * Service for Payroll management
 */
export const payrollService = {
    /**
     * Updates the status of a payroll cycle
     */
    updateStatus: async (id: string | number, status: PayrollCycle['status']): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll-cycles/${id}/status`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || `Failed to update payroll status to ${status}` };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Adds an adjustment to an employee's payroll
     */
    addAdjustment: async (empId: string | number, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll-adjustments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    employee_id: empId,
                    type,
                    amount,
                    reason
                })
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to add payroll adjustment' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Fetches payroll cycles
     */
    getPayrollStatus: async (params?: { page?: number; per_page?: number; status?: string; month?: string; year?: number }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/payroll-cycles?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch payroll cycles' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Payroll Summary
     * Calls GET /payroll
     */
    getPayrollSummary: async (params?: { cycle_id?: number }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params?.cycle_id) query.append('cycle_id', String(params.cycle_id));

            const response = await fetch(`${API_BASE_URL}/payroll?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch payroll summary' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Payroll Details
     * Calls GET /payroll/{id}
     */
    getPayrollDetails: async (id: string | number): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch payroll details' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Generate Payroll Cycle
     * Calls POST /payroll
     */
    generatePayrollCycle: async (payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to generate payroll cycle' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Approve Payroll
     * Calls POST /payroll/{id}/approve
     */
    approvePayroll: async (id: string | number): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll/${id}/approve`, {
                method: 'POST',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to approve payroll' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Past Payroll Cycles
     * Calls GET /payroll/history/past
     */
    getPastPayrollCycles: async (params?: { per_page?: number }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params?.per_page) query.append('per_page', String(params.per_page));

            const response = await fetch(`${API_BASE_URL}/payroll/history/past?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch past payroll cycles' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * List Payroll Employees
     * Calls GET /payroll-employees
     */
    getPayrollEmployees: async (params?: { cycle_id?: number; department?: string; role_id?: number; employment_type?: string; search?: string; per_page?: number }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/payroll-employees?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch payroll employees' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Employee Payroll Details
     * Calls GET /payroll-employees/{id}
     */
    getEmployeePayrollDetails: async (id: string | number): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll-employees/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch employee payroll details' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Update Adjustment
     * Calls PUT /payroll-adjustments/{id}
     */
    updateAdjustment: async (id: string | number, payload: any): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll-adjustments/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to update adjustment' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Delete Adjustment
     * Calls DELETE /payroll-adjustments/{id}
     */
    deleteAdjustment: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll-adjustments/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && (data.success || data.status)) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to delete adjustment' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    }
};
