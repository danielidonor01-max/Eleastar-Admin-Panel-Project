// =============================================================================
// RECRUITMENT — Jobs & Applications
// =============================================================================

export type EmploymentTypeEnum = 'Full-time' | 'Contract' | 'Internship';

export interface Application {
    id: string;
    tenantId: string;
    jobId: string;
    candidateName: string;
    email: string;
    resumeUrl: string;
    status: 'New' | 'Reviewing' | 'Shortlisted' | 'Rejected' | 'Hired';
    appliedAt: string;
}

export interface Job {
    id: string;
    tenantId: string;
    title: string;
    department: string;
    type: EmploymentTypeEnum;
    location: string;
    /** Cached count for list display */
    applicants: number;
    status: 'Published' | 'Closed' | 'Draft';
    postedAt: string;
    description: string;
    deadline: string;
    applicationList?: Application[];
}
