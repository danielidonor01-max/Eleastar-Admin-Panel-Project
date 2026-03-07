// =============================================================================
// DASHBOARD — Widget Configuration
// =============================================================================

import type { ReactNode } from 'react';

export type DashboardRoleLevel = 'summary' | 'detailed';
export type DashboardWidgetType = 'card' | 'widget';

export interface DashboardWidgetConfig {
    id: string;
    title: string;
    component: () => ReactNode;
    supportedRoles: string[];
    level: DashboardRoleLevel;
    type: DashboardWidgetType;
}

/** Maps role names to the widget IDs they should see */
export type RoleWidgetMapping = Record<string, string[]>;

export interface DashboardTab {
    id: string;
    label: string;
    roleContext: string;
}
