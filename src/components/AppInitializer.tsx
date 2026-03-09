import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useEmployeeStore } from '../stores/useEmployeeStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { usePayrollStore } from '../stores/usePayrollStore';
import { useDepartmentStore } from '../stores/useDepartmentStore';
import { usePerformanceStore } from '../stores/usePerformanceStore';
import { useLeaveStore } from '../stores/useLeaveStore';

export const AppInitializer: React.FC = () => {
    const hasInit = useRef(false);
    const initialize = useAuthStore((s) => s.initialize);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        if (hasInit.current) return;
        hasInit.current = true;
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let stopReminders: (() => void) | undefined;
        const loadData = async () => {
            await Promise.allSettled([
                useEmployeeStore.getState().fetchEmployees(),
                usePayrollStore.getState().fetchPayrollStatus(),
                useDepartmentStore.getState().fetchDepartments(),
                usePerformanceStore.getState().fetchReviewCycles(),
                useLeaveStore.getState().fetchLeaveRequests(),
            ]);
            stopReminders = useLeaveStore.getState().startReminderEngine();
        };
        loadData();
        return () => { if (stopReminders) stopReminders(); };
    }, [isAuthenticated]);

    return null;
};
