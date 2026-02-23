import { type ApiResponse, delay, mockSuccess, mockError } from './api';
import type { Employee } from '../data/mockData';
import { employees as initialEmployees } from '../data/mockData';

// Simulating a database with an in-memory variable (for now)
// When the app reloads, this resets.
// In the next phase (Backend Integration), this will be replaced by API calls.
let employeesDb = [...initialEmployees];

export const employeeService = {
    /**
     * Get All Employees
     */
    getAllEmployees: async (): Promise<ApiResponse<Employee[]>> => {
        await delay();
        return mockSuccess(employeesDb);
    },

    /**
     * Get Employee by ID
     */
    getEmployeeById: async (id: string): Promise<ApiResponse<Employee | null>> => {
        await delay(200);
        const employee = employeesDb.find(e => e.id === id);
        if (!employee) return mockError('Employee not found');
        return mockSuccess(employee);
    },

    /**
     * Create New Employee
     */
    createEmployee: async (employee: Employee): Promise<ApiResponse<Employee>> => {
        await delay();

        // Basic Validation
        if (employeesDb.some(e => e.email === employee.email)) {
            return mockError('Email already exists');
        }

        employeesDb = [employee, ...employeesDb];
        return mockSuccess(employee, 'Employee created successfully');
    },

    /**
     * Update Employee
     */
    updateEmployee: async (id: string, updates: Partial<Employee>): Promise<ApiResponse<Employee>> => {
        await delay();
        const index = employeesDb.findIndex(e => e.id === id);

        if (index === -1) {
            return mockError('Employee not found');
        }

        const updatedEmployee = { ...employeesDb[index], ...updates };
        employeesDb[index] = updatedEmployee;

        // Update the array reference to ensure React updates (if we were passing this array directly, which we aren't anymore)
        employeesDb = [...employeesDb];

        return mockSuccess(updatedEmployee, 'Employee updated');
    },

    /**
     * Update Employee Salary (Specialized Action)
     */
    updateSalary: async (id: string, newSalary: number, _reason: string): Promise<ApiResponse<Employee>> => {
        return employeeService.updateEmployee(id, { salary: newSalary });
    }
};
