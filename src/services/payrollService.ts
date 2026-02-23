import { type ApiResponse, mockSuccess, delay } from './api';
import type { PayrollCycle } from '../data/mockData';

/**
 * Service for Payroll management
 */
export const payrollService = {
    /**
     * Updates the status of a payroll cycle
     */
    updateStatus: async (_id: string, status: PayrollCycle['status']): Promise<ApiResponse<void>> => {
        await delay(); // Simulate latency
        // In reality: return api.patch(`/payroll/${_id}/status`, { status });
        return mockSuccess(undefined, `Payroll status updated to ${status}`);
    },

    /**
     * Adds an adjustment to an employee's payroll
     */
    addAdjustment: async (_empId: string, _type: 'Bonus' | 'Fine' | 'Deduction', _amount: number, _reason: string): Promise<ApiResponse<void>> => {
        await delay(); // Simulate latency
        // In reality: return api.post(`/payroll/adjustments`, { empId: _empId, type: _type, amount: _amount, reason: _reason });
        return mockSuccess(undefined, 'Adjustment added successfully');
    },

    /**
     * Fetches current payroll status
     */
    getPayrollStatus: async (): Promise<ApiResponse<PayrollCycle>> => {
        await delay();
        // In reality: return api.get('/payroll/status');
        return mockSuccess({
            id: 'JAN-2026',
            tenantId: 'tenant-default',
            month: 'January',
            year: 2026,
            status: 'Draft',
            adjustments: []
        });
    }
};
