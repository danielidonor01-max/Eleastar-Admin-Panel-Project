// =============================================================================
// PERFORMANCE — Review Cycles & Reviews
// =============================================================================

// ---------------------------------------------------------------------------
// Review Cycle
// ---------------------------------------------------------------------------

export interface ReviewCycle {
    id: string;
    tenantId: string;
    title: string;
    status: 'Draft' | 'Active' | 'Completed';
    startDate: string;
    endDate: string;
}

// ---------------------------------------------------------------------------
// Performance Review
// ---------------------------------------------------------------------------

export interface PerformanceReview {
    id: string;
    tenantId: string;
    employeeId: string;
    cycleId: string;
    selfReview: string;
    /** Self-assessment rating, 1–5 */
    rating: number;
    status: 'Pending' | 'Submitted' | 'Under Review' | 'Revision Requested' | 'Approved';
    submittedAt?: string;

    // Reviewer Fields
    managerRating?: number;
    managerFeedback?: string;
    internalNotes?: string;
    recommendation?: 'None' | 'Promotion' | 'Salary Increase' | 'Bonus';
    reviewedBy?: string;
    reviewedAt?: string;

    // Reminder Logic
    /** 0 = None, 1 = 24h, 2 = 72h, 3 = Escalated */
    reminderLevel?: number;
    lastRemindedAt?: string;
}


export interface TaskPerformanceStats {
    id: string;
    name: string;
    department_id: string;
    department: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
}