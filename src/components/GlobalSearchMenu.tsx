import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FileText, Globe, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useCMS } from '../context/CMSContext';
import { employees } from '../data/mockData';

// Generate a searchable unified index of routes
const generateSearchIndex = (rolePermissions: any, currentUserRole: string, cmsData: import('../types/cms').CMSData | null) => {
    const index: { id: string; title: string; type: 'Page' | 'Employee' | 'CMS'; path: string; icon: any }[] = [];
    const hasAccess = (module: string) => rolePermissions[currentUserRole]?.includes(module);

    // Core Admin Pages
    if (hasAccess('Dashboard')) index.push({ id: 'page-dashboard', title: 'Dashboard', type: 'Page', path: '/admin/dashboard', icon: <FileText size={16} /> });
    if (hasAccess('Employees')) index.push({ id: 'page-employees', title: 'Employees Directory', type: 'Page', path: '/admin/employees', icon: <User size={16} /> });
    if (hasAccess('Payroll')) index.push({ id: 'page-payroll', title: 'Payroll Manager', type: 'Page', path: '/admin/payroll', icon: <FileText size={16} /> });
    if (hasAccess('Recruitment')) index.push({ id: 'page-recruitment', title: 'Recruitment Settings', type: 'Page', path: '/admin/recruitment', icon: <FileText size={16} /> });
    if (hasAccess('Leave')) index.push({ id: 'page-leave', title: 'Leave Management', type: 'Page', path: '/admin/leave', icon: <FileText size={16} /> });
    if (hasAccess('Performance')) index.push({ id: 'page-performance', title: 'Performance Reviews', type: 'Page', path: '/admin/performance', icon: <FileText size={16} /> });
    if (hasAccess('Compliance')) index.push({ id: 'page-compliance', title: 'Risk & Compliance', type: 'Page', path: '/admin/compliance', icon: <FileText size={16} /> });

    // CMS Pages mapped from Context
    if (hasAccess('Website CMS') && cmsData) {
        // Base structures
        index.push({ id: 'cms-global-nav', title: 'Global Navigation (CMS)', type: 'CMS', path: '/admin/cms?page=navData', icon: <Globe size={16} /> });
        index.push({ id: 'cms-global-seo', title: 'Global SEO/MetaData (CMS)', type: 'CMS', path: '/admin/cms?page=metaData', icon: <Globe size={16} /> });
        index.push({ id: 'cms-footer', title: 'Footer Layout (CMS)', type: 'CMS', path: '/admin/cms?page=footerNavData', icon: <Globe size={16} /> });
        index.push({ id: 'cms-contact', title: 'Contact Us Card (CMS)', type: 'CMS', path: '/admin/cms?page=contactUsCardData', icon: <Globe size={16} /> });

        // Dynamic pages from backend schema
        if (cmsData.pages) {
            Object.keys(cmsData.pages).forEach(pageKey => {
                index.push({
                    id: `cms-page-${pageKey}`,
                    title: `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} Page Editor`,
                    type: 'CMS',
                    path: `/admin/cms?page=${pageKey}`,
                    icon: <Globe size={16} />
                });
            });
        }
    }

    // Employees mapped from MockData
    if (hasAccess('Employees')) {
        employees.forEach(emp => {
            index.push({
                id: `emp-${emp.id}`,
                title: `${emp.name} - ${emp.department}`,
                type: 'Employee',
                path: '/admin/employees', // Optionally passing ?search=... later
                icon: <User size={16} />
            });
        });
    }

    return index;
};

export const GlobalSearchMenu: React.FC = () => {
    const { rolePermissions, currentUserRole } = useAdmin();
    const { cmsContent } = useCMS();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);


    // Load searchable items securely based on Role
    const searchIndex = React.useMemo(() => generateSearchIndex(rolePermissions, currentUserRole, cmsContent), [rolePermissions, currentUserRole, cmsContent]);

    // Keyboard Shortcuts (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(open => !open);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus immediately when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setSearchTerm(''); // Clear on close
        }
    }, [isOpen]);

    // Compute Results
    const results = searchIndex.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8); // Max 8 results

    return (
        <div className="relative w-96 hidden md:block">
            {/* Search Input Fake Button/Trigger */}
            <div
                onClick={() => setIsOpen(true)}
                className="w-full pl-10 pr-14 py-2 border border-slate-200 rounded-lg bg-white hover:border-brand-300 hover:ring-2 hover:ring-brand-50 cursor-text transition-all text-sm text-slate-400 flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <span>Search anywhere...</span>
                </div>
            </div>

            {/* Dropdown Modal overlay */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-0 left-0 w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Interactive Real Input */}
                        <div className="flex items-center p-4 border-b border-slate-100 bg-slate-50">
                            <Search className="text-brand-500 mr-3" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-grow bg-transparent outline-none text-slate-800 font-medium placeholder:font-normal placeholder:text-slate-400"
                                placeholder="Search employees, payroll, or pages..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Search Feedback / List */}
                        <div className="max-h-[360px] overflow-y-auto custom-scrollbar p-2">
                            {searchTerm === '' ? (
                                <div className="p-6 text-center text-slate-400 text-sm">
                                    Start typing to find what you're looking for...
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-sm">
                                    No results found for "<span className="font-bold">{searchTerm}</span>".
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Results</div>
                                    {results.map((res) => (
                                        <button
                                            key={res.id}
                                            onClick={() => {
                                                navigate(res.path);
                                                setIsOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-brand-50 group transition-colors text-left"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                                    {res.icon}
                                                </div>
                                                <div className="truncate">
                                                    <div className="font-medium text-slate-800 text-sm truncate">{res.title}</div>
                                                    <div className="text-xs text-slate-400 font-mono truncate">{res.path}</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-100 rounded-full group-hover:bg-brand-100 group-hover:text-brand-600 border border-slate-200 group-hover:border-brand-200 transition-colors">
                                                {res.type}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
