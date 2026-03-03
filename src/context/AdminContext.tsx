import React, { createContext, useContext, useState } from 'react';
import { initialReviewCycles, initialPerformanceReviews, initialFooterContent, initialGlobalContent, initialServicesCollection, initialLedgerEntries, initialDepartments, initialPromotionRequests, initialEligibilityRules, initialTasks, initialApiKeys } from '../data/mockData';
import type { Employee, Job, LeaveRequest, ReviewCycle, PerformanceReview, CMSSection, FooterContent, FooterSection, GlobalContent, ServiceItem, ServiceCollection, BonusType, BonusRequest, LedgerEntry, Department, PromotionRequest, PromotionEligibilityRule, PayrollCycle, AdminRole, Task, SystemApiKey } from '../data/mockData';

import * as reportService from '../services/reportService';
import { authService } from '../services/authService';
import { employeeService } from '../services/employeeService';
import { notificationService } from '../services/notificationService';
import { payrollService } from '../services/payrollService';
import { jobService } from '../services/jobService';
import { leaveService } from '../services/leaveService';
import { performanceService } from '../services/performanceService';
// import { fallbackCMSData } from '../data/fallbackCMS';
import { cmsService } from '../services/cmsService';
import { settingsService } from '../services/settingsService';
import { financeService } from '../services/financeService';
import { departmentService } from '../services/departmentService';
import { promotionService } from '../services/promotionService';
import { bonusService } from '../services/bonusService';

// Extended Types
// Extended Types
export type PayrollCycleType = PayrollCycle; // Export for reportUtils
export type { AdminRole }; // Re-export for compatibility

export interface ActivityLog {
    id: string;
    user: string;
    actorName?: string; // Dashboard compatibility
    actorRole?: string; // Dashboard compatibility
    userId?: string; // For reportUtils compatibility
    action: string;
    actionType?: string; // Dashboard compatibility
    timestamp: string;
    details?: string;
    role: string; // Added role tracking
    // For reportUtils compatibility
    entityId?: string;
    entityType?: string;
    metadata?: any;
    status?: string;
}



import type { AdminNotification, NotificationType, NotificationChannel, EmailLog } from '../services/notificationTypes';
export type { AdminNotification, NotificationType, NotificationChannel, EmailLog };


// Role & Permissions Types

export type ModuleType = 'Dashboard' | 'Employees' | 'QR & ID' | 'Payroll' | 'Recruitment' | 'Website CMS' | 'Settings' | 'Leave' | 'Performance' | 'Compliance' | 'System Users';

export interface AdminContextType {
    isLoading: boolean; // Global loading state
    employees: Employee[];
    jobs: Job[];
    activityLogs: ActivityLog[];
    payrollStatus: PayrollCycle;
    ceoSignature: string | null;
    currentTenantId: string;

    // Auth
    requestAuth: (level: 'CMS' | 'SENSITIVE', description: string, onConfirm: () => void) => void;

    cmsContent: import('../types/cms').CMSData | null; // Changed to match backend nested JSON schema
    footerContent: FooterContent; // Global Footer Data
    globalContent: GlobalContent;
    servicesCollection: ServiceCollection; // or ServiceItem[]



    // AdminNotification State
    notifications: AdminNotification[];
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    unreadCount: number;

    // Leave Management
    leaveRequests: LeaveRequest[];
    requestLeave: (userId: string, request: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>) => Promise<void>;
    approveLeave: (requestId: string) => Promise<{ success: boolean; error?: string }>;
    rejectLeave: (requestId: string, reason: string) => Promise<void>;

    // Performance Management
    reviewCycles: ReviewCycle[];
    performanceReviews: PerformanceReview[];
    createReviewCycle: (cycle: Omit<ReviewCycle, 'id' | 'tenantId' | 'status'>) => Promise<void>;
    submitSelfReview: (id: string, selfReview: string, rating: number) => Promise<void>;
    updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => Promise<void>;
    approvePerformanceReview: (id: string, finalData: Partial<PerformanceReview>) => Promise<void>;
    startReviewCycle: (id: string) => Promise<void>;
    requestRevision: (id: string, feedback: string) => Promise<void>;

    // AdminNotification Engine
    emailLogs: EmailLog[]; // Expose logs
    dispatchNotification: (
        payload: { title: string; message: string; type: NotificationType; link: string },
        target: { userId?: string; roles?: AdminRole[] },
        channels?: NotificationChannel[]
    ) => void;

    // Role State
    currentUserRole: AdminRole;
    currentUserId: string | null; // Track specific logged-in user
    rolePermissions: Record<AdminRole, ModuleType[]>;

    // Actions
    updateEmployee: (id: string, updates: Partial<Employee>) => void;
    updateUserProfile: (updates: Partial<Employee>) => void; // Safe update for self
    addEmployee: (employee: Omit<Employee, 'tenantId'>) => void;
    deleteEmployee: (id: string) => void;
    updateEmployeeContract: (id: string, contract: any) => void;
    uploadContractDocument: (id: string, doc: any) => void;
    regenerateQR: (ids: string[]) => void;
    toggleQRStatus: (id: string, status: 'active' | 'suspended') => void;
    updatePayrollStatus: (status: PayrollCycle['status']) => void;
    addPayrollAdjustment: (empId: string, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => void;
    bulkPayrollAdjustment: (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => void;
    logAction: (action: string, details?: string, ...args: any[]) => void;
    updateCeoSignature: (url: string) => Promise<void>;
    addJob: (job: Omit<Job, 'tenantId'>) => void;
    updateJob: (id: string, updates: Partial<Job>) => void;
    deleteJob: (id: string) => void;

    // CMS Actions
    updatePMSContent: (id: string, content: any) => Promise<void>; // Using any for flexible updates across union types
    publishPMSContent: (id: string) => Promise<void>;
    addCMSContent: (section: CMSSection) => Promise<void>;
    createCMSPage: (pageName: string, slug: string) => Promise<void>;
    deleteCMSContent: (id: string) => Promise<void>;
    updateFooterContent: (section: keyof FooterContent, data: Partial<FooterSection>) => Promise<void>;

    // Global Settings
    updateGlobal: (section: keyof GlobalContent, data: any) => Promise<void>;

    // Services Collection
    addService: (service: Omit<ServiceItem, 'tenantId'>) => Promise<void>;
    updateService: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;

    // API Keys Management
    apiKeys: SystemApiKey[];
    addApiKey: (apiKey: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => void;
    toggleApiKeyStatus: (id: string) => void;

    // New Actions
    switchRole: (role: AdminRole) => void;
    updateRolePermissions: (role: AdminRole, modules: ModuleType[]) => void;

    // Bonus Management
    bonusTypes: BonusType[];
    bonusRequests: BonusRequest[];
    createBonusType: (bonus: Omit<BonusType, 'id' | 'tenantId'>) => Promise<void>;
    updateBonusType: (id: string, updates: Partial<BonusType>) => Promise<void>;

    requestBonus: (employeeId: string, bonusTypeId: string, amount: number, reason: string) => Promise<void>;
    approveBonus: (requestId: string, approvedBy: string) => Promise<void>;
    rejectBonus: (requestId: string, reason: string) => Promise<void>;

    // Authentication
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<{ role?: AdminRole, requiresOtp?: boolean }>;
    verifyOTP: (email: string, otp: string) => Promise<AdminRole | undefined>;
    logout: () => void;
    // Password Management
    generateSystemPassword: () => string;
    sendEmail: (to: string, subject: string, body: string) => void;

    // Compliance Reports
    generatePayrollSummaryReport: (cycleId?: string) => any[];
    generateApprovalTrailReport: (cycleId: string) => any[];
    generateBonusAdjustmentReport: (cycleId: string) => any[];
    generatePayrollVarianceReport: (currentCycleId: string, previousCycleId: string) => any[];
    generateSalaryHistoryReport: (employeeId?: string, startDate?: string, endDate?: string) => any[];
    generatePromotionHistoryReport: (startDate?: string, endDate?: string) => any[];
    generateUserAccessReport: () => any[];
    generateCriticalActionReport: (startDate?: string, endDate?: string) => any[];
    generateAttestationPack: (period: { start: string; end: string }, reportTypes: string[]) => any;
    logReportAccess: (reportType: string, filters: any) => void;

    // Finance & Ledger
    ledgerEntries: LedgerEntry[];
    approveLedgerFunding: (cycleId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
    executeLedgerBatch: (cycleId: string) => Promise<{ success: boolean; error?: string }>;

    // Departments (Role/Salary Bands)
    departments: Department[];
    saveDepartment: (dept: Department) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;

    // Promotions
    promotionRequests: PromotionRequest[];
    eligibilityRules: PromotionEligibilityRule[];
    requestPromotion: (req: Omit<PromotionRequest, 'id' | 'tenantId' | 'status' | 'requestedAt'>) => Promise<void>;
    approvePromotion: (requestId: string) => Promise<void>;
    rejectPromotion: (requestId: string, reason: string) => Promise<void>;
    saveEligibilityRule: (rule: PromotionEligibilityRule) => Promise<void>;
    evaluateEligibility: (employeeId: string, newRole: string) => { isEligible: boolean; reasons: string[]; scores: any };

    // Payroll Actions
    cooReviewPayroll: () => void;
    cfoApprovePayroll: () => void;
    updateEmployeeSalary: (empId: string, newSalary: number, reason: string, effectiveDate: string) => void;


    // Task Management
    tasks: Task[];
    createTask: (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => void;
    updateTaskStatus: (taskId: string, status: Task['status']) => void;
    submitTaskEvidence: (taskId: string, notes: string, b64Evidence: string[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial Permissions Configuration
const INITIAL_PERMISSIONS: Record<AdminRole, ModuleType[]> = {
    'SUPER_ADMIN': ['Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS', 'Settings', 'Leave', 'Performance', 'Compliance', 'System Users'],
    'COO': ['Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS', 'Leave', 'Performance', 'Compliance'],
    'HR_ADMIN': ['Dashboard', 'Employees', 'Recruitment', 'QR & ID', 'Leave', 'Performance'],
    'MANAGEMENT_ADMIN': ['Dashboard', 'Employees', 'Leave', 'Performance', 'Compliance'],
    'FINANCE_ADMIN': ['Dashboard', 'Payroll'],
    'PAYROLL_ADMIN': ['Dashboard', 'Payroll'],
    'TECHNICIAN': ['Dashboard', 'QR & ID', 'System Users'],
    'WEB_ADMIN': ['Dashboard', 'Website CMS', 'Settings'],
    'VIEWER': ['Dashboard'],
    'CHIEF_RISK_OFFICER': ['Dashboard', 'Compliance'],
    'USER': [] // Standard users have no admin module access
};

// Mock Notifications
const INITIAL_NOTIFICATIONS: AdminNotification[] = [
    { id: '1', title: 'System Alert', type: 'System', message: 'New admin session started', timestamp: new Date().toISOString(), isRead: false, link: '/admin/dashboard' },
    { id: '2', title: 'Onboarding', type: 'HR', message: 'New employee onboarded: Sarah Jenkins', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, link: '/admin/employees' },
    { id: '3', title: 'Payroll Update', type: 'Payroll', message: 'January Payroll cycle opened', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true, link: '/admin/payroll' },
    { id: '4', title: 'Application Received', type: 'Recruitment', message: '5 new applications for Frontend Dev', timestamp: new Date(Date.now() - 172800000).toISOString(), isRead: false, link: '/admin/recruitment' },
    { id: '5', title: 'QR Maintenance', type: 'QR', message: 'Bulk QR regeneration completed', timestamp: new Date(Date.now() - 250000000).toISOString(), isRead: true, link: '/admin/qr' }
];

import type { AuthLevel } from '../components/PinAuthorizationModal';
import { PinAuthorizationModal } from '../components/PinAuthorizationModal';
import { useFeedback } from './FeedbackContext';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showSuccess, showError, showInfo } = useFeedback();

    // Global Loading State
    const [isLoading, setIsLoading] = useState(true); // Start true to fetch initial data

    const [authRequest, setAuthRequest] = useState<{ level: AuthLevel; description: string; onConfirm: () => void } | null>(null);

    // Bonus State
    const [bonusTypes, setBonusTypes] = useState<BonusType[]>([]);
    const [bonusRequests, setBonusRequests] = useState<BonusRequest[]>([]);

    // Task State
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    const requestAuth = (level: AuthLevel, description: string, onConfirm: () => void) => {
        setAuthRequest({ level, description, onConfirm });
    };

    const handleAuthSuccess = () => {
        if (authRequest) {
            authRequest.onConfirm();
            setAuthRequest(null);
            // Log the clean auth event
            logAction('Authorization', `PIN Verified for: ${authRequest.description} by ${authRequest.level === 'SENSITIVE' ? 'SUPER_ADMIN' : 'USER'}`);
        }
    };

    // State
    const [employees, setEmployees] = useState<Employee[]>([]); // Start empty, fetch on mount
    const [jobs, setJobs] = useState<Job[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [cmsContent, setCmsContent] = useState<import('../types/cms').CMSData | null>(null);
    const [footerContent, setFooterContent] = useState<FooterContent>(initialFooterContent);
    const [globalContent, setGlobalContent] = useState<GlobalContent>(initialGlobalContent);
    const [servicesCollection, setServicesCollection] = useState<ServiceCollection>(initialServicesCollection);
    const [ceoSignature, setCeoSignature] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<AdminNotification[]>(INITIAL_NOTIFICATIONS);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    const [currentTenantId] = useState('tenant-default');


    // Define helper functions before they are used in other functions
    const sendEmail = (to: string, subject: string, body: string) => {
        const newLog: EmailLog = {
            id: `EMAIL-${Date.now()}`,
            recipientEmail: to,
            recipientName: employees.find(e => e.email === to)?.name || 'Unknown',
            subject,
            body,
            timestamp: new Date().toISOString(),
            triggerEvent: 'System Action'
        };
        setEmailLogs(prev => [newLog, ...prev]);
        logAction('System', `Email sent to ${to}: ${subject}`);
    };

    const generateSystemPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        return Array.from({ length: 12 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };

    // New Email Logs
    // New Email Logs
    const [currentUserRole, setCurrentUserRole] = useState<AdminRole>('USER'); // Default safe, update on auth
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || id;
    const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, ModuleType[]>>(INITIAL_PERMISSIONS);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>(initialReviewCycles);

    const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(initialPerformanceReviews);

    // New State for Modules
    const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(initialLedgerEntries);
    const [promotionRequests, setPromotionRequests] = useState<PromotionRequest[]>(initialPromotionRequests);
    const [eligibilityRules, setEligibilityRules] = useState<PromotionEligibilityRule[]>(initialEligibilityRules);
    const [apiKeys, setApiKeys] = useState<SystemApiKey[]>(initialApiKeys);

    // AdminNotification Deduplication Ref
    const lastNotificationRef = React.useRef<{ sig: string; time: number } | null>(null);

    // --- AUTH & INITIALIZATION LOGIC ---
    React.useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // 1. Check Auth
                const authResponse = await authService.getCurrentUser();
                if (authResponse.success && authResponse.data) {
                    const user = authResponse.data;
                    setIsAuthenticated(true);
                    setCurrentUserRole(user.role);
                    setCurrentUserId(user.id);
                    // Load permissions based on role
                    // In a real app, permissions might come from the user object directly
                }

                // 2. Load Employees (Required for everyone to see names etc)
                const empResponse = await employeeService.getAllEmployees();
                if (empResponse.success) {
                    const empData = Array.isArray(empResponse.data) ? empResponse.data : (empResponse.data?.data || []);
                    setEmployees(empData);
                }

                // 3. Load Notifications (if auth)
                if (authResponse.success && authResponse.data) {
                    const safePromise = <T,>(p: Promise<T>, def: any = []): Promise<T> =>
                        p.catch(e => ({ success: false, data: def, error: e.message } as unknown as T));

                    const [notifResponse, leaveResponse, cycleResponse, cmsResponse, settingsResponse, servicesResponse, ledgerResponse, salaryResponse, promotionResponse, bonusTypeResponse, bonusRequestResponse, jobsResponse, payrollStatusResponse] = await Promise.all([
                        safePromise(notificationService.getNotifications(authResponse.data.id, authResponse.data.role)),
                        safePromise(leaveService.getAllLeaveRequests()),
                        safePromise(performanceService.getReviewCycles()),
                        safePromise(cmsService.getCMSContent(), null),
                        safePromise(settingsService.getGlobalSettings(), null),
                        safePromise(cmsService.getServices()),
                        safePromise(financeService.getLedgerEntries()),
                        safePromise(departmentService.getDepartments()),
                        safePromise(promotionService.getPromotionRequests()),
                        safePromise(bonusService.getBonusTypes()),
                        safePromise(bonusService.getBonusRequests()),
                        safePromise(jobService.getAllJobs()),
                        safePromise(payrollService.getPayrollStatus())
                    ]);

                    const safeArr = (d: any) => Array.isArray(d) ? d : (d?.data || []);

                    if (notifResponse.success) setNotifications(safeArr(notifResponse.data));
                    if (leaveResponse.success) setLeaveRequests(safeArr(leaveResponse.data));
                    if (cycleResponse.success) setReviewCycles(safeArr(cycleResponse.data));
                    if (settingsResponse.success) setGlobalContent(settingsResponse.data);
                    if (jobsResponse.success) setJobs(safeArr(jobsResponse.data));

                    const pStatusData = safeArr(payrollStatusResponse.data);
                    if (payrollStatusResponse.success && pStatusData.length > 0) {
                        setPayrollStatus(pStatusData[0]);
                    }

                    // Fetch real CMS content layout
                    try {
                        const pagesResponse = await cmsService.getCMSPages();
                        if (pagesResponse.success && pagesResponse.data) {
                            setCmsContent(pagesResponse.data as any);
                        } else if (cmsResponse.success && cmsResponse.data) {
                            setCmsContent(cmsResponse.data as any);
                        } else {
                            // If no CMS content, just set to null (no fallback)
                            setCmsContent(null);
                        }
                    } catch (cmsErr) {
                        setCmsContent(null);
                    }

                    if (servicesResponse.success) setServicesCollection(servicesResponse.data);
                    if (ledgerResponse.success) setLedgerEntries(safeArr(ledgerResponse.data));
                    if (salaryResponse.success) setDepartments(safeArr(salaryResponse.data));
                    if (promotionResponse.success) setPromotionRequests(safeArr(promotionResponse.data));
                    if (bonusTypeResponse.success) setBonusTypes(safeArr(bonusTypeResponse.data));
                    if (bonusRequestResponse.success) setBonusRequests(safeArr(bonusRequestResponse.data));

                    // Also fetch eligibility rules
                    const eligibilityResponse = await promotionService.getEligibilityRules();
                    if (eligibilityResponse.success) setEligibilityRules(safeArr(eligibilityResponse.data));
                }

            } catch (error) {
                console.error("Initialization Failed:", error);
                showError({ title: 'System Error', message: 'Failed to load application data.' });
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    // Listen for CMS preview data from parent window (for iframe preview)
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'live-preview-update' && event.data?.data) {
                const { cmsContent: newCms, globalContent: newGlobal, footerContent: newFooter, servicesCollection: newServices } = event.data.data;
                if (newCms) setCmsContent(newCms);
                if (newGlobal) setGlobalContent(newGlobal);
                if (newFooter) setFooterContent(newFooter);
                if (newServices) setServicesCollection(newServices);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // --- REMINDER ENGINE LOGIC ---
    React.useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const ONE_HOUR = 60 * 60 * 1000;



            // 1. Process Leave Requests
            setLeaveRequests(prev => prev.map(req => {
                if (req.status !== 'Pending') return req;

                // Safely handle requestedAt
                const requestedDate = new Date(req.requestedAt);
                if (isNaN(requestedDate.getTime())) return req;

                const diffTime = now.getTime() - requestedDate.getTime();
                const diffHours = diffTime / ONE_HOUR;
                const currentLevel = req.reminderLevel || 0;
                let newLevel = currentLevel;
                let shouldRemind = false;
                let escalation = false;

                // T+24h: First Reminder
                if (diffHours >= 24 && diffHours < 72 && currentLevel < 1) {
                    newLevel = 1;
                    shouldRemind = true;
                }
                // T+72h: Second Reminder
                else if (diffHours >= 72 && diffHours < 120 && currentLevel < 2) {
                    newLevel = 2;
                    shouldRemind = true;
                }
                // T+5d (120h): Escalation
                else if (diffHours >= 120 && currentLevel < 3) {
                    newLevel = 3;
                    shouldRemind = true;
                    escalation = true;
                }

                if (shouldRemind) {
                    // console.log(`[Reminder Logic] Triggered for Leave ${req.id} at Level ${newLevel}`);

                    const employeeName = employees.find(e => e.id === req.employeeId)?.name || req.employeeId;

                    if (escalation) {
                        dispatchNotification(
                            {
                                title: 'ESCALATION: Overdue Leave Request',
                                message: `Leave Request by ${employeeName} has been pending for over 5 days. Action required immediately.`,
                                type: 'Leave',
                                link: '/admin/leave'
                            },
                            { roles: ['SUPER_ADMIN'] }, // Escalate to SUPER_ADMIN
                            ['in-app', 'email']
                        );
                        logAction('System Escalation', `Escalated Leave Request ${req.id} for ${employeeName} to SUPER_ADMIN`);
                    } else {
                        dispatchNotification(
                            {
                                title: newLevel === 2 ? 'Reminder: Pending Leave Request' : 'New Leave Request Pending',
                                message: `Leave Request by ${employeeName} for ${req.days} days matches pending approval. (${Math.floor(diffHours)}h ago)`,
                                type: 'Leave',
                                link: '/admin/leave'
                            },
                            { roles: ['COO', 'HR_ADMIN'] }, // Remind Approvers
                            newLevel === 2 ? ['in-app', 'email'] : ['in-app']
                        );
                        logAction('System Reminder', `Sent Level ${newLevel} reminder for Leave Request ${req.id}`);
                    }

                    return { ...req, reminderLevel: newLevel, lastRemindedAt: now.toISOString() };
                }

                return req;
            }));

            // 2. Process Performance Reviews (Placeholder for similar logic if mocked reviews existed)
        };

        // Run check on mount and every 60 seconds
        checkReminders();
        const interval = setInterval(checkReminders, 60000);
        return () => clearInterval(interval);

        // Intentionally missing dispatchNotification/employees from deps to simulate background service behavior
        // and avoid re-triggering on every state update, essentially running independently.
        // In a real app, this would be a backend job.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // --- END REMINDER ENGINE ---
    // Auth State - Default to false for preview environment security
    // (Removed duplicate isAuthenticated state)

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
        { id: '1', user: 'Admin User', role: 'SUPER_ADMIN', action: 'System Login', timestamp: new Date().toISOString() }
    ]);
    const [payrollStatus, setPayrollStatus] = useState<PayrollCycle>({
        id: 'JAN-2026',
        tenantId: 'tenant-default',
        month: 'January',
        year: 2026,
        status: 'Draft',
        adjustments: []
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Actions
    const logAction = (action: string, details?: string, ..._args: any[]) => {
        const newLog: ActivityLog = {
            id: Math.random().toString(36).substr(2, 9),
            user: 'Admin User',
            actorName: 'Admin User', // Set default or current user name
            actorRole: currentUserRole,
            role: currentUserRole,
            action,
            actionType: action, // Mirror for compatibility
            details,
            timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const updateEmployee = async (id: string, updates: Partial<Employee>) => {
        setIsLoading(true);
        try {
            const response = await employeeService.updateEmployee(id, updates);
            if (response.success) {
                setEmployees(prev => prev.map(emp => {
                    if (emp.id === id) {
                        const oldEmp = emp;
                        // Salary Band Logic: Enforce structure on role change
                        if (updates.systemRole && updates.systemRole !== emp.systemRole) {
                            // Exclusions: Compliance & Audit Officers (per requirements)
                            const isExcluded = ['CHIEF_RISK_OFFICER'].includes(updates.systemRole) ||
                                (updates.title && /Compliance|Audit/i.test(updates.title)) ||
                                (emp.title && /Compliance|Audit/i.test(emp.title));

                            if (!isExcluded) {
                                const dept = departments.find(d => d.name === updates.department);
                                if (dept) {
                                    // Ensure salary respects the band of the NEW role
                                    let newSalary = updates.salary !== undefined ? updates.salary : emp.salary;
                                    let adjusted = false;

                                    if (newSalary < dept.minSalary) {
                                        newSalary = dept.minSalary;
                                        adjusted = true;
                                    } else if (newSalary > dept.maxSalary) {
                                        newSalary = dept.maxSalary;
                                        adjusted = true;
                                    }

                                    if (adjusted) {
                                        updates.salary = newSalary;
                                        logAction('Salary Auto-Adjustment', `Salary adjusted to ₦${newSalary.toLocaleString()} to match ${updates.department} band.`);
                                    }
                                }
                            }
                        }

                        const newEmp = { ...emp, ...updates };

                        // Detect Financial/Role Changes and Notify
                        if (updates.salary && updates.salary !== oldEmp.salary) {
                            const diff = updates.salary - oldEmp.salary;
                            const type = diff > 0 ? 'Salary Increase' : 'Salary Adjustment';

                            dispatchNotification(
                                {
                                    title: type,
                                    message: `Your salary has been updated to ₦${updates.salary.toLocaleString()}`,
                                    type: 'Payroll',
                                    link: '/user/profile'
                                },
                                { userId: id },
                                ['in-app', 'email'] // Critical: Send Email
                            );
                            logAction(type, `Updated salary for ${id} from ${oldEmp.salary} to ${updates.salary}`);
                        }

                        if (updates.title && updates.title !== oldEmp.title) {
                            dispatchNotification(
                                {
                                    title: 'Role Update',
                                    message: `Congratulations on your new role: ${updates.title}!`,
                                    type: 'HR',
                                    link: '/user/profile'
                                },
                                { userId: id },
                                ['in-app', 'email'] // Critical: Send Email
                            );
                            logAction('Promotion/Role Change', `Updated title for ${id} to ${updates.title}`);
                        }

                        if (updates.department && updates.department !== oldEmp.department) {
                            dispatchNotification(
                                {
                                    title: 'Department Transfer',
                                    message: `You have been moved to the ${updates.department} department`,
                                    type: 'HR',
                                    link: '/user/profile'
                                },
                                { userId: id },
                                ['in-app'] // Information only
                            );
                        }

                        return newEmp;
                    }
                    return emp;
                }));

                // Log generic update if not captured above or simple profile update
                if (!updates.salary && !updates.title) {
                    logAction('Updated Employee', `Updated profile for ${id}`);
                }
                showSuccess({ title: 'Profile Updated', message: 'Employee profile updated successfully.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update employee.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserProfile = async (updates: Partial<Employee>) => {
        if (!currentUserId) return;

        setIsLoading(true);
        try {
            // Safe subset of updates for self-service
            const safeUpdates: Partial<Employee> = {
                phoneNumber: updates.phoneNumber,
                address: updates.address,
                emergencyContact: updates.emergencyContact,
                bankDetails: updates.bankDetails,
                taxDetails: updates.taxDetails
            };

            const response = await employeeService.updateEmployee(currentUserId, safeUpdates);
            if (response.success) {
                setEmployees(prev => prev.map(e => e.id === currentUserId ? { ...e, ...safeUpdates } : e));
                logAction('Profile Update', `User updated their own profile`);
                showSuccess({ title: 'Profile Updated', message: 'Your changes have been saved.' });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    const addEmployee = async (newEmployee: Omit<Employee, 'tenantId'>) => {
        setIsLoading(true);
        try {
            const fullEmployee: Employee = { ...newEmployee, tenantId: currentTenantId || 'tenant-default' };
            const response = await employeeService.createEmployee(fullEmployee);
            if (response.success) {
                setEmployees(prev => [fullEmployee, ...prev]);
                logAction('Onboarding', `Added new employee: ${fullEmployee.name}`);
                showSuccess({ title: 'Employee Added', message: `${fullEmployee.name} has been successfully onboarded.` });
            } else {
                showError({ title: 'Onboarding Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Onboarding Error', message: 'Failed to create employee.' });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteEmployee = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await employeeService.deleteEmployee(id);
            if (response.success) {
                setEmployees(prev => prev.filter(emp => emp.id !== id));
                logAction('Offboarding', `Removed employee: ${id}`);
                showSuccess({ title: 'Employee Removed', message: 'Employee has been removed from the system.' });
            } else {
                showError({ title: 'Offboarding Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Offboarding Error', message: 'Failed to delete employee.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateEmployeeContract = async (id: string, contract: any) => {
        setIsLoading(true);
        try {
            // Mock implementation for now
            setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...contract } : emp));
            logAction('Contract Update', `Updated contract for ${id}`);
            showSuccess({ title: 'Contract Updated', message: 'Contract details have been saved.' });
        } finally {
            setIsLoading(false);
        }
    };

    const uploadContractDocument = async (id: string, doc: any) => {
        setIsLoading(true);
        try {
            // Mock implementation for now
            console.log(`Uploaded document for ${id}`, doc);
            logAction('Document Upload', `Uploaded contract document for ${id}`);
            showSuccess({ title: 'Document Uploaded', message: 'Contract document has been recorded.' });
        } finally {
            setIsLoading(false);
        }
    };

    const regenerateQR = (ids: string[]) => {
        setEmployees(prev => prev.map(emp =>
            ids.includes(emp.id) ? { ...emp, verifiedAt: new Date().toISOString() } : emp
        ));
        logAction('Regenerated QR', `Regenerated QR for ${ids.length} employees. Reprint required.`);
        addNotification('QR', `QR Codes regenerated for ${ids.length} staff`, '/admin/qr');
    };

    const toggleQRStatus = (id: string, status: 'active' | 'suspended') => {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: status === 'suspended' ? 'suspended' : 'active' } : emp));
        logAction('Updated QR Status', `Set QR status to ${status} for ${id}`);
    };

    const updatePayrollStatus = async (status: PayrollCycle['status']) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
        if (!authorizedRoles.includes(currentUserRole)) {
            showError({ title: 'Unauthorized', message: 'Only Finance or SUPER_ADMINs can update payroll status.' });
            return;
        }

        // 1. State Locking Logic
        if (payrollStatus.status === 'Paid' && status !== 'Paid') {
            showError({ title: 'Action Denied', message: 'Cannot revert a completed Paid payroll cycle.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await payrollService.updateStatus(payrollStatus.id, status);
            if (response.success) {
                setPayrollStatus(prev => ({ ...prev, status }));
                logAction('Updated Payroll Status', `Changed status to ${status}`);

                if (status === 'Approved' || status === 'Paid') {
                    dispatchNotification(
                        {
                            title: 'Payslip Available',
                            message: `Payroll status updated to ${status}. Please check your Payslip.`,
                            type: 'Payroll',
                            link: '/user/payroll'
                        },
                        { userId: currentUserId || undefined, roles: ['USER'] },
                        ['in-app', 'email']
                    );
                } else {
                    addNotification('Payroll', `Payroll status updated to ${status}`, '/admin/payroll');
                }
                showSuccess({ title: 'Status Updated', message: `Payroll status updated to ${status}.` });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update payroll status.' });
        } finally {
            setIsLoading(false);
        }
    };

    const addPayrollAdjustment = async (empId: string, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        // 0. Security & State Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
        if (!authorizedRoles.includes(currentUserRole)) {
            showError({ title: 'Unauthorized', message: 'You do not have permission to add adjustments.' });
            return;
        }
        if (payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid') {
            showError({ title: 'Action Locked', message: `Cannot add adjustments when Payroll is ${payrollStatus.status}.` });
            return;
        }

        setIsLoading(true);
        try {
            const response = await payrollService.addAdjustment(empId, type, amount, reason);
            if (response.success) {
                setPayrollStatus(prev => ({
                    ...prev,
                    adjustments: [...prev.adjustments, { empId, type, amount, reason }]
                }));
                logAction('Payroll Adjustment', `Added ${type} of ₦${amount} for ${empId}: ${reason}`);
                showSuccess({ title: 'Adjustment Added', message: 'Payroll adjustment recorded successfully.' });
            } else {
                showError({ title: 'Adjustment Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Adjustment Error', message: 'Failed to record payroll adjustment.' });
        } finally {
            setIsLoading(false);
        }
    };

    const bulkPayrollAdjustment = async (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        // 0. Security & State Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN'];
        if (!authorizedRoles.includes(currentUserRole)) {
            showError({ title: 'Unauthorized', message: 'You do not have permission to create bulk adjustments.' });
            return;
        }
        if (payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid') {
            showError({ title: 'Action Locked', message: `Cannot add adjustments when Payroll is ${payrollStatus.status}.` });
            return;
        }

        setIsLoading(true);
        try {
            // Note: In a real system, there would be a bulk API. For now, simulate multiple calls or a single bulk call if the service supported it.
            // We'll simulate a single bulk call logic in the service (conceptually).
            const responses = await Promise.all(empIds.map(id => payrollService.addAdjustment(id, type, amount, reason)));
            const allSuccess = responses.every(r => r.success);

            if (allSuccess) {
                const newAdjustments = empIds.map(empId => ({ empId, type, amount, reason }));
                setPayrollStatus(prev => ({
                    ...prev,
                    adjustments: [...prev.adjustments, ...newAdjustments]
                }));

                // Detailed Logging
                empIds.forEach(id => {
                    logAction('Payroll Adjustment', `Added ${type} of ₦${amount} for ${id}: ${reason}`);
                });

                logAction('Bulk Adjustment Batch', `Processed ${type} for ${empIds.length} employees. Total: ₦${amount * empIds.length}`);
                showSuccess({ title: 'Bulk Adjustment', message: `Applied adjustment to ${empIds.length} employees.` });
            } else {
                showError({ title: 'Bulk Adjustment Failed', message: 'Some adjustments failed to record.' });
            }
        } catch (err) {
            showError({ title: 'Bulk Adjustment Error', message: 'Failed to process bulk adjustments.' });
        } finally {
            setIsLoading(false);
        }
    };

    const cooReviewPayroll = () => {
        updatePayrollStatus('Reviewed');
        logAction('Payroll Review', 'COO reviewed payroll for ' + payrollStatus.month);
        showSuccess({ title: 'Payroll Reviewed', message: 'Payroll has been marked as reviewed.' });
    };

    const cfoApprovePayroll = () => {
        updatePayrollStatus('Approved');
        logAction('Payroll Approval', 'CFO approved payroll for ' + payrollStatus.month);
        showSuccess({ title: 'Payroll Approved', message: 'Payroll approved. Funds are now ready for disbursement.' });
    };

    const updateEmployeeSalary = async (empId: string, newSalary: number, reason: string, _effectiveDate: string) => {
        setIsLoading(true);
        try {
            // In a real app, effectiveDate would be used for scheduling.
            const response = await employeeService.updateSalary(empId, newSalary, reason);
            if (response.success) {
                setEmployees(prev => prev.map(e => e.id === empId ? { ...e, salary: newSalary } : e));
                logAction('Salary Update', `Updated salary for ${empId} to ${newSalary}. Reason: ${reason}`);
                showSuccess({ title: 'Salary Updated', message: 'Employee salary has been modified.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update salary.' });
        } finally {
            setIsLoading(false);
        }
    };



    // Job Actions
    const addJob = async (job: Omit<Job, 'tenantId'>) => {
        setIsLoading(true);
        try {
            const fullJob: Job = { ...job, tenantId: currentTenantId || 'tenant-default' };
            const response = await jobService.createJob(fullJob);
            if (response.success) {
                setJobs(prev => [...prev, response.data]);
                logAction('Posted Job', `Created new job listing: ${fullJob.title}`);
                addNotification('Recruitment', `New Job Posted: ${fullJob.title}`, `/admin/recruitment?jobId=${fullJob.id}`);
                showSuccess({ title: 'Job Posted', message: `${fullJob.title} is now live.` });
            } else {
                showError({ title: 'Post Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Post Error', message: 'Failed to post job listing.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateJob = async (id: string, updates: Partial<Job>) => {
        setIsLoading(true);
        try {
            const response = await jobService.updateJob(id, updates);
            if (response.success) {
                setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));
                logAction('Updated Job', `Updated job listing ${id}`);
                showSuccess({ title: 'Job Updated', message: 'Job details have been saved.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update job.' });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteJob = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await jobService.deleteJob(id);
            if (response.success) {
                setJobs(prev => prev.filter(job => job.id !== id));
                logAction('Deleted Job', `Deleted job listing ${id}`);
                showSuccess({ title: 'Job Deleted', message: 'Job listing has been removed.' });
            } else {
                showError({ title: 'Delete Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Delete Error', message: 'Failed to delete job.' });
        } finally {
            setIsLoading(false);
        }
    };

    // CMS & Content Actions
    const updatePMSContent = async (path: string | number, content: any) => {
        setIsLoading(true);
        try {
            const response = await cmsService.updateCMSSection(path, content);
            if (response.success) {
                // For nested JSON, an update might mean completely replacing a subtree.
                // Depending on how CMSPage.tsx is rebuilt, we may need to fetch the whole tree again or deep merge.
                // For now, let's just trigger a re-fetch since the topology is complex.
                const pagesResponse = await cmsService.getCMSPages();
                if (pagesResponse.success && pagesResponse.data) {
                    setCmsContent(pagesResponse.data as any);
                }
                logAction('CMS Edit', `Updated content path ${path}`);
                showSuccess({ title: 'Section Saved', message: 'Changes have been saved successfully.' });
            } else {
                showError({ title: 'Update Failed', message: response.error || 'Failed to update section' });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to save CMS changes.' });
        } finally {
            setIsLoading(false);
        }
    };

    const publishPMSContent = async (path: string | number) => {
        setIsLoading(true);
        try {
            const response = await cmsService.updateCMSSectionStatus(path, 'published');
            if (response.success) {
                logAction('CMS Publish', `Published section ${path}`);
                dispatchNotification(
                    { title: 'Website Updated', message: `Section ${path} has been published successfully.`, type: 'System', link: '/' },
                    { roles: ['SUPER_ADMIN', 'COO'] }
                );
                showSuccess({ title: 'Published', message: 'Content is now live on the website.' });
            } else {
                showError({ title: 'Publish Failed', message: response.error || 'Failed to update status' });
            }
        } catch (err) {
            showError({ title: 'Publish Error', message: 'Failed to publish content.' });
        } finally {
            setIsLoading(false);
        }
    };

    const addCMSContent = async (section: any) => {
        setIsLoading(true);
        try {
            const response = await cmsService.addCMSContent(section);
            if (response.success) {
                const pagesResponse = await cmsService.getCMSPages();
                if (pagesResponse.success && pagesResponse.data) {
                    setCmsContent(pagesResponse.data as any);
                }
                logAction('CMS Section Added', `Added new content`);
                showSuccess({ title: 'Section Added', message: 'New content section has been created.' });
            } else {
                showError({ title: 'Addition Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Addition Error', message: 'Failed to add content section.' });
        } finally {
            setIsLoading(false);
        }
    };

    const createCMSPage = async (pageName: string, slug: string) => {
        setIsLoading(true);
        try {
            const response = await cmsService.addCMSPage(pageName, slug);
            if (response.success) {
                if (cmsContent) {
                    const newCmsContent = { ...cmsContent };
                    const safeSlug = slug.toLowerCase().replace(/\s+/g, '-');

                    // 1. Add to pages
                    newCmsContent.pages = {
                        ...newCmsContent.pages,
                        [safeSlug]: {
                            heroCardData: []
                        }
                    };

                    // 2. Add to metaData
                    const existingMetaIndex = newCmsContent.metaData.findIndex((m: any) => m.slug === safeSlug);
                    if (existingMetaIndex === -1) {
                        newCmsContent.metaData = [
                            ...newCmsContent.metaData,
                            {
                                slug: safeSlug,
                                title: `${pageName} | Eleastar Technologies Ltd.`,
                                description: `Learn more about ${pageName}`,
                                keywords: `${safeSlug}, eleastar`,
                                author: "Eleastar Technologies Ltd.",
                                ogTags: {
                                    ogTitle: `${pageName} | Eleastar Technologies Ltd.`,
                                    ogDescription: `Learn more about ${pageName}`,
                                    ogKeywords: `${safeSlug}, eleastar`,
                                    ogUrl: `https://eleastar.com/${safeSlug}`,
                                    ogType: "website",
                                    ogLocale: "en_US",
                                    ogSiteName: "Eleastar Technologies Ltd.",
                                    ogImage: {
                                        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80',
                                        alt: 'Eleastar Tech'
                                    }
                                }
                            }
                        ];
                    }

                    // 3. Add to navData
                    const existingNavIndex = newCmsContent.navData.findIndex((n: any) => n.slug === safeSlug);
                    if (existingNavIndex === -1) {
                        newCmsContent.navData = [
                            ...newCmsContent.navData,
                            {
                                label: pageName,
                                slug: safeSlug,
                                href: `/${safeSlug}`
                            }
                        ];
                    }

                    setCmsContent(newCmsContent);
                }
                logAction('CMS Page Created', `Created dynamic page ${pageName}`);
                showSuccess({ title: 'Page Created', message: `${pageName} page has been created successfully.` });
            } else {
                showError({ title: 'Creation Failed', message: response.error || 'Failed to create page' });
            }
        } catch (err) {
            showError({ title: 'Creation Error', message: 'Failed to create new CMS page.' });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCMSContent = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await cmsService.deleteCMSContent(id);
            if (response.success) {
                const pagesResponse = await cmsService.getCMSPages();
                if (pagesResponse.success && pagesResponse.data) {
                    setCmsContent(pagesResponse.data as any);
                }
                logAction('CMS Section Deleted', `Removed section ${id}`);
                showSuccess({ title: 'Deleted', message: 'Section has been removed.' });
            } else {
                showError({ title: 'Deletion Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Deletion Error', message: 'Failed to delete section.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateFooterContent = async (section: keyof FooterContent, data: Partial<FooterSection>) => {
        setIsLoading(true);
        try {
            const response = await cmsService.updateFooter(section, data);
            if (response.success) {
                // @ts-ignore
                setFooterContent(prev => ({ ...prev, [section]: { ...prev[section], ...data } }));
                logAction('Footer Edit', `Updated footer section: ${section}`);
                showSuccess({ title: 'Footer Updated', message: 'Footer changes saved successfully.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update footer.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Global Settings & Services
    const updateGlobal = async (section: keyof GlobalContent, data: any) => {
        setIsLoading(true);
        try {
            const response = await settingsService.updateGlobal(section, data);
            if (response.success) {
                setGlobalContent(prev => ({ ...prev, [section]: data }));
                logAction('Settings Update', `Updated global setting: ${section}`);
                showSuccess({ title: 'Settings Saved', message: 'Global configuration updated.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to save settings.' });
        } finally {
            setIsLoading(false);
        }
    };

    const addService = async (service: Omit<ServiceItem, 'tenantId'>) => {
        setIsLoading(true);
        try {
            const fullService: ServiceItem = { ...service, tenantId: currentTenantId || 'tenant-default' };
            const response = await cmsService.addService(fullService);
            if (response.success) {
                setServicesCollection(prev => [...prev, fullService]);
                logAction('Service Added', `Added new service: ${fullService.title}`);
                showSuccess({ title: 'Service Added', message: 'New service has been cataloged.' });
            } else {
                showError({ title: 'Addition Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Addition Error', message: 'Failed to add service.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateService = async (id: string, updates: Partial<ServiceItem>) => {
        setIsLoading(true);
        try {
            const response = await cmsService.updateService(id, updates);
            if (response.success) {
                setServicesCollection(prev => prev.map(s => s.id === id ? { ...s, ...updates, lastUpdated: new Date().toISOString() } : s));
                logAction('Service Edit', `Updated service details for ${id}`);
                showSuccess({ title: 'Service Updated', message: 'Service changes have been saved.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to save service changes.' });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteService = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await cmsService.deleteService(id);
            if (response.success) {
                setServicesCollection(prev => prev.filter(s => s.id !== id));
                logAction('Service Deleted', `Removed service ${id}`);
                showSuccess({ title: 'Service Deleted', message: 'Service has been removed from catalog.' });
            } else {
                showError({ title: 'Deletion Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Deletion Error', message: 'Failed to delete service.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateCeoSignature = async (url: string) => {
        setIsLoading(true);
        try {
            const response = await settingsService.updateCeoSignature(url);
            if (response.success) {
                setCeoSignature(url);
                logAction('Settings', 'Updated CEO digital signature');
                showSuccess({ title: 'Signature Updated', message: 'CEO signature has been recorded.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update CEO signature.' });
        } finally {
            setIsLoading(false);
        }
    };

    // AdminNotification Engine Logic
    const sendEmailNotification = (recipientEmail: string, recipientName: string, title: string, message: string, link: string, triggerEvent: string) => {
        const newLog: EmailLog = {
            id: Math.random().toString(36).substr(2, 9),
            recipientEmail,
            recipientName,
            subject: title,
            body: `${message}\n\nView details: ${window.location.origin}${link}`,
            timestamp: new Date().toISOString(),
            triggerEvent
        };
        setEmailLogs(prev => [newLog, ...prev]);
        // console.log(`[EMAIL SENT] To: ${recipientEmail} | Subject: ${title} | Body: ${message}`);
    };

    const dispatchNotification = (
        payload: { title: string; message: string; type: NotificationType; link: string },
        target: { userId?: string; roles?: AdminRole[] },
        channels: NotificationChannel[] = ['in-app']
    ) => {
        // 0. Deduplication (5 second window)
        const currentSig = JSON.stringify({ p: payload, t: target });
        const now = Date.now();
        if (lastNotificationRef.current &&
            lastNotificationRef.current.sig === currentSig &&
            now - lastNotificationRef.current.time < 5000) {
            // console.log('[AdminNotification] Duplicate suppressed:', payload.title);
            return;
        }
        lastNotificationRef.current = { sig: currentSig, time: now };

        // 1. In-App Channel
        if (channels.includes('in-app') || channels.includes('both')) {
            const newNotif: AdminNotification = {
                id: Math.random().toString(36).substr(2, 9),
                title: payload.title,
                type: payload.type,
                message: payload.message,
                timestamp: new Date().toISOString(),
                isRead: false,
                link: payload.link,
                targetUserId: target.userId,
                targetRole: target.roles
            };
            setNotifications(prev => [newNotif, ...prev]);
        }

        // 2. Email Channel (Mock)
        if (channels.includes('email') || channels.includes('both')) {
            // Determine recipients
            let recipients: Employee[] = [];

            // A. Specific USER Target
            if (target.userId) {
                const user = employees.find(e => e.id === target.userId);
                if (user) recipients.push(user);
            }

            // B. Role target (Expand to all users with these roles)
            if (target.roles && target.roles.length > 0) {
                const roleMatches = employees.filter(e => target.roles!.includes(e.systemRole));
                recipients.push(...roleMatches);
            }

            // Deduplicate recipients by ID
            const uniqueRecipients = Array.from(new Set(recipients.map(r => r.id)))
                .map(id => recipients.find(r => r.id === id)!)
                .filter(Boolean); // Safety check

            uniqueRecipients.forEach(recipient => {
                sendEmailNotification(
                    recipient.email || `${recipient.id.toLowerCase()}@eleastar.com`,
                    recipient.name,
                    payload.title,
                    payload.message,
                    payload.link,
                    payload.type
                );
            });
        }
    };

    // Backward Compatibility Wrapper
    const addNotification = (type: NotificationType, message: string, link: string, targetUserId?: string) => {
        // Infer a title based on type
        const titleMap: Record<string, string> = {
            'System': 'System AdminNotification',
            'HR': 'HR Update',
            'Payroll': 'Payroll Alert',
            'Recruitment': 'Hiring Update',
            'Leave': 'Leave Status',
            'Performance': 'Performance Review',
            'QR': 'Security Alert'
        };

        dispatchNotification(
            { title: titleMap[type] || 'AdminNotification', message, type, link },
            { userId: targetUserId }
        );
    };

    const markNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        logAction('Notifications', 'Marked all notifications as read');
    };

    // Leave Actions
    const requestLeave = async (userId: string, requestData: Omit<LeaveRequest, 'id' | 'tenantId' | 'employeeId' | 'status' | 'requestedAt'>) => {
        // 1. Validation
        if (new Date(requestData.startDate) > new Date(requestData.endDate)) {
            logAction('Leave Request Failed', `Invalid dates from user ${userId}: Start after End`);
            showError({ title: 'Invalid Dates', message: 'Start date must be before end date.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await leaveService.requestLeave(userId, requestData);
            if (response.success) {
                const newRequest = response.data;
                setLeaveRequests(prev => [newRequest, ...prev]);
                logAction('Leave Request', `New ${requestData.type} leave request from user ${userId}`);
                addNotification('HR', `New leave request received from ${userId}`, `/admin/leave?requestId=${newRequest.id}`);

                // Notify Admins
                dispatchNotification(
                    {
                        title: 'New Leave Request',
                        message: `${requestData.type} Leave Request from ${userId}`,
                        type: 'Leave',
                        link: `/admin/leave?requestId=${newRequest.id}`
                    },
                    { roles: ['HR_ADMIN', 'SUPER_ADMIN', 'COO'] },
                    ['in-app', 'email']
                );
                showSuccess({ title: 'Request Submitted', message: 'Leave request submitted successfully.' });
            } else {
                showError({ title: 'Request Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Request Error', message: 'Failed to submit leave request.' });
        } finally {
            setIsLoading(false);
        }
    };

    const approveLeave = async (requestId: string): Promise<{ success: boolean; error?: string }> => {
        // 0. Security & State Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
        if (!authorizedRoles.includes(currentUserRole)) {
            logAction('Unauthorized Action', `USER role ${currentUserRole} attempted to approve leave ${requestId}`);
            return { success: false, error: 'Unauthorized: Insufficient permissions' };
        }

        const request = leaveRequests.find(r => r.id === requestId);
        if (!request) return { success: false, error: 'Request not found' };

        if (request.status !== 'Pending') {
            return { success: false, error: `Request is already ${request.status}. Action denied.` };
        }

        setIsLoading(true);
        try {
            const response = await leaveService.approveLeave(requestId);
            if (response.success) {
                // Success Update
                setLeaveRequests(prev => prev.map(r => r.id === requestId ? {
                    ...r,
                    status: 'Approved',
                    actionBy: currentUserId || 'System',
                    actionAt: new Date().toISOString()
                } : r));

                // Deduct balance locally (Optimistic update or handled after real API sync)
                setEmployees(prev => prev.map(emp => {
                    if (emp.id === request.employeeId && emp.leaveBalance) {
                        const isAnnual = request.type === 'Annual';
                        const isSick = request.type === 'Sick';
                        return {
                            ...emp,
                            leaveBalance: {
                                ...emp.leaveBalance,
                                annual: isAnnual ? emp.leaveBalance.annual - request.days : emp.leaveBalance.annual,
                                sick: isSick ? emp.leaveBalance.sick - request.days : emp.leaveBalance.sick,
                                used: emp.leaveBalance.used + request.days
                            }
                        };
                    }
                    return emp;
                }));

                // Notify USER
                dispatchNotification(
                    {
                        title: 'Leave Approved',
                        message: 'Your leave request has been approved!',
                        type: 'Leave',
                        link: '/user/leave'
                    },
                    { userId: request.employeeId },
                    ['in-app', 'email']
                );

                logAction('Leave Approval', `Approved leave request ${requestId} for user ${request.employeeId}. Action by: ${currentUserId}`);
                showSuccess({ title: 'Leave Approved', message: 'Leave request approved successfully.' });
                return { success: true };
            } else {
                showError({ title: 'Approval Failed', message: response.error });
                return { success: false, error: response.error };
            }
        } catch (err) {
            showError({ title: 'Approval Error', message: 'Failed to approve leave request.' });
            return { success: false, error: 'Network error' };
        } finally {
            setIsLoading(false);
        }
    };

    const rejectLeave = async (requestId: string, reason: string) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
        if (!authorizedRoles.includes(currentUserRole)) {
            logAction('Unauthorized Action', `USER role ${currentUserRole} attempted to reject leave ${requestId}`);
            showError({ title: 'Unauthorized', message: 'You do not have permission to reject leave requests.' });
            return;
        }

        const request = leaveRequests.find(r => r.id === requestId);
        if (!request) return;

        if (request.status !== 'Pending') {
            showError({ title: 'Action Failed', message: `Request is already ${request.status}. Cannot reject.` });
            return;
        }

        setIsLoading(true);
        try {
            const response = await leaveService.rejectLeave(requestId, reason);
            if (response.success) {
                setLeaveRequests(prev => prev.map(r => r.id === requestId ? {
                    ...r,
                    status: 'Rejected',
                    rejectionReason: reason,
                    actionBy: currentUserId || 'System',
                    rejectedAt: new Date().toISOString()
                } : r));

                logAction('Leave Rejection', `Rejected leave request ${requestId} for user ${request.employeeId} with reason: ${reason}`);

                dispatchNotification(
                    {
                        title: 'Leave Rejected',
                        message: `Your leave request was rejected. Reason: ${reason}`,
                        type: 'Leave',
                        link: '/user/leave'
                    },
                    { userId: request.employeeId },
                    ['in-app', 'email']
                );
                showSuccess({ title: 'Request Rejected', message: 'Leave request rejected.' });
            } else {
                showError({ title: 'Rejection Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Rejection Error', message: 'Failed to reject leave request.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Performance Actions
    const createReviewCycle = async (cycle: Omit<ReviewCycle, 'id' | 'tenantId' | 'status'>) => {
        setIsLoading(true);
        try {
            const response = await performanceService.createReviewCycle(cycle);
            if (response.success) {
                setReviewCycles(prev => [response.data, ...prev]);
                logAction('Review Cycle', `Created new review cycle: ${cycle.title}`);

                dispatchNotification(
                    {
                        title: 'New Performance Review Cycle',
                        message: `A new performance review cycle "${cycle.title}" has started.`,
                        type: 'Performance',
                        link: '/user/performance'
                    },
                    {}, // Target all users (or specific roles if needed)
                    ['in-app']
                );
                showSuccess({ title: 'Cycle Created', message: 'Performance review cycle has been created.' });
            } else {
                showError({ title: 'Creation Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Creation Error', message: 'Failed to create review cycle.' });
        } finally {
            setIsLoading(false);
        }
    };

    const startReviewCycle = async (id: string) => {
        setIsLoading(true);
        try {
            // In a real app, this would be an API call that also generates reviews server-side.
            // For now, we'll update state and simulate generation.
            setReviewCycles(prev => prev.map(c => c.id === id ? { ...c, status: 'Active' } : c));

            // Generate Reviews for all eligible employees
            const cycle = reviewCycles.find(c => c.id === id);
            if (cycle) {
                const newReviews: PerformanceReview[] = employees.map(emp => ({
                    id: `PR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    tenantId: 'tenant-1',
                    employeeId: emp.id,
                    cycleId: id,
                    status: 'Pending',
                    rating: 0,
                    selfReview: '',
                    managerFeedback: '',
                    managerRating: 0,
                    submittedAt: '',
                    reviewedAt: '',
                    reviewedBy: '',
                    internalNotes: '',
                    recommendation: 'None'
                }));
                setPerformanceReviews(prev => [...prev, ...newReviews]);
                logAction('Review Cycle Started', `Generated ${newReviews.length} reviews for cycle ${cycle.title}`);
                showSuccess({ title: 'Cycle Started', message: `Generated ${newReviews.length} reviews.` });
            }
        } catch (err) {
            showError({ title: 'Error', message: 'Failed to start review cycle.' });
        } finally {
            setIsLoading(false);
        }
    };

    const submitSelfReview = async (id: string, selfReview: string, rating: number) => {
        setIsLoading(true);
        try {
            // Find existing review to get cycleId and employeeId
            const existing = performanceReviews.find(r => r.id === id);
            if (!existing) {
                showError({ title: 'Submission Error', message: 'Original review record not found.' });
                return;
            }

            const reviewUpdate: Omit<PerformanceReview, 'id' | 'tenantId' | 'status' | 'submittedAt'> = {
                cycleId: existing.cycleId,
                employeeId: existing.employeeId,
                selfReview,
                rating
            };

            const response = await performanceService.submitReview(reviewUpdate);
            if (response.success) {
                // Update local state: replace or add
                setPerformanceReviews(prev => prev.map(r => r.id === id ? {
                    ...r,
                    selfReview,
                    rating,
                    status: 'Submitted',
                    submittedAt: new Date().toISOString()
                } : r));

                logAction('Self Review Submitted', `User ${existing.employeeId} submitted self review for cycle ${existing.cycleId}`);

                dispatchNotification(
                    {
                        title: 'New Self-Evaluation',
                        message: `Employee ${getEmployeeName(existing.employeeId)} submitted their self-evaluation.`,
                        type: 'Performance',
                        link: '/admin/performance'
                    },
                    { roles: ['COO', 'SUPER_ADMIN', 'HR_ADMIN'] },
                    ['in-app']
                );
                showSuccess({ title: 'Review Submitted', message: 'Self-evaluation submitted successfully.' });
            } else {
                showError({ title: 'Submission Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Submission Error', message: 'Failed to submit review.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updatePerformanceReview = async (id: string, updates: Partial<PerformanceReview>) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
        if (!authorizedRoles.includes(currentUserRole)) {
            showError({ title: 'Unauthorized', message: 'You do not have permission to update reviews.' });
            return;
        }

        const review = performanceReviews.find(r => r.id === id);
        if (review && review.status === 'Approved') {
            showError({ title: 'Action Locked', message: 'Cannot update a finalized review.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await performanceService.updateReview(id, updates);
            if (response.success) {
                setPerformanceReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Under Review', ...updates } : r));
                logAction('Review Update', `Updated draft review for ${id}`);
                showSuccess({ title: 'Draft Saved', message: 'Review changes have been recorded.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update review.' });
        } finally {
            setIsLoading(false);
        }
    };

    const approvePerformanceReview = async (id: string, finalData: Partial<PerformanceReview>) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'COO'];
        if (!authorizedRoles.includes(currentUserRole)) {
            logAction('Unauthorized Action', `USER role ${currentUserRole} attempted to approve performance review ${id}`);
            showError({ title: 'Unauthorized', message: 'You do not have permission to approve reviews.' });
            return;
        }

        const review = performanceReviews.find(r => r.id === id);
        if (!review) return;

        if (review.status === 'Approved') {
            showInfo({ title: 'Already Finalized', message: 'Review is already finalized.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await performanceService.approveReview(id, finalData);
            if (response.success) {
                setPerformanceReviews(prev => prev.map(r => r.id === id ? {
                    ...r,
                    ...finalData,
                    status: 'Approved',
                    reviewedBy: currentUserId || 'System',
                    reviewedAt: new Date().toISOString()
                } : r));

                logAction('Review Approved', `Finalized performance review for ${review.employeeId}`);

                dispatchNotification(
                    {
                        title: 'Performance Review Completed',
                        message: 'Your performance review has been approved and finalized.',
                        type: 'Performance',
                        link: '/user/performance'
                    },
                    { userId: review.employeeId },
                    ['in-app', 'email']
                );
                showSuccess({ title: 'Review Approved', message: 'Performance review finalized successfully.' });
            } else {
                showError({ title: 'Approval Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Approval Error', message: 'Failed to finalize review.' });
        } finally {
            setIsLoading(false);
        }
    };

    const requestRevision = async (id: string, feedback: string) => {
        const review = performanceReviews.find(r => r.id === id);
        if (!review) return;

        setIsLoading(true);
        try {
            // Re-using updateReview or a specific revision call if added to service
            const response = await performanceService.updateReview(id, { managerFeedback: feedback, status: 'Revision Requested' });
            if (response.success) {
                setPerformanceReviews(prev => prev.map(r => r.id === id ? {
                    ...r,
                    status: 'Revision Requested',
                    managerFeedback: feedback,
                    reviewedBy: currentUserId || 'System',
                    reviewedAt: new Date().toISOString()
                } : r));

                logAction('Revision Requested', `Requested revision for review ${id}`);

                dispatchNotification(
                    {
                        title: 'Action Required: Revision Requested',
                        message: 'Manager requested changes to your self-evaluation.',
                        type: 'Performance',
                        link: '/user/performance'
                    },
                    { userId: review.employeeId },
                    ['in-app', 'email']
                );
                showSuccess({ title: 'Revision Requested', message: 'User has been notified.' });
            } else {
                showError({ title: 'Request Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Request Error', message: 'Failed to request revision.' });
        } finally {
            setIsLoading(false);
        }
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

    // Bonus Actions
    const createBonusType = async (bonus: Omit<BonusType, 'id' | 'tenantId'>) => {
        setIsLoading(true);
        try {
            const response = await bonusService.createBonusType(bonus);
            if (response.success && response.data) {
                setBonusTypes(prev => [...prev, response.data!]);
                logAction('Bonus Type Created', `Created bonus type: ${bonus.name}`);
                showSuccess({ title: 'Bonus Created', message: `Type "${bonus.name}" is now available.` });
            } else {
                showError({ title: 'Creation Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Creation Error', message: 'Failed to create bonus type.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateBonusType = async (id: string, updates: Partial<BonusType>) => {
        setIsLoading(true);
        try {
            const response = await bonusService.updateBonusType(id, updates);
            if (response.success) {
                setBonusTypes(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
                logAction('Bonus Type Updated', `Updated bonus type: ${id}`);
                showSuccess({ title: 'Bonus Updated', message: 'Bonus type details saved.' });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update bonus type.' });
        } finally {
            setIsLoading(false);
        }
    };

    const requestBonus = async (employeeId: string, bonusTypeId: string, amount: number, reason: string) => {
        setIsLoading(true);
        try {
            const response = await bonusService.requestBonus({
                employeeId,
                bonusTypeId,
                amount,
                reason,
                requestedBy: currentUserId || 'System',
                cycleId: payrollStatus.id
            });
            if (response.success && response.data) {
                setBonusRequests(prev => [...prev, response.data!]);
                logAction('Bonus Requested', `Bonus requested for ${employeeId}: ${amount}`);

                dispatchNotification(
                    { title: 'New Bonus Request', message: `Bonus request for employee ${employeeId}`, type: 'Payroll', link: '/admin/bonus' },
                    { roles: ['SUPER_ADMIN', 'COO', 'FINANCE_ADMIN'] }
                );
                showSuccess({ title: 'Request Sent', message: 'Bonus award request has been submitted for approval.' });
            } else {
                showError({ title: 'Request Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Request Error', message: 'Failed to submit bonus request.' });
        } finally {
            setIsLoading(false);
        }
    };

    const approveBonus = async (requestId: string, approvedBy: string) => {
        setIsLoading(true);
        try {
            const response = await bonusService.approveBonus(requestId, approvedBy);
            if (response.success) {
                setBonusRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved', approvedBy, approvedAt: new Date().toISOString() } : r));
                const req = bonusRequests.find(r => r.id === requestId);
                if (req) {
                    await addPayrollAdjustment(req.employeeId, 'Bonus', req.amount, `Bonus: ${req.reason}`);
                    logAction('Bonus Approved', `Bonus ${requestId} approved by ${approvedBy}`);
                    dispatchNotification(
                        { title: 'Bonus Approved', message: 'Your bonus request has been approved!', type: 'Payroll', link: '/user/payroll' },
                        { userId: req.employeeId }
                    );
                }
                showSuccess({ title: 'Bonus Approved', message: 'The bonus has been added to payroll.' });
            } else {
                showError({ title: 'Approval Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Approval Error', message: 'Failed to approve bonus.' });
        } finally {
            setIsLoading(false);
        }
    };

    const rejectBonus = async (requestId: string, reason: string) => {
        setIsLoading(true);
        try {
            const response = await bonusService.rejectBonus(requestId, reason);
            if (response.success) {
                setBonusRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: reason } : r));
                const req = bonusRequests.find(r => r.id === requestId);
                if (req) {
                    logAction('Bonus Rejected', `Bonus ${requestId} rejected: ${reason}`);
                    dispatchNotification(
                        { title: 'Bonus Rejected', message: `Your bonus request was rejected: ${reason}`, type: 'Payroll', link: '/user/payroll' },
                        { userId: req.employeeId }
                    );
                }
                showSuccess({ title: 'Bonus Rejected', message: 'The request has been declined.' });
            } else {
                showError({ title: 'Rejection Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Rejection Error', message: 'Failed to reject bonus.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Auth Actions

    const login = async (email: string, pass: string): Promise<{ role?: AdminRole, requiresOtp?: boolean }> => {
        setIsLoading(true);
        try {
            const res = await authService.login(email, pass);
            if (res.success && res.data) {
                // Check if backend flagged OTP
                if ('requires_otp' in res.data && res.data.requires_otp) {
                    setIsLoading(false); // Stop loading, user needs to enter OTP
                    return { requiresOtp: true };
                }

                // Standard login success case
                if ('user' in res.data) {
                    const user = res.data.user;
                    setIsAuthenticated(true);
                    setCurrentUserRole(user.role);
                    setCurrentUserId(user.id);

                    // Fetch user specific data
                    const notifResponse = await notificationService.getNotifications(user.id, user.role);
                    if (notifResponse.success) {
                        setNotifications(notifResponse.data);
                    }

                    logAction('Authentication', `User ${user.email} logged in successfully`);
                    showSuccess({ title: 'Login Successful', message: `Welcome, ${user.name}!` });
                    return { role: user.role };
                }
            }
            showError({ title: 'Login Failed', message: res.error || 'Invalid credentials' });
            return {};
        } catch (error) {
            console.error('Login error:', error);
            showError({ title: 'Login Error', message: 'An unexpected error occurred.' });
            return {};
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async (email: string, otp: string): Promise<AdminRole | undefined> => {
        setIsLoading(true);
        try {
            const res = await authService.verifyOTP(email, otp);
            if (res.success && res.data && 'user' in res.data) {
                const user = res.data.user;
                setIsAuthenticated(true);
                setCurrentUserRole(user.role);
                setCurrentUserId(user.id);

                // Fetch user specific data
                const notifResponse = await notificationService.getNotifications(user.id, user.role);
                if (notifResponse.success) {
                    setNotifications(notifResponse.data);
                }

                logAction('Authentication', `User ${user.email} verified OTP and logged in`);
                showSuccess({ title: 'OTP Verified', message: `Welcome, ${user.name}!` });
                return user.role;
            }
            showError({ title: 'OTP Verification Failed', message: res.error || 'Invalid OTP' });
            return undefined;
        } catch (error) {
            console.error('OTP Verification Error:', error);
            showError({ title: 'OTP Error', message: 'An unexpected error occurred during OTP verification.' });
            return undefined;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await authService.logout();
        setIsAuthenticated(false);
        setCurrentUserRole('USER'); // Default fallback
        setCurrentUserId(null);
        setNotifications([]); // Clear notifications on logout
        showInfo({ title: 'Logged Out', message: 'You have been successfully logged out.' });
        setIsLoading(false);
    };
    const visibleEmployees = React.useMemo(() => {
        const safeEmployees = employees || [];
        const sensitiveRoles: AdminRole[] = ['SUPER_ADMIN', 'FINANCE_ADMIN', 'PAYROLL_ADMIN', 'COO'];
        const canViewSalary = sensitiveRoles.includes(currentUserRole);

        if (canViewSalary) return safeEmployees;

        return safeEmployees.map(emp => ({
            ...emp,
            // Mask Salary if not viewing own profile (optional: allow viewing own salary)
            salary: emp.id === currentUserId ? emp.salary : 0
        }));
    }, [employees, currentUserRole, currentUserId]);

    // ===== COMPLIANCE REPORTS =====

    // @ts-ignore
    const generatePayrollSummaryReport = (cycleId?: string) => {
        logReportAccess('Payroll Summary', { cycleId });
        return reportService.generatePayrollSummaryReport(employees, payrollStatus, cycleId);
    };

    // @ts-ignore
    const generateApprovalTrailReport = (cycleId: string) => {
        logReportAccess('Approval Trail', { cycleId });
        return reportService.generateApprovalTrailReport(activityLogs, cycleId);
    };

    // @ts-ignore
    const generateBonusAdjustmentReport = (cycleId: string) => {
        logReportAccess('Bonus Adjustment', { cycleId });
        // @ts-ignore
        return reportService.generateBonusAdjustmentReport(employees, payrollStatus, bonusRequests || [], cycleId);
    };

    // @ts-ignore
    const generatePayrollVarianceReport = (currentCycleId: string, previousCycleId: string) => {
        logReportAccess('Payroll Variance', { currentCycleId, previousCycleId });
        const previousCycleData = { id: previousCycleId, adjustments: [] }; // Mock previous cycle
        return reportService.generatePayrollVarianceReport(employees, payrollStatus, previousCycleData, currentCycleId, previousCycleId);
    };

    // @ts-ignore
    const generateSalaryHistoryReport = (employeeId?: string, startDate?: string, endDate?: string) => {
        logReportAccess('Salary History', { employeeId, startDate, endDate });
        return reportService.generateSalaryHistoryReport(employees, activityLogs, employeeId, startDate, endDate);
    };

    // @ts-ignore
    const generatePromotionHistoryReport = (startDate?: string, endDate?: string) => {
        logReportAccess('Promotion History', { startDate, endDate });
        // @ts-ignore
        return reportService.generatePromotionHistoryReport(employees, promotionRequests || [], startDate, endDate);
    };

    // @ts-ignore
    const generateUserAccessReport = () => {
        logReportAccess('USER Access', {});
        return reportService.generateUserAccessReport(employees, activityLogs);
    };

    // @ts-ignore
    const generateCriticalActionReport = (startDate?: string, endDate?: string) => {
        logReportAccess('Critical Action', { startDate, endDate });
        return reportService.generateCriticalActionReport(activityLogs, startDate, endDate);
    };

    // @ts-ignore
    const generateAttestationPack = (period: { start: string; end: string }, reportTypes: string[]) => {
        logReportAccess('Attestation Pack', { period, reportTypes });
        return {
            period,
            reportTypes,
            generatedAt: new Date().toISOString(),
            generatedBy: currentUserId || 'System'
        };
    };

    const logReportAccess = (reportType: string, filters: any) => {
        logAction('CREATE', `System Accessed ${reportType} report. Status: SUCCESS. Ref: report-${reportType}. Filters: ${JSON.stringify(filters)}`);
    };
    // ===== END COMPLIANCE REPORTS =====

    // --- Finance Actions ---
    // Finance & Ledger
    const approveLedgerFunding = async (cycleId: string, pin: string) => {
        setIsLoading(true);
        try {
            const response = await financeService.approveFunding(cycleId, pin);
            if (response.success) {
                setLedgerEntries(prev => prev.map(entry => entry.payrollCycleId === cycleId ? { ...entry, status: 'Funded' } : entry));
                logAction('Finance Approval', `Ledger cycle ${cycleId} funded.`);
                showSuccess({ title: 'Funding Approved', message: 'Funds have been allocated to the payroll batch.' });
                return { success: true };
            } else {
                showError({ title: 'Approval Failed', message: response.error });
                return { success: false, error: response.error };
            }
        } catch (err) {
            showError({ title: 'Approval Error', message: 'Failed to approve funding.' });
            return { success: false, error: 'Internal Error' };
        } finally {
            setIsLoading(false);
        }
    };

    const executeLedgerBatch = async (cycleId: string) => {
        setIsLoading(true);
        try {
            const response = await financeService.executeBatch(cycleId);
            if (response.success) {
                setLedgerEntries(prev => prev.map(entry => entry.payrollCycleId === cycleId ? { ...entry, status: 'Executed', transactionReference: `TRX-${Math.random().toString(36).substr(2, 8).toUpperCase()}` } : entry));
                logAction('Finance Execution', `Ledger cycle ${cycleId} batch executed.`);
                showSuccess({ title: 'Batch Executed', message: 'Payments have been dispatched.' });
                return { success: true };
            } else {
                showError({ title: 'Execution Failed', message: response.error });
                return { success: false, error: response.error };
            }
        } catch (err) {
            showError({ title: 'Execution Error', message: 'Failed to execute payment batch.' });
            return { success: false, error: 'Internal Error' };
        } finally {
            setIsLoading(false);
        }
    };

    // Departments
    const saveDepartment = async (dept: Department) => {
        setIsLoading(true);
        try {
            const response = await departmentService.saveDepartment(dept);
            if (response.success) {
                setDepartments(prev => {
                    const exists = prev.find(d => d.id === dept.id);
                    if (exists) return prev.map(d => d.id === dept.id ? dept : d);
                    return [...prev, dept];
                });
                logAction('Department Update', `Updated department ${dept.name}`);
                showSuccess({ title: 'Department Saved', message: `${dept.name} updated successfully.` });
            } else {
                showError({ title: 'Save Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Save Error', message: 'Failed to save department.' });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDepartment = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await departmentService.deleteDepartment(id);
            if (response.success) {
                setDepartments(prev => prev.filter(d => d.id !== id));
                logAction('Department Update', `Deleted department ${id}`);
                showSuccess({ title: 'Department Deleted', message: `Department removed.` });
            } else {
                showError({ title: 'Delete Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Delete Error', message: 'Failed to delete department.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Promotion Actions ---
    const requestPromotion = async (req: Omit<PromotionRequest, 'id' | 'tenantId' | 'status' | 'requestedAt'>) => {
        setIsLoading(true);
        try {
            const response = await promotionService.requestPromotion(req);
            if (response.success && response.data) {
                setPromotionRequests(prev => [...prev, response.data!]);
                logAction('Promotion Request', `Requested promotion for ${req.employeeId}`);
                dispatchNotification(
                    { title: 'Promotion Request', message: `New promotion request for ${req.employeeId}`, type: 'HR', link: '/admin/promotions' },
                    { roles: ['SUPER_ADMIN', 'COO'] }
                );
                showSuccess({ title: 'Request Sent', message: 'Promotion request has been submitted.' });
            } else {
                showError({ title: 'Request Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Request Error', message: 'Failed to submit promotion request.' });
        } finally {
            setIsLoading(false);
        }
    };

    const approvePromotion = async (requestId: string) => {
        setIsLoading(true);
        try {
            const response = await promotionService.approvePromotion(requestId);
            if (response.success) {
                setPromotionRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved', approvedBy: currentUserId || 'System', approvedAt: new Date().toISOString() } : r));
                const req = promotionRequests.find(r => r.id === requestId);
                if (req) {
                    await updateEmployee(req.employeeId, {
                        systemRole: req.newRole,
                        salary: req.proposedSalary,
                        title: req.newRole
                    });
                    logAction('Promotion Approved', `Approved promotion for ${req.employeeId}`);
                    dispatchNotification(
                        { title: 'Promotion Approved', message: `Congratulations! You have been promoted to ${req.newRole}`, type: 'HR', link: '/user/profile' },
                        { userId: req.employeeId }
                    );
                }
                showSuccess({ title: 'Promotion Approved', message: 'Employee has been promoted.' });
            } else {
                showError({ title: 'Approval Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Approval Error', message: 'Failed to approve promotion.' });
        } finally {
            setIsLoading(false);
        }
    };

    const rejectPromotion = async (requestId: string, reason: string) => {
        setIsLoading(true);
        try {
            const response = await promotionService.rejectPromotion(requestId, reason);
            if (response.success) {
                setPromotionRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: reason } : r));
                const req = promotionRequests.find(r => r.id === requestId);
                if (req) {
                    logAction('Promotion Rejected', `Rejected promotion ${requestId}`);
                    dispatchNotification(
                        { title: 'Promotion Rejected', message: `Promotion request was rejected: ${reason}`, type: 'HR', link: '/user/profile' },
                        { userId: req.employeeId }
                    );
                }
                showSuccess({ title: 'Promotion Rejected', message: 'The request has been declined.' });
            } else {
                showError({ title: 'Rejection Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Rejection Error', message: 'Failed to reject promotion.' });
        } finally {
            setIsLoading(false);
        }
    };

    const saveEligibilityRule = async (rule: PromotionEligibilityRule) => {
        setIsLoading(true);
        try {
            const response = await promotionService.saveEligibilityRule(rule);
            if (response.success) {
                setEligibilityRules(prev => {
                    const exists = prev.find(r => r.id === rule.id);
                    if (exists) return prev.map(r => r.id === rule.id ? rule : r);
                    return [...prev, rule];
                });
                logAction('Eligibility Rule Save', `Eligibility rule ${rule.id} saved.`);
                showSuccess({ title: 'Rule Saved', message: 'Promotion eligibility criteria updated.' });
            } else {
                showError({ title: 'Save Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Save Error', message: 'Failed to save eligibility rule.' });
        } finally {
            setIsLoading(false);
        }
    };

    const evaluateEligibility = (employeeId: string, _newRole: string) => {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return { isEligible: false, reasons: ['Employee not found'], scores: { performance: 0, tenureMonths: 0 } };

        // Mock evaluation logic
        const tenureMonths = 12; // Mock
        const performance = 4.0; // Mock

        // Use _newRole to avoid lint error or implement logic
        // For now, just logging it or using it in return
        console.log(`Evaluating ${employee.name} for ${_newRole}`);

        const warnings: string[] = [];
        // Check rules? For now just mock passing

        return {
            isEligible: warnings.length === 0,
            reasons: warnings,
            scores: { performance, tenureMonths }
        };
    };

    // --- Task Management ---
    const createTask = async (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => {
        setIsLoading(true);
        try {
            const response = await import('../services/taskService').then(m => m.taskService.createTask(taskData));
            if (response.success) {
                const newTask: Task = {
                    ...taskData,
                    id: response.data?.id || `TSK-${Date.now()}`,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                };
                setTasks(prev => [newTask, ...prev]);

                dispatchNotification(
                    { title: 'New Task Assigned', message: `You have been assigned: ${taskData.title}`, type: 'HR', link: '/user/tasks' },
                    { userId: taskData.assignedTo }
                );
                showSuccess({ title: 'Task Created', message: 'Task assigned successfully.' });
            } else {
                showError({ title: 'Creation Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Creation Error', message: 'Failed to create task.' });
        } finally {
            setIsLoading(false);
        }
    };

    const updateTaskStatus = async (taskId: string, status: Task['status']) => {
        setIsLoading(true);
        try {
            const response = await import('../services/taskService').then(m => m.taskService.updateTaskStatus(taskId, status));
            if (response.success) {
                setTasks(prev => prev.map(task =>
                    task.id === taskId ? { ...task, status } : task
                ));
                showSuccess({ title: 'Status Updated', message: `Task status updated to ${status}.` });
            } else {
                showError({ title: 'Update Failed', message: response.error });
            }
        } catch (err) {
            showError({ title: 'Update Error', message: 'Failed to update task status.' });
        } finally {
            setIsLoading(false);
        }
    };

    const submitTaskEvidence = (taskId: string, notes: string, b64Evidence: string[]) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? {
                ...task,
                progressNotes: notes,
                evidenceUrls: b64Evidence,
                status: 'In Review' as const
            } : task
        ));

        // Notify Admins
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            dispatchNotification(
                { title: 'Task Evidence Submitted', message: `Evidence submitted for ${task.title}`, type: 'System', link: '/admin/tasks' },
                { userId: task.assignedBy } // Notify the admin who created it
            );
        }
    };

    // --- API Key Management ---
    const addApiKey = (apiKeyData: Omit<SystemApiKey, 'id' | 'tenantId' | 'createdAt' | 'status'>) => {
        const newApiKey: SystemApiKey = {
            ...apiKeyData,
            id: `API-${Date.now()}`,
            tenantId: currentTenantId,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        setApiKeys(prev => [newApiKey, ...prev]);
        logAction('System Integration', `Recorded generated CMS API Key: ${apiKeyData.name}`);
    };

    const toggleApiKeyStatus = (id: string) => {
        setApiKeys(prev => prev.map(key => {
            if (key.id === id) {
                const newStatus = key.status === 'active' ? 'disabled' : 'active';
                logAction('System Integration', `Changed API Key (${key.name}) status to ${newStatus}`);
                showSuccess({ title: 'Status Updated', message: `API Key ${key.name} is now ${newStatus}.` });
                return { ...key, status: newStatus };
            }
            return key;
        }));
    };

    return (
        <AdminContext.Provider value={{
            employees: visibleEmployees,
            jobs,
            cmsContent,
            activityLogs,
            payrollStatus,
            requestAuth,
            ceoSignature,
            // Task Management
            tasks,
            createTask,
            updateTaskStatus,
            submitTaskEvidence,
            // AdminNotification Engine
            emailLogs,
            currentTenantId,
            dispatchNotification,
            // ...Existing
            notifications,
            unreadCount,
            currentUserRole,
            currentUserId,
            rolePermissions,
            updateEmployee,
            updateUserProfile,
            addEmployee,
            deleteEmployee,
            regenerateQR,
            toggleQRStatus,
            updatePayrollStatus,
            addPayrollAdjustment,
            bulkPayrollAdjustment,
            logAction,
            updateCeoSignature,
            // API Keys
            apiKeys,
            addApiKey,
            toggleApiKeyStatus,
            // Bonus Management
            bonusTypes,
            bonusRequests,
            createBonusType,
            updateBonusType,
            requestBonus,
            approveBonus,
            rejectBonus,
            addJob,
            updateJob,
            deleteJob,
            // CMS & Content Actions
            updatePMSContent,
            publishPMSContent,
            addCMSContent,
            createCMSPage,
            deleteCMSContent,
            footerContent,
            updateFooterContent,
            globalContent,
            servicesCollection,
            updateGlobal,
            addService,
            updateService,
            deleteService,
            updateEmployeeContract,
            uploadContractDocument,
            markNotificationAsRead,
            markAllNotificationsAsRead,
            switchRole,
            updateRolePermissions,
            leaveRequests,
            requestLeave,
            approveLeave,
            rejectLeave,
            reviewCycles,
            performanceReviews,
            createReviewCycle,
            submitSelfReview,
            updatePerformanceReview,
            approvePerformanceReview,
            startReviewCycle,
            requestRevision,
            isAuthenticated,
            login,
            verifyOTP,
            logout,
            generateSystemPassword,
            sendEmail,
            // Compliance Reports
            generatePayrollSummaryReport,
            generateApprovalTrailReport,
            generateBonusAdjustmentReport,
            generatePayrollVarianceReport,
            generateSalaryHistoryReport,
            generatePromotionHistoryReport,
            generateUserAccessReport,
            generateCriticalActionReport,
            generateAttestationPack,
            logReportAccess,
            // Finance
            ledgerEntries,
            approveLedgerFunding,
            executeLedgerBatch,
            // Departments
            departments,
            saveDepartment,
            deleteDepartment,
            // Promotions
            promotionRequests,
            eligibilityRules,
            requestPromotion,
            approvePromotion,
            rejectPromotion,
            saveEligibilityRule,
            evaluateEligibility,
            // Payroll Actions
            cooReviewPayroll,
            cfoApprovePayroll,
            updateEmployeeSalary,
            isLoading,
        }}>
            {/* Global PIN Modal */}
            <PinAuthorizationModal
                isOpen={!!authRequest}
                onClose={() => setAuthRequest(null)}
                onSuccess={handleAuthSuccess}
                requiredLevel={authRequest?.level || 'CMS'}
                description={authRequest?.description || ''}
            />
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
