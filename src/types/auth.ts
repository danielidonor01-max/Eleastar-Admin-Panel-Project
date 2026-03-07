// =============================================================================
// AUTH & ROLES
// =============================================================================

/**
 * All possible system roles a user can be assigned.
 * Controls module access and action permissions across the admin panel.
 */
export type AdminRole =
    | 'SUPER_ADMIN'
    | 'COO'
    | 'HR_ADMIN'
    | 'MANAGEMENT_ADMIN'
    | 'FINANCE_ADMIN'
    | 'PAYROLL_ADMIN'
    | 'TECHNICIAN'
    | 'USER'
    | 'CHIEF_RISK_OFFICER'
    | 'WEB_ADMIN'
    | 'VIEWER';

/**
 * Top-level admin panel modules. Used to define per-role access permissions.
 */
export type ModuleType =
    | 'Dashboard'
    | 'Employees'
    | 'QR & ID'
    | 'Payroll'
    | 'Recruitment'
    | 'Website CMS'
    | 'Settings'
    | 'Leave'
    | 'Performance'
    | 'Compliance'
    | 'System Users';


export interface UserProfile {
    name: string;
    email: string;
    phoneNumber: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    photoUrl: string;
}