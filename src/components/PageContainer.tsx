import React from 'react';

interface PageContainerProps {
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, children, actions }) => {
    return (
        <div className="p-8 max-w-7xl mx-auto w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            </div>
            <div className="flex-grow flex flex-col min-h-0">
                {children}
            </div>
        </div>
    );
};
