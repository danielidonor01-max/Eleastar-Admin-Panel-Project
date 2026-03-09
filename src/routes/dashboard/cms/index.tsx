import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import type { CMSModule } from '@/types';
import PagesTab from './$pagesList';
import ApiKeysTab from './tabs/ActiveKeys';
import MenuBuilderTab from './tabs/MenuBuilderTab';

import SettingsTab from './tabs/SettingsTab';
import { useCMSStore } from '@/stores/useCMSStore';

export const CMSPage = () => {

    const { fetchCMSData , pagesList} = useCMSStore();
    const location = useLocation();
    const [activeModule, setActiveModule] = useState<CMSModule>('pages');



    useEffect(() => {
        fetchCMSData();
    }, [fetchCMSData]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const mod = params.get('module') as CMSModule | null;
        if (mod && ['pages', 'menus', 'apikeys', 'settings', 'media'].includes(mod)) {
            setTimeout(() => {
                setActiveModule(mod);
            }, 0);
        }
    }, [location.search]);

    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page') || 'GlobalSEO';

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-hidden bg-slate-50/50">
                {activeModule === 'pages' && <PagesTab />}
                {activeModule === 'menus' && <MenuBuilderTab />}
                {activeModule === 'apikeys' && <ApiKeysTab />}
                {activeModule === 'settings' && <SettingsTab section={pageParam} />}
            </div>
        </div>
    );
};
