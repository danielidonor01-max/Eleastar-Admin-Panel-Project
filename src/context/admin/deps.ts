import type { Employee, PayrollCycle, BonusRequest, PromotionRequest } from '../../data/mockData';
import type { ActivityLog } from './types';

/**
 * Shared dependencies for admin action modules.
 * Used by action factories to access state and cross-cutting concerns.
 */
export interface AdminDeps {
    employees: Employee[];
    payrollStatus: PayrollCycle;
    activityLogs: ActivityLog[];
    bonusRequests: BonusRequest[];
    promotionRequests: PromotionRequest[];
    currentUserId: string | null;
    logAction: (action: string, details?: string, ...args: unknown[]) => void;
}
