import React, { type ReactNode } from 'react';

interface DashboardWidgetProps {
    id: string;
    type: 'card' | 'widget';
    children: ReactNode;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ id, type, children }) => {
    return (
        <div className={`widget-container ${type === 'card' ? 'col-span-1' : ''}`} data-widget-id={id}>
            {children}
        </div>
    );
};
