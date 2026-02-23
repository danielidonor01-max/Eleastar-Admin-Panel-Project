/**
 * API Configuration
 * 
 * This file serves as the base configuration for simulated service calls.
 * Because the backend is out of scope, this file simply exports generic ApiResponse
 * types and mock delays.
 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

// Utility for mock delay (retained for transitional period)
export const delay = (ms: number = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate a successful API response
export const mockSuccess = <T>(data: T, message?: string): ApiResponse<T> => ({
    data,
    success: true,
    message
});

// Helper to simulate a failed API response
export const mockError = <T>(error: string): ApiResponse<T> => ({
    data: null as any,
    success: false,
    error
});
