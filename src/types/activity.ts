// =============================================================================
// ACTIVITY LOGS
// =============================================================================

/**
 * A single audit trail entry recording an admin action in the system.
 */
export interface ActivityLog {
    id: string;
    /** Display label for the actor (e.g. email or name) */
    user: string;
    actorName?: string;
    actorRole?: string;
    userId?: string;
    /** Human-readable description of what was done */
    action: string;
    actionType?: string;
    timestamp: string;
    details?: string;
    /** Role of the actor at the time of the action */
    role: string;
    entityId?: string;
    entityType?: string;
    metadata?: unknown;
    status?: string;
}
