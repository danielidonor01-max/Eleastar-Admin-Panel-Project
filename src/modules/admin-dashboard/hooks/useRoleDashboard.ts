import { useMemo } from 'react';
import { roleWidgetConfig, superAdminTabs } from '../config/dashboard.roles';
import { widgets } from '../config/dashboard.widgets';
import type { DashboardWidgetConfig } from '../types';

export const useRoleDashboard = (role: string, activeTabId?: string) => {
    return useMemo(() => {
        const isSuperAdmin = role === 'SUPER_ADMIN';

        // Determine effective role for widget resolution
        let effectiveRole = role;
        if (isSuperAdmin && activeTabId && activeTabId !== 'overview') {
            const tab = superAdminTabs.find(t => t.id === activeTabId);
            if (tab) {
                effectiveRole = tab.roleContext;
            }
        }

        const allowedWidgetIds = roleWidgetConfig[effectiveRole] || [];

        // 2. Resolve widget configurations from the registry
        const resolvedWidgets: DashboardWidgetConfig[] = allowedWidgetIds
            .map(id => widgets[id])
            .filter((w): w is DashboardWidgetConfig => Boolean(w));

        // Summary mode constraints if viewing another role's tab
        const enforceSummaryMode = isSuperAdmin && effectiveRole !== 'SUPER_ADMIN';

        // Separate by level/type
        const cardWidgets = resolvedWidgets.filter(w => w.type === 'card');
        const standardWidgets = resolvedWidgets.filter(w =>
            w.type === 'widget' && (!enforceSummaryMode || w.level === 'summary')
        );

        return {
            allWidgets: resolvedWidgets,
            cardWidgets,
            standardWidgets,
            hasWidgets: resolvedWidgets.length > 0,
            tabs: isSuperAdmin ? superAdminTabs : []
        };
    }, [role, activeTabId]);
};
