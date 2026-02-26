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

            if (response.ok && data.success) {
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

            if (response.ok && data.success) {
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

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch payroll cycles' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    }
};
