import React, { createContext, useContext, useState } from 'react';
import { employees as initialEmployees, jobs as initialJobs, initialCMSContent, initialAboutContent, initialServicesContent, initialIndustrialSolutionsContent, initialInformationTechnologyContent, initialResearchAndDevelopmentContent, initialElectronicsManufacturingContent, initialSpecificITServicesContent, initialFooterContent } from '../data/mockData';
import type { Employee, Job, CMSSection, FooterContent, FooterSection } from '../data/mockData';

// Extended Types
export interface ActivityLog {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    details?: string;
    role: string; // Added role tracking
}

export interface PayrollCycle {
    id: string;
    month: string;
    year: number;
    status: 'Draft' | 'Reviewed' | 'Approved' | 'Paid';
    adjustments: { empId: string; type: 'Bonus' | 'Fine' | 'Deduction'; amount: number; reason: string }[];
}

// Notification Types
export type NotificationType = 'System' | 'HR' | 'Payroll' | 'Recruitment' | 'QR';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    isRead: boolean;
    link: string;
}

// Role & Permissions Types
export type AdminRole = 'Super Admin' | 'Management Admin' | 'HR Admin' | 'Finance Admin' | 'Web Admin' | 'User';
export type ModuleType = 'Dashboard' | 'Employees' | 'QR & ID' | 'Payroll' | 'Recruitment' | 'Website CMS' | 'Settings';

export interface AdminContextType {
    employees: Employee[];
    jobs: Job[];
    activityLogs: ActivityLog[];
    payrollStatus: PayrollCycle;
    ceoSignature: string | null;
    cmsContent: CMSSection[]; // New CMS data
    footerContent: FooterContent; // Global Footer Data

    // Notification State
    notifications: Notification[];
    unreadCount: number;

    // Role State
    currentUserRole: AdminRole;
    rolePermissions: Record<AdminRole, ModuleType[]>;

    // Actions
    updateEmployee: (id: string, updates: Partial<Employee>) => void;
    addEmployee: (employee: Employee) => void;
    regenerateQR: (ids: string[]) => void;
    toggleQRStatus: (id: string, status: 'active' | 'suspended') => void;
    updatePayrollStatus: (status: PayrollCycle['status']) => void;
    addPayrollAdjustment: (empId: string, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => void;
    bulkPayrollAdjustment: (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => void;
    logAction: (action: string, details?: string) => void;
    updateCeoSignature: (url: string) => void;
    addJob: (job: Job) => void;
    updateJob: (id: string, updates: Partial<Job>) => void;
    deleteJob: (id: string) => void;

    // CMS Actions
    updatePMSContent: (id: string, content: any) => void; // Using any for flexible updates across union types
    publishPMSContent: (id: string) => void;
    addCMSContent: (section: CMSSection) => void;
    deleteCMSContent: (id: string) => void;
    updateFooterContent: (section: keyof FooterContent, data: Partial<FooterSection>) => void;

    // New Actions
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
    switchRole: (role: AdminRole) => void;
    updateRolePermissions: (role: AdminRole, modules: ModuleType[]) => void;

    // Authentication
    isAuthenticated: boolean;
    login: (password: string) => AdminRole | false;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial Permissions Configuration
const INITIAL_PERMISSIONS: Record<AdminRole, ModuleType[]> = {
    'Super Admin': ['Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS', 'Settings'],
    'Management Admin': ['Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS'],
    'HR Admin': ['Dashboard', 'Employees', 'Recruitment', 'QR & ID'],
    'Finance Admin': ['Dashboard', 'Payroll'],
    'Web Admin': ['Dashboard', 'Website CMS'],
    'User': [] // Users have no admin module access
};

// Mock Notifications
const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'System', message: 'New admin session started', timestamp: new Date().toISOString(), isRead: false, link: '/admin/dashboard' },
    { id: '2', type: 'HR', message: 'New employee onboarded: Sarah Jenkins', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, link: '/admin/employees' },
    { id: '3', type: 'Payroll', message: 'January Payroll cycle opened', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true, link: '/admin/payroll' },
    { id: '4', type: 'Recruitment', message: '5 new applications for Frontend Dev', timestamp: new Date(Date.now() - 172800000).toISOString(), isRead: false, link: '/admin/recruitment' },
    { id: '5', type: 'QR', message: 'Bulk QR regeneration completed', timestamp: new Date(Date.now() - 250000000).toISOString(), isRead: true, link: '/admin/qr' }
];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [cmsContent, setCmsContent] = useState<CMSSection[]>([...initialCMSContent, ...initialAboutContent, ...initialServicesContent, ...initialIndustrialSolutionsContent, ...initialInformationTechnologyContent, ...initialResearchAndDevelopmentContent, ...initialElectronicsManufacturingContent, ...initialSpecificITServicesContent]);
    const [footerContent, setFooterContent] = useState<FooterContent>(initialFooterContent);
    const [ceoSignature, setCeoSignature] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [currentUserRole, setCurrentUserRole] = useState<AdminRole>('Super Admin');
    const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, ModuleType[]>>(INITIAL_PERMISSIONS);

    // Auth State - Default to false for preview environment security
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
        { id: '1', user: 'Admin User', role: 'Super Admin', action: 'System Login', timestamp: new Date().toISOString() }
    ]);
    const [payrollStatus, setPayrollStatus] = useState<PayrollCycle>({
        id: 'JAN-2026',
        month: 'January',
        year: 2026,
        status: 'Draft',
        adjustments: []
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Actions
    const logAction = (action: string, details?: string) => {
        const newLog: ActivityLog = {
            id: Math.random().toString(36).substr(2, 9),
            user: 'Admin User',
            role: currentUserRole,
            action,
            details,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const updateEmployee = (id: string, updates: Partial<Employee>) => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
        logAction('Updated Employee', `Updated profile for ${id}`);
    };

    const addEmployee = (employee: Employee) => {
        setEmployees(prev => [...prev, employee]);
        logAction('Added Employee', `Onboarded ${employee.name}`);
        // Trigger Notification
        addNotification('HR', `New employee added: ${employee.name}`, '/admin/employees');
    };

    const regenerateQR = (ids: string[]) => {
        setEmployees(prev => prev.map(emp =>
            ids.includes(emp.id) ? { ...emp, verifiedAt: new Date().toISOString() } : emp
        ));
        logAction('Regenerated QR', `Regenerated QR for ${ids.length} employees. Reprint required.`);
        addNotification('QR', `QR Codes regenerated for ${ids.length} staff`, '/admin/qr');
    };

    const toggleQRStatus = (id: string, status: 'active' | 'suspended') => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: status === 'suspended' ? 'inactive' : 'active' } : emp));
        logAction('Updated QR Status', `Set QR status to ${status} for ${id}`);
    };

    const updatePayrollStatus = (status: PayrollCycle['status']) => {
        setPayrollStatus(prev => ({ ...prev, status }));
        logAction('Updated Payroll Status', `Changed status to ${status}`);
        addNotification('Payroll', `Payroll status updated to ${status}`, '/admin/payroll');
    };

    const addPayrollAdjustment = (empId: string, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        setPayrollStatus(prev => ({
            ...prev,
            adjustments: [...prev.adjustments, { empId, type, amount, reason }]
        }));
        logAction('Payroll Adjustment', `Added ${type} of ₦${amount} for ${empId}: ${reason}`);
    };

    const bulkPayrollAdjustment = (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        const newAdjustments = empIds.map(empId => ({ empId, type, amount, reason }));
        setPayrollStatus(prev => ({
            ...prev,
            adjustments: [...prev.adjustments, ...newAdjustments]
        }));

        // Detailed Logging
        empIds.forEach(id => {
            logAction('Payroll Adjustment', `Added ${type} of ₦${amount} for ${id}: ${reason}`);
        });

        // Also keep a summary log if desired, or rely on the individual ones. The user requested "For every adjustment... Log affected employees". Individual logs are safer for "affected employees".
        logAction('Bulk Adjustment Batch', `Processed ${type} for ${empIds.length} employees. Total: ₦${amount * empIds.length}`);
    };

    const updateCeoSignature = (url: string) => {
        setCeoSignature(url);
        logAction('Updated CEO Signature', 'Updated global CEO signature for ID cards.');
        addNotification('System', 'Global CEO Signature updated', '/admin/settings');
    };

    // Job Actions
    const addJob = (job: Job) => {
        setJobs(prev => [...prev, job]);
        logAction('Posted Job', `Created new job listing: ${job.title}`);
        addNotification('Recruitment', `New Job Posted: ${job.title}`, '/admin/recruitment');
    };

    const updateJob = (id: string, updates: Partial<Job>) => {
        setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));
        logAction('Updated Job', `Updated job listing ${id}`);
    };

    const deleteJob = (id: string) => {
        setJobs(prev => prev.filter(job => job.id !== id));
        logAction('Deleted Job', `Deleted job listing ${id}`);
    };

    // CMS Actions
    const updatePMSContent = (id: string, updates: any) => {
        setCmsContent(prev => prev.map(c => c.id === id ? { ...c, ...updates, status: 'Draft', lastUpdated: new Date().toISOString() } : c));
        logAction('Updated CMS Content', `Updated content for ${id}`);
    };

    const publishPMSContent = (id: string) => {
        setCmsContent(prev => prev.map(c => c.id === id ? { ...c, status: 'Published' } : c));
        logAction('Published CMS Content', `Published updates for ${id}`);
        addNotification('System', `New content published for ${id}`, '/');
    };

    const addCMSContent = (section: CMSSection) => {
        setCmsContent(prev => [...prev, section]);
        logAction('Added CMS Content', `Created new section ${section.id}`);
    };

    const deleteCMSContent = (id: string) => {
        setCmsContent(prev => prev.filter(c => c.id !== id));
        logAction('Deleted CMS Content', `Deleted section ${id}`);
    };

    const updateFooterContent = (section: keyof FooterContent, data: Partial<FooterSection>) => {
        setFooterContent(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data, lastUpdated: new Date().toISOString() }
        }));
        logAction('Updated Footer', `Updated ${section} section`);
    };

    // Notification Actions
    const addNotification = (type: NotificationType, message: string, link: string) => {
        const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            message,
            timestamp: new Date().toISOString(),
            isRead: false,
            link
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        logAction('Notifications', 'Marked all notifications as read');
    };

    // Role Actions
    const switchRole = (role: AdminRole) => {
        setCurrentUserRole(role);
        logAction('Role Switch', `Switched view permission to ${role}`);
    };

    const updateRolePermissions = (role: AdminRole, modules: ModuleType[]) => {
        setRolePermissions(prev => ({ ...prev, [role]: modules }));
        logAction('Permission Update', `Updated access rights for ${role}`);
    };

    // Auth Actions
    // Auth Actions
    const login = (password: string): AdminRole | false => {
        // Super Admin Login
        if (password === 'admin123') {
            setCurrentUserRole('Super Admin');
            setIsAuthenticated(true);
            logAction('Login', 'Admin logged in successfully');
            return 'Super Admin';
        }

        // Basic User Login
        if (password === 'user123') {
            setCurrentUserRole('User');
            setIsAuthenticated(true);
            logAction('Login', 'User logged in successfully');
            return 'User';
        }

        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        logAction('Logout', 'Admin logged out');
    };

    return (
        <AdminContext.Provider value={{
            employees,
            jobs,
            cmsContent,
            activityLogs,
            payrollStatus,
            ceoSignature,
            notifications,
            unreadCount,
            currentUserRole,
            rolePermissions,
            updateEmployee,
            addEmployee,
            regenerateQR,
            toggleQRStatus,
            updatePayrollStatus,
            addPayrollAdjustment,
            bulkPayrollAdjustment,
            logAction,
            updateCeoSignature,
            addJob,
            updateJob,
            deleteJob,
            updatePMSContent,
            publishPMSContent,
            addCMSContent,
            deleteCMSContent,
            footerContent,
            updateFooterContent,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            switchRole,
            updateRolePermissions,
            isAuthenticated,
            login,
            logout
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
