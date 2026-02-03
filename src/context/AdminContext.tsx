import React, { createContext, useContext, useState } from 'react';
import { employees as initialEmployees, jobs as initialJobs, initialLeaveRequests, initialReviewCycles, initialPerformanceReviews, initialCMSContent, initialAboutContent, initialServicesContent, initialIndustrialSolutionsContent, initialInformationTechnologyContent, initialResearchAndDevelopmentContent, initialElectronicsManufacturingContent, initialSpecificITServicesContent, initialFooterContent } from '../data/mockData';
import type { Employee, Job, LeaveRequest, ReviewCycle, PerformanceReview, CMSSection, FooterContent, FooterSection } from '../data/mockData';

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
export type NotificationType = 'System' | 'HR' | 'Payroll' | 'Recruitment' | 'Leave' | 'Performance' | 'QR';
export type NotificationChannel = 'in-app' | 'email' | 'both';

export interface Notification {
    id: string;
    title: string;          // New: For bolder headers
    message: string;
    type: NotificationType;
    timestamp: string;
    isRead: boolean;
    link: string;

    // Targeting
    targetUserId?: string;  // Specific user
    targetRole?: AdminRole[]; // One or more roles
}

export interface EmailLog {
    id: string;
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    timestamp: string;
    triggerEvent: string;
}

// Role & Permissions Types
export type AdminRole = 'Super Admin' | 'Management Admin' | 'HR Admin' | 'Finance Admin' | 'Web Admin' | 'User' | 'Viewer';
export type ModuleType = 'Dashboard' | 'Employees' | 'QR & ID' | 'Payroll' | 'Recruitment' | 'Website CMS' | 'Settings' | 'Leave' | 'Performance';

export interface AdminContextType {
    employees: Employee[];
    jobs: Job[];
    activityLogs: ActivityLog[];
    payrollStatus: PayrollCycle;
    ceoSignature: string | null;

    // Auth
    requestAuth: (level: 'CMS' | 'SENSITIVE', description: string, onConfirm: () => void) => void;

    cmsContent: CMSSection[]; // New CMS data
    footerContent: FooterContent; // Global Footer Data

    // Notification State
    notifications: Notification[];
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;

    unreadCount: number;

    // Leave Management
    leaveRequests: LeaveRequest[];
    requestLeave: (userId: string, request: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'requestedAt'>) => void;
    approveLeave: (requestId: string) => { success: boolean; error?: string };
    rejectLeave: (requestId: string, reason: string) => void;

    // Performance Management
    reviewCycles: ReviewCycle[];
    performanceReviews: PerformanceReview[];
    createReviewCycle: (cycle: Omit<ReviewCycle, 'id'>) => void;
    submitSelfReview: (review: Omit<PerformanceReview, 'id' | 'status' | 'submittedAt'>) => void;
    updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => void;
    approvePerformanceReview: (id: string, finalData: Partial<PerformanceReview>) => void;
    requestRevision: (id: string, feedback: string) => void;

    // Notification Engine
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
    'Super Admin': ['Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS', 'Settings', 'Leave', 'Performance'],
    'Management Admin': ['Dashboard', 'Employees', 'QR & ID', 'Payroll', 'Recruitment', 'Website CMS', 'Leave', 'Performance'],
    'HR Admin': ['Dashboard', 'Employees', 'Recruitment', 'QR & ID', 'Leave', 'Performance'],
    'Finance Admin': ['Dashboard', 'Payroll'],
    'Web Admin': ['Dashboard', 'Website CMS'],
    'User': [], // Users have no admin module access
    'Viewer': [] // Viewers have read-only access (to be implemented)
};

// Mock Notifications
const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: '1', title: 'System Alert', type: 'System', message: 'New admin session started', timestamp: new Date().toISOString(), isRead: false, link: '/admin/dashboard' },
    { id: '2', title: 'Onboarding', type: 'HR', message: 'New employee onboarded: Sarah Jenkins', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, link: '/admin/employees' },
    { id: '3', title: 'Payroll Update', type: 'Payroll', message: 'January Payroll cycle opened', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true, link: '/admin/payroll' },
    { id: '4', title: 'Application Received', type: 'Recruitment', message: '5 new applications for Frontend Dev', timestamp: new Date(Date.now() - 172800000).toISOString(), isRead: false, link: '/admin/recruitment' },
    { id: '5', title: 'QR Maintenance', type: 'QR', message: 'Bulk QR regeneration completed', timestamp: new Date(Date.now() - 250000000).toISOString(), isRead: true, link: '/admin/qr' }
];

import type { AuthLevel } from '../components/PinAuthorizationModal';
import { PinAuthorizationModal } from '../components/PinAuthorizationModal';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ...
    const [authRequest, setAuthRequest] = useState<{ level: AuthLevel; description: string; onConfirm: () => void } | null>(null);

    const requestAuth = (level: AuthLevel, description: string, onConfirm: () => void) => {
        setAuthRequest({ level, description, onConfirm });
    };

    const handleAuthSuccess = () => {
        if (authRequest) {
            authRequest.onConfirm();
            setAuthRequest(null);
            // Log the clean auth event
            logAction('Authorization', `PIN Verified for: ${authRequest.description} by ${authRequest.level === 'SENSITIVE' ? 'Super Admin' : 'User'}`);
        }
    };

    // State
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
    const [cmsContent, setCmsContent] = useState<CMSSection[]>([...initialCMSContent, ...initialAboutContent, ...initialServicesContent, ...initialIndustrialSolutionsContent, ...initialInformationTechnologyContent, ...initialResearchAndDevelopmentContent, ...initialElectronicsManufacturingContent, ...initialSpecificITServicesContent]);
    const [footerContent, setFooterContent] = useState<FooterContent>(initialFooterContent);
    const [ceoSignature, setCeoSignature] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]); // New Email Logs
    const [currentUserRole, setCurrentUserRole] = useState<AdminRole>('Super Admin');
    const [currentUserId, setCurrentUserId] = useState<string | null>('EMP-001'); // Default to Super Admin ID
    const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, ModuleType[]>>(INITIAL_PERMISSIONS);
    const [reviewCycles, setReviewCycles] = useState<ReviewCycle[]>(initialReviewCycles);

    const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(initialPerformanceReviews);

    // Notification Deduplication Ref
    const lastNotificationRef = React.useRef<{ sig: string; time: number } | null>(null);

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
                            { roles: ['Super Admin'] }, // Escalate to Super Admin
                            ['in-app', 'email']
                        );
                        logAction('System Escalation', `Escalated Leave Request ${req.id} for ${employeeName} to Super Admin`);
                    } else {
                        dispatchNotification(
                            {
                                title: newLevel === 2 ? 'Reminder: Pending Leave Request' : 'New Leave Request Pending',
                                message: `Leave Request by ${employeeName} for ${req.days} days matches pending approval. (${Math.floor(diffHours)}h ago)`,
                                type: 'Leave',
                                link: '/admin/leave'
                            },
                            { roles: ['Management Admin', 'HR Admin'] }, // Remind Approvers
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
        setEmployees(prev => prev.map(emp => {
            if (emp.id === id) {
                const oldEmp = emp;
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
    };

    const updateUserProfile = (updates: Partial<Employee>) => {
        if (!currentUserId) return;

        // Security: Filter allowed fields. This prevents users from editing their Salary or Role explicitly via this action.
        const allowedUpdates: Partial<Employee> = {
            photoUrl: updates.photoUrl,
            phoneNumber: updates.phoneNumber,
            socialLinks: updates.socialLinks
        };

        // If no allowed updates, do nothing
        if (Object.keys(allowedUpdates).length === 0) return;

        setEmployees(prev => prev.map(emp => emp.id === currentUserId ? { ...emp, ...allowedUpdates } : emp));
        logAction('Profile Update', `User ${currentUserId} updated their profile`);

        addNotification('System', `User ${currentUserId} updated their profile details`, '/admin/employees');
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
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'Finance Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            alert('Unauthorized: Only Finance or Super Admins can update payroll status.');
            return;
        }

        // 1. State Locking Logic
        if (payrollStatus.status === 'Paid' && status !== 'Paid') {
            alert('Cannot revert a generic Paid payroll cycle. Action denied.');
            return;
        }
        if (payrollStatus.status === 'Approved' && status === 'Draft' && currentUserRole !== 'Super Admin') {
            alert('Only Super Admin can revert Approved payroll to Draft.');
            return;
        }

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
                { roles: ['User'] }, // Broadcast to Users matches roles
                ['in-app', 'email']
            );
        } else {
            addNotification('Payroll', `Payroll status updated to ${status}`, '/admin/payroll');
        }
        alert(`Payroll status updated to ${status}.`);
    };

    const addPayrollAdjustment = (empId: string, type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        // 0. Security & State Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'Finance Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            alert('Unauthorized action.');
            return;
        }
        if (payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid') {
            alert(`Cannot add adjustments when Payroll is ${payrollStatus.status}.`);
            return;
        }

        setPayrollStatus(prev => ({
            ...prev,
            adjustments: [...prev.adjustments, { empId, type, amount, reason }]
        }));
        logAction('Payroll Adjustment', `Added ${type} of ₦${amount} for ${empId}: ${reason}`);
        alert('Adjustment added.');
    };

    const bulkPayrollAdjustment = (empIds: string[], type: 'Bonus' | 'Fine' | 'Deduction', amount: number, reason: string) => {
        // 0. Security & State Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'Finance Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            alert('Unauthorized action.');
            return;
        }
        if (payrollStatus.status === 'Approved' || payrollStatus.status === 'Paid') {
            alert(`Cannot add adjustments when Payroll is ${payrollStatus.status}.`);
            return;
        }

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
        alert(`Bulk adjustment applied to ${empIds.length} employees.`);
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
        addNotification('Recruitment', `New Job Posted: ${job.title}`, `/admin/recruitment?jobId=${job.id}`);
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
        addNotification('System', `New content published for ${id}`, '/admin/cms');
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

    // Notification Engine Logic
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
        console.log(`[EMAIL SENT] To: ${recipientEmail} | Subject: ${title} | Body: ${message}`);
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
            console.log('[Notification] Duplicate suppressed:', payload.title);
            return;
        }
        lastNotificationRef.current = { sig: currentSig, time: now };

        // 1. In-App Channel
        if (channels.includes('in-app') || channels.includes('both')) {
            const newNotif: Notification = {
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

            // A. Specific User Target
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
            'System': 'System Notification',
            'HR': 'HR Update',
            'Payroll': 'Payroll Alert',
            'Recruitment': 'Hiring Update',
            'Leave': 'Leave Status',
            'Performance': 'Performance Review',
            'QR': 'Security Alert'
        };

        dispatchNotification(
            { title: titleMap[type] || 'Notification', message, type, link },
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
    const requestLeave = (userId: string, requestData: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'requestedAt'>) => {
        // 1. Validation
        if (new Date(requestData.startDate) > new Date(requestData.endDate)) {
            logAction('Leave Request Failed', `Invalid dates from user ${userId}: Start after End`);
            alert('Start date must be before end date.');
            return;
        }

        const isDuplicate = leaveRequests.some(r =>
            r.employeeId === userId &&
            r.status === 'Pending' &&
            r.startDate === requestData.startDate &&
            r.endDate === requestData.endDate
        );

        if (isDuplicate) {
            alert('You already have a pending request for these dates.');
            return;
        }

        const newId = `LR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const newRequest: LeaveRequest = {
            id: newId,
            employeeId: userId,
            status: 'Pending',
            requestedAt: new Date().toISOString(),
            ...requestData
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
        logAction('Leave Request', `New ${requestData.type} leave request from user ${userId}`);
        addNotification('HR', `New leave request received from ${userId}`, `/admin/leave?requestId=${newId}`);

        // Notify Admins
        dispatchNotification(
            {
                title: 'New Leave Request',
                message: `${requestData.type} Leave Request from ${userId}`,
                type: 'Leave',
                link: `/admin/leave?requestId=${newId}`
            },
            { roles: ['HR Admin', 'Super Admin', 'Management Admin'] },
            ['in-app', 'email']
        );
        alert('Leave request submitted successfully.');
    };

    const approveLeave = (requestId: string): { success: boolean; error?: string } => {
        // 0. Security & State Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'HR Admin', 'Management Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            logAction('Unauthorized Action', `User role ${currentUserRole} attempted to approve leave ${requestId}`);
            return { success: false, error: 'Unauthorized: Insufficient permissions' };
        }

        const request = leaveRequests.find(r => r.id === requestId);
        if (!request) return { success: false, error: 'Request not found' };

        if (request.status !== 'Pending') {
            return { success: false, error: `Request is already ${request.status}. Action denied.` };
        }

        // 1. Check Overlaps
        const hasOverlap = leaveRequests.some(r =>
            r.employeeId === request.employeeId &&
            r.status === 'Approved' &&
            r.id !== requestId &&
            new Date(r.startDate) <= new Date(request.endDate) &&
            new Date(r.endDate) >= new Date(request.startDate)
        );

        if (hasOverlap) {
            const error = 'This request overlaps with an existing approved leave.';
            alert(error);
            return { success: false, error };
        }

        // 2. Check Balance & Deduct
        let balanceError = '';
        setEmployees(prev => prev.map(emp => {
            if (emp.id === request.employeeId && emp.leaveBalance) {
                const isAnnual = request.type === 'Annual';
                const isSick = request.type === 'Sick';

                if (isAnnual && emp.leaveBalance.annual < request.days) {
                    balanceError = 'Insufficient Annual Leave balance.';
                    return emp;
                }
                if (isSick && emp.leaveBalance.sick < request.days) {
                    balanceError = 'Insufficient Sick Leave balance.';
                    return emp;
                }

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

        if (balanceError) {
            alert(balanceError);
            return { success: false, error: balanceError };
        }

        // 3. Success Update
        setLeaveRequests(prev => prev.map(r => r.id === requestId ? {
            ...r,
            status: 'Approved',
            actionBy: currentUserId || 'System',
            actionAt: new Date().toISOString()
        } : r));

        // Notify User
        dispatchNotification(
            {
                title: 'Leave Approved',
                message: 'Your leave request has been approved!',
                type: 'Leave',
                link: '/user/leave' // User side flow, sticking to generic as user page updates are out of scope
            },
            { userId: request.employeeId },
            ['in-app', 'email']
        );

        logAction('Leave Approval', `Approved leave request ${requestId} for user ${request.employeeId}. Action by: ${currentUserId}`);
        alert('Leave request approved successfully.');
        return { success: true };
    };

    const rejectLeave = (requestId: string, reason: string) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'HR Admin', 'Management Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            logAction('Unauthorized Action', `User role ${currentUserRole} attempted to reject leave ${requestId}`);
            alert('Unauthorized action.');
            return;
        }

        const request = leaveRequests.find(r => r.id === requestId);
        if (!request) return;

        if (request.status !== 'Pending') {
            alert(`Request is already ${request.status}. Cannot reject.`);
            return;
        }

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
        alert('Leave request rejected.');
    };

    // Performance Actions
    const createReviewCycle = (cycle: Omit<ReviewCycle, 'id'>) => {
        const newCycle: ReviewCycle = {
            id: `CYC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            ...cycle
        };
        setReviewCycles(prev => [newCycle, ...prev]);
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
    };

    const submitSelfReview = (review: Omit<PerformanceReview, 'id' | 'status' | 'submittedAt'>) => {
        // 1. Duplicate Check
        const existing = performanceReviews.find(r =>
            r.employeeId === review.employeeId &&
            r.cycleId === review.cycleId
        );
        if (existing) {
            alert('You have already submitted a review for this cycle.');
            return;
        }

        const newReview: PerformanceReview = {
            id: `PR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            status: 'Submitted',
            submittedAt: new Date().toISOString(),
            ...review
        };
        setPerformanceReviews(prev => [newReview, ...prev]);
        logAction('Self Review Submitted', `User ${review.employeeId} submitted self review`);

        dispatchNotification(
            {
                title: 'New Self-Evaluation',
                message: `User ${review.employeeId} submitted their self-evaluation.`,
                type: 'Performance',
                link: '/admin/performance'
            },
            { roles: ['Management Admin', 'Super Admin', 'HR Admin'] },
            ['in-app']
        );
        alert('Self-evaluation submitted successfully.');
    };

    const updatePerformanceReview = (id: string, updates: Partial<PerformanceReview>) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'HR Admin', 'Management Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            alert('Unauthorized action.');
            return;
        }

        const review = performanceReviews.find(r => r.id === id);
        if (review && review.status === 'Approved') {
            alert('Cannot update a finalized review.');
            return;
        }

        setPerformanceReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates, status: 'Under Review' } : r));
        logAction('Review Update', `Updated draft review for ${id}`);
        // alert('Review updated.'); // Optional: might be too noisy for auto-save
    };

    const approvePerformanceReview = (id: string, finalData: Partial<PerformanceReview>) => {
        // 0. Security Guard
        const authorizedRoles: AdminRole[] = ['Super Admin', 'HR Admin', 'Management Admin'];
        if (!authorizedRoles.includes(currentUserRole)) {
            logAction('Unauthorized Action', `User role ${currentUserRole} attempted to approve performance review ${id}`);
            alert('Unauthorized action.');
            return;
        }

        const review = performanceReviews.find(r => r.id === id);
        if (!review) return;

        if (review.status === 'Approved') {
            alert('Review is already finalized.');
            return;
        }

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
        alert('Performance review finalized successfully.');
    };

    const requestRevision = (id: string, feedback: string) => {
        const review = performanceReviews.find(r => r.id === id);
        if (!review) return;

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
            setCurrentUserId('EMP-003'); // Linked to Odirin Success
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

    // Data Masking for Security
    const visibleEmployees = React.useMemo(() => {
        const sensitiveRoles: AdminRole[] = ['Super Admin', 'Finance Admin'];
        const canViewSalary = sensitiveRoles.includes(currentUserRole);

        if (canViewSalary) return employees;

        return employees.map(emp => ({
            ...emp,
            // Mask Salary if not viewing own profile (optional: allow viewing own salary)
            salary: emp.id === currentUserId ? emp.salary : 0
        }));
    }, [employees, currentUserRole, currentUserId]);

    return (
        <AdminContext.Provider value={{
            employees: visibleEmployees,
            jobs,
            cmsContent,
            activityLogs,
            payrollStatus,
            requestAuth,
            ceoSignature,
            // Notification Engine
            emailLogs,
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
            requestRevision,
            isAuthenticated,
            login,
            logout
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
