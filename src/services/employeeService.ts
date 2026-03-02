import { type ApiResponse } from './api';
import type { Employee } from '../data/mockData';
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

export const employeeService = {
    /**
     * Get All Employees (Paginated)
     */
    getAllEmployees: async (params?: { page?: number; per_page?: number; status?: string; department?: string; search?: string; role?: number }): Promise<ApiResponse<any>> => {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') query.append(key, String(value));
                });
            }

            const response = await fetch(`${API_BASE_URL}/employees?${query.toString()}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch employees' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Get Employee by ID
     */
    getEmployeeById: async (id: string | number): Promise<ApiResponse<Employee | null>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch employee' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Create New Employee
     */
    createEmployee: async (employeePayload: any): Promise<ApiResponse<Employee>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(employeePayload)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to create employee' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Update Employee
     */
    updateEmployee: async (id: string | number, updates: Partial<Employee>): Promise<ApiResponse<Employee>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(updates)
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to update employee' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Update Employee Status
     */
    updateEmployeeStatus: async (id: string | number, status: string): Promise<ApiResponse<Employee>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}/status`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to update employee status' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Delete Employee
     */
    deleteEmployee: async (id: string | number): Promise<ApiResponse<void>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: undefined, message: data.message };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to delete employee' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },



    /**
     * Get Roles
     */
    getRoles: async (): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/roles`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            }
            return { success: false, data: null as any, error: data.message || 'Failed to fetch roles' };
        } catch (error: any) {
            return { success: false, data: null as any, error: error.message };
        }
    },

    /**
     * Update Employee Salary (Specialized Action)
     * Maps to standard update under the hood for now, until backend has a specific salary endpoints
     */
    updateSalary: async (id: string | number, newSalary: number, _reason: string): Promise<ApiResponse<Employee>> => {
        return employeeService.updateEmployee(id, { salary: newSalary } as any);
    }
};
