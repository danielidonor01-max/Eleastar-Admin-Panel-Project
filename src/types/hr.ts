// =============================================================================
// HR — Departments, Leave & Tasks
// =============================================================================

// ---------------------------------------------------------------------------
// Department
// ---------------------------------------------------------------------------

export interface Department {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    minSalary: number;
    maxSalary: number;
    /** ISO 4217 currency code, e.g. "NGN" */
    currency: string;
}

// ---------------------------------------------------------------------------
// Leave
// ---------------------------------------------------------------------------

export interface LeaveRequest {
    id: string;
    tenantId: string;
    employeeId: string;
    type: 'Annual' | 'Sick' | 'Unpaid' | 'Maternity' | 'Paternity' | 'Other';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedAt: string;
    rejectionReason?: string;
    /** ID of the admin who approved or rejected */
    actionBy?: string;
    /** Timestamp of the approval/rejection action */
    actionAt?: string;
    /** Escalation level: 0 = None, 1 = 24h, 2 = 72h, 3 = Escalated */
    reminderLevel?: number;
    lastRemindedAt?: string;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export interface Task {
    id: string;
    title: string;
    description: string;
    /** Employee ID the task is assigned to */
    assignedTo: string;
    /** Admin ID who assigned the task */
    assignedBy: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Pending' | 'In Progress' | 'In Review' | 'Completed';
    deliveryDate: string;
    createdAt: string;
    progressNotes?: string;
    /** Array of base64 strings or public URLs submitted as evidence */
    evidenceUrls?: string[];
}
